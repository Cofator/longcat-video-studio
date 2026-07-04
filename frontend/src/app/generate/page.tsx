"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { JobType, RefineMode } from "@/lib/types";

const NUM_FRAMES = 93;
const COND_FRAMES = 13;

export default function GeneratePage() {
  const router = useRouter();
  const [type, setType] = useState<JobType>("t2v");
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [imageB64, setImageB64] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const [targetSeconds, setTargetSeconds] = useState(30);
  const [refine, setRefine] = useState<RefineMode>("none");
  const [useDistill, setUseDistill] = useState(false);
  const [steps, setSteps] = useState(50);
  const [guidance, setGuidance] = useState(4.0);
  const [seed, setSeed] = useState<string>("");
  const [segmentPrompts, setSegmentPrompts] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // 93 frames base + 80 novos por segmento, a 15 fps (30 fps com refino temporal)
  const isLong = type === "long";
  const numSegments = useMemo(() => {
    if (!isLong) return 0;
    const baseSecs = NUM_FRAMES / 15;
    const perSegment = (NUM_FRAMES - COND_FRAMES) / 15;
    return Math.max(0, Math.ceil((targetSeconds - baseSecs) / perSegment));
  }, [isLong, targetSeconds]);

  const estSeconds = useMemo(() => {
    const total = NUM_FRAMES + numSegments * (NUM_FRAMES - COND_FRAMES);
    return Math.round(total / 15);
  }, [numSegments]);

  const onImage = (file: File | null) => {
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImageB64(String(reader.result));
    reader.readAsDataURL(file);
  };

  const [enhancing, setEnhancing] = useState(false);
  const enhance = async () => {
    setError("");
    if (!prompt.trim()) {
      setError("Escreva uma ideia antes de melhorar o prompt.");
      return;
    }
    setEnhancing(true);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: prompt.trim(), segments: isLong ? numSegments : 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao melhorar o prompt");
      if (data.prompt) setPrompt(data.prompt);
      if (Array.isArray(data.segmentPrompts) && data.segmentPrompts.length) {
        setSegmentPrompts(data.segmentPrompts.join("\n"));
      }
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setEnhancing(false);
    }
  };

  const submit = async () => {
    setError("");
    if (!prompt.trim() && type !== "i2v") {
      setError("Escreva um prompt descrevendo o vídeo.");
      return;
    }
    if ((type === "i2v" || (type === "long" && imageB64)) && type === "i2v" && !imageB64) {
      setError("Envie uma imagem de referência.");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        type,
        prompt: prompt.trim(),
        num_frames: NUM_FRAMES,
        num_inference_steps: steps,
        guidance_scale: guidance,
        refine,
        use_distill: useDistill,
      };
      if (negative.trim()) body.negative_prompt = negative.trim();
      if (seed.trim()) body.seed = parseInt(seed, 10);
      if (isLong) {
        body.num_segments = numSegments;
        body.num_cond_frames = COND_FRAMES;
        const sp = segmentPrompts
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        if (sp.length) body.segment_prompts = sp;
      }
      if (imageB64 && (type === "i2v" || type === "long")) body.image_b64 = imageB64;

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? data.detail ?? "Falha ao criar job");
      router.push(`/jobs/${data.id}`);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Gerar vídeo</h1>
      <p className="page-sub">
        Escolha o modo, descreva a cena e envie para a GPU. Vídeos longos são gerados por
        continuação de segmentos, sem degradação de cor/qualidade.
      </p>

      <div className="tabs">
        <button className={`tab ${type === "t2v" ? "active" : ""}`} onClick={() => setType("t2v")}>
          ✍️ Texto → Vídeo
        </button>
        <button className={`tab ${type === "i2v" ? "active" : ""}`} onClick={() => setType("i2v")}>
          🖼️ Imagem → Vídeo
        </button>
        <button className={`tab ${type === "long" ? "active" : ""}`} onClick={() => setType("long")}>
          🎞️ Vídeo longo (minutos)
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card">
        <label className="field">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="lbl">Prompt {type === "i2v" ? "(opcional)" : ""}</span>
            <button
              type="button"
              className="btn secondary small"
              onClick={enhance}
              disabled={enhancing}
              title="Usa o Claude para expandir/traduzir sua ideia (requer chave em Configurações)"
            >
              {enhancing ? "Melhorando…" : "✨ Melhorar prompt"}
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex.: Um gato laranja caminha por um telhado ao pôr do sol, câmera acompanhando em travelling suave, luz dourada, estilo cinematográfico"
          />
          <div className="hint">
            Escreva a ideia em português e clique em ✨ para o Claude transformar num prompt
            cinematográfico {isLong ? "e gerar o roteiro por segmento" : "detalhado"}.
          </div>
        </label>

        {(type === "i2v" || type === "long") && (
          <label className="field">
            <span className="lbl">
              Imagem de referência {type === "long" ? "(opcional — primeiro quadro)" : ""}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onImage(e.target.files?.[0] ?? null)}
            />
            {imageB64 && (
              <div className="row" style={{ marginTop: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageB64}
                  alt={imageName}
                  style={{ maxHeight: 120, borderRadius: 8, border: "1px solid var(--border)" }}
                />
                <button className="btn danger small" onClick={() => { setImageB64(""); setImageName(""); }}>
                  Remover
                </button>
              </div>
            )}
          </label>
        )}

        {isLong && (
          <>
            <label className="field">
              <span className="lbl">Duração desejada: {targetSeconds}s</span>
              <input
                type="range"
                min={10}
                max={240}
                step={5}
                value={targetSeconds}
                onChange={(e) => setTargetSeconds(Number(e.target.value))}
                style={{ width: "100%" }}
              />
              <div className="hint">
                {numSegments} segmento(s) de continuação → duração real ≈ <b>{estSeconds}s</b>{" "}
                {refine === "spatiotemporal" ? "(30 fps após refino)" : "(15 fps)"}
              </div>
            </label>
            <label className="field">
              <span className="lbl">Prompts por segmento (opcional — um por linha)</span>
              <textarea
                value={segmentPrompts}
                onChange={(e) => setSegmentPrompts(e.target.value)}
                placeholder={"O gato pula para outro telhado\nO gato encontra um pássaro\n..."}
              />
              <div className="hint">
                Direciona a narrativa de cada segmento. Linhas vazias usam o prompt principal.
              </div>
            </label>
          </>
        )}

        <label className="field">
          <span className="lbl">Qualidade final</span>
          <select value={refine} onChange={(e) => setRefine(e.target.value as RefineMode)}>
            <option value="none">480p rápido (sem refinamento)</option>
            <option value="spatial">720p — refinamento espacial</option>
            <option value="spatiotemporal">720p 30fps — refinamento espaço-temporal (mais lento)</option>
          </select>
        </label>

        <button className="tab" onClick={() => setAdvanced(!advanced)} style={{ marginBottom: 14 }}>
          {advanced ? "▲ Ocultar avançado" : "▼ Opções avançadas"}
        </button>

        {advanced && (
          <div className="grid-2">
            <label className="field">
              <span className="lbl">Prompt negativo</span>
              <textarea
                value={negative}
                onChange={(e) => setNegative(e.target.value)}
                placeholder="(padrão do modelo se vazio)"
              />
            </label>
            <div>
              <label className="field">
                <span className="lbl">Passos de inferência: {steps}</span>
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </label>
              <label className="field">
                <span className="lbl">Guidance scale: {guidance.toFixed(1)}</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={guidance}
                  onChange={(e) => setGuidance(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </label>
              <label className="field">
                <span className="lbl">Seed (opcional)</span>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="aleatória"
                />
              </label>
              <label className="field row" style={{ gap: 8 }}>
                <input
                  type="checkbox"
                  checked={useDistill}
                  onChange={(e) => setUseDistill(e.target.checked)}
                  style={{ width: "auto" }}
                />
                <span>
                  Modo turbo (LoRA destilada, 16 passos) —{" "}
                  <span className="dim">se disponível no checkpoint</span>
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn" onClick={submit} disabled={submitting}>
            {submitting ? "Enviando…" : "🚀 Gerar vídeo"}
          </button>
          {isLong && <span className="duration-pill">≈ {estSeconds}s de vídeo final</span>}
        </div>
      </div>
    </div>
  );
}
