#!/usr/bin/env python3
"""Coleta cotacoes da LI.FI em loop para estudar arbitragem ida e volta.

Par padrao: USDC (Base) <-> USDT (Polygon), 2000 unidades.
A cada ciclo faz 2 cotacoes com o mesmo valor nominal:
  A2B: USDC Base   -> USDT Polygon
  B2A: USDT Polygon -> USDC Base
e grava uma linha JSON por cotacao em --out (JSONL).

So usa a biblioteca padrao do Python.
"""
import argparse
import datetime as dt
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_BASE_URL = "https://li.quest/v1"

TOKENS = {
    # chainId, endereco, decimais
    "USDC_BASE": (8453, "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", 6),
    "USDT_POLYGON": (137, "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", 6),
}

# Endereco qualquer so para a API montar a rota (nao precisa ter saldo).
DEFAULT_FROM_ADDRESS = "0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0"

# Nomes de taxa que sao da LI.FI / integrador (Jumper) e nao do bridge/DEX.
PLATFORM_FEE_HINTS = ("lifi", "li.fi", "integrator", "jumper", "platform")


def log(msg):
    print(f"[{dt.datetime.now(dt.timezone.utc):%H:%M:%S}] {msg}", flush=True)


def parse_deadline(args):
    now = dt.datetime.now(dt.timezone.utc)
    deadlines = []
    if args.max_minutes:
        deadlines.append(now + dt.timedelta(minutes=args.max_minutes))
    if args.until_utc:
        hh, mm = (int(x) for x in args.until_utc.split(":"))
        until = now.replace(hour=hh, minute=mm, second=0, microsecond=0)
        if until <= now and not args.until_today:
            until += dt.timedelta(days=1)
        deadlines.append(until)
    return min(deadlines) if deadlines else None


def is_platform_fee(fee):
    text = f"{fee.get('name', '')} {fee.get('description', '')}".lower()
    return any(h in text for h in PLATFORM_FEE_HINTS)


def fetch_quote(base_url, src, dst, amount, from_address, api_key, extra):
    from_chain, from_token, from_dec = TOKENS[src]
    to_chain, to_token, _ = TOKENS[dst]
    params = {
        "fromChain": from_chain,
        "toChain": to_chain,
        "fromToken": from_token,
        "toToken": to_token,
        "fromAmount": str(int(round(amount * 10**from_dec))),
        "fromAddress": from_address,
        "order": "CHEAPEST",
        "slippage": "0.005",
    }
    params.update(extra)
    url = f"{base_url}/quote?{urllib.parse.urlencode(params)}"
    headers = {"accept": "application/json", "user-agent": "lifi-arb-tracker/1.0"}
    if api_key:
        headers["x-lifi-api-key"] = api_key
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=45) as resp:
        return json.loads(resp.read().decode())


