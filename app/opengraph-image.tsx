import { ImageResponse } from "next/og";
import { site } from "@/lib/content";

export const alt = `${site.name} · ${site.role}`;
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
          justifyContent: "center",
          padding: 96,
          background: "#101314",
          color: "#edeedf",
        }}
      >
        <div style={{ fontSize: 26, color: "#d6af80" }}>&gt; kai / portfolio</div>
        <div style={{ fontSize: 132, fontWeight: 600, marginTop: 20, color: "#acc8a3" }}>{site.name}</div>
        <div style={{ fontSize: 26, marginTop: 16, color: "#9fa9a4" }}>{`${site.role} · ${site.location}`}</div>
        <div style={{ fontSize: 40, marginTop: 16, color: "#c8cec9", maxWidth: 900, lineHeight: 1.3 }}>
          {site.tagline}
        </div>
      </div>
    ),
    size,
  );
}
