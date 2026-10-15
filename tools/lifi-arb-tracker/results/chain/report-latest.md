# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:30 ate 15/10 20:02 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 1976 | erros: 186 | ciclos completos (ida+volta): 972

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 1976/1976 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (1976).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (1976), `Relayer fee` (896), `Relayer gas fee` (896), `Network Gas` (583), `Execution Gas` (583), `Service Fee` (583), `Relayer Gas fee` (132), `Relayer Service fee` (132), `LayerSwap fee` (31), `NearIntents Protocol Fee` (20)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 972 | -31.14 | -17.55 | -15.78 | -13.38 | +105.92 | 1% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 972 | -46.42 | -37.92 | -35.93 | -34.53 | +70.00 | 1% |
| Ida, liquido de gas (bps) | 972 | -31.17 | -17.57 | -15.80 | -13.40 | +105.91 | 1% |
| Volta, liquido de gas (bps) | 972 | -46.46 | -37.96 | -35.98 | -34.58 | +69.96 | 1% |
| **Ida+volta simultanea** (bps) | 972 | -66.02 | -53.83 | -51.45 | -50.75 | +68.11 | 2% |
| **Ida+volta, liquido de gas** (bps) | 972 | -66.08 | -53.89 | -51.51 | -50.81 | +68.04 | 2% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 972 | -6.15 | +7.46 | +9.24 | +11.65 | +131.25 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 972 | -21.47 | -12.95 | -10.96 | -9.56 | +95.24 | 2% |
| Ida, liquido de gas (bps) | 972 | -6.19 | +7.45 | +9.23 | +11.63 | +131.24 | 100% |
| Volta, liquido de gas (bps) | 972 | -21.52 | -12.99 | -11.00 | -9.60 | +95.19 | 2% |
| **Ida+volta simultanea** (bps) | 972 | -16.16 | -3.91 | -1.52 | -0.82 | +118.64 | 5% |
| **Ida+volta, liquido de gas** (bps) | 972 | -16.22 | -3.97 | -1.58 | -0.88 | +118.57 | 5% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 35 | 17 | +204.36 | USDT_POLYGON |
| 0.5 | 33 | 16 | +203.79 | USDT_POLYGON |
| 1 | 33 | 16 | +203.79 | USDT_POLYGON |
| 2 | 33 | 16 | +203.79 | USDT_POLYGON |
| 3 | 31 | 15 | +201.44 | USDT_POLYGON |
| 5 | 29 | 14 | +200.04 | USDT_POLYGON |
| 10 | 27 | 13 | +199.76 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 2% |
| 0.5 | 100% | 2% |
| 1 | 99% | 2% |
| 2 | 98% | 2% |
| 3 | 96% | 2% |
| 5 | 93% | 1% |
| 10 | 39% | 1% |

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
| 14/10 22h | 17 | +11.23 | -12.40 | -1.18 |
| 14/10 23h | 24 | +11.43 | -12.87 | -1.47 |
| 15/10 00h | 23 | +12.26 | -13.49 | -1.35 |
| 15/10 01h | 17 | +11.30 | -12.70 | -1.41 |
| 15/10 02h | 30 | +10.90 | -12.39 | -1.54 |
| 15/10 03h | 16 | +10.94 | -12.39 | -1.53 |
| 15/10 04h | 25 | +10.69 | -12.49 | -1.88 |
| 15/10 05h | 22 | +11.70 | -13.09 | -1.45 |
| 15/10 06h | 17 | +11.43 | -13.09 | -1.61 |
| 15/10 07h | 30 | +10.56 | -12.05 | -1.46 |
| 15/10 08h | 17 | +10.74 | -12.19 | -1.43 |
| 15/10 09h | 25 | +10.68 | -12.29 | -1.63 |
| 15/10 10h | 22 | +10.06 | -11.70 | -1.93 |
| 15/10 11h | 17 | +10.22 | -11.60 | -1.45 |
| 15/10 12h | 30 | +9.39 | -10.71 | -1.57 |
| 15/10 13h | 17 | +8.29 | -10.10 | -1.71 |
| 15/10 14h | 27 | +9.03 | -10.60 | -1.60 |
| 15/10 15h | 20 | +9.22 | -10.80 | -1.65 |
| 15/10 16h | 17 | +8.82 | -10.20 | -1.39 |
| 15/10 17h | 30 | +8.90 | -11.00 | -2.02 |
| 15/10 18h | 25 | +9.05 | -10.70 | -1.68 |
| 15/10 19h | 30 | +9.02 | -10.68 | -1.67 |
| 15/10 20h | 1 | +9.02 | -10.70 | -1.69 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 578 | +9.45 | +52.62 | 0.004 | 1080s |
| A2B | lifiIntents | 311 | +9.33 | +12.36 | 0.004 | 7s |
| A2B | relaydepository | 70 | +3.45 | +131.25 | 0.003 | 2s |
| A2B | layerswap | 24 | +5.65 | +21.14 | 0.003 | 21s |
| A2B | near | 19 | +5.90 | +10.58 | 0.003 | 796s |
| A2B | mayan | 1 | -6.15 | -6.15 | 0.007 | 3s |
| A2B | across | 1 | +7.28 | +7.28 | 0.008 | 1s |
| B2A | across | 895 | -10.96 | -8.73 | 0.009 | 4s |
| B2A | relaydepository | 62 | -13.31 | +95.24 | 0.008 | 2s |
| B2A | layerswap | 7 | -9.10 | +2.46 | 0.010 | 22s |
| B2A | lifiIntents | 6 | -11.32 | -9.65 | 0.010 | 7s |
| B2A | near | 1 | -12.78 | -12.78 | 0.009 | 37s |
| B2A | celercirclefast | 1 | -10.35 | -10.35 | 0.025 | 324s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -1.58 bps (~US$ -0.32), positiva em 5% dos ciclos. Mas executando cada perna so quando paga >= 0 bps, a simulacao fez 35 operacoes e US$ +204.36 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 44x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 44x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 44x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 22x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
- 7x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
- 4x `HTTP 429: {"message":"Rate limit exceeded, retry in 41 minutes","code":1005}`
- 4x `HTTP 429: {"message":"Rate limit exceeded, retry in 35 minutes","code":1005}`
