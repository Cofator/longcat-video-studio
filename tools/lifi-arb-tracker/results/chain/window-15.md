# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 06:56 ate 15/10 08:10 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (37), `Relayer gas fee` (37), `Network Gas` (33), `Execution Gas` (33), `Service Fee` (33), `Relayer Gas fee` (3), `Relayer Service fee` (3)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -22.51 | -17.28 | -14.47 | -14.03 | -13.77 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -37.82 | -37.42 | -36.82 | -36.62 | -36.53 | 0% |
| Ida, liquido de gas (bps) | 37 | -22.52 | -17.29 | -14.49 | -14.04 | -13.79 | 0% |
| Volta, liquido de gas (bps) | 37 | -37.86 | -37.46 | -36.87 | -36.66 | -36.57 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -59.17 | -54.08 | -51.35 | -51.20 | -50.57 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -59.23 | -54.14 | -51.40 | -51.26 | -50.63 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +2.50 | +7.74 | +10.56 | +11.00 | +11.26 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -12.85 | -12.45 | -11.85 | -11.65 | -11.55 | 0% |
| Ida, liquido de gas (bps) | 37 | +2.49 | +7.72 | +10.54 | +10.98 | +11.24 | 100% |
| Volta, liquido de gas (bps) | 37 | -12.89 | -12.50 | -11.90 | -11.69 | -11.59 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -9.28 | -4.16 | -1.42 | -1.27 | -0.64 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -9.34 | -4.22 | -1.47 | -1.33 | -0.70 | 0% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +2.25 | USDT_POLYGON |
| 0.5 | 1 | 0 | +2.25 | USDT_POLYGON |
| 1 | 1 | 0 | +2.25 | USDT_POLYGON |
| 2 | 1 | 0 | +2.25 | USDT_POLYGON |
| 3 | 1 | 0 | +2.25 | USDT_POLYGON |
| 5 | 1 | 0 | +2.25 | USDT_POLYGON |
| 10 | 1 | 0 | +2.25 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 100% | 0% |
| 3 | 97% | 0% |
| 5 | 89% | 0% |
| 10 | 89% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 06h | 2 | +11.02 | -12.64 | -1.64 |
| 15/10 07h | 30 | +10.56 | -12.05 | -1.46 |
| 15/10 08h | 5 | +10.38 | -11.79 | -1.51 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 32 | +10.57 | +11.26 | 0.003 | 1080s |
| A2B | lifiIntents | 3 | +10.82 | +10.95 | 0.003 | 7s |
| A2B | relaydepository | 3 | +3.20 | +3.28 | 0.003 | 2s |
| B2A | across | 37 | -11.85 | -11.55 | 0.009 | 4s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.47 bps (~US$ -0.29) e foi positiva em apenas 0 de 37 ciclos (0.0%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: -0.70 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
