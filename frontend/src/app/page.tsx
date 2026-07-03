"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";
import type { WorkerHealth, WorkerJob } from "@/lib/types";

export default function Dashboard() {
  const [health, setHealth] = useState<{ connected: boolean; health?: WorkerHealth; reason?: string } | null>(null);
  const [jobs, setJobs] = useState<WorkerJob[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const h = await fetch("/api/health").then((r) => r.json());
        if (alive) setHealth(h);
        if (h.connected) {
          const j = await fetch("/api/jobs").then((r) => r.json());
          if (alive && Array.isArray(j.jobs)) setJobs(j.jobs.slice(0, 4));
        }
      } catch {
        /* ignore */
      }
    };
    load();
    const t = setInterval(load, 10_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const gpu = health?.health?.gpus?.[0];

  return (
    <div>
      <h1 className="page-title">LongCat Video Studio</h1>
      <p className="page-sub">
        Gere vídeos longos (minutos) com o modelo open-source{" "}
        <a
          href="https://huggingface.co/meituan-longcat/LongCat-Video"
          target="_blank"
          style={{ color: "var(--accent-2)" }}
        >
          LongCat-Video (13,6B)
        </a>{" "}
        — processamento em GPUs alugadas na Vast.ai.
      </p>

      {health && !health.connected && (
        <div className="alert info">
          {health.reason === "not_configured" ? (
            <>
              Nenhum worker configurado ainda. Comece em{" "}
              <Link href="/settings" style={{ textDecoration: "underline" }}>
                Configurações
              </Link>{" "}
              (chave da Vast.ai) e depois crie uma GPU na aba{" "}
              <Link href="/gpus" style={{ textDecoration: "underline" }}>
                GPUs
              </Link>
              .
            </>
          ) : (
            <>
              Worker inacessível no momento. Se a instância acabou de ser criada, o download do
              modelo (~30 GB) pode levar vários minutos. Veja a aba{" "}
              <Link href="/gpus" style={{ textDecoration: "underline" }}>
                GPUs
              </Link>
              .
            </>
          )}
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat">
          <div className="value" style={{ color: health?.connected ? "var(--ok)" : "var(--danger)" }}>
            {health ? (health.connected ? "Online" : "Offline") : "…"}
          </div>
          <div className="label">Worker GPU</div>
        </div>
        <div className="card stat">
          <div className="value">{gpu ? gpu.name : "—"}</div>
          <div className="label">
            {gpu
              ? `${Math.round(gpu.memory_used_mb / 1024)} / ${Math.round(gpu.memory_total_mb / 1024)} GB VRAM · ${gpu.utilization_pct}%`
              : "GPU"}
          </div>
        </div>
        <div className="card stat">
          <div className="value">{health?.health ? health.health.queue_size : "—"}</div>
          <div className="label">Jobs na fila</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Começar</h3>
        <div className="row">
          <Link href="/generate" className="btn">
            🎬 Gerar um vídeo
          </Link>
          <Link href="/gpus" className="btn secondary">
            🖥️ Alugar GPU na Vast.ai
          </Link>
          <Link href="/settings" className="btn secondary">
            ⚙️ Configurar chaves
          </Link>
        </div>
      </div>

      {jobs.length > 0 && (
        <>
          <h3 style={{ marginBottom: 12 }}>Últimos vídeos</h3>
          {jobs.map((j) => (
            <div key={j.id} style={{ marginBottom: 12 }}>
              <JobCard job={j} />
            </div>
          ))}
          <Link href="/jobs" className="dim" style={{ fontSize: 13, textDecoration: "underline" }}>
            ver todos →
          </Link>
        </>
      )}
    </div>
  );
}
