# Arquitetura

## Visão geral

O sistema tem duas partes desacopladas, ligadas por HTTP:

1. **Frontend (Next.js, `frontend/`)** — roda na máquina do usuário (ou em qualquer host Node).
   Toda comunicação com a Vast.ai e com o worker passa pelas **API routes** do Next
   (`src/app/api/*`), então as chaves nunca chegam ao navegador.
2. **Worker (FastAPI, `worker/server.py`)** — roda na instância GPU da Vast.ai. Mantém uma fila
   em memória e processa um job por vez (o modelo ocupa a GPU inteira).

## Fluxo de um job

```
UI (/generate) ── POST /api/jobs ──► API route ── POST {worker}/jobs ──► fila do worker
                                                                            │
UI (/jobs/[id]) ◄─ GET /api/jobs/[id] ◄─ proxy ◄─ GET {worker}/jobs/{id} ◄──┘ (polling 4s)
                                                                            │
UI player ◄─── GET /api/jobs/[id]/video (proxy c/ Range) ◄─────────────── MP4
```

## Descoberta do worker

O frontend resolve a URL do worker nesta ordem (`src/lib/worker.ts`):

1. `workerUrl` definida manualmente em Configurações;
2. Auto-detecção: lista as instâncias da conta Vast.ai, encontra a que tem o label
   `longcat-video-studio` e monta `http://{public_ipaddr}:{porta mapeada p/ 8000}`.

## Geração de vídeo longo

Estratégia do LongCat-Video reproduzida no worker (`run_job`):

1. **Clipe base** (93 frames, 480p) via `generate_t2v` ou `generate_i2v`;
2. **Loop de continuação**: para cada segmento, os últimos 13 frames viram condicionamento de
   `generate_vc(..., num_cond_frames=13, use_kv_cache=True)`; anexam-se os 80 frames novos.
   Prompts por segmento são suportados;
3. **Refinamento opcional** (coarse-to-fine 480p→720p) com `generate_refine`, janela a janela,
   encadeando `num_cond_frames` entre janelas; o refino espaço-temporal dobra o fps para 30;
4. Codificação MP4 (`libx264`, CRF 18) via `torchvision.io.write_video`.

Progresso é reportado por unidades de trabalho (base + segmentos + janelas de refino).

## Melhorar prompt (LLM)

A rota `/api/enhance-prompt` (server-side) expande a ideia do usuário em prompt
cinematográfico e gera roteiro por segmento. O mesmo SDK `@anthropic-ai/sdk` atende os
dois provedores — só mudam `baseURL` e `model` (`src/lib/anthropic.ts`):

| Provedor | baseURL | Modelo |
|---|---|---|
| Claude | padrão (api.anthropic.com) | `claude-opus-4-8` |
| LongCat | `https://api.longcat.chat/anthropic` | `LongCat-2.0` |

## Segurança

- `WORKER_TOKEN`: bearer token exigido pelo worker (exceto `/health`). É injetado na instância
  na criação (env + onstart) e enviado pelo frontend em cada chamada.
- Chaves ficam em `frontend/data/settings.json` (gitignored) ou em variáveis de ambiente.
- A API da Vast.ai é chamada só do lado servidor.

## Limitações conhecidas (v1)

- Worker single-GPU (sem context parallelism / torchrun multi-GPU).
- Fila em memória: reiniciar o worker perde o histórico de jobs (os MP4 permanecem no disco).
- LoRA de destilação (16 passos) é ativada só se encontrada no checkpoint baixado.
