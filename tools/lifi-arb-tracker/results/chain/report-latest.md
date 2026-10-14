# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:30 ate 14/10 10:28 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 453 | erros: 43 | ciclos completos (ida+volta): 223

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 453/453 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (453).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (453), `Relayer fee` (220), `Relayer gas fee` (220), `Network Gas` (135), `Execution Gas` (135), `Service Fee` (135), `NearIntents Protocol Fee` (14), `1ClickSwap API Fee` (14), `NearIntents App Fee` (14), `LayerSwap fee` (14)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 223 | -31.14 | -19.48 | -16.78 | -15.78 | -3.92 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 223 | -37.94 | -35.53 | -34.93 | -34.34 | -22.55 | 0% |
| Ida, liquido de gas (bps) | 223 | -31.17 | -19.50 | -16.80 | -15.80 | -3.93 | 0% |
| Volta, liquido de gas (bps) | 223 | -37.99 | -35.58 | -34.98 | -34.38 | -22.60 | 0% |
| **Ida+volta simultanea** (bps) | 223 | -65.56 | -54.23 | -51.55 | -51.07 | -38.20 | 0% |
| **Ida+volta, liquido de gas** (bps) | 223 | -65.65 | -54.29 | -51.61 | -51.13 | -38.26 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 223 | -6.15 | +5.54 | +8.24 | +9.24 | +21.14 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 223 | -12.97 | -10.56 | -9.96 | -9.36 | +2.46 | 0% |
| Ida, liquido de gas (bps) | 223 | -6.19 | +5.52 | +8.22 | +9.23 | +21.12 | 100% |
| Volta, liquido de gas (bps) | 223 | -13.02 | -10.61 | -10.00 | -9.40 | +2.41 | 0% |
| **Ida+volta simultanea** (bps) | 223 | -15.71 | -4.31 | -1.62 | -1.14 | +11.80 | 2% |
| **Ida+volta, liquido de gas** (bps) | 223 | -15.79 | -4.38 | -1.68 | -1.20 | +11.74 | 2% |

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
| 1 | 99% | 0% |
| 2 | 98% | 0% |
| 3 | 97% | 0% |
| 5 | 92% | 0% |
| 10 | 1% | 0% |

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
| 14/10 10h | 14 | +8.16 | -10.21 | -2.32 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 134 | +8.15 | +9.26 | 0.004 | 1080s |
| A2B | lifiIntents | 69 | +8.44 | +9.64 | 0.003 | 7s |
| A2B | near | 14 | +5.06 | +8.12 | 0.003 | 682s |
| A2B | layerswap | 12 | +5.24 | +21.14 | 0.003 | 26s |
| A2B | mayan | 1 | -6.15 | -6.15 | 0.007 | 3s |
| B2A | across | 220 | -9.96 | -8.73 | 0.009 | 4s |
| B2A | layerswap | 2 | -3.04 | +2.46 | 0.010 | 15s |
| B2A | lifiIntents | 1 | -12.97 | -12.97 | 0.011 | 7s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.68 bps (~US$ -0.34) e foi positiva em apenas 4 de 223 ciclos (1.8%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: +11.74 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 10x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 10x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 10x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
- 5x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
- 2x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
