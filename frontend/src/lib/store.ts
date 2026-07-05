import { promises as fs } from "fs";
import path from "path";
import type { Settings } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const DEFAULT_SETTINGS: Settings = {
  vastApiKey: process.env.VAST_API_KEY ?? "",
  workerUrl: process.env.WORKER_URL ?? "",
  workerToken: process.env.WORKER_TOKEN ?? "",
  studioRepo: "https://github.com/Cofator/longcat-video-studio.git",
  llmProvider: (process.env.LLM_PROVIDER as "claude" | "longcat" | "openrouter") ?? "claude",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  longcatApiKey: process.env.LONGCAT_API_KEY ?? "",
  openrouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openrouterModel: process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat-v3:free",
};

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function getSettings(): Promise<Settings> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  await ensureDir();
  const current = await getSettings();
  const next = { ...current, ...patch };
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2), "utf-8");
  return next;
}
