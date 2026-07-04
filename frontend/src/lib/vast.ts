import type { VastInstance, VastOffer } from "./types";

// Instância base da API. Cada rota inclui a versão (`/v0/...` ou `/v1/...`):
// busca (bundles) e criação (asks) permanecem em v0; gestão de instâncias
// migrou para v1 (v0 responde 410 deprecated_endpoint).
const VAST_API = "https://console.vast.ai/api";

export class VastError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function vastFetch(
  apiKey: string,
  method: string,
  route: string,
  body?: unknown
): Promise<any> {
  const res = await fetch(`${VAST_API}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  // Vast frequentemente responde 200 com {success:false, error, msg}.
  const failed = !res.ok || data?.success === false;
  if (failed) {
    const parts = [data?.error, data?.msg, data?.detail].filter(Boolean);
    const msg = parts.length ? parts.join(" — ") : text || res.statusText;
    throw new VastError(res.status, `Vast.ai ${res.status}: ${String(msg).slice(0, 800)}`);
  }
  return data;
}

export interface OfferFilters {
  gpuNames?: string[]; // ex.: ["A100_SXM4", "H100_SXM"]
  minGpuRam?: number; // MB
  maxPrice?: number; // USD/h
  minDisk?: number; // GB
  numGpus?: number;
}

export async function searchOffers(apiKey: string, f: OfferFilters): Promise<VastOffer[]> {
  const query: Record<string, unknown> = {
    limit: 40,
    type: "ondemand",
    rentable: { eq: true },
    verified: { eq: true },
    num_gpus: { eq: f.numGpus ?? 1 },
    disk_space: { gte: f.minDisk ?? 80 },
    order: [["dph_total", "asc"]],
  };
  if (f.gpuNames?.length) query.gpu_name = { in: f.gpuNames };
  if (f.minGpuRam) query.gpu_ram = { gte: f.minGpuRam };
  if (f.maxPrice) query.dph_total = { lte: f.maxPrice };

  const data = await vastFetch(apiKey, "POST", "/v0/bundles/", query);
  return (data?.offers ?? []) as VastOffer[];
}

export const WORKER_LABEL = "longcat-video-studio";
export const WORKER_PORT = 8000;
export const DEFAULT_IMAGE = "pytorch/pytorch:2.6.0-cuda12.4-cudnn9-devel";

export function buildOnstart(studioRepo: string, workerToken: string): string {
  // Compact onstart (Vast.ai limits its size): fetches and runs the full
  // provisioning script from the studio repository.
  return [
    "#!/bin/bash",
    `export WORKER_TOKEN='${workerToken.replace(/'/g, "")}'`,
    `export STUDIO_REPO='${studioRepo.replace(/'/g, "")}'`,
    "cd /workspace",
    `git clone "$STUDIO_REPO" longcat-video-studio || (cd longcat-video-studio && git pull)`,
    "bash longcat-video-studio/worker/vast_onstart.sh",
  ].join("\n");
}

export async function createInstance(
  apiKey: string,
  offerId: number,
  opts: { studioRepo: string; workerToken: string; disk?: number }
): Promise<{ new_contract: number }> {
  // A API espera `env` como objeto: variáveis viram "CHAVE": "valor" e o
  // mapeamento de porta vira "-p 8000:8000": "1".
  const env: Record<string, string> = {
    [`-p ${WORKER_PORT}:${WORKER_PORT}`]: "1",
    OPEN_BUTTON_PORT: String(WORKER_PORT),
  };
  if (opts.workerToken) env.WORKER_TOKEN = opts.workerToken;

  // Body aligned with the documented REST payload for PUT /asks/{id}/.
  // (No `client_id` — that's a CLI-only field and triggers `invalid_args` here.)
  return vastFetch(apiKey, "PUT", `/v0/asks/${offerId}/`, {
    image: DEFAULT_IMAGE,
    disk: opts.disk ?? 100,
    label: WORKER_LABEL,
    runtype: "ssh",
    target_state: "running",
    onstart: buildOnstart(opts.studioRepo, opts.workerToken),
    env,
  });
}

export async function listInstances(apiKey: string): Promise<VastInstance[]> {
  const data = await vastFetch(apiKey, "GET", "/v1/instances");
  // v1 pode retornar {instances:[...]}, um array direto ou {results:[...]}.
  const list = Array.isArray(data)
    ? data
    : data?.instances ?? data?.results ?? [];
  return list as VastInstance[];
}

// Nota: apenas o GET de listagem foi descontinuado na v0 (410). Iniciar/parar
// e destruir continuam em /api/v0/instances/{id}/ (com barra final).
export async function setInstanceState(
  apiKey: string,
  id: number,
  state: "running" | "stopped"
): Promise<any> {
  return vastFetch(apiKey, "PUT", `/v0/instances/${id}/`, { state });
}

export async function destroyInstance(apiKey: string, id: number): Promise<any> {
  return vastFetch(apiKey, "DELETE", `/v0/instances/${id}/`);
}

/**
 * Resolve the public URL of the worker from a Vast.ai instance's port map.
 * The `ports` map only populates once the instance finishes loading; while
 * provisioning it is null and this returns null (worker not reachable yet).
 */
export function workerUrlFromInstance(inst: VastInstance): string | null {
  const ip = inst.public_ipaddr?.trim();
  const ports = inst.ports as Record<string, { HostIp?: string; HostPort?: string }[]> | undefined;
  if (!ip || !ports) return null;
  // Procura a chave da porta do worker em qualquer formato ("8000/tcp", "8000").
  const key =
    Object.keys(ports).find((k) => k === `${WORKER_PORT}/tcp`) ??
    Object.keys(ports).find((k) => k.split("/")[0] === String(WORKER_PORT));
  const hostPort = key ? ports[key]?.[0]?.HostPort : undefined;
  if (!hostPort) return null;
  return `http://${ip}:${hostPort}`;
}

/** Find the studio worker instance (by label) and its URL, if any. */
export async function findWorker(
  apiKey: string
): Promise<{ instance: VastInstance; url: string | null } | null> {
  const instances = await listInstances(apiKey);
  const inst =
    instances.find((i) => i.label === WORKER_LABEL && i.actual_status === "running") ??
    instances.find((i) => i.label === WORKER_LABEL) ??
    null;
  if (!inst) return null;
  return { instance: inst, url: workerUrlFromInstance(inst) };
}
