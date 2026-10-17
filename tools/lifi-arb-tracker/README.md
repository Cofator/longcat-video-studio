# LI.FI arbitrage tracker

Estuda se vale a pena a arbitragem ida e volta **USDC (Base) <-> USDT (Polygon)**
cotando a LI.FI a noite toda.

- `tracker.py`: a cada ciclo (120 s por padrao) pede 2 cotacoes de 2.000:
  ida (USDC Base -> USDT Polygon) e volta (USDT Polygon -> USDC Base). Grava em JSONL.
- `analyze.py`: gera `report.md` com dois cenarios:
  - **cotado**: exatamente o que a API devolveu;
  - **sem taxa**: devolve a taxa da plataforma LI.FI/Jumper (detectada em `feeCosts`;
    se a API nao mostrar nenhuma, assume 0,25%), que nao existe no seu fluxo.
    Taxas de bridge/DEX e gas continuam descontadas, porque voce paga de verdade.

O relatorio traz: distribuicao de cada perna e da volta completa (em bps, com e sem gas),
% do tempo em que cada perna paga, mediana por hora, comparacao por bridge,
uma simulacao "esperar a hora certa" para cada perna e um veredito.

## Rodando no GitHub Actions

O workflow `.github/workflows/lifi-arb-tracker.yml` roda sozinho a cada push nestes
arquivos (ou manualmente em *Actions -> Run workflow*). Ele coleta ate 10:30 UTC
(07:30 de Brasilia) em dois jobs seguidos de ~6 h e commita
`tools/lifi-arb-tracker/results/<data>/report.md` neste branch.

Opcional: cadastre o secret `LIFI_API_KEY` para ter limite de requisicoes maior
e diminuir o intervalo.

## Rodando local

```bash
python3 tools/lifi-arb-tracker/tracker.py --out quotes.jsonl --until-utc 10:30
python3 tools/lifi-arb-tracker/analyze.py quotes.jsonl --out report.md
```
