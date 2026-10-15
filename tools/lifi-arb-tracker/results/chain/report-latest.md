# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:30 ate 14/10 22:09 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 973 | erros: 97 | ciclos completos (ida+volta): 477

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 973/973 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (973).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (973), `Relayer fee` (416), `Relayer gas fee` (416), `Network Gas` (209), `Execution Gas` (209), `Service Fee` (209), `Relayer Gas fee` (99), `Relayer Service fee` (99), `LayerSwap fee` (21), `NearIntents Protocol Fee` (19)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 477 | -31.14 | -19.70 | -16.26 | -13.38 | +75.04 | 2% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 477 | -42.84 | -37.66 | -35.23 | -34.34 | +54.64 | 1% |
| Ida, liquido de gas (bps) | 477 | -31.17 | -19.72 | -16.28 | -13.40 | +75.02 | 2% |
| Volta, liquido de gas (bps) | 477 | -42.89 | -37.70 | -35.28 | -34.38 | +54.60 | 1% |
| **Ida+volta simultanea** (bps) | 477 | -66.02 | -54.79 | -51.45 | -50.46 | +41.39 | 1% |
| **Ida+volta, liquido de gas** (bps) | 477 | -66.08 | -54.87 | -51.51 | -50.52 | +41.34 | 1% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 477 | -6.15 | +5.31 | +8.76 | +11.65 | +100.29 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 477 | -17.89 | -12.69 | -10.26 | -9.36 | +79.84 | 3% |
| Ida, liquido de gas (bps) | 477 | -6.19 | +5.29 | +8.74 | +11.63 | +100.27 | 100% |
| Volta, liquido de gas (bps) | 477 | -17.93 | -12.74 | -10.31 | -9.41 | +79.80 | 3% |
| **Ida+volta simultanea** (bps) | 477 | -16.16 | -4.88 | -1.52 | -0.52 | +91.79 | 8% |
| **Ida+volta, liquido de gas** (bps) | 477 | -16.22 | -4.95 | -1.58 | -0.58 | +91.73 | 8% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 25 | 12 | +110.85 | USDT_POLYGON |
| 0.5 | 23 | 11 | +110.29 | USDT_POLYGON |
| 1 | 23 | 11 | +110.29 | USDT_POLYGON |
| 2 | 23 | 11 | +110.29 | USDT_POLYGON |
| 3 | 21 | 10 | +107.94 | USDT_POLYGON |
| 5 | 19 | 9 | +106.53 | USDT_POLYGON |
| 10 | 17 | 8 | +106.25 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 3% |
| 0.5 | 100% | 2% |
| 1 | 99% | 2% |
| 2 | 97% | 2% |
| 3 | 95% | 2% |
| 5 | 91% | 2% |
| 10 | 23% | 2% |

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
| 14/10 20h | 17 | +11.73 | -12.69 | -0.88 |
| 14/10 21h | 30 | +11.43 | -12.40 | -0.93 |
| 14/10 22h | 4 | +11.33 | -12.61 | -1.24 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 207 | +8.34 | +10.49 | 0.004 | 1080s |
| A2B | lifiIntents | 205 | +9.44 | +11.95 | 0.003 | 7s |
| A2B | relaydepository | 48 | +3.68 | +100.29 | 0.003 | 2s |
| A2B | near | 18 | +5.51 | +8.91 | 0.003 | 838s |
| A2B | layerswap | 17 | +5.39 | +21.14 | 0.003 | 26s |
| A2B | mayan | 1 | -6.15 | -6.15 | 0.007 | 3s |
| B2A | across | 416 | -10.16 | -8.73 | 0.009 | 4s |
| B2A | relaydepository | 51 | -13.33 | +79.84 | 0.008 | 2s |
| B2A | lifiIntents | 5 | -9.88 | -9.65 | 0.010 | 7s |
| B2A | layerswap | 4 | -12.65 | +2.46 | 0.009 | 15s |
| B2A | near | 1 | -12.78 | -12.78 | 0.009 | 37s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -1.58 bps (~US$ -0.32), positiva em 8% dos ciclos. Mas executando cada perna so quando paga >= 0 bps, a simulacao fez 25 operacoes e US$ +110.85 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 24x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 24x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 24x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 12x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
- 7x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
