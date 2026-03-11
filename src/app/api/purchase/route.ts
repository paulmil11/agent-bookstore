import { NextRequest, NextResponse } from "next/server";
import { getBook, getPriceForTier, type BuyerTier } from "@/lib/catalog";
import { createCheckoutSession } from "@/lib/stripe";

const VALID_TIERS: BuyerTier[] = [
  "personal",
  "commercial",
  "training",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, email, buyerType, organization } = body;

    // Validate required fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!slug || !email || !buyerType) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: slug, email, buyerType",
          example: {
            slug: "the-pathless-path",
            email: "buyer@example.com",
            buyerType: "personal",
            organization: "optional",
          },
        },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!VALID_TIERS.includes(buyerType)) {
      return NextResponse.json(
        {
          error: `Invalid buyerType. Must be one of: ${VALID_TIERS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const book = getBook(slug);
    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    const priceCents = getPriceForTier(book, buyerType);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Create Stripe checkout session
    // Stripe replaces {CHECKOUT_SESSION_ID} with the actual session ID on redirect
    const session = await createCheckoutSession({
      bookTitle: book.title,
      bookSlug: book.slug,
      priceCents,
      buyerEmail: email,
      buyerType,
      organization,
      successUrl: `${baseUrl}/api/download/{CHECKOUT_SESSION_ID}?check=true`,
      cancelUrl: `${baseUrl}/books/${slug}?cancelled=true`,
    });

    return NextResponse.json({
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
        downloadToken: session.id,
        book: book.title,
        tier: buyerType,
        price: {
          cents: priceCents,
          display: `$${(priceCents / 100).toFixed(2)}`,
        },
        instructions:
          "Complete payment at the checkoutUrl. After payment, use the sessionId as the download token: GET /api/download/{sessionId}?format=markdown_bundle",
      },
    });
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
