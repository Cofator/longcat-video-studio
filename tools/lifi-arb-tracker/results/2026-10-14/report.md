# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 13/10 23:20 ate 14/10 05:00 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 224 | erros: 18 | ciclos completos (ida+volta): 111

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 224/224 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (224).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (224), `Relayer fee` (111), `Relayer gas fee` (111), `Network Gas` (74), `Execution Gas` (74), `Service Fee` (74), `NearIntents Protocol Fee` (3), `1ClickSwap API Fee` (3), `NearIntents App Fee` (3)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 111 | -18.99 | -17.57 | -16.78 | -15.90 | -15.58 | 0% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 111 | -39.47 | -35.63 | -34.54 | -34.24 | -34.14 | 0% |
| Ida, liquido de gas (bps) | 111 | -19.00 | -17.59 | -16.79 | -15.91 | -15.59 | 0% |
| Volta, liquido de gas (bps) | 111 | -39.51 | -35.67 | -34.58 | -34.28 | -34.18 | 0% |
| **Ida+volta simultanea** (bps) | 111 | -55.89 | -52.01 | -51.55 | -51.15 | -50.59 | 0% |
| **Ida+volta, liquido de gas** (bps) | 111 | -55.94 | -52.08 | -51.61 | -51.21 | -50.65 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 111 | +6.03 | +7.45 | +8.24 | +9.13 | +9.45 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 111 | -14.51 | -10.66 | -9.56 | -9.26 | -9.16 | 0% |
| Ida, liquido de gas (bps) | 111 | +6.01 | +7.43 | +8.23 | +9.11 | +9.43 | 100% |
| Volta, liquido de gas (bps) | 111 | -14.55 | -10.70 | -9.60 | -9.31 | -9.20 | 0% |
| **Ida+volta simultanea** (bps) | 111 | -5.98 | -2.09 | -1.62 | -1.22 | -0.66 | 0% |
| **Ida+volta, liquido de gas** (bps) | 111 | -6.03 | -2.15 | -1.69 | -1.28 | -0.72 | 0% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 1 | 0 | +1.45 | USDT_POLYGON |
| 0.5 | 1 | 0 | +1.45 | USDT_POLYGON |
| 1 | 1 | 0 | +1.45 | USDT_POLYGON |
| 2 | 1 | 0 | +1.45 | USDT_POLYGON |
| 3 | 1 | 0 | +1.45 | USDT_POLYGON |
| 5 | 1 | 0 | +1.45 | USDT_POLYGON |
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
| 13/10 23h | 21 | +7.49 | -9.41 | -1.90 |
| 14/10 00h | 17 | +7.75 | -9.40 | -1.62 |
| 14/10 01h | 13 | +8.42 | -9.60 | -1.19 |
| 14/10 02h | 24 | +8.12 | -9.95 | -1.76 |
| 14/10 03h | 6 | +8.93 | -10.70 | -1.78 |
| 14/10 04h | 30 | +9.10 | -10.70 | -1.59 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 73 | +8.08 | +9.34 | 0.004 | 1080s |
| A2B | lifiIntents | 37 | +8.30 | +9.45 | 0.003 | 7s |
| A2B | near | 3 | +6.03 | +8.12 | 0.003 | 39s |
| B2A | across | 111 | -9.56 | -9.16 | 0.009 | 4s |

## Veredito

**Nao vale.** Mesmo sem a taxa da LI.FI, a ida+volta deu mediana de -1.69 bps (~US$ -0.34), positiva em so 0% dos ciclos, e nenhuma estrategia de espera foi lucrativa.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 4x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 4x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 4x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 4x `HTTP 429: {"message":"Rate limit exceeded, retry in 3 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
