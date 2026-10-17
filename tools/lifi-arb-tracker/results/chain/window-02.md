# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 14/10 09:14 ate 14/10 10:28 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (35), `Relayer gas fee` (35), `Network Gas` (19), `Execution Gas` (19), `Service Fee` (19), `LayerSwap fee` (10), `NearIntents Protocol Fee` (4), `1ClickSwap API Fee` (4), `NearIntents App Fee` (4)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -31.14 | -22.13 | -17.35 | -16.60 | -3.92 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -37.94 | -35.33 | -34.83 | -34.44 | -33.51 | 0% |
| Ida, liquido de gas (bps) | 37 | -31.17 | -22.15 | -17.37 | -16.62 | -3.93 | 0% |
| Volta, liquido de gas (bps) | 37 | -37.99 | -35.38 | -34.88 | -34.49 | -33.56 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -65.56 | -57.51 | -52.15 | -51.49 | -38.34 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -65.65 | -57.57 | -52.22 | -51.56 | -38.41 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -6.15 | +2.88 | +7.67 | +8.42 | +21.14 | 97% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -12.97 | -10.36 | -9.86 | -9.47 | -8.53 | 0% |
| Ida, liquido de gas (bps) | 37 | -6.19 | +2.86 | +7.65 | +8.40 | +21.12 | 97% |
| Volta, liquido de gas (bps) | 37 | -13.02 | -10.41 | -9.91 | -9.52 | -8.58 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -15.71 | -7.61 | -2.22 | -1.56 | +11.66 | 5% |
| **Ida+volta, liquido de gas** (bps) | 37 | -15.79 | -7.67 | -2.29 | -1.63 | +11.59 | 5% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +4.22 | USDT_POLYGON |
| 0.5 | 1 | 0 | +4.22 | USDT_POLYGON |
| 1 | 1 | 0 | +4.22 | USDT_POLYGON |
| 2 | 1 | 0 | +4.22 | USDT_POLYGON |
| 3 | 1 | 0 | +4.22 | USDT_POLYGON |
| 5 | 1 | 0 | +4.22 | USDT_POLYGON |
| 10 | 1 | 0 | +4.22 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 97% | 0% |
| 0.5 | 97% | 0% |
| 1 | 95% | 0% |
| 2 | 92% | 0% |
| 3 | 89% | 0% |
| 5 | 73% | 0% |
| 10 | 5% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 14/10 09h | 23 | +7.62 | -9.61 | -2.29 |
| 14/10 10h | 14 | +8.16 | -10.21 | -2.32 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 19 | +8.06 | +8.45 | 0.004 | 1080s |
| A2B | layerswap | 9 | +5.39 | +21.14 | 0.003 | 26s |
| A2B | lifiIntents | 5 | +5.00 | +9.34 | 0.004 | 7s |
| A2B | near | 4 | +3.42 | +4.22 | 0.003 | 1390s |
| A2B | mayan | 1 | -6.15 | -6.15 | 0.007 | 3s |
| B2A | across | 35 | -9.86 | -9.27 | 0.010 | 4s |
| B2A | lifiIntents | 1 | -12.97 | -12.97 | 0.011 | 7s |
| B2A | layerswap | 1 | -8.53 | -8.53 | 0.010 | 15s |

## Veredito

**Nao vale.** Mesmo sem a taxa da LI.FI, a ida+volta deu mediana de -2.29 bps (~US$ -0.46), positiva em so 5% dos ciclos, e nenhuma estrategia de espera foi lucrativa.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
