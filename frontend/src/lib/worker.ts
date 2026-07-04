import { getSettings } from "./store";
import { findWorker } from "./vast";

/**
 * Resolve the worker base URL + token.
 * Priority: manual settings.workerUrl > auto-detection via Vast.ai label.
 */
export async function resolveWorker(): Promise<{ url: string; token: string } | null> {
  const settings = await getSettings();
  if (settings.workerUrl.trim()) {
    return { url: settings.workerUrl.trim().replace(/\/$/, ""), token: settings.workerToken };
  }
  if (settings.vastApiKey) {
    try {
      const found = await findWorker(settings.vastApiKey);
      if (found?.url) return { url: found.url, token: settings.workerToken };
    } catch {
      // Vast.ai indisponível — segue sem worker
    }
  }
  return null;
}

export async function workerFetch(
  path: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<Response> {
  const worker = await resolveWorker();
  if (!worker) {
    throw new Error(
      "Worker não configurado. Defina a URL do worker em Configurações ou crie uma instância na aba GPUs."
    );
  }
  const headers = new Headers(init?.headers);
  if (worker.token) headers.set("Authorization", `Bearer ${worker.token}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), init?.timeoutMs ?? 30_000);
  try {
    return await fetch(`${worker.url}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err: any) {
    // fetch lança em timeout/conexão recusada — worker provavelmente ainda
    // provisionando (baixando o modelo) ou reiniciando.
    const reason = err?.name === "AbortError" ? "tempo esgotado" : "sem resposta";
    throw new Error(
      `Worker ainda não está acessível (${reason}) em ${worker.url}. ` +
        `A instância pode estar provisionando o modelo (10–30 min no 1º boot). ` +
        `Aguarde o indicador da barra lateral ficar verde e tente de novo.`
    );
  } finally {
    clearTimeout(timeout);
  }
}
