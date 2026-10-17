# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 14/10 20:55 ate 14/10 22:09 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (27), `Relayer gas fee` (27), `Relayer Gas fee` (17), `Relayer Service fee` (17)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -22.14 | -21.59 | -13.58 | -13.24 | +75.04 | 5% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -39.66 | -39.47 | -37.32 | -37.12 | +48.65 | 5% |
| Ida, liquido de gas (bps) | 37 | -22.16 | -21.61 | -13.60 | -13.25 | +75.02 | 5% |
| Volta, liquido de gas (bps) | 37 | -39.71 | -39.51 | -37.37 | -37.17 | +48.61 | 5% |
| **Ida+volta simultanea** (bps) | 37 | -60.76 | -59.02 | -50.85 | -33.45 | +37.44 | 8% |
| **Ida+volta, liquido de gas** (bps) | 37 | -60.81 | -59.08 | -50.91 | -33.51 | +37.37 | 8% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +2.86 | +3.41 | +11.45 | +11.79 | +100.29 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -14.70 | -14.51 | -12.35 | -12.15 | +73.83 | 5% |
| Ida, liquido de gas (bps) | 37 | +2.85 | +3.40 | +11.43 | +11.77 | +100.27 | 100% |
| Volta, liquido de gas (bps) | 37 | -14.74 | -14.54 | -12.40 | -12.20 | +73.79 | 5% |
| **Ida+volta simultanea** (bps) | 37 | -10.88 | -9.13 | -0.92 | +16.57 | +87.81 | 11% |
| **Ida+volta, liquido de gas** (bps) | 37 | -10.93 | -9.19 | -0.98 | +16.51 | +87.75 | 11% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 5 | 2 | +44.13 | USDT_POLYGON |
| 0.5 | 5 | 2 | +44.13 | USDT_POLYGON |
| 1 | 5 | 2 | +44.13 | USDT_POLYGON |
| 2 | 5 | 2 | +44.13 | USDT_POLYGON |
| 3 | 5 | 2 | +44.13 | USDT_POLYGON |
| 5 | 5 | 2 | +44.13 | USDT_POLYGON |
| 10 | 5 | 2 | +44.13 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 5% |
| 0.5 | 100% | 5% |
| 1 | 100% | 5% |
| 2 | 100% | 5% |
| 3 | 97% | 5% |
| 5 | 86% | 5% |
| 10 | 86% | 5% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 14/10 20h | 3 | +11.43 | -12.21 | -0.78 |
| 14/10 21h | 30 | +11.43 | -12.40 | -0.93 |
| 14/10 22h | 4 | +11.33 | -12.61 | -1.24 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | lifiIntents | 31 | +11.45 | +11.85 | 0.003 | 7s |
| A2B | relaydepository | 7 | +3.22 | +100.29 | 0.003 | 2s |
| B2A | across | 27 | -12.35 | -12.15 | 0.010 | 4s |
| B2A | relaydepository | 10 | -14.45 | +73.83 | 0.008 | 2s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -0.98 bps (~US$ -0.20), positiva em 11% dos ciclos. Mas executando cada perna so quando paga >= 0 bps, a simulacao fez 5 operacoes e US$ +44.13 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
