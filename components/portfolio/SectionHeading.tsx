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
    <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <p className="mono-label text-xs text-accent">{eyebrow}</p>
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
          {title}
        </h2>
      </div>
      <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
        {description}
      </p>
    </div>
  );
}
