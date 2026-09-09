# FlowLens

> Fast, zero-dependency HTTP health checks from your terminal.

FlowLens is a lightweight CLI for developers who need a quick answer to one question: **is this website or API healthy right now?**

It checks HTTP status, latency, redirects, content type, server metadata, and request failures without requiring a hosted monitoring platform.

## Highlights

- Fast CLI with no runtime dependencies
- HTTP `GET` and `HEAD` checks
- Latency measurement in milliseconds
- Manual redirect tracking with a safety limit
- Timeout handling with a non-zero exit code
- Human-readable terminal output
- `--json` output for scripts and CI pipelines
- Optional response headers with `--headers`
- Node.js 20+
- TypeScript source

## Install

Clone the repository and build it locally:

```bash
git clone https://github.com/hengshuoz9/FlowLens.git
cd FlowLens
npm install
npm run build
```

Run the CLI directly:

```bash
node dist/index.js https://example.com
```

Or link the command globally during development:

```bash
npm link
flowlens https://example.com
```

## Usage

Basic check:

```bash
flowlens https://example.com
```

JSON for automation:

```bash
flowlens https://example.com --json
```

Inspect response headers:

```bash
flowlens https://example.com --headers
```

Use `HEAD` for a lightweight metadata check:

```bash
flowlens https://example.com --method=HEAD
```

Set a 3 second timeout:

```bash
flowlens https://example.com --timeout=3000
```

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Request completed with a successful 2xx response |
| `1` | Health check failed or the response was not 2xx |
| `2` | Invalid CLI arguments |

This makes FlowLens suitable for CI gates, shell scripts, cron jobs, and deployment smoke tests.

## Example

```text
FlowLens
────────
URL:        https://example.com
Status:     200 OK
Latency:    142 ms
Content:    text/html; charset=UTF-8
Server:     nginx
Redirects:  0
```

With `--json`, the result is structured for downstream tooling:

```json
{
  "url": "https://example.com",
  "finalUrl": "https://example.com/",
  "status": 200,
  "ok": true,
  "latencyMs": 142,
  "contentType": "text/html; charset=UTF-8",
  "server": "nginx",
  "redirected": false,
  "redirectCount": 0,
  "headers": {}
}
```

## Project structure

```text
FlowLens/
├── src/
│   ├── checker.ts       # HTTP request and health-check logic
│   ├── index.ts         # CLI entry point and argument parsing
│   ├── report.ts        # Human and JSON output
│   └── types.ts         # Shared TypeScript types
├── test/
│   └── checker.test.js  # Node test suite
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── LICENSE
├── package.json
├── tsconfig.json
└── README.md
```

## Development

Build:

```bash
npm run build
```

Test:

```bash
npm test
```

Run the complete local check:

```bash
npm run check
```

## Design goals

FlowLens intentionally stays small. It is not trying to replace full observability platforms. Instead, it provides a transparent, composable first layer for debugging availability and HTTP behavior.

The codebase uses the built-in `fetch` implementation available in modern Node.js, keeping the runtime dependency footprint at zero.

## Roadmap

- DNS, TCP, TLS, and TTFB timing breakdowns
- Multi-URL checks with controlled concurrency
- HTML and Markdown reports
- Historical latency snapshots
- Official GitHub Action
- Browser checks powered by Playwright
- API assertions for status, headers, and response bodies
- Config file support for repeatable health-check suites

## Contributing

Bug reports, feature requests, documentation improvements, and pull requests are welcome.

Before opening a pull request:

```bash
npm run check
```

Please keep changes focused and include tests for behavior changes.

## Security

FlowLens makes outbound HTTP requests to URLs provided by the user. Do not use it against systems you do not have permission to test. Report security vulnerabilities privately to the repository owner rather than opening a public issue.

## License

MIT © FlowLens contributors
