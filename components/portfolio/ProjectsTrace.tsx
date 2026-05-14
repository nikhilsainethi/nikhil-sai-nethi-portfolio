"use client";

import { Fragment, useEffect, useRef, useState } from "react";

type Stage = {
  id: string;
  index: string;
  title: string;
  body: string;
  meta: string;
  latency: string;
  final?: boolean;
};

const STAGES: Stage[] = [
  {
    id: "query",
    index: "01",
    title: "QUERY",
    body: "“How do we handle Datadog backfill on EKS?”",
    meta: "operator input",
    latency: "+0ms",
  },
  {
    id: "hyde",
    index: "02",
    title: "HyDE",
    body: "LLM generates a hypothetical answer → embeds it for retrieval",
    meta: "1 round-trip",
    latency: "+28ms",
  },
  {
    id: "retrieve",
    index: "03",
    title: "RETRIEVE",
    body: "pgvector ANN + BM25 hybrid search → top-50 candidate chunks",
    meta: "50 candidates",
    latency: "+32ms",
  },
  {
    id: "rerank",
    index: "04",
    title: "RERANK",
    body: "Reciprocal Rank Fusion + cross-encoder → top-3 grounded chunks",
    meta: "3 finalists",
    latency: "+18ms",
  },
  {
    id: "answer",
    index: "05",
    title: "ANSWER",
    body: "Grounded reply with inline citations to runbooks + postmortems",
    meta: "operator output",
    latency: "+12ms",
    final: true,
  },
];

const STAGE_STEP_MS = 320;

export function ProjectsTrace() {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [progress, setProgress] = useState(-1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced-motion init
      setArmed(true);
      setProgress(STAGES.length);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !armed) {
          setArmed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [armed]);

  useEffect(() => {
    if (!armed) return;
    let i = 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start sequence
    setProgress(0);
    const id = window.setInterval(() => {
      i += 1;
      setProgress(i);
      if (i >= STAGES.length) window.clearInterval(id);
    }, STAGE_STEP_MS);
    return () => window.clearInterval(id);
  }, [armed]);

  const totalMs =
    STAGES.reduce((acc, s) => {
      const n = parseInt(s.latency.replace(/[^\d]/g, ""), 10);
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);

  const complete = progress >= STAGES.length;

  return (
    <div ref={ref} className="trace" data-armed={armed}>
      <div className="trace__head">
        <span className="trace__head-arrow">▸</span>
        <span className="trace__head-label">TRACE</span>
        <span className="trace__head-divider" />
        <span className="trace__head-run">RUN_42</span>
        <span className="trace__head-divider" />
        <span className="trace__head-latency">
          TOTAL <b>{complete ? `${totalMs}ms` : "···"}</b>
        </span>
        <span className="trace__head-spacer" />
        <span
          className={`trace__head-status${complete ? " is-complete" : ""}`}
        >
          <span className="trace__head-dot" />
          {complete ? "COMPLETE" : "RUNNING"}
        </span>
      </div>

      <div className="trace__pipeline" role="list">
        {STAGES.map((stage, i) => {
          const reached = progress >= i;
          const lit = reached;
          const isCurrent = progress === i;
          return (
            <Fragment key={stage.id}>
              <article
                role="listitem"
                className={`trace-stage${lit ? " is-lit" : ""}${
                  isCurrent ? " is-current" : ""
                }${stage.final && reached ? " is-final" : ""}`}
              >
                <header className="trace-stage__head">
                  <span className="trace-stage__index">{stage.index}</span>
                  <span className="trace-stage__title">{stage.title}</span>
                </header>
                <p className="trace-stage__body">{stage.body}</p>
                <footer className="trace-stage__foot">
                  <span className="trace-stage__meta">{stage.meta}</span>
                  <span className="trace-stage__latency">{stage.latency}</span>
                </footer>
                {stage.final && reached && (
                  <span className="trace-stage__final-edge" aria-hidden="true" />
                )}
              </article>
              {i < STAGES.length - 1 && (
                <TraceConnector active={progress > i} />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function TraceConnector({ active }: { active: boolean }) {
  return (
    <div
      className={`trace-connector${active ? " is-active" : ""}`}
      aria-hidden="true"
    >
      <svg
        className="trace-connector__svg"
        viewBox="0 0 64 24"
        preserveAspectRatio="none"
      >
        <line
          className="trace-connector__line"
          x1="0"
          x2="60"
          y1="12"
          y2="12"
        />
        <polyline
          className="trace-connector__head"
          points="56,7 62,12 56,17"
        />
        <circle className="trace-connector__pip" cx="0" cy="12" r="2.4" />
      </svg>
    </div>
  );
}
