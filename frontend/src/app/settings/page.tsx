"use client";

import { useEffect, useState } from "react";

interface SettingsView {
  vastApiKeyMasked: string;
  hasVastApiKey: boolean;
  workerUrl: string;
  workerTokenMasked: string;
  hasWorkerToken: boolean;
  studioRepo: string;
  llmProvider: "claude" | "longcat" | "openrouter";
  anthropicApiKeyMasked: string;
  hasAnthropicApiKey: boolean;
  longcatApiKeyMasked: string;
  hasLongcatApiKey: boolean;
  openrouterApiKeyMasked: string;
  hasOpenrouterApiKey: boolean;
  openrouterModel: string;
}

export default function SettingsPage() {
  const [view, setView] = useState<SettingsView | null>(null);
  const [vastApiKey, setVastApiKey] = useState("");
  const [workerUrl, setWorkerUrl] = useState("");
  const [workerToken, setWorkerToken] = useState("");
  const [studioRepo, setStudioRepo] = useState("");
  const [anthropicApiKey, setAnthropicApiKey] = useState("");
  const [longcatApiKey, setLongcatApiKey] = useState("");
  const [openrouterApiKey, setOpenrouterApiKey] = useState("");
  const [openrouterModel, setOpenrouterModel] = useState("meituan/longcat-2.0");
  const [llmProvider, setLlmProvider] = useState<"claude" | "longcat" | "openrouter">("claude");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [testResult, setTestResult] = useState("");

  const load = async () => {
    const data: SettingsView = await fetch("/api/settings").then((r) => r.json());
    setView(data);
    setWorkerUrl(data.workerUrl);
    setStudioRepo(data.studioRepo);
    setLlmProvider(data.llmProvider ?? "claude");
    if (data.openrouterModel) setOpenrouterModel(data.openrouterModel);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setError("");
    setSaved(false);
    try {
      const patch: Record<string, string> = { workerUrl, studioRepo, llmProvider, openrouterModel };
      if (vastApiKey.trim()) patch.vastApiKey = vastApiKey.trim();
      if (workerToken.trim()) patch.workerToken = workerToken.trim();
      if (anthropicApiKey.trim()) patch.anthropicApiKey = anthropicApiKey.trim();
      if (longcatApiKey.trim()) patch.longcatApiKey = longcatApiKey.trim();
      if (openrouterApiKey.trim()) patch.openrouterApiKey = openrouterApiKey.trim();
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      setVastApiKey("");
      setWorkerToken("");
      setAnthropicApiKey("");
      setLongcatApiKey("");
      setOpenrouterApiKey("");
      setSaved(true);
      load();
    } catch (err: any) {
      setError(String(err?.message ?? err));
    }
  };

  const test = async () => {
    setTestResult("Testando…");
    try {
      const data = await fetch("/api/health").then((r) => r.json());
      if (data.connected) {
        const g = data.health?.gpus?.[0];
        setTestResult(
          `✅ Worker acessível em ${data.url}` +
            (g ? ` — ${g.name}, ${Math.round(g.memory_total_mb / 1024)} GB` : "") +
            (data.health?.model_loaded ? " — modelo carregado" : data.health?.model_loading ? " — carregando modelo…" : " — modelo ainda não carregado")
        );
      } else {
        setTestResult(`❌ Sem conexão: ${data.error ?? data.reason}`);
      }
    } catch (err: any) {
      setTestResult(`❌ ${String(err?.message ?? err)}`);
    }
  };

  return (
    <div>
      <h1 className="page-title">Configurações</h1>
      <p className="page-sub">
        As chaves ficam salvas apenas no servidor local (pasta <code>data/</code>, fora do git).
      </p>

      {error && <div className="alert error">{error}</div>}
      {saved && <div className="alert ok">Configurações salvas.</div>}

      <div className="card">
        <h3>Vast.ai</h3>
        <label className="field">
          <span className="lbl">
            Chave da API {view?.hasVastApiKey && <span className="dim">(atual: {view.vastApiKeyMasked})</span>}
          </span>
          <input
            type="password"
            value={vastApiKey}
            onChange={(e) => setVastApiKey(e.target.value)}
            placeholder={view?.hasVastApiKey ? "•••• (deixe vazio para manter)" : "cole sua chave da Vast.ai"}
          />
          <div className="hint">
            Obtenha em{" "}
            <a href="https://cloud.vast.ai/manage-keys/" target="_blank" style={{ textDecoration: "underline" }}>
              cloud.vast.ai → Keys
            </a>
            .
          </div>
        </label>
      </div>

      <div className="card">
        <h3>Worker</h3>
        <label className="field">
          <span className="lbl">URL do worker (opcional)</span>
          <input
            type="text"
            value={workerUrl}
            onChange={(e) => setWorkerUrl(e.target.value)}
            placeholder="http://IP:PORTA — vazio = detectar automaticamente pela Vast.ai"
          />
          <div className="hint">
            Se vazio, o app localiza a instância com label <code>longcat-video-studio</code> na sua
            conta Vast.ai e usa a porta 8000 mapeada.
          </div>
        </label>
        <label className="field">
          <span className="lbl">
            Token do worker {view?.hasWorkerToken && <span className="dim">(atual: {view.workerTokenMasked})</span>}
          </span>
          <input
            type="password"
            value={workerToken}
            onChange={(e) => setWorkerToken(e.target.value)}
            placeholder="defina antes de criar a instância (protege sua GPU)"
          />
          <div className="hint">
            Qualquer string secreta. É injetada na instância na criação e exigida em todas as
            requisições ao worker.
          </div>
        </label>
        <label className="field">
          <span className="lbl">Repositório do projeto (clonado pela instância)</span>
          <input type="text" value={studioRepo} onChange={(e) => setStudioRepo(e.target.value)} />
        </label>
      </div>

      <div className="card">
        <h3>Melhorar prompt (LLM)</h3>
        <div className="tabs">
          <button
            type="button"
            className={`tab ${llmProvider === "claude" ? "active" : ""}`}
            onClick={() => setLlmProvider("claude")}
          >
            Claude (Anthropic)
          </button>
          <button
            type="button"
            className={`tab ${llmProvider === "longcat" ? "active" : ""}`}
            onClick={() => setLlmProvider("longcat")}
          >
            LongCat-2.0 (direto)
          </button>
          <button
            type="button"
            className={`tab ${llmProvider === "openrouter" ? "active" : ""}`}
            onClick={() => setLlmProvider("openrouter")}
          >
            OpenRouter ⭐
          </button>
        </div>
        {llmProvider === "claude" && (
          <label className="field">
            <span className="lbl">
              Chave da API do Claude{" "}
              {view?.hasAnthropicApiKey && <span className="dim">(atual: {view.anthropicApiKeyMasked})</span>}
            </span>
            <input
              type="password"
              value={anthropicApiKey}
              onChange={(e) => setAnthropicApiKey(e.target.value)}
              placeholder={view?.hasAnthropicApiKey ? "•••• (deixe vazio para manter)" : "cole sua chave da Anthropic (sk-ant-...)"}
            />
            <div className="hint">
              Chave em{" "}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" style={{ textDecoration: "underline" }}>
                console.anthropic.com
              </a>
              .
            </div>
          </label>
        )}
        {llmProvider === "longcat" && (
          <label className="field">
            <span className="lbl">
              Chave da API LongCat{" "}
              {view?.hasLongcatApiKey && <span className="dim">(atual: {view.longcatApiKeyMasked})</span>}
            </span>
            <input
              type="password"
              value={longcatApiKey}
              onChange={(e) => setLongcatApiKey(e.target.value)}
              placeholder={view?.hasLongcatApiKey ? "•••• (deixe vazio para manter)" : "cole sua chave da LongCat"}
            />
            <div className="hint">
              Obtenha em{" "}
              <a href="https://longcat.chat/platform" target="_blank" style={{ textDecoration: "underline" }}>
                longcat.chat/platform
              </a>{" "}
              (a API da LongCat é compatível com a da Anthropic). Modelo usado: LongCat-2.0.
            </div>
          </label>
        )}
        {llmProvider === "openrouter" && (
          <>
            <div className="alert info" style={{ marginBottom: 12 }}>
              💳 Pagamento fácil no Brasil (cartão internacional / cripto) e tem <b>modelos grátis</b>.
              Dá acesso ao LongCat-2.0 e a dezenas de outros modelos com <b>uma chave só</b>.
            </div>
            <label className="field">
              <span className="lbl">
                Chave da API OpenRouter{" "}
                {view?.hasOpenrouterApiKey && <span className="dim">(atual: {view.openrouterApiKeyMasked})</span>}
              </span>
              <input
                type="password"
                value={openrouterApiKey}
                onChange={(e) => setOpenrouterApiKey(e.target.value)}
                placeholder={view?.hasOpenrouterApiKey ? "•••• (deixe vazio para manter)" : "cole sua chave do OpenRouter (sk-or-...)"}
              />
              <div className="hint">
                Crie grátis em{" "}
                <a href="https://openrouter.ai/keys" target="_blank" style={{ textDecoration: "underline" }}>
                  openrouter.ai/keys
                </a>
                .
              </div>
            </label>
            <label className="field">
              <span className="lbl">Modelo (ID do OpenRouter)</span>
              <input
                type="text"
                value={openrouterModel}
                onChange={(e) => setOpenrouterModel(e.target.value)}
                placeholder="meituan/longcat-2.0"
              />
              <div className="hint">
                Ex.: <code>meituan/longcat-2.0</code>. Para usar <b>grátis</b>, escolha um modelo com sufixo{" "}
                <code>:free</code> na lista de{" "}
                <a href="https://openrouter.ai/models?max_price=0" target="_blank" style={{ textDecoration: "underline" }}>
                  modelos gratuitos
                </a>{" "}
                (ex.: <code>deepseek/deepseek-chat-v3:free</code>).
              </div>
            </label>
          </>
        )}
        <div className="hint">
          O botão <b>✨ Melhorar prompt</b> nas telas de geração usa o provedor selecionado para
          expandir/traduzir sua ideia em um prompt cinematográfico.
        </div>
      </div>

      <div className="row" style={{ marginTop: 18 }}>
        <button className="btn" onClick={save}>💾 Salvar</button>
        <button className="btn secondary" onClick={test}>🔌 Testar conexão com o worker</button>
      </div>
      {testResult && <p style={{ marginTop: 14, fontSize: 14 }}>{testResult}</p>}
    </div>
  );
}
