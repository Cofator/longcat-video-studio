# Worker (GPU) — LongCat Video Studio

Servidor FastAPI que roda **na instância GPU da Vast.ai** e executa os jobs de
geração do [LongCat-Video](https://github.com/meituan-longcat/LongCat-Video).

## Como é provisionado

O frontend cria a instância na Vast.ai já com o script [vast_onstart.sh](vast_onstart.sh)
como `onstart`, que:

1. Clona o repositório `meituan-longcat/LongCat-Video` e instala as dependências;
2. Baixa os pesos (`meituan-longcat/LongCat-Video`, ~30 GB) do Hugging Face;
3. Clona este repositório e inicia `worker/server.py` na porta `8000`.

O primeiro boot demora (download de pesos + possíveis compilações). Acompanhe com:

```bash
tail -f /workspace/provision.log /workspace/worker.log
```

## Requisitos de GPU

O modelo tem 13,6B de parâmetros (bf16). Recomendado: **≥ 48 GB de VRAM**
(A100 80GB, H100, L40S 48GB, A6000 48GB). Disco: **≥ 80 GB**.

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | status de GPU, modelo e fila (sem auth) |
| POST | `/jobs` | cria job (`t2v`, `i2v`, `long`) |
| GET | `/jobs` | lista jobs |
| GET | `/jobs/{id}` | status/progresso |
| GET | `/jobs/{id}/video` | baixa o MP4 gerado |
| DELETE | `/jobs/{id}` | cancela (na fila) ou remove |

Se `WORKER_TOKEN` estiver definido, todas as rotas (exceto `/health`) exigem
`Authorization: Bearer <token>`.

### Exemplo — vídeo longo

```bash
curl -X POST http://IP:PORTA/jobs \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "long",
    "prompt": "Um gato laranja caminha por um telhado ao pôr do sol, câmera acompanhando",
    "num_segments": 9,
    "refine": "spatiotemporal"
  }'
```

`num_segments: 9` ≈ 1 minuto de vídeo (clipe base de 93 frames + 9 segmentos de
80 frames novos cada, a 15 fps; 30 fps com refinamento espaço-temporal).
