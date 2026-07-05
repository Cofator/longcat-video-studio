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
import shutil
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

# Reduz fragmentação de VRAM (definido antes de o torch inicializar o CUDA).
os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")

LONGCAT_REPO = os.environ.get("LONGCAT_REPO", "/workspace/LongCat-Video")
CHECKPOINT_DIR = os.environ.get("CHECKPOINT_DIR", "/workspace/weights/LongCat-Video")
# Avatar (audio-driven) — pesos baixados sob demanda no primeiro job de avatar.
AVATAR_CHECKPOINT_DIR = os.environ.get(
    "AVATAR_CHECKPOINT_DIR", "/workspace/weights/LongCat-Video-Avatar-1.5"
)
AVATAR_MODEL_TYPE = os.environ.get("AVATAR_MODEL_TYPE", "avatar-v1.5")
AVATAR_REPO_ID = os.environ.get("AVATAR_REPO_ID", "meituan-longcat/LongCat-Video-Avatar-1.5")
# LTX-2.3 (Lightricks) — segundo modelo, opcional. Pesos baixados sob demanda
# no primeiro job com model="ltx2.3" (ver vast_onstart.sh).
LTX_REPO = os.environ.get("LTX_REPO", "/workspace/LTX-2")
LTX_WEIGHTS_DIR = os.environ.get("LTX_WEIGHTS_DIR", "/workspace/weights/LTX-2.3")
LTX_CHECKPOINT = os.environ.get(
    "LTX_CHECKPOINT", str(Path(LTX_WEIGHTS_DIR) / "ltx-2.3-22b-distilled-fp8.safetensors")
)
LTX_UPSAMPLER = os.environ.get(
    "LTX_UPSAMPLER", str(Path(LTX_WEIGHTS_DIR) / "ltx-2.3-spatial-upscaler-x2-1.1.safetensors")
)
LTX_GEMMA_DIR = os.environ.get("LTX_GEMMA_DIR", str(Path(LTX_WEIGHTS_DIR) / "gemma-3-12b-it"))
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


class AudioInput(BaseModel):
    name: str = "person1"           # rótulo do falante (person1, person2, ...)
    data_b64: str                   # wav/mp3 em base64 (com ou sem prefixo data:)
    bbox: Optional[list[int]] = None  # [y_min, x_min, y_max, x_max] — só multi-áudio


class JobParams(BaseModel):
    type: str = Field(..., description="t2v | i2v | long | avatar-single | avatar-multi")
    model: str = Field("longcat", description="longcat | ltx2.3 — motor de geração")
    prompt: str = ""
    negative_prompt: str = DEFAULT_NEGATIVE_PROMPT
    # base generation
    num_frames: int = 93
    num_inference_steps: int = 40
    guidance_scale: float = 4.0
    seed: Optional[int] = None
    # long video
    num_segments: int = 0          # extra continuation segments after the base clip
    num_cond_frames: int = 13      # conditioning frames carried between segments
    segment_prompts: Optional[list[str]] = None  # optional per-segment prompts
    # refinement (coarse-to-fine 480p -> 720p)
    refine: str = "none"           # none | spatial | spatiotemporal
    refine_steps: int = 50
    refine_window: int = 45        # frames por janela de refino (menor = menos VRAM em 720p)
    # distillation (16-step LoRA) — used when the LoRA weights are available
    use_distill: bool = False
    # i2v / long-from-image
    image_b64: Optional[str] = None
    # ---- avatar (audio-driven) -------------------------------------------
    audios: Optional[list[AudioInput]] = None
    stage_1: str = "ai2v"          # ai2v (a partir da imagem) | at2v (do zero) — single
    resolution: str = "480p"       # 480p | 720p
    ref_img_index: int = 10
    mask_frame_range: int = 3
    text_guidance_scale: float = 4.0
    audio_guidance_scale: float = 4.0
    use_int8: bool = True          # reduz VRAM (recomendado em GPUs de 48 GB)
    audio_type: str = "para"       # multi: para (paralelo) | add (sequencial)


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
                "resolution": self.params.resolution,
                "stage_1": self.params.stage_1,
                "num_speakers": len(self.params.audios or []),
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
                # cp_split_hw=[1,1] = sem context parallelism (1 GPU). Sem esse
                # parâmetro fica None e o forward do DiT quebra ("NoneType is
                # not subscriptable" em self.cp_split_hw[0]).
                dit = LongCatVideoTransformer3DModel.from_pretrained(
                    ckpt, subfolder="dit", cp_split_hw=[1, 1], torch_dtype=torch.bfloat16
                )
                # OFFLOAD do text encoder (UMT5 ~11 GB): numa GPU de 48 GB, o
                # DiT (27 GB) + UMT5 + ativações estouram a VRAM (OOM). O
                # wrapper mantém o encoder na CPU e o move para a GPU apenas
                # durante o encode do prompt (1-2 s por job).
                class _EncoderOnDemand(torch.nn.Module):
                    def __init__(self, enc):
                        super().__init__()
                        self.enc = enc.to("cpu")

                    @property
                    def dtype(self):
                        return self.enc.dtype

                    @property
                    def device(self):
                        return self.enc.device

                    def forward(self, *args, **kwargs):
                        self.enc.to("cuda")
                        try:
                            return self.enc(*args, **kwargs)
                        finally:
                            self.enc.to("cpu")
                            torch.cuda.empty_cache()

                pipe = LongCatVideoPipeline(
                    tokenizer=tokenizer,
                    text_encoder=_EncoderOnDemand(text_encoder),
                    vae=vae,
                    scheduler=scheduler,
                    dit=dit,
                )
                # NÃO usamos pipe.to("cuda") — ele levaria o text encoder junto.
                # self.device do pipeline já é "cuda"; movemos os demais à mão.
                pipe.vae.to("cuda")
                pipe.dit.to("cuda")
                torch.cuda.empty_cache()

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
        # Caminho oficial no checkpoint HF: lora/cfg_step_lora.safetensors
        explicit = root / "lora" / "cfg_step_lora.safetensors"
        if explicit.exists():
            return str(explicit)
        candidates = []
        for pattern in ("lora/*", "*cfg*lora*", "*lora*cfg*", "*distill*"):
            candidates += [
                p for p in root.glob(pattern)
                if "cfg" in p.name and (p.is_dir() or p.suffix in (".safetensors", ".pt", ".bin"))
            ]
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


