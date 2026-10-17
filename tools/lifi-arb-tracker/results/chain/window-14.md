# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 05:16 ate 15/10 06:30 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (36), `Relayer gas fee` (36), `Network Gas` (29), `Execution Gas` (29), `Service Fee` (29), `LayerSwap fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -14.09 | -13.86 | -13.38 | -13.15 | +27.49 | 5% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -46.42 | -38.16 | -38.02 | -37.78 | -37.62 | 0% |
| Ida, liquido de gas (bps) | 37 | -14.11 | -13.87 | -13.40 | -13.17 | +27.47 | 5% |
| Volta, liquido de gas (bps) | 37 | -46.46 | -38.20 | -38.06 | -37.82 | -37.67 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -51.83 | -51.77 | -51.35 | -50.94 | -10.94 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -51.89 | -51.83 | -51.40 | -51.00 | -10.99 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +10.94 | +11.17 | +11.65 | +11.88 | +52.62 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -21.47 | -13.19 | -13.05 | -12.81 | -12.65 | 0% |
| Ida, liquido de gas (bps) | 37 | +10.92 | +11.15 | +11.63 | +11.86 | +52.60 | 100% |
| Volta, liquido de gas (bps) | 37 | -21.52 | -13.23 | -13.09 | -12.85 | -12.70 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -1.90 | -1.84 | -1.42 | -1.01 | +39.20 | 5% |
| **Ida+volta, liquido de gas** (bps) | 37 | -1.97 | -1.90 | -1.47 | -1.07 | +39.14 | 5% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +2.18 | USDT_POLYGON |
| 0.5 | 1 | 0 | +2.18 | USDT_POLYGON |
| 1 | 1 | 0 | +2.18 | USDT_POLYGON |
| 2 | 1 | 0 | +2.18 | USDT_POLYGON |
| 3 | 1 | 0 | +2.18 | USDT_POLYGON |
| 5 | 1 | 0 | +2.18 | USDT_POLYGON |
| 10 | 1 | 0 | +2.18 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 100% | 0% |
| 3 | 100% | 0% |
| 5 | 100% | 0% |
| 10 | 100% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 05h | 22 | +11.70 | -13.09 | -1.45 |
| 15/10 06h | 15 | +11.63 | -13.09 | -1.48 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 29 | +11.64 | +52.62 | 0.004 | 1080s |
| A2B | lifiIntents | 9 | +11.65 | +11.75 | 0.003 | 7s |
| B2A | across | 36 | -13.05 | -12.65 | 0.008 | 4s |
| B2A | layerswap | 1 | -21.47 | -21.47 | 0.009 | 31s |

## Veredito

**Nao vale.** Mesmo sem a taxa da LI.FI, a ida+volta deu mediana de -1.47 bps (~US$ -0.29), positiva em so 5% dos ciclos, e nenhuma estrategia de espera foi lucrativa.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
