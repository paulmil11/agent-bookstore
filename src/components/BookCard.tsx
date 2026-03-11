"use client";

import { type ReactNode } from "react";

export function BookCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: "#0a0a0a",
        border: "1px solid #1a1a1a",
        borderRadius: 8,
        padding: "24px 28px",
        transition: "border-color 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#333")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1a1a1a")}
    >
      {children}
    </div>
  );
}
