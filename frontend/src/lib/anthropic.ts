import Anthropic from "@anthropic-ai/sdk";
import { getSettings } from "./store";

export const ENHANCE_MODEL = "claude-opus-4-8";

export async function getAnthropic(): Promise<Anthropic | null> {
  const settings = await getSettings();
  if (!settings.anthropicApiKey) return null;
  return new Anthropic({ apiKey: settings.anthropicApiKey });
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
export async function enhancePrompt(client: Anthropic, idea: string): Promise<string> {
  const res = await client.messages.create({
    model: ENHANCE_MODEL,
    max_tokens: 1024,
    system: SYSTEM,
    messages: [{ role: "user", content: idea }],
  });
  return textOf(res);
}

/** Gera N prompts por segmento para vídeo longo (narrativa contínua). */
export async function generateSegments(
  client: Anthropic,
  idea: string,
  n: number
): Promise<string[]> {
  const res = await client.messages.create({
    model: ENHANCE_MODEL,
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
