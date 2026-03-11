import Link from "next/link";
import { listBooks, formatPriceDisplay } from "@/lib/catalog";
import { Tabs } from "@/components/Tabs";
import { FadeIn } from "@/components/FadeIn";
import { FlowDiagram } from "@/components/FlowDiagram";
import { AgentPlayground } from "@/components/AgentPlayground";
import { WatermarkDemo } from "@/components/WatermarkDemo";
import { EndpointCard } from "@/components/EndpointCard";
import { BookCard } from "@/components/BookCard";
import { CopyBlock } from "@/components/CopyBlock";

const API_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/catalog",
    description: "Discover available books, tier pricing, and formats",
    response: `{
  "data": {
    "books": [{
      "slug": "the-pathless-path",
      "title": "The Pathless Path",
      "author": "Your Name",
      "pricing": {
        "personal": "$25.00",
        "commercial": "$200.00",
        "training": "$2,000.00"
      },
      "formats": ["markdown_bundle", "structured_json", "epub"]
    }]
  }
}`,
  },
  {
    method: "GET",
    path: "/api/books/:slug",
    description: "Book details with citations, sample chapter, and purchase instructions",
    response: `{
  "data": {
    "slug": "the-pathless-path",
    "title": "The Pathless Path",
    "citations": { "apa": "...", "bibtex": "..." },
    "sample": "Chapter 1 excerpt...",
    "purchase": { "api": "POST /api/purchase", "mcp": "purchase()" }
  }
}`,
  },
  {
    method: "POST",
    path: "/api/purchase",
    description: "Initiate a Stripe checkout session with tier-based pricing",
    request: `{
  "slug": "the-pathless-path",
  "email": "agent@company.com",
  "buyerType": "personal"
}`,
    response: `{
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_live_...",
    "book": "The Pathless Path",
    "tier": "personal",
    "price": { "cents": 2500, "display": "$25.00" }
  }
}`,
  },
  {
    method: "GET",
    path: "/api/download/:token",
    description: "Download a uniquely watermarked copy (link expires in 7 days)",
    response: `\u2192 format=markdown_bundle (default): .zip with chapters/, AGENTS.md, CITATION.json
\u2192 format=structured_json: single .json with full text + metadata
\u2192 format=epub: watermarked EPUB with buyer metadata injected
   Each copy fingerprinted to buyer`,
  },
];

