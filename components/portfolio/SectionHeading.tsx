type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="mb-10 grid gap-5 border-b border-border/75 pb-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(18rem,1.05fr)] lg:items-end">
      <div className="space-y-3">
        <p className="mono-label text-xs text-[var(--warm-accent)]">{eyebrow}</p>
        <h2 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
          {title}
        </h2>
      </div>
      <p className="max-w-2xl text-sm leading-7 text-muted sm:text-lg">
        {description}
      </p>
    </div>
  );
}
