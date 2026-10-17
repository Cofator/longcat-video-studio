# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 15/10 00:15 ate 15/10 01:29 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (37), `Relayer gas fee` (37), `Network Gas` (36), `Execution Gas` (36), `Service Fee` (36)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -13.81 | -13.73 | -13.17 | -12.28 | -12.10 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -39.51 | -39.41 | -37.92 | -37.62 | -37.32 | 0% |
| Ida, liquido de gas (bps) | 37 | -13.83 | -13.75 | -13.19 | -12.30 | -12.12 | 0% |
| Volta, liquido de gas (bps) | 37 | -39.55 | -39.45 | -37.96 | -37.66 | -37.36 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -52.13 | -51.69 | -51.27 | -50.91 | -50.84 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -52.19 | -51.75 | -51.32 | -50.96 | -50.90 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +11.22 | +11.30 | +11.86 | +12.75 | +12.93 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -14.55 | -14.45 | -12.95 | -12.65 | -12.35 | 0% |
| Ida, liquido de gas (bps) | 37 | +11.20 | +11.28 | +11.84 | +12.73 | +12.92 | 100% |
| Volta, liquido de gas (bps) | 37 | -14.59 | -14.49 | -12.99 | -12.69 | -12.39 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -2.21 | -1.76 | -1.33 | -0.97 | -0.91 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -2.26 | -1.82 | -1.39 | -1.03 | -0.97 | 0% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +2.55 | USDT_POLYGON |
| 0.5 | 1 | 0 | +2.55 | USDT_POLYGON |
| 1 | 1 | 0 | +2.55 | USDT_POLYGON |
| 2 | 1 | 0 | +2.55 | USDT_POLYGON |
| 3 | 1 | 0 | +2.55 | USDT_POLYGON |
| 5 | 1 | 0 | +2.55 | USDT_POLYGON |
| 10 | 1 | 0 | +2.55 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 0% |
| 0.5 | 100% | 0% |
| 1 | 100% | 0% |
| 2 | 100% | 0% |
| 3 | 100% | 0% |
| 5 | 100% | 0% |
| 10 | 100% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 15/10 00h | 23 | +12.26 | -13.49 | -1.35 |
| 15/10 01h | 14 | +11.30 | -12.74 | -1.42 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 36 | +11.85 | +12.93 | 0.004 | 1080s |
| A2B | lifiIntents | 2 | +12.32 | +12.36 | 0.003 | 7s |
| B2A | across | 37 | -12.95 | -12.35 | 0.008 | 4s |

## Veredito

**Nao vale na pratica.** A ida+volta deu mediana de -1.39 bps (~US$ -0.28) e foi positiva em apenas 0 de 37 ciclos (0.0%), o que e evento isolado, nao oportunidade recorrente. Melhor ciclo: -0.97 bps. Confira a tabela por rota abaixo para ver de onde veio.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
