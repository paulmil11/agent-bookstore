import { NextResponse } from "next/server";
import { listBooks, formatPriceDisplay } from "@/lib/catalog";

export async function GET() {
  const books = listBooks();

  const catalog = books.map((book) => ({
    slug: book.slug,
    title: book.title,
    author: book.author,
    description: book.shortDescription,
    isbn: book.isbn,
    publishedYear: book.publishedYear,
    tags: book.tags,
    pageCount: book.pageCount,
    pricing: {
      personal: {
        cents: book.pricing.personal,
        display: formatPriceDisplay(book.pricing.personal),
        description: "Up to 150 words with attribution",
      },
      commercial: {
        cents: book.pricing.commercial,
        display: formatPriceDisplay(book.pricing.commercial),
        description: "Up to 500 words, unlimited internal quoting",
      },
      training: {
        cents: book.pricing.training,
        display: formatPriceDisplay(book.pricing.training),
        description: "Full text for RAG/training with attribution",
      },
    },
    purchaseUrl: book.purchaseUrl,
    apiUrl: `/api/books/${book.slug}`,
    coverImage: book.coverImage,
  }));

  return NextResponse.json({
    data: {
      books: catalog,
      count: catalog.length,
      store: {
        name: "Agent Bookstore for AI Agents",
        author: "Your Name",
        description:
          "Agent-first bookstore. Books on work, meaning, and self-employment.",
        mcpServer: "npx @your-scope/bookstore",
        apiDocs: "/llms.txt",
      },
    },
  });
}
