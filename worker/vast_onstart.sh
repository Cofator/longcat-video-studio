#!/bin/bash
# ============================================================================
# LongCat Video Studio — Vast.ai provisioning script (onstart)
#
# Use with a PyTorch 2.6 + CUDA 12.4 image, e.g.:
#   pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel
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
pip install -r requirements.txt

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
FA_VER=2.7.4.post1
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
