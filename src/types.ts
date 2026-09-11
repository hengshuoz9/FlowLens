export interface CheckResult {
  url: string;
  finalUrl: string;
  status: number;
  statusText: string;
  ok: boolean;
  latencyMs: number;
  contentType: string | null;
  server: string | null;
  redirected: boolean;
  redirectCount: number;
  headers: Record<string, string>;
  error?: string;
}

export interface CheckOptions {
  timeoutMs: number;
  method?: 'GET' | 'HEAD';
  includeHeaders?: boolean;
}
