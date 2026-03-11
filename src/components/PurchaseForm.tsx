"use client";

import { useState } from "react";

interface PurchaseFormProps {
  slug: string;
  tiers: {
    key: string;
    label: string;
    price: string;
    color: string;
  }[];
}

export function PurchaseForm({ slug, tiers }: PurchaseFormProps) {
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          email,
          buyerType: tier,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Redirect to Stripe checkout
      window.location.href = data.data.checkoutUrl;
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  const selectedTier = tiers.find((t) => t.key === tier);

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            color: "#555",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 4,
          }}
        >
          Agentless Human Purchases
        </div>
        <div>
          <label
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              color: "#666",
              display: "block",
              marginBottom: 6,
            }}
          >
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "#0a0a0a",
              border: "1px solid #333",
              borderRadius: 6,
              color: "#e5e5e5",
              fontFamily: "var(--font-mono), monospace",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <label
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              color: "#666",
              display: "block",
              marginBottom: 6,
            }}
          >
            License tier
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {tiers.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTier(t.key)}
                style={{
                  flex: 1,
                  padding: "10px 8px",
                  background: tier === t.key ? "#1a1a1a" : "#0a0a0a",
                  border: tier === t.key ? `1px solid ${t.color}` : "1px solid #222",
                  borderRadius: 6,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 11,
                    color: tier === t.key ? t.color : "#555",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {t.label}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 300,
                    color: tier === t.key ? "#e5e5e5" : "#555",
                    marginTop: 2,
                  }}
                >
                  {t.price}
                </div>
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !email}
          style={{
            padding: "12px 24px",
            background: loading ? "#222" : selectedTier?.color || "#34d399",
            color: "#000",
            border: "none",
            borderRadius: 6,
            fontFamily: "var(--font-mono), monospace",
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? "wait" : "pointer",
            opacity: loading || !email ? 0.6 : 1,
            transition: "all 0.15s",
            marginTop: 4,
          }}
        >
          {loading ? "Redirecting to checkout..." : `Buy ${selectedTier?.label || "Personal"} License`}
        </button>
        {error && (
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              color: "#ef4444",
              margin: 0,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
