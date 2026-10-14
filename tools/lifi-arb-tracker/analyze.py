#!/usr/bin/env python3
"""Gera o relatorio (Markdown) a partir dos JSONL do tracker.py.

Cenarios:
  cotado   - exatamente o que a API devolveu
  sem_taxa - devolvendo a taxa da plataforma LI.FI/Jumper. Usa a taxa detectada
             em feeCosts; se nenhuma for detectada, assume --fee-if-undetected
             (0,25% por padrao, que e o spread informado pelo usuario).
"""
import argparse
import collections
import datetime as dt
import json
import statistics
import sys

BRT = dt.timezone(dt.timedelta(hours=-3))
THRESHOLDS_BPS = [0, 0.5, 1, 2, 3, 5, 10]


def load(paths):
    rows = []
    for p in paths:
        with open(p, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    rows.append(json.loads(line))
    rows.sort(key=lambda r: r["ts"])
    return rows


def pct(values, q):
    if not values:
        return float("nan")
    s = sorted(values)
    k = (len(s) - 1) * q
    lo, hi = int(k), min(int(k) + 1, len(s) - 1)
    return s[lo] + (s[hi] - s[lo]) * (k - lo)


def stats_line(label, values, fmt="{:+.2f}"):
    if not values:
        return f"| {label} | 0 | - | - | - | - | - | - |"
    pos = sum(1 for v in values if v > 0) / len(values) * 100
    cells = [fmt.format(x) for x in (min(values), pct(values, 0.1), statistics.median(values),
                                      pct(values, 0.9), max(values))]
    return f"| {label} | {len(values)} | " + " | ".join(cells) + f" | {pos:.0f}% |"


STATS_HEADER = ("| | n | min | p10 | mediana | p90 | max | % > 0 |\n"
                "|---|---|---|---|---|---|---|---|")


def leg_rate(row, scenario, fee_if_undetected):
    r = row["to_amount"] / row["from_amount"]
    if scenario == "sem_taxa":
        fee = row.get("platform_fee_pct") or fee_if_undetected
        r = r / (1 - fee)
    return r


def simulate(legs, threshold_bps, amount, with_gas):
    """Estrategia assincrona: segura A; troca A->B quando a perna A2B paga >= limiar,
    depois B->A quando a perna B2A paga >= limiar. Respeita o tempo de execucao do bridge."""
    holding = "A"
    busy_until = None
    profit = 0.0
    swaps = 0
    for leg in legs:
        if busy_until and leg["t"] < busy_until:
            continue
        want = "A2B" if holding == "A" else "B2A"
        if leg["direction"] != want:
            continue
        if (leg["rate"] - 1) * 1e4 >= threshold_bps:
            profit += amount * (leg["rate"] - 1) - (leg["gas"] if with_gas else 0.0)
            swaps += 1
            holding = "B" if holding == "A" else "A"
            busy_until = leg["t"] + dt.timedelta(seconds=leg["duration"] or 0)
    return swaps, profit, holding


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("inputs", nargs="+")
    ap.add_argument("--out", required=True)
    ap.add_argument("--fee-if-undetected", type=float, default=0.0025)
    args = ap.parse_args()

    rows = load(args.inputs)
    ok = [r for r in rows if r.get("ok")]
    errors = [r for r in rows if not r.get("ok")]
    if not ok:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(f"# Relatorio LI.FI\n\nNenhuma cotacao valida. {len(errors)} erros.\n\n")
            for e in errors[:20]:
                f.write(f"- {e['ts']} {e['direction']}: `{e.get('error', '')[:300]}`\n")
        print("sem dados validos", file=sys.stderr)
        return 1

    amount = statistics.median(r["from_amount"] for r in ok)
    first = ok[0]
    a_name = first["src"] if first["direction"] == "A2B" else first["dst"]
    b_name = first["dst"] if first["direction"] == "A2B" else first["src"]
    for r in ok:
        r["t"] = dt.datetime.fromisoformat(r["ts"])

    detected = [r["platform_fee_pct"] for r in ok if r.get("platform_fee_pct")]
    fee_names = collections.Counter(f["name"] for r in ok for f in r.get("fees", []))
    platform_names = collections.Counter(f["name"] for r in ok for f in r.get("fees", []) if f.get("platform"))

    cycles = collections.defaultdict(dict)
    for r in ok:
        cycles[r["cycle"]][r["direction"]] = r
    pairs = [c for c in cycles.values() if "A2B" in c and "B2A" in c]

    t0, t1 = ok[0]["t"], ok[-1]["t"]

    L = []
    w = L.append
    w(f"# Relatorio de arbitragem LI.FI: {a_name} <-> {b_name}")
    w("")
    w(f"Periodo: {t0.astimezone(BRT):%d/%m %H:%M} ate {t1.astimezone(BRT):%d/%m %H:%M} (horario de Brasilia)  ")
    w(f"Valor por cotacao: {amount:,.0f}  ")
    w(f"Cotacoes validas: {len(ok)} | erros: {len(errors)} | ciclos completos (ida+volta): {len(pairs)}")
    w("")
    w("Unidade: **bps** (1 bp = 0,01%). Em 2.000 USD, 1 bp = US$ 0,20.")
    w("")

    # ---- taxa da plataforma
    w("## Taxa da plataforma (LI.FI/Jumper) nas cotacoes")
    w("")
    if detected:
        w(f"Taxa detectada em {len(detected)}/{len(ok)} cotacoes; mediana {statistics.median(detected)*100:.3f}%. "
          f"Nomes: {', '.join(f'`{n}` ({c})' for n, c in platform_names.most_common())}.")
    else:
        w(f"Nenhuma taxa de plataforma veio no `feeCosts`. Para o cenario **sem taxa** foi assumido "
          f"{args.fee_if_undetected*100:.2f}% embutido no preco (o spread que voce informou).")
    if fee_names:
        w("")
        w("Todas as taxas vistas (inclui bridge/DEX, que voce paga de verdade): "
          + ", ".join(f"`{n}` ({c})" for n, c in fee_names.most_common(10)))
    w("")

    results = {}
    for scenario, title in (("cotado", "Como cotado (com a taxa)"), ("sem_taxa", "Sem a taxa da LI.FI (o que vale na pratica)")):
        legs = {"A2B": [], "B2A": []}
        legs_net = {"A2B": [], "B2A": []}
        rt_gross, rt_net = [], []
        for c in pairs:
            ra = leg_rate(c["A2B"], scenario, args.fee_if_undetected)
            rb = leg_rate(c["B2A"], scenario, args.fee_if_undetected)
            for d, rr in (("A2B", ra), ("B2A", rb)):
                legs[d].append((rr - 1) * 1e4)
                legs_net[d].append(((rr - 1) * amount - c[d]["gas_usd"]) / amount * 1e4)
            rt_gross.append((ra * rb - 1) * 1e4)
            gas = c["A2B"]["gas_usd"] + c["B2A"]["gas_usd"]
            rt_net.append(((ra * rb - 1) * amount - gas) / amount * 1e4)
        results[scenario] = (legs, legs_net, rt_gross, rt_net)

        w(f"## {title}")
        w("")
        w(STATS_HEADER)
        w(stats_line(f"Ida {a_name}->{b_name} (bps)", legs["A2B"]))
        w(stats_line(f"Volta {b_name}->{a_name} (bps)", legs["B2A"]))
        w(stats_line("Ida, liquido de gas (bps)", legs_net["A2B"]))
        w(stats_line("Volta, liquido de gas (bps)", legs_net["B2A"]))
        w(stats_line("**Ida+volta simultanea** (bps)", rt_gross))
        w(stats_line("**Ida+volta, liquido de gas** (bps)", rt_net))
        w("")

    legs, legs_net, rt_gross, rt_net = results["sem_taxa"]
    med_rt = statistics.median(rt_net)
    usd_med = med_rt / 1e4 * amount

    # ---- estrategia assincrona
    w("## Estrategia esperando a hora certa (sem taxa, com gas)")
    w("")
    w("Simulacao: voce comeca com USDC. Faz a ida so quando a ida paga >= limiar; "
      "depois faz a volta so quando a volta paga >= limiar; repete a noite toda. "
      "Respeita o tempo estimado do bridge entre uma operacao e outra.")
    w("")
    w("| limiar por perna (bps) | operacoes | voltas completas | lucro na noite (US$) | termina com |")
    w("|---|---|---|---|---|")
    timeline = []
    for r in ok:
        timeline.append({"t": r["t"], "direction": r["direction"],
                         "rate": leg_rate(r, "sem_taxa", args.fee_if_undetected),
                         "gas": r["gas_usd"], "duration": r.get("duration_s")})
    best = None
    for th in THRESHOLDS_BPS:
        swaps, profit, holding = simulate(timeline, th, amount, with_gas=True)
        w(f"| {th:g} | {swaps} | {swaps // 2} | {profit:+.2f} | {a_name if holding == 'A' else b_name} |")
        if best is None or profit > best[2]:
            best = (th, swaps, profit)
    w("")

    # ---- frequencia
    w("## Com que frequencia cada perna paga (sem taxa, liquido de gas)")
    w("")
    w("| limiar (bps) | % do tempo a ida paga | % do tempo a volta paga |")
    w("|---|---|---|")
    for th in THRESHOLDS_BPS:
        fa = sum(1 for v in legs_net["A2B"] if v >= th) / len(legs_net["A2B"]) * 100
        fb = sum(1 for v in legs_net["B2A"] if v >= th) / len(legs_net["B2A"]) * 100
        w(f"| {th:g} | {fa:.0f}% | {fb:.0f}% |")
    w("")

    # ---- por hora
    w("## Por hora (Brasilia) - mediana em bps, sem taxa, liquido de gas")
    w("")
    w("| hora | ciclos | ida | volta | ida+volta |")
    w("|---|---|---|---|---|")
    by_hour = collections.defaultdict(list)
    for c, a_, b_, rt in zip(pairs, legs_net["A2B"], legs_net["B2A"], rt_net):
        by_hour[c["A2B"]["t"].astimezone(BRT).strftime("%d/%m %Hh")].append((a_, b_, rt))
    for h in sorted(by_hour, key=lambda k: (k[3:5], k[:2], k[6:])):
        v = by_hour[h]
        w(f"| {h} | {len(v)} | {statistics.median(x[0] for x in v):+.2f} | "
          f"{statistics.median(x[1] for x in v):+.2f} | {statistics.median(x[2] for x in v):+.2f} |")
    w("")

    # ---- por ferramenta
    w("## Por rota/bridge escolhida pela LI.FI (sem taxa, bps, mediana)")
    w("")
    w("| direcao | ferramenta | n | mediana | max | gas medio US$ | tempo medio |")
    w("|---|---|---|---|---|---|---|")
    by_tool = collections.defaultdict(list)
    for r in ok:
        by_tool[(r["direction"], r.get("tool"))].append(r)
    for (d, tool), rs in sorted(by_tool.items(), key=lambda kv: (kv[0][0], -len(kv[1]))):
        bps = [(leg_rate(r, "sem_taxa", args.fee_if_undetected) - 1) * 1e4 for r in rs]
        dur = [r["duration_s"] for r in rs if r.get("duration_s")]
        w(f"| {d} | {tool} | {len(rs)} | {statistics.median(bps):+.2f} | {max(bps):+.2f} | "
          f"{statistics.mean(r['gas_usd'] for r in rs):.3f} | "
          f"{(statistics.mean(dur) if dur else 0):.0f}s |")
    w("")

    # ---- veredito
    w("## Veredito")
    w("")
    pos_rt = sum(1 for v in rt_net if v > 0) / len(rt_net) * 100
    if med_rt > 0:
        w(f"**Vale a pena.** Sem a taxa da LI.FI, a ida+volta feita na hora deu mediana de "
          f"{med_rt:+.2f} bps (~US$ {usd_med:+.2f} por volta de {amount:,.0f}), positiva em {pos_rt:.0f}% dos ciclos.")
    elif best and best[2] > 0 and best[1] >= 2:
        w(f"**Vale so esperando a hora certa.** Fazendo ida e volta juntas a mediana e "
          f"{med_rt:+.2f} bps (~US$ {usd_med:+.2f}), positiva em {pos_rt:.0f}% dos ciclos. "
          f"Mas executando cada perna so quando paga >= {best[0]:g} bps, a simulacao "
          f"fez {best[1]} operacoes e US$ {best[2]:+.2f} na noite.")
    else:
        w(f"**Nao vale.** Mesmo sem a taxa da LI.FI, a ida+volta deu mediana de {med_rt:+.2f} bps "
          f"(~US$ {usd_med:+.2f}), positiva em so {pos_rt:.0f}% dos ciclos, e nenhuma estrategia "
          f"de espera foi lucrativa.")
    w("")
    w("Limitacoes: sao cotacoes, nao execucoes. Slippage real, atraso entre cotar e executar e "
      "a taxa de gas do seu sistema podem mudar o resultado. O gas usado aqui e a estimativa da propria LI.FI.")
    w("")

    if errors:
        w("## Erros")
        w("")
        kinds = collections.Counter((e.get("error") or "")[:80] for e in errors)
        for k, n in kinds.most_common(8):
            w(f"- {n}x `{k}`")
        w("")

    with open(args.out, "w", encoding="utf-8") as f:
        f.write("\n".join(L))
    print("\n".join(L))
    return 0


if __name__ == "__main__":
    sys.exit(main())
