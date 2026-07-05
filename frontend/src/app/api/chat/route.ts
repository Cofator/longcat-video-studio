import { getLLM } from "@/lib/anthropic";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SYSTEM =
  "Você é um assistente útil, direto e competente. Responda no idioma do usuário. " +
  "Para código, use blocos markdown com ``` e a linguagem. Seja claro e conciso.";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const provider = body.provider === "claude" || body.provider === "longcat" ? body.provider : undefined;

  const llm = await getLLM(provider);
  if (!llm) {
    return Response.json(
      { error: "Chave da LLM não configurada. Defina em Configurações (Claude ou LongCat)." },
      { status: 400 }
    );
  }

  const rawMessages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
  const messages = rawMessages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content }));

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "Mensagem do usuário ausente." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = llm.client.messages.stream({
          model: llm.model,
          max_tokens: 4096,
          system: SYSTEM,
          messages,
        });
        for await (const event of s) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err: any) {
        const msg = err?.error?.error?.message ?? err?.message ?? String(err);
        controller.enqueue(encoder.encode(`\n\n⚠️ Erro (${llm.provider}): ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Provider": llm.provider,
      "X-Model": llm.model,
    },
  });
}
