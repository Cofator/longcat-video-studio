#!/usr/bin/env python3
"""Cota SO a rota Relay (relaydepository) da LI.FI, nos dois sentidos e em varios valores.

Objetivo: descobrir quando o preco da Relay fica acima de 1:1, por quanto tempo dura
e se depende do valor. Por ciclo, dispara todas as cotacoes em paralelo (ida e volta
de cada valor) para os timestamps ficarem proximos e o round trip ser quase simultaneo.

Com LIFI_API_KEY: intervalo 15 s e valores 500, 2000, 10000.
Sem chave: o limite publico da LI.FI estoura (HTTP 429), entao cai para 120 s e so 2000.
Usa so a biblioteca padrao.
"""
import argparse
import concurrent.futures as cf
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.error

import tracker

BRIDGE = "relaydepository"


def log(msg):
    print(f"[{dt.datetime.now(dt.timezone.utc):%H:%M:%S}] {msg}", flush=True)


def quote_once(base_url, src, dst, amount, from_address, api_key, cycle):
    row = {
        "ts": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "cycle": cycle,
        "amount": amount,
        "direction": "A2B" if src == "USDC_BASE" else "B2A",
        "src": src,
        "dst": dst,
    }
    try:
        q = tracker.fetch_quote(base_url, src, dst, amount, from_address, api_key,
                                {"allowBridges": BRIDGE})
        row.update(tracker.summarize(q, src, dst, amount))
        row["ok"] = True
        row["is_relay"] = row.get("tool") == BRIDGE
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:400]
        row.update(ok=False, error=f"HTTP {e.code}: {body}")
    except Exception as e:  # rede, timeout, JSON inesperado
        row.update(ok=False, error=f"{type(e).__name__}: {e}")
    return row


def retry_seconds(error):
    m = re.search(r"retry in (\d+) minutes?", error or "")
    return int(m.group(1)) * 60 + 5 if m else None


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", required=True)
    ap.add_argument("--amounts", default=None, help="ex: 500,2000,10000")
    ap.add_argument("--interval", type=float, default=None, help="segundos entre ciclos")
    ap.add_argument("--max-minutes", type=float, required=True)
    ap.add_argument("--base-url", default=os.environ.get("LIFI_BASE_URL", tracker.DEFAULT_BASE_URL))
    ap.add_argument("--from-address", default=os.environ.get("LIFI_FROM_ADDRESS", tracker.DEFAULT_FROM_ADDRESS))
    args = ap.parse_args()

    api_key = os.environ.get("LIFI_API_KEY") or None
    amounts = [float(x) for x in (args.amounts or ("500,2000,10000" if api_key else "2000")).split(",")]
    interval = args.interval if args.interval is not None else (15.0 if api_key else 120.0)
    deadline = time.time() + args.max_minutes * 60
    log(f"inicio; chave={'sim' if api_key else 'NAO (modo lento)'}; intervalo={interval}s; valores={amounts}")

    cycles = 0
    with open(args.out, "a", encoding="utf-8") as out, \
            cf.ThreadPoolExecutor(max_workers=2 * len(amounts)) as pool:
        while True:
            start = time.time()
            cycles += 1
            cycle = f"{start:.3f}"
            jobs = [pool.submit(quote_once, args.base_url, s, d, a, args.from_address, api_key, cycle)
                    for a in amounts for s, d in (("USDC_BASE", "USDT_POLYGON"), ("USDT_POLYGON", "USDC_BASE"))]
            rows = [j.result() for j in jobs]
            wait = 0.0
            for r in rows:
                out.write(json.dumps(r) + "\n")
                if not r["ok"] and "429" in r["error"][:10]:
                    wait = max(wait, min(retry_seconds(r["error"]) or 60.0, 600.0))
            out.flush()

            good = [r for r in rows if r["ok"]]
            msg = " | ".join(f"{r['amount']:.0f} {r['direction']} {r['to_amount']:.2f}"
                             + ("" if r["is_relay"] else f" ({r['tool']}!)") for r in good)
            log(f"ciclo {cycles}: {len(good)}/{len(rows)} ok  {msg}")
            if wait:
                log(f"limite de requisicoes: pausa de {wait:.0f}s")

            nxt = max(start + interval, time.time()) + wait
            if nxt >= deadline:
                log(f"fim; {cycles} ciclos")
                return 0
            time.sleep(max(0.0, nxt - time.time()))


if __name__ == "__main__":
    sys.exit(main())
