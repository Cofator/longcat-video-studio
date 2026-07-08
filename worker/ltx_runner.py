"""
LTX-2.3 runner — executado DENTRO do .venv próprio do LTX-2 (uv sync).

Por que um processo separado? O LTX-2.3 exige transformers>=4.52 (para
Gemma3ForConditionalGeneration) e torch~=2.7, enquanto o LongCat usa um
transformers mais antigo no ambiente global. Carregar os dois no MESMO
processo faz o transformers global sombrear o do .venv (ImportError de
Gemma3). Rodando este script com `/workspace/LTX-2/.venv/bin/python`, todas
as importações resolvem do .venv — isolamento total entre os dois modelos.

Contrato: recebe o caminho de um JSON de parâmetros (argv[1]) que inclui
`out_npz`. Gera o vídeo+áudio e salva os arrays crus num .npz; o worker (no
ambiente global, que tem torchvision) faz a codificação final para mp4.
Progresso é impresso em stdout linha a linha (o worker faz streaming).
"""

import json
import sys
import uuid
from pathlib import Path


def log(msg: str):
    print(f"[ltx] {msg}", flush=True)


def main() -> int:
    params = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))

    import numpy as np
    import torch

    # ---- diagnóstico de GPU antes de carregar o modelo (barato, falha cedo) --
    log(f"torch={torch.__version__} cuda={torch.version.cuda} avail={torch.cuda.is_available()}")
    if not torch.cuda.is_available():
        log("ERRO: torch do .venv não enxerga CUDA — geração em CPU é inviável.")
        return 3
    cap = torch.cuda.get_device_capability()
    sm = f"sm_{cap[0]}{cap[1]}"
    archs = torch.cuda.get_arch_list()
    log(f"gpu={torch.cuda.get_device_name(0)} capability={sm}")
    log(f"torch_arch_list={archs}")
    if sm not in archs:
        # Blackwell (sm_120) precisa de um torch compilado com esse kernel.
        log(f"AVISO: o torch do .venv não lista {sm} — pode faltar kernel p/ esta GPU.")

    # ---- imports do LTX (resolvem do .venv) ---------------------------------
    log("importando ltx_pipelines...")
    from ltx_pipelines.ti2vid_two_stages import TI2VidTwoStagesPipeline
    from ltx_core.components.guiders import MultiModalGuiderParams
    from ltx_core.model.video_vae import TilingConfig

    log("carregando pipeline (checkpoint fp8 + upscaler + gemma-3)...")
    pipe = TI2VidTwoStagesPipeline(
        checkpoint_path=params["checkpoint"],
        distilled_lora=[],           # checkpoint já é a variante destilada
        spatial_upsampler_path=params["upsampler"],
        gemma_root=params["gemma"],
        loras=[],
    )

    # num_frames no formato 8k+1 exigido pelo modelo.
    k = max(1, round((params["num_frames"] - 1) / 8))
    num_frames = k * 8 + 1
    frame_rate = 25.0
    guidance = float(params.get("guidance_scale", 4.0))

    video_guider = MultiModalGuiderParams(
        cfg_scale=guidance, stg_scale=1.0, rescale_scale=0.7,
        modality_scale=3.0, skip_step=0, stg_blocks=[29],
    )
    audio_guider = MultiModalGuiderParams(
        cfg_scale=max(guidance, 7.0), stg_scale=1.0, rescale_scale=0.7,
        modality_scale=3.0, skip_step=0, stg_blocks=[29],
    )

    seed = params.get("seed")
    generator_seed = int(seed) if seed is not None else int(uuid.uuid4().int % (2**31))

    kwargs = dict(
        prompt=params["prompt"],
        negative_prompt=params.get("negative_prompt", ""),
        seed=generator_seed,
        height=512,
        width=768,
        num_frames=num_frames,
        frame_rate=frame_rate,
        num_inference_steps=int(params.get("num_inference_steps", 40)),
        video_guider_params=video_guider,
        audio_guider_params=audio_guider,
        tiling_config=TilingConfig.default(),
    )

    if params.get("image_path"):
        from ltx_pipelines.utils.args import ImageConditioningInput
        kwargs["images"] = [ImageConditioningInput(params["image_path"], 0, 1.0, num_frames)]

    log(f"gerando: {num_frames} frames, {kwargs['num_inference_steps']} passos...")
    video, audio = pipe(**kwargs)

    # ---- serializa arrays crus; o worker codifica o mp4 -----------------------
    def to_np(x):
        if x is None:
            return None
        if torch.is_tensor(x):
            return x.detach().cpu().float().numpy()
        return np.asarray(x)

    video_np = to_np(video)
    audio_np = to_np(audio)
    log(f"video.shape={None if video_np is None else video_np.shape} "
        f"audio.shape={None if audio_np is None else getattr(audio_np, 'shape', None)}")

    save = {"video": video_np, "fps": np.asarray(frame_rate)}
    if audio_np is not None:
        save["audio"] = audio_np
    np.savez(params["out_npz"], **save)
    log(f"salvo em {params['out_npz']}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
