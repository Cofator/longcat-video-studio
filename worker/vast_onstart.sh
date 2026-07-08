#!/bin/bash
# ============================================================================
# LongCat Video Studio — Vast.ai provisioning script (onstart)
#
# Use with a PyTorch 2.8 + CUDA 12.8 image, e.g.:
#   pytorch/pytorch:2.8.0-cuda12.8-cudnn9-devel
# (precisa ser >= torch 2.7 / CUDA 12.8 para suportar GPUs Blackwell, ex.
# RTX PRO 6000 — sm_120 nao existe em torch 2.6/cu12.4)
#
# Configurable via environment variables (set them in the Vast.ai template
# or in the "env" field when creating the instance):
#   WORKER_TOKEN   token required by the worker API (recommended!)
#   STUDIO_REPO    git URL of this project (frontend+worker) to clone
#   HF_TOKEN       optional HuggingFace token (higher download rate limits)
# ============================================================================
set -uo pipefail
exec > >(tee -a /workspace/provision.log) 2>&1

echo "== LongCat Video Studio provisioning started: $(date) =="
cd /workspace

export DEBIAN_FRONTEND=noninteractive
apt-get update -y && apt-get install -y git ffmpeg wget || true

# ---- 1. LongCat-Video (model code) ----------------------------------------
if [ ! -d /workspace/LongCat-Video ]; then
  git clone https://github.com/meituan-longcat/LongCat-Video.git /workspace/LongCat-Video
fi
cd /workspace/LongCat-Video
# O requirements.txt do LongCat causa DOIS problemas graves; removemos as linhas
# ofensivas e instalamos o resto:
#  1. flash-attn==2.7.4.post1 — sem wheel pré-compilada p/ torch2.8/cu128/py311,
#     cai numa compilação from-source de 45-90+ min. Trabalho 100% desperdiçado:
#     o passo mais abaixo reinstala à força a wheel correta (FA_VER) por cima.
#  2. torch==2.6.0 (linha 1) — REBAIXA o torch 2.8.0 da imagem base para 2.6.0,
#     que NÃO suporta Blackwell (sm_120, RTX PRO 6000) -> "torchvision::nms does
#     not exist" / kernels ausentes. A imagem base já traz torch/vision/audio
#     2.8.0+cu128 corretos; mantemos esses e ignoramos o pin do LongCat.
# grep -E casa "pkg", "pkg==x", "pkg>=x" etc. sem casar nomes que só começam igual.
STRIP='^(flash[_-]?attn|torch|torchvision|torchaudio)([^a-zA-Z0-9_.-]|$)'
grep -viE "$STRIP" requirements.txt > requirements.nofa.txt
pip install -r requirements.nofa.txt

# Avatar (audio-driven) deps — best effort; pesos são baixados sob demanda no
# primeiro job de avatar pelo worker.
if [ -f requirements_avatar.txt ]; then
  pip install -r requirements_avatar.txt || echo "WARN: requirements_avatar failed"
fi
pip install librosa soundfile "audio-separator[cpu]" onnxruntime || echo "WARN: avatar audio deps failed"

# FlashAttention-2 — OBRIGATÓRIA. O LongCat NÃO tem fallback para SDPA; usa
# flashattn2 por padrão. O requirements.txt instala flash-attn compilada com
# build-isolation (contra outro torch) -> "undefined symbol". Reinstalamos o
# wheel PRÉ-COMPILADO que casa com o torch/ABI instalados (rápido, sem compilar).
# Também removemos o xformers: o diffusers o importa e bate no flash-attn quebrado.
pip uninstall -y xformers >/dev/null 2>&1 || true
# 2.8.3.post1: primeira release com wheels para torch 2.8 (necessario p/ Blackwell)
FA_VER=2.8.3.post1
PYTAG=$(python -c "import sys;print(f'cp{sys.version_info.major}{sys.version_info.minor}')")
ABI=$(python -c "import torch;print('TRUE' if torch._C._GLIBCXX_USE_CXX11_ABI else 'FALSE')")
TMM=$(python -c "import torch;print('.'.join(torch.__version__.split('+')[0].split('.')[:2]))")
FA_WHL="flash_attn-${FA_VER}+cu12torch${TMM}cxx11abi${ABI}-${PYTAG}-${PYTAG}-linux_x86_64.whl"
FA_URL="https://github.com/Dao-AILab/flash-attention/releases/download/v${FA_VER}/${FA_WHL}"
echo "Reinstalando flash-attn compatível: $FA_URL"
pip install --force-reinstall --no-deps --no-cache-dir "$FA_URL" \
  || { echo "wheel falhou; compilando da fonte (lento)"; pip install ninja packaging psutil; \
       pip install flash-attn==${FA_VER} --no-build-isolation --force-reinstall --no-cache-dir; } \
  || echo "WARN: nao foi possivel instalar flash-attn"

