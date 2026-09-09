#!/usr/bin/env node
import { checkUrl } from './checker.js';
import { printResult } from './report.js';

const args = process.argv.slice(2);
const json = args.includes('--json');
const headers = args.includes('--headers');
const methodArg = args.find((arg) => arg.startsWith('--method='));
const timeoutArg = args.find((arg) => arg.startsWith('--timeout='));
const method = methodArg?.split('=')[1]?.toUpperCase();
const timeoutMs = timeoutArg ? Number(timeoutArg.split('=')[1]) : 10000;
const url = args.find((arg) => !arg.startsWith('--'));

if (!url || args.includes('--help') || args.includes('-h')) {
  console.log(`FlowLens — fast website and API health checks\n\nUsage:\n  flowlens <url> [options]\n\nOptions:\n  --json              Output machine-readable JSON\n  --headers           Include response headers\n  --method=GET|HEAD   HTTP method (default: GET)\n  --timeout=10000     Timeout in milliseconds\n  -h, --help          Show help\n`);
  process.exitCode = url ? 0 : 2;
} else if (method && method !== 'GET' && method !== 'HEAD') {
  console.error('Invalid method. Use GET or HEAD.');
  process.exitCode = 2;
} else if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
  console.error('Invalid timeout. Use a positive number of milliseconds.');
  process.exitCode = 2;
} else {
  const result = await checkUrl(url, {
    timeoutMs,
    method: method as 'GET' | 'HEAD' | undefined,
    includeHeaders: headers
  });
  printResult(result, json);
  process.exitCode = result.ok ? 0 : 1;
}
