export interface CheckResult {
  url: string;
  finalUrl: string;
  status: number;
  ok: boolean;
  latencyMs: number;
  contentType: string | null;
  redirected: boolean;
  error?: string;
}

export interface CheckOptions {
  timeoutMs: number;
}
