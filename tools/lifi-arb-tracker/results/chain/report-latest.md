# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:30 ate 14/10 13:48 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 601 | erros: 59 | ciclos completos (ida+volta): 295

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 601/601 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (601).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (601), `Relayer fee` (280), `Relayer gas fee` (280), `Network Gas` (175), `Execution Gas` (175), `Service Fee` (175), `LayerSwap fee` (18), `NearIntents Protocol Fee` (17), `1ClickSwap API Fee` (17), `NearIntents App Fee` (17)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 295 | -31.14 | -19.24 | -16.72 | -15.68 | -3.92 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 295 | -38.30 | -35.69 | -34.93 | -34.34 | -22.55 | 0% |
| Ida, liquido de gas (bps) | 295 | -31.17 | -19.26 | -16.74 | -15.70 | -3.93 | 0% |
| Volta, liquido de gas (bps) | 295 | -38.33 | -35.74 | -34.98 | -34.38 | -22.60 | 0% |
| **Ida+volta simultanea** (bps) | 295 | -65.56 | -54.33 | -51.52 | -50.86 | -38.20 | 0% |
| **Ida+volta, liquido de gas** (bps) | 295 | -65.65 | -54.40 | -51.58 | -50.92 | -38.26 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 295 | -6.15 | +5.77 | +8.30 | +9.34 | +21.14 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 295 | -13.33 | -10.72 | -9.96 | -9.36 | +2.46 | 0% |
| Ida, liquido de gas (bps) | 295 | -6.19 | +5.75 | +8.28 | +9.33 | +21.12 | 100% |
| Volta, liquido de gas (bps) | 295 | -13.37 | -10.76 | -10.00 | -9.40 | +2.41 | 0% |
| **Ida+volta simultanea** (bps) | 295 | -15.71 | -4.42 | -1.59 | -0.92 | +11.80 | 3% |
| **Ida+volta, liquido de gas** (bps) | 295 | -15.79 | -4.48 | -1.65 | -0.98 | +11.74 | 3% |

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
| 10 | 3% | 0% |

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

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 173 | +8.16 | +9.82 | 0.004 | 1080s |
| A2B | lifiIntents | 95 | +8.64 | +10.05 | 0.003 | 7s |
| A2B | near | 16 | +5.51 | +8.12 | 0.003 | 714s |
| A2B | layerswap | 16 | +5.39 | +21.14 | 0.003 | 26s |
| A2B | relaydepository | 5 | +14.77 | +21.02 | 0.003 | 2s |
| A2B | mayan | 1 | -6.15 | -6.15 | 0.007 | 3s |
| B2A | across | 280 | -9.96 | -8.73 | 0.009 | 4s |
| B2A | relaydepository | 7 | -11.92 | -2.20 | 0.008 | 2s |
| B2A | lifiIntents | 5 | -9.88 | -9.65 | 0.010 | 7s |
| B2A | layerswap | 2 | -3.04 | +2.46 | 0.010 | 15s |
| B2A | near | 1 | -12.78 | -12.78 | 0.009 | 37s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.65 bps (~US$ -0.33) e foi positiva em apenas 10 de 295 ciclos (3.4%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: +11.74 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 14x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 14x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 14x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 7x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
- 4x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
