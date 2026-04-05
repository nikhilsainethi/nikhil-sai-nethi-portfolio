import { ImageResponse } from "next/og";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageContentType = "image/png";

const background = "#f4f5f7";
const foreground = "#15181d";
const muted = "#596272";
const accent = "#c77434";
const border = "rgba(21, 24, 29, 0.12)";
const surface = "#ffffff";
const softSurface = "#eef1f5";

export function createSocialImage(kicker: string) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          position: "relative",
          background,
          color: foreground,
          padding: "54px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "0",
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(244,245,247,1) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "0",
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.66) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.66) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.65,
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            borderRadius: "28px",
            border: `1px solid ${border}`,
            background: "rgba(255,255,255,0.82)",
            padding: "42px",
            boxShadow: "0 24px 60px rgba(17,24,39,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "36px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                maxWidth: "760px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: accent,
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                <div
                  style={{
                    width: "54px",
                    height: "2px",
                    background: accent,
                  }}
                />
                {kicker}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "68px",
                    fontWeight: 700,
                    letterSpacing: "-0.06em",
                    lineHeight: 1,
                  }}
                >
                  Nikhil Sai Nethi
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "28px",
                    color: muted,
                    lineHeight: 1.35,
                  }}
                >
                  Software Engineer | Cloud & Infrastructure | AI/LLM Enthusiast
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                minWidth: "250px",
              }}
            >
              {[
                "Charlotte, NC",
                "Moody's Corporation",
                "Cloud / Observability / RAG",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "56px",
                    borderRadius: "18px",
                    border: `1px solid ${border}`,
                    background: softSurface,
                    fontSize: "18px",
                    fontWeight: 500,
                    color: foreground,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                maxWidth: "770px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "17px",
                  fontWeight: 700,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: muted,
                }}
              >
                Engineering Precision
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "24px",
                  color: foreground,
                  lineHeight: 1.45,
                }}
              >
                Building resilient systems, observability workflows, and practical
                AI tooling for engineering teams.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                color: accent,
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "999px",
                  background: accent,
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                nikhilsainethi.github.io
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  );
}
