"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { basePath, primaryNavItems, resumePath } from "@/lib/site";

function normalizePathname(pathname: string | null) {
  if (!pathname) {
    return "/";
  }

  const normalized =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  if (normalized.startsWith(basePath)) {
    const stripped = normalized.slice(basePath.length);
    return stripped.length > 0 ? stripped : "/";
  }

  return normalized;
}

export function Header() {
  const pathname = normalizePathname(usePathname());

  return (
    <header className="sticky top-0 z-50 pt-4 sm:pt-6">
      <div className="mx-auto grid w-full max-w-6xl gap-3 rounded-[2rem] border border-white/70 bg-white/60 px-4 py-3 shadow-[0_18px_40px_rgba(73,92,136,0.12)] backdrop-blur-xl sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-5 lg:rounded-full">
        <div className="flex items-center justify-between gap-4 lg:justify-start">
          <Link
            className="mono-label text-sm text-foreground transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            href="/"
          >
            Nikhil Sai Nethi
          </Link>
        </div>

        <nav aria-label="Primary" className="overflow-hidden">
          <ul className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/55 px-2 py-1 text-sm text-muted shadow-[inset_0_0_0_1px_rgba(109,130,170,0.12)] lg:justify-center">
            {primaryNavItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex rounded-full px-4 py-2 font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      isActive
                        ? "bg-accent-soft text-accent shadow-[0_10px_20px_rgba(108,99,255,0.14)]"
                        : "text-muted hover:text-foreground"
                    }`}
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex justify-end">
          <a
            className="inline-flex items-center justify-center rounded-full bg-[var(--warm-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,138,61,0.26)] transition-all hover:bg-[var(--warm-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--warm-accent)] sm:px-5"
            href={resumePath}
          >
            Download Resume
          </a>
        </div>
      </div>
    </header>
  );
}
