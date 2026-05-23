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
            "radial-gradient(1000px 500px at 30% 0%, #15182b, #06070d 60%)",
          color: "#f5f7fb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#34e0a1",
            }}
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#9aa3b8",
            }}
          >
            krishant.org
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -3 }}>
            {site.fullName}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 36,
              lineHeight: 1.3,
              color: "#9aa3b8",
              maxWidth: 900,
            }}
          >
            Building at the edge of software, AI, cloud, and digital systems.
          </div>
        </div>

        <div style={{ display: "flex", gap: 40, fontSize: 24, color: "#5b6275" }}>
          <span>Ventures</span>
          <span>Credentials</span>
          <span>Software · AI · Cloud · Creator infrastructure</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
