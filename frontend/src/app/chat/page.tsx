"use client";

import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";
interface Msg {
  role: Role;
  content: string;
}

type Provider = "longcat" | "claude";

const PROVIDER_LABEL: Record<Provider, string> = {
  longcat: "LongCat-2.0",
  claude: "Claude",
};

/** Renderização leve de markdown: blocos de código, código inline, negrito, quebras. */
function Rendered({ text }: { text: string }) {
  const parts = text.split(/```/);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          // bloco de código: primeira linha pode ser a linguagem
          const nl = part.indexOf("\n");
          const lang = nl > 0 && !part.slice(0, nl).includes(" ") ? part.slice(0, nl).trim() : "";
          const code = lang ? part.slice(nl + 1) : part;
          return (
            <pre key={i} className="code-block">
              {lang && <span className="code-lang">{lang}</span>}
              <code>{code.replace(/\n$/, "")}</code>
            </pre>
          );
        }
        // texto normal: inline code + negrito + quebras
        return (
          <span key={i}>
            {part.split(/(`[^`]+`|\*\*[^*]+\*\*)/).map((seg, j) => {
              if (seg.startsWith("`") && seg.endsWith("`")) {
                return <code key={j} className="inline-code">{seg.slice(1, -1)}</code>;
              }
              if (seg.startsWith("**") && seg.endsWith("**")) {
                return <strong key={j}>{seg.slice(2, -2)}</strong>;
              }
              return <span key={j} style={{ whiteSpace: "pre-wrap" }}>{seg}</span>;
            })}
          </span>
        );
      })}
    </>
  );
}

export default function ChatPage() {
  const [provider, setProvider] = useState<Provider>("longcat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // usa o provedor configurado como padrão inicial
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s) => {
        if (s.llmProvider === "claude" || s.llmProvider === "longcat") setProvider(s.llmProvider);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, messages: next }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({ error: "Falha na requisição" }));
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${data.error ?? "Erro"}` };
          return copy;
        });
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err: any) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${String(err?.message ?? err)}` };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-wrap">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Chat</h1>
          <p className="dim" style={{ fontSize: 13 }}>Converse, escreva e programe com uma LLM.</p>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            style={{ width: 160 }}
          >
            <option value="longcat">LongCat-2.0 (Meituan)</option>
            <option value="claude">Claude (Anthropic)</option>
          </select>
          <button className="btn secondary small" onClick={() => setMessages([])} disabled={busy || !messages.length}>
            🗑 Limpar
          </button>
        </div>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <div style={{ fontSize: 40 }}>💬</div>
            <p>Comece uma conversa com <b>{PROVIDER_LABEL[provider]}</b>.</p>
            <div className="chat-suggestions">
              {[
                "Explique o que é um MoE em uma frase",
                "Escreva uma função Python que valida CPF",
                "Me dê 5 ideias de vídeo para o LongCat-Video",
              ].map((s) => (
                <button key={s} className="chat-chip" onClick={() => setInput(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div className="chat-avatar">{m.role === "user" ? "🧑" : provider === "longcat" ? "🐱" : "✳️"}</div>
            <div className="chat-bubble">
              {m.content ? <Rendered text={m.content} /> : <span className="dim">digitando…</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={`Pergunte algo ao ${PROVIDER_LABEL[provider]}…  (Enter envia, Shift+Enter quebra linha)`}
          rows={2}
        />
        <button className="btn" onClick={send} disabled={busy || !input.trim()}>
          {busy ? "…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}
