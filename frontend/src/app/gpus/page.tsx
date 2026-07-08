"use client";

import { useEffect, useState } from "react";
import type { VastInstance, VastOffer } from "@/lib/types";

const GPU_PRESETS: { label: string; names: string[]; minRam?: number }[] = [
  { label: "RTX PRO 6000 (96 GB) — mais rápida", names: ["RTX PRO 6000 WS", "RTX PRO 6000 S"], minRam: 90000 },
  { label: "Recomendadas (≥48 GB, Ampere+)", names: [], minRam: 48000 },
  { label: "H100", names: ["H100 SXM", "H100 PCIE", "H100 NVL"] },
  { label: "A100 80GB", names: ["A100 SXM4", "A100 PCIE", "A100X"], minRam: 75000 },
  { label: "L40S / A6000 (48 GB)", names: ["L40S", "L40", "RTX A6000", "RTX 6000Ada"] },
  { label: "Qualquer (≥24 GB — pode faltar VRAM)", names: [], minRam: 24000 },
];

const isStopped = (s?: string) =>
  ["stopped", "exited", "offline"].includes((s ?? "").toLowerCase());

function STATUS_UI(s?: string): { label: string; cls: string } {
  switch ((s ?? "").toLowerCase()) {
    case "running":
      return { label: "rodando", cls: "completed" };
    case "loading":
      return { label: "provisionando…", cls: "running" };
    case "created":
    case "scheduling":
      return { label: "iniciando…", cls: "queued" };
    case "stopped":
    case "exited":
    case "offline":
      return { label: "parada", cls: "canceled" };
    default:
      return { label: s ?? "—", cls: "queued" };
  }
}

