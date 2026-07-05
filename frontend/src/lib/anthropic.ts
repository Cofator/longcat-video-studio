import Anthropic from "@anthropic-ai/sdk";
import { getSettings } from "./store";

// A API da LongCat é compatível com a da Anthropic (endpoint /anthropic),
// então o mesmo SDK atende os dois provedores — muda só baseURL e modelo.
const LONGCAT_BASE_URL = "https://api.longcat.chat/anthropic";
const CLAUDE_MODEL = "claude-opus-4-8";
const LONGCAT_MODEL = "LongCat-2.0"; // modelo mais novo/capaz da Meituan

export interface LLM {
  client: Anthropic;
  model: string;
  provider: "claude" | "longcat";
}

/**
 * Monta o cliente do provedor de LLM.
 * `override` força um provedor específico (usado pelo Chat); sem ele, usa o
 * provedor configurado em Configurações.
 */
export async function getLLM(override?: "claude" | "longcat"): Promise<LLM | null> {
  const s = await getSettings();
  const provider = override ?? s.llmProvider;
  if (provider === "longcat") {
    if (!s.longcatApiKey) return null;
    return {
      client: new Anthropic({ apiKey: s.longcatApiKey, baseURL: LONGCAT_BASE_URL }),
      model: LONGCAT_MODEL,
      provider: "longcat",
    };
  }
  if (!s.anthropicApiKey) return null;
  return {
    client: new Anthropic({ apiKey: s.anthropicApiKey }),
    model: CLAUDE_MODEL,
    provider: "claude",
  };
}

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

function textOf(res: Anthropic.Message): string {
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

/** Expande/traduz a ideia do usuário em um prompt cinematográfico (inglês). */
export async function enhancePrompt(llm: LLM, idea: string): Promise<string> {
  const res = await llm.client.messages.create({
    model: llm.model,
    max_tokens: 1024,
    system: SYSTEM,
    messages: [{ role: "user", content: idea }],
  });
  return textOf(res);
}

/** Gera N prompts por segmento para vídeo longo (narrativa contínua). */
export async function generateSegments(llm: LLM, idea: string, n: number): Promise<string[]> {
  const res = await llm.client.messages.create({
    model: llm.model,
    max_tokens: 2048,
    system: SYSTEM_SEGMENTS,
    messages: [
      {
        role: "user",
        content: `Ideia: ${idea}\nNúmero de segmentos (N): ${n}\nGere exatamente ${n} passos.`,
      },
    ],
  });
  const raw = textOf(res);
  // Extrai o objeto JSON mesmo que venha cercado por texto/```.
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { segments?: string[] };
    return Array.isArray(parsed.segments) ? parsed.segments.slice(0, n) : [];
  } catch {
    return [];
  }
}
