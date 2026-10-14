# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:30 ate 14/10 07:29 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 304 | erros: 28 | ciclos completos (ida+volta): 150

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 304/304 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (304).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (304), `Relayer fee` (149), `Relayer gas fee` (149), `Network Gas` (87), `Execution Gas` (87), `Service Fee` (87), `NearIntents Protocol Fee` (7), `1ClickSwap API Fee` (7), `NearIntents App Fee` (7), `LayerSwap fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 150 | -21.19 | -17.34 | -16.68 | -15.78 | -15.38 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 150 | -35.73 | -35.63 | -35.03 | -34.34 | -22.55 | 0% |
| Ida, liquido de gas (bps) | 150 | -21.20 | -17.36 | -16.70 | -15.79 | -15.40 | 0% |
| Volta, liquido de gas (bps) | 150 | -35.78 | -35.67 | -35.08 | -34.38 | -22.60 | 0% |
| **Ida+volta simultanea** (bps) | 150 | -56.05 | -52.00 | -51.47 | -50.96 | -38.20 | 0% |
| **Ida+volta, liquido de gas** (bps) | 150 | -56.10 | -52.06 | -51.53 | -51.02 | -38.26 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 150 | +3.82 | +7.68 | +8.34 | +9.25 | +9.64 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 150 | -10.76 | -10.66 | -10.06 | -9.36 | +2.46 | 1% |
| Ida, liquido de gas (bps) | 150 | +3.81 | +7.66 | +8.33 | +9.23 | +9.63 | 100% |
| Volta, liquido de gas (bps) | 150 | -10.81 | -10.70 | -10.10 | -9.40 | +2.41 | 1% |
| **Ida+volta simultanea** (bps) | 150 | -6.14 | -2.08 | -1.54 | -1.02 | +11.80 | 1% |
| **Ida+volta, liquido de gas** (bps) | 150 | -6.20 | -2.14 | -1.60 | -1.08 | +11.74 | 1% |

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
| 1 | 100% | 1% |
| 2 | 100% | 1% |
| 3 | 100% | 0% |
| 5 | 99% | 0% |
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
| 14/10 07h | 4 | +8.30 | -10.00 | -1.68 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 86 | +8.09 | +9.26 | 0.004 | 1080s |
| A2B | lifiIntents | 61 | +8.55 | +9.64 | 0.003 | 7s |
| A2B | near | 7 | +6.03 | +8.12 | 0.003 | 296s |
| B2A | across | 149 | -10.06 | -8.73 | 0.009 | 4s |
| B2A | layerswap | 1 | +2.46 | +2.46 | 0.010 | 15s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -1.60 bps (~US$ -0.32), positiva em 1% dos ciclos. Mas executando cada perna so quando paga >= 0 bps, a simulacao fez 3 operacoes e US$ +3.83 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 6x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
- 3x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
- 1x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
