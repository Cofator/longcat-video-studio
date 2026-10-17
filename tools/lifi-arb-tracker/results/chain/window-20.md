# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 15:21 ate 15/10 16:35 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (37), `Relayer gas fee` (37), `Network Gas` (11), `Execution Gas` (11), `Service Fee` (11), `Relayer Gas fee` (1), `Relayer Service fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -24.78 | -16.33 | -15.89 | -15.69 | -14.75 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -36.03 | -36.03 | -35.33 | -35.13 | -35.03 | 0% |
| Ida, liquido de gas (bps) | 37 | -24.80 | -16.35 | -15.91 | -15.71 | -14.77 | 0% |
| Volta, liquido de gas (bps) | 37 | -36.12 | -36.08 | -35.37 | -35.17 | -35.08 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -59.83 | -51.96 | -51.38 | -50.87 | -50.38 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -59.89 | -52.07 | -51.45 | -50.93 | -50.47 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +0.22 | +8.69 | +9.13 | +9.33 | +10.28 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -11.06 | -11.06 | -10.36 | -10.16 | -10.06 | 0% |
| Ida, liquido de gas (bps) | 37 | +0.20 | +8.67 | +9.12 | +9.32 | +10.26 | 100% |
| Volta, liquido de gas (bps) | 37 | -11.15 | -11.11 | -10.40 | -10.20 | -10.11 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -9.94 | -2.04 | -1.45 | -0.93 | -0.44 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -10.00 | -2.14 | -1.51 | -1.00 | -0.53 | 0% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.72 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.72 | USDT_POLYGON |
| 1 | 1 | 0 | +1.72 | USDT_POLYGON |
| 2 | 1 | 0 | +1.72 | USDT_POLYGON |
| 3 | 1 | 0 | +1.72 | USDT_POLYGON |
| 5 | 1 | 0 | +1.72 | USDT_POLYGON |
| 10 | 1 | 0 | +2.05 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 97% | 0% |
| 1 | 97% | 0% |
| 2 | 95% | 0% |
| 3 | 95% | 0% |
| 5 | 95% | 0% |
| 10 | 3% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 15h | 20 | +9.22 | -10.80 | -1.65 |
| 15/10 16h | 17 | +8.82 | -10.20 | -1.39 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | lifiIntents | 26 | +9.23 | +9.43 | 0.003 | 7s |
| A2B | polymerStandard | 11 | +8.79 | +10.28 | 0.004 | 1080s |
| A2B | relaydepository | 1 | +1.25 | +1.25 | 0.003 | 2s |
| B2A | across | 37 | -10.36 | -10.06 | 0.011 | 4s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.51 bps (~US$ -0.30) e foi positiva em apenas 0 de 37 ciclos (0.0%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: -0.53 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
