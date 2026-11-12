import { ImageResponse } from "next/og";

export const socialImageSize = { width: 1200, height: 630 };
export const socialImageContentType = "image/png";

const background = "#0a1013";
const foreground = "#ecf0e9";
const muted = "#a0afb3";
const accent = "#d7f99a";
const cyan = "#70c9c6";
const border = "#2a373c";
const surface = "#10191d";

function HardwareModel() {
  return (
    <svg width="390" height="340" viewBox="0 0 390 340" fill="none">
      <path
        d="M16 299H374M16 267H374M16 235H374M16 203H374M16 171H374M16 139H374M16 107H374M16 75H374"
        stroke={border}
        strokeOpacity="0.3"
      />
      <path
        d="M38 28V316M90 28V316M142 28V316M194 28V316M246 28V316M298 28V316M350 28V316"
        stroke={border}
        strokeOpacity="0.3"
      />
      {[28, 147, 266].map((x, rack) => (
        <g key={x}>
          <rect
            x={x}
            y="60"
            width="96"
            height="200"
            rx="6"
            fill={surface}
            stroke={rack === 1 ? accent : border}
            strokeWidth="1.5"
          />
          <rect x={x + 10} y="72" width="76" height="8" rx="2" fill={border} />
          {[91, 122, 153, 184, 215].map((y, unit) => (
            <g key={y}>
              <rect
                x={x + 10}
                y={y}
                width="76"
                height="24"
                rx="3"
                fill={rack === 1 && unit === 2 ? "#23342c" : "#152125"}
                stroke={rack === 1 && unit === 2 ? accent : border}
              />
              <path
                d={`M${x + 20} ${y + 8}h26M${x + 20} ${y + 15}h18`}
                stroke={muted}
                strokeOpacity="0.5"
              />
              <circle
                cx={x + 73}
                cy={y + 12}
                r="2.5"
                fill={rack === 1 ? accent : cyan}
              />
            </g>
          ))}
          <path
            d={`M${x + 48} 260v26`}
            stroke={rack === 1 ? accent : cyan}
            strokeWidth="1.5"
          />
        </g>
      ))}
      <path d="M76 286H314M195 286V309" stroke={cyan} strokeWidth="1.5" />
      {[76, 195, 314].map((x) => (
        <circle
          key={x}
          cx={x}
          cy="286"
          r="4"
          fill={background}
          stroke={cyan}
          strokeWidth="1.5"
        />
      ))}
      <rect
        x="165"
        y="308"
        width="60"
        height="21"
        rx="4"
        fill="#23342c"
        stroke={accent}
      />
      <path d="M184 318h22" stroke={accent} strokeWidth="2" />
    </svg>
  );
}

export function createSocialImage(kicker: string) {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        background,
        color: foreground,
        padding: "46px 56px 40px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "25px",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: accent,
            fontSize: 16,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: accent,
            }}
          />
          {kicker}
        </div>
        <div
          style={{
            display: "flex",
            color: muted,
            fontSize: 16,
            letterSpacing: "0.08em",
          }}
        >
          NIKHIL SAI NETHI
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          gap: "26px",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", width: "648px" }}
        >
          <div
            style={{
              display: "flex",
              color: cyan,
              fontSize: 17,
              letterSpacing: "0.12em",
              marginBottom: "22px",
            }}
          >
            PLATFORM INFRASTRUCTURE AT GOOGLE
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 67,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: "-0.055em",
            }}
          >
            <span>Platform</span>
            <span style={{ color: accent }}>Infrastructure</span>
            <span>Engineer.</span>
          </div>
          <div
            style={{
              display: "flex",
              color: muted,
              fontSize: 22,
              lineHeight: 1.5,
              maxWidth: "600px",
              marginTop: "24px",
            }}
          >
            Observability and monitoring for complex systems. Production
            signals. Practical experience.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "390px",
            alignItems: "center",
          }}
        >
          <HardwareModel />
          <div
            style={{
              display: "flex",
              color: cyan,
              fontSize: 13,
              letterSpacing: "0.12em",
              marginTop: "12px",
            }}
          >
            INFRASTRUCTURE → SIGNALS → INSIGHT
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "22px",
          borderTop: `1px solid ${border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            color: muted,
            fontSize: 14,
            letterSpacing: "0.1em",
          }}
        >
          OBSERVABILITY / MONITORING / PLATFORM INFRASTRUCTURE
        </div>
        <div style={{ display: "flex", color: accent, fontSize: 17 }}>
          nikhilsainethi.github.io
        </div>
      </div>
    </div>,
    socialImageSize,
  );
}
