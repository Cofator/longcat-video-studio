"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";
import type { WorkerJob } from "@/lib/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<WorkerJob[] | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao listar jobs");
      setJobs(data.jobs ?? []);
      setError("");
    } catch (err: any) {
      setError(String(err?.message ?? err));
      setJobs([]);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const onDelete = async (id: string) => {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <h1 className="page-title">Meus vídeos</h1>
      <p className="page-sub">Fila de geração e vídeos concluídos (atualiza a cada 5s).</p>

      {error && <div className="alert error">{error}</div>}

      {jobs === null && <p className="dim">Carregando…</p>}

      {jobs !== null && jobs.length === 0 && !error && (
        <div className="card">
          <p className="dim" style={{ marginBottom: 12 }}>Nenhum vídeo ainda.</p>
          <Link href="/generate" className="btn">
            🎬 Gerar o primeiro vídeo
          </Link>
        </div>
      )}

      {jobs?.map((j) => (
        <div key={j.id} style={{ marginBottom: 14 }}>
          <JobCard job={j} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
