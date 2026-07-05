"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Início", icon: "🏠" },
  { href: "/generate", label: "Gerar vídeo", icon: "🎬" },
  { href: "/avatar", label: "Avatar (áudio)", icon: "🗣️" },
  { href: "/chat", label: "Chat (LLM)", icon: "💬" },
  { href: "/jobs", label: "Meus vídeos", icon: "📼" },
  { href: "/gpus", label: "GPUs (Vast.ai)", icon: "🖥️" },
  { href: "/settings", label: "Configurações", icon: "⚙️" },
];

export default function Nav() {
  const pathname = usePathname();
  const [status, setStatus] = useState<string>("verificando…");
  const [statusColor, setStatusColor] = useState<string>("var(--text-dim)");

  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        if (!alive) return;
        if (data.connected && data.health?.model_loaded) {
          setStatus("Worker online · modelo carregado");
          setStatusColor("var(--ok)");
        } else if (data.connected && data.health?.model_loading) {
          setStatus("Worker online · carregando modelo…");
          setStatusColor("var(--warn)");
        } else if (data.connected) {
          setStatus("Worker online");
          setStatusColor("var(--accent-2)");
        } else if (data.reason === "not_configured") {
          setStatus("Worker não configurado");
          setStatusColor("var(--text-dim)");
        } else {
          setStatus("Worker inacessível");
          setStatusColor("var(--danger)");
        }
      } catch {
        if (alive) {
          setStatus("Worker inacessível");
          setStatusColor("var(--danger)");
        }
      }
    };
    check();
    const t = setInterval(check, 20_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="cat">🐈‍⬛</span>
        <span>
          LongCat Studio
          <small>vídeos longos com IA</small>
        </span>
      </div>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`nav-link ${pathname === l.href ? "active" : ""}`}
        >
          <span>{l.icon}</span> {l.label}
        </Link>
      ))}
      <div className="spacer" />
      <div className="worker-chip">
        <span style={{ color: statusColor }}>●</span> {status}
      </div>
    </aside>
  );
}
