"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { storyFrame } from "@/lib/observability-story";
import { StoryCanvas } from "./DatacentreCanvas";
import { useInfrastructureMotion, useSystemReducedMotion } from "./InfrastructureShell";
import styles from "./ObservabilityStory.module.css";

const stages = [
  {
    label: "Infrastructure",
    title: "Start with the system.",
    description: "A request depends on more than a service. Machines, network paths, and model-serving dependencies all shape its behaviour.",
    evidence: "My foundation: production infrastructure on Amazon EKS, backed by monitoring and incident response at Moody’s.",
    signal: "Map the dependencies",
    status: "SYSTEM CONTEXT",
  },
  {
    label: "Instrumentation",
    title: "Make the signals useful.",
    description: "Metrics show a change. Logs explain an event. Traces connect the request to the dependency behind it.",
    evidence: "At Moody’s, I built SLI/SLO dashboards and alert rules with Prometheus, Grafana, and Datadog, alongside structured logs and distributed traces.",
    signal: "Metrics + logs + traces",
    status: "SIGNALS CONNECTED",
  },
  {
    label: "Correlation",
    title: "Find the slow dependency.",
    description: "In this synthetic incident, model-lookup latency rises while the request reaches the right service. A trace reveals where the time goes.",
    evidence: "My OpenTelemetry work connects application behaviour with operational evidence, making troubleshooting more systematic.",
    signal: "Trace the model lookup",
    status: "LATENCY INVESTIGATION",
  },
  {
    label: "Recovery",
    title: "Close the loop.",
    description: "A fix is a hypothesis until the signals agree. Check latency, confirm recovery, and turn the investigation into a better response next time.",
    evidence: "My production work includes on-call response, root-cause analysis, runbooks, and blameless postmortems.",
    signal: "Verify → learn → improve",
    status: "RECOVERY VERIFIED",
  },
] as const;

