"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import { withBasePath } from "@/lib/site";
import { webglAvailable } from "./WorldCanvas";
import styles from "./SceneCanvas.module.css";

/** What every WebGL scene exposes to this component. */
export type SceneHandle = {
  setProgress(value: number): void;
  setPointer(x: number, y: number): void;
  setAnimated(animated: boolean): void;
  setVisible(visible: boolean): void;
  setTheme?(): void;
  resize(): void;
  dispose(): void;
};
type SceneOptions = {
  canvas: HTMLCanvasElement;
  modelUrl: string;
  animated: boolean;
  progress: number;
  onContextLost: () => void;
};
export type SceneName = "story";

type Props = {
  scene: SceneName;
  progress: MotionValue<number>;
  motionEnabled: boolean;
  testId: string;
};
type State = "idle" | "ready" | "unavailable";

const MODEL_URL = withBasePath("/models/world.glb");

// Each scene (and Three.js with it) is a separate chunk, fetched only in the browser.
const loaders: Record<SceneName, () => Promise<(options: SceneOptions) => Promise<SceneHandle>>> = {
  story: () => import("./three/createStoryScene").then((module) => module.createStoryScene),
};


/**
 * A real-time 3D layer drawn over an SVG scene once it is ready. If WebGL is
 * missing, the model fails to load, or the context is lost, the canvas stays
 * transparent and the SVG underneath remains what the visitor sees.
 */
function SceneCanvasLayer({ scene: name, progress, motionEnabled, testId }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<SceneHandle | null>(null);
  const motion = useRef(motionEnabled);
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    const element = canvas.current;
    if (!element || !webglAvailable()) return;
    const surface = element.closest("section") ?? element;
    let cancelled = false;
    let onScreen = true;
    const cleanups: (() => void)[] = [];
    const syncVisibility = () => scene.current?.setVisible(onScreen && !document.hidden);

    loaders[name]()
      .then((create) =>
        create({
          canvas: element,
          modelUrl: MODEL_URL,
          animated: motion.current,
          progress: progress.get(),
          onContextLost: () => setState("unavailable"),
        }),
      )
      .then((created) => {
        if (cancelled) {
          created.dispose();
          return;
        }
        scene.current = created;
        created.setAnimated(motion.current);
        created.setProgress(progress.get());
        cleanups.push(progress.on("change", (value) => created.setProgress(value)));

        const resizeObserver = new ResizeObserver(() => created.resize());
        resizeObserver.observe(element.parentElement ?? element);
        cleanups.push(() => resizeObserver.disconnect());

        const intersectionObserver = new IntersectionObserver(([entry]) => {
          onScreen = entry.isIntersecting;
          syncVisibility();
        });
        intersectionObserver.observe(element);
        cleanups.push(() => intersectionObserver.disconnect());

        document.addEventListener("visibilitychange", syncVisibility);
        cleanups.push(() => document.removeEventListener("visibilitychange", syncVisibility));

        if (created.setTheme) {
          const themeObserver = new MutationObserver(() => created.setTheme?.());
          themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
          cleanups.push(() => themeObserver.disconnect());
        }

        const onPointerMove = (event: Event) => {
          const pointer = event as PointerEvent;
          if (pointer.pointerType === "touch") return;
          const box = surface.getBoundingClientRect();
          if (box.width === 0 || box.height === 0) return;
          created.setPointer(
            ((pointer.clientX - box.left) / box.width) * 2 - 1,
            ((pointer.clientY - box.top) / box.height) * 2 - 1,
          );
        };
        const onPointerLeave = () => created.setPointer(0, 0);
        surface.addEventListener("pointermove", onPointerMove);
        surface.addEventListener("pointerleave", onPointerLeave);
        cleanups.push(() => {
          surface.removeEventListener("pointermove", onPointerMove);
          surface.removeEventListener("pointerleave", onPointerLeave);
        });

        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("unavailable");
      });

    return () => {
      cancelled = true;
      for (const cleanup of cleanups) cleanup();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [name, progress]);

  useEffect(() => {
    motion.current = motionEnabled;
    scene.current?.setAnimated(motionEnabled);
  }, [motionEnabled]);

  return (
    <canvas
      ref={canvas}
      className={styles.canvas}
      data-state={state}
      data-testid={testId}
      aria-hidden="true"
    />
  );
}

export const SceneCanvas = memo(SceneCanvasLayer);
export default SceneCanvas;
