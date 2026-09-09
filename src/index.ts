#!/usr/bin/env node
import { checkUrl } from './checker.js';
import { printResult } from './report.js';

const args = process.argv.slice(2);
const json = args.includes('--json');
const timeoutArg = args.find((arg) => arg.startsWith('--timeout='));
const timeoutMs = timeoutArg ? Number(timeoutArg.split('=')[1]) : 10000;
const url = args.find((arg) => !arg.startsWith('--'));

if (!url) {
  console.error('Usage: flowlens <url> [--json] [--timeout=10000]');
  process.exit(2);
}

if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
  console.error('Invalid timeout');
  process.exit(2);
}

const result = await checkUrl(url, { timeoutMs });
printResult(result, json);
process.exitCode = result.ok ? 0 : 1;
