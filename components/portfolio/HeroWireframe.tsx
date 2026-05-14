"use client";

/**
 * Schematic wireframe of the hero card content. Used as the post-scan
 * representation during the hero → operator-badge transition. Mirrors the
 * spatial layout of the real card so the cross-fade reads as the same artefact
 * being decompiled into a blueprint.
 */
export function HeroWireframe() {
  return (
    <div className="hero-wireframe" aria-hidden="true">
      <div className="hero-wireframe__inner">
        {/* LEFT: photo silhouette */}
        <div className="hero-wireframe__left">
          <div className="hero-wireframe__viewport">
            <span className="hero-wireframe__corner hero-wireframe__corner--tl" />
            <span className="hero-wireframe__corner hero-wireframe__corner--tr" />
            <span className="hero-wireframe__corner hero-wireframe__corner--bl" />
            <span className="hero-wireframe__corner hero-wireframe__corner--br" />
            <svg
              className="hero-wireframe__silhouette"
              viewBox="0 0 200 240"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* head */}
              <circle cx="100" cy="80" r="38" />
              {/* shoulders */}
              <path d="M 28 240 L 28 200 Q 28 170 60 158 L 78 152 L 100 168 L 122 152 L 140 158 Q 172 170 172 200 L 172 240" />
              {/* reticle crosshair */}
              <line x1="100" y1="40" x2="100" y2="50" />
              <line x1="100" y1="110" x2="100" y2="120" />
              <line x1="60" y1="80" x2="70" y2="80" />
              <line x1="130" y1="80" x2="140" y2="80" />
            </svg>

            <div className="hero-wireframe__chips">
              {["CURRENT", "LOCATION", "FOCUS"].map((label) => (
                <div className="hero-wireframe__chip" key={label}>
                  <span className="hero-wireframe__chip-tick" />
                  <span className="hero-wireframe__chip-label">{label}</span>
                  <span className="hero-wireframe__chip-bar" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: text panel */}
        <div className="hero-wireframe__right">
          <div className="hero-wireframe__brand-row">
            <span className="hero-wireframe__brand-pill">SE</span>
            <span className="hero-wireframe__brand-pill">OPEN-OPP</span>
            <span className="hero-wireframe__brand-pill">OPEN-REL</span>
          </div>

          <div className="hero-wireframe__name">
            <span className="hero-wireframe__name-bracket">[</span>
            <span className="hero-wireframe__name-letters">NSN</span>
            <span className="hero-wireframe__name-bracket">]</span>
            <span className="hero-wireframe__name-caret">_</span>
          </div>

          <div className="hero-wireframe__role">
            <span className="hero-wireframe__role-prefix">BUILD =</span>
            <span className="hero-wireframe__role-bar" />
          </div>

          <div className="hero-wireframe__lines">
            <span className="hero-wireframe__line hero-wireframe__line--90" />
            <span className="hero-wireframe__line hero-wireframe__line--75" />
            <span className="hero-wireframe__line hero-wireframe__line--60" />
          </div>

          <div className="hero-wireframe__buttons">
            <span className="hero-wireframe__btn hero-wireframe__btn--primary">
              ▶ RUN
            </span>
            <span className="hero-wireframe__btn">↗ DOC</span>
          </div>
        </div>

        {/* watermark mono numeral, mirrors the original "01" */}
        <span className="hero-wireframe__watermark">01</span>
      </div>
    </div>
  );
}
