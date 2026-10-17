# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 18:48 ate 15/10 20:02 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (36), `Relayer gas fee` (36), `Network Gas` (11), `Execution Gas` (11), `Service Fee` (11), `Transaction Fee` (1), `LayerSwap fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -18.99 | -16.09 | -15.99 | -15.78 | -15.69 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -35.63 | -35.63 | -35.63 | -35.53 | -35.32 | 0% |
| Ida, liquido de gas (bps) | 37 | -19.01 | -16.10 | -16.00 | -15.80 | -15.70 | 0% |
| Volta, liquido de gas (bps) | 37 | -35.67 | -35.67 | -35.65 | -35.56 | -35.44 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -54.45 | -51.58 | -51.56 | -51.26 | -51.16 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -54.51 | -51.64 | -51.60 | -51.30 | -51.21 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +6.03 | +8.94 | +9.04 | +9.24 | +9.34 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -10.66 | -10.66 | -10.66 | -10.56 | -10.35 | 0% |
| Ida, liquido de gas (bps) | 37 | +6.01 | +8.92 | +9.02 | +9.22 | +9.32 | 100% |
| Volta, liquido de gas (bps) | 37 | -10.70 | -10.70 | -10.68 | -10.58 | -10.47 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -4.54 | -1.65 | -1.63 | -1.33 | -1.23 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -4.60 | -1.71 | -1.67 | -1.37 | -1.27 | 0% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.80 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.80 | USDT_POLYGON |
| 1 | 1 | 0 | +1.80 | USDT_POLYGON |
| 2 | 1 | 0 | +1.80 | USDT_POLYGON |
| 3 | 1 | 0 | +1.80 | USDT_POLYGON |
| 5 | 1 | 0 | +1.80 | USDT_POLYGON |
| 10 | 0 | 0 | +0.00 | USDC_BASE |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 100% | 0% |
| 3 | 100% | 0% |
| 5 | 100% | 0% |
| 10 | 0% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 18h | 6 | +8.97 | -10.65 | -1.69 |
| 15/10 19h | 30 | +9.02 | -10.68 | -1.67 |
| 15/10 20h | 1 | +9.02 | -10.70 | -1.69 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | lifiIntents | 26 | +9.04 | +9.34 | 0.003 | 7s |
| A2B | polymerStandard | 11 | +8.97 | +9.04 | 0.004 | 1080s |
| A2B | layerswap | 1 | +6.03 | +6.03 | 0.003 | 8s |
| B2A | across | 36 | -10.66 | -10.56 | 0.007 | 4s |
| B2A | celercirclefast | 1 | -10.35 | -10.35 | 0.025 | 324s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.67 bps (~US$ -0.33) e foi positiva em apenas 0 de 37 ciclos (0.0%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: -1.27 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
