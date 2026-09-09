import type { CheckOptions, CheckResult } from './types.js';

export async function checkUrl(input: string, options: CheckOptions): Promise<CheckResult> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return {
      url: input,
      finalUrl: input,
      status: 0,
      ok: false,
      latencyMs: 0,
      contentType: null,
      redirected: false,
      error: 'Invalid URL'
    };
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return {
      url: input,
      finalUrl: input,
      status: 0,
      ok: false,
      latencyMs: 0,
      contentType: null,
      redirected: false,
      error: 'Only HTTP and HTTPS URLs are supported'
    };
  }

  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'FlowLens/0.1.0' }
    });

    return {
      url: input,
      finalUrl: response.url,
      status: response.status,
      ok: response.ok,
      latencyMs: Math.round(performance.now() - started),
      contentType: response.headers.get('content-type'),
      redirected: response.redirected
    };
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? `Request timed out after ${options.timeoutMs}ms`
      : error instanceof Error ? error.message : String(error);

    return {
      url: input,
      finalUrl: input,
      status: 0,
      ok: false,
      latencyMs: Math.round(performance.now() - started),
      contentType: null,
      redirected: false,
      error: message
    };
  } finally {
    clearTimeout(timer);
  }
}
