# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 14/10 19:15 ate 14/10 20:29 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (26), `Relayer gas fee` (26), `Relayer Gas fee` (21), `Relayer Service fee` (21)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -22.16 | -21.44 | -13.38 | -13.14 | +27.19 | 3% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -40.00 | -39.46 | -37.62 | -29.42 | +54.64 | 3% |
| Ida, liquido de gas (bps) | 37 | -22.17 | -21.45 | -13.40 | -13.16 | +27.17 | 3% |
| Volta, liquido de gas (bps) | 37 | -40.04 | -39.50 | -37.66 | -29.46 | +54.60 | 3% |
| **Ida+volta simultanea** (bps) | 37 | -61.33 | -59.27 | -50.85 | -33.71 | +41.39 | 3% |
| **Ida+volta, liquido de gas** (bps) | 37 | -61.39 | -59.32 | -50.91 | -33.77 | +41.34 | 3% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +2.85 | +3.57 | +11.65 | +11.89 | +52.32 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -15.04 | -14.50 | -12.65 | -4.43 | +79.84 | 11% |
| Ida, liquido de gas (bps) | 37 | +2.84 | +3.56 | +11.63 | +11.87 | +52.30 | 100% |
| Volta, liquido de gas (bps) | 37 | -15.08 | -14.54 | -12.69 | -4.47 | +79.80 | 11% |
| **Ida+volta simultanea** (bps) | 37 | -11.45 | -9.38 | -0.92 | +16.31 | +91.79 | 16% |
| **Ida+volta, liquido de gas** (bps) | 37 | -11.50 | -9.43 | -0.98 | +16.25 | +91.73 | 16% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 9 | 4 | +30.71 | USDT_POLYGON |
| 0.5 | 9 | 4 | +30.71 | USDT_POLYGON |
| 1 | 9 | 4 | +30.71 | USDT_POLYGON |
| 2 | 9 | 4 | +30.71 | USDT_POLYGON |
| 3 | 9 | 4 | +32.43 | USDT_POLYGON |
| 5 | 7 | 3 | +31.02 | USDT_POLYGON |
| 10 | 7 | 3 | +31.02 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 11% |
| 0.5 | 100% | 11% |
| 1 | 100% | 11% |
| 2 | 100% | 11% |
| 3 | 95% | 11% |
| 5 | 78% | 8% |
| 10 | 78% | 8% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 14/10 19h | 23 | +11.43 | -12.89 | -1.18 |
| 14/10 20h | 14 | +11.73 | -12.69 | -0.93 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | lifiIntents | 28 | +11.75 | +11.95 | 0.003 | 7s |
| A2B | relaydepository | 10 | +3.59 | +52.32 | 0.003 | 2s |
| B2A | across | 26 | -12.65 | -12.15 | 0.008 | 4s |
| B2A | relaydepository | 11 | -14.21 | +79.84 | 0.008 | 2s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -0.98 bps (~US$ -0.20), positiva em 16% dos ciclos. Mas executando cada perna so quando paga >= 3 bps, a simulacao fez 9 operacoes e US$ +32.43 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
