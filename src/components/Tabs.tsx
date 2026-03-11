"use client";

import { useState, type ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid #1a1a1a",
          marginBottom: 40,
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom:
                activeTab === tab.id
                  ? "2px solid #e5e5e5"
                  : "2px solid transparent",
              padding: "12px 20px",
              fontFamily: "var(--font-mono), monospace",
              fontSize: 13,
              color: activeTab === tab.id ? "#e5e5e5" : "#555",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.id === activeTab)?.content}
    </div>
  );
}
