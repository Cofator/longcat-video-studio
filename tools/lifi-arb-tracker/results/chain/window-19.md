# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 13:39 ate 15/10 14:55 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 77 | erros: 7 | ciclos completos (ida+volta): 38

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 77/77 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (77).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (77), `Relayer fee` (39), `Relayer gas fee` (39), `Network Gas` (35), `Execution Gas` (35), `Service Fee` (35)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 38 | -23.50 | -17.11 | -16.01 | -15.73 | -15.49 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 38 | -36.13 | -35.96 | -35.53 | -35.03 | -34.93 | 0% |
| Ida, liquido de gas (bps) | 38 | -23.55 | -17.14 | -16.03 | -15.75 | -15.51 | 0% |
| Volta, liquido de gas (bps) | 38 | -36.18 | -36.04 | -35.57 | -35.08 | -34.97 | 0% |
| **Ida+volta simultanea** (bps) | 38 | -59.05 | -52.42 | -51.51 | -51.25 | -50.87 | 0% |
| **Ida+volta, liquido de gas** (bps) | 38 | -59.14 | -52.53 | -51.57 | -51.34 | -50.92 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 38 | +1.50 | +7.91 | +9.01 | +9.29 | +9.54 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 38 | -11.16 | -10.99 | -10.56 | -10.06 | -9.96 | 0% |
| Ida, liquido de gas (bps) | 38 | +1.46 | +7.88 | +8.99 | +9.27 | +9.52 | 100% |
| Volta, liquido de gas (bps) | 38 | -11.21 | -11.06 | -10.60 | -10.10 | -10.00 | 0% |
| **Ida+volta simultanea** (bps) | 38 | -9.16 | -2.50 | -1.58 | -1.32 | -0.93 | 0% |
| **Ida+volta, liquido de gas** (bps) | 38 | -9.25 | -2.61 | -1.64 | -1.41 | -0.99 | 0% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.63 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.63 | USDT_POLYGON |
| 1 | 1 | 0 | +1.63 | USDT_POLYGON |
| 2 | 1 | 0 | +1.63 | USDT_POLYGON |
| 3 | 1 | 0 | +1.63 | USDT_POLYGON |
| 5 | 1 | 0 | +1.63 | USDT_POLYGON |
| 10 | 0 | 0 | +0.00 | USDC_BASE |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 97% | 0% |
| 3 | 92% | 0% |
| 5 | 92% | 0% |
| 10 | 0% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 13h | 11 | +8.58 | -10.30 | -1.71 |
| 15/10 14h | 27 | +9.03 | -10.60 | -1.60 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 33 | +9.05 | +9.54 | 0.004 | 1080s |
| A2B | lifiIntents | 5 | +2.40 | +9.13 | 0.004 | 7s |
| A2B | across | 1 | +7.28 | +7.28 | 0.008 | 1s |
| B2A | across | 38 | -10.56 | -9.96 | 0.009 | 4s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.64 bps (~US$ -0.33) e foi positiva em apenas 0 de 38 ciclos (0.0%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: -0.99 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 41 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 35 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 18 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 44 minutes","code":1005}`
