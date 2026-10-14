# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:30 ate 14/10 18:49 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 823 | erros: 83 | ciclos completos (ida+volta): 403

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 823/823 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (823).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (823), `Relayer fee` (363), `Relayer gas fee` (363), `Network Gas` (209), `Execution Gas` (209), `Service Fee` (209), `Relayer Gas fee` (61), `Relayer Service fee` (61), `LayerSwap fee` (21), `NearIntents Protocol Fee` (19)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 403 | -31.14 | -19.33 | -16.58 | -14.58 | +32.58 | 1% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 403 | -42.84 | -36.61 | -35.13 | -34.34 | +46.29 | 0% |
| Ida, liquido de gas (bps) | 403 | -31.17 | -19.35 | -16.59 | -14.60 | +32.56 | 1% |
| Volta, liquido de gas (bps) | 403 | -42.89 | -36.66 | -35.17 | -34.38 | +46.24 | 0% |
| **Ida+volta simultanea** (bps) | 403 | -66.02 | -54.43 | -51.48 | -50.57 | +32.04 | 1% |
| **Ida+volta, liquido de gas** (bps) | 403 | -66.08 | -54.50 | -51.54 | -50.63 | +31.98 | 1% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 403 | -6.15 | +5.69 | +8.44 | +10.44 | +57.72 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 403 | -17.89 | -11.63 | -10.16 | -9.36 | +71.47 | 1% |
| Ida, liquido de gas (bps) | 403 | -6.19 | +5.67 | +8.43 | +10.42 | +57.71 | 100% |
| Volta, liquido de gas (bps) | 403 | -17.93 | -11.68 | -10.20 | -9.40 | +71.42 | 1% |
| **Ida+volta simultanea** (bps) | 403 | -16.16 | -4.52 | -1.55 | -0.63 | +82.39 | 6% |
| **Ida+volta, liquido de gas** (bps) | 403 | -16.22 | -4.58 | -1.61 | -0.70 | +82.33 | 6% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 13 | 6 | +38.89 | USDT_POLYGON |
| 0.5 | 11 | 5 | +38.32 | USDT_POLYGON |
| 1 | 11 | 5 | +38.32 | USDT_POLYGON |
| 2 | 11 | 5 | +38.32 | USDT_POLYGON |
| 3 | 9 | 4 | +35.97 | USDT_POLYGON |
| 5 | 9 | 4 | +35.97 | USDT_POLYGON |
| 10 | 7 | 3 | +35.70 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 1% |
| 0.5 | 100% | 1% |
| 1 | 99% | 1% |
| 2 | 97% | 1% |
| 3 | 95% | 1% |
| 5 | 92% | 1% |
| 10 | 12% | 1% |

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

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 207 | +8.34 | +10.49 | 0.004 | 1080s |
| A2B | lifiIntents | 146 | +9.09 | +11.85 | 0.003 | 7s |
| A2B | relaydepository | 31 | +8.16 | +57.72 | 0.003 | 2s |
| A2B | near | 18 | +5.51 | +8.91 | 0.003 | 838s |
| A2B | layerswap | 17 | +5.39 | +21.14 | 0.003 | 26s |
| A2B | mayan | 1 | -6.15 | -6.15 | 0.007 | 3s |
| B2A | across | 363 | -10.06 | -8.73 | 0.009 | 4s |
| B2A | relaydepository | 30 | -13.12 | +71.47 | 0.008 | 2s |
| B2A | lifiIntents | 5 | -9.88 | -9.65 | 0.010 | 7s |
| B2A | layerswap | 4 | -12.65 | +2.46 | 0.009 | 15s |
| B2A | near | 1 | -12.78 | -12.78 | 0.009 | 37s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -1.61 bps (~US$ -0.32), positiva em 6% dos ciclos. Mas executando cada perna so quando paga >= 0 bps, a simulacao fez 13 operacoes e US$ +38.89 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 20x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 20x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 20x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 10x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
- 7x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
