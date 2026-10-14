# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 14/10 17:35 ate 14/10 18:49 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 74 | erros: 8 | ciclos completos (ida+volta): 36

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 74/74 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (74).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (74), `Relayer fee` (27), `Relayer gas fee` (27), `Relayer Gas fee` (19), `Relayer Service fee` (19), `Network Gas` (3), `Execution Gas` (3), `Service Fee` (3)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 36 | -22.99 | -19.07 | -14.18 | -3.65 | +32.58 | 8% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 36 | -39.38 | -38.46 | -36.97 | -34.00 | +46.29 | 6% |
| Ida, liquido de gas (bps) | 36 | -23.01 | -19.09 | -14.20 | -3.67 | +32.56 | 8% |
| Volta, liquido de gas (bps) | 36 | -39.42 | -38.51 | -37.02 | -34.05 | +46.24 | 6% |
| **Ida+volta simultanea** (bps) | 36 | -61.32 | -56.12 | -50.90 | -26.70 | +32.04 | 8% |
| **Ida+volta, liquido de gas** (bps) | 36 | -61.38 | -56.18 | -50.97 | -26.76 | +31.98 | 8% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 36 | +2.01 | +5.94 | +10.85 | +21.40 | +57.72 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 36 | -14.42 | -13.50 | -12.00 | -9.02 | +71.47 | 8% |
| Ida, liquido de gas (bps) | 36 | +2.00 | +5.93 | +10.83 | +21.39 | +57.71 | 100% |
| Volta, liquido de gas (bps) | 36 | -14.45 | -13.54 | -12.05 | -9.07 | +71.42 | 8% |
| **Ida+volta simultanea** (bps) | 36 | -11.44 | -6.21 | -0.97 | +23.35 | +82.39 | 22% |
| **Ida+volta, liquido de gas** (bps) | 36 | -11.50 | -6.27 | -1.03 | +23.30 | +82.33 | 22% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 7 | 3 | +31.87 | USDT_POLYGON |
| 0.5 | 7 | 3 | +31.87 | USDT_POLYGON |
| 1 | 7 | 3 | +31.87 | USDT_POLYGON |
| 2 | 7 | 3 | +31.87 | USDT_POLYGON |
| 3 | 7 | 3 | +35.69 | USDT_POLYGON |
| 5 | 7 | 3 | +35.69 | USDT_POLYGON |
| 10 | 7 | 3 | +35.69 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 8% |
| 0.5 | 100% | 8% |
| 1 | 100% | 8% |
| 2 | 97% | 8% |
| 3 | 89% | 8% |
| 5 | 89% | 8% |
| 10 | 75% | 8% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 14/10 17h | 13 | +10.63 | -11.40 | -1.61 |
| 14/10 18h | 23 | +11.23 | -12.20 | -0.99 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | lifiIntents | 25 | +10.85 | +11.85 | 0.003 | 7s |
| A2B | relaydepository | 10 | +12.00 | +57.72 | 0.003 | 2s |
| A2B | polymerStandard | 3 | +9.68 | +9.72 | 0.004 | 1080s |
| B2A | across | 27 | -11.95 | -11.06 | 0.009 | 4s |
| B2A | relaydepository | 9 | -13.49 | +71.47 | 0.008 | 2s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -1.03 bps (~US$ -0.21), positiva em 22% dos ciclos. Mas executando cada perna so quando paga >= 3 bps, a simulacao fez 7 operacoes e US$ +35.69 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 408: {"message":"Request exceeded 30000ms processing time on GET /v1/quote/`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
