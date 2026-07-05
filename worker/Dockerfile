# LongCat Video Studio worker image (alternative to onstart provisioning).
# Model weights are NOT baked in — mount or download them to /workspace/weights.
FROM pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y git ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
RUN git clone https://github.com/meituan-longcat/LongCat-Video.git /workspace/LongCat-Video \
    && pip install --no-cache-dir -r /workspace/LongCat-Video/requirements.txt \
    && pip install --no-cache-dir ninja psutil packaging \
    && (pip install --no-cache-dir flash-attn --no-build-isolation || echo "flash-attn skipped") \
    && pip install --no-cache-dir "huggingface_hub[cli]<1.0"

COPY server.py /workspace/worker/server.py
COPY requirements.txt /workspace/worker/requirements.txt
RUN pip install --no-cache-dir -r /workspace/worker/requirements.txt

ENV LONGCAT_REPO=/workspace/LongCat-Video \
    CHECKPOINT_DIR=/workspace/weights/LongCat-Video \
    OUTPUT_DIR=/workspace/outputs \
    PORT=8000

EXPOSE 8000
WORKDIR /workspace/worker
CMD ["sh", "-c", "if [ ! -f $CHECKPOINT_DIR/.download_complete ]; then huggingface-cli download meituan-longcat/LongCat-Video --local-dir $CHECKPOINT_DIR && touch $CHECKPOINT_DIR/.download_complete; fi; python server.py"]
