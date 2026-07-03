"""
LongCat Video Studio — GPU worker.

FastAPI server that runs on a Vast.ai GPU instance and executes
LongCat-Video (https://github.com/meituan-longcat/LongCat-Video)
generation jobs: text-to-video, image-to-video and long video
(base segment + video-continuation loop + optional 720p refinement).

Environment variables:
  LONGCAT_REPO     Path to the cloned LongCat-Video repo (default /workspace/LongCat-Video)
  CHECKPOINT_DIR   Path to downloaded weights (default /workspace/weights/LongCat-Video)
  WORKER_TOKEN     Optional bearer token required on every request
  PORT             HTTP port (default 8000)
  OUTPUT_DIR       Where generated .mp4 files are written (default ./outputs)

Endpoints:
  GET    /health            -> gpu / model / queue status (no auth)
  POST   /jobs              -> create job
  GET    /jobs              -> list jobs
  GET    /jobs/{id}         -> job status
  GET    /jobs/{id}/video   -> stream resulting mp4 (supports Range)
  DELETE /jobs/{id}         -> cancel queued job / delete finished job
"""

import base64
import io
import json
import os
import subprocess
import sys
import threading
import time
import traceback
import uuid
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

LONGCAT_REPO = os.environ.get("LONGCAT_REPO", "/workspace/LongCat-Video")
CHECKPOINT_DIR = os.environ.get("CHECKPOINT_DIR", "/workspace/weights/LongCat-Video")
WORKER_TOKEN = os.environ.get("WORKER_TOKEN", "")
OUTPUT_DIR = Path(os.environ.get("OUTPUT_DIR", "outputs")).absolute()
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", "uploads")).absolute()
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

if LONGCAT_REPO not in sys.path:
    sys.path.insert(0, LONGCAT_REPO)

DEFAULT_NEGATIVE_PROMPT = (
    "Bright tones, overexposed, static, blurred details, subtitles, style, works, "
    "paintings, images, static, overall gray, worst quality, low quality, JPEG "
    "compression residue, ugly, incomplete, extra fingers, poorly drawn hands, "
    "poorly drawn faces, deformed, disfigured, misshapen limbs, fused fingers, "
    "still picture, messy background, three legs, many people in the background, "
    "walking backwards"
)

# ---------------------------------------------------------------------------
# Job model
# ---------------------------------------------------------------------------


class JobParams(BaseModel):
    type: str = Field(..., description="t2v | i2v | long")
    prompt: str = ""
    negative_prompt: str = DEFAULT_NEGATIVE_PROMPT
    # base generation
    num_frames: int = 93
    num_inference_steps: int = 50
    guidance_scale: float = 4.0
    seed: Optional[int] = None
    # long video
    num_segments: int = 0          # extra continuation segments after the base clip
    num_cond_frames: int = 13      # conditioning frames carried between segments
    segment_prompts: Optional[list[str]] = None  # optional per-segment prompts
    # refinement (coarse-to-fine 480p -> 720p)
    refine: str = "none"           # none | spatial | spatiotemporal
    refine_steps: int = 50
    # distillation (16-step LoRA) — used when the LoRA weights are available
    use_distill: bool = False
    # i2v / long-from-image
    image_b64: Optional[str] = None


class Job:
    def __init__(self, params: JobParams):
        self.id = uuid.uuid4().hex[:12]
        self.params = params
        self.status = "queued"          # queued | running | completed | failed | canceled
        self.stage = "Na fila"
        self.progress = 0.0
        self.error: Optional[str] = None
        self.created_at = time.time()
        self.started_at: Optional[float] = None
        self.finished_at: Optional[float] = None
        self.output_path: Optional[Path] = None
        self.fps = 15
        self.total_frames = 0

    def to_dict(self):
        d = {
            "id": self.id,
            "type": self.params.type,
            "prompt": self.params.prompt,
            "status": self.status,
            "stage": self.stage,
            "progress": round(self.progress, 4),
            "error": self.error,
            "created_at": self.created_at,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "fps": self.fps,
            "total_frames": self.total_frames,
            "has_video": bool(self.output_path and self.output_path.exists()),
            "params": {
                "num_frames": self.params.num_frames,
                "num_segments": self.params.num_segments,
                "refine": self.params.refine,
                "use_distill": self.params.use_distill,
                "num_inference_steps": self.params.num_inference_steps,
                "guidance_scale": self.params.guidance_scale,
                "seed": self.params.seed,
            },
        }
        return d


JOBS: dict[str, Job] = {}
JOB_ORDER: list[str] = []
JOB_QUEUE: list[str] = []
QUEUE_LOCK = threading.Lock()
QUEUE_EVENT = threading.Event()

