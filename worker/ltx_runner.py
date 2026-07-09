"""
LTX-2.3 runner — executado DENTRO do .venv próprio do LTX-2 (uv sync).

Por que um processo separado? O LTX-2.3 exige transformers>=4.52 (para
Gemma3ForConditionalGeneration) e torch~=2.7, enquanto o LongCat usa um
transformers mais antigo no ambiente global. Carregar os dois no MESMO
processo faz o transformers global sombrear o do .venv (ImportError de
Gemma3). Rodando este script com `/workspace/LTX-2/.venv/bin/python`, todas
as importações resolvem do .venv — isolamento total entre os dois modelos.

Contrato: recebe o caminho de um JSON de parâmetros (argv[1]) que inclui
`out_mp4`. Gera o vídeo+áudio e grava o mp4 final DIRETO aqui (via o
`encode_video` da própria lib, que sabe lidar com o Iterator[Tensor] e o tipo
`Audio` devolvidos pelo pipeline — tentar serializar isso manualmente num
.npz no ambiente global quebraria, pois são tipos específicos do pacote).
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
        log(f"AVISO: o torch do .venv não lista {sm} — pode faltar kernel p/ esta GPU.")

    # ---- imports do LTX (resolvem do .venv) ---------------------------------
    log("importando ltx_pipelines...")
    from ltx_pipelines.ti2vid_two_stages import TI2VidTwoStagesPipeline
    from ltx_pipelines.utils.media_io import encode_video
    from ltx_pipelines.utils.quantization_factory import QuantizationKind
    from ltx_pipelines.utils.types import OffloadMode
    from ltx_core.components.guiders import MultiModalGuiderParams
    from ltx_core.model.video_vae import TilingConfig, get_video_chunks_number

    # O checkpoint tem pesos em fp8; sem quantização explícita o pipeline
    # assume bf16 e quebra na 1ª matmul fp8×bf16. fp8-scaled-mm (calcula
    # direto em fp8, sem upcast) ainda assim OOMou com offload_mode=NONE (não
    # isolamos a causa a tempo — só ~28GB era esperado, vimos ~95GB). Streaming
    # por camada (offload_mode=CPU) SÓ é suportado com bf16 ou fp8-cast
    # ("Block streaming is not supported with this quantization policy") — daí
    # usarmos fp8-cast aqui: o upcast bf16 acontece UMA camada por vez (poucos
    # MB), não no modelo inteiro de uma vez como acontecia com offload_mode=NONE.
    log("construindo política de quantização fp8-cast (compatível com streaming)...")
    quantization = QuantizationKind.FP8_CAST.to_policy(checkpoint_path=params["checkpoint"])

    log("carregando pipeline (offload_mode=CPU, checkpoint fp8 + upscaler + gemma-3)...")
    pipe = TI2VidTwoStagesPipeline(
        checkpoint_path=params["checkpoint"],
        distilled_lora=[],           # checkpoint já é a variante destilada
        spatial_upsampler_path=params["upsampler"],
        gemma_root=params["gemma"],
        loras=[],
        quantization=quantization,
        offload_mode=OffloadMode.CPU,
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

    # `images` é obrigatório na assinatura do pipeline mesmo para t2v puro —
    # lista vazia é o valor correto nesse caso (o próprio código do pipeline
    # trata len(images)==0 como "sem condicionamento por imagem").
    images = []
    if params.get("image_path"):
        from ltx_pipelines.utils.args import ImageConditioningInput
        images = [ImageConditioningInput(params["image_path"], 0, 1.0, num_frames)]

    tiling_config = TilingConfig.default()
    video_chunks_number = get_video_chunks_number(num_frames, tiling_config)

    log(f"gerando: {num_frames} frames, {params.get('num_inference_steps', 40)} passos...")
    video, audio = pipe(
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
        images=images,
        tiling_config=tiling_config,
    )

    log(f"codificando mp4 em {params['out_mp4']}...")
    encode_video(
        video=video,
        fps=int(frame_rate),
        audio=audio,
        output_path=params["out_mp4"],
        video_chunks_number=video_chunks_number,
    )
    log("mp4 gravado com sucesso.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
