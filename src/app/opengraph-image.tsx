import { ImageResponse } from "next/og";
import { site } from "@/content/site";

// Open Graph image so a forwarded krishant.org link previews well. Uses the
// edge runtime — the standard, well-supported path for next/og on Vercel.
export const runtime = "edge";
export const alt = site.meta.ogImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(1000px 520px at 28% 0%, #2c1812, #14100c 62%)",
          color: "#f3ead9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#ffb454",
            }}
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#b8a994",
            }}
          >
            krishant.org
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 44, color: "#ffc06a", marginBottom: 8 }}>
            Hey, I&apos;m
          </div>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -3 }}>
            {site.fullName}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 32,
              lineHeight: 1.3,
              color: "#b8a994",
              maxWidth: 920,
            }}
          >
            {site.hero.subline}
          </div>
        </div>

        <div style={{ display: "flex", gap: 40, fontSize: 24, color: "#847665" }}>
          <span>Surya</span>
          <span>How I build</span>
          <span>{site.location}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