class LTXRuntime:
    """Carrega o LTX-2.3 (Lightricks) sob demanda — segundo motor, opcional.

    Usa o checkpoint fp8 destilado (menos VRAM, poucos passos) via o pacote
    de baixo nível `ltx_pipelines` (o mesmo usado no repo oficial
    github.com/Lightricks/LTX-2). Como este modelo é muito recente, os nomes
    de parâmetro foram tirados do README oficial do pacote — o primeiro job
    real deve ser tratado como validação, igual ocorreu com o LongCat.
    """

    def __init__(self):
        self.pipe = None
        self.lock = threading.Lock()
        self.loading = False
        self.load_error: Optional[str] = None

    def ensure_loaded(self, report=lambda msg: None):
        with self.lock:
            if self.pipe is not None:
                return self.pipe
            self.loading = True
            self.load_error = None
            try:
                report("Carregando LTX-2.3 (pode levar alguns minutos)")
                if LTX_REPO not in sys.path:
                    sys.path.insert(0, LTX_REPO)
                from ltx_pipelines.ti2vid_two_stages import TI2VidTwoStagesPipeline

                self.pipe = TI2VidTwoStagesPipeline(
                    checkpoint_path=LTX_CHECKPOINT,
                    distilled_lora=[],  # checkpoint já é a variante destilada
                    spatial_upsampler_path=LTX_UPSAMPLER,
                    gemma_root=LTX_GEMMA_DIR,
                    loras=[],
                )
                return self.pipe
            except Exception:
                self.load_error = traceback.format_exc()
                raise
            finally:
                self.loading = False


LTX_RUNTIME = LTXRuntime()

# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------


def _decode_image(image_b64: str):
    from PIL import Image

    raw = image_b64.split(",", 1)[1] if image_b64.startswith("data:") else image_b64
    return Image.open(io.BytesIO(base64.b64decode(raw))).convert("RGB")


