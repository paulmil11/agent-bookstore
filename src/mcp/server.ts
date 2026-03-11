#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.AGENT_BOOKSTORE_URL || "http://localhost:3000";

async function apiFetch(path: string, options?: RequestInit) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  return res.json();
}

const server = new McpServer({
  name: "agent-bookstore",
  version: "1.0.0",
});

// Tool: Browse catalog
server.tool(
  "browse_catalog",
  "Browse all available books with prices, descriptions, and sample excerpts.",
  {},
  async () => {
    const result = await apiFetch("/api/catalog");
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

// Tool: Get book info
server.tool(
  "get_book_info",
  "Get detailed information about a specific book including table of contents, citation formats, sample chapter, and pricing tiers.",
  {
    slug: z.string().describe("Book slug (e.g., 'my-book')"),
  },
  async ({ slug }) => {
    const result = await apiFetch(`/api/books/${encodeURIComponent(slug)}`);
    if (result.error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${result.error}` }],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result.data, null, 2),
        },
      ],
    };
  }
);

// Tool: Purchase book
server.tool(
  "purchase",
  "Purchase a licensed copy of a book. Returns a Stripe checkout URL for the user to complete payment.",
  {
    slug: z.string().describe("Book slug"),
    email: z.string().email().describe("Buyer's email address"),
    buyerType: z
      .enum(["personal", "commercial", "training"])
      .describe(
        "Buyer tier: personal (up to 150 words with attribution), commercial (up to 500 words, unlimited internal quoting), training (full text for RAG/training)"
      ),
    organization: z
      .string()
      .optional()
      .describe("Organization name (optional, for commercial/training tiers)"),
    buyerName: z
      .string()
      .optional()
      .describe("Buyer name (optional, used in license)"),
  },
  async ({ slug, email, buyerType, organization, buyerName }) => {
    const result = await apiFetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        email,
        buyerType,
        organization,
        buyerName,
      }),
    });

    if (result.error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${result.error}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Purchase initiated!\n\nBook: ${result.data.book}\nTier: ${result.data.tier}\nPrice: ${result.data.price.display}\n\nCheckout URL: ${result.data.checkoutUrl}\n\nPlease open this URL to complete payment. After payment, you'll receive a download token for your watermarked copy.`,
        },
      ],
    };
  }
);

// Tool: Get citation
server.tool(
  "get_citation",
  "Get citation information for a book in various formats (APA, MLA, BibTeX, Chicago, JSON-LD). No purchase required.",
  {
    slug: z.string().describe("Book slug"),
    format: z
      .enum(["apa", "mla", "bibtex", "chicago", "jsonld", "all"])
      .optional()
      .describe("Citation format (defaults to 'all')"),
  },
  async ({ slug, format }) => {
    const result = await apiFetch(`/api/books/${encodeURIComponent(slug)}`);
    if (result.error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${result.error}` }],
        isError: true,
      };
    }

    const citations = result.data.citation;
    const fmt = format || "all";

    if (fmt === "all") {
      return {
        content: [
          {
            type: "text" as const,
            text: `Citations for "${result.data.title}":\n\nAPA:\n${citations.apa}\n\nMLA:\n${citations.mla}\n\nBibTeX:\n${citations.bibtex}\n\nChicago:\n${citations.chicago}\n\nJSON-LD:\n${JSON.stringify(citations.jsonLd, null, 2)}`,
          },
        ],
      };
    }

    const value = citations[fmt as keyof typeof citations];
    return {
      content: [
        {
          type: "text" as const,
          text:
            typeof value === "string"
              ? value
              : JSON.stringify(value, null, 2),
        },
      ],
    };
  }
);

// Tool: Check purchase
server.tool(
  "check_purchase",
  "Check the status of a purchase using the download token.",
  {
    token: z.string().describe("Download token from purchase"),
  },
  async ({ token }) => {
    const result = await apiFetch(`/api/download/${encodeURIComponent(token)}?check=true`);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);

// Tool: Download book
server.tool(
  "download",
  "Download a purchased book in the specified format. Returns the book content (watermarked and licensed to the buyer).",
  {
    token: z.string().describe("Download token from purchase"),
    format: z
      .enum(["markdown_bundle", "structured_json", "epub"])
      .optional()
      .describe("Download format: markdown_bundle (.zip), structured_json (single file, best for agents), or epub. Defaults to structured_json."),
  },
  async ({ token, format }) => {
    const fmt = format || "structured_json";
    const url = `${BASE_URL}/api/download/${encodeURIComponent(token)}?format=${encodeURIComponent(fmt)}`;

    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json();
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error.error || "Download failed"}`,
          },
        ],
        isError: true,
      };
    }

    if (fmt === "structured_json") {
      const text = await res.text();
      return {
        content: [{ type: "text" as const, text }],
      };
    }

    const formatLabel = fmt === "epub" ? "EPUB" : "Markdown bundle";
    return {
      content: [
        {
          type: "text" as const,
          text: `${formatLabel} ready for download at: ${url}\n\nThe ${fmt === "epub" ? "EPUB contains the full book with buyer metadata and PROVENANCE.json injected." : "bundle contains:\n- AGENTS.md (citation and licensing instructions)\n- LICENSE.md (your specific license terms)\n- CITATION.json (citation formats)\n- meta.json (book metadata)\n- PROVENANCE.json (purchase verification)\n- chapters/ (watermarked chapter files)"}`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Agent Bookstore MCP Server running");
}

main().catch(console.error);
