import crypto from "crypto";

/**
 * Steganographic watermarking engine.
 *
 * Three layers, each independently capable of identifying the buyer:
 * 1. Synonym substitution — swap semantically equivalent words at predetermined positions
 * 2. Structural fingerprinting — encode bits in whitespace/formatting choices
 * 3. Metadata watermark — explicit PROVENANCE.json with signed hash
 */

// Layer 1: Synonym substitution pairs
// Each pair is [optionA, optionB] — the buyer ID bit determines which is used
const SYNONYM_PAIRS: [string, string][] = [
  ["began", "started"],
  ["however", "nevertheless"],
  ["important", "significant"],
  ["shows", "demonstrates"],
  ["helps", "assists"],
  ["uses", "utilizes"],
  ["enough", "sufficient"],
  ["keeps", "maintains"],
  ["needs", "requires"],
  ["gets", "obtains"],
  ["looks", "appears"],
  ["thinks", "believes"],
  ["seems", "appears"],
  ["often", "frequently"],
  ["almost", "nearly"],
  ["also", "additionally"],
  ["big", "large"],
  ["small", "little"],
  ["fast", "quick"],
  ["hard", "difficult"],
  ["simple", "straightforward"],
  ["entire", "whole"],
  ["mainly", "primarily"],
  ["perhaps", "maybe"],
  ["surely", "certainly"],
  ["truly", "genuinely"],
  ["basic", "fundamental"],
  ["obvious", "apparent"],
  ["clearly", "evidently"],
  ["finally", "ultimately"],
];

// Layer 2: Structural fingerprinting
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
 * Layer 1: Apply synonym substitution watermark
 */
function applySynonymWatermark(text: string, buyerId: string): string {
  const bits = buyerIdToBits(buyerId, SYNONYM_PAIRS.length);
  let result = text;

  for (let i = 0; i < SYNONYM_PAIRS.length; i++) {
    const [optA, optB] = SYNONYM_PAIRS[i];
    const chosen = bits[i] ? optB : optA;
    const other = bits[i] ? optA : optB;

    const regex = new RegExp(`\\b${escapeRegex(other)}\\b`, "gi");
    result = result.replace(regex, (match) => {
      if (match[0] === match[0].toUpperCase()) {
        return chosen.charAt(0).toUpperCase() + chosen.slice(1);
      }
      return chosen;
    });
  }

  return result;
}

/**
 * Layer 2: Apply structural fingerprinting via paragraph spacing
 */
function applyStructuralWatermark(text: string, buyerId: string): string {
  const paragraphs = text.split(/\n{2,}/);
  if (paragraphs.length < 3) return text;

  const bits = buyerIdToBits(buyerId + ":structural", paragraphs.length - 1);

  const parts: string[] = [paragraphs[0]];
  for (let i = 1; i < paragraphs.length; i++) {
    const separator = bits[i - 1] ? TRIPLE_NEWLINE : DOUBLE_NEWLINE;
    parts.push(separator + paragraphs[i]);
  }

  return parts.join("");
}

/**
 * Layer 3: Generate provenance metadata
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
 * Apply all watermark layers to text content
 */
export function watermarkText(text: string, buyerId: string): string {
  let result = text;
  result = applySynonymWatermark(result, buyerId);
  result = applyStructuralWatermark(result, buyerId);
  return result;
}

/**
 * Attempt to extract buyer ID from watermarked text
 */
export function extractWatermarkBits(
  text: string
): { bit: number; pair: string; found: string }[] {
  const findings: { bit: number; pair: string; found: string }[] = [];

  for (let i = 0; i < SYNONYM_PAIRS.length; i++) {
    const [optA, optB] = SYNONYM_PAIRS[i];
    const regexA = new RegExp(`\\b${escapeRegex(optA)}\\b`, "gi");
    const regexB = new RegExp(`\\b${escapeRegex(optB)}\\b`, "gi");

    const hasA = regexA.test(text);
    const hasB = regexB.test(text);

    if (hasA && !hasB) {
      findings.push({ bit: 0, pair: `${optA}/${optB}`, found: optA });
    } else if (hasB && !hasA) {
      findings.push({ bit: 1, pair: `${optA}/${optB}`, found: optB });
    }
  }

  return findings;
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

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
