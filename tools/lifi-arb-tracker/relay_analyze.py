#!/usr/bin/env python3
"""Relatorio (Markdown) da rota Relay a partir dos JSONL do relay_tracker.py.

Responde: com que frequencia a ida+volta fecha acima de zero, quanto dura cada janela de
oportunidade, em que horarios acontece e se o valor operado muda o resultado.
Cenario "sem taxa" devolve a taxa da plataforma LI.FI (a detectada em feeCosts, ou 0,25%).
"""
import argparse
import collections
import datetime as dt
import json
import re
import statistics
import sys

BRT = dt.timezone(dt.timedelta(hours=-3))


def load(paths):
    rows = []
    for p in paths:
        with open(p, encoding="utf-8") as f:
            rows += [json.loads(line) for line in f if line.strip()]
    rows.sort(key=lambda r: r["ts"])
    return rows


def leg_bps(r, no_fee, fee_default):
    rate = r["to_amount"] / r["from_amount"]
    if no_fee:
        rate /= 1 - (r.get("platform_fee_pct") or fee_default)
    return (rate - 1) * 1e4


def pct(vals, q):
    s = sorted(vals)
    k = (len(s) - 1) * q
    lo, hi = int(k), min(int(k) + 1, len(s) - 1)
    return s[lo] + (s[hi] - s[lo]) * (k - lo)


def row_stats(label, vals):
    if not vals:
        return f"| {label} | 0 | - | - | - | - | - |"
    pos = sum(v > 0 for v in vals) / len(vals) * 100
    return (f"| {label} | {len(vals)} | {min(vals):+.1f} | {statistics.median(vals):+.1f} | "
            f"{pct(vals, 0.9):+.1f} | {max(vals):+.1f} | {pos:.0f}% |")


