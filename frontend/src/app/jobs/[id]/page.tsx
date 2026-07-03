"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { WorkerJob } from "@/lib/types";
import { estimateSeconds } from "@/components/JobCard";

const STATUS_LABEL: Record<string, string> = {
  queued: "Na fila",
  running: "Gerando",
  completed: "Concluído",
  failed: "Falhou",
  canceled: "Cancelado",
};

function fmtDuration(s?: number | null, e?: number | null): string {
  if (!s) return "—";
  const secs = Math.round(((e ?? Date.now() / 1000) - s));
  const m = Math.floor(secs / 60);
  return m > 0 ? `${m}min ${secs % 60}s` : `${secs}s`;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<WorkerJob | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const load = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? data.detail ?? "Job não encontrado");
        setJob(data);
        setError("");
        if ((data.status === "completed" || data.status === "failed") && timer) {
          clearInterval(timer);
        }
      } catch (err: any) {
        setError(String(err?.message ?? err));
      }
    };
    load();
    timer = setInterval(load, 4000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [id]);

  return (
    <div>
      <p style={{ marginBottom: 16 }}>
        <Link href="/jobs" className="dim" style={{ fontSize: 13 }}>
          ← voltar para Meus vídeos
        </Link>
      </p>
      <h1 className="page-title">Vídeo {id}</h1>

      {error && <div className="alert error">{error}</div>}
      {!job && !error && <p className="dim">Carregando…</p>}

      {job && (
        <>
          <p className="page-sub">{job.prompt || "(sem prompt — geração a partir de imagem)"}</p>

          {(job.status === "running" || job.status === "queued") && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <b>{job.stage}</b>
                <span>{Math.round(job.progress * 100)}%</span>
              </div>
              <div className="progress">
                <div style={{ width: `${Math.max(job.progress * 100, 2)}%` }} />
              </div>
              <p className="hint" style={{ marginTop: 8 }}>
                Tempo decorrido: {fmtDuration(job.started_at, null)} · A página atualiza sozinha.
              </p>
            </div>
          )}

          {job.status === "completed" && job.has_video && (
            <div style={{ marginBottom: 16 }}>
              <video className="player" controls src={`/api/jobs/${job.id}/video`} />
              <div className="row" style={{ marginTop: 12 }}>
                <a href={`/api/jobs/${job.id}/video`} download className="btn">
                  ⬇ Baixar MP4
                </a>
              </div>
            </div>
          )}

          {job.status === "failed" && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ color: "var(--danger)" }}>O job falhou</h3>
              <pre className="errbox">{job.error ?? "Erro desconhecido"}</pre>
            </div>
          )}

          <div className="card">
            <h3>Detalhes</h3>
            <div className="table-wrap">
              <table>
                <tbody>
                  <tr><td className="dim">Status</td><td>{STATUS_LABEL[job.status] ?? job.status}</td></tr>
                  <tr><td className="dim">Tipo</td><td>{job.type}</td></tr>
                  <tr><td className="dim">Duração estimada/final</td><td>≈ {estimateSeconds(job)}s · {job.fps} fps{job.total_frames ? ` · ${job.total_frames} frames` : ""}</td></tr>
                  <tr><td className="dim">Segmentos extras</td><td>{job.params.num_segments}</td></tr>
                  <tr><td className="dim">Refinamento</td><td>{job.params.refine}</td></tr>
                  <tr><td className="dim">Passos / guidance</td><td>{job.params.num_inference_steps} / {job.params.guidance_scale}</td></tr>
                  <tr><td className="dim">Seed</td><td>{job.params.seed ?? "aleatória"}</td></tr>
                  <tr><td className="dim">Turbo (distill)</td><td>{job.params.use_distill ? "sim" : "não"}</td></tr>
                  <tr><td className="dim">Criado</td><td>{new Date(job.created_at * 1000).toLocaleString("pt-BR")}</td></tr>
                  <tr><td className="dim">Tempo de geração</td><td>{fmtDuration(job.started_at, job.finished_at)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
