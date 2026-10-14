# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 14/10 15:54 ate 14/10 17:08 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer Gas fee` (26), `Relayer Service fee` (26), `Relayer fee` (24), `Relayer gas fee` (24), `Network Gas` (22), `Execution Gas` (22), `Service Fee` (22), `NearIntents Protocol Fee` (2), `1ClickSwap API Fee` (2)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -23.18 | -22.56 | -15.25 | -12.69 | +1.72 | 5% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -38.53 | -38.32 | -36.23 | -35.93 | -19.86 | 0% |
| Ida, liquido de gas (bps) | 37 | -23.19 | -22.57 | -15.27 | -12.70 | +1.70 | 5% |
| Volta, liquido de gas (bps) | 37 | -38.58 | -38.35 | -36.27 | -35.97 | -19.90 | 0% |
| **Ida+volta simultanea** (bps) | 37 | -61.24 | -58.96 | -51.55 | -42.23 | -27.64 | 0% |
| **Ida+volta, liquido de gas** (bps) | 37 | -61.29 | -59.02 | -51.61 | -42.29 | -27.69 | 0% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | +1.83 | +2.45 | +9.77 | +12.34 | +26.78 | 100% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -13.57 | -13.35 | -11.26 | -10.96 | +5.15 | 5% |
| Ida, liquido de gas (bps) | 37 | +1.81 | +2.43 | +9.75 | +12.33 | +26.77 | 100% |
| Volta, liquido de gas (bps) | 37 | -13.61 | -13.39 | -11.30 | -11.00 | +5.12 | 5% |
| **Ida+volta simultanea** (bps) | 37 | -11.36 | -9.07 | -1.62 | +7.75 | +22.41 | 16% |
| **Ida+volta, liquido de gas** (bps) | 37 | -11.41 | -9.13 | -1.68 | +7.69 | +22.36 | 16% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 5 | 2 | +5.50 | USDT_POLYGON |
| 0.5 | 3 | 1 | +4.93 | USDT_POLYGON |
| 1 | 3 | 1 | +4.93 | USDT_POLYGON |
| 2 | 3 | 1 | +4.93 | USDT_POLYGON |
| 3 | 3 | 1 | +4.93 | USDT_POLYGON |
| 5 | 3 | 1 | +4.93 | USDT_POLYGON |
| 10 | 1 | 0 | +2.05 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 100% | 5% |
| 0.5 | 100% | 3% |
| 1 | 100% | 3% |
| 2 | 95% | 3% |
| 3 | 86% | 3% |
| 5 | 84% | 3% |
| 10 | 24% | 0% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 14/10 15h | 3 | +9.59 | -11.30 | -1.92 |
| 14/10 16h | 30 | +9.73 | -11.20 | -1.64 |
| 14/10 17h | 4 | +9.97 | -11.65 | -1.60 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | polymerStandard | 22 | +9.78 | +10.49 | 0.004 | 1080s |
| A2B | relaydepository | 13 | +8.05 | +26.78 | 0.003 | 2s |
| A2B | near | 2 | +6.46 | +8.91 | 0.003 | 1826s |
| A2B | lifiIntents | 1 | +2.66 | +2.66 | 0.003 | 7s |
| B2A | across | 24 | -11.16 | -10.96 | 0.009 | 4s |
| B2A | relaydepository | 13 | -13.31 | +5.15 | 0.008 | 2s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -1.68 bps (~US$ -0.34), positiva em 16% dos ciclos. Mas executando cada perna so quando paga >= 0 bps, a simulacao fez 5 operacoes e US$ +5.50 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
