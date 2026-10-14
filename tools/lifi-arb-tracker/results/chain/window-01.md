# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 14/10 07:34 ate 14/10 08:48 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 74 | erros: 8 | ciclos completos (ida+volta): 36

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 74/74 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (74).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (74), `Relayer fee` (36), `Relayer gas fee` (36), `Network Gas` (29), `Execution Gas` (29), `Service Fee` (29), `NearIntents Protocol Fee` (3), `1ClickSwap API Fee` (3), `NearIntents App Fee` (3), `LayerSwap fee` (3)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 36 | -24.16 | -21.24 | -16.79 | -16.61 | -16.58 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 36 | -35.13 | -34.93 | -34.73 | -34.34 | -34.24 | 0% |
| Ida, liquido de gas (bps) | 36 | -24.17 | -21.26 | -16.81 | -16.63 | -16.60 | 0% |
| Volta, liquido de gas (bps) | 36 | -35.18 | -34.98 | -34.78 | -34.38 | -34.29 | 0% |
| **Ida+volta simultanea** (bps) | 36 | -59.00 | -56.05 | -51.55 | -51.28 | -51.18 | 0% |
| **Ida+volta, liquido de gas** (bps) | 36 | -59.07 | -56.11 | -51.62 | -51.34 | -51.25 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 36 | +0.85 | +3.77 | +8.23 | +8.41 | +8.44 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 36 | -10.16 | -9.96 | -9.76 | -9.36 | -9.26 | 0% |
| Ida, liquido de gas (bps) | 36 | +0.83 | +3.75 | +8.21 | +8.39 | +8.42 | 100% |
| Volta, liquido de gas (bps) | 36 | -10.20 | -10.00 | -9.80 | -9.41 | -9.31 | 0% |
| **Ida+volta simultanea** (bps) | 36 | -9.11 | -6.14 | -1.62 | -1.35 | -1.25 | 0% |
| **Ida+volta, liquido de gas** (bps) | 36 | -9.17 | -6.20 | -1.69 | -1.41 | -1.32 | 0% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.66 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.66 | USDT_POLYGON |
| 1 | 1 | 0 | +1.66 | USDT_POLYGON |
| 2 | 1 | 0 | +1.66 | USDT_POLYGON |
| 3 | 1 | 0 | +1.66 | USDT_POLYGON |
| 5 | 1 | 0 | +1.66 | USDT_POLYGON |
| 10 | 0 | 0 | +0.00 | USDC_BASE |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 97% | 0% |
| 2 | 94% | 0% |
| 3 | 92% | 0% |
| 5 | 81% | 0% |
| 10 | 0% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 14/10 07h | 13 | +8.31 | -10.00 | -1.71 |
| 14/10 08h | 23 | +7.85 | -9.70 | -1.65 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 29 | +8.32 | +8.44 | 0.004 | 1080s |
| A2B | near | 3 | +3.82 | +6.32 | 0.003 | 640s |
| A2B | lifiIntents | 3 | +1.56 | +3.01 | 0.003 | 7s |
| A2B | layerswap | 3 | +4.87 | +4.87 | 0.003 | 25s |
| B2A | across | 36 | -9.76 | -9.26 | 0.009 | 4s |

## Veredito

**Nao vale.** Mesmo sem a taxa da LI.FI, a ida+volta deu mediana de -1.69 bps (~US$ -0.34), positiva em so 0% dos ciclos, e nenhuma estrategia de espera foi lucrativa.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
