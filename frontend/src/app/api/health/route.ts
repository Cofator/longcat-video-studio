import { NextResponse } from "next/server";
import { resolveWorker } from "@/lib/worker";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const worker = await resolveWorker();
    if (!worker) {
      return NextResponse.json({ connected: false, reason: "not_configured" });
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${worker.url}/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      const health = await res.json();
      return NextResponse.json({ connected: true, url: worker.url, health });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      reason: "unreachable",
      error: String(err?.message ?? err),
    });
  }
}
