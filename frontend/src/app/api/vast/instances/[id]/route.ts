import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";
import { destroyInstance, setInstanceState } from "@/lib/vast";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const settings = await getSettings();
  if (!settings.vastApiKey) {
    return NextResponse.json({ error: "Chave da API Vast.ai não configurada." }, { status: 400 });
  }
  try {
    const body = await req.json();
    const state = body.state === "running" ? "running" : body.state === "stopped" ? "stopped" : null;
    if (!state) {
      return NextResponse.json({ error: "state deve ser 'running' ou 'stopped'" }, { status: 400 });
    }
    const result = await setInstanceState(settings.vastApiKey, Number(params.id), state);
    return NextResponse.json(result ?? { ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 502 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const settings = await getSettings();
  if (!settings.vastApiKey) {
    return NextResponse.json({ error: "Chave da API Vast.ai não configurada." }, { status: 400 });
  }
  try {
    const result = await destroyInstance(settings.vastApiKey, Number(params.id));
    return NextResponse.json(result ?? { ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 502 });
  }
}
