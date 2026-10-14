# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:30 ate 14/10 17:08 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 749 | erros: 75 | ciclos completos (ida+volta): 367

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 749/749 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (749).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (749), `Relayer fee` (336), `Relayer gas fee` (336), `Network Gas` (206), `Execution Gas` (206), `Service Fee` (206), `Relayer Gas fee` (42), `Relayer Service fee` (42), `LayerSwap fee` (21), `NearIntents Protocol Fee` (19)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 367 | -31.14 | -19.32 | -16.64 | -15.27 | +1.72 | 1% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 367 | -42.84 | -36.17 | -35.03 | -34.34 | -19.86 | 0% |
| Ida, liquido de gas (bps) | 367 | -31.17 | -19.34 | -16.66 | -15.29 | +1.70 | 1% |
| Volta, liquido de gas (bps) | 367 | -42.89 | -36.21 | -35.08 | -34.38 | -19.90 | 0% |
| **Ida+volta simultanea** (bps) | 367 | -66.02 | -54.42 | -51.49 | -50.76 | -27.64 | 0% |
| **Ida+volta, liquido de gas** (bps) | 367 | -66.08 | -54.49 | -51.56 | -50.82 | -27.69 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 367 | -6.15 | +5.70 | +8.38 | +9.76 | +26.78 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 367 | -17.89 | -11.20 | -10.06 | -9.36 | +5.15 | 1% |
| Ida, liquido de gas (bps) | 367 | -6.19 | +5.68 | +8.36 | +9.74 | +26.77 | 100% |
| Volta, liquido de gas (bps) | 367 | -17.93 | -11.24 | -10.10 | -9.40 | +5.12 | 1% |
| **Ida+volta simultanea** (bps) | 367 | -16.16 | -4.50 | -1.56 | -0.82 | +22.41 | 5% |
| **Ida+volta, liquido de gas** (bps) | 367 | -16.22 | -4.57 | -1.63 | -0.88 | +22.36 | 5% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 7 | 3 | +7.41 | USDT_POLYGON |
| 0.5 | 5 | 2 | +6.85 | USDT_POLYGON |
| 1 | 5 | 2 | +6.85 | USDT_POLYGON |
| 2 | 5 | 2 | +6.85 | USDT_POLYGON |
| 3 | 3 | 1 | +4.50 | USDT_POLYGON |
| 5 | 3 | 1 | +4.50 | USDT_POLYGON |
| 10 | 1 | 0 | +4.22 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 1% |
| 0.5 | 100% | 1% |
| 1 | 98% | 1% |
| 2 | 97% | 1% |
| 3 | 96% | 0% |
| 5 | 92% | 0% |
| 10 | 6% | 0% |

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
| 14/10 15h | 15 | +9.73 | -10.71 | -1.12 |
| 14/10 16h | 30 | +9.73 | -11.20 | -1.64 |
| 14/10 17h | 4 | +9.97 | -11.65 | -1.60 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 204 | +8.33 | +10.49 | 0.004 | 1080s |
| A2B | lifiIntents | 121 | +8.94 | +10.15 | 0.003 | 7s |
| A2B | relaydepository | 21 | +8.16 | +26.78 | 0.003 | 2s |
| A2B | near | 18 | +5.51 | +8.91 | 0.003 | 838s |
| A2B | layerswap | 17 | +5.39 | +21.14 | 0.003 | 26s |
| A2B | mayan | 1 | -6.15 | -6.15 | 0.007 | 3s |
| B2A | across | 336 | -10.06 | -8.73 | 0.009 | 4s |
| B2A | relaydepository | 21 | -13.08 | +5.15 | 0.008 | 2s |
| B2A | lifiIntents | 5 | -9.88 | -9.65 | 0.010 | 7s |
| B2A | layerswap | 4 | -12.65 | +2.46 | 0.009 | 15s |
| B2A | near | 1 | -12.78 | -12.78 | 0.009 | 37s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.63 bps (~US$ -0.33) e foi positiva em apenas 18 de 367 ciclos (4.9%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: +22.36 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 18x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 18x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 18x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 9x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
- 6x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
