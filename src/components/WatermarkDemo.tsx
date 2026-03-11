"use client";

import { useState } from "react";
import { FadeIn } from "./FadeIn";

export function WatermarkDemo() {
  const [hovering, setHovering] = useState(false);

  return (
    <FadeIn delay={400}>
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          borderRadius: 12,
          padding: 32,
          position: "relative",
          overflow: "hidden",
          transition: "border-color 0.3s",
          borderColor: hovering ? "#333" : "#1a1a1a",
        }}
      >
        {/* Simulated book page */}
        <div
          style={{
            background: "#faf9f6",
            borderRadius: 4,
            padding: "28px 32px",
            maxWidth: 400,
            margin: "0 auto",
            position: "relative",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 11,
              color: "#999",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: 20,
              borderBottom: "1px solid #e5e5e5",
              paddingBottom: 12,
            }}
          >
            Licensed Digital Copy
          </div>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 18,
              color: "#1a1a1a",
              textAlign: "center",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            The Pathless Path
          </div>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 12,
              color: "#666",
              textAlign: "center",
              fontStyle: "italic",
              marginBottom: 20,
            }}
          >
            by Your Name
          </div>
          <div
            style={{
              background: "#f5f3ef",
              borderRadius: 4,
              padding: "12px 16px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 10,
                color: "#888",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              This copy is licensed to
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 13,
                color: "#333",
                fontWeight: 600,
              }}
            >
              agent-7f3b@openai.com
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono), monospace",
              fontSize: 10,
              color: "#aaa",
            }}
          >
            <span>txn_a7f3b2e1</span>
            <span>2026-03-10</span>
          </div>
          {/* Invisible watermark hint */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 12,
              fontFamily: "var(--font-mono), monospace",
              fontSize: 8,
              color: hovering
                ? "rgba(200, 80, 80, 0.6)"
                : "rgba(200, 80, 80, 0)",
              transition: "color 0.5s ease",
              letterSpacing: "0.05em",
            }}
          >
            hidden fingerprint: f7a3b2e1c9d4
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            color: "#555",
            marginTop: 16,
            marginBottom: 0,
          }}
        >
          {hovering
            ? "Invisible forensic watermark revealed"
            : "Hover to reveal hidden watermark"}
        </p>
      </div>
    </FadeIn>
  );
}