# ---------------------------------------------------------------------------
# Model runtime (lazy-loaded once, single GPU)
# ---------------------------------------------------------------------------


class ModelRuntime:
    def __init__(self):
        self.pipe = None
        self.lock = threading.Lock()
        self.loading = False
        self.load_error: Optional[str] = None
        self.distill_available = False

    def ensure_loaded(self, report=lambda msg: None):
        with self.lock:
            if self.pipe is not None:
                return self.pipe
            self.loading = True
            try:
                report("Carregando modelo (pode levar alguns minutos)...")
                import torch
                from transformers import AutoTokenizer, UMT5EncoderModel

                from longcat_video.pipeline_longcat_video import LongCatVideoPipeline
                from longcat_video.modules.scheduling_flow_match_euler_discrete import (
                    FlowMatchEulerDiscreteScheduler,
                )
                from longcat_video.modules.autoencoder_kl_wan import AutoencoderKLWan
                from longcat_video.modules.longcat_video_dit import (
                    LongCatVideoTransformer3DModel,
                )

                ckpt = CHECKPOINT_DIR
                tokenizer = AutoTokenizer.from_pretrained(ckpt, subfolder="tokenizer")
                text_encoder = UMT5EncoderModel.from_pretrained(
                    ckpt, subfolder="text_encoder", torch_dtype=torch.bfloat16
                )
                vae = AutoencoderKLWan.from_pretrained(
                    ckpt, subfolder="vae", torch_dtype=torch.bfloat16
                )
                scheduler = FlowMatchEulerDiscreteScheduler.from_pretrained(
                    ckpt, subfolder="scheduler"
                )
                dit = LongCatVideoTransformer3DModel.from_pretrained(
                    ckpt, subfolder="dit", torch_dtype=torch.bfloat16
                )
                pipe = LongCatVideoPipeline(
                    tokenizer=tokenizer,
                    text_encoder=text_encoder,
                    vae=vae,
                    scheduler=scheduler,
                    dit=dit,
                )
                pipe.to("cuda")

                # 16-step CFG-distill LoRA is optional; enable when shipped with the
                # checkpoint (folder name may vary between releases).
                lora_path = self._find_distill_lora(ckpt)
                if lora_path:
                    try:
                        pipe.dit.load_lora(lora_path, "cfg_step_lora")
                        self.distill_available = True
                        print(f"[worker] distill LoRA loaded from {lora_path}")
                    except Exception as exc:  # pragma: no cover
                        print(f"[worker] failed to load distill LoRA: {exc}")

                self.pipe = pipe
                self.load_error = None
                report("Modelo carregado.")
                return pipe
            except Exception:
                self.load_error = traceback.format_exc()
                raise
            finally:
                self.loading = False

    @staticmethod
    def _find_distill_lora(ckpt: str) -> Optional[str]:
        root = Path(ckpt)
        candidates = []
        for pattern in ("*cfg*lora*", "*lora*cfg*", "*distill*"):
            candidates += [p for p in root.glob(pattern) if p.is_dir() or p.suffix in (".safetensors", ".pt", ".bin")]
        return str(candidates[0]) if candidates else None

    def set_distill(self, enabled: bool):
        if self.pipe is None or not self.distill_available:
            return False
        try:
            if enabled:
                self.pipe.dit.enable_loras(["cfg_step_lora"])
            else:
                self.pipe.dit.disable_loras(["cfg_step_lora"])
            return True
        except Exception as exc:
            print(f"[worker] toggling distill LoRA failed: {exc}")
            return False


RUNTIME = ModelRuntime()

# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------


def _decode_image(image_b64: str):
    from PIL import Image

    raw = image_b64.split(",", 1)[1] if image_b64.startswith("data:") else image_b64
    return Image.open(io.BytesIO(base64.b64decode(raw))).convert("RGB")


def _save_video(frames, path: Path, fps: int):
    """frames: list/tensor of HWC uint8 frames -> mp4 (libx264, crf 18)."""
    import torch
    from torchvision.io import write_video

    if isinstance(frames, list):
        frames = torch.stack([f if torch.is_tensor(f) else torch.as_tensor(f) for f in frames])
    frames = frames.cpu()
    if frames.dtype != torch.uint8:
        frames = frames.clamp(0, 255).to(torch.uint8)
    write_video(str(path), frames, fps=fps, video_codec="libx264", options={"crf": "18"})


