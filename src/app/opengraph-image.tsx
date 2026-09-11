import { ImageResponse } from "next/og";

export const alt = "Afghan Hub — community, opportunities, organizations, businesses, and events";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f7f5ef",
        color: "#243236",
        padding: "72px 80px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.18em", color: "#2f666f" }}>AFGHAN HUB</div>
        <div style={{ fontSize: 22, color: "#667579" }}>app.apnbc.ca</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
        <div style={{ fontSize: 70, lineHeight: 1.05, fontWeight: 750, letterSpacing: "-0.035em" }}>Rooted in community.</div>
        <div style={{ marginTop: 26, fontSize: 32, lineHeight: 1.35, color: "#55666a" }}>
          Connect with Afghan people, organizations, businesses, opportunities, and events.
        </div>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {["People", "Organizations", "Opportunities", "Events"].map((label) => (
          <div
            key={label}
            style={{
              border: "1px solid #d8d5cc",
              borderRadius: 999,
              padding: "12px 20px",
              fontSize: 20,
              color: "#4d5c60",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
