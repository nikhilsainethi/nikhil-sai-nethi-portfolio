"use client";

type MarqueeProps = {
  items: string[];
  className?: string;
};

export function Marquee({ items, className }: MarqueeProps) {
  const doubled = [...items, ...items];
  return (
    <div className={`marquee-wrap ${className ?? ""}`.trim()} aria-hidden="true">
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center"
            style={{
              gap: 20,
              margin: "0 10px",
              fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            {item}
            <span style={{ color: "var(--cyan)", opacity: 0.4, fontSize: 7 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
