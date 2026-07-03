"use client";

import Link from "next/link";
import type { WorkerJob } from "@/lib/types";

const STATUS_LABEL: Record<WorkerJob["status"], string> = {
  queued: "Na fila",
  running: "Gerando",
  completed: "Concluído",
  failed: "Falhou",
  canceled: "Cancelado",
};

const TYPE_LABEL: Record<string, string> = {
  t2v: "Texto → Vídeo",
  i2v: "Imagem → Vídeo",
  long: "Vídeo longo",
};

export function estimateSeconds(job: WorkerJob): number {
  const nf = job.params.num_frames || 93;
  const cond = 13;
  const total = job.total_frames || nf + (job.params.num_segments || 0) * (nf - cond);
  return Math.round(total / (job.fps || 15));
}

export default function JobCard({
  job,
  onDelete,
}: {
  job: WorkerJob;
  onDelete?: (id: string) => void;
}) {
  const secs = estimateSeconds(job);
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          <span className={`badge ${job.status}`}>
            <span className="dot" /> {STATUS_LABEL[job.status]}
          </span>
          <span className="badge" style={{ background: "var(--panel-2)", color: "var(--text-dim)" }}>
            {TYPE_LABEL[job.type] ?? job.type}
          </span>
          {job.params.num_segments > 0 && (
            <span className="badge" style={{ background: "var(--panel-2)", color: "var(--text-dim)" }}>
              ~{secs}s de vídeo
            </span>
          )}
        </div>
        <span className="dim" style={{ fontSize: 12 }}>
          {new Date(job.created_at * 1000).toLocaleString("pt-BR")}
        </span>
      </div>

      <p style={{ fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
        {job.prompt ? (job.prompt.length > 160 ? job.prompt.slice(0, 160) + "…" : job.prompt) : (
          <span className="dim">(sem prompt — imagem)</span>
        )}
      </p>

      {(job.status === "running" || job.status === "queued") && (
        <div style={{ marginBottom: 12 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
            <span className="dim" style={{ fontSize: 12 }}>{job.stage}</span>
            <span className="dim" style={{ fontSize: 12 }}>{Math.round(job.progress * 100)}%</span>
          </div>
          <div className="progress">
            <div style={{ width: `${Math.max(job.progress * 100, 2)}%` }} />
          </div>
        </div>
      )}

      <div className="row">
        <Link href={`/jobs/${job.id}`} className="btn secondary small">
          Detalhes
        </Link>
        {job.has_video && (
          <a href={`/api/jobs/${job.id}/video`} download className="btn small">
            ⬇ Baixar MP4
          </a>
        )}
        {onDelete && job.status !== "running" && (
          <button className="btn danger small" onClick={() => onDelete(job.id)}>
            {job.status === "queued" ? "Cancelar" : "Excluir"}
          </button>
        )}
      </div>
    </div>
  );
}
