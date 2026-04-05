const navItems = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#tech-stack", label: "Tech Stack" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[color:color-mix(in_srgb,var(--background)_82%,transparent)]/95 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <a
            className="mono-label text-sm text-foreground hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            href="#about"
          >
            Nikhil Sai Nethi
          </a>
          <a
            className="hidden text-sm font-medium text-muted hover:text-accent md:inline-flex"
            href="mailto:nikhilsainethi@gmail.com"
          >
            nikhilsainethi@gmail.com
          </a>
        </div>

        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted sm:gap-x-7 sm:text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  className="link-underline whitespace-nowrap font-medium hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  href={item.href}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
