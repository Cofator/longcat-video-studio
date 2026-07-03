import { NextResponse } from "next/server";
import { workerFetch } from "@/lib/worker";

export const dynamic = "force-dynamic";

/** Proxy do MP4 gerado, com suporte a Range (seek no player). */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const range = req.headers.get("range");
    const res = await workerFetch(`/jobs/${encodeURIComponent(params.id)}/video`, {
      headers: range ? { Range: range } : undefined,
      timeoutMs: 120_000,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: res.statusText }));
      return NextResponse.json(data, { status: res.status });
    }
    const headers = new Headers();
    for (const h of ["content-type", "content-length", "content-range", "accept-ranges", "content-disposition"]) {
      const v = res.headers.get(h);
      if (v) headers.set(h, v);
    }
    return new NextResponse(res.body, { status: res.status, headers });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 502 });
  }
}
