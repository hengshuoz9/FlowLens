# FlowLens

Fast, developer-friendly website and API health analyzer.

FlowLens gives you a compact view of HTTP availability, latency, redirects, response headers, and basic performance signals from one command.

## Why FlowLens?

When a website feels slow or an API starts returning unexpected responses, you want a quick answer before reaching for a full observability stack.

FlowLens is designed for that first 30 seconds:
- Check whether a URL is reachable
- Measure response latency
- Inspect HTTP status and content type
- Follow redirects and report the final URL
- Print machine-readable JSON for automation
- Return useful exit codes in CI

## Quick start

```bash
npm install
npm run build
node dist/index.js https://example.com
node dist/index.js https://example.com --json
```

## Features

- Zero runtime dependencies
- TypeScript
- Works with modern Node.js
- JSON output for scripts and CI
- Redirect tracking
- Timeout handling
- Clear human-readable output
- Non-zero exit code for failed checks

## Roadmap

- DNS, TCP, TLS and TTFB timing breakdowns
- Concurrent multi-URL checks
- HTML report generation
- Historical performance snapshots
- GitHub Action integration
- Playwright-powered browser checks
- API endpoint assertions

## Contributing

Issues and pull requests are welcome.

## License

MIT
