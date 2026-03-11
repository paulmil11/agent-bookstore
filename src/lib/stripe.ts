import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });
  }
  return _stripe;
}

export interface CreateCheckoutParams {
  bookTitle: string;
  bookSlug: string;
  priceCents: number;
  buyerEmail: string;
  buyerType: string;
  organization?: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<Stripe.Checkout.Session> {
  const tierLabel = params.buyerType.charAt(0).toUpperCase() + params.buyerType.slice(1);

  const session = await getStripe().checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: params.bookTitle,
            description: `${tierLabel} License — Agent-readable book with citation instructions`,
            metadata: {
              book_slug: params.bookSlug,
              buyer_type: params.buyerType,
              organization: params.organization || "",
            },
          },
          unit_amount: params.priceCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    allow_promotion_codes: true,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.buyerEmail,
    metadata: {
      book_slug: params.bookSlug,
      buyer_type: params.buyerType,
      buyer_email: params.buyerEmail,
      organization: params.organization || "",
      type: "book_purchase",
    },
  });

  return session;
}

export async function constructWebhookEvent(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return getStripe().webhooks.constructEvent(body, signature, secret);
}

export async function retrieveCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.retrieve(sessionId);
}
