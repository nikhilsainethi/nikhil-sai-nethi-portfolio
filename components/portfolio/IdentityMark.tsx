type IdentityMarkProps = {
  label: string;
  mark: string;
  className?: string;
};

export function IdentityMark({
  label,
  mark,
  className = "",
}: IdentityMarkProps) {
  return (
    <span
      aria-label={`${label} mark`}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[0.9rem] border border-border bg-white font-mono text-sm font-semibold tracking-[0.18em] text-accent shadow-sm ${className}`.trim()}
    >
      {mark}
    </span>
  );
}
