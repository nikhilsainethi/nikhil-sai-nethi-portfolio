import { describe, expect, it } from "vitest";
import {
  createSignalScenario,
  summarizeRequests,
  samplePercentile,
  evaluateLatencyAlert,
} from "./observability";

describe("sample statistics", () => {
  it("uses the nearest-rank sample percentile without mutating its input", () => {
    const samples = [
      8, 1, 7, 2, 6, 3, 5, 4, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ];
    const before = [...samples];
    expect(samplePercentile(samples, 95)).toBe(19);
    expect(samplePercentile(samples, 50)).toBe(10);
    expect(samples).toEqual(before);
    expect(samplePercentile([], 95)).toBeNull();
  });
  it("reports absent data as absent, not a healthy zero", () => {
    expect(summarizeRequests([])).toEqual({
      count: 0,
      errors: 0,
      errorRate: null,
      p95Ms: null,
      meanMs: null,
    });
    expect(evaluateLatencyAlert(null, 250)).toBe("no-data");
  });
  it("derives latency and error fraction from the request samples", () => {
    const healthy = summarizeRequests(createSignalScenario("healthy").requests);
    const slow = summarizeRequests(
      createSignalScenario("slow-lookup").requests,
    );
    expect(healthy).toMatchObject({
      count: 20,
      errors: 0,
      errorRate: 0,
      p95Ms: 62,
    });
    expect(slow).toMatchObject({
      count: 20,
      errors: 3,
      errorRate: 0.15,
      p95Ms: 438,
    });
    expect(slow.meanMs).toBeGreaterThan(healthy.meanMs!);
  });
  it("compares the chosen threshold and does not fire at equality", () => {
    expect(evaluateLatencyAlert(438, 250)).toBe("firing");
    expect(evaluateLatencyAlert(438, 438)).toBe("clear");
    expect(evaluateLatencyAlert(438, 500)).toBe("clear");
  });
  it("does not silently turn invalid numbers into healthy telemetry", () => {
    for (const invalid of [NaN, Infinity, -1]) {
      expect(() => samplePercentile([20, invalid], 95)).toThrow(RangeError);
      expect(evaluateLatencyAlert(invalid, 250)).toBe("no-data");
    }
    expect(() => samplePercentile([20], NaN)).toThrow(RangeError);
    expect(() => evaluateLatencyAlert(20, NaN)).toThrow(RangeError);
    expect(samplePercentile([0], 95)).toBe(0);
    expect(evaluateLatencyAlert(0, 250)).toBe("clear");
  });
});

describe("synthetic monitoring scenario", () => {
  it("is deterministic and returns isolated fixture objects", () => {
    const first = createSignalScenario("healthy");
    expect(first).toEqual(createSignalScenario("healthy"));
    first.requests[0].spans[0].durationMs = 900;
    expect(
      createSignalScenario("healthy").requests[0].spans[0].durationMs,
    ).not.toBe(900);
  });
  it.each(["healthy", "slow-lookup"] as const)(
    "correlates each %s request, nested span, and log",
    (scenario) => {
      const data = createSignalScenario(scenario);
      expect(data.synthetic).toBe(true);
      expect(
        new Set(data.requests.map((request) => request.traceId)).size,
      ).toBe(20);
      for (const request of data.requests) {
        expect(request.spans[0].durationMs).toBe(request.durationMs);
        for (const span of request.spans) {
          expect(span.traceId).toBe(request.traceId);
          if (span.parentSpanId) {
            const parent = request.spans.find(
              (item) => item.spanId === span.parentSpanId,
            )!;
            expect(parent).toBeDefined();
            expect(span.offsetMs).toBeGreaterThanOrEqual(parent.offsetMs);
            expect(span.offsetMs + span.durationMs).toBeLessThanOrEqual(
              parent.offsetMs + parent.durationMs,
            );
          }
        }
        for (const log of request.logs) {
          expect(log.traceId).toBe(request.traceId);
          expect(request.spans.some((span) => span.spanId === log.spanId)).toBe(
            true,
          );
        }
      }
    },
  );
  it("attributes the injected delay to model lookup in both span and log evidence", () => {
    const healthy = createSignalScenario("healthy").requests.at(-1)!;
    const slow = createSignalScenario("slow-lookup").requests.at(-1)!;
    const lookup = slow.spans.find((span) => span.service === "model-store")!;
    expect(lookup.durationMs).toBe(460);
    expect(slow.durationMs - lookup.durationMs).toBe(
      healthy.durationMs - healthy.spans.at(-1)!.durationMs,
    );
    expect(
      slow.logs.find((log) => log.spanId === lookup.spanId)?.message,
    ).toContain("460 ms");
    expect(slow.status).toBe("error");
  });
});