def run_job(job: Job):
    import torch

    p = job.params

    def report(stage: str, progress: float):
        job.stage = stage
        job.progress = max(job.progress, min(progress, 0.999))
        print(f"[job {job.id}] {progress:.0%} {stage}")

    pipe = RUNTIME.ensure_loaded(lambda msg: report(msg, 0.01))

    generator = None
    if p.seed is not None:
        generator = torch.Generator(device="cuda").manual_seed(int(p.seed))

    use_distill = bool(p.use_distill) and RUNTIME.set_distill(True)
    if p.use_distill and not use_distill:
        print(f"[job {job.id}] distill requested but LoRA unavailable — using full steps")
    if not use_distill:
        RUNTIME.set_distill(False)
    steps = 16 if use_distill else p.num_inference_steps
    guidance = 1.0 if use_distill else p.guidance_scale

    # Work planning: 1 unit for the base clip, 1 per continuation segment,
    # 1 per refinement window (~ same count as generation units).
    gen_units = 1 + max(p.num_segments, 0)
    refine_units = gen_units if p.refine != "none" else 0
    total_units = gen_units + refine_units
    done_units = 0

    def unit_done(stage: str):
        nonlocal done_units
        done_units += 1
        report(stage, done_units / total_units)

    common = dict(
        negative_prompt=p.negative_prompt,
        resolution="480p",
        num_frames=p.num_frames,
        num_inference_steps=steps,
        guidance_scale=guidance,
        generator=generator,
    )
    if use_distill:
        common["use_distill"] = True

    # ---- base clip -------------------------------------------------------
    report("Gerando clipe base (480p)...", 0.02)
    if p.type == "i2v" or (p.type == "long" and p.image_b64):
        image = _decode_image(p.image_b64)
        frames = pipe.generate_i2v(image=image, prompt=p.prompt, **common)[0]
    else:
        frames = pipe.generate_t2v(prompt=p.prompt, **common)[0]
    all_frames = list(frames)
    unit_done("Clipe base concluído")

    # ---- continuation loop (long video) ----------------------------------
    for seg in range(max(p.num_segments, 0)):
        seg_prompt = p.prompt
        if p.segment_prompts and seg < len(p.segment_prompts) and p.segment_prompts[seg].strip():
            seg_prompt = p.segment_prompts[seg]
        report(f"Gerando segmento {seg + 1}/{p.num_segments}...", done_units / total_units)
        cond = all_frames[-p.num_cond_frames:]
        out = pipe.generate_vc(
            video=cond,
            prompt=seg_prompt,
            num_cond_frames=p.num_cond_frames,
            use_kv_cache=True,
            offload_kv_cache=False,
            **common,
        )[0]
        all_frames.extend(list(out)[p.num_cond_frames:])
        unit_done(f"Segmento {seg + 1}/{p.num_segments} concluído")

    fps = 15

    # ---- coarse-to-fine refinement (720p) ---------------------------------
    if p.refine != "none":
        RUNTIME.set_distill(False)
        spatial_only = p.refine == "spatial"
        report("Refinando para 720p...", done_units / total_units)
        refined: list = []
        window = p.num_frames
        cond_frames = p.num_cond_frames
        start = 0
        first = True
        while start < len(all_frames):
            chunk = all_frames[start : start + window]
            if len(chunk) < cond_frames + 1 and not first:
                break
            kwargs = dict(
                prompt=p.prompt,
                stage1_video=chunk,
                num_inference_steps=p.refine_steps,
                generator=generator,
                spatial_refine_only=spatial_only,
            )
            if not first and refined:
                kwargs["video"] = refined[-cond_frames:]
                kwargs["num_cond_frames"] = cond_frames
            out = pipe.generate_refine(**kwargs)[0]
            out = list(out)
            refined.extend(out if first else out[cond_frames:])
            start += window if first else window - cond_frames
            first = False
            unit_done("Janela de refinamento concluída")
        all_frames = refined
        if not spatial_only:
            fps = 30

    # ---- save --------------------------------------------------------------
    report("Codificando vídeo...", 0.99)
    out_path = OUTPUT_DIR / f"{job.id}.mp4"
    _save_video(all_frames, out_path, fps)
    job.output_path = out_path
    job.fps = fps
    job.total_frames = len(all_frames)


def worker_loop():
    while True:
        QUEUE_EVENT.wait()
        with QUEUE_LOCK:
            if not JOB_QUEUE:
                QUEUE_EVENT.clear()
                continue
            job_id = JOB_QUEUE.pop(0)
        job = JOBS.get(job_id)
        if job is None or job.status == "canceled":
            continue
        job.status = "running"
        job.started_at = time.time()
        try:
            run_job(job)
            job.status = "completed"
            job.stage = "Concluído"
            job.progress = 1.0
        except Exception:
            job.status = "failed"
            job.stage = "Falhou"
            job.error = traceback.format_exc()[-4000:]
            print(f"[job {job.id}] FAILED\n{job.error}")
        finally:
            job.finished_at = time.time()
            import torch

            torch.cuda.empty_cache()