export default function GpusPage() {
  const [instances, setInstances] = useState<(VastInstance & { workerUrl?: string | null })[] | null>(null);
  const [offers, setOffers] = useState<VastOffer[] | null>(null);
  const [preset, setPreset] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3);
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadInstances = async () => {
    try {
      const res = await fetch("/api/vast/instances");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao listar instâncias");
      setInstances(data.instances ?? []);
      setError("");
    } catch (err: any) {
      setError(String(err?.message ?? err));
      setInstances([]);
    }
  };

  useEffect(() => {
    loadInstances();
    const t = setInterval(loadInstances, 15_000);
    return () => clearInterval(t);
  }, []);

  const search = async () => {
    setBusy("search");
    setError("");
    setOffers(null);
    try {
      const p = GPU_PRESETS[preset];
      const res = await fetch("/api/vast/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gpuNames: p.names.length ? p.names : undefined,
          minGpuRam: p.minRam,
          maxPrice,
          minDisk: 250,
          numGpus: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha na busca");
      setOffers(data.offers ?? []);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setBusy("");
    }
  };

  const rent = async (offerId: number) => {
    if (!confirm("Criar instância nesta oferta? A cobrança da Vast.ai começa imediatamente.")) return;
    setBusy(`rent-${offerId}`);
    setError("");
    try {
      const res = await fetch("/api/vast/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, disk: 250 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao criar instância");
      setNotice(
        `Instância ${data.new_contract} criada! O provisionamento (modelo ~30 GB) leva de 10 a 30 min. ` +
          `O worker aparecerá como "online" na barra lateral quando estiver pronto.`
      );
      setOffers(null);
      loadInstances();
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setBusy("");
    }
  };

  const act = async (id: number, action: "running" | "stopped" | "destroy") => {
    if (action === "destroy" && !confirm(`Destruir a instância ${id}? Os dados dela serão perdidos.`)) return;
    setBusy(`inst-${id}`);
    try {
      const res =
        action === "destroy"
          ? await fetch(`/api/vast/instances/${id}`, { method: "DELETE" })
          : await fetch(`/api/vast/instances/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ state: action }),
            });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha na operação");
      loadInstances();
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <h1 className="page-title">GPUs — Vast.ai</h1>
      <p className="page-sub">
        Alugue uma GPU para rodar o LongCat-Video. A instância é criada já com o script que baixa o
        modelo e sobe o worker automaticamente. Recomendado: <b>≥ 48 GB de VRAM</b> e 100 GB de disco.
      </p>

      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert ok">{notice}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>Minhas instâncias</h3>
        {instances === null && <p className="dim">Carregando…</p>}
        {instances !== null && instances.length === 0 && (
          <p className="dim">Nenhuma instância. Busque uma oferta abaixo.</p>
        )}
        {instances && instances.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>GPU</th><th>Status</th><th>US$/h</th><th>Worker</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((i) => (
                  <tr key={i.id}>
                    <td className="mono">{i.id}{i.label === "longcat-video-studio" ? " ⭐" : ""}</td>
                    <td>{i.num_gpus && i.num_gpus > 1 ? `${i.num_gpus}× ` : ""}{i.gpu_name ?? "—"}</td>
                    <td>
                      <span className={`badge ${STATUS_UI(i.actual_status).cls}`}>
                        {STATUS_UI(i.actual_status).label}
                      </span>
                    </td>
                    <td>{i.dph_total ? `$${i.dph_total.toFixed(3)}` : "—"}</td>
                    <td className="mono" style={{ fontSize: 12 }}>
                      {i.workerUrl ?? (isStopped(i.actual_status) ? "—" : <span className="dim">aguardando boot…</span>)}
                    </td>
                    <td>
                      <div className="row" style={{ gap: 6 }}>
                        {!isStopped(i.actual_status) ? (
                          <button className="btn secondary small" disabled={busy === `inst-${i.id}`} onClick={() => act(i.id, "stopped")}>
                            ⏸ Parar
                          </button>
                        ) : (
                          <button className="btn secondary small" disabled={busy === `inst-${i.id}`} onClick={() => act(i.id, "running")}>
                            ▶ Iniciar
                          </button>
                        )}
                        <button className="btn danger small" disabled={busy === `inst-${i.id}`} onClick={() => act(i.id, "destroy")}>
                          🗑 Destruir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="hint" style={{ marginTop: 10 }}>
          ⭐ = instância criada por este app. Instâncias <b>paradas ainda cobram armazenamento</b>;
          destrua quando não precisar mais.
        </p>
      </div>

      <div className="card">
        <h3>Buscar ofertas</h3>
        <div className="row" style={{ marginBottom: 14 }}>
          <label className="field" style={{ margin: 0, minWidth: 260 }}>
            <span className="lbl">Tipo de GPU</span>
            <select value={preset} onChange={(e) => setPreset(Number(e.target.value))}>
              {GPU_PRESETS.map((p, i) => (
                <option key={p.label} value={i}>{p.label}</option>
              ))}
            </select>
          </label>
          <label className="field" style={{ margin: 0, width: 180 }}>
            <span className="lbl">Preço máx (US$/h)</span>
            <input type="number" step={0.25} min={0.25} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
          </label>
          <button className="btn" style={{ marginTop: 22 }} onClick={search} disabled={busy === "search"}>
            {busy === "search" ? "Buscando…" : "🔍 Buscar"}
          </button>
        </div>

        {offers !== null && offers.length === 0 && <p className="dim">Nenhuma oferta encontrada com esses filtros.</p>}

        {offers && offers.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>GPU</th><th>VRAM</th><th>US$/h</th><th>Confiab.</th><th>Local</th><th></th>
                </tr>
              </thead>
              <tbody>
                {offers.map((o) => (
                  <tr key={o.id}>
                    <td>{o.num_gpus > 1 ? `${o.num_gpus}× ` : ""}{o.gpu_name?.replaceAll("_", " ")}</td>
                    <td>{Math.round(o.gpu_ram / 1024)} GB</td>
                    <td><b>${o.dph_total.toFixed(3)}</b></td>
                    <td>{(((o.reliability2 ?? o.reliability) ?? 0) * 100).toFixed(1)}%</td>
                    <td>{o.geolocation ?? "—"}</td>
                    <td>
                      <button className="btn small" disabled={busy === `rent-${o.id}`} onClick={() => rent(o.id)}>
                        {busy === `rent-${o.id}` ? "Criando…" : "Alugar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
