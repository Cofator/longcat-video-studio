# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 22:09 ate 15/10 23:23 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (37), `Relayer gas fee` (37), `Network Gas` (15), `Execution Gas` (15), `Service Fee` (15), `LayerSwap fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -17.32 | -14.39 | -14.20 | -14.01 | -11.49 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -37.82 | -37.52 | -37.32 | -37.22 | -37.02 | 0% |
| Ida, liquido de gas (bps) | 37 | -17.33 | -14.41 | -14.21 | -14.03 | -11.51 | 0% |
| Volta, liquido de gas (bps) | 37 | -37.88 | -37.57 | -37.38 | -37.28 | -37.07 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -54.48 | -51.76 | -51.56 | -51.26 | -48.67 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -54.55 | -51.83 | -51.63 | -51.33 | -48.74 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +7.70 | +10.64 | +10.83 | +11.01 | +13.55 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -12.85 | -12.55 | -12.35 | -12.25 | -12.05 | 0% |
| Ida, liquido de gas (bps) | 37 | +7.69 | +10.62 | +10.81 | +11.00 | +13.53 | 100% |
| Volta, liquido de gas (bps) | 37 | -12.91 | -12.61 | -12.41 | -12.31 | -12.10 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -4.56 | -1.83 | -1.63 | -1.33 | +1.28 | 3% |
| **Ida+volta, liquido de gas** (bps) | 37 | -4.63 | -1.90 | -1.70 | -1.40 | +1.20 | 3% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +2.16 | USDT_POLYGON |
| 0.5 | 1 | 0 | +2.16 | USDT_POLYGON |
| 1 | 1 | 0 | +2.16 | USDT_POLYGON |
| 2 | 1 | 0 | +2.16 | USDT_POLYGON |
| 3 | 1 | 0 | +2.16 | USDT_POLYGON |
| 5 | 1 | 0 | +2.16 | USDT_POLYGON |
| 10 | 1 | 0 | +2.16 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 100% | 0% |
| 3 | 100% | 0% |
| 5 | 100% | 0% |
| 10 | 97% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 22h | 26 | +10.82 | -12.40 | -1.60 |
| 15/10 23h | 11 | +10.78 | -12.51 | -1.75 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | lifiIntents | 22 | +10.83 | +11.14 | 0.003 | 7s |
| A2B | polymerStandard | 15 | +10.82 | +13.55 | 0.004 | 1080s |
| A2B | layerswap | 1 | +7.70 | +7.70 | 0.003 | 9s |
| B2A | across | 37 | -12.35 | -12.05 | 0.011 | 3s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.70 bps (~US$ -0.34) e foi positiva em apenas 1 de 37 ciclos (2.7%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: +1.20 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
