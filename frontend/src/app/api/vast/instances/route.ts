import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";
import { createInstance, listInstances, workerUrlFromInstance } from "@/lib/vast";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  if (!settings.vastApiKey) {
    return NextResponse.json(
      { error: "Chave da API Vast.ai não configurada (Configurações)." },
      { status: 400 }
    );
  }
  try {
    const instances = await listInstances(settings.vastApiKey);
    return NextResponse.json({
      instances: instances.map((i) => ({ ...i, workerUrl: workerUrlFromInstance(i) })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 502 });
  }
}

export async function POST(req: Request) {
  const settings = await getSettings();
  if (!settings.vastApiKey) {
    return NextResponse.json(
      { error: "Chave da API Vast.ai não configurada (Configurações)." },
      { status: 400 }
    );
  }
  try {
    const body = await req.json();
    const offerId = Number(body.offerId);
    if (!offerId) {
      return NextResponse.json({ error: "offerId é obrigatório" }, { status: 400 });
    }
    const result = await createInstance(settings.vastApiKey, offerId, {
      studioRepo: settings.studioRepo,
      workerToken: settings.workerToken,
      disk: typeof body.disk === "number" ? body.disk : 100,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 502 });
  }
}
