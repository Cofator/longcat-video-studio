# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 01:55 ate 15/10 03:09 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (37), `Relayer gas fee` (37), `Network Gas` (34), `Execution Gas` (34), `Service Fee` (34), `Relayer Gas fee` (3), `Relayer Service fee` (3), `LayerSwap fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -21.68 | -15.70 | -14.11 | -13.89 | -13.69 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -37.62 | -37.56 | -37.32 | -37.22 | -36.92 | 0% |
| Ida, liquido de gas (bps) | 37 | -21.70 | -15.72 | -14.13 | -13.90 | -13.71 | 0% |
| Volta, liquido de gas (bps) | 37 | -37.67 | -37.61 | -37.36 | -37.26 | -36.98 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -58.92 | -52.90 | -51.41 | -51.25 | -50.87 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -58.98 | -52.96 | -51.47 | -51.31 | -50.94 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +3.33 | +9.32 | +10.91 | +11.14 | +11.33 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -12.65 | -12.59 | -12.35 | -12.25 | -11.95 | 0% |
| Ida, liquido de gas (bps) | 37 | +3.31 | +9.31 | +10.90 | +11.12 | +11.32 | 100% |
| Volta, liquido de gas (bps) | 37 | -12.70 | -12.64 | -12.39 | -12.29 | -12.01 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -9.03 | -2.98 | -1.48 | -1.32 | -0.93 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -9.08 | -3.04 | -1.54 | -1.38 | -1.01 | 0% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +2.26 | USDT_POLYGON |
| 0.5 | 1 | 0 | +2.26 | USDT_POLYGON |
| 1 | 1 | 0 | +2.26 | USDT_POLYGON |
| 2 | 1 | 0 | +2.26 | USDT_POLYGON |
| 3 | 1 | 0 | +2.26 | USDT_POLYGON |
| 5 | 1 | 0 | +2.26 | USDT_POLYGON |
| 10 | 1 | 0 | +2.26 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 100% | 0% |
| 3 | 100% | 0% |
| 5 | 92% | 0% |
| 10 | 89% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 01h | 3 | +11.31 | -12.70 | -1.40 |
| 15/10 02h | 30 | +10.90 | -12.39 | -1.54 |
| 15/10 03h | 4 | +10.52 | -12.30 | -1.79 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 34 | +10.92 | +11.33 | 0.004 | 1080s |
| A2B | relaydepository | 3 | +3.36 | +3.52 | 0.003 | 2s |
| A2B | layerswap | 1 | +7.67 | +7.67 | 0.003 | 8s |
| B2A | across | 37 | -12.35 | -11.95 | 0.008 | 4s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.54 bps (~US$ -0.31) e foi positiva em apenas 0 de 37 ciclos (0.0%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: -1.01 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
