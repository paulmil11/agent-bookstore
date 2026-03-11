import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { sendPurchaseEmail } from "@/lib/email";
import { getBook } from "@/lib/catalog";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    const event = await constructWebhookEvent(body, signature);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata || {};

      if (metadata.type === "book_purchase") {
        const book = getBook(metadata.book_slug || "");
        const bookTitle = book?.title || metadata.book_slug || "Unknown Book";

        console.log(
          `Purchase completed: ${metadata.book_slug} by ${metadata.buyer_email} (${metadata.buyer_type})`
        );

        // Send download email
        try {
          await sendPurchaseEmail({
            buyerEmail: metadata.buyer_email || session.customer_email || "",
            bookTitle,
            bookSlug: metadata.book_slug || "",
            buyerType: metadata.buyer_type || "personal",
            sessionId: session.id,
            priceCents: session.amount_total || 0,
          });
          console.log(`Download email sent to ${metadata.buyer_email}`);
        } catch (emailError) {
          console.error("Failed to send purchase email:", emailError);
          // Don't fail the webhook — payment is still valid
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
