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

# FlashAttention-2 (best effort — the pipeline can fall back to SDPA/xformers)
pip install ninja psutil packaging
pip install flash-attn --no-build-isolation || echo "WARN: flash-attn install failed, continuing"

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
