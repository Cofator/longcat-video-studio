# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 15:24 ate 16/10 16:38 (Brasilia)  
Cotacoes validas: 75 | erros: 7 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | +4.1 | +4.3 | +4.7 | +5.0 | 100% |
| 2,000 volta | 37 | -15.8 | -13.8 | -13.2 | -13.1 | 0% |
| **2,000 ida+volta** | 37 | -11.5 | -9.4 | -9.0 | -8.8 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -20.9 | -20.7 | -20.3 | -20.0 | 0% |
| 2,000 volta | 37 | -40.7 | -38.7 | -38.1 | -38.1 | 0% |
| **2,000 ida+volta** | 37 | -61.4 | -59.3 | -58.9 | -58.7 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/37 | 0 | 0s | 0s | -8.8 | -1.76 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 15h | 0% (-9.6) |
| 16/10 16h | 0% (-9.8) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -9.4 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
