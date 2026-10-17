# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 14/10 14:14 ate 14/10 15:28 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 73 | erros: 9 | ciclos completos (ida+volta): 35

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 73/73 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (73).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (73), `Relayer fee` (32), `Relayer gas fee` (32), `Network Gas` (9), `Execution Gas` (9), `Service Fee` (9), `Relayer Gas fee` (4), `Relayer Service fee` (4), `LayerSwap fee` (3)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 35 | -24.39 | -16.87 | -15.98 | -14.88 | -10.99 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 35 | -42.84 | -35.83 | -35.03 | -34.81 | -34.53 | 0% |
| Ida, liquido de gas (bps) | 35 | -24.40 | -16.88 | -15.99 | -14.90 | -11.01 | 0% |
| Volta, liquido de gas (bps) | 35 | -42.89 | -35.89 | -35.07 | -34.86 | -34.58 | 0% |
| **Ida+volta simultanea** (bps) | 35 | -66.02 | -53.03 | -50.97 | -50.36 | -46.48 | 0% |
| **Ida+volta, liquido de gas** (bps) | 35 | -66.08 | -53.09 | -51.06 | -50.42 | -46.56 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 35 | +0.61 | +8.15 | +9.04 | +10.14 | +14.04 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 35 | -17.89 | -10.86 | -10.06 | -9.84 | -9.56 | 0% |
| Ida, liquido de gas (bps) | 35 | +0.60 | +8.14 | +9.03 | +10.13 | +14.03 | 100% |
| Volta, liquido de gas (bps) | 35 | -17.93 | -10.92 | -10.10 | -9.88 | -9.60 | 0% |
| **Ida+volta simultanea** (bps) | 35 | -16.16 | -3.11 | -1.03 | -0.42 | +3.47 | 6% |
| **Ida+volta, liquido de gas** (bps) | 35 | -16.22 | -3.17 | -1.12 | -0.48 | +3.40 | 6% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.67 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.67 | USDT_POLYGON |
| 1 | 1 | 0 | +1.67 | USDT_POLYGON |
| 2 | 1 | 0 | +1.67 | USDT_POLYGON |
| 3 | 1 | 0 | +1.67 | USDT_POLYGON |
| 5 | 1 | 0 | +1.67 | USDT_POLYGON |
| 10 | 1 | 0 | +2.39 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 97% | 0% |
| 2 | 97% | 0% |
| 3 | 97% | 0% |
| 5 | 97% | 0% |
| 10 | 14% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 14/10 14h | 23 | +8.92 | -10.00 | -1.28 |
| 14/10 15h | 12 | +9.83 | -10.66 | -0.98 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | lifiIntents | 25 | +9.05 | +10.15 | 0.003 | 7s |
| A2B | polymerStandard | 9 | +8.17 | +9.77 | 0.004 | 1080s |
| A2B | relaydepository | 3 | +11.97 | +14.04 | 0.003 | 2s |
| A2B | layerswap | 1 | +5.71 | +5.71 | 0.003 | 25s |
| B2A | across | 32 | -10.06 | -9.56 | 0.009 | 4s |
| B2A | layerswap | 2 | -17.33 | -16.78 | 0.009 | 15s |
| B2A | relaydepository | 1 | -12.05 | -12.05 | 0.007 | 2s |

## Veredito

**Nao vale.** Mesmo sem a taxa da LI.FI, a ida+volta deu mediana de -1.12 bps (~US$ -0.22), positiva em so 6% dos ciclos, e nenhuma estrategia de espera foi lucrativa.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
