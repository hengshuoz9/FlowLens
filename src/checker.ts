import type { CheckOptions, CheckResult } from './types.js';

const MAX_REDIRECTS = 10;
const DEFAULT_HEADERS = {
  'user-agent': 'FlowLens/0.1.0',
  accept: '*/*'
};

export async function checkUrl(input: string, options: CheckOptions): Promise<CheckResult> {
  let current: URL;
  try {
    current = new URL(input);
  } catch {
    return failure(input, 'Invalid URL');
  }

  if (!['http:', 'https:'].includes(current.protocol)) {
    return failure(input, 'Only HTTP and HTTPS URLs are supported');
  }

  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    let redirectCount = 0;
    let response: Response;

    while (true) {
      response = await fetch(current, {
        method: options.method ?? 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: DEFAULT_HEADERS
      });

      if (![301, 302, 303, 307, 308].includes(response.status)) break;

      const location = response.headers.get('location');
      if (!location) break;
      if (redirectCount >= MAX_REDIRECTS) {
        return failure(input, `Too many redirects (limit: ${MAX_REDIRECTS})`);
      }

      current = new URL(location, current);
      if (!['http:', 'https:'].includes(current.protocol)) {
        return failure(input, 'Redirected to an unsupported protocol');
      }
      redirectCount += 1;
    }

    const headers: Record<string, string> = {};
    if (options.includeHeaders !== false) {
      for (const [key, value] of response.headers) headers[key] = value;
    }

    return {
      url: input,
      finalUrl: current.toString(),
      status: response.status,
      statusText: response.statusText,
      ok: response.status >= 200 && response.status < 300,
      latencyMs: Math.round(performance.now() - started),
      contentType: response.headers.get('content-type'),
      server: response.headers.get('server'),
      redirected: redirectCount > 0,
      redirectCount,
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
    statusText: '',
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
