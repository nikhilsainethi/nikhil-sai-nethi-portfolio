"use client";

import { memo, useEffect, useId, useRef, type CSSProperties } from "react";
import type { MotionValue } from "framer-motion";
import { cinematicFrame, projectPoint, type ScenePoint } from "@/lib/cinematic-scene";
import styles from "./CinematicInfrastructure.module.css";

type Props = { progress: MotionValue<number>; motionEnabled: boolean };
const pose = cinematicFrame(0.28);
const initialStyle = {
  "--camera-x": `${pose.x}px`, "--camera-y": `${pose.y}px`,
  "--camera-scale": pose.scale, "--telemetry": pose.telemetry,
  "--investigation": pose.investigation, "--recovery": pose.recovery,
  "--scan-x": `${pose.scan}px`,
} as CSSProperties;

function point(x: number, y: number, z: number) { return projectPoint({ x, y, z }); }
function vertices(...points: ScenePoint[]) {
  return points.map((p) => { const q = projectPoint(p); return `${q.x.toFixed(2)},${q.y.toFixed(2)}`; }).join(" ");
}
function face(x: number, bottom: number, top: number, near: number, far: number) {
  return vertices({ x, y: bottom, z: near }, { x, y: bottom, z: far }, { x, y: top, z: far }, { x, y: top, z: near });
}
function line(a: ScenePoint, b: ScenePoint) {
  const start = projectPoint(a), end = projectPoint(b);
  return `M${start.x.toFixed(2)} ${start.y.toFixed(2)}L${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

const cabinets = Array.from({ length: 7 }, (_, index) => [
  { side: -1, depth: 2.8 + index * 1.45, index },
  { side: 1, depth: 2.4 + index * 1.45, index },
]).flat().sort((a, b) => b.depth - a.depth);

function Cabinet({ side, depth, index, id }: { side: number; depth: number; index: number; id: string }) {
  const inner = side * 1.62;
  const outer = side * 2.3;
  const far = depth + 1.34;
  const height = 3.08;
  const units = Array.from({ length: 11 }, (_, unit) => ({ bottom: 0.2 + unit * 0.244, unit }));
  return (
    <g className={styles.cabinet} style={{ opacity: Math.min(1, 0.7 + 1.5 / depth) }}>
      <polygon className={styles.cabinetCap} points={vertices({ x: inner, y: 0.08, z: depth }, { x: outer, y: 0.08, z: depth }, { x: outer, y: height, z: depth }, { x: inner, y: height, z: depth })} fill={`url(#${id}-cap)`} />
      <polygon points={vertices({ x: inner, y: height, z: depth }, { x: outer, y: height, z: depth }, { x: outer, y: height, z: far }, { x: inner, y: height, z: far })} fill={`url(#${id}-roof)`} className={styles.cabinetRoof} />
      <polygon className={styles.cabinetFront} points={face(inner, 0.08, height, depth, far)} fill={`url(#${id}-front)`} />
      <polygon className={styles.cabinetInset} points={face(inner - side * 0.012, 0.16, 2.91, depth + 0.07, far - 0.07)} />
      {units.map(({ bottom, unit }) => {
        const x = inner - side * 0.024;
        const led = point(x - side * 0.007, bottom + 0.087, depth + 0.16);
        const secondaryLed = point(x - side * 0.007, bottom + 0.087, depth + 0.25);
        return (
          <g key={unit}>
            <polygon className={unit % 3 === 0 ? styles.drawerRaised : styles.drawer} points={face(x, bottom, bottom + 0.183, depth + 0.10, far - 0.1)} />
            {[0, 1, 2].map((vent) => (
              <path key={vent} className={styles.vent} d={line({ x, y: bottom + 0.045 + vent * 0.039, z: depth + 0.42 }, { x, y: bottom + 0.045 + vent * 0.039, z: far - 0.18 })} />
            ))}
            <circle className={styles.ledHalo} cx={led.x} cy={led.y} r={Math.max(2.3, 14 / depth)} />
            <circle className={unit % 7 === 0 && index % 3 === 0 ? styles.ledAmber : styles.led} cx={led.x} cy={led.y} r={Math.max(0.8, 4.9 / depth)} />
            <circle className={styles.ledSecondary} cx={secondaryLed.x} cy={secondaryLed.y} r={Math.max(0.65, 3.5 / depth)} />
            <path className={styles.drawerLip} d={line({ x, y: bottom + 0.182, z: depth + 0.1 }, { x, y: bottom + 0.182, z: far - 0.1 })} />
          </g>
        );
      })}
      <path className={styles.rackRail} d={line({ x: inner - side * 0.03, y: 0.13, z: depth + 0.055 }, { x: inner - side * 0.03, y: 3.03, z: depth + 0.055 })} />
      <path className={styles.rackRailDim} d={line({ x: inner, y: 0.13, z: far - 0.04 }, { x: inner, y: 3.03, z: far - 0.04 })} />
      <path className={styles.rackFootlight} d={line({ x: inner - side * 0.03, y: 0.09, z: depth + 0.1 }, { x: inner - side * 0.03, y: 0.09, z: far - 0.1 })} />
      <polygon className={styles.reflection} points={face(inner, -0.65, 0, depth + 0.08, far - 0.08)} fill={`url(#${id}-reflection)`} />
    </g>
  );
}

