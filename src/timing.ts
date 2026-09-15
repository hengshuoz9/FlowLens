export interface TimingBreakdown {
  dnsMs: number | null;
  tcpMs: number | null;
  tlsMs: number | null;
  ttfbMs: number | null;
}

export function getTimingBreakdown(url: string): TimingBreakdown {
  const entries = performance.getEntriesByName(url, 'resource');
  const entry = entries.at(-1);

  if (!entry || !isResourceTiming(entry)) {
    return { dnsMs: null, tcpMs: null, tlsMs: null, ttfbMs: null };
  }

  return {
    dnsMs: duration(entry.domainLookupStart, entry.domainLookupEnd),
    tcpMs: duration(entry.connectStart, entry.connectEnd),
    tlsMs: entry.secureConnectionStart > 0
      ? duration(entry.secureConnectionStart, entry.connectEnd)
      : null,
    ttfbMs: duration(entry.requestStart, entry.responseStart)
  };
}

function duration(start: number, end: number): number | null {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return Math.round(end - start);
}

function isResourceTiming(entry: PerformanceEntry): entry is PerformanceResourceTiming {
  return 'domainLookupStart' in entry
    && 'domainLookupEnd' in entry
    && 'connectStart' in entry
    && 'connectEnd' in entry
    && 'secureConnectionStart' in entry
    && 'requestStart' in entry
    && 'responseStart' in entry;
}
