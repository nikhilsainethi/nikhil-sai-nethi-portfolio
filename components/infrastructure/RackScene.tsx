"use client";

import { useId, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./RackScene.module.css";

type RackId = "accelerator" | "arm" | "x86";

interface RackSceneProps {
  selected: RackId;
  onSelect: (id: RackId) => void;
  motionEnabled: boolean;
}

const racks: Array<{
  id: RackId;
  label: string;
  code: string;
  x: number;
  y: number;
  height: number;
  slots: number;
}> = [
  { id: "x86", label: "GENERAL COMPUTE", code: "X86 / 01", x: 74, y: 142, height: 195, slots: 6 },
  { id: "accelerator", label: "ACCELERATOR", code: "ACC / 02", x: 247, y: 118, height: 293, slots: 7 },
  { id: "arm", label: "ARM COMPUTE", code: "ARM / 03", x: 420, y: 279, height: 207, slots: 8 },
];

/** An original architectural illustration. The racks are synthetic, selectable models. */
export function RackScene({ selected, onSelect, motionEnabled }: RackSceneProps) {
  const reducedMotion = useReducedMotion();
  const animated = motionEnabled && !reducedMotion;
  const uniqueId = useId().replace(/:/g, "");
  const id = (name: string) => `${uniqueId}-${name}`;

  function activate(event: KeyboardEvent<SVGGElement>, rack: RackId) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(rack);
    }
  }

  return (
    <div className={styles.scene} data-motion={animated ? "on" : "off"}>
      <svg
        className={styles.svg}
        viewBox="0 0 720 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="group"
        aria-label="Interactive data centre. Select a synthetic rack to explore its machine model."
      >
        <defs>
          <linearGradient id={id("front")} x1="0" y1="0" x2="115" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#263638" />
            <stop offset="1" stopColor="#142025" />
          </linearGradient>
          <linearGradient id={id("side")} x1="102" y1="40" x2="168" y2="270" gradientUnits="userSpaceOnUse">
            <stop stopColor="#15252B" />
            <stop offset="1" stopColor="#0A131B" />
          </linearGradient>
          <linearGradient id={id("roof")} x1="0" y1="0" x2="165" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#435555" />
            <stop offset="1" stopColor="#27393E" />
          </linearGradient>
          <linearGradient id={id("blade")} x1="0" y1="0" x2="90" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#344549" />
            <stop offset="1" stopColor="#202D33" />
          </linearGradient>
          <linearGradient id={id("floor")} x1="240" y1="231" x2="496" y2="559" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--infra-cyan, #80CCD2)" stopOpacity="0.05" />
            <stop offset="1" stopColor="var(--infra-cyan, #80CCD2)" stopOpacity="0.015" />
          </linearGradient>
          <radialGradient id={id("pool")}>
            <stop stopColor="var(--infra-accent, #D0F266)" stopOpacity="0.11" />
            <stop offset="1" stopColor="var(--infra-accent, #D0F266)" stopOpacity="0" />
          </radialGradient>
          <clipPath id={id("floor-clip")}>
            <path d="M 19 348 L 236 220 L 698 438 L 481 566 Z" />
          </clipPath>
        </defs>

        {/* An engineering drawing grid becomes the physical ground plane. */}
        <g aria-hidden="true">
          <path d="M19 348 236 220 698 438 481 566Z" fill={`url(#${id("floor")})`} />
          <g clipPath={`url(#${id("floor-clip")})`} className={styles.floorGrid}>
            {Array.from({ length: 19 }, (_, index) => (
              <path key={`a-${index}`} d={`M ${-110 + index * 39} 205 l 755 357`} />
            ))}
            {Array.from({ length: 22 }, (_, index) => (
              <path key={`b-${index}`} d={`M ${-150 + index * 39} 630 l 730 -431`} />
            ))}
          </g>
          <path className={styles.floorEdge} d="M19 348 481 566 698 438" />
          <ellipse cx="363" cy="424" rx="246" ry="122" fill={`url(#${id("pool")})`} />
          <path className={styles.floorRail} d="M76 361 499 561M119 336 543 536" />

          {/* These are illustrative model relationships, not live network traffic. */}
          <motion.path
            className={styles.connection}
            d="M158 374 122 395 355 505 402 478M355 505 498 572 560 536"
            initial={animated ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: animated ? 1.5 : 0, delay: animated ? 0.45 : 0 }}
          />
          <path className={styles.connectionSecondary} d="M144 382 101 407 333 517 380 490M333 517 477 584" />
          {[[122, 395], [355, 505], [560, 536]].map(([x, y], index) => (
            <g key={index} transform={`translate(${x} ${y})`}>
              <path d="m0-5 8 4-8 5-8-5Z" className={styles.floorNode} />
              <circle r="1.5" fill="var(--infra-cyan, #80CCD2)" />
            </g>
          ))}
          <text x="60" y="442" transform="rotate(25.25 60 442)" className={styles.floorLabel}>MODEL RELATIONSHIPS</text>
          <path className={styles.dimensionLine} d="M622 333 622 441 651 455M617 333h10M617 441h10" />
          <text x="642" y="330" className={styles.annotation}>HARDWARE</text>
          <text x="642" y="343" className={styles.annotation}>AS A MODEL</text>
        </g>

        {racks.map((rack, index) => {
          const isSelected = selected === rack.id;
          const slotHeight = (rack.height - 66) / rack.slots;
          const roof = "0,0 65,-38 167,10 102,48";
          const front = `0,0 102,48 102,${rack.height + 48} 0,${rack.height}`;
          const side = `102,48 167,10 167,${rack.height + 10} 102,${rack.height + 48}`;

          return (
            <g key={rack.id} transform={`translate(${rack.x} ${rack.y})`}>
              <path
                d={`M-5 ${rack.height + 8} 99 ${rack.height + 58} 176 ${rack.height + 13} 73 ${rack.height - 35}Z`}
                fill="#03090E"
                opacity={isSelected ? 0.32 : 0.2}
                aria-hidden="true"
              />
              <motion.g
                className={styles.rack}
                data-selected={isSelected ? "true" : "false"}
                role="button"
                tabIndex={0}
                aria-label={`Select ${rack.id === "x86" ? "x86" : rack.id} rack`}
                aria-pressed={isSelected}
                onClick={() => onSelect(rack.id)}
                onKeyDown={(event) => activate(event, rack.id)}
                initial={animated ? { opacity: 0, y: 34 } : false}
                animate={{ opacity: 1, y: animated && isSelected ? -12 : 0 }}
                whileHover={animated ? { y: isSelected ? -16 : -5 } : undefined}
                transition={animated ? { type: "spring", stiffness: 135, damping: 22, delay: index * 0.07 } : { duration: 0 }}
              >
                <title>{rack.label.toLowerCase()} — select to inspect the synthetic model</title>
                <path
                  className={styles.focusOutline}
                  d={`M-7 -4 65 -46 174 6 174 ${rack.height + 15} 102 ${rack.height + 57} -7 ${rack.height + 6}Z`}
                />
                {/* Cabinet enclosure. Front panels use the same isometric projection. */}
                <polygon points={side} fill={`url(#${id("side")})`} stroke="#4A6065" strokeWidth="0.8" />
                <polygon points={front} fill={`url(#${id("front")})`} stroke="#4A6065" strokeWidth="0.8" />
                <polygon points={roof} fill={`url(#${id("roof")})`} stroke="#748789" strokeWidth="0.8" />
                <path d="M10 0 66-32 157 10 102 42Z" fill="#213138" stroke="#586B6F" strokeWidth="0.6" />
                {Array.from({ length: 8 }, (_, vent) => (
                  <path key={vent} d={`M${29 + vent * 9} ${-1 + vent * 4.23} l 32 -18.6`} stroke="#0B171D" strokeWidth="2.1" />
                ))}
                <path d={`M102 51v${rack.height - 7}`} className={styles.cornerLight} />
                <path d={`M164 14v${rack.height - 9}`} stroke="#4A6267" strokeWidth="1" />

                <g transform="matrix(1 0.470588 0 1 0 0)" aria-hidden="true">
                  <rect x="5" y="8" width="91" height={rack.height - 15} rx="1" fill="#0B171C" />
                  <rect x="9" y="13" width="83" height="22" rx="1" fill="#263B3F" />
                  <rect x="13" y="18" width="2.3" height="11" rx="0.8" className={styles.indicator} />
                  <text x="20" y="23" className={styles.rackName}>{rack.label}</text>
                  <text x="20" y="30" className={styles.rackSerial}>{rack.code} · SYNTHETIC</text>

                  {Array.from({ length: rack.slots }, (_, slot) => {
                    const y = 42 + slot * slotHeight;
                    return (
                      <g key={slot}>
                        <rect x="9" y={y} width="83" height={slotHeight - 3} rx="1" fill={`url(#${id("blade")})`} stroke="#5B7072" strokeOpacity="0.6" strokeWidth="0.5" />
                        <rect x="12" y={y + 4} width="3" height={Math.max(4, slotHeight - 11)} rx="1" fill="#0D1B20" stroke="#697E80" strokeWidth="0.5" />
                        <rect x="85" y={y + 4} width="3" height={Math.max(4, slotHeight - 11)} rx="1" fill="#0D1B20" stroke="#697E80" strokeWidth="0.5" />
                        {Array.from({ length: rack.id === "accelerator" ? 4 : 7 }, (_, vent) => (
                          <g key={vent}>
                            <rect x={21 + vent * (rack.id === "accelerator" ? 13 : 6.5)} y={y + 5} width={rack.id === "accelerator" ? 9 : 3} height={Math.max(2, slotHeight - 13)} rx="0.65" fill="#0B181F" />
                            {rack.id === "accelerator" && <path d={`M${23 + vent * 13} ${y + 7}v${Math.max(2, slotHeight - 17)}m3 0v-${Math.max(2, slotHeight - 17)}`} stroke="#43565D" strokeWidth="0.7" />}
                          </g>
                        ))}
                        <rect x="76" y={y + 5} width="3" height="2" rx="0.5" className={styles.indicator} opacity={slot % 3 === 0 ? 0.55 : 1} />
                        <rect x="76" y={y + 10} width="3" height="1.5" rx="0.5" fill="#7CCCD2" opacity="0.65" />
                      </g>
                    );
                  })}
                  <rect x="9" y={rack.height - 20} width="83" height="10" fill="#233438" />
                  {[0, 1, 2].map((supply) => <rect key={supply} x={13 + supply * 25} y={rack.height - 17} width="21" height="4" rx="0.5" fill="#0A161D" stroke="#567176" strokeWidth="0.5" />)}
                  {[16, rack.height - 18].map((y) => <g key={y}><circle cx="3" cy={y} r="1" fill="#819091" /><circle cx="98" cy={y} r="1" fill="#819091" /></g>)}
                </g>

                {/* Side-panel perforations and service-panel seam. */}
                <g transform="matrix(1 -0.584615 0 1 105 50)" aria-hidden="true">
                  <path d={`M8 9h43v${rack.height - 31}H8Z`} stroke="#345056" strokeWidth="0.7" />
                  {Array.from({ length: 10 }, (_, vent) => (
                    <path key={vent} d={`M15 ${rack.height - 75 + vent * 4}h29`} stroke="#476269" strokeWidth="1" opacity="0.5" />
                  ))}
                  <rect x="37" y="29" width="5" height="15" rx="1" fill="#0A171D" stroke="#486068" strokeWidth="0.6" />
                  <text x="16" y="45" className={styles.sideCode}>N / {String(index + 1).padStart(2, "0")}</text>
                </g>

                <g aria-hidden="true" className={styles.rackTag}>
                  <path d="M66-44v-21h47" className={styles.tagLine} />
                  <circle cx="66" cy="-44" r="2" className={styles.tagDot} />
                  <text x="119" y="-62" className={styles.tagCode}>{rack.code}</text>
                  {isSelected && (
                    <g>
                      <path d="m119-52 3 3 5-6" className={styles.selectedCheck} />
                      <text x="132" y="-48" className={styles.selectedText}>SELECTED</text>
                    </g>
                  )}
                </g>
              </motion.g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default RackScene;
