export function SiteFooter() {
  return (
    <footer
      className="above mx-auto flex flex-wrap items-center justify-between"
      style={{
        maxWidth: 1200,
        padding: "24px 32px",
        gap: 8,
        borderTop: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--bg) 70%, transparent)",
        backdropFilter: "blur(4px)",
      }}
    >
      <span className="mono-label">
        Nikhil Sai Nethi · {new Date().getFullYear()}
      </span>
      <span className="mono-label">
        Charlotte, NC · Platform Engineering
      </span>
    </footer>
  );
}
