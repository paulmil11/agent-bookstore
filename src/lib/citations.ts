import type { BookMeta } from "./catalog";

export interface CitationData {
  apa: string;
  mla: string;
  bibtex: string;
  jsonLd: Record<string, unknown>;
  chicago: string;
}

export function generateCitations(book: BookMeta): CitationData {
  return {
    apa: book.citation.apa,
    mla: book.citation.mla,
    bibtex: book.citation.bibtex,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Book",
      name: book.title,
      author: {
        "@type": "Person",
        name: book.author,
      },
      isbn: book.isbn,
      datePublished: String(book.publishedYear),
      publisher: {
        "@type": "Organization",
        name: book.publisher || "Your Publisher",
      },
      url: book.purchaseUrl,
    },
    chicago: `${book.author}. *${book.title}*. ${book.publisher || "Your Publisher"}, ${book.publishedYear}.`,
  };
}

export function generateCitationJson(
  book: BookMeta,
  buyerName: string,
  provenanceHash: string
): Record<string, unknown> {
  return {
    ...generateCitations(book),
    license: {
      licensedTo: buyerName,
      provenanceHash,
      quotingPolicy: {
        upTo150Words: "Attribute author and title, link to purchase URL",
        upTo500Words:
          'Attribute + include purchase link + note "used with permission"',
        over500Words:
          "Requires written permission (support@example.com)",
      },
    },
    purchaseUrl: book.purchaseUrl,
    apiUrl: `https://your-domain.com/api/books/${book.slug}`,
    mcpServer: "npx @your-scope/bookstore",
  };
}