function Architecture({ id }: { id: string }) {
  return (
    <>
      <rect width="1600" height="1000" fill={`url(#${id}-atmosphere)`} />
      <ellipse cx="1040" cy="462" rx="370" ry="280" fill={`url(#${id}-bloom)`} />
      <path d="M820 325H1260V620H820Z" fill={`url(#${id}-backwall)`} />
      <path className={styles.backWallLines} d="M955 365h170v226H955zM968 378h144v200H968zM1038 381v194M1086 385v185" />
      <path d="M1024 375h18v185h-18z" fill={`url(#${id}-doorlight)`} opacity="0.45" />
      <path d="M0 1000 970 472h140L1600 1000Z" fill={`url(#${id}-floor)`} />
      <g className={styles.floorLines}>
        {[-6, -4, -2.7, -1.7, -.8, 0, .8, 1.7, 2.7, 4, 6].map((x) => <path key={x} d={line({ x, y: 0, z: 1.6 }, { x, y: 0, z: 20 })} />)}
        {[2, 2.8, 3.8, 5.2, 7.2, 10, 14, 20].map((z) => <path key={z} d={line({ x: -6, y: 0, z }, { x: 6, y: 0, z })} />)}
      </g>
      <g className={styles.floorGuides}>
        {[-1.45, 1.45].map((x) => <path key={x} d={line({ x, y: .006, z: 2 }, { x, y: .006, z: 17 })} />)}
      </g>
      <g className={styles.ceilingStructure}>
        {[-2.9, -1.8, -.8, .8, 1.8, 2.9].map((x) => <path key={x} d={line({ x, y: 3.4, z: 1.7 }, { x, y: 3.4, z: 20 })} />)}
        {[3, 4.5, 6, 8, 11, 15].map((z) => <path key={z} d={line({ x: -3.2, y: 3.35, z }, { x: 3.2, y: 3.35, z })} />)}
      </g>
      <g className={styles.ceilingLights}>
        {[-1.12, 1.12].map((x) => <path key={x} d={line({ x, y: 3.24, z: 2.7 }, { x, y: 3.24, z: 17 })} />)}
      </g>
      {cabinets.map((cabinet) => <Cabinet key={`${cabinet.side}-${cabinet.index}`} {...cabinet} id={id} />)}
      <g className={styles.foregroundRails}>
        <path d="M1457-50 1516 1050M1379-50 1439 1050M67-50 18 1050" />
      </g>
    </>
  );
}

function Telemetry() {
  return (
    <g className={styles.telemetry}>
      {[-1, 1].flatMap((side) => [1, 3, 5].map((index) => {
        const depth = 2.8 + index * 1.45;
        const start = point(side * 1.60, 1.4, depth);
        const corner = point(side * .85, 2.7, depth + 1.5);
        const end = point(side * .1, 2.35, 15);
        const path = `M${start.x} ${start.y}C${start.x} ${start.y - 85},${corner.x} ${corner.y + 35},${corner.x} ${corner.y}S${end.x + side * 65} ${end.y},${end.x} ${end.y}`;
        return <g key={`${side}-${index}`}>
          <path className={styles.signalGlow} d={path} pathLength="1" />
          <path className={styles.signalPath} d={path} pathLength="1" />
          <circle className={styles.signalNode} cx={start.x} cy={start.y} r={3} />
          <circle className={styles.signalNodeOuter} cx={start.x} cy={start.y} r={9} />
        </g>;
      }))}
      <polygon className={styles.scanPlane} points={vertices({ x: -1.57, y: 0.05, z: 6.3 }, { x: 1.57, y: 0.05, z: 6.3 }, { x: 1.57, y: 3.08, z: 6.3 }, { x: -1.57, y: 3.08, z: 6.3 })} />
      <polygon className={styles.investigation} points={face(1.59, .18, 2.90, 5.32, 6.55)} />
      <polygon className={styles.recovery} points={face(1.59, .18, 2.90, 5.32, 6.55)} />
    </g>
  );
}

