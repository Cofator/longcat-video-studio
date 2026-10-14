# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:30 ate 14/10 15:28 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 674 | erros: 68 | ciclos completos (ida+volta): 330

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 674/674 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (674).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (674), `Relayer fee` (312), `Relayer gas fee` (312), `Network Gas` (184), `Execution Gas` (184), `Service Fee` (184), `LayerSwap fee` (21), `NearIntents Protocol Fee` (17), `1ClickSwap API Fee` (17), `NearIntents App Fee` (17)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 330 | -31.14 | -19.11 | -16.68 | -15.58 | -3.92 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 330 | -42.84 | -35.73 | -34.93 | -34.34 | -22.55 | 0% |
| Ida, liquido de gas (bps) | 330 | -31.17 | -19.13 | -16.70 | -15.59 | -3.93 | 0% |
| Volta, liquido de gas (bps) | 330 | -42.89 | -35.78 | -34.98 | -34.38 | -22.60 | 0% |
| **Ida+volta simultanea** (bps) | 330 | -66.02 | -54.28 | -51.49 | -50.76 | -38.20 | 0% |
| **Ida+volta, liquido de gas** (bps) | 330 | -66.08 | -54.34 | -51.55 | -50.83 | -38.26 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 330 | -6.15 | +5.90 | +8.34 | +9.44 | +21.14 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 330 | -17.89 | -10.76 | -9.96 | -9.36 | +2.46 | 0% |
| Ida, liquido de gas (bps) | 330 | -6.19 | +5.89 | +8.32 | +9.43 | +21.12 | 100% |
| Volta, liquido de gas (bps) | 330 | -17.93 | -10.81 | -10.00 | -9.40 | +2.41 | 0% |
| **Ida+volta simultanea** (bps) | 330 | -16.16 | -4.36 | -1.56 | -0.83 | +11.80 | 4% |
| **Ida+volta, liquido de gas** (bps) | 330 | -16.22 | -4.43 | -1.62 | -0.89 | +11.74 | 4% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 3 | 1 | +3.83 | USDT_POLYGON |
| 0.5 | 3 | 1 | +3.83 | USDT_POLYGON |
| 1 | 3 | 1 | +3.83 | USDT_POLYGON |
| 2 | 3 | 1 | +3.83 | USDT_POLYGON |
| 3 | 1 | 0 | +1.49 | USDT_POLYGON |
| 5 | 1 | 0 | +1.49 | USDT_POLYGON |
| 10 | 1 | 0 | +4.22 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 98% | 0% |
| 2 | 97% | 0% |
| 3 | 97% | 0% |
| 5 | 93% | 0% |
| 10 | 4% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 13/10 23h | 15 | +7.62 | -9.50 | -1.83 |
| 14/10 00h | 22 | +7.78 | -9.40 | -1.62 |
| 14/10 01h | 8 | +8.42 | -9.60 | -1.19 |
| 14/10 02h | 29 | +8.10 | -10.00 | -1.85 |
| 14/10 04h | 30 | +9.08 | -10.70 | -1.63 |
| 14/10 05h | 31 | +9.03 | -10.40 | -1.38 |
| 14/10 06h | 11 | +9.13 | -10.20 | -0.99 |
| 14/10 07h | 17 | +8.31 | -10.00 | -1.71 |
| 14/10 08h | 23 | +7.85 | -9.70 | -1.65 |
| 14/10 09h | 23 | +7.62 | -9.61 | -2.29 |
| 14/10 10h | 17 | +8.36 | -10.21 | -2.22 |
| 14/10 11h | 29 | +8.73 | -10.71 | -1.21 |
| 14/10 12h | 16 | +9.46 | -11.15 | -1.64 |
| 14/10 13h | 24 | +8.08 | -9.65 | -1.56 |
| 14/10 14h | 23 | +8.92 | -10.00 | -1.28 |
| 14/10 15h | 12 | +9.83 | -10.66 | -0.98 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 182 | +8.17 | +9.82 | 0.004 | 1080s |
| A2B | lifiIntents | 120 | +8.94 | +10.15 | 0.003 | 7s |
| A2B | layerswap | 17 | +5.39 | +21.14 | 0.003 | 26s |
| A2B | near | 16 | +5.51 | +8.12 | 0.003 | 714s |
| A2B | relaydepository | 8 | +13.01 | +21.02 | 0.003 | 2s |
| A2B | mayan | 1 | -6.15 | -6.15 | 0.007 | 3s |
| B2A | across | 312 | -9.96 | -8.73 | 0.009 | 4s |
| B2A | relaydepository | 8 | -11.94 | -2.20 | 0.008 | 2s |
| B2A | lifiIntents | 5 | -9.88 | -9.65 | 0.010 | 7s |
| B2A | layerswap | 4 | -12.65 | +2.46 | 0.009 | 15s |
| B2A | near | 1 | -12.78 | -12.78 | 0.009 | 37s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.62 bps (~US$ -0.32) e foi positiva em apenas 12 de 330 ciclos (3.6%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: +11.74 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 16x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 16x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 16x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 8x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
- 6x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