def summarize(quote, src, dst, amount):
    _, _, from_dec = TOKENS[src]
    _, _, to_dec = TOKENS[dst]
    est = quote.get("estimate", {})
    from_amount = int(est.get("fromAmount") or quote["action"]["fromAmount"]) / 10**from_dec
    to_amount = int(est["toAmount"]) / 10**to_dec
    to_amount_min = int(est.get("toAmountMin") or 0) / 10**to_dec

    fees = []
    platform_pct = 0.0
    for f in est.get("feeCosts") or []:
        pct = f.get("percentage")
        pct = float(pct) if pct not in (None, "") else None
        amount_usd = float(f.get("amountUSD") or 0)
        entry = {
            "name": f.get("name"),
            "pct": pct,
            "amount_usd": amount_usd,
            "included": f.get("included"),
            "platform": is_platform_fee(f),
        }
        fees.append(entry)
        if entry["platform"]:
            if pct is None:
                pct = amount_usd / from_amount if from_amount else 0.0
            platform_pct += pct

    gas_usd = sum(float(g.get("amountUSD") or 0) for g in est.get("gasCosts") or [])
    tools = [s.get("tool") for s in quote.get("includedSteps") or [] if s.get("tool")]
    return {
        "from_amount": from_amount,
        "to_amount": to_amount,
        "to_amount_min": to_amount_min,
        "tool": quote.get("tool"),
        "tools": tools,
        "platform_fee_pct": platform_pct,
        "fees": fees,
        "gas_usd": gas_usd,
        "duration_s": est.get("executionDuration"),
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", required=True, help="arquivo JSONL de saida (append)")
    ap.add_argument("--amount", type=float, default=2000.0)
    ap.add_argument("--a", default="USDC_BASE", choices=TOKENS)
    ap.add_argument("--b", default="USDT_POLYGON", choices=TOKENS)
    ap.add_argument("--interval", type=float, default=120.0, help="segundos entre ciclos")
    ap.add_argument("--max-minutes", type=float, default=None)
    ap.add_argument("--until-utc", default=None, help="HH:MM (UTC) para parar")
    ap.add_argument("--until-today", action="store_true",
                    help="se --until-utc ja passou, nao rola para o dia seguinte")
    ap.add_argument("--base-url", default=os.environ.get("LIFI_BASE_URL", DEFAULT_BASE_URL))
    ap.add_argument("--from-address", default=os.environ.get("LIFI_FROM_ADDRESS", DEFAULT_FROM_ADDRESS))
    ap.add_argument("--raw-samples", default=None,
                    help="grava as primeiras respostas brutas neste arquivo (debug)")
    args = ap.parse_args()

    api_key = os.environ.get("LIFI_API_KEY") or None
    extra = {}
    if os.environ.get("LIFI_INTEGRATOR"):
        extra["integrator"] = os.environ["LIFI_INTEGRATOR"]

    deadline = parse_deadline(args)
    log(f"inicio; deadline={deadline}; intervalo={args.interval}s; api_key={'sim' if api_key else 'nao'}")
    if deadline and deadline <= dt.datetime.now(dt.timezone.utc):
        log("deadline ja passou, nada a fazer")
        return 0

    raw_saved = 0
    cycle = 0
    backoff = 0.0
    with open(args.out, "a", encoding="utf-8") as out:
        while True:
            cycle_start = time.time()
            cycle += 1
            for direction, src, dst in (("A2B", args.a, args.b), ("B2A", args.b, args.a)):
                row = {
                    "ts": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
                    "cycle": f"{cycle_start:.3f}",
                    "direction": direction,
                    "src": src,
                    "dst": dst,
                }
                try:
                    q = fetch_quote(args.base_url, src, dst, args.amount, args.from_address, api_key, extra)
                    row.update(summarize(q, src, dst, args.amount))
                    row["ok"] = True
                    backoff = 0.0
                    if args.raw_samples and raw_saved < 4:
                        with open(args.raw_samples, "a", encoding="utf-8") as raw:
                            raw.write(json.dumps({"direction": direction, "quote": q}) + "\n")
                        raw_saved += 1
                    log(f"{direction} {row['from_amount']:.2f} -> {row['to_amount']:.6f} "
                        f"via {row['tool']} (taxa plataforma {row['platform_fee_pct']*100:.3f}%, gas ${row['gas_usd']:.3f})")
                except urllib.error.HTTPError as e:
                    body = e.read().decode(errors="replace")[:500]
                    row.update(ok=False, error=f"HTTP {e.code}: {body}")
                    log(f"{direction} erro HTTP {e.code}: {body[:200]}")
                    if e.code == 429:
                        backoff = min(max(backoff * 2, 60.0), 900.0)
                except Exception as e:  # rede, timeout, JSON inesperado
                    row.update(ok=False, error=f"{type(e).__name__}: {e}")
                    log(f"{direction} erro: {e}")
                out.write(json.dumps(row) + "\n")
                out.flush()

            now = dt.datetime.now(dt.timezone.utc)
            sleep_s = max(0.0, args.interval - (time.time() - cycle_start)) + backoff
            if deadline and now + dt.timedelta(seconds=sleep_s) >= deadline:
                log(f"fim; {cycle} ciclos")
                return 0
            if backoff:
                log(f"rate limit: esperando {backoff:.0f}s extras")
            time.sleep(sleep_s)


if __name__ == "__main__":
    sys.exit(main())
