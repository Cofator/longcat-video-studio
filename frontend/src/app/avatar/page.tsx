"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AudioInput } from "@/lib/types";

type Mode = "single" | "multi";

function fileToB64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

interface SpeakerState {
  name: string;
  file: File | null;
  b64: string;
  bbox: string; // "y_min,x_min,y_max,x_max"
}

export default function AvatarPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("single");
  const [prompt, setPrompt] = useState("");
  const [stage1, setStage1] = useState<"ai2v" | "at2v">("ai2v");
  const [imageB64, setImageB64] = useState("");
  const [imageName, setImageName] = useState("");
  const [resolution, setResolution] = useState<"480p" | "720p">("480p");
  const [numSegments, setNumSegments] = useState(1);
  const [audioType, setAudioType] = useState<"para" | "add">("para");
  const [speakers, setSpeakers] = useState<SpeakerState[]>([
    { name: "person1", file: null, b64: "", bbox: "" },
    { name: "person2", file: null, b64: "", bbox: "" },
  ]);
  const [advanced, setAdvanced] = useState(false);
  const [textCfg, setTextCfg] = useState(4.0);
  const [audioCfg, setAudioCfg] = useState(4.0);
  const [refImgIndex, setRefImgIndex] = useState(10);
  const [maskRange, setMaskRange] = useState(3);
  const [useInt8, setUseInt8] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState("");

  const needsImage = mode === "multi" || (mode === "single" && stage1 === "ai2v");

  const onImage = async (file: File | null) => {
    if (!file) return;
    setImageName(file.name);
    setImageB64(await fileToB64(file));
  };

  const setSpeaker = (i: number, patch: Partial<SpeakerState>) => {
    setSpeakers((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const onSpeakerAudio = async (i: number, file: File | null) => {
    if (!file) return;
    setSpeaker(i, { file, b64: await fileToB64(file) });
  };

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
        body: JSON.stringify({ idea: prompt.trim(), segments: 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Falha ao melhorar o prompt");
      if (data.prompt) setPrompt(data.prompt);
    } catch (err: any) {
      setError(String(err?.message ?? err));
    } finally {
      setEnhancing(false);
    }
  };

  const submit = async () => {
    setError("");
    if (needsImage && !imageB64) {
      setError("Envie uma imagem de referência (rosto/pessoa).");
      return;
    }
    const active = mode === "single" ? speakers.slice(0, 1) : speakers;
    const withAudio = active.filter((s) => s.b64);
    if (mode === "single" && withAudio.length !== 1) {
      setError("Envie o áudio da fala.");
      return;
    }
    if (mode === "multi" && withAudio.length < 2) {
      setError("O modo multi-voz exige pelo menos 2 áudios.");
      return;
    }

    const audios: AudioInput[] = withAudio.map((s) => {
      const a: AudioInput = { name: s.name, data_b64: s.b64 };
      if (mode === "multi" && s.bbox.trim()) {
        const parts = s.bbox.split(",").map((x) => parseInt(x.trim(), 10));
        if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) a.bbox = parts;
      }
      return a;
    });

    const body: Record<string, unknown> = {
      type: mode === "single" ? "avatar-single" : "avatar-multi",
      prompt: prompt.trim(),
      audios,
      resolution,
      num_segments: numSegments,
      stage_1: mode === "single" ? stage1 : "ai2v",
      text_guidance_scale: textCfg,
      audio_guidance_scale: audioCfg,
      ref_img_index: refImgIndex,
      mask_frame_range: maskRange,
      use_int8: useInt8,
      audio_type: audioType,
    };
    if (imageB64) body.image_b64 = imageB64;

    setSubmitting(true);
    try {
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
      <h1 className="page-title">Avatar — vídeo a partir de áudio</h1>
      <p className="page-sub">
        Gera uma pessoa falando com lip-sync a partir de um áudio, usando o modelo
        LongCat-Video-Avatar 1.5. Escolha uma voz (single) ou uma conversa entre falantes (multi).
      </p>

      <div className="alert info">
        ⏳ No <b>primeiro uso</b>, a GPU baixa os pesos do avatar (alguns GB) — pode demorar.
        Depois fica em cache. Recomendado marcar <b>INT8</b> em GPUs de 48 GB.
      </div>

      <div className="tabs">
        <button className={`tab ${mode === "single" ? "active" : ""}`} onClick={() => setMode("single")}>
          🗣️ Single — uma voz
        </button>
        <button className={`tab ${mode === "multi" ? "active" : ""}`} onClick={() => setMode("multi")}>
          👥 Multi — conversa
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card">
        <label className="field">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="lbl">Descrição da cena (prompt)</span>
            <button
              type="button"
              className="btn secondary small"
              onClick={enhance}
              disabled={enhancing}
              title="Usa o LLM configurado (Claude ou LongCat) para expandir/traduzir sua ideia"
            >
              {enhancing ? "Melhorando…" : "✨ Melhorar prompt"}
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex.: Uma apresentadora em um estúdio bem iluminado, olhando para a câmera, falando com naturalidade"
          />
        </label>

        {mode === "single" && (
          <label className="field">
            <span className="lbl">Origem do vídeo</span>
            <select value={stage1} onChange={(e) => setStage1(e.target.value as "ai2v" | "at2v")}>
              <option value="ai2v">A partir de uma imagem de referência (recomendado)</option>
              <option value="at2v">Gerar a pessoa do zero (sem imagem)</option>
            </select>
          </label>
        )}

        {needsImage && (
          <label className="field">
            <span className="lbl">
              Imagem de referência {mode === "multi" ? "(com todos os falantes na cena)" : "(rosto/pessoa)"}
            </span>
            <input type="file" accept="image/*" onChange={(e) => onImage(e.target.files?.[0] ?? null)} />
            {imageB64 && (
              <div className="row" style={{ marginTop: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageB64} alt={imageName} style={{ maxHeight: 130, borderRadius: 8, border: "1px solid var(--border)" }} />
                <button className="btn danger small" onClick={() => { setImageB64(""); setImageName(""); }}>Remover</button>
              </div>
            )}
          </label>
        )}

        {/* ----- áudios ----- */}
        {mode === "single" ? (
          <label className="field">
            <span className="lbl">Áudio da fala (wav ou mp3)</span>
            <input type="file" accept="audio/*" onChange={(e) => onSpeakerAudio(0, e.target.files?.[0] ?? null)} />
            {speakers[0].file && <div className="hint">🎵 {speakers[0].file.name}</div>}
          </label>
        ) : (
          <>
            {[0, 1].map((i) => (
              <div key={i} className="card" style={{ background: "var(--panel-2)", marginBottom: 12 }}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                  <b>Falante {i + 1}</b>
                  <input
                    type="text"
                    value={speakers[i].name}
                    onChange={(e) => setSpeaker(i, { name: e.target.value })}
                    style={{ width: 140 }}
                  />
                </div>
                <label className="field">
                  <span className="lbl">Áudio (wav/mp3)</span>
                  <input type="file" accept="audio/*" onChange={(e) => onSpeakerAudio(i, e.target.files?.[0] ?? null)} />
                  {speakers[i].file && <div className="hint">🎵 {speakers[i].file.name}</div>}
                </label>
                <label className="field" style={{ margin: 0 }}>
                  <span className="lbl">
                    Região do rosto na imagem — bbox <span className="dim">(opcional: y_min,x_min,y_max,x_max)</span>
                  </span>
                  <input
                    type="text"
                    value={speakers[i].bbox}
                    onChange={(e) => setSpeaker(i, { bbox: e.target.value })}
                    placeholder="ex.: 80,60,420,300"
                  />
                </label>
              </div>
            ))}
            <label className="field">
              <span className="lbl">Como combinar as falas</span>
              <select value={audioType} onChange={(e) => setAudioType(e.target.value as "para" | "add")}>
                <option value="para">Paralelo — falam na mesma linha do tempo</option>
                <option value="add">Sequencial — um fala depois do outro</option>
              </select>
            </label>
          </>
        )}

        <div className="grid-2">
          <label className="field">
            <span className="lbl">Resolução</span>
            <select value={resolution} onChange={(e) => setResolution(e.target.value as "480p" | "720p")}>
              <option value="480p">480p (rápido)</option>
              <option value="720p">720p (mais lento)</option>
            </select>
          </label>
          <label className="field">
            <span className="lbl">Duração (segmentos): {numSegments}</span>
            <input
              type="range"
              min={1}
              max={20}
              value={numSegments}
              onChange={(e) => setNumSegments(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div className="hint">Cada segmento ≈ 3–4 s. Ajuste conforme a duração do áudio.</div>
          </label>
        </div>

        <button className="tab" onClick={() => setAdvanced(!advanced)} style={{ marginBottom: 14 }}>
          {advanced ? "▲ Ocultar avançado" : "▼ Opções avançadas"}
        </button>

        {advanced && (
          <div className="grid-2">
            <label className="field">
              <span className="lbl">Guidance de texto: {textCfg.toFixed(1)}</span>
              <input type="range" min={1} max={8} step={0.5} value={textCfg} onChange={(e) => setTextCfg(Number(e.target.value))} style={{ width: "100%" }} />
            </label>
            <label className="field">
              <span className="lbl">Guidance de áudio (lip-sync): {audioCfg.toFixed(1)}</span>
              <input type="range" min={1} max={8} step={0.5} value={audioCfg} onChange={(e) => setAudioCfg(Number(e.target.value))} style={{ width: "100%" }} />
              <div className="hint">3–5 costuma dar o melhor sincronismo labial.</div>
            </label>
            <label className="field">
              <span className="lbl">ref_img_index: {refImgIndex}</span>
              <input type="range" min={0} max={30} value={refImgIndex} onChange={(e) => setRefImgIndex(Number(e.target.value))} style={{ width: "100%" }} />
            </label>
            <label className="field">
              <span className="lbl">mask_frame_range: {maskRange}</span>
              <input type="range" min={0} max={10} value={maskRange} onChange={(e) => setMaskRange(Number(e.target.value))} style={{ width: "100%" }} />
            </label>
            <label className="field row" style={{ gap: 8 }}>
              <input type="checkbox" checked={useInt8} onChange={(e) => setUseInt8(e.target.checked)} style={{ width: "auto" }} />
              <span>INT8 — menos VRAM (recomendado em GPUs de 48 GB)</span>
            </label>
          </div>
        )}

        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn" onClick={submit} disabled={submitting}>
            {submitting ? "Enviando…" : "🎙️ Gerar avatar"}
          </button>
        </div>
      </div>
    </div>
  );
}
