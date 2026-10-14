# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:30 ate 14/10 20:29 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 898 | erros: 90 | ciclos completos (ida+volta): 440

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 898/898 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (898).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (898), `Relayer fee` (389), `Relayer gas fee` (389), `Network Gas` (209), `Execution Gas` (209), `Service Fee` (209), `Relayer Gas fee` (82), `Relayer Service fee` (82), `LayerSwap fee` (21), `NearIntents Protocol Fee` (19)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 440 | -31.14 | -19.62 | -16.38 | -13.67 | +32.58 | 1% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 440 | -42.84 | -37.62 | -35.13 | -34.34 | +54.64 | 1% |
| Ida, liquido de gas (bps) | 440 | -31.17 | -19.64 | -16.40 | -13.69 | +32.56 | 1% |
| Volta, liquido de gas (bps) | 440 | -42.89 | -37.66 | -35.18 | -34.38 | +54.60 | 1% |
| **Ida+volta simultanea** (bps) | 440 | -66.02 | -54.77 | -51.46 | -50.55 | +41.39 | 1% |
| **Ida+volta, liquido de gas** (bps) | 440 | -66.08 | -54.84 | -51.53 | -50.62 | +41.34 | 1% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 440 | -6.15 | +5.39 | +8.64 | +11.36 | +57.72 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 440 | -17.89 | -12.65 | -10.16 | -9.36 | +79.84 | 2% |
| Ida, liquido de gas (bps) | 440 | -6.19 | +5.37 | +8.63 | +11.34 | +57.71 | 100% |
| Volta, liquido de gas (bps) | 440 | -17.93 | -12.69 | -10.20 | -9.40 | +79.80 | 2% |
| **Ida+volta simultanea** (bps) | 440 | -16.16 | -4.85 | -1.53 | -0.62 | +91.79 | 7% |
| **Ida+volta, liquido de gas** (bps) | 440 | -16.22 | -4.93 | -1.60 | -0.68 | +91.73 | 7% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 21 | 10 | +69.03 | USDT_POLYGON |
| 0.5 | 19 | 9 | +68.46 | USDT_POLYGON |
| 1 | 19 | 9 | +68.46 | USDT_POLYGON |
| 2 | 19 | 9 | +68.46 | USDT_POLYGON |
| 3 | 17 | 8 | +66.12 | USDT_POLYGON |
| 5 | 15 | 7 | +64.71 | USDT_POLYGON |
| 10 | 13 | 6 | +64.43 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 2% |
| 0.5 | 100% | 2% |
| 1 | 99% | 2% |
| 2 | 97% | 2% |
| 3 | 95% | 2% |
| 5 | 91% | 2% |
| 10 | 18% | 1% |

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
| 14/10 17h | 17 | +9.98 | -11.50 | -1.61 |
| 14/10 18h | 23 | +11.23 | -12.20 | -0.99 |
| 14/10 19h | 23 | +11.43 | -12.89 | -1.18 |
| 14/10 20h | 14 | +11.73 | -12.69 | -0.93 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 207 | +8.34 | +10.49 | 0.004 | 1080s |
| A2B | lifiIntents | 174 | +9.24 | +11.95 | 0.003 | 7s |
| A2B | relaydepository | 41 | +8.00 | +57.72 | 0.003 | 2s |
| A2B | near | 18 | +5.51 | +8.91 | 0.003 | 838s |
| A2B | layerswap | 17 | +5.39 | +21.14 | 0.003 | 26s |
| A2B | mayan | 1 | -6.15 | -6.15 | 0.007 | 3s |
| B2A | across | 389 | -10.16 | -8.73 | 0.009 | 4s |
| B2A | relaydepository | 41 | -13.15 | +79.84 | 0.008 | 2s |
| B2A | lifiIntents | 5 | -9.88 | -9.65 | 0.010 | 7s |
| B2A | layerswap | 4 | -12.65 | +2.46 | 0.009 | 15s |
| B2A | near | 1 | -12.78 | -12.78 | 0.009 | 37s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -1.60 bps (~US$ -0.32), positiva em 7% dos ciclos. Mas executando cada perna so quando paga >= 0 bps, a simulacao fez 21 operacoes e US$ +69.03 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 22x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 22x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 22x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 11x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
- 7x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
