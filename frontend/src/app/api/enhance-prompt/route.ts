import { NextResponse } from "next/server";
import { enhancePrompt, generateSegments, getAnthropic } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const client = await getAnthropic();
  if (!client) {
    return NextResponse.json(
      { error: "Chave da API do Claude não configurada (Configurações)." },
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
    const prompt = await enhancePrompt(client, idea);
    let segmentPrompts: string[] = [];
    if (segments && segments > 0) {
      segmentPrompts = await generateSegments(client, idea, Math.min(segments, 30));
    }
    return NextResponse.json({ prompt, segmentPrompts });
  } catch (err: any) {
    const msg = err?.error?.error?.message ?? err?.message ?? String(err);
    return NextResponse.json({ error: `Claude: ${msg}` }, { status: 502 });
  }
}
