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

# FlashAttention-2 — OPCIONAL. A compilação da fonte (--no-build-isolation)
# leva 20-40 min e não é necessária: o modelo cai para SDPA/xformers.
# Só instala se INSTALL_FLASH_ATTN=1 for definido (usa wheel pré-compilado se houver).
if [ "${INSTALL_FLASH_ATTN:-0}" = "1" ]; then
  pip install ninja psutil packaging
  pip install flash-attn || echo "WARN: flash-attn install failed, continuing (usa SDPA/xformers)"
else
  echo "flash-attn pulado (INSTALL_FLASH_ATTN!=1) — usando SDPA/xformers"
  pip install xformers || echo "WARN: xformers install failed"
fi

# ---- 2. Model weights -------------------------------------------------------
pip install -U "huggingface_hub[cli]"
mkdir -p /workspace/weights
if [ ! -f /workspace/weights/LongCat-Video/.download_complete ]; then
  huggingface-cli download meituan-longcat/LongCat-Video \
    --local-dir /workspace/weights/LongCat-Video && \
    touch /workspace/weights/LongCat-Video/.download_complete
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
