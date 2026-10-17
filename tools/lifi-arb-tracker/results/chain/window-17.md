# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 10:16 ate 15/10 11:32 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 77 | erros: 7 | ciclos completos (ida+volta): 38

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 77/77 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (77).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (77), `Relayer fee` (37), `Relayer gas fee` (37), `Network Gas` (34), `Execution Gas` (34), `Service Fee` (34), `Relayer Gas fee` (2), `Relayer Service fee` (2), `LayerSwap fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 38 | -21.79 | -15.54 | -14.84 | -14.62 | -12.32 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 38 | -37.22 | -37.06 | -36.62 | -36.43 | -35.24 | 0% |
| Ida, liquido de gas (bps) | 38 | -21.80 | -15.55 | -14.86 | -14.64 | -12.35 | 0% |
| Volta, liquido de gas (bps) | 38 | -37.27 | -37.10 | -36.67 | -36.47 | -35.28 | 0% |
| **Ida+volta simultanea** (bps) | 38 | -58.63 | -52.10 | -51.61 | -51.21 | -49.30 | 0% |
| **Ida+volta, liquido de gas** (bps) | 38 | -58.69 | -52.16 | -51.68 | -51.28 | -49.37 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 38 | +3.22 | +9.49 | +10.19 | +10.41 | +12.71 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 38 | -12.25 | -12.09 | -11.65 | -11.45 | -10.27 | 0% |
| Ida, liquido de gas (bps) | 38 | +3.21 | +9.47 | +10.17 | +10.39 | +12.68 | 100% |
| Volta, liquido de gas (bps) | 38 | -12.30 | -12.13 | -11.70 | -11.50 | -10.30 | 0% |
| **Ida+volta simultanea** (bps) | 38 | -8.74 | -2.17 | -1.68 | -1.28 | +0.64 | 3% |
| **Ida+volta, liquido de gas** (bps) | 38 | -8.79 | -2.24 | -1.75 | -1.35 | +0.57 | 3% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.89 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.89 | USDT_POLYGON |
| 1 | 1 | 0 | +1.89 | USDT_POLYGON |
| 2 | 1 | 0 | +1.89 | USDT_POLYGON |
| 3 | 1 | 0 | +1.89 | USDT_POLYGON |
| 5 | 1 | 0 | +1.89 | USDT_POLYGON |
| 10 | 1 | 0 | +2.00 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 100% | 0% |
| 3 | 100% | 0% |
| 5 | 97% | 0% |
| 10 | 66% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 10h | 22 | +10.06 | -11.70 | -1.93 |
| 15/10 11h | 16 | +10.22 | -11.65 | -1.45 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 34 | +10.19 | +12.71 | 0.004 | 1080s |
| A2B | lifiIntents | 3 | +10.43 | +10.54 | 0.003 | 7s |
| A2B | layerswap | 1 | +7.28 | +7.28 | 0.003 | 9s |
| A2B | relaydepository | 1 | +3.22 | +3.22 | 0.003 | 2s |
| B2A | across | 37 | -11.65 | -11.35 | 0.009 | 4s |
| B2A | relaydepository | 1 | -10.27 | -10.27 | 0.007 | 2s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.75 bps (~US$ -0.35) e foi positiva em apenas 1 de 38 ciclos (2.6%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: +0.57 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 41 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 35 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 18 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 44 minutes","code":1005}`
