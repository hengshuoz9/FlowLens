import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { checkUrl } from '../dist/checker.js';

function startServer(handler) {
  const server = createServer(handler);
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        server,
        url: `http://127.0.0.1:${address.port}`
      });
    });
  });
}

test('returns a successful health check', async (t) => {
  const { server, url } = await startServer((_, response) => {
    response.setHeader('content-type', 'text/plain');
    response.setHeader('server', 'FlowLens-Test');
    response.end('ok');
  });
  t.after(() => server.close());

  const result = await checkUrl(url, { timeoutMs: 2000 });

  assert.equal(result.status, 200);
  assert.equal(result.statusText, 'OK');
  assert.equal(result.ok, true);
  assert.equal(result.contentType, 'text/plain');
  assert.equal(result.server, 'FlowLens-Test');
  assert.equal(result.redirected, false);
  assert.ok(result.latencyMs >= 0);
});

test('preserves non-2xx status information', async (t) => {
  const { server, url } = await startServer((_, response) => {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('missing');
  });
  t.after(() => server.close());

  const result = await checkUrl(url, { timeoutMs: 2000 });

  assert.equal(result.status, 404);
  assert.equal(result.statusText, 'Not Found');
  assert.equal(result.ok, false);
});

test('tracks redirects', async (t) => {
  const { server, url } = await startServer((request, response) => {
    if (request.url === '/start') {
      response.writeHead(302, { location: '/final' });
      response.end();
      return;
    }
    response.end('final');
  });
  t.after(() => server.close());

  const result = await checkUrl(`${url}/start`, { timeoutMs: 2000 });

  assert.equal(result.status, 200);
  assert.equal(result.ok, true);
  assert.equal(result.redirected, true);
  assert.equal(result.redirectCount, 1);
  assert.equal(result.finalUrl, `${url}/final`);
});

test('returns a useful result for invalid URLs', async () => {
  const result = await checkUrl('not-a-url', { timeoutMs: 1000 });
  assert.equal(result.ok, false);
  assert.equal(result.status, 0);
  assert.equal(result.statusText, '');
  assert.equal(result.error, 'Invalid URL');
});

test('times out slow responses', async (t) => {
  const { server, url } = await startServer((_, response) => {
    setTimeout(() => response.end('slow'), 250);
  });
  t.after(() => server.close());

  const result = await checkUrl(url, { timeoutMs: 30 });

  assert.equal(result.ok, false);
  assert.match(result.error ?? '', /timed out/i);
});
