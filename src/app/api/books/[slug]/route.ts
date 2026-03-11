import { NextRequest, NextResponse } from "next/server";
import { getBook, getSample, formatPriceDisplay } from "@/lib/catalog";
import { generateCitations } from "@/lib/citations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const book = getBook(slug);

  if (!book) {
    return NextResponse.json(
      { error: "Book not found" },
      { status: 404 }
    );
  }

  const sample = getSample(slug);
  const citations = generateCitations(book);

  return NextResponse.json({
    data: {
      slug: book.slug,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
      description: book.description,
      tags: book.tags,
      pageCount: book.pageCount,
      tableOfContents: book.chapters.map((ch) => ({
        number: ch.number,
        title: ch.title,
      })),
      pricing: {
        personal: {
          cents: book.pricing.personal,
          display: formatPriceDisplay(book.pricing.personal),
        },
        commercial: {
          cents: book.pricing.commercial,
          display: formatPriceDisplay(book.pricing.commercial),
        },
        training: {
          cents: book.pricing.training,
          display: formatPriceDisplay(book.pricing.training),
        },
      },
      citation: citations,
      sample: sample || null,
      formats: ["markdown_bundle", "structured_json", "epub"],
      purchase: {
        endpoint: "/api/purchase",
        method: "POST",
        body: {
          slug: book.slug,
          email: "<buyer_email>",
          buyerType: "personal | commercial | training",
          organization: "<optional>",
        },
      },
    },
  });
}
