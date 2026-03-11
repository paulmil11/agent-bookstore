"use client";

import { FadeIn } from "./FadeIn";

const STEPS = [
  { icon: "\u{1F50D}", label: "Discover", detail: "GET /api/catalog" },
  { icon: "\u{1F4B3}", label: "Purchase", detail: "POST /api/purchase" },
  { icon: "\u{1F50F}", label: "Watermark", detail: "Unique copy generated" },
  { icon: "\u{1F4E5}", label: "Download", detail: "GET /api/download/:token" },
];

export function FlowDiagram() {
  return (
    <FadeIn delay={300}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          flexWrap: "wrap",
          margin: "32px 0",
        }}
      >
        {STEPS.map((step, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center" }}
          >
            <div
              style={{
                textAlign: "center",
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
              <div
                style={{
                  fontFamily: "var(--font-serif), Georgia, serif",
                  fontSize: 15,
                  color: "#e5e5e5",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {step.label}
              </div>
              <code
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 10,
                  color: "#666",
                }}
              >
                {step.detail}
              </code>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  color: "#333",
                  fontSize: 20,
                  padding: "0 4px",
                }}
              >
                &rarr;
              </div>
            )}
          </div>
        ))}
      </div>
    </FadeIn>
  );
}
