import { NextResponse } from "next/server";
import { enhancePrompt, generateSegments, getLLM } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const llm = await getLLM();
  if (!llm) {
    return NextResponse.json(
      { error: "Nenhum provedor de LLM configurado. Defina a chave (Claude ou LongCat) em Configurações." },
      { status: 400 }
    );
  }
  try {
    const body = await req.json();
    const idea = String(body.idea ?? "").trim();
    if (!idea) {
      return NextResponse.json({ error: "Escreva uma ideia primeiro." }, { status: 400 });
    }
    const segments = Number(body.segments ?? 0);
    const prompt = await enhancePrompt(llm, idea);
    let segmentPrompts: string[] = [];
    if (segments && segments > 0) {
      segmentPrompts = await generateSegments(llm, idea, Math.min(segments, 30));
    }
    return NextResponse.json({ prompt, segmentPrompts, provider: llm.provider });
  } catch (err: any) {
    const msg = err?.error?.error?.message ?? err?.message ?? String(err);
    return NextResponse.json({ error: `${llm.provider}: ${msg}` }, { status: 502 });
  }
}
