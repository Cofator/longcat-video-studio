import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

function mask(value: string): string {
  if (!value) return "";
  if (value.length <= 8) return "••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

export async function GET() {
  const s = await getSettings();
  return NextResponse.json({
    vastApiKeyMasked: mask(s.vastApiKey),
    hasVastApiKey: Boolean(s.vastApiKey),
    workerUrl: s.workerUrl,
    workerTokenMasked: mask(s.workerToken),
    hasWorkerToken: Boolean(s.workerToken),
    studioRepo: s.studioRepo,
    llmProvider: s.llmProvider,
    anthropicApiKeyMasked: mask(s.anthropicApiKey),
    hasAnthropicApiKey: Boolean(s.anthropicApiKey),
    longcatApiKeyMasked: mask(s.longcatApiKey),
    hasLongcatApiKey: Boolean(s.longcatApiKey),
    openrouterApiKeyMasked: mask(s.openrouterApiKey),
    hasOpenrouterApiKey: Boolean(s.openrouterApiKey),
    openrouterModel: s.openrouterModel,
    glmApiKeyMasked: mask(s.glmApiKey),
    hasGlmApiKey: Boolean(s.glmApiKey),
    glmModel: s.glmModel,
    hfTokenMasked: mask(s.hfToken),
    hasHfToken: Boolean(s.hfToken),
  });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const patch: Record<string, string> = {};
  for (const key of [
    "vastApiKey",
    "workerUrl",
    "workerToken",
    "studioRepo",
    "anthropicApiKey",
    "longcatApiKey",
    "openrouterApiKey",
    "openrouterModel",
    "glmApiKey",
    "glmModel",
    "hfToken",
  ] as const) {
    if (typeof body[key] === "string") patch[key] = body[key].trim();
  }
  if (["claude", "longcat", "openrouter"].includes(body.llmProvider)) {
    patch.llmProvider = body.llmProvider;
  }
  await saveSettings(patch as any);
  return NextResponse.json({ ok: true });
}
