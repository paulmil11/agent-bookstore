"use client";

import { useState } from "react";

export function CopyBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #222",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? "#0d3320" : "#1a1a1a",
            border: `1px solid ${copied ? "#166534" : "#333"}`,
            borderRadius: 4,
            padding: "4px 12px",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            color: copied ? "#34d399" : "#888",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          padding: "16px 20px",
          fontFamily: "var(--font-mono), monospace",
          fontSize: 13,
          lineHeight: 1.7,
          color: "#e5e5e5",
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {text}
      </pre>
    </div>
  );
}
