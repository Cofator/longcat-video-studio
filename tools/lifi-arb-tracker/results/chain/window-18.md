# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 11:58 ate 15/10 13:12 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Network Gas` (35), `Execution Gas` (35), `Service Fee` (35), `Relayer fee` (35), `Relayer gas fee` (35), `Relayer Gas fee` (4), `Relayer Service fee` (4), `LayerSwap fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -24.25 | -16.99 | -16.20 | -15.03 | -14.95 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -36.82 | -36.58 | -35.03 | -34.59 | -31.03 | 0% |
| Ida, liquido de gas (bps) | 37 | -24.26 | -17.01 | -16.22 | -15.05 | -14.97 | 0% |
| Volta, liquido de gas (bps) | 37 | -36.87 | -36.63 | -35.08 | -34.65 | -31.08 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -59.17 | -52.20 | -51.44 | -51.07 | -46.11 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -59.23 | -52.26 | -51.51 | -51.14 | -46.17 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +0.76 | +8.03 | +8.82 | +10.00 | +10.07 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -11.85 | -11.61 | -10.06 | -9.62 | -6.04 | 0% |
| Ida, liquido de gas (bps) | 37 | +0.74 | +8.01 | +8.80 | +9.97 | +10.06 | 100% |
| Volta, liquido de gas (bps) | 37 | -11.90 | -11.66 | -10.11 | -9.67 | -6.09 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -9.28 | -2.27 | -1.51 | -1.14 | +3.85 | 3% |
| **Ida+volta, liquido de gas** (bps) | 37 | -9.34 | -2.34 | -1.58 | -1.21 | +3.78 | 3% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.94 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.94 | USDT_POLYGON |
| 1 | 1 | 0 | +1.94 | USDT_POLYGON |
| 2 | 1 | 0 | +1.94 | USDT_POLYGON |
| 3 | 1 | 0 | +1.94 | USDT_POLYGON |
| 5 | 1 | 0 | +1.94 | USDT_POLYGON |
| 10 | 1 | 0 | +2.01 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 95% | 0% |
| 2 | 95% | 0% |
| 3 | 92% | 0% |
| 5 | 92% | 0% |
| 10 | 8% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 11h | 1 | +9.72 | -11.11 | -1.40 |
| 15/10 12h | 30 | +9.39 | -10.71 | -1.57 |
| 15/10 13h | 6 | +8.08 | -9.72 | -1.63 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 35 | +8.90 | +10.07 | 0.004 | 1080s |
| A2B | relaydepository | 3 | +0.88 | +2.08 | 0.003 | 2s |
| B2A | across | 35 | -10.06 | -9.46 | 0.010 | 4s |
| B2A | layerswap | 1 | -6.04 | -6.04 | 0.010 | 31s |
| B2A | relaydepository | 1 | -11.69 | -11.69 | 0.009 | 2s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.58 bps (~US$ -0.32) e foi positiva em apenas 1 de 37 ciclos (2.7%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: +3.78 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
