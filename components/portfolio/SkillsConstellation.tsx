"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type SkillNodeData = {
  id: string;
  label: string;
  category: SkillCategory;
  depth: 1 | 2 | 3 | 4 | 5;
};

export type SkillCategory =
  | "languages"
  | "cloud"
  | "observability"
  | "ai"
  | "data";

type RuntimeNode = SkillNodeData & {
  ax: number;
  ay: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

const CATEGORY_META: Record<
  SkillCategory,
  { label: string; code: string; hue: number; angle: number }
> = {
  languages: { label: "Languages", code: "LANG", hue: 174, angle: -Math.PI / 2 },
  cloud: { label: "Cloud / Platform", code: "CLOUD", hue: 200, angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
  observability: { label: "Observability", code: "OBS", hue: 28, angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
  ai: { label: "AI / LLM", code: "AI", hue: 264, angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
  data: { label: "Data / Messaging", code: "DATA", hue: 320, angle: -Math.PI / 2 + (8 * Math.PI) / 5 },
};

const CATEGORY_ORDER: SkillCategory[] = [
  "languages",
  "cloud",
  "observability",
  "ai",
  "data",
];

export type ConstellationProps = {
  nodes: SkillNodeData[];
  edges: Array<[string, string]>;
};

export function SkillsConstellation({ nodes, edges }: ConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<RuntimeNode[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const hoverRef = useRef<string | null>(null);
  const filterRef = useRef<SkillCategory | null>(null);
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const bootStartRef = useRef<number | null>(null);
  const bootProgressRef = useRef(0);

  const [activeFilter, setActiveFilter] = useState<SkillCategory | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [clock, setClock] = useState("00:00:00");
  const [bootStage, setBootStage] = useState<
    "armed" | "framing" | "scanning" | "online"
  >("armed");

  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const n of nodes) map.set(n.id, new Set());
    for (const [a, b] of edges) {
      map.get(a)?.add(b);
      map.get(b)?.add(a);
    }
    return map;
  }, [nodes, edges]);

  useEffect(() => {
    filterRef.current = activeFilter;
  }, [activeFilter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const update = () => setReducedMotion(mq.matches);
      update();
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
  }, []);

  // Trigger boot once the panel enters view. Reduced-motion → snap to online.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (reducedMotion) {
      bootStartRef.current = -Infinity;
      bootProgressRef.current = 1;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reduced-motion init
      setBootStage("online");
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && bootStartRef.current === null) {
          bootStartRef.current = performance.now();
          setBootStage("framing");
          window.setTimeout(() => setBootStage("scanning"), 400);
          window.setTimeout(() => setBootStage("online"), 1500);
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion]);

  // Mono-spaced clock for the telemetry strip — feels live without being noisy.
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      setClock(`${h}:${m}:${s}`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapperRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const baseRadius = Math.min(rect.width, rect.height) * 0.36;

      const grouped = new Map<SkillCategory, SkillNodeData[]>();
      for (const cat of CATEGORY_ORDER) grouped.set(cat, []);
      for (const n of nodes) grouped.get(n.category)?.push(n);

      const existing = new Map(runtimeRef.current.map((r) => [r.id, r]));
      const next: RuntimeNode[] = [];

      for (const cat of CATEGORY_ORDER) {
        const meta = CATEGORY_META[cat];
        const list = grouped.get(cat) ?? [];
        const clusterX = cx + Math.cos(meta.angle) * baseRadius;
        const clusterY = cy + Math.sin(meta.angle) * baseRadius * 0.85;
        const inner = baseRadius * 0.42;
        for (let i = 0; i < list.length; i++) {
          const n = list[i];
          const slot = (i / Math.max(1, list.length)) * Math.PI * 2;
          const wobble = (n.depth - 3) * 6;
          const ax = clusterX + Math.cos(slot) * (inner + wobble);
          const ay = clusterY + Math.sin(slot) * (inner * 0.78 + wobble);
          const r = 14 + n.depth * 4;
          const prev = existing.get(n.id);
          next.push({
            ...n,
            ax,
            ay,
            r,
            x: prev?.x ?? ax,
            y: prev?.y ?? ay,
            vx: prev?.vx ?? 0,
            vy: prev?.vy ?? 0,
          });
        }
      }
      runtimeRef.current = next;
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);

    return () => ro.disconnect();
  }, [nodes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;

      let hit: string | null = null;
      for (const node of runtimeRef.current) {
        const dx = node.x - mouseRef.current.x;
        const dy = node.y - mouseRef.current.y;
        if (dx * dx + dy * dy <= (node.r + 6) * (node.r + 6)) {
          hit = node.id;
          break;
        }
      }
      if (hit !== hoverRef.current) {
        hoverRef.current = hit;
        const label = hit
          ? runtimeRef.current.find((n) => n.id === hit)?.label ?? null
          : null;
        setHoverLabel(label);
      }
    };
    const onPointerLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
      if (hoverRef.current) {
        hoverRef.current = null;
        setHoverLabel(null);
      }
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(33, now - last) / 16;
      last = now;
      const { w, h, dpr } = sizeRef.current;
      const nodesArr = runtimeRef.current;
      const filter = filterRef.current;
      const hover = hoverRef.current;
      const neighbors = hover ? adjacency.get(hover) : null;
      const isLight =
        typeof document !== "undefined" &&
        document.documentElement.dataset.mode === "light";

      if (!reducedMotion) {
        for (const n of nodesArr) {
          const dx = n.ax - n.x;
          const dy = n.ay - n.y;
          n.vx += dx * 0.012;
          n.vy += dy * 0.012;

          if (mouseRef.current.active) {
            const mx = mouseRef.current.x - n.x;
            const my = mouseRef.current.y - n.y;
            const dist2 = mx * mx + my * my;
            if (dist2 < 160 * 160 && dist2 > 1) {
              const dist = Math.sqrt(dist2);
              const pull = (160 - dist) / 160;
              n.vx += (mx / dist) * pull * 0.5;
              n.vy += (my / dist) * pull * 0.5;
            }
          }

          for (const other of nodesArr) {
            if (other === n) continue;
            const ox = n.x - other.x;
            const oy = n.y - other.y;
            const od2 = ox * ox + oy * oy;
            const minDist = n.r + other.r + 6;
            if (od2 < minDist * minDist && od2 > 0.01) {
              const od = Math.sqrt(od2);
              const push = (minDist - od) / minDist;
              n.vx += (ox / od) * push * 0.4;
              n.vy += (oy / od) * push * 0.4;
            }
          }

          n.vx *= 0.86;
          n.vy *= 0.86;
          n.x += n.vx * dt;
          n.y += n.vy * dt;
        }
      } else {
        for (const n of nodesArr) {
          n.x = n.ax;
          n.y = n.ay;
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Boot progress 0..1 over 1500ms after section enters view.
      const bootStart = bootStartRef.current;
      const rawBoot =
        bootStart === null
          ? 0
          : bootStart === -Infinity
            ? 1
            : Math.min(1, (now - bootStart) / 1500);
      bootProgressRef.current = rawBoot;

      // Phase ramps inside boot.
      const gridP = clamp01((rawBoot - 0.18) / 0.22);
      // Edges grow from 0.62 → 1.0
      const edgeBoot = clamp01((rawBoot - 0.62) / 0.38);

      // 1) Graph-paper grid — base of the instrument feel.
      const gridStep = 32;
      const gridAlpha = (isLight ? 0.06 : 0.05) * gridP;
      if (gridAlpha > 0.001) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = isLight
          ? `rgba(28,18,8,${gridAlpha.toFixed(3)})`
          : `rgba(220,232,255,${gridAlpha.toFixed(3)})`;
        ctx.beginPath();
        for (let gx = (w % gridStep) / 2; gx <= w; gx += gridStep) {
          ctx.moveTo(Math.round(gx) + 0.5, 0);
          ctx.lineTo(Math.round(gx) + 0.5, h);
        }
        for (let gy = (h % gridStep) / 2; gy <= h; gy += gridStep) {
          ctx.moveTo(0, Math.round(gy) + 0.5);
          ctx.lineTo(w, Math.round(gy) + 0.5);
        }
        ctx.stroke();
      }

      // 2) Reticle crosshair at canvas center (subtle anchor).
      ctx.strokeStyle = isLight
        ? `rgba(28,18,8,0.12)`
        : `rgba(220,232,255,0.10)`;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 8, h / 2);
      ctx.lineTo(w / 2 + 8, h / 2);
      ctx.moveTo(w / 2, h / 2 - 8);
      ctx.lineTo(w / 2, h / 2 + 8);
      ctx.stroke();

      // 3) Scan-sweep — slow horizontal sweep, low alpha, only when motion ok.
      if (!reducedMotion) {
        const sweepPeriod = 7000;
        const sweepT = (now % sweepPeriod) / sweepPeriod;
        const sweepY = sweepT * (h + 80) - 40;
        const sweepAlpha = isLight ? 0.07 : 0.05;
        const grad = ctx.createLinearGradient(0, sweepY - 40, 0, sweepY + 40);
        grad.addColorStop(0, `rgba(0,229,199,0)`);
        grad.addColorStop(0.5, `rgba(0,229,199,${sweepAlpha})`);
        grad.addColorStop(1, `rgba(0,229,199,0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, sweepY - 40, w, 80);
      }

      // 4) Edges (boot-aware: each edge has a phase, drawn partial → full).
      ctx.lineWidth = 1;
      for (let ei = 0; ei < edges.length; ei++) {
        const [a, b] = edges[ei];
        const na = nodesArr.find((n) => n.id === a);
        const nb = nodesArr.find((n) => n.id === b);
        if (!na || !nb) continue;
        // Each edge starts drawing at a slightly different boot moment.
        const edgePhase = (ei % 10) / 10;
        const edgeT = clamp01((edgeBoot - edgePhase * 0.4) / 0.6);
        if (edgeT <= 0) continue;
        const dim =
          isDimmed(na, filter, hover, neighbors) ||
          isDimmed(nb, filter, hover, neighbors);
        const highlit = !!hover && (a === hover || b === hover);
        const baseAlpha = isLight ? 0.18 : 0.12;
        const alphaMul = edgeT; // fade in as edge draws
        const alpha = highlit
          ? (isLight ? 0.6 : 0.5) * alphaMul
          : dim
            ? baseAlpha * 0.35 * alphaMul
            : baseAlpha * alphaMul;
        const stroke = highlit
          ? `rgba(0,229,199,${alpha})`
          : `rgba(${isLight ? "28,18,8" : "220,232,255"},${alpha})`;
        ctx.strokeStyle = stroke;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(na.x + (nb.x - na.x) * edgeT, na.y + (nb.y - na.y) * edgeT);
        ctx.stroke();

        // Signal pip traveling along hovered edges.
        if (highlit && !reducedMotion && edgeT >= 0.99) {
          const period = 1200;
          const t = ((now % period) / period + (a.charCodeAt(0) % 5) * 0.07) % 1;
          // Pip goes A → B if A is the hovered node, otherwise B → A.
          const fwd = a === hover;
          const px = fwd ? na.x + (nb.x - na.x) * t : nb.x + (na.x - nb.x) * t;
          const py = fwd ? na.y + (nb.y - na.y) * t : nb.y + (na.y - nb.y) * t;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,229,199,0.9)`;
          ctx.fill();
        }
      }

      // 5) Nodes — clusters open in sequence: Languages, Cloud, Obs, AI, Data.
      for (const n of nodesArr) {
        const clusterIdx = CATEGORY_ORDER.indexOf(n.category);
        const clusterStart = 0.42 + clusterIdx * 0.04;
        const clusterT = clamp01((rawBoot - clusterStart) / 0.12);
        if (clusterT <= 0) continue;

        const meta = CATEGORY_META[n.category];
        const dim = isDimmed(n, filter, hover, neighbors);
        const isHover = hover === n.id;
        const isNeighbor = !!hover && neighbors?.has(n.id);

        // Pop-in scale: 0.6 → 1 over clusterT.
        const popScale = 0.6 + 0.4 * clusterT;
        const nodeAlpha = clusterT;

        const fillL = isLight ? 70 : 18;
        const fillSat = isLight ? 60 : 70;
        const fillBase = dim ? 0.22 : isHover ? 0.95 : 0.78;
        const fill = `hsla(${meta.hue}, ${fillSat}%, ${fillL}%, ${(fillBase * nodeAlpha).toFixed(3)})`;
        const ringL = isLight ? 38 : 62;
        const ringBase = dim ? 0.3 : 1;
        const ring = `hsla(${meta.hue}, 80%, ${ringL}%, ${(ringBase * nodeAlpha).toFixed(3)})`;
        const renderR = n.r * popScale;

        // Hex-style outer reticle ring on every node — instrument vibe.
        ctx.lineWidth = 1;
        ctx.strokeStyle = `hsla(${meta.hue}, 60%, ${ringL}%, ${((dim ? 0.18 : 0.35) * nodeAlpha).toFixed(3)})`;
        drawHex(ctx, n.x, n.y, renderR + 6);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(n.x, n.y, renderR, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = isHover ? 2 : isNeighbor ? 1.6 : 1;
        ctx.strokeStyle = ring;
        ctx.stroke();

        if (isHover) {
          // Crosshair brackets around hovered node.
          const b = n.r + 10;
          const seg = 5;
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = `hsla(${meta.hue}, 80%, ${ringL}%, 0.85)`;
          ctx.beginPath();
          // top-left
          ctx.moveTo(n.x - b, n.y - b + seg);
          ctx.lineTo(n.x - b, n.y - b);
          ctx.lineTo(n.x - b + seg, n.y - b);
          // top-right
          ctx.moveTo(n.x + b - seg, n.y - b);
          ctx.lineTo(n.x + b, n.y - b);
          ctx.lineTo(n.x + b, n.y - b + seg);
          // bottom-right
          ctx.moveTo(n.x + b, n.y + b - seg);
          ctx.lineTo(n.x + b, n.y + b);
          ctx.lineTo(n.x + b - seg, n.y + b);
          // bottom-left
          ctx.moveTo(n.x - b + seg, n.y + b);
          ctx.lineTo(n.x - b, n.y + b);
          ctx.lineTo(n.x - b, n.y + b - seg);
          ctx.stroke();
        }

        const fontSize = n.depth >= 4 ? 12 : n.depth === 3 ? 11 : 10;
        ctx.font = `${fontSize}px var(--font-jetbrains-mono), JetBrains Mono, ui-monospace, monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const labelHex = isLight ? "1c,18,8" : "220,232,255";
        const labelA = (dim ? 0.32 : 1) * nodeAlpha;
        ctx.fillStyle = isLight
          ? `rgba(28,18,8,${labelA.toFixed(3)})`
          : `rgba(${labelHex},${labelA.toFixed(3)})`;
        if (n.r >= 26) {
          ctx.fillText(n.label, n.x, n.y);
        } else {
          ctx.fillText(n.label, n.x, n.y - renderR - 8);
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [adjacency, edges, reducedMotion]);

  const visibleCount = activeFilter
    ? nodes.filter((n) => n.category === activeFilter).length
    : nodes.length;

  return (
    <div
      ref={shellRef}
      className="constellation-shell"
      data-instrument="true"
      data-boot-stage={bootStage}
    >
      <div className="instrument-strip" aria-hidden="true">
        <span className="instrument-strip__label">SIGNAL · MAP</span>
        <span className="instrument-strip__divider" />
        <span className="instrument-strip__readout">
          N=<b>{String(visibleCount).padStart(2, "0")}</b>/
          {String(nodes.length).padStart(2, "0")}
        </span>
        <span className="instrument-strip__divider" />
        <span className="instrument-strip__readout">
          BAND=<b>{activeFilter ? CATEGORY_META[activeFilter].code : "ALL"}</b>
        </span>
        <span className="instrument-strip__divider" />
        <span className="instrument-strip__readout instrument-strip__readout--mono">
          TRK <b>{clock}</b>
        </span>
        <span className="instrument-strip__spacer" />
        <span className="instrument-strip__pulse" />
      </div>

      <div
        className="constellation-filters"
        role="group"
        aria-label="Filter by category"
      >
        <button
          type="button"
          className={`constellation-pill${activeFilter === null ? " is-active" : ""}`}
          onClick={() => setActiveFilter(null)}
        >
          <span className="constellation-pill__bracket">[</span>
          <span>ALL</span>
          <span className="constellation-pill__bracket">]</span>
        </button>
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`constellation-pill${activeFilter === cat ? " is-active" : ""}`}
            style={{
              ["--pill-hue" as string]: `${CATEGORY_META[cat].hue}`,
            }}
            onClick={() =>
              setActiveFilter((current) => (current === cat ? null : cat))
            }
          >
            <span className="constellation-pill__bracket">[</span>
            <span>{CATEGORY_META[cat].label.toUpperCase()}</span>
            <span className="constellation-pill__bracket">]</span>
          </button>
        ))}
      </div>

      <div
        ref={wrapperRef}
        className="constellation-canvas-wrap"
        aria-hidden="true"
      >
        <canvas ref={canvasRef} className="constellation-canvas" />

        {/* Viewfinder corner brackets */}
        <span className="instrument-corner instrument-corner--tl" />
        <span className="instrument-corner instrument-corner--tr" />
        <span className="instrument-corner instrument-corner--bl" />
        <span className="instrument-corner instrument-corner--br" />

        {/* Edge coordinate ticks (4 sides, 5 ticks each) */}
        <div className="instrument-ticks instrument-ticks--top">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} data-major={i % 2 === 0} />
          ))}
        </div>
        <div className="instrument-ticks instrument-ticks--bottom">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} data-major={i % 2 === 0} />
          ))}
        </div>
        <div className="instrument-ticks instrument-ticks--left">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} data-major={i % 2 === 0} />
          ))}
        </div>
        <div className="instrument-ticks instrument-ticks--right">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} data-major={i % 2 === 0} />
          ))}
        </div>

        {hoverLabel ? (
          <span className="constellation-hover-label">
            <span className="constellation-hover-label__arrow">▸</span>
            {hoverLabel}
          </span>
        ) : null}
      </div>

      <ul className="sr-only">
        {nodes.map((n) => (
          <li key={n.id}>
            {n.label} — {CATEGORY_META[n.category].label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function clamp01(v: number) {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function drawHex(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function isDimmed(
  n: RuntimeNode,
  filter: SkillCategory | null,
  hover: string | null,
  neighbors: Set<string> | null | undefined,
) {
  if (filter && n.category !== filter) return true;
  if (hover && hover !== n.id && !neighbors?.has(n.id)) return true;
  return false;
}
