# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 20:28 ate 15/10 21:42 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (38), `Relayer gas fee` (38), `Network Gas` (23), `Execution Gas` (23), `Service Fee` (23), `LayerSwap fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -22.13 | -15.80 | -15.66 | -14.89 | -14.23 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -37.52 | -36.82 | -36.63 | -36.43 | -36.43 | 0% |
| Ida, liquido de gas (bps) | 37 | -22.14 | -15.81 | -15.68 | -14.91 | -14.24 | 0% |
| Volta, liquido de gas (bps) | 37 | -37.57 | -36.88 | -36.67 | -36.47 | -36.47 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -58.47 | -52.36 | -52.13 | -51.66 | -50.70 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -58.53 | -52.43 | -52.19 | -51.73 | -50.76 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +2.88 | +9.23 | +9.37 | +10.14 | +10.80 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -12.55 | -11.85 | -11.65 | -11.45 | -11.45 | 0% |
| Ida, liquido de gas (bps) | 37 | +2.87 | +9.21 | +9.35 | +10.12 | +10.78 | 100% |
| Volta, liquido de gas (bps) | 37 | -12.60 | -11.91 | -11.70 | -11.50 | -11.50 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -8.58 | -2.44 | -2.21 | -1.73 | -0.77 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -8.63 | -2.50 | -2.26 | -1.80 | -0.83 | 0% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.92 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.92 | USDT_POLYGON |
| 1 | 1 | 0 | +1.92 | USDT_POLYGON |
| 2 | 1 | 0 | +1.92 | USDT_POLYGON |
| 3 | 1 | 0 | +1.92 | USDT_POLYGON |
| 5 | 1 | 0 | +1.92 | USDT_POLYGON |
| 10 | 1 | 0 | +2.16 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 100% | 0% |
| 3 | 97% | 0% |
| 5 | 97% | 0% |
| 10 | 32% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 20h | 16 | +9.30 | -11.59 | -2.29 |
| 15/10 21h | 21 | +10.02 | -11.90 | -1.96 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 22 | +9.33 | +10.80 | 0.004 | 1080s |
| A2B | lifiIntents | 14 | +10.14 | +10.33 | 0.003 | 7s |
| A2B | layerswap | 1 | +6.37 | +6.37 | 0.003 | 9s |
| A2B | across | 1 | +8.18 | +8.18 | 0.003 | 1s |
| B2A | across | 37 | -11.65 | -11.45 | 0.009 | 4s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -2.26 bps (~US$ -0.45) e foi positiva em apenas 0 de 37 ciclos (0.0%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: -0.83 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
