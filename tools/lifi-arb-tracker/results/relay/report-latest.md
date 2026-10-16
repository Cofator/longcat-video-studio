# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 02:32 ate 16/10 18:28 (Brasilia)  
Cotacoes validas: 674 | erros: 64 | ciclos: 342 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 332 | -26.9 | +3.4 | +4.3 | +8.0 | 98% |
| 2,000 volta | 332 | -15.8 | -12.7 | -11.8 | -11.1 | 0% |
| **2,000 ida+volta** | 332 | -40.2 | -9.8 | -9.1 | -5.1 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 332 | -51.8 | -21.6 | -20.7 | -17.0 | 0% |
| 2,000 volta | 332 | -40.7 | -37.7 | -36.8 | -36.1 | 0% |
| **2,000 ida+volta** | 332 | -89.9 | -59.7 | -59.0 | -55.0 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/332 | 0 | 0s | 0s | -5.1 | -1.02 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 02h | 0% (-9.7) |
| 16/10 03h | 0% (-10.6) |
| 16/10 04h | 0% (-10.3) |
| 16/10 05h | 0% (-11.9) |
| 16/10 06h | 0% (-9.8) |
| 16/10 07h | 0% (-12.7) |
| 16/10 08h | 0% (-9.4) |
| 16/10 09h | 0% (-9.6) |
| 16/10 10h | 0% (-9.7) |
| 16/10 11h | 0% (-9.3) |
| 16/10 12h | 0% (-9.9) |
| 16/10 13h | 0% (-9.8) |
| 16/10 14h | 0% (-10.6) |
| 16/10 15h | 0% (-9.6) |
| 16/10 16h | 0% (-9.8) |
| 16/10 17h | 0% (-9.7) |
| 16/10 18h | 0% (-9.7) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -9.8 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 63x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
- 1x `HTTP N: {"message":"No available quotes for the requested transfer",`
