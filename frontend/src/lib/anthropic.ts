import Anthropic from "@anthropic-ai/sdk";
import { getSettings } from "./store";

// Provedores de LLM. Claude e LongCat usam o formato Anthropic; OpenRouter usa
// o formato OpenAI (chat/completions). Um único wrapper atende os três.
const LONGCAT_BASE_URL = "https://api.longcat.chat/anthropic";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const CLAUDE_MODEL = "claude-opus-4-8";
const LONGCAT_MODEL = "LongCat-2.0";
const OPENROUTER_DEFAULT_MODEL = "deepseek/deepseek-chat-v3:free";

export type Provider = "claude" | "longcat" | "openrouter";

export interface LLMConfig {
  provider: Provider;
  format: "anthropic" | "openai";
  apiKey: string;
  baseURL?: string;
  model: string;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

/**
 * Monta a config do provedor de LLM.
 * `override` força um provedor específico (usado pelo Chat); sem ele, usa o
 * provedor configurado em Configurações.
 */
export async function getLLM(override?: Provider): Promise<LLMConfig | null> {
  const s = await getSettings();
  const provider = override ?? s.llmProvider;

  if (provider === "openrouter") {
    if (!s.openrouterApiKey) return null;
    return {
      provider,
      format: "openai",
      apiKey: s.openrouterApiKey,
      baseURL: OPENROUTER_BASE_URL,
      model: s.openrouterModel?.trim() || OPENROUTER_DEFAULT_MODEL,
    };
  }
  if (provider === "longcat") {
    if (!s.longcatApiKey) return null;
    return {
      provider,
      format: "anthropic",
      apiKey: s.longcatApiKey,
      baseURL: LONGCAT_BASE_URL,
      model: LONGCAT_MODEL,
    };
  }
  if (!s.anthropicApiKey) return null;
  return { provider: "claude", format: "anthropic", apiKey: s.anthropicApiKey, model: CLAUDE_MODEL };
}

// ---------------------------------------------------------------------------
// Chamadas — completa (não-streaming) e stream
// ---------------------------------------------------------------------------

/** Uma resposta completa (sem streaming) do provedor. */
export async function complete(
  cfg: LLMConfig,
  system: string,
  messages: ChatMsg[],
  maxTokens = 1024
): Promise<string> {
  if (cfg.format === "anthropic") {
    const client = new Anthropic({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
    const res = await client.messages.create({
      model: cfg.model,
      max_tokens: maxTokens,
      system,
      messages,
    });
    return res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
  }
  // OpenAI (OpenRouter)
  const res = await fetch(`${cfg.baseURL}/chat/completions`, {
    method: "POST",
    headers: openaiHeaders(cfg),
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: maxTokens,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content ?? "").trim();
}

/** Stream de texto (para o Chat). Retorna um async iterator de trechos. */
export async function* streamLLM(
  cfg: LLMConfig,
  system: string,
  messages: ChatMsg[],
  maxTokens = 4096
): AsyncGenerator<string> {
  if (cfg.format === "anthropic") {
    const client = new Anthropic({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
    const s = client.messages.stream({ model: cfg.model, max_tokens: maxTokens, system, messages });
    for await (const event of s) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
    return;
  }
  // OpenAI (OpenRouter) — SSE
  const res = await fetch(`${cfg.baseURL}/chat/completions`, {
    method: "POST",
    headers: openaiHeaders(cfg),
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: maxTokens,
      stream: true,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok || !res.body) throw new Error(await res.text().catch(() => "erro de rede"));
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const j = JSON.parse(payload);
        const delta = j?.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* ignora linhas parciais/keep-alive */
      }
    }
  }
}

function openaiHeaders(cfg: LLMConfig): Record<string, string> {
  return {
    Authorization: `Bearer ${cfg.apiKey}`,
    "Content-Type": "application/json",
    // Recomendados pelo OpenRouter (opcionais):
    "HTTP-Referer": "https://github.com/Cofator/longcat-video-studio",
    "X-Title": "LongCat Video Studio",
  };
}

// ---------------------------------------------------------------------------
// Melhorar prompt / roteiro por segmento
// ---------------------------------------------------------------------------

const SYSTEM = `Você é um diretor de fotografia especialista em prompts para o modelo de geração de vídeo LongCat-Video.
Sua tarefa é transformar a ideia do usuário em um prompt cinematográfico rico e visual, em INGLÊS (o modelo entende melhor inglês).
Regras:
- Descreva sujeito, ação, ambiente, iluminação, movimento de câmera, estilo e atmosfera.
- Seja concreto e visual; evite instruções abstratas ou metalinguagem.
- Uma cena contínua — não descreva cortes.
- Não invente marcas, textos na tela ou logotipos.
- Retorne SOMENTE o prompt final, sem aspas, sem preâmbulo, sem explicação.`;

const SYSTEM_SEGMENTS = `Você é um roteirista para o modelo de vídeo longo LongCat-Video, que gera vídeos por continuação contínua de segmentos (a mesma tomada evolui, sem cortes).
Dada uma ideia e um número N de segmentos, escreva a evolução da cena em N passos curtos, cada um continuando suavemente o anterior (sem cortes bruscos de cenário).
Cada passo é uma frase visual e concreta em INGLÊS.
Responda SOMENTE com um objeto JSON no formato {"segments": ["...", "..."]} contendo exatamente N frases, sem texto fora do JSON.`;

/** Expande/traduz a ideia do usuário em um prompt cinematográfico (inglês). */
export async function enhancePrompt(cfg: LLMConfig, idea: string): Promise<string> {
  return complete(cfg, SYSTEM, [{ role: "user", content: idea }], 1024);
}

/** Gera N prompts por segmento para vídeo longo (narrativa contínua). */
export async function generateSegments(cfg: LLMConfig, idea: string, n: number): Promise<string[]> {
  const raw = await complete(
    cfg,
    SYSTEM_SEGMENTS,
    [{ role: "user", content: `Ideia: ${idea}\nNúmero de segmentos (N): ${n}\nGere exatamente ${n} passos.` }],
    2048
  );
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { segments?: string[] };
    return Array.isArray(parsed.segments) ? parsed.segments.slice(0, n) : [];
  } catch {
    return [];
  }
}
