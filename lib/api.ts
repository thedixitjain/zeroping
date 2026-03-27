const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Issue {
  type: "security" | "performance" | "readability" | "correctness" | "style";
  severity: "critical" | "high" | "medium" | "low";
  line: number | null;
  description: string;
  suggestion: string;
}

export interface ReviewResponse {
  summary: string;
  score: number;
  verdict: "Approved" | "Needs Work" | "Critical Issues";
  issues: Issue[];
  positives: string[];
  refactored_snippet?: string | null;
}

export interface ModelInfo {
  name: string;
  available: boolean;
  estimated_time: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export interface HealthResponse {
  status: string;
  ollama_connected: boolean;
}

export interface ReviewRequest {
  code: string;
  language: string;
  model: string;
  mode: "strict" | "suggest";
}

export type ApiError = {
  error: string;
  message: string;
  fix?: string;
  setup?: string[];
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail: ApiError;
    try {
      const body = await res.json();
      detail = body.detail || body;
    } catch {
      detail = { error: "unknown", message: `HTTP ${res.status}` };
    }
    throw detail;
  }
  return res.json() as Promise<T>;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
  return handleResponse<HealthResponse>(res);
}

export async function fetchModels(): Promise<ModelsResponse> {
  const res = await fetch(`${API_BASE}/models`, { cache: "no-store" });
  return handleResponse<ModelsResponse>(res);
}

export async function submitReview(request: ReviewRequest): Promise<ReviewResponse> {
  const res = await fetch(`${API_BASE}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    cache: "no-store",
  });
  return handleResponse<ReviewResponse>(res);
}