def episodes(cyc, step):
    """Agrupa ciclos positivos consecutivos (folga de 2 intervalos) em janelas."""
    eps, cur = [], []
    for c in cyc:
        if c["net"] > 0:
            if cur and (c["t"] - cur[-1]["t"]).total_seconds() > 2 * step:
                eps.append(cur)
                cur = []
            cur.append(c)
        elif cur:
            eps.append(cur)
            cur = []
    if cur:
        eps.append(cur)
    return eps


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("inputs", nargs="+")
    ap.add_argument("--out", required=True)
    ap.add_argument("--fee-if-undetected", type=float, default=0.0025)
    args = ap.parse_args()

    rows = load(args.inputs)
    ok = [r for r in rows if r.get("ok")]
    errs = [r for r in rows if not r.get("ok")]
    L = []
    w = L.append
    w("# Relatorio da rota Relay (USDC Base <-> USDT Polygon)")
    w("")
    if not ok:
        w(f"Nenhuma cotacao valida; {len(errs)} erros.")
        for e in errs[:10]:
            w(f"- {e['ts']} {e['amount']:.0f} {e['direction']}: `{e.get('error', '')[:200]}`")
        open(args.out, "w", encoding="utf-8").write("\n".join(L))
        return 1

    for r in ok:
        r["t"] = dt.datetime.fromisoformat(r["ts"])
    cycles = sorted({r["cycle"] for r in ok})
    step = statistics.median(b - a for a, b in zip(
        [float(c) for c in cycles], [float(c) for c in cycles[1:]])) if len(cycles) > 1 else 120.0
    not_relay = [r for r in ok if not r.get("is_relay", True)]
    w(f"Periodo: {ok[0]['t'].astimezone(BRT):%d/%m %H:%M} ate {ok[-1]['t'].astimezone(BRT):%d/%m %H:%M} (Brasilia)  ")
    w(f"Cotacoes validas: {len(ok)} | erros: {len(errs)} | ciclos: {len(cycles)} | intervalo tipico: {step:.0f}s  ")
    if not_relay:
        w(f"Atencao: {len(not_relay)} cotacoes vieram de outra rota ({collections.Counter(r['tool'] for r in not_relay).most_common(3)}); "
          "foram usadas assim mesmo.")
    w("")
    w("Unidade: bps (1 bp = 0,01%). Resultado liquido de gas estimado. Positivo = a ida+volta fecha acima do valor inicial.")
    w("")

    by = collections.defaultdict(lambda: collections.defaultdict(dict))  # amount -> cycle -> dir -> row
    for r in ok:
        by[r["amount"]][r["cycle"]][r["direction"]] = r

    result = {}
    for no_fee, title in ((True, "Sem a taxa da LI.FI (o seu caso)"), (False, "Como cotado (com a taxa)")):
        w(f"## {title}")
        w("")
        w("| | n | min | mediana | p90 | max | % > 0 |")
        w("|---|---|---|---|---|---|---|")
        for amt in sorted(by):
            pairs = [d for d in by[amt].values() if "A2B" in d and "B2A" in d]
            ida = [leg_bps(d["A2B"], no_fee, args.fee_if_undetected) for d in pairs]
            vol = [leg_bps(d["B2A"], no_fee, args.fee_if_undetected) for d in pairs]
            net = []
            cyc = []
            for d, a, b in zip(pairs, ida, vol):
                gas = d["A2B"]["gas_usd"] + d["B2A"]["gas_usd"]
                n = ((1 + a / 1e4) * (1 + b / 1e4) - 1) * 1e4 - gas / amt * 1e4
                net.append(n)
                cyc.append({"t": d["A2B"]["t"], "net": n, "ida": a, "vol": b})
            if no_fee:
                result[amt] = cyc
            w(row_stats(f"{amt:,.0f} ida", ida))
            w(row_stats(f"{amt:,.0f} volta", vol))
            w(row_stats(f"**{amt:,.0f} ida+volta**", net))
        w("")

    w("## Janelas de oportunidade (sem taxa, liquido de gas)")
    w("")
    w("Janela = ciclos seguidos com ida+volta positiva. A duracao tem erro de ate um intervalo de coleta.")
    w("")
    w("| valor | ciclos > 0 | janelas | duracao mediana | duracao maxima | melhor (bps) | melhor (US$) |")
    w("|---|---|---|---|---|---|---|")
    for amt in sorted(result):
        cyc = result[amt]
        eps = episodes(cyc, step)
        durs = [((e[-1]["t"] - e[0]["t"]).total_seconds() + step) for e in eps]
        best = max((c["net"] for c in cyc), default=0)
        w(f"| {amt:,.0f} | {sum(c['net'] > 0 for c in cyc)}/{len(cyc)} | {len(eps)} | "
          f"{(statistics.median(durs) if durs else 0):.0f}s | {(max(durs) if durs else 0):.0f}s | "
          f"{best:+.1f} | {best / 1e4 * amt:+.2f} |")
    w("")

    w("## Por hora (Brasilia): % de ciclos positivos e media (sem taxa)")
    w("")
    w("| hora | " + " | ".join(f"{a:,.0f}" for a in sorted(result)) + " |")
    w("|---|" + "---|" * len(result))
    hours = collections.defaultdict(lambda: collections.defaultdict(list))
    for amt, cyc in result.items():
        for c in cyc:
            hours[c["t"].astimezone(BRT).strftime("%d/%m %Hh")][amt].append(c["net"])
    for h in sorted(hours, key=lambda k: (k[3:5], k[:2], k[6:])):
        cells = []
        for amt in sorted(result):
            v = hours[h].get(amt, [])
            cells.append(f"{sum(x > 0 for x in v) / len(v) * 100:.0f}% ({statistics.mean(v):+.1f})" if v else "-")
        w(f"| {h} | " + " | ".join(cells) + " |")
    w("")

    w("## Veredito")
    w("")
    amt_best = max(result, key=lambda a: sum(c["net"] > 0 for c in result[a]) / max(len(result[a]), 1))
    cyc = result[amt_best]
    share = sum(c["net"] > 0 for c in cyc) / len(cyc) * 100
    eps = episodes(cyc, step)
    if len(cyc) < 30:
        w(f"**Amostra pequena** ({len(cyc)} ciclos com {amt_best:,.0f}); espere mais dados antes de concluir.")
    elif share >= 20 and statistics.median([c["net"] for c in cyc]) > 0:
        w(f"**Oportunidade recorrente.** Com {amt_best:,.0f}, {share:.0f}% dos ciclos fecharam positivos, "
          f"mediana {statistics.median([c['net'] for c in cyc]):+.1f} bps.")
    elif eps:
        w(f"**Oportunidade pontual.** Com {amt_best:,.0f}, {sum(c['net'] > 0 for c in cyc)} ciclos "
          f"({share:.1f}%) em {len(eps)} janelas; a mediana geral e {statistics.median([c['net'] for c in cyc]):+.1f} bps. "
          "So compensa se voce monitorar e executar nas janelas.")
    else:
        w(f"**Sem oportunidade na rota Relay** neste periodo (mediana {statistics.median([c['net'] for c in cyc]):+.1f} bps).")
    w("")
    w("Limitacoes: sao cotacoes, nao execucoes; o preco pode nao se confirmar na execucao e o solver pode limitar volume.")
    w("")
    if errs:
        kinds = collections.Counter(re.sub(r"\d+", "N", e.get("error", "")[:70]) for e in errs)
        w("## Erros")
        w("")
        for k, n in kinds.most_common(6):
            w(f"- {n}x `{k}`")
        w("")

    text = "\n".join(L)
    open(args.out, "w", encoding="utf-8").write(text)
    print(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
