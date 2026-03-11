"use client";

import { useState } from "react";
import { FadeIn } from "./FadeIn";

interface EndpointData {
  method: string;
  path: string;
  description: string;
  request?: string;
  response: string;
}

export function EndpointCard({
  endpoint,
  index,
}: {
  endpoint: EndpointData;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const methodColors: Record<string, { bg: string; text: string; border: string }> = {
    GET: { bg: "#0d3320", text: "#34d399", border: "#166534" },
    POST: { bg: "#312e0d", text: "#fbbf24", border: "#854d0e" },
  };
  const color = methodColors[endpoint.method] || methodColors.GET;

  return (
    <FadeIn delay={600 + index * 150}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 8,
          padding: "16px 20px",
          cursor: "pointer",
          marginBottom: 12,
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#444")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#222")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              background: color.bg,
              color: color.text,
              border: `1px solid ${color.border}`,
              padding: "2px 8px",
              borderRadius: 4,
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            {endpoint.method}
          </span>
          <code
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 14,
              color: "#e5e5e5",
            }}
          >
            {endpoint.path}
          </code>
          <span
            style={{
              marginLeft: "auto",
              color: "#666",
              fontSize: 18,
              transition: "transform 0.2s",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            &rarr;
          </span>
        </div>
        <p
          style={{
            color: "#888",
            fontSize: 13,
            margin: "8px 0 0 0",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          {endpoint.description}
        </p>
        {expanded && (
          <div style={{ marginTop: 16 }}>
            {endpoint.request && (
              <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    color: "#666",
                    fontSize: 11,
                    fontFamily: "var(--font-mono), monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Request Body
                </span>
                <pre
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #1a1a1a",
                    borderRadius: 6,
                    padding: 14,
                    margin: "6px 0 0 0",
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 12,
                    color: "#a3a3a3",
                    overflow: "auto",
                    lineHeight: 1.6,
                  }}
                >
                  {endpoint.request}
                </pre>
              </div>
            )}
            <div>
              <span
                style={{
                  color: "#666",
                  fontSize: 11,
                  fontFamily: "var(--font-mono), monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Response
              </span>
              <pre
                style={{
                  background: "#0a0a0a",
                  border: "1px solid #1a1a1a",
                  borderRadius: 6,
                  padding: 14,
                  margin: "6px 0 0 0",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                  color: "#a3a3a3",
                  overflow: "auto",
                  lineHeight: 1.6,
                }}
              >
                {endpoint.response}
              </pre>
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
