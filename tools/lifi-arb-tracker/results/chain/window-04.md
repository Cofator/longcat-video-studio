# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 14/10 12:34 ate 14/10 13:48 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (31), `Relayer gas fee` (31), `Network Gas` (25), `Execution Gas` (25), `Service Fee` (25), `Relayer Gas fee` (11), `Relayer Service fee` (11), `LayerSwap fee` (2), `NearIntents Protocol Fee` (2)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -24.47 | -19.06 | -16.92 | -15.25 | -4.04 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -38.30 | -36.55 | -34.83 | -34.44 | -27.19 | 0% |
| Ida, liquido de gas (bps) | 37 | -24.48 | -19.08 | -16.94 | -15.27 | -4.05 | 0% |
| Volta, liquido de gas (bps) | 37 | -38.33 | -36.59 | -34.88 | -34.48 | -27.23 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -58.98 | -54.55 | -51.48 | -47.27 | -38.56 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -59.04 | -54.62 | -51.54 | -47.32 | -38.62 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +0.54 | +5.95 | +8.10 | +9.78 | +21.02 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -13.33 | -11.58 | -9.86 | -9.46 | -2.20 | 0% |
| Ida, liquido de gas (bps) | 37 | +0.52 | +5.94 | +8.08 | +9.76 | +21.00 | 100% |
| Volta, liquido de gas (bps) | 37 | -13.37 | -11.62 | -9.90 | -9.50 | -2.24 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -9.09 | -4.64 | -1.55 | +2.68 | +11.44 | 14% |
| **Ida+volta, liquido de gas** (bps) | 37 | -9.15 | -4.70 | -1.61 | +2.63 | +11.38 | 14% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.29 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.29 | USDT_POLYGON |
| 1 | 1 | 0 | +1.29 | USDT_POLYGON |
| 2 | 1 | 0 | +1.29 | USDT_POLYGON |
| 3 | 1 | 0 | +1.29 | USDT_POLYGON |
| 5 | 1 | 0 | +1.29 | USDT_POLYGON |
| 10 | 1 | 0 | +2.95 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 95% | 0% |
| 2 | 95% | 0% |
| 3 | 95% | 0% |
| 5 | 95% | 0% |
| 10 | 8% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 14/10 12h | 13 | +9.67 | -11.30 | -1.64 |
| 14/10 13h | 24 | +8.08 | -9.65 | -1.56 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 24 | +8.10 | +9.82 | 0.004 | 1080s |
| A2B | relaydepository | 5 | +14.77 | +21.02 | 0.003 | 2s |
| A2B | lifiIntents | 5 | +8.54 | +8.84 | 0.003 | 7s |
| A2B | layerswap | 2 | +5.83 | +6.45 | 0.003 | 26s |
| A2B | near | 2 | +6.34 | +7.56 | 0.003 | 939s |
| B2A | across | 31 | -9.76 | -9.36 | 0.009 | 4s |
| B2A | relaydepository | 6 | -11.92 | -2.20 | 0.008 | 2s |

## Veredito

**Nao vale.** Mesmo sem a taxa da LI.FI, a ida+volta deu mediana de -1.61 bps (~US$ -0.32), positiva em so 14% dos ciclos, e nenhuma estrategia de espera foi lucrativa.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