def _save_video(frames, path: Path, fps: int):
    """frames: list/tensor/np de frames HWC -> mp4 (libx264, crf 18).

    O pipeline retorna float em [0,1] (output_type padrão 'np'); é preciso
    multiplicar por 255 antes de converter para uint8 — senão o vídeo fica preto.
    """
    import numpy as np
    import torch
    from torchvision.io import write_video

    if isinstance(frames, list):
        frames = np.stack([np.asarray(f) for f in frames])
    if not torch.is_tensor(frames):
        frames = torch.from_numpy(np.asarray(frames))
    frames = frames.detach().cpu()
    if frames.dtype != torch.uint8:
        frames = frames.float()
        # se está normalizado em [0,1], reescala para [0,255]
        if float(frames.max()) <= 1.5:
            frames = frames * 255.0
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

    # Args comuns SEM resolução: generate_t2v usa height/width; i2v e vc usam
    # resolution="480p". (generate_t2v não aceita o kwarg `resolution`.)
    common = dict(
        negative_prompt=p.negative_prompt,
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
        frames = pipe.generate_i2v(image=image, prompt=p.prompt, resolution="480p", **common)[0]
    else:
        frames = pipe.generate_t2v(prompt=p.prompt, height=480, width=832, **common)[0]
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
            resolution="480p",
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
        import numpy as np
        from PIL import Image as _Image

        # generate_refine espera stage1_video/video como LISTA de PIL Images
        # (uint8), não frames numpy float — igual ao demo oficial.
        def _to_pil(frs):
            pil = []
            for f in frs:
                a = np.asarray(f)
                if a.dtype != np.uint8:
                    a = a.astype(np.float32)
                    if a.max() <= 1.5:
                        a = a * 255.0
                    a = np.clip(a, 0, 255).astype(np.uint8)
                pil.append(_Image.fromarray(a))
            return pil

        RUNTIME.set_distill(False)
        spatial_only = p.refine == "spatial"
        base_frames = all_frames  # guarda o 480p como fallback se o refino estourar
        report("Refinando para 720p...", done_units / total_units)
        # Janela temporal menor (múltiplo de 4 + 1) para caber na VRAM em 720p.
        window = max(9, min(p.refine_window, p.num_frames))
        if (window - 1) % 4 != 0:
            window = ((window - 1) // 4) * 4 + 1
        cond_frames = p.num_cond_frames
        try:
            refined: list = []
            start = 0
            first = True
            while start < len(base_frames):
                chunk = base_frames[start : start + window]
                if len(chunk) < cond_frames + 1 and not first:
                    break
                kwargs = dict(
                    prompt=p.prompt,
                    stage1_video=_to_pil(chunk),
                    num_inference_steps=p.refine_steps,
                    generator=generator,
                    spatial_refine_only=spatial_only,
                )
                if not first and refined:
                    kwargs["video"] = _to_pil(refined[-cond_frames:])
                    kwargs["num_cond_frames"] = cond_frames
                out = list(pipe.generate_refine(**kwargs)[0])
                refined.extend(out if first else out[cond_frames:])
                start += window if first else window - cond_frames
                first = False
                import torch as _t
                _t.cuda.empty_cache()
                unit_done("Janela de refinamento concluída")
            all_frames = refined
            if not spatial_only:
                fps = 30
        except Exception as exc:  # OOM ou outro — entrega o 480p em vez de falhar
            import torch as _t
            _t.cuda.empty_cache()
            print(f"[job {job.id}] refino falhou ({exc}); salvando o clipe base 480p")
            job.stage = "Refino indisponível (VRAM) — entregue em 480p"
            all_frames = base_frames
            fps = 15

    # ---- save --------------------------------------------------------------
    report("Codificando vídeo...", 0.99)
    out_path = OUTPUT_DIR / f"{job.id}.mp4"
    _save_video(all_frames, out_path, fps)
    job.output_path = out_path
    job.fps = fps
    job.total_frames = len(all_frames)


def run_ltx_job(job: Job):
    """t2v/i2v com o LTX-2.3 (áudio+vídeo sincronizados, até 4K/50fps no
    checkpoint oficial — aqui usamos resolução/fps conservadores por padrão
    para caber em uma única GPU)."""
    import torch

    p = job.params

    def report(stage: str, progress: float):
        job.stage = stage
        job.progress = max(job.progress, min(progress, 0.999))
        print(f"[job {job.id}] {progress:.0%} {stage}")

    pipe = LTX_RUNTIME.ensure_loaded(lambda msg: report(msg, 0.01))

    from ltx_core.components.guiders import MultiModalGuiderParams
    from ltx_core.model.video_vae import TilingConfig

    # num_frames no formato 8k+1 exigido pelo modelo.
    k = max(1, round((p.num_frames - 1) / 8))
    num_frames = k * 8 + 1
    frame_rate = 25.0

    video_guider = MultiModalGuiderParams(
        cfg_scale=p.guidance_scale, stg_scale=1.0, rescale_scale=0.7,
        modality_scale=3.0, skip_step=0, stg_blocks=[29],
    )
    audio_guider = MultiModalGuiderParams(
        cfg_scale=max(p.guidance_scale, 7.0), stg_scale=1.0, rescale_scale=0.7,
        modality_scale=3.0, skip_step=0, stg_blocks=[29],
    )

    generator_seed = int(p.seed) if p.seed is not None else int(uuid.uuid4().int % (2**31))

    kwargs = dict(
        prompt=p.prompt,
        negative_prompt=p.negative_prompt,
        seed=generator_seed,
        height=512,
        width=768,
        num_frames=num_frames,
        frame_rate=frame_rate,
        num_inference_steps=p.num_inference_steps,
        video_guider_params=video_guider,
        audio_guider_params=audio_guider,
        tiling_config=TilingConfig.default(),
    )

    image_path = None
    if p.image_b64:
        from ltx_pipelines.utils.args import ImageConditioningInput

        image = _decode_image(p.image_b64)
        image_path = str(UPLOAD_DIR / f"{job.id}_ref.png")
        image.save(image_path)
        kwargs["images"] = [ImageConditioningInput(image_path, 0, 1.0, num_frames)]

    report("Gerando com LTX-2.3...", 0.05)
    video, audio = pipe(**kwargs)
    report("Codificando vídeo...", 0.95)

    out_path = OUTPUT_DIR / f"{job.id}.mp4"
    _save_video_av(video, audio, out_path, frame_rate)
    job.output_path = out_path
    job.fps = int(frame_rate)
    job.total_frames = num_frames


def _save_video_av(video, audio, path: Path, fps: float):
    """Salva vídeo+áudio (LTX-2.3 gera os dois juntos) em mp4 com AAC."""
    import numpy as np
    import torch
    from torchvision.io import write_video

    if not torch.is_tensor(video):
        video = torch.from_numpy(np.asarray(video))
    video = video.detach().cpu().float()
    if video.max() <= 1.5:
        video = video * 255.0
    video = video.clamp(0, 255).to(torch.uint8)

    audio_array = None
    if audio is not None:
        if not torch.is_tensor(audio):
            audio = torch.from_numpy(np.asarray(audio))
        audio_array = audio.detach().cpu().float()
        if audio_array.dim() == 1:
            audio_array = audio_array.unsqueeze(0)
        write_video(
            str(path), video, fps=fps, video_codec="libx264", options={"crf": "18"},
            audio_array=audio_array, audio_fps=48000, audio_codec="aac",
        )
    else:
        write_video(str(path), video, fps=fps, video_codec="libx264", options={"crf": "18"})


# ---------------------------------------------------------------------------
# Avatar (audio-driven) — roda os scripts oficiais via torchrun
# ---------------------------------------------------------------------------

AVATAR_LOCK = threading.Lock()
_avatar_ready = {"deps": False, "weights": False}


def _run_stream(cmd: list[str], cwd: str, on_line, env=None) -> int:
    """Roda um subprocesso transmitindo stdout linha a linha para on_line()."""
    proc = subprocess.Popen(
        cmd,
        cwd=cwd,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
    )
    assert proc.stdout is not None
    for line in proc.stdout:
        line = line.rstrip()
        if line:
            on_line(line)
    proc.wait()
    return proc.returncode


def ensure_avatar_ready(report):
    """Instala deps de avatar e baixa os pesos v1.5 (uma vez)."""
    with AVATAR_LOCK:
        if not _avatar_ready["deps"]:
            report("Instalando dependências de avatar (librosa, audio-separator)...")
            req = os.path.join(LONGCAT_REPO, "requirements_avatar.txt")
            if os.path.exists(req):
                subprocess.run([sys.executable, "-m", "pip", "install", "-r", req], check=False)
            subprocess.run(
                [sys.executable, "-m", "pip", "install",
                 "librosa", "soundfile", "audio-separator[cpu]", "onnxruntime"],
                check=False,
            )
            _avatar_ready["deps"] = True

        flag = Path(AVATAR_CHECKPOINT_DIR) / ".download_complete"
        if not flag.exists():
            report("Baixando pesos do avatar (LongCat-Video-Avatar-1.5, alguns GB)...")
            rc = _run_stream(
                ["huggingface-cli", "download", AVATAR_REPO_ID,
                 "--local-dir", AVATAR_CHECKPOINT_DIR],
                cwd=LONGCAT_REPO,
                on_line=lambda l: report(f"download: {l[-80:]}"),
            )
            if rc != 0:
                raise RuntimeError("Falha ao baixar os pesos do avatar (huggingface-cli).")
            flag.touch()
        _avatar_ready["weights"] = True


def _save_b64(data_b64: str, path: Path):
    raw = data_b64.split(",", 1)[1] if data_b64.startswith("data:") else data_b64
    path.write_bytes(base64.b64decode(raw))


def run_avatar_job(job: Job):
    """Gera vídeo de avatar (single ou multi áudio) via script oficial."""
    p = job.params

    def report(stage: str, progress: float):
        job.stage = stage
        job.progress = max(job.progress, min(progress, 0.999))
        print(f"[job {job.id}] {progress:.0%} {stage}")

    ensure_avatar_ready(lambda msg: report(msg, max(job.progress, 0.02)))

    work = UPLOAD_DIR / job.id
    work.mkdir(parents=True, exist_ok=True)
    out_dir = work / "out"
    out_dir.mkdir(exist_ok=True)

    audios = p.audios or []
    if not audios:
        raise ValueError("Nenhum áudio enviado para o avatar.")

    # imagem de referência (obrigatória para ai2v e para multi)
    image_path = None
    if p.image_b64:
        image_path = work / "ref.png"
        img = _decode_image(p.image_b64)
        img.save(image_path)

    is_multi = p.type == "avatar-multi"

    # salva áudios e monta cond_audio
    cond_audio: dict[str, str] = {}
    bbox: dict[str, object] = {}
    for idx, a in enumerate(audios):
        name = a.name or f"person{idx + 1}"
        ext = ".wav"
        if a.data_b64.startswith("data:audio/mpeg") or a.data_b64.startswith("data:audio/mp3"):
            ext = ".mp3"
        ap = work / f"{name}{ext}"
        _save_b64(a.data_b64, ap)
        cond_audio[name] = str(ap)
        if is_multi and a.bbox and len(a.bbox) == 4:
            bbox[name] = a.bbox

    input_json = {"prompt": p.prompt, "cond_audio": cond_audio}
    if image_path:
        input_json["cond_image"] = str(image_path)
    if is_multi:
        input_json["audio_type"] = p.audio_type
        if bbox:
            input_json["bbox"] = bbox

    json_path = work / "input.json"
    json_path.write_text(json.dumps(input_json, ensure_ascii=False, indent=2), encoding="utf-8")

    script = (
        "run_demo_avatar_multi_audio_to_video.py"
        if is_multi
        else "run_demo_avatar_single_audio_to_video.py"
    )
    cmd = [
        "torchrun", "--nproc_per_node=1", "--master_port=29555", script,
        "--context_parallel_size=1",
        f"--checkpoint_dir={AVATAR_CHECKPOINT_DIR}",
        "--model_type", AVATAR_MODEL_TYPE,
        "--use_distill",
        "--input_json", str(json_path),
        "--output_dir", str(out_dir),
        "--resolution", p.resolution,
        "--num_segments", str(max(p.num_segments, 1)),
        "--num_inference_steps", str(p.num_inference_steps),
        "--ref_img_index", str(p.ref_img_index),
        "--mask_frame_range", str(p.mask_frame_range),
        "--text_guidance_scale", str(p.text_guidance_scale),
        "--audio_guidance_scale", str(p.audio_guidance_scale),
    ]
    if p.use_int8:
        cmd.append("--use_int8")
    if not is_multi:
        # ai2v exige imagem; se não houver, cai para at2v (do zero)
        stage = p.stage_1 if (p.stage_1 == "at2v" or image_path) else "at2v"
        cmd += ["--stage_1", stage]

    report("Gerando avatar (lip-sync)... isso pode levar vários minutos.", max(job.progress, 0.1))

    total_units = 1 + max(p.num_segments, 0)
    seen = {"n": 0}

    def on_line(line: str):
        low = line.lower()
        if "continue" in low or "segment" in low or "demo_1" in low:
            seen["n"] = min(seen["n"] + 1, total_units)
        prog = 0.1 + 0.85 * (seen["n"] / max(total_units, 1))
        job.stage = line[-100:]
        job.progress = max(job.progress, min(prog, 0.95))

    env = dict(os.environ)
    env.setdefault("PYTHONPATH", LONGCAT_REPO)
    rc = _run_stream(cmd, cwd=LONGCAT_REPO, on_line=on_line, env=env)
    if rc != 0:
        raise RuntimeError(f"Script de avatar terminou com código {rc}. Veja o log acima.")

    # localiza o(s) mp4 gerado(s); pega o mais recente (vídeo final completo)
    mp4s = sorted(out_dir.rglob("*.mp4"), key=lambda f: f.stat().st_mtime)
    if not mp4s:
        raise RuntimeError("O script de avatar não produziu nenhum arquivo .mp4.")
    report("Finalizando...", 0.98)
    final = OUTPUT_DIR / f"{job.id}.mp4"
    shutil.copyfile(mp4s[-1], final)
    job.output_path = final
    job.fps = 25 if AVATAR_MODEL_TYPE == "avatar-v1.5" else 16
    print(f"[job {job.id}] avatar produziu {len(mp4s)} mp4(s); usando {mp4s[-1].name}")


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
            if job.params.type in ("avatar-single", "avatar-multi"):
                run_avatar_job(job)
            elif job.params.model == "ltx2.3":
                run_ltx_job(job)
            else:
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


@app.get("/outputs", dependencies=[Depends(check_auth)])
def list_outputs():
    """Lista os MP4 no disco (sobrevive a reinícios do worker, ao contrário
    da fila em memória)."""
    files = sorted(OUTPUT_DIR.glob("*.mp4"), key=lambda f: f.stat().st_mtime, reverse=True)
    return {
        "files": [
            {"name": f.name, "size_mb": round(f.stat().st_size / 1e6, 2), "mtime": f.stat().st_mtime}
            for f in files
        ]
    }


@app.get("/outputs/{name}", dependencies=[Depends(check_auth)])
def get_output(name: str):
    """Serve um MP4 direto do disco pelo nome do arquivo."""
    safe = os.path.basename(name)
    if not safe.endswith(".mp4"):
        raise HTTPException(400, "apenas .mp4")
    path = OUTPUT_DIR / safe
    if not path.exists():
        raise HTTPException(404, "arquivo nao encontrado")
    return FileResponse(path, media_type="video/mp4", filename=safe)


@app.post("/reload", dependencies=[Depends(check_auth)])
def reload_worker():
    """Puxa o código mais novo do repositório e reinicia o worker (re-exec).
    Permite aplicar correções sem recriar a instância."""
    repo = "/workspace/longcat-video-studio"
    out = ""
    try:
        out = subprocess.check_output(
            ["git", "-C", repo, "pull", "--ff-only"],
            text=True, stderr=subprocess.STDOUT, timeout=60,
        )
    except Exception as exc:  # pragma: no cover
        out = f"git pull falhou: {exc}"

    def _restart():
        time.sleep(1)
        os.execv(sys.executable, [sys.executable, os.path.join(repo, "worker", "server.py")])

    threading.Thread(target=_restart, daemon=True).start()
    return {"ok": True, "git": out[-500:], "restarting": True}


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
        "ltx_loaded": LTX_RUNTIME.pipe is not None,
        "ltx_loading": LTX_RUNTIME.loading,
        "ltx_load_error": (LTX_RUNTIME.load_error or "")[-1000:] or None,
        "avatar_supported": True,
        "avatar_ready": _avatar_ready["weights"],
        "queue_size": len(JOB_QUEUE),
        "running_job": running[0].id if running else None,
        "jobs_total": len(JOBS),
        "gpus": gpu_info(),
    }


@app.post("/jobs", dependencies=[Depends(check_auth)])
def create_job(params: JobParams):
    valid = ("t2v", "i2v", "long", "avatar-single", "avatar-multi")
    if params.type not in valid:
        raise HTTPException(400, f"type must be one of {valid}")

    if params.type.startswith("avatar-"):
        audios = params.audios or []
        if not audios:
            raise HTTPException(400, "avatar requires at least one audio")
        if params.type == "avatar-single" and len(audios) != 1:
            raise HTTPException(400, "avatar-single requires exactly one audio")
        if params.type == "avatar-multi" and len(audios) < 2:
            raise HTTPException(400, "avatar-multi requires at least two audios")
        if params.type == "avatar-multi" and not params.image_b64:
            raise HTTPException(400, "avatar-multi requires a reference image")
        if params.stage_1 == "ai2v" and not params.image_b64 and params.type == "avatar-single":
            raise HTTPException(400, "stage_1=ai2v requires a reference image (or use at2v)")
        if any(not a.data_b64 for a in audios):
            raise HTTPException(400, "every audio must include data_b64")
    else:
        if params.model == "ltx2.3" and params.type not in ("t2v", "i2v"):
            raise HTTPException(400, "ltx2.3 currently supports only t2v and i2v")
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