threading.Thread(target=worker_loop, daemon=True).start()

# ---------------------------------------------------------------------------
# API
# ---------------------------------------------------------------------------

app = FastAPI(title="LongCat Video Studio Worker", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def check_auth(request: Request):
    if not WORKER_TOKEN:
        return
    auth = request.headers.get("authorization", "")
    if auth != f"Bearer {WORKER_TOKEN}":
        raise HTTPException(status_code=401, detail="invalid worker token")


def gpu_info():
    try:
        out = subprocess.check_output(
            [
                "nvidia-smi",
                "--query-gpu=name,memory.total,memory.used,utilization.gpu,temperature.gpu",
                "--format=csv,noheader,nounits",
            ],
            text=True,
            timeout=10,
        )
        gpus = []
        for line in out.strip().splitlines():
            name, mem_total, mem_used, util, temp = [x.strip() for x in line.split(",")]
            gpus.append(
                {
                    "name": name,
                    "memory_total_mb": int(float(mem_total)),
                    "memory_used_mb": int(float(mem_used)),
                    "utilization_pct": int(float(util)),
                    "temperature_c": int(float(temp)),
                }
            )
        return gpus
    except Exception:
        return []


@app.get("/health")
def health():
    running = [j for j in JOBS.values() if j.status == "running"]
    return {
        "ok": True,
        "service": "longcat-video-worker",
        "model_loaded": RUNTIME.pipe is not None,
        "model_loading": RUNTIME.loading,
        "load_error": (RUNTIME.load_error or "")[-1000:] or None,
        "distill_available": RUNTIME.distill_available,
        "checkpoint_dir": CHECKPOINT_DIR,
        "queue_size": len(JOB_QUEUE),
        "running_job": running[0].id if running else None,
        "jobs_total": len(JOBS),
        "gpus": gpu_info(),
    }


@app.post("/jobs", dependencies=[Depends(check_auth)])
def create_job(params: JobParams):
    if params.type not in ("t2v", "i2v", "long"):
        raise HTTPException(400, "type must be t2v, i2v or long")
    if params.type == "i2v" and not params.image_b64:
        raise HTTPException(400, "i2v requires image_b64")
    if not params.prompt.strip() and params.type != "i2v":
        raise HTTPException(400, "prompt is required")
    if params.num_frames < 16 or params.num_frames > 200:
        raise HTTPException(400, "num_frames must be between 16 and 200")
    if params.num_segments < 0 or params.num_segments > 60:
        raise HTTPException(400, "num_segments must be between 0 and 60")

    job = Job(params)
    JOBS[job.id] = job
    JOB_ORDER.append(job.id)
    with QUEUE_LOCK:
        JOB_QUEUE.append(job.id)
        QUEUE_EVENT.set()
    return job.to_dict()


@app.get("/jobs", dependencies=[Depends(check_auth)])
def list_jobs():
    return {"jobs": [JOBS[jid].to_dict() for jid in reversed(JOB_ORDER)]}


@app.get("/jobs/{job_id}", dependencies=[Depends(check_auth)])
def get_job(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    return job.to_dict()


@app.delete("/jobs/{job_id}", dependencies=[Depends(check_auth)])
def delete_job(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if job.status == "running":
        raise HTTPException(409, "cannot cancel a running job")
    if job.status == "queued":
        with QUEUE_LOCK:
            if job_id in JOB_QUEUE:
                JOB_QUEUE.remove(job_id)
        job.status = "canceled"
        job.stage = "Cancelado"
        return job.to_dict()
    if job.output_path and job.output_path.exists():
        job.output_path.unlink()
    JOBS.pop(job_id, None)
    if job_id in JOB_ORDER:
        JOB_ORDER.remove(job_id)
    return {"deleted": job_id}


@app.get("/jobs/{job_id}/video", dependencies=[Depends(check_auth)])
def get_video(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "job not found")
    if not job.output_path or not job.output_path.exists():
        raise HTTPException(404, "video not ready")
    return FileResponse(
        job.output_path,
        media_type="video/mp4",
        filename=f"longcat_{job.id}.mp4",
    )


@app.get("/")
def root():
    return {"service": "longcat-video-worker", "docs": "/docs", "health": "/health"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))
