import type { CheckOptions, CheckResult } from './types.js';

const DEFAULT_HEADERS = {
  'user-agent': 'FlowLens/0.1.0',
  accept: '*/*'
};

export async function checkUrl(input: string, options: CheckOptions): Promise<CheckResult> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return failure(input, 'Invalid URL');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return failure(input, 'Only HTTP and HTTPS URLs are supported');
  }

  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const method = options.method ?? 'GET';
    const response = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: DEFAULT_HEADERS
    });

    const headers: Record<string, string> = {};
    if (options.includeHeaders !== false) {
      for (const [key, value] of response.headers) headers[key] = value;
    }

    return {
      url: input,
      finalUrl: response.url,
      status: response.status,
      ok: response.ok,
      latencyMs: Math.round(performance.now() - started),
      contentType: response.headers.get('content-type'),
      server: response.headers.get('server'),
      redirected: response.redirected,
      redirectCount: response.redirected ? countRedirects(input, response.url) : 0,
      headers
    };
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? `Request timed out after ${options.timeoutMs}ms`
      : error instanceof Error ? error.message : String(error);

    return {
      ...failure(input, message),
      latencyMs: Math.round(performance.now() - started)
    };
  } finally {
    clearTimeout(timer);
  }
}

function failure(url: string, error: string): CheckResult {
  return {
    url,
    finalUrl: url,
    status: 0,
    ok: false,
    latencyMs: 0,
    contentType: null,
    server: null,
    redirected: false,
    redirectCount: 0,
    headers: {},
    error
  };
}

function countRedirects(original: string, finalUrl: string): number {
  return original === finalUrl ? 0 : 1;
}
