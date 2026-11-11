"use client";

import { memo, useEffect, useRef, useState } from "react";
import type { MotionValue } from "framer-motion";
import { withBasePath } from "@/lib/site";
import type { DatacentreScene } from "./three/createDatacentreScene";
import styles from "./DatacentreCanvas.module.css";

type Props = { progress: MotionValue<number>; motionEnabled: boolean };
type State = "idle" | "ready" | "unavailable";

const MODEL_URL = withBasePath("/models/datacentre.glb");

function canUseWebGL() {
  try {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return false;
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

/**
 * Real-time 3D version of the hero aisle, drawn over the SVG scene once it is
 * ready. If WebGL is missing, the model fails to load, or the context is lost,
 * the canvas stays transparent and the SVG scene remains the hero background.
 */
function DatacentreCanvasScene({ progress, motionEnabled }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<DatacentreScene | null>(null);
  const motion = useRef(motionEnabled);
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    const element = canvas.current;
    if (!element || !canUseWebGL()) return;
    const surface = element.closest("section") ?? element;
    let cancelled = false;
    let onScreen = true;
    const cleanups: (() => void)[] = [];
    const syncVisibility = () => scene.current?.setVisible(onScreen && !document.hidden);

    import("./three/createDatacentreScene")
      .then(({ createDatacentreScene }) =>
        createDatacentreScene({
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
  }, [progress]);

  useEffect(() => {
    motion.current = motionEnabled;
    scene.current?.setAnimated(motionEnabled);
  }, [motionEnabled]);

  return (
    <canvas
      ref={canvas}
      className={styles.canvas}
      data-state={state}
      data-testid="datacentre-canvas"
      aria-hidden="true"
    />
  );
}

export const DatacentreCanvas = memo(DatacentreCanvasScene);
export default DatacentreCanvas;
