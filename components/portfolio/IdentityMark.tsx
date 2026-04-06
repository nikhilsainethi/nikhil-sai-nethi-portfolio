import Image from "next/image";
import { withBasePath } from "@/lib/site";

type IdentityMarkProps = {
  label: string;
  mark: string;
  logoPath?: `/${string}`;
  className?: string;
  imageClassName?: string;
};

export function IdentityMark({
  label,
  mark,
  logoPath,
  className = "",
  imageClassName = "",
}: IdentityMarkProps) {
  const tileClassName = `flex shrink-0 items-center justify-center overflow-hidden rounded-[0.9rem] border border-border bg-white shadow-sm ${className}`.trim();

  if (logoPath) {
    return (
      <span className={tileClassName}>
        <Image
          alt={`${label} logo`}
          className={`h-full w-full object-contain ${imageClassName}`.trim()}
          height={120}
          src={withBasePath(logoPath)}
          unoptimized
          width={200}
        />
      </span>
    );
  }

  return (
    <span
      aria-label={`${label} mark`}
      className={`${tileClassName} font-mono text-sm font-semibold tracking-[0.18em] text-accent`.trim()}
    >
      {mark}
    </span>
  );
}
