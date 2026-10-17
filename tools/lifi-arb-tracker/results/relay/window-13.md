# Relatorio da rota Relay (USDC Base <-> USDT Polygon)

Periodo: 17/10 00:34 ate 17/10 01:48 (Brasilia)  
Cotacoes validas: 75 | erros: 7 | ciclos: 38 | intervalo tipico: 120s  

Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.

## Sem a taxa da LI.FI (o seu caso)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | +4.8 | +4.9 | +5.0 | +5.1 | 100% |
| 2,000 volta | 37 | -15.5 | -14.9 | -14.5 | -14.3 | 0% |
| **2,000 ida+volta** | 37 | -11.0 | -10.1 | -9.7 | -9.5 | 0% |

## Como cotado (com a taxa)

| | n | min | mediana | p90 | max | % > 0 |
|---|---|---|---|---|---|---|
| 2,000 ida | 37 | -20.3 | -20.1 | -20.0 | -19.9 | 0% |
| 2,000 volta | 37 | -40.5 | -39.9 | -39.5 | -39.2 | 0% |
| **2,000 ida+volta** | 37 | -60.9 | -60.0 | -59.6 | -59.4 | 0% |

## Janelas de oportunidade (sem taxa, liquido de gas)

Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.

| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |
|---|---|---|---|---|---|---|
| 2,000 | 0/37 | 0 | 0s | 0s | -9.5 | -1.90 |

## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)

| hora | 2,000 |
|---|---|
| 17/10 00h | 0% (-10.3) |
| 17/10 01h | 0% (-10.0) |

## Veredito

**Sem oportunidade na rota Relay** neste periodo (mediana -10.1 bps).

Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.

## Erros

- 7x `HTTP N: {"message":"Rate limit exceeded, retry in N minutes","code"`
