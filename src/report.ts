import type { CheckResult } from './types.js';

export function printResult(result: CheckResult, json: boolean): void {
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`URL:        ${result.url}`);
  if (result.error) {
    console.log(`Status:     ERROR`);
    console.log(`Error:      ${result.error}`);
    return;
  }

  console.log(`Status:     ${result.status} ${result.ok ? 'OK' : 'FAIL'}`);
  console.log(`Latency:    ${result.latencyMs} ms`);
  console.log(`Content:    ${result.contentType ?? 'unknown'}`);
  console.log(`Redirected: ${result.redirected ? 'yes' : 'no'}`);
  if (result.redirected) console.log(`Final URL:  ${result.finalUrl}`);
}
