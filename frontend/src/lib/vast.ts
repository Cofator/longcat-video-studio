import type { VastInstance, VastOffer } from "./types";

const VAST_API = "https://console.vast.ai/api/v0";

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
  if (!res.ok) {
    const msg = data?.error ?? data?.msg ?? data?.detail ?? text ?? res.statusText;
    throw new VastError(res.status, `Vast.ai ${res.status}: ${String(msg).slice(0, 500)}`);
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

  const data = await vastFetch(apiKey, "POST", "/bundles/", query);
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
  return vastFetch(apiKey, "PUT", `/asks/${offerId}/`, {
    client_id: "me",
    image: DEFAULT_IMAGE,
    disk: opts.disk ?? 100,
    label: WORKER_LABEL,
    onstart: buildOnstart(opts.studioRepo, opts.workerToken),
    runtype: "ssh",
    env: `-p ${WORKER_PORT}:${WORKER_PORT} -e WORKER_TOKEN=${opts.workerToken} -e OPEN_BUTTON_PORT=${WORKER_PORT}`,
  });
}

export async function listInstances(apiKey: string): Promise<VastInstance[]> {
  const data = await vastFetch(apiKey, "GET", "/instances/?owner=me");
  return (data?.instances ?? []) as VastInstance[];
}

export async function setInstanceState(
  apiKey: string,
  id: number,
  state: "running" | "stopped"
): Promise<any> {
  return vastFetch(apiKey, "PUT", `/instances/${id}/`, { state });
}

export async function destroyInstance(apiKey: string, id: number): Promise<any> {
  return vastFetch(apiKey, "DELETE", `/instances/${id}/`);
}

/** Resolve the public URL of the worker from a Vast.ai instance's port map. */
export function workerUrlFromInstance(inst: VastInstance): string | null {
  const ip = inst.public_ipaddr?.trim();
  if (!ip) return null;
  const mapping = inst.ports?.[`${WORKER_PORT}/tcp`];
  const hostPort = mapping?.[0]?.HostPort;
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
