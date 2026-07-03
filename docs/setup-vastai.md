# Guia Vast.ai — passo a passo

## 1. Criar conta e adicionar créditos

1. Crie uma conta em [vast.ai](https://vast.ai);
2. Adicione créditos (Billing) — GPUs de 48–80 GB custam tipicamente **US$ 0,60–2,50/h**;
3. Em [cloud.vast.ai/manage-keys](https://cloud.vast.ai/manage-keys/), copie sua **API Key**.

## 2. Configurar o app

Em **Configurações**:

- Cole a API Key da Vast.ai;
- Defina um **token do worker** (ex.: uma senha longa aleatória). Sem ele, qualquer pessoa que
  descobrir o IP/porta da sua GPU pode usá-la.

## 3. Escolher GPU

| GPU | VRAM | Observação |
|---|---|---|
| H100 SXM/PCIe | 80 GB | mais rápida, mais cara |
| A100 80GB | 80 GB | ótimo custo-benefício |
| L40S | 48 GB | boa opção intermediária |
| RTX A6000 / 6000 Ada | 48 GB | frequentemente as mais baratas ≥48 GB |

Requisitos: **VRAM ≥ 48 GB** (o modelo tem 13,6B parâmetros em bf16 + ativações de vídeo),
**disco ≥ 100 GB** (pesos ~30 GB + cache + vídeos), boa velocidade de download (≥ 200 Mbps
acelera muito o primeiro boot).

## 4. Alugar pela interface

Aba **GPUs** → escolha o preset → **Buscar** → **Alugar** na melhor oferta.
A instância é criada com:

- Imagem: `pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel`
- Porta 8000 exposta (mapeada pela Vast.ai para uma porta pública aleatória)
- `onstart` que roda [worker/vast_onstart.sh](../worker/vast_onstart.sh)

## 5. Acompanhar o provisionamento

O primeiro boot leva **10–30 min** (instalação + download de ~30 GB de pesos). Para acompanhar,
conecte por SSH (botão na console da Vast.ai) e rode:

```bash
tail -f /workspace/provision.log /workspace/worker.log
```

Quando o indicador da barra lateral do app ficar **verde**, está pronto.
O primeiro job ainda carrega o modelo na GPU (~2–5 min extras).

## 6. Custos — boas práticas

- **Parar** a instância pausa a cobrança de GPU, mas **continua cobrando armazenamento**;
- **Destruir** encerra toda cobrança (os vídeos não baixados são perdidos — baixe antes!);
- Vídeos longos com refino podem levar horas de GPU: comece testando com clipes curtos em 480p.

## Solução de problemas

| Sintoma | Causa provável | Ação |
|---|---|---|
| Worker "inacessível" após 30 min | provisionamento falhou | veja `/workspace/provision.log` via SSH |
| Job falha com CUDA OOM | VRAM insuficiente | use GPU ≥ 48 GB; desative refino |
| `401 invalid worker token` | token diferente do da criação | ajuste em Configurações |
| Download dos pesos muito lento | máquina com internet ruim | destrua e alugue outra oferta |
