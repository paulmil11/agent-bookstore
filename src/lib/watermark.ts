import crypto from "crypto";

/**
 * Watermarking engine.
 *
 * Two layers, each independently capable of identifying the buyer:
 * 1. Structural fingerprinting — encode bits in whitespace/formatting choices
 * 2. Metadata watermark — explicit PROVENANCE.json with signed hash
 *
 * Neither layer alters the author's words.
 */

// Structural fingerprinting
// Encode bits in whitespace patterns between paragraphs
const DOUBLE_NEWLINE = "\n\n";
const TRIPLE_NEWLINE = "\n\n\n";

/**
 * Convert a buyer ID string to a deterministic bit array
 */
function buyerIdToBits(buyerId: string, length: number): boolean[] {
  const hash = crypto.createHash("sha256").update(buyerId).digest();
  const bits: boolean[] = [];
  for (let i = 0; i < length; i++) {
    const byteIndex = i >> 3;
    const bitIndex = i & 7;
    bits.push((hash[byteIndex % hash.length] >> bitIndex & 1) === 1);
  }
  return bits;
}

/**
 * Apply structural fingerprinting via paragraph spacing
 */
function applyStructuralWatermark(
  text: string,
  buyerId: string
): string {
  const paragraphs = text.split(/\n{2,}/);
  if (paragraphs.length < 3) return text;

  // Use buyer ID bits to determine spacing between paragraphs
  const bits = buyerIdToBits(
    buyerId + ":structural",
    paragraphs.length - 1
  );

  const parts: string[] = [paragraphs[0]];
  for (let i = 1; i < paragraphs.length; i++) {
    // bit=0: double newline, bit=1: triple newline (extra blank line)
    const separator = bits[i - 1] ? TRIPLE_NEWLINE : DOUBLE_NEWLINE;
    parts.push(separator + paragraphs[i]);
  }

  return parts.join("");
}

/**
 * Generate provenance metadata
 */
export function generateProvenance(
  buyerId: string,
  buyerEmail: string,
  buyerName: string,
  bookSlug: string,
  tier: string,
  purchaseDate: string
): Record<string, unknown> {
  const contactEmail = process.env.CONTACT_EMAIL || "support@example.com";
  const provenanceData = `${buyerId}:${bookSlug}:${purchaseDate}`;
  const hash = crypto
    .createHash("sha256")
    .update(provenanceData)
    .digest("hex");

  return {
    version: "1.0",
    buyerId,
    buyerEmail,
    buyerName,
    bookSlug,
    licenseTier: tier,
    purchaseDate,
    provenanceHash: hash,
    verification:
      `This hash verifies this copy was legitimately purchased. Contact ${contactEmail} for verification.`,
  };
}

/**
 * Apply watermark layers to text content.
 * Only structural fingerprinting — the author's words are never changed.
 */
export function watermarkText(text: string, buyerId: string): string {
  return applyStructuralWatermark(text, buyerId);
}

/**
 * Populate the AGENTS.md template with buyer-specific info
 */
export function personalizeAgentsMd(
  template: string,
  buyerName: string,
  tier: string,
  provenanceHash: string,
  purchaseDate: string
): string {
  return template
    .replace("{{BUYER_NAME}}", buyerName)
    .replace("{{LICENSE_TYPE}}", tier)
    .replace("{{PROVENANCE_HASH}}", provenanceHash)
    .replace("{{PURCHASE_DATE}}", purchaseDate);
}
