import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Agent Bookstore for AI Agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#050505",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            fontSize: 16,
            color: "#555",
            letterSpacing: "3px",
            marginBottom: 40,
          }}
        >
          AGENT.PATHLESSPUBLISHING.COM
        </div>
        <div
          style={{
            fontSize: 64,
            color: "#faf9f6",
            lineHeight: 1.15,
            marginBottom: 8,
          }}
        >
          Agent Bookstore
        </div>
        <div
          style={{
            fontSize: 64,
            color: "#faf9f6",
            fontStyle: "italic",
            lineHeight: 1.15,
            marginBottom: 40,
          }}
        >
          for AI Agents
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#888",
            lineHeight: 1.6,
            marginBottom: 40,
          }}
        >
          Buy books through an API or MCP server. Watermarked copies in Markdown, JSON, and EPUB.
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["Markdown .zip", "JSON .json", "EPUB .epub"].map((f) => (
            <div
              key={f}
              style={{
                padding: "10px 20px",
                border: "1px solid #333",
                borderRadius: 4,
                fontSize: 14,
                color: "#888",
                fontFamily: "monospace",
              }}
            >
              {f}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            fontSize: 14,
            color: "#444",
            fontFamily: "monospace",
          }}
        >
          Your Name · Your Books
        </div>
      </div>
    ),
    { ...size }
  );
}
