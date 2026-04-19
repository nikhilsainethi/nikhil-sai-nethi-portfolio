"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { basePath, primaryNavItems, resumePath } from "@/lib/site";

const SECTION_IDS = ["hero", ...primaryNavItems.map((item) => item.id)];

function normalizePathname(pathname: string | null) {
  if (!pathname) return "/";
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
  const isHome = pathname === "/";
  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    if (!isHome) return;
    const update = () => {
      for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(SECTION_IDS[i]);
          return;
        }
      }
      setActive("hero");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  const onNavClick = useCallback(
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!isHome) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: "smooth" });
      history.replaceState(null, "", `#${id}`);
    },
    [isHome],
  );

  return (
    <nav
      aria-label="Primary"
      className="fixed left-0 right-0 top-0 flex items-center justify-center px-6 py-3.5"
      style={{ zIndex: 200 }}
    >
      <div className="nav-pill flex-wrap">
        {primaryNavItems.map((item) => {
          const isActive = isHome && active === item.id;
          return (
            <Link
              key={item.id}
              href={item.route}
              onClick={onNavClick(item.id)}
              className={`nav-link${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "location" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
        <a
          className="nav-cta"
          href={resumePath}
          target="_blank"
          rel="noreferrer"
        >
          Resume <FaArrowUpRightFromSquare size={10} aria-hidden="true" />
        </a>
      </div>
    </nav>
  );
}
