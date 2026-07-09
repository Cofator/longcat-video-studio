export type JobType = "t2v" | "i2v" | "long" | "avatar-single" | "avatar-multi";
export type RefineMode = "none" | "spatial" | "spatiotemporal";

export interface AudioInput {
  name: string; // person1, person2, ...
  data_b64: string;
  bbox?: number[]; // [y_min, x_min, y_max, x_max] — multi-áudio
}

export interface Settings {
  vastApiKey: string;
  workerUrl: string; // ex.: http://IP:PORTA — se vazio, detectado via Vast.ai
  workerToken: string;
  studioRepo: string; // repo git clonado pela instância (worker)
  llmProvider: "claude" | "longcat" | "openrouter"; // provedor do "Melhorar prompt"/Chat
  anthropicApiKey: string; // chave do Claude
  longcatApiKey: string; // chave da LongCat LLM (api.longcat.chat)
  openrouterApiKey: string; // chave do OpenRouter (openrouter.ai)
  openrouterModel: string; // ex.: meituan/longcat-2.0 ou um modelo grátis
  glmApiKey: string; // chave da API oficial da Z.ai (GLM-5.2)
  glmModel: string; // ex.: glm-5.2
  hfToken: string; // token do HuggingFace — necessário p/ repos gated (ex.: Gemma-3, usado pelo LTX-2.3)
}

export type ModelEngine = "longcat" | "ltx2.3";

export interface JobParams {
  type: JobType;
  model?: ModelEngine;
  prompt: string;
  negative_prompt?: string;
  num_frames?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number | null;
  num_segments?: number;
  num_cond_frames?: number;
  segment_prompts?: string[];
  refine?: RefineMode;
  refine_steps?: number;
  use_distill?: boolean;
  image_b64?: string;
  // avatar
  audios?: AudioInput[];
  stage_1?: "ai2v" | "at2v";
  resolution?: "480p" | "720p";
  ref_img_index?: number;
  mask_frame_range?: number;
  text_guidance_scale?: number;
  audio_guidance_scale?: number;
  use_int8?: boolean;
  audio_type?: "para" | "add";
}

export interface WorkerJob {
  id: string;
  type: JobType;
  prompt: string;
  status: "queued" | "running" | "completed" | "failed" | "canceled";
  stage: string;
  progress: number;
  error?: string | null;
  created_at: number;
  started_at?: number | null;
  finished_at?: number | null;
  fps: number;
  total_frames: number;
  has_video: boolean;
  params: {
    model?: ModelEngine;
    num_frames: number;
    num_segments: number;
    refine: RefineMode;
    use_distill: boolean;
    num_inference_steps: number;
    guidance_scale: number;
    seed?: number | null;
    resolution?: string;
    stage_1?: string;
    num_speakers?: number;
  };
}

export interface WorkerHealth {
  ok: boolean;
  model_loaded: boolean;
  model_loading: boolean;
  load_error?: string | null;
  distill_available: boolean;
  avatar_supported?: boolean;
  avatar_ready?: boolean;
  queue_size: number;
  running_job?: string | null;
  jobs_total: number;
  gpus: {
    name: string;
    memory_total_mb: number;
    memory_used_mb: number;
    utilization_pct: number;
    temperature_c: number;
  }[];
}

export interface VastOffer {
  id: number;
  gpu_name: string;
  num_gpus: number;
  gpu_ram: number;
  dph_total: number;
  reliability2?: number;
  reliability?: number;
  cuda_max_good?: number;
  disk_space?: number;
  inet_down?: number;
  geolocation?: string;
  verification?: string;
}

export interface VastInstance {
  id: number;
  label?: string | null;
  actual_status?: string; // running | exited | ...
  intended_status?: string;
  cur_state?: string;
  gpu_name?: string;
  num_gpus?: number;
  dph_total?: number;
  public_ipaddr?: string;
  ports?: Record<string, { HostIp: string; HostPort: string }[]>;
  status_msg?: string;
  image_uuid?: string;
  disk_space?: number;
  geolocation?: string;
  start_date?: number;
}
