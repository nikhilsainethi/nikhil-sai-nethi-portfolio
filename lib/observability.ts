export type SignalScenario = "healthy" | "slow-lookup";
export type RequestStatus = "ok" | "error";
export type ServiceName = "edge-api" | "model-service" | "model-store";
export interface RequestSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  service: ServiceName;
  offsetMs: number;
  durationMs: number;
  status: RequestStatus;
}
export interface RequestLog {
  traceId: string;
  spanId: string;
  offsetMs: number;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
}
export interface RequestSample {
  id: string;
  traceId: string;
  durationMs: number;
  status: RequestStatus;
  spans: RequestSpan[];
  logs: RequestLog[];
}
export interface SignalDataset {
  scenario: SignalScenario;
  synthetic: true;
  requests: RequestSample[];
}
export interface RequestSummary {
  count: number;
  errors: number;
  errorRate: number | null;
  p95Ms: number | null;
  meanMs: number | null;
}
/** Nearest-rank percentile of this finite sample set, not a fleet-wide estimate. */
export function samplePercentile(
  samples: number[],
  percentile: number,
): number | null {
  if (
    !Number.isFinite(percentile) ||
    percentile < 0 ||
    percentile > 100 ||
    samples.some((sample) => !Number.isFinite(sample) || sample < 0)
  ) {
    throw new RangeError(
      "Percentiles require finite nonnegative durations and a percentile from 0 to 100.",
    );
  }
  if (!samples.length) return null;
  const sorted = [...samples].sort((a, b) => a - b);
  const rank = Math.max(
    1,
    Math.min(sorted.length, Math.ceil((percentile / 100) * sorted.length)),
  );
  return sorted[rank - 1];
}
export function summarizeRequests(requests: RequestSample[]): RequestSummary {
  const count = requests.length;
  const errors = requests.filter(
    (request) => request.status === "error",
  ).length;
  return {
    count,
    errors,
    errorRate: count ? errors / count : null,
    p95Ms: samplePercentile(
      requests.map((request) => request.durationMs),
      95,
    ),
    meanMs: count
      ? requests.reduce((sum, request) => sum + request.durationMs, 0) / count
      : null,
  };
}
export function evaluateLatencyAlert(
  p95: number | null,
  threshold: number,
): "no-data" | "clear" | "firing" {
  if (!Number.isFinite(threshold) || threshold < 0)
    throw new RangeError("Alert threshold must be finite and nonnegative.");
  return p95 === null || !Number.isFinite(p95) || p95 < 0
    ? "no-data"
    : p95 > threshold
      ? "firing"
      : "clear";
}
export function createSignalScenario(scenario: SignalScenario): SignalDataset {
  const lookupDurations =
    scenario === "healthy"
      ? [
          16, 20, 18, 22, 25, 21, 24, 27, 23, 26, 28, 29, 25, 30, 31, 28, 32,
          33, 34, 38,
        ]
      : [
          16, 22, 36, 60, 90, 120, 160, 180, 195, 225, 245, 255, 280, 290, 320,
          340, 365, 390, 410, 460,
        ];
  const requests = lookupDurations.map((lookupMs, index): RequestSample => {
    const suffix = (index + 1).toString(16);
    const traceId = `000000000000000000000000${scenario === "healthy" ? "01" : "02"}${suffix.padStart(6, "0")}`;
    const rootId = `${suffix.padStart(14, "0")}01`;
    const serviceId = `${suffix.padStart(14, "0")}02`;
    const lookupId = `${suffix.padStart(14, "0")}03`;
    const status: RequestStatus =
      scenario === "slow-lookup" && index >= 17 ? "error" : "ok";
    const durationMs = lookupMs + 28;
    const spans: RequestSpan[] = [
      {
        traceId,
        spanId: rootId,
        name: "GET /models/reference",
        service: "edge-api",
        offsetMs: 0,
        durationMs,
        status,
      },
      {
        traceId,
        spanId: serviceId,
        parentSpanId: rootId,
        name: "serve model",
        service: "model-service",
        offsetMs: 8,
        durationMs: lookupMs + 16,
        status,
      },
      {
        traceId,
        spanId: lookupId,
        parentSpanId: serviceId,
        name: "model lookup",
        service: "model-store",
        offsetMs: 20,
        durationMs: lookupMs,
        status,
      },
    ];
    const slow = lookupMs > 100;
    const logs: RequestLog[] = [
      {
        traceId,
        spanId: rootId,
        offsetMs: 0,
        level: "INFO",
        message: "Request accepted: GET /models/reference",
      },
      {
        traceId,
        spanId: lookupId,
        offsetMs: lookupMs + 20,
        level: status === "error" ? "ERROR" : slow ? "WARN" : "INFO",
        message: `Model lookup ${status === "error" ? "failed" : "completed"} in ${lookupMs} ms.${slow ? " Injected lookup delay observed." : ""}`,
      },
      {
        traceId,
        spanId: rootId,
        offsetMs: durationMs,
        level: status === "error" ? "ERROR" : "INFO",
        message: `Request returned ${status === "error" ? "503" : "200"} after ${durationMs} ms.`,
      },
    ];
    return {
      id: `req-${String(index + 1).padStart(2, "0")}`,
      traceId,
      durationMs,
      status,
      spans,
      logs,
    };
  });
  return { scenario, synthetic: true, requests };
}
