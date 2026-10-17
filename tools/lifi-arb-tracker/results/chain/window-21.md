# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 17:01 ate 15/10 18:39 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 99 | erros: 5 | ciclos completos (ida+volta): 49

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 99/99 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (99).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (99), `Relayer fee` (49), `Relayer gas fee` (49), `Network Gas` (43), `Execution Gas` (43), `Service Fee` (43), `LayerSwap fee` (2)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 49 | -19.25 | -16.87 | -15.98 | -15.83 | -15.77 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 49 | -36.33 | -36.03 | -35.93 | -35.23 | -34.83 | 0% |
| Ida, liquido de gas (bps) | 49 | -19.27 | -16.89 | -15.99 | -15.85 | -15.78 | 0% |
| Volta, liquido de gas (bps) | 49 | -36.37 | -36.08 | -35.97 | -35.27 | -34.88 | 0% |
| **Ida+volta simultanea** (bps) | 49 | -54.81 | -52.20 | -51.72 | -51.42 | -50.87 | 0% |
| **Ida+volta, liquido de gas** (bps) | 49 | -54.87 | -52.26 | -51.79 | -51.48 | -50.94 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 49 | +5.76 | +8.15 | +9.05 | +9.19 | +9.26 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 49 | -11.36 | -11.06 | -10.96 | -10.26 | -9.86 | 0% |
| Ida, liquido de gas (bps) | 49 | +5.75 | +8.13 | +9.03 | +9.17 | +9.24 | 100% |
| Volta, liquido de gas (bps) | 49 | -11.40 | -11.11 | -11.00 | -10.30 | -9.90 | 0% |
| **Ida+volta simultanea** (bps) | 49 | -4.90 | -2.27 | -1.79 | -1.49 | -0.93 | 0% |
| **Ida+volta, liquido de gas** (bps) | 49 | -4.96 | -2.33 | -1.86 | -1.55 | -1.01 | 0% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.56 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.56 | USDT_POLYGON |
| 1 | 1 | 0 | +1.56 | USDT_POLYGON |
| 2 | 1 | 0 | +1.56 | USDT_POLYGON |
| 3 | 1 | 0 | +1.56 | USDT_POLYGON |
| 5 | 1 | 0 | +1.56 | USDT_POLYGON |
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
| 15/10 17h | 30 | +8.90 | -11.00 | -2.02 |
| 15/10 18h | 19 | +9.06 | -10.90 | -1.67 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 43 | +9.05 | +9.26 | 0.004 | 1080s |
| A2B | lifiIntents | 5 | +8.83 | +8.93 | 0.003 | 7s |
| A2B | layerswap | 2 | +6.01 | +6.25 | 0.003 | 8s |
| B2A | across | 49 | -10.96 | -9.86 | 0.010 | 4s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.86 bps (~US$ -0.37) e foi positiva em apenas 0 de 49 ciclos (0.0%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: -1.01 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 19 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 13 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 22 minutes","code":1005}`
