"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaBarsStaggered, FaXmark } from "react-icons/fa6";
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 pt-4 sm:pt-6">
      <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-white/70 bg-white/60 px-4 py-3 shadow-[0_18px_40px_rgba(73,92,136,0.12)] backdrop-blur-xl sm:px-6 lg:rounded-full">
        <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-5">
          <div className="flex items-center justify-between gap-4 lg:justify-start">
            <Link
              className="mono-label text-sm text-foreground transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              href="/"
              onClick={() => setMenuOpen(false)}
            >
              Nikhil Sai Nethi
            </Link>

            <button
              aria-controls="site-nav-panel"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/72 text-foreground shadow-[0_12px_28px_rgba(73,92,136,0.12)] transition-all hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
              onClick={() => setMenuOpen((value) => !value)}
              type="button"
            >
              {menuOpen ? <FaXmark size={18} /> : <FaBarsStaggered size={16} />}
            </button>
          </div>

          <div
            className={`${menuOpen ? "block" : "hidden"} lg:contents`}
            data-open={menuOpen ? "true" : "false"}
            data-testid="mobile-nav-panel"
            id="site-nav-panel"
          >
            <div className="min-h-0 overflow-hidden lg:contents">
              <nav aria-label="Primary" className="overflow-hidden pt-1 lg:min-w-0 lg:pt-0">
                <ul className="flex flex-col gap-2 rounded-[1.6rem] bg-white/60 p-2 text-sm text-muted shadow-[inset_0_0_0_1px_rgba(109,130,170,0.12)] sm:flex-row sm:flex-wrap sm:justify-center lg:justify-center lg:rounded-full lg:bg-white/55 lg:px-2 lg:py-1">
                  {primaryNavItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <li key={item.href}>
                        <Link
                          aria-current={isActive ? "page" : undefined}
                          className={`inline-flex w-full justify-center rounded-full px-4 py-2 font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto ${
                            isActive
                              ? "bg-accent-soft text-accent shadow-[0_10px_20px_rgba(108,99,255,0.14)]"
                              : "text-muted hover:text-foreground"
                          }`}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="pt-2 lg:flex lg:justify-end lg:pt-0">
                <a
                  className="inline-flex w-full items-center justify-center rounded-full bg-[var(--warm-accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,138,61,0.26)] transition-all hover:bg-[var(--warm-accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--warm-accent)] sm:px-5 lg:w-auto"
                  href={resumePath}
                  onClick={() => setMenuOpen(false)}
                >
                  Download Resume
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
