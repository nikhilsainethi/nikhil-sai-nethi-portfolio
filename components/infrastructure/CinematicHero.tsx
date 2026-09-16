"use client";

import { useRef, useState, type PointerEvent } from "react";
import { useMotionValue, useMotionValueEvent, useScroll } from "framer-motion";
import { useInfrastructureMotion } from "./InfrastructureShell";
import { CinematicInfrastructure } from "./CinematicInfrastructure";
import styles from "./CinematicHero.module.css";

const bound = (value: number) => Math.min(1, Math.max(0, value));
const stages = ["Physical layer", "Signals connected", "Request context"];

export function CinematicHero() {
  const enabled = useInfrastructureMotion();
  const hero = useRef<HTMLElement>(null);
  const pointerX = useRef<number | null>(null);
  const previousScroll = useRef(0);
  const progress = useMotionValue(0.28);
  const [position, setPosition] = useState(28);
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  useMotionValueEvent(progress, "change", (value) =>
    setPosition(Math.round(value * 100)),
  );
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const delta = value - previousScroll.current;
    previousScroll.current = value;
    if (enabled) progress.set(bound(progress.get() + delta * 0.6));
  });

  function moveScene(event: PointerEvent<HTMLElement>) {
    const previous = pointerX.current;
    pointerX.current = event.clientX;
    if (!enabled || event.pointerType === "touch" || previous === null) return;
    if ((event.target as HTMLElement).closest("a, button, input")) return;
    const width = event.currentTarget.getBoundingClientRect().width;
    if (width > 0)
      progress.set(
        bound(progress.get() + ((event.clientX - previous) / width) * 0.8),
      );
  }

  const stageIndex = position < 34 ? 0 : position < 68 ? 1 : 2;
  return (
    <>
      <section
        ref={hero}
        id="overview"
        className={styles.hero}
        aria-label="Portfolio introduction"
        data-motion={enabled ? "on" : "off"}
        onPointerMove={moveScene}
        onPointerLeave={() => {
          pointerX.current = null;
        }}
      >
        <div className={styles.environment}>
          <CinematicInfrastructure
            progress={progress}
            motionEnabled={enabled}
          />
        </div>
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.topline}>
          <span>
            <i /> INCOMING · GOOGLE
          </span>
          <span>PLATFORM INFRASTRUCTURE / 01</span>
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            NIKHIL SAI NETHI <span>ENGINEER. INVESTIGATOR. BUILDER.</span>
          </p>
          <h1 className={styles.title}>
            <span>Complex systems.</span>
            <span>
              Clear <em>signals.</em>
            </span>
          </h1>
          <p className={styles.description}>
            I build the visibility that makes infrastructure understandable.
          </p>
          <p className={styles.role}>
            Incoming Platform Infrastructure Engineer at Google.
            <br />
            Observability & monitoring · UHM-M.
          </p>
          <div className={styles.terminal}>
            <span className={styles.srOnly}>
              Metrics, logs, and traces become understanding.
            </span>
            <span aria-hidden="true">↳</span>
            <span className={styles.typed} aria-hidden="true">
              metrics + logs + traces → understanding
            </span>
          </div>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#work">
              Explore my experience <span aria-hidden="true">↗</span>
            </a>
            <a href="#infrastructure-story">
              Follow the signals <span aria-hidden="true">↓</span>
            </a>
            <a href="#contact">
              Let’s connect <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className={styles.annotation} aria-hidden="true">
          <span>INFRASTRUCTURE IN FOCUS</span>
          <span className={styles.stage} data-testid="hero-scene-stage">
            0{stageIndex + 1} / {stages[stageIndex]}
          </span>
          <span className={styles.annotationLine} />
          <small>AN ORIGINAL, SYNTHETIC ENVIRONMENT</small>
        </div>
        <div className={styles.bottom}>
          <p className={styles.interactionHint}>
            <span aria-hidden="true">↔</span>
            {enabled ? (
              <>
                <span className={styles.pointerHint}>
                  Move your pointer. Shift your perspective.
                </span>
                <span className={styles.touchHint}>
                  Scrub to explore the infrastructure.
                </span>
              </>
            ) : (
              "Scene paused. Use the slider to explore."
            )}
          </p>
          <div className={styles.scrubber}>
            <label htmlFor="infrastructure-scene-progress">
              EXPLORE INFRASTRUCTURE SCENE
            </label>
            <input
              id="infrastructure-scene-progress"
              type="range"
              min="0"
              max="100"
              step="1"
              value={position}
              aria-label="Explore infrastructure scene"
              aria-valuetext={`${position}% — ${stages[stageIndex]}`}
              onChange={(event) =>
                progress.set(Number(event.target.value) / 100)
              }
            />
            <span aria-hidden="true">{String(position).padStart(2, "0")}</span>
          </div>
          <a href="#infrastructure-story" className={styles.scrollLink}>
            SCROLL TO GO DEEPER <span aria-hidden="true">↓</span>
          </a>
        </div>
        <noscript>
          <style>{`.${styles.copy} *, .${styles.typed} { animation:none !important; opacity:1 !important; filter:none !important; clip-path:none !important; } .${styles.scrubber}, .${styles.interactionHint} { display:none !important; }`}</style>
        </noscript>
      </section>
      <div className={`infra-wrap ${styles.experience}`}>
        <div className={styles.experienceHeading}>
          <span>THE EXPERIENCE BEHIND THE PERSPECTIVE</span>
          <a href="#work">Selected engineering work ↗</a>
        </div>
        <div
          className="infra-experience-preview"
          aria-label="Experience highlights"
        >
          <a href="#work">
            <span>MOODY’S / SOFTWARE ENGINEER</span>
            <strong>Production observability</strong>
            <p>SLI/SLO dashboards · tracing · on-call</p>
            <b aria-hidden="true">↗</b>
          </a>
          <a href="#work">
            <span>NOKIA / SOFTWARE ENGINEER</span>
            <strong>Systems-level diagnosis</strong>
            <p>Packet analysis · kernel logs · network APIs</p>
            <b aria-hidden="true">↗</b>
          </a>
          <a href="#work">
            <span>VERISK / DEVELOPMENT CO-OP</span>
            <strong>Cloud platform workflows</strong>
            <p>AWS migration · CloudWatch · integration tests</p>
            <b aria-hidden="true">↗</b>
          </a>
        </div>
      </div>
    </>
  );
}
