type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  index?: string; // e.g. "01", "02"
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  index,
}: SectionHeadingProps) {
  return (
    <div className="mb-8 grid gap-4 border-b border-border/75 pb-6 sm:mb-10 sm:gap-5 sm:pb-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(18rem,1.05fr)] lg:items-end">
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center gap-4">
          {index && (
            <span className="font-mono text-[11px] tracking-[0.22em] text-foreground/28 select-none">
              {index}
            </span>
          )}
          <p className="mono-label text-xs text-[var(--warm-accent)]">{eyebrow}</p>
        </div>
        <h2 className="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
          {title}
        </h2>
      </div>
      <p className="max-w-2xl text-sm leading-7 text-muted sm:text-lg">
        {description}
      </p>
    </div>
  );
}
