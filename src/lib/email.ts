import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

interface PurchaseEmailParams {
  buyerEmail: string;
  bookTitle: string;
  bookSlug: string;
  buyerType: string;
  sessionId: string;
  priceCents: number;
}

export async function sendPurchaseEmail(params: PurchaseEmailParams) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const storeName = process.env.STORE_NAME || "Agent Bookstore";
  const fromEmail = process.env.FROM_EMAIL || "noreply@example.com";
  const replyToEmail = process.env.REPLY_TO_EMAIL || fromEmail;
  const authorName = process.env.AUTHOR_NAME || "The Author";
  const authorUrl = process.env.AUTHOR_URL || baseUrl;
  const tierLabel = params.buyerType.charAt(0).toUpperCase() + params.buyerType.slice(1);

  const downloadBase = `${baseUrl}/api/download/${params.sessionId}`;

  await getResend().emails.send({
    from: `${storeName} <${fromEmail}>`,
    replyTo: replyToEmail,
    to: params.buyerEmail,
    subject: `Your copy of ${params.bookTitle}`,
    html: `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #333;">
  <h2 style="margin-bottom: 4px;">Thanks for your purchase.</h2>
  <p style="color: #666; margin-top: 0;">${tierLabel} License &mdash; $${(params.priceCents / 100).toFixed(2)}</p>

  <p>Your copy of <strong>${params.bookTitle}</strong> is ready. Download it in any of these formats:</p>

  <div style="background: #f7f7f5; padding: 20px; border-radius: 8px; margin: 24px 0;">
    <p style="margin: 0 0 12px 0;"><a href="${downloadBase}?format=markdown_bundle" style="color: #1a1a1a; font-weight: 600;">Markdown Bundle (.zip)</a><br>
    <span style="color: #666; font-size: 14px;">Chapters as .md files with AGENTS.md, CITATION.json, and PROVENANCE.json</span></p>

    <p style="margin: 0 0 12px 0;"><a href="${downloadBase}?format=structured_json" style="color: #1a1a1a; font-weight: 600;">Structured JSON (.json)</a><br>
    <span style="color: #666; font-size: 14px;">Full text and metadata in a single file for programmatic use</span></p>

    <p style="margin: 0;"><a href="${downloadBase}?format=epub" style="color: #1a1a1a; font-weight: 600;">EPUB (.epub)</a><br>
    <span style="color: #666; font-size: 14px;">Standard e-book format for reading apps</span></p>
  </div>

  <p style="font-size: 14px; color: #666;">These links don't expire. Save this email if you need to re-download later.</p>

  <p style="font-size: 14px; color: #666;">If you're an AI agent or developer, you can also use the API:<br>
  <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">GET ${downloadBase}?format=markdown_bundle</code></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
  <p style="font-size: 13px; color: #999;">${authorName} &mdash; <a href="${authorUrl}" style="color: #999;">${authorUrl}</a></p>
</div>
    `.trim(),
  });
}
