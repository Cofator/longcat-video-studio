# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 03:36 ate 15/10 04:50 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (37), `Relayer gas fee` (37), `Network Gas` (35), `Execution Gas` (35), `Service Fee` (35), `LayerSwap fee` (2), `Relayer Gas fee` (1), `Relayer Service fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -21.66 | -14.56 | -14.29 | -13.91 | -12.12 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -37.52 | -37.42 | -37.42 | -37.32 | -37.22 | 0% |
| Ida, liquido de gas (bps) | 37 | -21.67 | -14.57 | -14.31 | -13.93 | -12.13 | 0% |
| Volta, liquido de gas (bps) | 37 | -37.56 | -37.47 | -37.46 | -37.36 | -37.26 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -59.00 | -51.92 | -51.63 | -51.24 | -49.49 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -59.05 | -51.98 | -51.69 | -51.30 | -49.55 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +3.35 | +10.47 | +10.74 | +11.12 | +12.91 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -12.55 | -12.45 | -12.45 | -12.35 | -12.25 | 0% |
| Ida, liquido de gas (bps) | 37 | +3.34 | +10.45 | +10.72 | +11.10 | +12.90 | 100% |
| Volta, liquido de gas (bps) | 37 | -12.60 | -12.50 | -12.49 | -12.39 | -12.29 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -9.11 | -2.00 | -1.70 | -1.31 | +0.45 | 3% |
| **Ida+volta, liquido de gas** (bps) | 37 | -9.16 | -2.06 | -1.76 | -1.37 | +0.39 | 3% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +2.21 | USDT_POLYGON |
| 0.5 | 1 | 0 | +2.21 | USDT_POLYGON |
| 1 | 1 | 0 | +2.21 | USDT_POLYGON |
| 2 | 1 | 0 | +2.21 | USDT_POLYGON |
| 3 | 1 | 0 | +2.21 | USDT_POLYGON |
| 5 | 1 | 0 | +2.21 | USDT_POLYGON |
| 10 | 1 | 0 | +2.21 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 100% | 0% |
| 3 | 100% | 0% |
| 5 | 97% | 0% |
| 10 | 95% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 03h | 12 | +11.01 | -12.39 | -1.43 |
| 15/10 04h | 25 | +10.69 | -12.49 | -1.88 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 35 | +10.74 | +11.24 | 0.004 | 1080s |
| A2B | layerswap | 2 | +10.49 | +12.91 | 0.003 | 10s |
| A2B | relaydepository | 1 | +3.35 | +3.35 | 0.003 | 2s |
| B2A | across | 37 | -12.45 | -12.25 | 0.008 | 4s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.76 bps (~US$ -0.35) e foi positiva em apenas 1 de 37 ciclos (2.7%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: +0.39 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