# ---- 2. Model weights -------------------------------------------------------
# IMPORTANTE: huggingface_hub deve ficar < 1.0 — o transformers do LongCat exige
# huggingface-hub<1.0; um "-U" instalaria a 1.x e quebra o import do transformers.
pip install "huggingface_hub[cli]<1.0" hf_transfer
# hf_transfer: download paralelo/rápido e resiliente (evita stalls em hosts lentos).
export HF_HUB_ENABLE_HF_TRANSFER=1
mkdir -p /workspace/weights
if [ ! -f /workspace/weights/LongCat-Video/.download_complete ]; then
  # Retenta: huggingface-cli retoma downloads parciais, então repetir cobre stalls.
  for attempt in 1 2 3 4 5; do
    echo "== download do modelo, tentativa $attempt =="
    if huggingface-cli download meituan-longcat/LongCat-Video \
         --local-dir /workspace/weights/LongCat-Video; then
      touch /workspace/weights/LongCat-Video/.download_complete
      break
    fi
    echo "download interrompido; retomando em 10s..."
    sleep 10
  done
fi

# ---- 2.5 LTX-2.3 (Lightricks) — segundo modelo, opcional -------------------
# Baixado/instalado em background (não bloqueia o LongCat): ~35 GB de pesos
# (checkpoint fp8 destilado + upscaler espacial + encoder de texto Gemma-3).
# Se falhar ou ainda não tiver terminado, o worker reporta ltx_loaded=false e
# jobs com model="ltx2.3" falham com um erro claro em vez de travar o boot.
(
  set -uo pipefail
  exec >> /workspace/ltx_provision.log 2>&1
  echo "== LTX-2.3 provisioning started: $(date) =="
  if [ ! -d /workspace/LTX-2 ]; then
    git clone https://github.com/Lightricks/LTX-2.git /workspace/LTX-2
  fi
  cd /workspace/LTX-2
  # É um workspace uv (packages/ltx-core e packages/ltx-pipelines usam
  # `tool.uv.sources` com {workspace = true}) — "pip install -e" sozinho NÃO
  # resolve isso e falha silenciosamente (daí o ModuleNotFoundError no worker).
  # `uv sync` monta um .venv com tudo resolvido corretamente; o worker (que
  # roda no python global) enxerga esse .venv via site.addsitedir em runtime.
  if [ ! -d .venv ]; then
    pip install -q uv || true
    uv sync --frozen || echo "WARN: uv sync failed (LTX-2.3 indisponivel)"
  fi

  # Download idempotente POR ARQUIVO (não por um único flag): assim, corrigir a
  # fonte de um asset e reprovisionar baixa só o que falta.
  mkdir -p /workspace/weights/LTX-2.3
  CKPT=/workspace/weights/LTX-2.3/ltx-2.3-22b-distilled-fp8.safetensors
  UPS=/workspace/weights/LTX-2.3/ltx-2.3-spatial-upscaler-x2-1.1.safetensors
  GEMMA_DIR=/workspace/weights/LTX-2.3/gemma-3-12b-it
  for attempt in 1 2 3; do
    echo "== download dos pesos LTX-2.3, tentativa $attempt =="
    ok=1
    [ -f "$CKPT" ] || huggingface-cli download Lightricks/LTX-2.3-fp8 ltx-2.3-22b-distilled-fp8.safetensors \
      --local-dir /workspace/weights/LTX-2.3 || ok=0
    [ -f "$UPS" ] || huggingface-cli download Lightricks/LTX-2.3 ltx-2.3-spatial-upscaler-x2-1.1.safetensors \
      --local-dir /workspace/weights/LTX-2.3 || ok=0
    # Gemma text encoder: o LTX exige a variante QAT-unquantized — ela tem o
    # tokenizer.model (SentencePiece) que o pipeline procura e NÃO é gated. O
    # google/gemma-3-12b-it "puro" é gated e não traz esse arquivo (FileNotFound).
    if [ ! -f "$GEMMA_DIR/tokenizer.model" ]; then
      rm -rf "$GEMMA_DIR"
      huggingface-cli download google/gemma-3-12b-it-qat-q4_0-unquantized \
        --local-dir "$GEMMA_DIR" || ok=0
    fi
    [ "$ok" = 1 ] && { touch /workspace/weights/LTX-2.3/.download_complete; break; }
    echo "download incompleto; retomando em 10s..."
    sleep 10
  done
  echo "== LTX-2.3 provisioning done: $(date) =="
) &

# ---- 3. Worker (this project) ----------------------------------------------
STUDIO_REPO="${STUDIO_REPO:-https://github.com/Cofator/longcat-video-studio.git}"
if [ ! -d /workspace/longcat-video-studio ]; then
  git clone "$STUDIO_REPO" /workspace/longcat-video-studio
fi
cd /workspace/longcat-video-studio
git pull || true
pip install -r worker/requirements.txt

# ---- 4. Launch ---------------------------------------------------------------
export LONGCAT_REPO=/workspace/LongCat-Video
export CHECKPOINT_DIR=/workspace/weights/LongCat-Video
export OUTPUT_DIR=/workspace/outputs
export PORT=8000
mkdir -p "$OUTPUT_DIR"

echo "== starting worker on port $PORT =="
cd /workspace/longcat-video-studio/worker
nohup python server.py > /workspace/worker.log 2>&1 &
echo "== provisioning done: $(date) — logs: /workspace/worker.log =="
