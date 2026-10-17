# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 20:54 ate 16/10 22:08 (Brasilia)  
Cotacoes validas: 75 | erros: 7 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | +4.1 | +4.4 | +4.5 | +4.7 | 100% |
| 2,000 volta | 37 | -15.0 | -14.4 | -13.4 | -13.0 | 0% |
| **2,000 ida+volta** | 37 | -11.0 | -10.4 | -9.4 | -9.0 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -20.9 | -20.7 | -20.5 | -20.3 | 0% |
| 2,000 volta | 37 | -40.0 | -39.4 | -38.4 | -38.0 | 0% |
| **2,000 ida+volta** | 37 | -60.9 | -60.3 | -59.3 | -58.9 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/37 | 0 | 0s | 0s | -9.0 | -1.79 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 20h | 0% (-9.1) |
| 16/10 21h | 0% (-10.3) |
| 16/10 22h | 0% (-10.5) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -10.4 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