const compactQuery = "(max-width: 700px), (max-height: 760px)";
const compactServerSnapshot = () => true;
const compactSnapshot = () => window.matchMedia(compactQuery).matches;
function subscribeCompact(callback: () => void) {
  const media = window.matchMedia(compactQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const stageProgress = [0.04, 0.36, 0.64, 0.96];
const stickyInset = 86;

type InitialAnchorRequest = {
  hash: string;
  target: HTMLElement;
  cancelled: boolean;
  handled: boolean;
  detach: () => void;
};

/**
 * Scrub a few composited layers; nothing runs continuously between scroll events.
 * `webgl` carries the same progress to the 3D diorama under the drawing.
 */
function paintProgress(scene: HTMLDivElement | null, progress: number, webgl: MotionValue<number>) {
  webgl.set(progress);
  if (!scene) return;
  const frame = storyFrame(progress);
  scene.style.setProperty("--signals", frame.signals.toFixed(3));
  scene.style.setProperty("--trace", frame.trace.toFixed(3));
  scene.style.setProperty("--recovery", frame.recovery.toFixed(3));
  scene.style.setProperty("--rack-scale", frame.rackScale.toFixed(3));
  scene.style.setProperty("--rack-x", `${frame.rackX.toFixed(2)}px`);
  scene.style.setProperty("--rack-y", `${frame.rackY.toFixed(2)}px`);
  scene.style.setProperty("--signal-y", `${frame.signalY.toFixed(2)}px`);
  scene.style.setProperty("--trace-y", `${frame.traceY.toFixed(2)}px`);
  scene.style.setProperty("--floor-y", `${frame.floorY.toFixed(2)}px`);
}

function InfrastructureDrawing({ stage }: { stage: number }) {
  const slow = stage === 2;
  const recovered = stage === 3;
  return (
    <svg className={styles.drawing} viewBox="0 0 820 610" role="img" aria-label="Conceptual rack and telemetry diagram">
      <title>Synthetic infrastructure observability: racks, telemetry, a slow model lookup, and recovery</title>
      <g className={styles.floor} fill="none" stroke="currentColor">
        <path d="m48 390 300-146 422 182-304 152L48 390Z" />
        {[0, 1, 2, 3, 4, 5].map((line) => (
          <path key={line} d={`M${98 + line * 53} ${366 - line * 25}l418 183M${104 + line * 67} ${414 + line * 29}l299-147`} />
        ))}
      </g>
      <g className={styles.rackGroup}>
        {[
          { x: 140, y: 198, label: "COMPUTE", id: "01" },
          { x: 330, y: 165, label: "MODEL SERVICE", id: "02" },
          { x: 520, y: 217, label: "STORAGE", id: "03" },
        ].map((rack, index) => (
          <g key={rack.id} className={index === 1 ? styles.primaryRack : styles.secondaryRack}>
            <path className={styles.rackSide} d={`M${rack.x + 124} ${rack.y}l30-18v216l-30 18Z`} />
            <path className={styles.rackTop} d={`M${rack.x} ${rack.y}l30-18h124l-30 18Z`} />
            <rect className={styles.rackBody} x={rack.x} y={rack.y} width="124" height="216" rx="5" />
            <rect className={styles.rackVent} x={rack.x + 13} y={rack.y + 13} width="97" height="9" rx="2" />
            {[0, 1, 2, 3, 4].map((unit) => (
              <g key={unit} className={index === 1 && unit === 2 ? styles.focusUnit : undefined}>
                <rect className={styles.serverUnit} x={rack.x + 12} y={rack.y + 33 + unit * 32} width="100" height="25" rx="3" />
                <path className={styles.ventLine} d={`M${rack.x + 22} ${rack.y + 42 + unit * 32}h43M${rack.x + 22} ${rack.y + 49 + unit * 32}h29`} />
                <circle className={styles.led} cx={rack.x + 100} cy={rack.y + 45 + unit * 32} r="2.5" />
              </g>
            ))}
            <text className={styles.rackNumber} x={rack.x + 15} y={rack.y + 205}>{`RACK ${rack.id}`}</text>
            <text className={styles.rackLabel} x={rack.x + 62} y={rack.y + 244} textAnchor="middle">{rack.label}</text>
          </g>
        ))}
        <path className={styles.rackConnection} d="M203 430v32l190 28 190-24v-22M393 396v94" fill="none" />
      </g>

      <g className={styles.signalConnections} fill="none">
        <path className={styles.signalPath} pathLength="1" d="M235 223v-60q0-13-13-13h-20V115" />
        <path className={styles.signalPath} pathLength="1" d="M393 205V115" />
        <path className={styles.signalPath} pathLength="1" d="M562 241v-78q0-13 13-13h18V115" />
        <path className={styles.crossConnection} pathLength="1" d="M202 150h391" />
      </g>
      <g className={styles.signalCards}>
        {[
          { x: 118, name: "METRICS", detail: slow ? "p95 latency ↑" : "request latency", type: 0 },
          { x: 309, name: "LOGS", detail: "request context", type: 1 },
          { x: 500, name: "TRACES", detail: "dependency time", type: 2 },
        ].map((card) => (
          <g key={card.name}>
            <rect className={styles.signalCard} x={card.x} y="35" width="169" height="80" rx="7" />
            <text className={styles.signalHeading} x={card.x + 15} y="58">{card.name}</text>
            {card.type === 0 ? (
              <path className={styles.miniChart} d={`M${card.x + 16} 89l15-5 14 3 14-10 14 5 13-9 15 7 16-12 18 4`} />
            ) : card.type === 1 ? (
              <g className={styles.logLines}>
                <path d={`M${card.x + 16} 74h93M${card.x + 16} 83h126M${card.x + 16} 92h65`} />
              </g>
            ) : (
              <g className={styles.spanLines}>
                <path d={`M${card.x + 16} 74h72M${card.x + 37} 83h108M${card.x + 71} 92h43`} />
              </g>
            )}
            <circle className={styles.signalLight} cx={card.x + 150} cy="53" r="3" />
          </g>
        ))}
      </g>

      <g className={styles.tracePanel}>
        <rect className={styles.traceShadow} x="279" y="299" width="420" height="210" rx="12" />
        <rect className={styles.traceSurface} x="269" y="289" width="420" height="210" rx="9" />
        <path className={styles.traceDivider} d="M269 335h420" />
        <circle className={styles.traceIndicator} cx="291" cy="312" r="4" />
        <text className={styles.traceHeading} x="305" y="317">{recovered ? "RECOVERY CHECK" : "REQUEST TRACE"}</text>
        <text className={styles.traceMeta} x="668" y="317" textAnchor="end">SYNTHETIC</text>
        <text className={styles.traceLabel} x="290" y="361">GET /machine-model</text>
        <text className={styles.traceValue} x="666" y="361" textAnchor="end">{slow ? "448 ms" : "59 ms"}</text>
        <rect className={styles.spanBackground} x="290" y="373" width="376" height="10" rx="3" />
        <rect className={styles.requestSpan} x="290" y="373" width="376" height="10" rx="3" />
        <text className={styles.traceLabel} x="309" y="410">model.lookup</text>
        <text className={styles.lookupValue} x="666" y="410" textAnchor="end">{slow ? "420 ms" : "31 ms"}</text>
        <rect className={styles.lookupSpan} x="309" y="423" width={slow ? 342 : 100} height="12" rx="3" />
        <path className={styles.traceDivider} d="M290 452h376" />
        <text className={styles.traceConclusion} x="291" y="476">{recovered ? "Latency returns to the expected range" : "Most request time is inside model.lookup"}</text>
      </g>
      <g className={styles.recoveryMark}>
        <circle cx="679" cy="286" r="21" />
        <path d="m669 286 7 7 13-15" />
      </g>
    </svg>
  );
}

export function ObservabilityStory() {
  const [active, setActive] = useState(0);
  const enabled = useInfrastructureMotion();
  const reduced = useSystemReducedMotion();
  const compact = useSyncExternalStore(subscribeCompact, compactSnapshot, compactServerSnapshot);
  const scrollEnabled = enabled && !reduced && !compact;
  const [hasPinned, setHasPinned] = useState(false);
  // Preserve document geometry when motion is paused mid-story. A visitor who
  // starts with reduced motion still gets the compact, directly selectable view.
  if (scrollEnabled && !hasPinned) setHasPinned(true);
  else if (compact && hasPinned) setHasPinned(false);
  const pinned = hasPinned && !compact;
  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(stageProgress[0]);
  const webglProgress = useMotionValue(stageProgress[0]);
  const motionOnMount = useRef(enabled);
  const initialAnchor = useRef<InitialAnchorRequest | null>(null);
  const stage = stages[active];

  useLayoutEffect(() => {
    // Native fragment navigation may resolve against the compact SSR layout.
    // Only record the initial request, before desktop geometry expands; never
    // reinterpret a later hash change, resize, or motion-setting change.
    const section = sectionRef.current;
    const hash = window.location.hash;
    if (!section || !hash || !motionOnMount.current || window.matchMedia(compactQuery).matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let target: HTMLElement | null;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return; }
    if (!target || section.contains(target) || !(section.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING)) return;

    const request: InitialAnchorRequest = { hash, target, cancelled: false, handled: false, detach: () => {} };
    const cancel = () => { request.cancelled = true; };
    const events = ["wheel", "touchstart", "pointerdown", "keydown", "hashchange", "popstate", "resize"] as const;
    for (const event of events) window.addEventListener(event, cancel, { passive: true });
    request.detach = () => {
      for (const event of events) window.removeEventListener(event, cancel);
    };
    initialAnchor.current = request;
    return () => {
      request.cancelled = true;
      request.detach();
      initialAnchor.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const request = initialAnchor.current;
    if (!pinned || !request || request.handled) return;
    const frame = window.requestAnimationFrame(() => {
      request.handled = true;
      request.detach();
      if (request.cancelled || window.location.hash !== request.hash || !request.target.isConnected) return;
      const padding = Number.parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const margin = Number.parseFloat(window.getComputedStyle(request.target).scrollMarginTop) || 0;
      const top = window.scrollY + request.target.getBoundingClientRect().top - padding - margin;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      request.handled = true;
      request.detach();
    };
  }, [pinned]);

  useEffect(() => {
    if (!scrollEnabled) {
      paintProgress(sceneRef.current, progressRef.current, webglProgress);
      return;
    }
    const section = sectionRef.current;
    if (!section) return;
    let frame = 0;
    const initial = section.getBoundingClientRect();
    let inView = initial.bottom > stickyInset && initial.top < window.innerHeight;
    const update = () => {
      frame = 0;
      if (!inView || document.hidden) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - (window.innerHeight - stickyInset));
      const progress = clamp((stickyInset - rect.top) / distance);
      progressRef.current = progress;
      paintProgress(sceneRef.current, progress, webglProgress);
      setActive(Math.min(3, Math.floor(progress * 4)));
    };
    const schedule = () => {
      if (!frame && inView && !document.hidden) frame = window.requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) schedule();
      else if (frame) { window.cancelAnimationFrame(frame); frame = 0; }
    });
    observer.observe(section);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    schedule();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [scrollEnabled, active, webglProgress]);

  function selectStage(index: number) {
    if (!scrollEnabled || !sectionRef.current) {
      setActive(index);
      progressRef.current = stageProgress[index];
      paintProgress(sceneRef.current, progressRef.current, webglProgress);
      return;
    }
    const rect = sectionRef.current.getBoundingClientRect();
    const distance = Math.max(1, rect.height - (window.innerHeight - stickyInset));
    window.scrollTo({
      top: window.scrollY + rect.top - stickyInset + stageProgress[index] * distance,
      behavior: "smooth",
    });
  }

  return (
    <section id="infrastructure-story" className={styles.story} ref={sectionRef} data-pinned={pinned ? "on" : "off"} data-scroll={scrollEnabled ? "on" : "off"} data-motion={enabled && !reduced ? "on" : "off"} aria-labelledby="observability-story-title">
      <div className={styles.sticky}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>01 / INSIDE THE INFRASTRUCTURE</p>
            <h2 id="observability-story-title">From signals to understanding.</h2>
          </div>
          <p className={styles.scrollHint}>{scrollEnabled ? "SCROLL TO FOLLOW THE SIGNAL" : "SELECT A STAGE TO EXPLORE"}<span aria-hidden="true">↓</span></p>
        </header>

        <div className={styles.main}>
          <div className={styles.copy}>
            <span className={styles.stepIndex}>{`0${active + 1} / 04`}</span>
            <div id="observability-story-step" className={styles.stepCopy}>
              <h3>{stage.title}</h3>
              <p className={styles.description}>{stage.description}</p>
              <div className={styles.evidence}>
                <span>EXPERIENCE BEHIND THE SCENE</span>
                <p>{stage.evidence}</p>
              </div>
            </div>
            <a className={styles.workLink} href="#work">Explore my observability work <span aria-hidden="true">↗</span></a>
          </div>

          <div className={styles.scene} ref={sceneRef} data-stage={active}>
            <div className={styles.sceneTopline}><span><i />{stage.status}</span><span>CONCEPTUAL SCENE</span></div>
            <div className={styles.stage}>
              <StoryCanvas progress={webglProgress} motionEnabled={enabled && !reduced} />
              <InfrastructureDrawing stage={active} />
            </div>
            <div className={styles.sceneCaption}><span>{stage.signal}</span><small>Synthetic data · No live telemetry</small></div>
          </div>
        </div>

        <div className={styles.controls} role="group" aria-label="Infrastructure story stages">
          {stages.map((item, index) => (
            <button key={item.label} type="button" aria-label={`0${index + 1} ${item.label}`} aria-pressed={active === index} aria-controls="observability-story-step" onClick={() => selectStage(index)}>
              <span className={styles.controlNumber}>{`0${index + 1}`}</span>
              <span>{item.label}</span>
              <span className={styles.controlDot} aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className={styles.disclaimer}>An original observability concept inspired by my experience. It does not represent Google’s internal systems or telemetry stack.</p>
        <noscript><p className={styles.noScript}>The story continues from infrastructure to metrics, logs, and traces; through a slow model lookup; and into verified recovery. Explore the work below for my production observability experience.</p></noscript>
      </div>
    </section>
  );
}

export default ObservabilityStory;
