# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 14/10 10:54 ate 14/10 12:08 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 73 | erros: 9 | ciclos completos (ida+volta): 35

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 73/73 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (73).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (73), `Relayer fee` (29), `Relayer gas fee` (29), `Network Gas` (15), `Execution Gas` (15), `Service Fee` (15), `LayerSwap fee` (2), `Relayer Gas fee` (1), `Relayer Service fee` (1), `NearIntents Protocol Fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 35 | -23.03 | -16.95 | -16.26 | -15.02 | -5.34 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 35 | -38.12 | -35.93 | -35.53 | -34.44 | -34.14 | 0% |
| Ida, liquido de gas (bps) | 35 | -23.04 | -16.97 | -16.28 | -15.04 | -5.36 | 0% |
| Volta, liquido de gas (bps) | 35 | -38.16 | -35.98 | -35.58 | -34.48 | -34.19 | 0% |
| **Ida+volta simultanea** (bps) | 35 | -58.67 | -54.01 | -51.08 | -50.22 | -40.95 | 0% |
| **Ida+volta, liquido de gas** (bps) | 35 | -58.74 | -54.08 | -51.15 | -50.29 | -41.02 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 35 | +1.98 | +8.07 | +8.76 | +10.00 | +19.71 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 35 | -13.15 | -10.96 | -10.56 | -9.46 | -9.16 | 0% |
| Ida, liquido de gas (bps) | 35 | +1.96 | +8.05 | +8.74 | +9.99 | +19.69 | 100% |
| Volta, liquido de gas (bps) | 35 | -13.19 | -11.01 | -10.61 | -9.51 | -9.21 | 0% |
| **Ida+volta simultanea** (bps) | 35 | -8.78 | -4.10 | -1.15 | -0.28 | +9.03 | 3% |
| **Ida+volta, liquido de gas** (bps) | 35 | -8.85 | -4.17 | -1.21 | -0.35 | +8.97 | 3% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.87 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.87 | USDT_POLYGON |
| 1 | 1 | 0 | +1.87 | USDT_POLYGON |
| 2 | 1 | 0 | +1.87 | USDT_POLYGON |
| 3 | 1 | 0 | +1.87 | USDT_POLYGON |
| 5 | 1 | 0 | +1.87 | USDT_POLYGON |
| 10 | 1 | 0 | +2.01 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 97% | 0% |
| 3 | 97% | 0% |
| 5 | 97% | 0% |
| 10 | 11% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 14/10 10h | 3 | +9.23 | -9.40 | -0.09 |
| 14/10 11h | 29 | +8.73 | -10.71 | -1.21 |
| 14/10 12h | 3 | +8.92 | -10.80 | -1.89 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | lifiIntents | 21 | +8.84 | +10.05 | 0.003 | 7s |
| A2B | polymerStandard | 15 | +8.76 | +9.08 | 0.004 | 1080s |
| A2B | layerswap | 2 | +12.66 | +19.71 | 0.003 | 26s |
| B2A | across | 29 | -10.56 | -9.16 | 0.010 | 4s |
| B2A | lifiIntents | 4 | -9.83 | -9.65 | 0.010 | 7s |
| B2A | relaydepository | 1 | -13.15 | -13.15 | 0.009 | 2s |
| B2A | near | 1 | -12.78 | -12.78 | 0.009 | 37s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.21 bps (~US$ -0.24) e foi positiva em apenas 1 de 35 ciclos (2.9%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: +8.97 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
