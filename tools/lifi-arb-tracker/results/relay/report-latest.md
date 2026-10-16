# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 02:32 ate 16/10 07:27 (Brasilia)  
Cotacoes validas: 225 | erros: 21 | ciclos: 114 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 111 | -26.9 | +3.4 | +3.5 | +3.7 | 96% |
| 2,000 volta | 111 | -15.0 | -12.7 | -12.2 | -12.0 | 0% |
| **2,000 ida+volta** | 111 | -40.2 | -9.9 | -9.5 | -9.0 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 111 | -51.8 | -21.6 | -21.5 | -21.3 | 0% |
| 2,000 volta | 111 | -39.9 | -37.7 | -37.2 | -37.0 | 0% |
| **2,000 ida+volta** | 111 | -89.9 | -59.8 | -59.3 | -58.9 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/111 | 0 | 0s | 0s | -9.0 | -1.81 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 02h | 0% (-9.7) |
| 16/10 03h | 0% (-10.6) |
| 16/10 04h | 0% (-10.3) |
| 16/10 05h | 0% (-11.9) |
| 16/10 06h | 0% (-9.8) |
| 16/10 07h | 0% (-12.7) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -9.9 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 21x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
