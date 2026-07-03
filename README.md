# 🐈‍⬛ LongCat Video Studio

Interface web completa para gerar **vídeos longos (minutos)** com o modelo open-source
[LongCat-Video (13,6B)](https://huggingface.co/meituan-longcat/LongCat-Video) da Meituan,
com **processamento remoto em GPUs da [Vast.ai](https://vast.ai)**.

> Text-to-Video · Image-to-Video · Vídeo longo por continuação de segmentos · Refinamento 720p/30fps

## Arquitetura

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│  Frontend (Next.js)     │  HTTPS  │  Vast.ai (GPU alugada)       │
│  - UI em PT-BR          │ ──────► │  worker/server.py (FastAPI)  │
│  - API routes (proxy)   │         │  └─ LongCat-Video 13,6B      │
│  - Gestão de instâncias │ ──────► │     (pesos do Hugging Face)  │
│    via API da Vast.ai   │         │                              │
└─────────────────────────┘         └──────────────────────────────┘
```

- **`frontend/`** — app Next.js (App Router). Cria/gerencia instâncias na Vast.ai, envia jobs de
  geração, acompanha progresso em tempo real e reproduz/baixa os MP4 gerados. As chaves ficam
  no servidor local (nunca no navegador nem no git).
- **`worker/`** — servidor FastAPI que roda na instância GPU: fila de jobs, carregamento do
  modelo, geração (t2v / i2v / vídeo longo com `generate_vc` + KV-cache) e refinamento
  coarse-to-fine para 720p.

## Como usar

### 1. Rodar o frontend (sua máquina)

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

### 2. Configurar

Abra **Configurações** na interface:

1. Cole sua **chave da API da Vast.ai** ([cloud.vast.ai → Keys](https://cloud.vast.ai/manage-keys/));
2. Defina um **token do worker** (qualquer string secreta — protege sua GPU de uso por terceiros);
3. (Opcional) ajuste a URL do repositório que a instância vai clonar.

### 3. Alugar uma GPU

Na aba **GPUs**, busque ofertas (recomendado: **≥ 48 GB de VRAM** — A100 80GB, H100, L40S,
RTX A6000; disco ≥ 100 GB) e clique em **Alugar**. A instância já nasce com o script
[`worker/vast_onstart.sh`](worker/vast_onstart.sh), que:

1. clona o repositório oficial `meituan-longcat/LongCat-Video` e instala as dependências;
2. baixa os pesos (~30 GB) do Hugging Face;
3. sobe o worker na porta 8000.

O primeiro boot leva **10–30 min**. O indicador na barra lateral fica verde quando o worker
está pronto (o frontend descobre IP/porta automaticamente pela API da Vast.ai).

### 4. Gerar vídeos

Na aba **Gerar vídeo**:

- **Texto → Vídeo** e **Imagem → Vídeo**: clipes de ~6 s (93 frames, 480p; opcionalmente
  refinados para 720p).
- **Vídeo longo**: escolha a duração-alvo (até 4 min). O app calcula os segmentos de
  continuação necessários (clipe base + N × 80 frames novos com 13 frames de condicionamento,
  KV-cache ativado) — a técnica do LongCat-Video que evita drift de cor/qualidade. Você pode
  dar um prompt por segmento para dirigir a narrativa.
- **Qualidade**: 480p rápido, 720p (refino espacial) ou 720p 30fps (refino espaço-temporal).
- **Turbo**: LoRA de destilação (16 passos) quando disponível no checkpoint.

Acompanhe em **Meus vídeos** (progresso por etapa) e baixe o MP4 ao final.

> 💸 **Custo**: você paga a Vast.ai por hora de GPU. Instâncias **paradas ainda cobram
> armazenamento** — destrua o que não estiver usando (aba GPUs).

## Rodando o worker manualmente (sem o script)

```bash
# na instância GPU
export LONGCAT_REPO=/workspace/LongCat-Video
export CHECKPOINT_DIR=/workspace/weights/LongCat-Video
export WORKER_TOKEN=meu-segredo
pip install -r worker/requirements.txt
python worker/server.py   # porta 8000
```

Depois informe `http://IP:PORTA` em Configurações → URL do worker.
Também há um [`worker/Dockerfile`](worker/Dockerfile) para quem preferir imagem própria.

## Documentação

- [docs/architecture.md](docs/architecture.md) — decisões de arquitetura e fluxo dos jobs
- [docs/setup-vastai.md](docs/setup-vastai.md) — guia passo a passo da Vast.ai
- [worker/README.md](worker/README.md) — API do worker

## Licença

[MIT](LICENSE). O modelo LongCat-Video também é MIT (Meituan LongCat Team).
