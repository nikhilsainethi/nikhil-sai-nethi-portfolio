"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  useInfrastructureMotion,
  useSystemReducedMotion,
} from "./InfrastructureShell";
import {
  createSignalScenario,
  evaluateLatencyAlert,
  samplePercentile,
  summarizeRequests,
  type SignalScenario,
  type ServiceName,
} from "@/lib/observability";
import styles from "./ObservabilityLab.module.css";

const services: { id: ServiceName; label: string; operation: string }[] = [
  { id: "edge-api", label: "Edge API", operation: "Accept request" },
  { id: "model-service", label: "Model service", operation: "Serve model" },
  { id: "model-store", label: "Model store", operation: "Look up model" },
];
const views = ["Metrics", "Traces", "Logs"] as const;
type SignalView = (typeof views)[number];

export function ObservabilityLab({
  motionEnabled = true,
}: {
  motionEnabled?: boolean;
}) {
  const siteMotion = useInfrastructureMotion();
  const reducedMotion = useSystemReducedMotion();
  const animate = motionEnabled && siteMotion && !reducedMotion;
  const [scenario, setScenario] = useState<SignalScenario>("healthy");
  // The 3D world behind the page reacts to the incident (see WorldCanvas).
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("infra:lab-scenario", { detail: scenario }));
  }, [scenario]);
  const [view, setView] = useState<SignalView>("Metrics");
  const [selectedId, setSelectedId] = useState("req-20");
  const [threshold, setThreshold] = useState(250);
  const traceButton = useRef<HTMLButtonElement>(null);
  const dataset = useMemo(() => createSignalScenario(scenario), [scenario]);
  const summary = useMemo(() => summarizeRequests(dataset.requests), [dataset]);
  const alert = evaluateLatencyAlert(summary.p95Ms, threshold);
  const selected =
    dataset.requests.find((request) => request.id === selectedId) ??
    dataset.requests[0];
  const lookup = selected.spans.find((span) => span.service === "model-store")!;
  const lookupShare = Math.round(
    (lookup.durationMs / selected.durationMs) * 100,
  );
  const baselineLookup = createSignalScenario("healthy").requests.find(
    (request) => request.id === selected.id,
  )!.spans[2].durationMs;
  const lookupDelta = lookup.durationMs - baselineLookup;

  function changeScenario(next: SignalScenario) {
    setScenario(next);
    setSelectedId("req-20");
  }

  function inspectRequest(id: string) {
    setSelectedId(id);
    setView("Traces");
    traceButton.current?.focus();
  }

  return (
    <section
      id="observability-lab"
      data-world-anchor="lab"
      className={styles.section}
      aria-labelledby="signal-lab-title"
      data-motion={animate}
    >
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>03 / INTERACTIVE SIGNAL LAB</p>
          <h2 id="signal-lab-title">
            Follow the signal.
            <br /> <span>Find the cause.</span>
          </h2>
        </div>
        <div className={styles.intro}>
          <p>
            A service gets slower. The dashboard notices. A trace shows where.
            Explore the connection between a symptom and the operation behind
            it.
          </p>
          <span>SYNTHETIC SCENARIO · BROWSER ONLY</span>
        </div>
      </div>

      <div className={styles.console}>
        <header className={styles.consoleHeader}>
          <div>
            <span className={styles.consoleMark} aria-hidden="true">
              ⌁
            </span>
            SIGNAL WORKSPACE<span className={styles.demoBadge}>DEMO</span>
          </div>
          <span>model-serving / reference</span>
        </header>
        <div className={styles.scenarioBar}>
          <div className={styles.scenarioLabel}>
            <span className={styles.dot} data-state={scenario} />
            <span>
              {scenario === "healthy"
                ? "Healthy baseline"
                : "Slow model lookup"}
              <small>{summary.count} deterministic request samples</small>
            </span>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.injectButton}
              aria-pressed={scenario === "slow-lookup"}
              onClick={() => changeScenario("slow-lookup")}
            >
              Inject slow lookup <span aria-hidden="true">↗</span>
            </button>
            <button
              type="button"
              className={styles.recoverButton}
              onClick={() => changeScenario("healthy")}
            >
              Recover service <span aria-hidden="true">↺</span>
            </button>
          </div>
        </div>

        <section className={styles.metrics} aria-label="Request sample metrics">
          <div>
            <span>SAMPLE P95 LATENCY</span>
            <strong data-alert={alert === "firing"}>
              {summary.p95Ms ?? "—"}
              <small> ms</small>
            </strong>
            <p>Nearest rank · {summary.count} requests</p>
          </div>
          <div>
            <span>REQUEST ERROR FRACTION</span>
            <strong data-alert={summary.errors > 0}>
              {summary.errorRate === null
                ? "—"
                : Math.round(summary.errorRate * 100)}
              <small>%</small>
            </strong>
            <p>
              {summary.errors} failed / {summary.count} samples
            </p>
          </div>
          <div>
            <span>MEAN REQUEST LATENCY</span>
            <strong>
              {summary.meanMs?.toFixed(1) ?? "—"}
              <small> ms</small>
            </strong>
            <p>Arithmetic mean of samples</p>
          </div>
        </section>

        <div
          className={styles.topology}
          aria-label="Illustrative service dependency chain"
        >
          {services.map((service, index) => (
            <div key={service.id} className={styles.servicePair}>
              {index > 0 && (
                <span className={styles.serviceLink} aria-hidden="true">
                  →
                </span>
              )}
              <div
                className={styles.service}
                data-affected={
                  scenario === "slow-lookup" && service.id === "model-store"
                }
              >
                <div>
                  <span className={styles.serviceIcon} aria-hidden="true">
                    {index === 0 ? "↗" : index === 1 ? "◇" : "▤"}
                  </span>
                  <strong>{service.label}</strong>
                  <span className={styles.serviceState} />
                </div>
                <p>
                  {service.operation}
                  <span>
                    p95{" "}
                    {samplePercentile(
                      dataset.requests.map(
                        (request) =>
                          request.spans.find(
                            (span) => span.service === service.id,
                          )!.durationMs,
                      ),
                      95,
                    )}{" "}
                    ms
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.signalToolbar}>
          <div
            className={styles.viewControls}
            role="group"
            aria-label="Signal view"
          >
            {views.map((item) => (
              <button
                ref={item === "Traces" ? traceButton : undefined}
                type="button"
                key={item}
                aria-pressed={view === item}
                onClick={() => setView(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className={styles.requestPicker}>
            <span>Request sample</span>
            <select
              aria-label="Request sample"
              value={selected.id}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {dataset.requests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.id} · {request.durationMs} ms · {request.status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <motion.div
          key={view}
          className={styles.signalPanel}
          initial={animate ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animate ? 0.22 : 0 }}
        >
          {view === "Metrics" && (
            <section aria-label="Request latency chart">
              <div className={styles.panelTitle}>
                <h3>Request latency, one sample at a time.</h3>
                <span>SELECT A BAR TO OPEN ITS TRACE</span>
              </div>
              <div className={styles.chartFrame}>
                <div className={styles.chartAxis} aria-hidden="true">
                  <span>550 ms</span>
                  <span>0</span>
                </div>
                <div className={styles.chart}>
                  <div
                    className={styles.thresholdLine}
                    style={{ bottom: `${(threshold / 550) * 100}%` }}
                    aria-hidden="true"
                  >
                    <span>{threshold} ms alert threshold</span>
                  </div>
                  {dataset.requests.map((request, index) => (
                    <button
                      type="button"
                      key={request.id}
                      className={styles.chartBar}
                      aria-label={`Inspect ${request.id}, ${request.durationMs} ms, ${request.status}`}
                      title={`${request.id}: ${request.durationMs} ms`}
                      onClick={() => inspectRequest(request.id)}
                    >
                      <motion.span
                        data-error={request.status === "error"}
                        initial={false}
                        animate={{ scaleY: request.durationMs / 550 }}
                        transition={{
                          duration: animate ? 0.55 : 0,
                          delay: animate ? index * 0.012 : 0,
                        }}
                      />
                      <span className={styles.barNumber} aria-hidden="true">
                        {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <p className={styles.chartNote}>
                Each bar is a request, ordered by sample index. Coral marks
                failed requests. This finite sample set is illustrative, not a
                production time window.
              </p>
            </section>
          )}

          {view === "Traces" && (
            <section aria-label="Selected request trace">
              <div className={styles.panelTitle}>
                <h3>
                  {selected.id} <span> / {selected.durationMs} ms</span>
                </h3>
                <span
                  className={styles.requestStatus}
                  data-error={selected.status === "error"}
                >
                  {selected.status === "error" ? "503 / ERROR" : "200 / OK"}
                </span>
              </div>
              <div className={styles.traceIdentity}>
                <span>TRACE ID</span>
                <code data-testid="selected-trace-id">{selected.traceId}</code>
              </div>
              <div className={styles.waterfall}>
                {selected.spans.map((span, index) => (
                  <div className={styles.spanRow} key={span.spanId}>
                    <div className={styles.spanName}>
                      <span>
                        {index > 0 ? "↳ " : ""}
                        {span.service}
                      </span>
                      <small>{span.name}</small>
                    </div>
                    <div className={styles.spanTrack}>
                      <motion.div
                        initial={false}
                        animate={{
                          width: `${(span.durationMs / selected.durationMs) * 100}%`,
                          left: `${(span.offsetMs / selected.durationMs) * 100}%`,
                        }}
                        transition={{ duration: animate ? 0.3 : 0 }}
                        data-dependency={span.service === "model-store"}
                        data-error={span.status === "error"}
                      />
                    </div>
                    <code>{span.durationMs} ms</code>
                  </div>
                ))}
              </div>
              <div className={styles.evidence} data-slow={lookupDelta > 0}>
                <span aria-hidden="true">↳</span>
                <div>
                  <strong>
                    Model lookup occupies {lookupShare}% of this request.
                  </strong>
                  <p>
                    {lookup.durationMs} ms in <code>model-store</code>;{" "}
                    {selected.durationMs - lookup.durationMs} ms outside that
                    operation.{" "}
                    {lookupDelta > 0
                      ? `The lookup is ${lookupDelta} ms slower than the same baseline sample.`
                      : "This sample matches the healthy baseline."}
                  </p>
                </div>
              </div>
              <p className={styles.traceNote}>
                Nested span durations overlap; they are not added together. Open
                Logs to follow this same trace.
              </p>
            </section>
          )}

          {view === "Logs" && (
            <section aria-label="Correlated request logs">
              <div className={styles.panelTitle}>
                <h3>Same request. More context.</h3>
                <span>{selected.id}</span>
              </div>
              <div className={styles.traceIdentity}>
                <span>TRACE ID</span>
                <code>{selected.traceId}</code>
              </div>
              <ol className={styles.logs}>
                {selected.logs.map((log, index) => (
                  <li key={`${log.spanId}-${index}`}>
                    <span className={styles.logTime}>+{log.offsetMs} ms</span>
                    <span className={styles.logLevel} data-level={log.level}>
                      {log.level}
                    </span>
                    <div>
                      <p>{log.message}</p>
                      <code>span_id={log.spanId}</code>
                    </div>
                  </li>
                ))}
              </ol>
              <p className={styles.traceNote}>
                Offsets are relative to the request start. Trace and span IDs
                connect these records to the waterfall.
              </p>
            </section>
          )}
        </motion.div>

        <div className={styles.alertArea}>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={styles.alertStatus}
            data-firing={alert === "firing"}
          >
            <span aria-hidden="true">{alert === "firing" ? "!" : "✓"}</span>
            <div>
              <strong>
                Latency alert {alert === "firing" ? "firing" : "clear"}
              </strong>
              <p>
                Sample p95 {summary.p95Ms} ms{" "}
                {alert === "firing" ? "exceeds" : "is at or below"} the{" "}
                {threshold} ms threshold.
              </p>
            </div>
          </div>
          <label className={styles.thresholdPicker}>
            <span>Sample p95 alert threshold</span>
            <select
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
            >
              <option value="100">100 ms</option>
              <option value="250">250 ms</option>
              <option value="500">500 ms</option>
            </select>
          </label>
        </div>
      </div>
      <div className={styles.footnote}>
        <span>OBSERVE → CORRELATE → RECOVER</span>
        <p>
          Demonstration thresholds and service names are fictional. No Google
          telemetry or SLOs. Concepts:{" "}
          <a
            href="https://opentelemetry.io/docs/concepts/signals/traces/"
            target="_blank"
            rel="noreferrer"
          >
            OpenTelemetry traces
          </a>{" "}
          and{" "}
          <a
            href="https://opentelemetry.io/docs/concepts/signals/logs/"
            target="_blank"
            rel="noreferrer"
          >
            logs
          </a>
          .
        </p>
      </div>
    </section>
  );
}
export default ObservabilityLab;
