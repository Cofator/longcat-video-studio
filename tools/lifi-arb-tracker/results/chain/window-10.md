# Relatorio de arbitragem LI.FI: USDC_BASE <-> USDT_POLYGON

Periodo: 14/10 22:35 ate 14/10 23:49 (horario de Brasilia)  
Valor por cotacao: 2,000  
Cotacoes validas: 75 | erros: 7 | ciclos completos (ida+volta): 37

Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.

## Taxa da plataforma (LI.FI/Jumper) nas cotacoes

Taxa detectada em 75/75 cotacoes; mediana 0.250%. Nomes: `LIFI Fixed Fee` (75).

Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): `LIFI Fixed Fee` (75), `Relayer fee` (26), `Relayer gas fee` (26), `Relayer Gas fee` (17), `Relayer Service fee` (17), `Network Gas` (3), `Execution Gas` (3), `Service Fee` (3), `LayerSwap fee` (1), `NearIntents Protocol Fee` (1)

## Como cotado (com a taxa)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -25.19 | -21.20 | -13.68 | -12.55 | +105.92 | 8% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -39.45 | -39.21 | -37.52 | +47.45 | +70.00 | 14% |
| Ida, liquido de gas (bps) | 37 | -25.27 | -21.25 | -13.69 | -12.68 | +105.91 | 8% |
| Volta, liquido de gas (bps) | 37 | -39.49 | -39.26 | -37.57 | +47.41 | +69.96 | 14% |
| **Ida+volta simultanea** (bps) | 37 | -63.65 | -59.26 | -51.18 | +41.14 | +68.11 | 22% |
| **Ida+volta, liquido de gas** (bps) | 37 | -63.77 | -59.32 | -51.24 | +41.08 | +68.04 | 22% |

## Sem a taxa da LI.FI (o que vale na pratica)

| | n | min | p10 | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|---|
| Ida USDC_BASE->USDT_POLYGON (bps) | 37 | -0.20 | +3.81 | +11.35 | +12.48 | +131.25 | 97% |
| Volta USDT_POLYGON->USDC_BASE (bps) | 37 | -14.49 | -14.24 | -12.55 | +72.64 | +95.24 | 14% |
| Ida, liquido de gas (bps) | 37 | -0.27 | +3.76 | +11.33 | +12.36 | +131.24 | 97% |
| Volta, liquido de gas (bps) | 37 | -14.53 | -14.29 | -12.61 | +72.60 | +95.19 | 14% |
| **Ida+volta simultanea** (bps) | 37 | -13.78 | -9.37 | -1.25 | +91.53 | +118.64 | 22% |
| **Ida+volta, liquido de gas** (bps) | 37 | -13.90 | -9.43 | -1.31 | +91.47 | +118.57 | 22% |

## Estrategia esperando a hora certa (sem taxa, com gas)

Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; depois faz a volta so quando a volta paga >= limiar; repete a noite toda. Respeita o tempo estimado do bridge entre uma operacao e outra.

| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |
|---|---|---|---|---|
| 0 | 9 | 4 | +74.99 | USDT_POLYGON |
| 0.5 | 9 | 4 | +74.99 | USDT_POLYGON |
| 1 | 9 | 4 | +74.99 | USDT_POLYGON |
| 2 | 9 | 4 | +74.99 | USDT_POLYGON |
| 3 | 9 | 4 | +74.99 | USDT_POLYGON |
| 5 | 9 | 4 | +74.99 | USDT_POLYGON |
| 10 | 9 | 4 | +74.99 | USDT_POLYGON |

## Com que frequencia cada perna paga (sem taxa, liquido de gas)

| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |
|---|---|---|
| 0 | 97% | 14% |
| 0.5 | 97% | 14% |
| 1 | 97% | 14% |
| 2 | 97% | 14% |
| 3 | 92% | 14% |
| 5 | 84% | 14% |
| 10 | 84% | 14% |

## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas

| hora | ciclos | ida | volta | ida+volta |
|---|---|---|---|---|
| 14/10 22h | 13 | +11.23 | -12.30 | -1.18 |
| 14/10 23h | 24 | +11.43 | -12.87 | -1.47 |

## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)

| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |
|---|---|---|---|---|---|---|
| A2B | lifiIntents | 26 | +11.30 | +11.92 | 0.007 | 7s |
| A2B | relaydepository | 8 | +4.58 | +131.25 | 0.004 | 2s |
| A2B | polymerStandard | 3 | +11.65 | +13.33 | 0.017 | 1080s |
| A2B | near | 1 | +10.58 | +10.58 | 0.006 | 39s |
| B2A | across | 26 | -12.60 | -12.25 | 0.010 | 4s |
| B2A | relaydepository | 9 | +71.01 | +95.24 | 0.009 | 2s |
| B2A | layerswap | 1 | -9.10 | -9.10 | 0.010 | 31s |
| B2A | lifiIntents | 1 | -14.22 | -14.22 | 0.010 | 7s |

## Veredito

**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e -1.31 bps (~US$ -0.26), positiva em 22% dos ciclos. Mas executando cada perna so quando paga >= 0 bps, a simulacao fez 9 operacoes e US$ +74.99 na noite.

Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.

## Erros

- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 43 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 37 minutes","code":1005}`
- 2x `HTTP 429: {"message":"Rate limit exceeded, retry in 20 minutes","code":1005}`
- 1x `HTTP 429: {"message":"Rate limit exceeded, retry in 46 minutes","code":1005}`
