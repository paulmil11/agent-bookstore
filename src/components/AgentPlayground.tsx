"use client";

import { useState } from "react";
import { FadeIn } from "./FadeIn";

const STEPS = [
  {
    label: "Discover Catalog",
    request: "curl https://your-domain.com/api/catalog",
    response: JSON.stringify(
      {
        data: {
          books: [
            {
              slug: "the-pathless-path",
              title: "The Pathless Path",
              author: "Your Name",
              pricing: { personal: "$25.00", commercial: "$200.00", training: "$2,000.00" },
              formats: ["markdown_bundle", "structured_json", "epub"],
            },
          ],
        },
      },
      null,
      2
    ),
  },
  {
    label: "Purchase",
    request: `curl -X POST https://your-domain.com/api/purchase \\
  -H "Content-Type: application/json" \\
  -d '{"slug":"the-pathless-path","email":"agent@company.com","buyerType":"personal"}'`,
    response: JSON.stringify(
      {
        data: {
          checkoutUrl: "https://checkout.stripe.com/c/pay/cs_live_...",
          book: "The Pathless Path",
          tier: "personal",
          price: { cents: 2500, display: "$25.00" },
        },
      },
      null,
      2
    ),
  },
  {
    label: "Download",
    request:
      "curl -O https://your-domain.com/api/download/d4e5f6...?format=structured_json",
    response: `Downloading... the-pathless-path-licensed.json (1.2 MB)
\u2713 Watermarked copy saved successfully
\u2713 Licensed to: agent@company.com
\u2713 Includes: AGENTS.md, CITATION.json, PROVENANCE.json, chapters/`,
  },
];

export function AgentPlayground() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const runStep = () => {
    if (step >= STEPS.length) {
      setStep(0);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep((s) => s + 1);
    }, 800);
  };

  return (
    <FadeIn delay={500}>
      <div
        style={{
          background: "#0a0a0a",
          border: "1px solid #1a1a1a",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Terminal header */}
        <div
          style={{
            background: "#111",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid #1a1a1a",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              color: "#555",
              marginLeft: 8,
            }}
          >
            agent-terminal — simulated purchase flow
          </span>
        </div>

        {/* Terminal body */}
        <div
          style={{
            padding: 20,
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12,
            lineHeight: 1.7,
            minHeight: 280,
            maxHeight: 400,
            overflow: "auto",
          }}
        >
          {STEPS.slice(0, step).map((s, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ color: "#34d399" }}>
                <span style={{ color: "#555" }}>$</span> {s.request}
              </div>
              <pre
                style={{
                  color: "#a3a3a3",
                  margin: "6px 0 0 0",
                  whiteSpace: "pre-wrap",
                  fontSize: 11,
                }}
              >
                {s.response}
              </pre>
            </div>
          ))}
          {loading && (
            <div style={{ color: "#fbbf24" }}>Processing...</div>
          )}
          {step === 0 && !loading && (
            <div style={{ color: "#555" }}>
              Click &quot;Run Next Step&quot; to simulate an AI agent purchasing a book
            </div>
          )}
          {step >= STEPS.length && !loading && (
            <div style={{ color: "#34d399", marginTop: 8 }}>
              Purchase complete. The agent now has a uniquely watermarked, licensed copy with citation instructions.
            </div>
          )}
        </div>

        {/* Action bar */}
        <div
          style={{
            borderTop: "1px solid #1a1a1a",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              color: "#555",
            }}
          >
            Step {Math.min(step, STEPS.length)} of {STEPS.length}
          </span>
          <button
            onClick={runStep}
            disabled={loading}
            style={{
              background: step >= STEPS.length ? "#1a1a1a" : "#e5e5e5",
              color: step >= STEPS.length ? "#888" : "#000",
              border: "none",
              borderRadius: 6,
              padding: "8px 20px",
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            {step >= STEPS.length ? "Reset" : loading ? "Running..." : "Run Next Step"}
          </button>
        </div>
      </div>
    </FadeIn>
  );
}