export default function Home() {
  const books = listBooks();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Agent Bookstore for AI Agents",
    description:
      "Buy your books through an API or MCP server. AI agents can browse, purchase, and download watermarked copies in Markdown, JSON, and EPUB.",
    url: "https://your-domain.com",
    founder: {
      "@type": "Person",
      name: "Your Name",
      url: "https://your-domain.com",
    },
    makesOffer: books.map((book) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Book",
        name: book.title,
        author: { "@type": "Person", name: book.author },
        isbn: book.isbn,
        datePublished: String(book.publishedYear),
        publisher: { "@type": "Organization", name: "Your Publisher" },
        url: `https://your-domain.com/books/${book.slug}`,
      },
      price: (book.pricing.personal / 100).toFixed(2),
      priceCurrency: "USD",
    })),
  };

  const tabs = [
    {
      id: "overview",
      label: "How It Works",
      content: (
        <div>
          <FadeIn>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 400,
                margin: "0 0 12px 0",
              }}
            >
              Books as an API
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: "#888",
                margin: "0 0 32px 0",
              }}
            >
              When an agent needs to read, summarize, or cite a book, it
              shouldn&rsquo;t have to scrape Amazon. This store gives agents a
              clean way to acquire licensed copies &mdash; with proper
              attribution baked in and every purchase traceable.
            </p>
          </FadeIn>

          <FlowDiagram />

          <FadeIn delay={500}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginTop: 32,
              }}
            >
              {[
                {
                  title: "API + MCP",
                  desc: "REST endpoints and an MCP server. No UI, no CAPTCHA. Agents talk to the store the same way they talk to everything else.",
                },
                {
                  title: "Watermarked",
                  desc: "Structural fingerprinting and provenance metadata. Each copy is traceable without changing the author's words.",
                },
                {
                  title: "AGENTS.md Included",
                  desc: "Every purchase ships with machine-readable citation formats, quoting limits, and license terms an agent can parse directly.",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #1a1a1a",
                    borderRadius: 8,
                    padding: 20,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 13,
                      fontWeight: 600,
                      margin: "0 0 8px 0",
                      color: "#e5e5e5",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: "#666",
                      margin: 0,
                      fontFamily: "var(--font-mono), monospace",
                    }}
                  >
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      ),
    },
    {
      id: "api",
      label: "API Reference",
      content: (
        <div>
          <FadeIn>
            <div
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                color: "#555",
                marginBottom: 8,
              }}
            >
              Base URL
            </div>
            <code
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 14,
                color: "#e5e5e5",
                background: "#111",
                border: "1px solid #222",
                borderRadius: 6,
                padding: "8px 14px",
                display: "inline-block",
                marginBottom: 32,
              }}
            >
              https://your-domain.com
            </code>
          </FadeIn>

          {API_ENDPOINTS.map((endpoint, i) => (
            <EndpointCard key={i} endpoint={endpoint} index={i} />
          ))}

          <FadeIn delay={1200}>
            <div
              style={{
                background: "#111",
                border: "1px solid #222",
                borderRadius: 8,
                padding: 20,
                marginTop: 24,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  margin: "0 0 12px 0",
                  color: "#fbbf24",
                }}
              >
                Authentication
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                  color: "#888",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                The catalog and book detail endpoints are public. Purchases use Stripe
                checkout sessions &mdash; no API key needed. The payment itself is the
                authentication. MCP server:{" "}
                <span style={{ color: "#e5e5e5" }}>
                  npx @your-scope/bookstore
                </span>
              </p>
            </div>
          </FadeIn>
        </div>
      ),
    },
    {
      id: "playground",
      label: "Try It",
      content: (
        <div>
          <FadeIn>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: "#888",
                margin: "0 0 24px 0",
              }}
            >
              Walk through the agent purchase flow step by step. This
              simulates what happens when an AI agent buys a book.
            </p>
          </FadeIn>
          <AgentPlayground />
        </div>
      ),
    },
    {
      id: "watermark",
      label: "Watermarking",
      content: (
        <div>
          <FadeIn>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 400,
                margin: "0 0 12px 0",
              }}
            >
              Provenance built in
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.8,
                color: "#888",
                margin: "0 0 32px 0",
              }}
            >
              Two layers of identification per copy: a visible license page
              with PROVENANCE.json, and structural formatting fingerprints
              encoded in the whitespace. Your words are never changed. If a
              copy leaks, the buyer is identifiable.
            </p>
          </FadeIn>

          <WatermarkDemo />

          <FadeIn delay={600}>
            <div
              style={{
                marginTop: 32,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div
                style={{
                  background: "#0a0a0a",
                  border: "1px solid #1a1a1a",
                  borderRadius: 8,
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    margin: "0 0 10px 0",
                    color: "#e5e5e5",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Visible Layer
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 12,
                    color: "#666",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  License page with buyer email, transaction ID, and purchase
                  date. PROVENANCE.json with signed hash. Clear provenance.
                </p>
              </div>
              <div
                style={{
                  background: "#0a0a0a",
                  border: "1px solid #1a1a1a",
                  borderRadius: 8,
                  padding: 20,
                }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    margin: "0 0 10px 0",
                    color: "#e5e5e5",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Invisible Layer
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 12,
                    color: "#666",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Structural formatting patterns encoded in paragraph spacing.
                  No words are changed. Survives copy-paste, reformatting,
                  and AI pipelines.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "80px 24px 60px",
        }}
      >
        <FadeIn>
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              color: "#555",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 24,
            }}
          >
            your-domain.com
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <h1
            style={{
              fontSize: "clamp(32px, 6vw, 48px)",
              fontWeight: 300,
              lineHeight: 1.15,
              margin: "0 0 24px 0",
              color: "#faf9f6",
              letterSpacing: "-0.01em",
            }}
          >
            Agent Bookstore
            <br />
            <span style={{ fontStyle: "italic", fontWeight: 400 }}>
              for AI Agents
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={200}>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "#888",
              maxWidth: 540,
              margin: "0 0 40px 0",
            }}
          >
            An API and MCP server that lets agents browse, buy, and cite
            your books. Each copy ships with machine-readable
            licensing, citation metadata, and invisible forensic fingerprinting
            tied to the buyer.
          </p>
        </FadeIn>

        <FadeIn delay={300}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              "Markdown \u00B7 JSON \u00B7 EPUB",
              "Stripe payments",
              "Unique watermark per copy",
            ].map((tag) => (
              <div
                key={tag}
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: 6,
                  padding: "8px 14px",
                  color: "#888",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Quick Start — paste into your agent */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 48 }}>
          <FadeIn delay={400}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 400,
                margin: "0 0 8px 0",
              }}
            >
              Paste this into your agent
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                color: "#666",
                margin: "0 0 20px 0",
              }}
            >
              Works with ChatGPT, Claude, Cursor, or any agent that can make HTTP requests
            </p>

            <div style={{ display: "grid", gap: 16 }}>
              <CopyBlock
                label="Quick — point your agent to llms.txt"
                text={`Read https://your-domain.com/llms.txt and help me buy a copy of The Pathless Path. My email is [YOUR EMAIL].`}
              />

              <CopyBlock
                label="Direct API — if your agent can make requests"
                text={`Browse the catalog at https://your-domain.com/api/catalog\n\nTo purchase, POST to https://your-domain.com/api/purchase with:\n{\n  "slug": "the-pathless-path",\n  "email": "YOUR_EMAIL",\n  "buyerType": "personal"\n}\n\nThis returns a Stripe checkout URL. Open it to complete payment.`}
              />

              <CopyBlock
                label="MCP Server — for Claude Desktop, Cursor, etc."
                text={`npx @your-scope/bookstore`}
              />
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "48px 24px 0",
        }}
      >
        <div style={{ borderTop: "1px solid #1a1a1a" }} />
      </div>

      {/* Tabs */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "40px 24px 0",
        }}
      >
        <Tabs tabs={tabs} />
      </div>

      {/* Books Catalog */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "60px 24px 0",
        }}
      >
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 48 }}>
          <FadeIn>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 400,
                margin: "0 0 8px 0",
              }}
            >
              Available books
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#666",
                margin: "0 0 32px 0",
                fontFamily: "var(--font-mono), monospace",
              }}
            >
              Each includes AGENTS.md with citation formats, quoting policy, and
              license terms
            </p>
          </FadeIn>

          <div
            style={{
              display: "grid",
              gap: 16,
            }}
          >
            {books.map((book, i) => (
              <FadeIn key={book.slug} delay={200 + i * 150}>
                <Link
                  href={`/books/${book.slug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <BookCard>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 600,
                            margin: "0 0 4px 0",
                            color: "#faf9f6",
                          }}
                        >
                          {book.title}
                        </h3>
                        <p
                          style={{
                            fontFamily: "var(--font-mono), monospace",
                            fontSize: 12,
                            color: "#555",
                            margin: "0 0 12px 0",
                          }}
                        >
                          {book.author} &middot; {book.publishedYear} &middot;{" "}
                          {book.pageCount} pages
                        </p>
                        <p
                          style={{
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: "#888",
                            margin: 0,
                          }}
                        >
                          {book.description}
                        </p>
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono), monospace",
                          fontSize: 12,
                          color: "#888",
                          whiteSpace: "nowrap",
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        <div style={{ color: "#e5e5e5", fontWeight: 600 }}>
                          From {formatPriceDisplay(book.pricing.personal)}
                        </div>
                      </div>
                    </div>
                  </BookCard>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "60px 24px 0",
        }}
      >
        <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 48 }}>
          <FadeIn>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 400,
                margin: "0 0 8px 0",
              }}
            >
              Pricing
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#666",
                margin: "0 0 32px 0",
                fontFamily: "var(--font-mono), monospace",
              }}
            >
              Self-identify your tier at purchase. Each copy is watermarked and
              traceable.
            </p>
          </FadeIn>

          <FadeIn delay={200}>
            <div
              style={{
                background: "#0a0a0a",
                border: "1px solid #1a1a1a",
                borderRadius: 8,
                padding: 20,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                  color: "#888",
                  marginBottom: 12,
                }}
              >
                Every purchase includes all three formats:
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  {
                    format: "Markdown Bundle",
                    ext: ".zip",
                    desc: "Chapters as .md files, AGENTS.md, CITATION.json, PROVENANCE.json",
                  },
                  {
                    format: "Structured JSON",
                    ext: ".json",
                    desc: "Full text + metadata in a single file for programmatic use",
                  },
                  {
                    format: "EPUB",
                    ext: ".epub",
                    desc: "Standard e-book format for reading apps",
                  },
                ].map((f) => (
                  <div key={f.format}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: 12,
                        color: "#e5e5e5",
                        marginBottom: 4,
                      }}
                    >
                      {f.format}{" "}
                      <span style={{ color: "#444" }}>{f.ext}</span>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: 11,
                        color: "#555",
                        lineHeight: 1.5,
                      }}
                    >
                      {f.desc}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 11,
                  color: "#444",
                  marginTop: 12,
                }}
              >
                All copies are watermarked and traceable to the buyer.
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              {[
                {
                  tier: "Personal",
                  price: "$25",
                  desc: "Individual reading. Up to 150 words quotable with attribution.",
                  color: "#34d399",
                },
                {
                  tier: "Commercial",
                  price: "$200",
                  desc: "Organization use. Up to 500 words, unlimited internal quoting.",
                  color: "#fbbf24",
                },
                {
                  tier: "Training",
                  price: "$2,000",
                  desc: "AI training & RAG pipelines. Full text with explicit permission.",
                  color: "#f472b6",
                },
              ].map((t) => (
                <div
                  key={t.tier}
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #1a1a1a",
                    borderRadius: 8,
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 11,
                      color: t.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 8,
                    }}
                  >
                    {t.tier}
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 300,
                      color: "#e5e5e5",
                      marginBottom: 12,
                    }}
                  >
                    {t.price}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 12,
                      color: "#666",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>

        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "80px 24px 40px",
        }}
      >
        <div
          style={{
            borderTop: "1px solid #1a1a1a",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              color: "#444",
            }}
          >
            Your Name &middot; your-domain.com
          </span>
          <div
            style={{
              display: "flex",
              gap: 16,
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              color: "#444",
            }}
          >
            <a
              href="/llms.txt"
              style={{ color: "#555", textDecoration: "none" }}
            >
              llms.txt
            </a>
            <a
              href="/api/catalog"
              style={{ color: "#555", textDecoration: "none" }}
            >
              API
            </a>
            <span>Human readers welcome too</span>
          </div>
        </div>
      </div>
    </div>
  );
}
