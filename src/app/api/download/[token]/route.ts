import { NextRequest, NextResponse } from "next/server";
import { retrieveCheckoutSession } from "@/lib/stripe";
import { generateMarkdownBundle, generateStructuredJson, generateWatermarkedEpub, type BundleParams } from "@/lib/formats";
import { getBook, type BuyerTier } from "@/lib/catalog";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const VALID_FORMATS = ["markdown_bundle", "structured_json", "epub"];
  const format = request.nextUrl.searchParams.get("format") || "markdown_bundle";
  const checkOnly = request.nextUrl.searchParams.get("check") === "true";

  if (!checkOnly && !VALID_FORMATS.includes(format)) {
    return NextResponse.json(
      { error: `Invalid format. Must be one of: ${VALID_FORMATS.join(", ")}` },
      { status: 400 }
    );
  }

  // Look up the Stripe checkout session directly
  let session;
  try {
    session = await retrieveCheckoutSession(token);
  } catch {
    return NextResponse.json(
      { error: "Invalid download token" },
      { status: 404 }
    );
  }

  const metadata = session.metadata || {};

  // Status check mode
  if (checkOnly) {
    return NextResponse.json({
      data: {
        status: session.payment_status === "paid" ? "completed" : "pending",
        book: metadata.book_slug,
        buyerEmail: metadata.buyer_email,
        buyerType: metadata.buyer_type,
        downloadUrl: session.payment_status === "paid"
          ? `/api/download/${token}?format=markdown_bundle`
          : null,
        formats: session.payment_status === "paid"
          ? {
              markdown_bundle: `/api/download/${token}?format=markdown_bundle`,
              structured_json: `/api/download/${token}?format=structured_json`,
              epub: `/api/download/${token}?format=epub`,
            }
          : null,
      },
    });
  }

  // Must be paid to download
  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Payment not yet completed" },
      { status: 402 }
    );
  }

  // Validate book slug from metadata
  const bookSlug = metadata.book_slug || "";
  if (!bookSlug || !getBook(bookSlug)) {
    return NextResponse.json(
      { error: "Invalid book in purchase record" },
      { status: 400 }
    );
  }

  const bundleParams: BundleParams = {
    bookSlug,
    buyerId: session.id,
    buyerEmail: metadata.buyer_email || session.customer_email || "",
    buyerName: metadata.buyer_email || session.customer_email || "",
    buyerType: (metadata.buyer_type || "personal") as BuyerTier,
    purchaseDate: new Date((session.created || 0) * 1000).toISOString(),
  };

  try {
    if (format === "structured_json") {
      const json = generateStructuredJson(bundleParams);
      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${bundleParams.bookSlug}-licensed.json"`,
        },
      });
    }

    if (format === "epub") {
      const epubBuffer = await generateWatermarkedEpub(bundleParams);
      return new NextResponse(new Uint8Array(epubBuffer), {
        headers: {
          "Content-Type": "application/epub+zip",
          "Content-Disposition": `attachment; filename="${bundleParams.bookSlug}-licensed.epub"`,
        },
      });
    }

    // Default: markdown bundle
    const zipBuffer = await generateMarkdownBundle(bundleParams);
    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${bundleParams.bookSlug}-licensed.zip"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to generate download" },
      { status: 500 }
    );
  }
}
