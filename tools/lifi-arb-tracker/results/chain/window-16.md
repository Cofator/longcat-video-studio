# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 08:36 ate 15/10 09:50 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (37), `Relayer gas fee` (37), `Network Gas` (35), `Execution Gas` (35), `Service Fee` (35), `Relayer Gas fee` (2), `Relayer Service fee` (2)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -22.25 | -15.06 | -14.30 | -14.08 | -13.40 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -37.72 | -37.52 | -37.12 | -36.62 | -36.43 | 0% |
| Ida, liquido de gas (bps) | 37 | -22.26 | -15.08 | -14.32 | -14.10 | -13.42 | 0% |
| Volta, liquido de gas (bps) | 37 | -37.76 | -37.56 | -37.16 | -36.68 | -36.48 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -59.29 | -51.87 | -51.39 | -51.21 | -50.47 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -59.34 | -51.93 | -51.45 | -51.27 | -50.54 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +2.76 | +9.97 | +10.73 | +10.95 | +11.63 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -12.75 | -12.55 | -12.15 | -11.65 | -11.46 | 0% |
| Ida, liquido de gas (bps) | 37 | +2.75 | +9.95 | +10.71 | +10.93 | +11.61 | 100% |
| Volta, liquido de gas (bps) | 37 | -12.79 | -12.60 | -12.19 | -11.71 | -11.51 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -9.39 | -1.94 | -1.46 | -1.28 | -0.54 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -9.45 | -2.01 | -1.52 | -1.34 | -0.61 | 0% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +0.56 | USDT_POLYGON |
| 0.5 | 1 | 0 | +0.56 | USDT_POLYGON |
| 1 | 1 | 0 | +0.56 | USDT_POLYGON |
| 2 | 1 | 0 | +0.56 | USDT_POLYGON |
| 3 | 1 | 0 | +2.15 | USDT_POLYGON |
| 5 | 1 | 0 | +2.15 | USDT_POLYGON |
| 10 | 1 | 0 | +2.15 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 100% | 0% |
| 3 | 92% | 0% |
| 5 | 92% | 0% |
| 10 | 84% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 08h | 12 | +10.78 | -12.19 | -1.43 |
| 15/10 09h | 25 | +10.68 | -12.29 | -1.63 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 35 | +10.75 | +11.63 | 0.004 | 1080s |
| A2B | relaydepository | 2 | +2.79 | +2.80 | 0.003 | 2s |
| A2B | lifiIntents | 1 | +2.76 | +2.76 | 0.003 | 7s |
| B2A | across | 37 | -12.15 | -11.46 | 0.009 | 4s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.52 bps (~US$ -0.30) e foi positiva em apenas 0 de 37 ciclos (0.0%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: -0.61 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
