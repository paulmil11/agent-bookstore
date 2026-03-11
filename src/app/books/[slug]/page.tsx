import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getBook, getSample, formatPriceDisplay, listBooks } from "@/lib/catalog";
import { generateCitations } from "@/lib/citations";
import { FadeIn } from "@/components/FadeIn";
import { CopyBlock } from "@/components/CopyBlock";
import { PurchaseForm } from "@/components/PurchaseForm";

export function generateStaticParams() {
  const books = listBooks();
  return books.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) return {};

  return {
    title: `${book.title} by ${book.author}`,
    description: book.description,
    alternates: {
      canonical: `/books/${slug}`,
    },
    openGraph: {
      type: "website",
      title: `${book.title} by ${book.author}`,
      description: book.description,
      url: `https://your-domain.com/books/${slug}`,
    },
    twitter: {
      card: "summary",
      title: book.title,
      description: book.shortDescription,
    },
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = getBook(slug);

  if (!book) {
    notFound();
  }

  const sample = getSample(slug);
  const citations = generateCitations(book);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author },
    isbn: book.isbn,
    datePublished: String(book.publishedYear),
    publisher: { "@type": "Organization", name: "Your Publisher" },
    description: book.description,
    numberOfPages: book.pageCount,
    url: `https://your-domain.com/books/${slug}`,
    offers: [
      {
        "@type": "Offer",
        name: "Personal",
        price: (book.pricing.personal / 100).toFixed(2),
        priceCurrency: "USD",
        description: "Up to 150 words with attribution",
      },
      {
        "@type": "Offer",
        name: "Commercial",
        price: (book.pricing.commercial / 100).toFixed(2),
        priceCurrency: "USD",
        description: "Up to 500 words, unlimited internal quoting",
      },
      {
        "@type": "Offer",
        name: "Training",
        price: (book.pricing.training / 100).toFixed(2),
        priceCurrency: "USD",
        description: "Full text for RAG/training with attribution",
      },
    ],
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "24px 24px",
          borderBottom: "1px solid #1a1a1a",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12,
            color: "#555",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
        >
          &larr; your-domain.com
        </Link>
      </div>

      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        {/* Book Info */}
        <FadeIn>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 400,
              lineHeight: 1.2,
              margin: "0 0 8px 0",
              color: "#faf9f6",
            }}
          >
            {book.title}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              color: "#555",
              margin: "0 0 24px 0",
            }}
          >
            {book.author} &middot; {book.publishedYear} &middot;{" "}
            {book.pageCount} pages &middot; ISBN: {book.isbn}
          </p>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.7,
              color: "#888",
              margin: "0 0 24px 0",
              maxWidth: 560,
            }}
          >
            {book.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {book.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 11,
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: 4,
                  padding: "4px 10px",
                  color: "#666",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </FadeIn>

        {/* Pricing */}
        <FadeIn delay={200}>
          <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 48, paddingTop: 48 }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 8px 0",
              }}
            >
              Purchase
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                color: "#666",
                margin: "0 0 20px 0",
              }}
            >
              All tiers include the same three formats. The tier determines
              quoting rights, not what you receive.
            </p>
            <div
              style={{
                background: "#0a0a0a",
                border: "1px solid #1a1a1a",
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                  color: "#888",
                  marginBottom: 10,
                }}
              >
                Every purchase includes:
              </div>
              <div
                style={{
                  display: "grid",
                  gap: 6,
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                }}
              >
                {[
                  { label: "Markdown Bundle", ext: ".zip", note: "chapters as .md files + AGENTS.md + CITATION.json" },
                  { label: "Structured JSON", ext: ".json", note: "full text + metadata in one file" },
                  { label: "EPUB", ext: ".epub", note: "standard e-book for reading apps" },
                ].map((f) => (
                  <div key={f.label} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ color: "#e5e5e5", minWidth: 140 }}>
                      {f.label} <span style={{ color: "#444" }}>{f.ext}</span>
                    </span>
                    <span style={{ color: "#555" }}>{f.note}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 11,
                  color: "#444",
                  marginTop: 10,
                }}
              >
                All copies watermarked and traceable to buyer.
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              {(
                [
                  {
                    tier: "Personal",
                    key: "personal" as const,
                    desc: "Up to 150 words with attribution.",
                    color: "#34d399",
                  },
                  {
                    tier: "Commercial",
                    key: "commercial" as const,
                    desc: "Up to 500 words, unlimited internal quoting.",
                    color: "#fbbf24",
                  },
                  {
                    tier: "Training",
                    key: "training" as const,
                    desc: "Full text for RAG/training with attribution.",
                    color: "#f472b6",
                  },
                ] as const
              ).map((t) => (
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
                      marginBottom: 8,
                    }}
                  >
                    {formatPriceDisplay(book.pricing[t.key])}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 12,
                      color: "#666",
                      lineHeight: 1.6,
                      margin: "0 0 12px 0",
                    }}
                  >
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>
            <PurchaseForm
              slug={slug}
              tiers={[
                { key: "personal", label: "Personal", price: formatPriceDisplay(book.pricing.personal), color: "#34d399" },
                { key: "commercial", label: "Commercial", price: formatPriceDisplay(book.pricing.commercial), color: "#fbbf24" },
                { key: "training", label: "Training", price: formatPriceDisplay(book.pricing.training), color: "#f472b6" },
              ]}
            />
          </div>
        </FadeIn>

        {/* Tell your agent */}
        <FadeIn delay={250}>
          <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 48, paddingTop: 48 }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 8px 0",
              }}
            >
              Tell your agent
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                color: "#666",
                margin: "0 0 20px 0",
              }}
            >
              Copy and paste into ChatGPT, Claude, or any agent
            </p>
            <CopyBlock
              label={`Buy "${book.title}"`}
              text={`Read https://your-domain.com/llms.txt and buy me a personal copy of "${book.title}" by ${book.author}. My email is [YOUR EMAIL].`}
            />
          </div>
        </FadeIn>

        {/* Table of Contents */}
        <FadeIn delay={300}>
          <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 48, paddingTop: 48 }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 24px 0",
              }}
            >
              Table of Contents
            </h2>
            <div>
              {book.chapters.map((ch) => (
                <div
                  key={ch.number}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    padding: "8px 0",
                    borderBottom: "1px solid #111",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 12,
                      color: "#444",
                      minWidth: 20,
                    }}
                  >
                    {String(ch.number).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 15, color: "#ccc" }}>
                    {ch.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Sample */}
        {sample && (
          <FadeIn delay={400}>
            <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 48, paddingTop: 48 }}>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  margin: "0 0 24px 0",
                }}
              >
                Sample
              </h2>
              <div
                style={{
                  background: "#0a0a0a",
                  border: "1px solid #1a1a1a",
                  borderRadius: 8,
                  padding: "24px 28px",
                }}
              >
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "var(--font-serif), Georgia, serif",
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: "#999",
                    margin: 0,
                  }}
                >
                  {sample}
                </pre>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Citations */}
        <FadeIn delay={500}>
          <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 48, paddingTop: 48 }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 8px 0",
              }}
            >
              Citation
            </h2>
            <p
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12,
                color: "#555",
                margin: "0 0 24px 0",
              }}
            >
              Citation information is always free. Use any format below.
            </p>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                { label: "APA", value: citations.apa },
                { label: "MLA", value: citations.mla },
                { label: "BibTeX", value: citations.bibtex },
              ].map((c) => (
                <div key={c.label}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 11,
                      color: "#555",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 6,
                    }}
                  >
                    {c.label}
                  </div>
                  <pre
                    style={{
                      background: "#0a0a0a",
                      border: "1px solid #1a1a1a",
                      borderRadius: 6,
                      padding: 14,
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 12,
                      color: "#a3a3a3",
                      overflow: "auto",
                      lineHeight: 1.6,
                      margin: 0,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {c.value}
                  </pre>
                </div>
              ))}
            </div>
            <p
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                color: "#444",
                marginTop: 16,
              }}
            >
              API: GET /api/books/{slug} &middot; MCP: get_citation(&quot;{slug}&quot;)
            </p>
          </div>
        </FadeIn>

        {/* Agent Instructions */}
        <FadeIn delay={600}>
          <div style={{ borderTop: "1px solid #1a1a1a", marginTop: 48, paddingTop: 48 }}>
            <div
              style={{
                background: "#111",
                border: "1px solid #222",
                borderRadius: 8,
                padding: 24,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  margin: "0 0 16px 0",
                  color: "#fbbf24",
                }}
              >
                For AI Agents
              </h3>
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12,
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ color: "#555", minWidth: 100 }}>MCP Server</span>
                  <code style={{ color: "#e5e5e5" }}>
                    npx @your-scope/bookstore
                  </code>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ color: "#555", minWidth: 100 }}>Purchase API</span>
                  <code style={{ color: "#e5e5e5" }}>
                    POST /api/purchase
                  </code>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ color: "#555", minWidth: 100 }}>Discovery</span>
                  <a
                    href="/llms.txt"
                    style={{
                      color: "#e5e5e5",
                      textDecoration: "none",
                    }}
                  >
                    /llms.txt
                  </a>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Footer */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "48px 24px 40px",
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
          <span
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              color: "#444",
            }}
          >
            All copies include steganographic watermarks
          </span>
        </div>
      </div>
    </div>
  );
}
