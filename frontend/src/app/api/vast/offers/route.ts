import { NextResponse } from "next/server";
import { getSettings } from "@/lib/store";
import { searchOffers } from "@/lib/vast";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const settings = await getSettings();
  if (!settings.vastApiKey) {
    return NextResponse.json(
      { error: "Chave da API Vast.ai não configurada (Configurações)." },
      { status: 400 }
    );
  }
  try {
    const body = await req.json().catch(() => ({}));
    const offers = await searchOffers(settings.vastApiKey, {
      gpuNames: Array.isArray(body.gpuNames) && body.gpuNames.length ? body.gpuNames : undefined,
      minGpuRam: typeof body.minGpuRam === "number" ? body.minGpuRam : undefined,
      maxPrice: typeof body.maxPrice === "number" ? body.maxPrice : undefined,
      minDisk: typeof body.minDisk === "number" ? body.minDisk : undefined,
      numGpus: typeof body.numGpus === "number" ? body.numGpus : undefined,
    });
    return NextResponse.json({ offers });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 502 });
  }
}
