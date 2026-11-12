"use client";

import { createContext, memo, useContext, useEffect, useRef, useState } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { withBasePath } from "@/lib/site";
import { ANCHORS, journeyAt, nearestStill } from "@/lib/world-path";
import type { WorldScene, WorldStatus } from "./three/world/createWorldScene";
import styles from "./WorldCanvas.module.css";

const MODEL_URL = withBasePath("/models/world.glb");
/** Fired by the signal lab so the world can react to an injected fault. */
export const LAB_SCENARIO_EVENT = "infra:lab-scenario";

const HeroProgress = createContext<MotionValue<number> | null>(null);
export const HeroProgressProvider = HeroProgress.Provider;

/** The hero scrubber's value: shared with the world when there is one, private otherwise. */
export function useHeroProgress() {
  const shared = useContext(HeroProgress);
  const own = useMotionValue(0.28);
  return shared ?? own;
}

/** True when the page's early script found WebGL 2 (and data saver is off). */
export function webglAvailable() {
  const flag = document.documentElement.dataset.webgl;
  if (flag) return flag === "yes";
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

type Props = { progress: MotionValue<number>; motionEnabled: boolean };
type State = "idle" | "ready" | "unavailable";

function measureLandmarks(elements: (Element | null)[]) {
  return ANCHORS.map((anchor, i) => {
    const element = elements[i];
    if (!element) return Number.NaN;
    const box = element.getBoundingClientRect();
    if (box.height === 0) return Number.NaN; // hidden (for example an interlude in the light theme)
    return box.top + window.scrollY + anchor.at * box.height;
  });
}

function WorldCanvasLayer({ progress, motionEnabled }: Props) {
  const layer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const zone = useRef<HTMLElement>(null);
  const elevation = useRef<HTMLSpanElement>(null);
  const scene = useRef<WorldScene | null>(null);
  const motion = useRef(motionEnabled);
  const sync = useRef<() => void>(() => {});
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    const element = canvas.current;
    const wrapper = layer.current;
    const root = document.documentElement;
    if (!element || !wrapper || !webglAvailable()) return;
    let cancelled = false;
    const cleanups: (() => void)[] = [];

    const giveUp = () => {
      setState("unavailable");
      delete root.dataset.world;
      root.dataset.webgl = "no";
    };

    const onStatus = (status: WorldStatus) => {
      if (zone.current) zone.current.textContent = status.zone;
      if (elevation.current) {
        const metres = Math.round(status.elevation * 10) / 10;
        elevation.current.textContent = `${metres >= 0 ? "+" : "−"}${Math.abs(metres).toFixed(1)} m`;
      }
      hud.current?.style.setProperty("--world-progress", status.progress.toFixed(3));
    };

    import("./three/world/createWorldScene")
      .then(({ createWorldScene }) =>
        createWorldScene({
          canvas: element,
          modelUrl: MODEL_URL,
          animated: motion.current,
          progress: progress.get(),
          journey: 0,
          onContextLost: giveUp,
          onStatus,
        }),
      )
      .then((created) => {
        if (cancelled) {
          created.dispose();
          return;
        }
        scene.current = created;
        const anchors = ANCHORS.map(({ anchor }) => document.querySelector(`[data-world-anchor="${anchor}"]`));
        const hero = anchors[0];
        let heroOnScreen = true;
        let still = -1;
        let cutTimer = 0;
        let frame = 0;

        const journeying = () => root.dataset.world === "on";
        // The readout only shows in the open stretches between sections, where nothing is under it.
        const interludes = Array.from(document.querySelectorAll(".world-interlude"));
        const apply = () => {
          frame = 0;
          created.setVisible(!document.hidden && (journeying() || heroOnScreen));
          if (hud.current) {
            const low = window.innerHeight * 0.92;
            const inOpen = interludes.some((interlude) => {
              const box = interlude.getBoundingClientRect();
              return box.height > 0 && box.top < low - 90 && box.bottom > low;
            });
            hud.current.dataset.visible = String(journeying() && inOpen);
          }
          if (!journeying()) {
            created.setJourney(0);
            return;
          }
          const u = journeyAt(measureLandmarks(anchors), window.scrollY + window.innerHeight / 2);
          if (motion.current) {
            still = -1;
            created.setJourney(u);
            return;
          }
          // Reduced motion: hold a still, and cut to the next one through a short fade.
          const next = nearestStill(u);
          if (next === still) return;
          const first = still < 0;
          still = next;
          window.clearTimeout(cutTimer);
          if (first) {
            created.setJourney(next);
            return;
          }
          wrapper.dataset.cut = "out";
          cutTimer = window.setTimeout(() => {
            created.setJourney(next);
            wrapper.dataset.cut = "in";
          }, 200);
        };
        const schedule = () => {
          if (!frame) frame = window.requestAnimationFrame(apply);
        };
        sync.current = schedule;

        const setMode = () => {
          root.dataset.world = root.dataset.mode === "light" ? "hero" : "on";
          still = -1;
          schedule();
        };
        setMode();
        const themeObserver = new MutationObserver(setMode);
        themeObserver.observe(root, { attributes: true, attributeFilter: ["data-mode"] });
        cleanups.push(() => themeObserver.disconnect());

        cleanups.push(progress.on("change", (value) => created.setProgress(value)));
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        document.addEventListener("visibilitychange", schedule);
        cleanups.push(() => {
          window.removeEventListener("scroll", schedule);
          window.removeEventListener("resize", schedule);
          document.removeEventListener("visibilitychange", schedule);
          window.cancelAnimationFrame(frame);
          window.clearTimeout(cutTimer);
        });

        const resizeObserver = new ResizeObserver(() => {
          if (hero) wrapper.style.setProperty("--world-hero-height", `${(hero as HTMLElement).offsetHeight}px`);
          created.resize();
          schedule();
        });
        resizeObserver.observe(element);
        if (hero) resizeObserver.observe(hero);
        cleanups.push(() => resizeObserver.disconnect());

        if (hero) {
          const heroObserver = new IntersectionObserver(([entry]) => {
            heroOnScreen = entry.isIntersecting;
            schedule();
          });
          heroObserver.observe(hero);
          cleanups.push(() => heroObserver.disconnect());
        }

        const onPointerMove = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          created.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
        };
        const onPointerLeave = () => created.setPointer(0, 0);
        window.addEventListener("pointermove", onPointerMove, { passive: true });
        root.addEventListener("pointerleave", onPointerLeave);
        cleanups.push(() => {
          window.removeEventListener("pointermove", onPointerMove);
          root.removeEventListener("pointerleave", onPointerLeave);
        });

        const onScenario = (event: Event) => created.setAlert((event as CustomEvent<string>).detail === "slow-lookup");
        window.addEventListener(LAB_SCENARIO_EVENT, onScenario);
        cleanups.push(() => window.removeEventListener(LAB_SCENARIO_EVENT, onScenario));

        setState("ready");
      })
      .catch(() => {
        if (!cancelled) giveUp();
      });

    return () => {
      cancelled = true;
      for (const cleanup of cleanups) cleanup();
      scene.current?.dispose();
      scene.current = null;
      sync.current = () => {};
      delete root.dataset.world;
    };
  }, [progress]);

  useEffect(() => {
    motion.current = motionEnabled;
    scene.current?.setAnimated(motionEnabled);
    sync.current();
  }, [motionEnabled]);

  return (
    <>
      <div ref={layer} className={styles.layer} data-state={state} aria-hidden="true">
        <canvas ref={canvas} className={styles.canvas} data-testid="world-canvas" />
      </div>
      <div ref={hud} className={styles.hud} data-visible="false" aria-hidden="true">
        <b ref={zone}>Cold aisle</b>
        <span ref={elevation}>+1.4 m</span>
        <span className={styles.hudMeter}>
          <i />
        </span>
      </div>
    </>
  );
}

export const WorldCanvas = memo(WorldCanvasLayer);
export default WorldCanvas;
