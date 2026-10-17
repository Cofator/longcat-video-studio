# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 16/10 22:44 ate 16/10 23:58 (Brasilia)  
Cotacoes validas: 75 | erros: 7 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | +4.7 | +4.9 | +5.0 | +5.1 | 100% |
| 2,000 volta | 37 | -15.6 | -15.0 | -14.6 | -7.6 | 0% |
| **2,000 ida+volta** | 37 | -11.1 | -10.4 | -10.0 | -3.1 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -20.3 | -20.1 | -20.0 | -19.9 | 0% |
| 2,000 volta | 37 | -40.6 | -40.0 | -39.5 | -32.6 | 0% |
| **2,000 ida+volta** | 37 | -61.0 | -60.3 | -59.9 | -53.0 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/37 | 0 | 0s | 0s | -3.1 | -0.62 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 16/10 22h | 0% (-10.3) |
| 16/10 23h | 0% (-10.2) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -10.4 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
