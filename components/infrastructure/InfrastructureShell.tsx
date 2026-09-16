"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useScroll,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { resumePath, withBasePath } from "@/lib/site";
import { themeStorageKey } from "@/lib/theme";

const MotionSettings = createContext(true);
export const useInfrastructureMotion = () => useContext(MotionSettings);

function subscribeToReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const getReducedMotionSnapshot = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerReducedMotionSnapshot = () => false;
export function useSystemReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
}

export function CubeMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 36"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 2 30 10v16l-14 8L2 26V10L16 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m2 10 14 8 14-8M16 18v16M9 6l14 8v8l-7 4-7-4V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const links = [
  { id: "work", label: "Experience" },
  { id: "infrastructure-story", label: "Infrastructure" },
  { id: "observability-lab", label: "Signal lab" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export function InfrastructureShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [motionOn, setMotionOn] = useState(true);
  const [active, setActive] = useState("");
  const prefersReduced = useSystemReducedMotion();
  const motionEnabled = motionOn && !prefersReduced;
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    document.documentElement.dataset.motion = motionEnabled ? "on" : "off";
  }, [motionEnabled]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("section[id]")
      .forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [menuOpen]);

  function toggleTheme() {
    const next =
      document.documentElement.dataset.mode === "light" ? "dark" : "light";
    document.documentElement.dataset.mode = next;
    try {
      localStorage.setItem(themeStorageKey, next);
    } catch {
      /* The theme still works without storage. */
    }
  }

  return (
    <MotionSettings.Provider value={motionEnabled}>
      <MotionConfig
        reducedMotion={motionEnabled ? "user" : "always"}
        transition={{
          duration: motionEnabled ? 0.32 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <a className="infra-skip" href="#main">
          Skip to content
        </a>
        <header className="infra-header">
          {motionEnabled && (
            <motion.div
              className="infra-scroll-meter"
              style={{ scaleX: scrollYProgress }}
              aria-hidden="true"
            />
          )}
          <a
            href={withBasePath("/")}
            className="infra-brand"
            aria-label="Nikhil Sai Nethi home"
          >
            <CubeMark />
            <span>
              NIKHIL SAI NETHI
              <span className="infra-brand-sub">PLATFORM INFRASTRUCTURE</span>
            </span>
          </a>
          <nav className="infra-desktop-nav" aria-label="Primary navigation">
            {links.map((link) => (
              <a
                key={link.id}
                href={withBasePath(`/#${link.id}`)}
                aria-current={active === link.id ? "location" : undefined}
              >
                {active === link.id && (
                  <motion.span
                    className="infra-nav-indicator"
                    layoutId="nav-indicator"
                  />
                )}
                <span>{link.label}</span>
              </a>
            ))}
          </nav>
          <div className="infra-header-actions">
            <button
              className="infra-icon-button infra-motion-header"
              onClick={() => setMotionOn(!motionOn)}
              disabled={prefersReduced}
              aria-label={
                prefersReduced
                  ? "Reduced motion enabled by system"
                  : motionEnabled
                    ? "Pause animations"
                    : "Enable animations"
              }
              title={
                prefersReduced
                  ? "Your device prefers reduced motion"
                  : motionEnabled
                    ? "Pause animations"
                    : "Enable animations"
              }
            >
              <span aria-hidden="true">{motionEnabled ? "Ⅱ" : "▷"}</span>
            </button>
            <button
              className="infra-icon-button infra-theme"
              onClick={toggleTheme}
              aria-label="Toggle light and dark theme"
              title="Toggle colour theme"
            >
              <span className="theme-sun" aria-hidden="true">
                ☀
              </span>
              <span className="theme-moon" aria-hidden="true">
                ☾
              </span>
            </button>
            <a
              href={resumePath}
              target="_blank"
              rel="noreferrer"
              className="infra-resume"
            >
              Résumé <span aria-hidden="true">↗</span>
            </a>
            <button
              ref={menuButton}
              className={`infra-menu-toggle ${menuOpen ? "is-open" : ""}`}
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
            </button>
          </div>
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                className="infra-mobile-nav"
                id="mobile-navigation"
                aria-label="Mobile navigation"
                initial={
                  motionEnabled ? { opacity: 0, y: -8, scale: 0.98 } : false
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {links.map((link, index) => (
                  <a
                    key={link.id}
                    href={withBasePath(`/#${link.id}`)}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="infra-mono">0{index + 1}</span>
                    {link.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>
        </header>
        <noscript>
          <style>{`main [style*="opacity:0"], main [style*="opacity: 0"], main svg [opacity="0"] { opacity:1 !important; }
          .infra-menu-toggle,.infra-theme,.infra-motion-toggle,.infra-motion-header { display:none !important; }
          .infra-project-open { display:none; }`}</style>
          <nav
            className="infra-static-nav infra-wrap"
            aria-label="Navigation without JavaScript"
          >
            {links.map((link) => (
              <a key={link.id} href={withBasePath(`/#${link.id}`)}>
                {link.label}
              </a>
            ))}
          </nav>
          <p className="infra-static-note infra-wrap">
            You’re viewing the static portfolio. Enable JavaScript to explore
            the interactive infrastructure and monitoring demos.
          </p>
        </noscript>
        {children}
        <footer className="infra-footer infra-wrap">
          <a className="infra-footer-mark" href={withBasePath("/")}>
            <CubeMark /> Nikhil Sai Nethi
          </a>
          <span>Thoughtfully built. Always evolving.</span>
          <button
            className="infra-motion-toggle"
            onClick={() => setMotionOn(!motionOn)}
            aria-pressed={motionEnabled}
            disabled={Boolean(prefersReduced)}
            title={
              prefersReduced
                ? "Your device prefers reduced motion"
                : "Toggle interface motion"
            }
          >
            <span
              className={motionEnabled ? "infra-dot" : "infra-dot is-paused"}
            />
            {prefersReduced
              ? "Reduced motion · system"
              : `Motion ${motionOn ? "on" : "off"}`}
          </button>
          <a href="#main" className="infra-top">
            Back to top ↑
          </a>
        </footer>
      </MotionConfig>
    </MotionSettings.Provider>
  );
}
