# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:30 ate 14/10 08:48 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 378 | erros: 36 | ciclos completos (ida+volta): 186

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 378/378 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (378).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (378), `Relayer fee` (185), `Relayer gas fee` (185), `Network Gas` (116), `Execution Gas` (116), `Service Fee` (116), `NearIntents Protocol Fee` (10), `1ClickSwap API Fee` (10), `NearIntents App Fee` (10), `LayerSwap fee` (4)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 186 | -24.16 | -17.54 | -16.70 | -15.78 | -15.38 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 186 | -35.73 | -35.63 | -34.93 | -34.34 | -22.55 | 0% |
| Ida, liquido de gas (bps) | 186 | -24.17 | -17.56 | -16.72 | -15.79 | -15.40 | 0% |
| Volta, liquido de gas (bps) | 186 | -35.78 | -35.67 | -34.98 | -34.38 | -22.60 | 0% |
| **Ida+volta simultanea** (bps) | 186 | -59.00 | -52.09 | -51.49 | -51.01 | -38.20 | 0% |
| **Ida+volta, liquido de gas** (bps) | 186 | -59.07 | -52.15 | -51.55 | -51.07 | -38.26 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 186 | +0.85 | +7.48 | +8.32 | +9.24 | +9.64 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 186 | -10.76 | -10.66 | -9.96 | -9.36 | +2.46 | 1% |
| Ida, liquido de gas (bps) | 186 | +0.83 | +7.46 | +8.30 | +9.23 | +9.63 | 100% |
| Volta, liquido de gas (bps) | 186 | -10.81 | -10.70 | -10.00 | -9.40 | +2.41 | 1% |
| **Ida+volta simultanea** (bps) | 186 | -9.11 | -2.16 | -1.56 | -1.08 | +11.80 | 1% |
| **Ida+volta, liquido de gas** (bps) | 186 | -9.17 | -2.22 | -1.62 | -1.14 | +11.74 | 1% |

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
| 10 | 0 | 0 | +0.00 | USDC_BASE |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 1% |
| 0.5 | 100% | 1% |
| 1 | 99% | 1% |
| 2 | 99% | 1% |
| 3 | 98% | 0% |
| 5 | 96% | 0% |
| 10 | 0% | 0% |

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

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 115 | +8.30 | +9.26 | 0.004 | 1080s |
| A2B | lifiIntents | 64 | +8.54 | +9.64 | 0.003 | 7s |
| A2B | near | 10 | +5.96 | +8.12 | 0.003 | 399s |
| A2B | layerswap | 3 | +4.87 | +4.87 | 0.003 | 25s |
| B2A | across | 185 | -9.96 | -8.73 | 0.009 | 4s |
| B2A | layerswap | 1 | +2.46 | +2.46 | 0.010 | 15s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -1.62 bps (~US$ -0.32), positiva em 1% dos ciclos. Mas executando cada perna so quando paga >= 0 bps, a simulacao fez 3 operacoes e US$ +3.83 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 8x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 8x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 8x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
- 4x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
- 2x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