/** Original decorative aisle. Timeline updates are event-driven, including manual paused scrubbing. */
function CinematicInfrastructureScene({ progress, motionEnabled }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const id = `cinematic-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    let frame = 0;
    const paint = () => {
      frame = 0;
      const element = container.current;
      if (!element) return;
      const next = cinematicFrame(progress.get());
      element.dataset.progress = next.progress.toFixed(3);
      element.style.setProperty("--camera-x", `${next.x.toFixed(3)}px`);
      element.style.setProperty("--camera-y", `${next.y.toFixed(3)}px`);
      element.style.setProperty("--camera-scale", next.scale.toFixed(4));
      element.style.setProperty("--telemetry", next.telemetry.toFixed(4));
      element.style.setProperty("--investigation", next.investigation.toFixed(4));
      element.style.setProperty("--recovery", next.recovery.toFixed(4));
      element.style.setProperty("--scan-x", `${next.scan.toFixed(3)}px`);
    };
    const onChange = () => {
      if (!motionEnabled) { paint(); return; }
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    paint();
    const unsubscribe = progress.on("change", onChange);
    return () => {
      unsubscribe();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [progress, motionEnabled]);

  return (
    <div ref={container} className={styles.scene} style={initialStyle} data-progress="0.280" data-motion={motionEnabled ? "on" : "off"} aria-hidden="true">
      <svg className={styles.canvas} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <radialGradient id={`${id}-atmosphere`} cx="66%" cy="44%" r="72%"><stop stopColor="#11313c" /><stop offset=".46" stopColor="#06121b" /><stop offset="1" stopColor="#01050a" /></radialGradient>
          <radialGradient id={`${id}-bloom`}><stop stopColor="#337477" stopOpacity=".23" /><stop offset="1" stopColor="#183038" stopOpacity="0" /></radialGradient>
          <linearGradient id={`${id}-front`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#071019" /><stop offset=".5" stopColor="#162b35" /><stop offset="1" stopColor="#0a1720" /></linearGradient>
          <linearGradient id={`${id}-cap`}><stop stopColor="#06101a" /><stop offset="1" stopColor="#142a34" /></linearGradient>
          <linearGradient id={`${id}-roof`} x2="0" y2="1"><stop stopColor="#25424c" /><stop offset="1" stopColor="#0d1c26" /></linearGradient>
          <linearGradient id={`${id}-reflection`} x2="0" y2="1"><stop stopColor="#429c94" stopOpacity=".1" /><stop offset="1" stopColor="#173b40" stopOpacity="0" /></linearGradient>
          <linearGradient id={`${id}-backwall`} x2="0" y2="1"><stop stopColor="#07121b" /><stop offset="1" stopColor="#16343c" /></linearGradient>
          <linearGradient id={`${id}-doorlight`}><stop stopColor="#a2d4be" stopOpacity="0" /><stop offset=".5" stopColor="#c1eacb" /><stop offset="1" stopColor="#96cabf" stopOpacity="0" /></linearGradient>
          <linearGradient id={`${id}-floor`} x2="0" y2="1"><stop stopColor="#154344" stopOpacity=".22" /><stop offset="1" stopColor="#030b13" /></linearGradient>
          <linearGradient id={`${id}-haze`}><stop stopColor="#02090f" stopOpacity=".93" /><stop offset=".3" stopColor="#020a11" stopOpacity=".62" /><stop offset=".58" stopColor="#06151d" stopOpacity="0" /><stop offset="1" stopColor="#02090f" stopOpacity=".08" /></linearGradient>
          <radialGradient id={`${id}-vignette`} cx="63%" cy="48%" r="73%"><stop offset=".22" stopColor="#01050a" stopOpacity="0" /><stop offset="1" stopColor="#01050a" stopOpacity=".77" /></radialGradient>
          <pattern id={`${id}-grain`} width="89" height="73" patternUnits="userSpaceOnUse"><path d="M3 8h1m20 9h1m37-9h1M13 37h1m26-11h1m39 17h1M8 63h1m20-12h1m20 16h1m21-8h1" stroke="#b9d5d5" strokeOpacity=".16" strokeWidth=".6" /></pattern>
        </defs>
        <g className={styles.camera}>
          <Architecture id={id} />
          <Telemetry />
        </g>
        <rect width="1600" height="1000" fill={`url(#${id}-haze)`} />
        <rect width="1600" height="1000" fill={`url(#${id}-vignette)`} />
        <rect width="1600" height="1000" fill={`url(#${id}-grain)`} />
      </svg>
      <div className={styles.edgeShade} />
    </div>
  );
}

export const CinematicInfrastructure = memo(CinematicInfrastructureScene);
export default CinematicInfrastructure;
