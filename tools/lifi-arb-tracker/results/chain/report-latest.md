# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:30 ate 15/10 14:55 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 1727 | erros: 167 | ciclos completos (ida+volta): 849

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 1727/1727 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (1727).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (1727), `Relayer fee` (774), `Relayer gas fee` (774), `Network Gas` (518), `Execution Gas` (518), `Service Fee` (518), `Relayer Gas fee` (131), `Relayer Service fee` (131), `LayerSwap fee` (28), `NearIntents Protocol Fee` (20)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 849 | -31.14 | -18.46 | -15.40 | -13.28 | +105.92 | 2% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 849 | -46.42 | -38.02 | -36.23 | -34.44 | +70.00 | 1% |
| Ida, liquido de gas (bps) | 849 | -31.17 | -18.48 | -15.42 | -13.30 | +105.91 | 2% |
| Volta, liquido de gas (bps) | 849 | -46.46 | -38.06 | -36.28 | -34.48 | +69.96 | 1% |
| **Ida+volta simultanea** (bps) | 849 | -66.02 | -54.11 | -51.42 | -50.65 | +68.11 | 2% |
| **Ida+volta, liquido de gas** (bps) | 849 | -66.08 | -54.16 | -51.48 | -50.72 | +68.04 | 2% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 849 | -6.15 | +6.55 | +9.63 | +11.75 | +131.25 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 849 | -21.47 | -13.05 | -11.26 | -9.46 | +95.24 | 2% |
| Ida, liquido de gas (bps) | 849 | -6.19 | +6.54 | +9.61 | +11.73 | +131.24 | 100% |
| Volta, liquido de gas (bps) | 849 | -21.52 | -13.09 | -11.31 | -9.51 | +95.19 | 2% |
| **Ida+volta simultanea** (bps) | 849 | -16.16 | -4.19 | -1.49 | -0.72 | +118.64 | 6% |
| **Ida+volta, liquido de gas** (bps) | 849 | -16.22 | -4.25 | -1.55 | -0.78 | +118.57 | 6% |

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
| 5 | 92% | 2% |
| 10 | 44% | 2% |

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

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 513 | +9.77 | +52.62 | 0.004 | 1080s |
| A2B | lifiIntents | 254 | +10.04 | +12.36 | 0.004 | 7s |
| A2B | relaydepository | 69 | +3.52 | +131.25 | 0.003 | 2s |
| A2B | layerswap | 21 | +5.50 | +21.14 | 0.003 | 23s |
| A2B | near | 19 | +5.90 | +10.58 | 0.003 | 796s |
| A2B | mayan | 1 | -6.15 | -6.15 | 0.007 | 3s |
| A2B | across | 1 | +7.28 | +7.28 | 0.008 | 1s |
| B2A | across | 773 | -11.26 | -8.73 | 0.009 | 4s |
| B2A | relaydepository | 62 | -13.31 | +95.24 | 0.008 | 2s |
| B2A | layerswap | 7 | -9.10 | +2.46 | 0.010 | 22s |
| B2A | lifiIntents | 6 | -11.32 | -9.65 | 0.010 | 7s |
| B2A | near | 1 | -12.78 | -12.78 | 0.009 | 37s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -1.55 bps (~US$ -0.31), positiva em 6% dos ciclos. Mas executando cada perna so quando paga >= 0 bps, a simulacao fez 35 operacoes e US$ +204.36 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 40x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 40x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 40x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 20x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
- 7x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
- 4x `HTTP 429: {"message":"Rate limit exceeded, retry in 41 minutes","code":1005}`
- 4x `HTTP 429: {"message":"Rate limit exceeded, retry in 35 minutes","code":1005}`
