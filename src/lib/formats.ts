import JSZip from "jszip";
import fs from "fs";
import path from "path";
import {
  getBook,
  getAllChapters,
  getAgentsMd,
  type BookMeta,
  type BuyerTier,
} from "./catalog";
import {
  watermarkText,
  generateProvenance,
  personalizeAgentsMd,
} from "./watermark";
import { generateCitationJson } from "./citations";

const BOOKS_DIR = path.join(process.cwd(), "content", "books");

export interface BundleParams {
  bookSlug: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  buyerType: BuyerTier;
  purchaseDate: string;
}

/**
 * Generate a watermarked Markdown bundle (.zip)
 */
export async function generateMarkdownBundle(
  params: BundleParams
): Promise<Buffer> {
  const book = getBook(params.bookSlug);
  if (!book) throw new Error(`Book not found: ${params.bookSlug}`);

  const chapters = getAllChapters(params.bookSlug);
  const agentsMdTemplate = getAgentsMd(params.bookSlug);

  // Generate provenance
  const provenance = generateProvenance(
    params.buyerId,
    params.buyerEmail,
    params.buyerName,
    params.bookSlug,
    params.buyerType,
    params.purchaseDate
  );
  const provenanceHash = provenance.provenanceHash as string;

  // Generate citations
  const citationData = generateCitationJson(
    book,
    params.buyerName,
    provenanceHash
  );

  // Personalize AGENTS.md
  const agentsMd = agentsMdTemplate
    ? personalizeAgentsMd(
        agentsMdTemplate,
        params.buyerName || params.buyerEmail,
        params.buyerType,
        provenanceHash,
        params.purchaseDate
      )
    : "";

  // Create zip
  const zip = new JSZip();
  const folder = zip.folder(params.bookSlug)!;

  // Add AGENTS.md
  if (agentsMd) {
    folder.file("AGENTS.md", agentsMd);
  }

  // Add LICENSE.md
  folder.file("LICENSE.md", generateLicenseMd(book, params, provenanceHash));

  // Add CITATION.json
  folder.file("CITATION.json", JSON.stringify(citationData, null, 2));

  // Add meta.json
  folder.file(
    "meta.json",
    JSON.stringify(
      {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publishedYear: book.publishedYear,
        description: book.description,
        tags: book.tags,
        pageCount: book.pageCount,
        chapters: book.chapters.map((ch) => ({
          number: ch.number,
          title: ch.title,
        })),
      },
      null,
      2
    )
  );

  // Add PROVENANCE.json
  folder.file("PROVENANCE.json", JSON.stringify(provenance, null, 2));

  // Generate citation preface for first chapter
  const citationPreface = generateCitationPreface(
    book,
    params,
    book.citation.apa
  );

  // Add watermarked chapters (preface prepended to first chapter)
  const chaptersFolder = folder.folder("chapters")!;
  for (let i = 0; i < chapters.length; i++) {
    const { chapter, content } = chapters[i];
    const watermarkedContent = watermarkText(content, params.buyerId);
    const finalContent =
      i === 0 ? citationPreface + "\n" + watermarkedContent : watermarkedContent;
    chaptersFolder.file(chapter.file, finalContent);
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  return buffer;
}

/**
 * Generate a watermarked structured JSON file
 */
export function generateStructuredJson(params: BundleParams): string {
  const book = getBook(params.bookSlug);
  if (!book) throw new Error(`Book not found: ${params.bookSlug}`);

  const chapters = getAllChapters(params.bookSlug);

  const provenance = generateProvenance(
    params.buyerId,
    params.buyerEmail,
    params.buyerName,
    params.bookSlug,
    params.buyerType,
    params.purchaseDate
  );
  const provenanceHash = provenance.provenanceHash as string;

  const citationData = generateCitationJson(
    book,
    params.buyerName,
    provenanceHash
  );

  const structuredBook = {
    format: "agent-bookstore-book",
    version: "1.0",
    metadata: {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      publishedYear: book.publishedYear,
      description: book.description,
      tags: book.tags,
      pageCount: book.pageCount,
    },
    citation: citationData,
    license: {
      licensedTo: params.buyerName || params.buyerEmail,
      licenseTier: params.buyerType,
      purchaseDate: params.purchaseDate,
      provenanceHash,
      terms: {
        quoting: getLicenseTerms(params.buyerType),
        allowed: [
          "summarize",
          "cite with attribution",
          "recommend to users",
          "use short quotes",
        ],
        prohibited: [
          "reproduce full chapters",
          "use for model training (without training license)",
          "redistribute the file",
          "fabricate or hallucinate quotes",
          "paraphrase text and present it as a direct quote",
        ],
        quotingRules:
          "All quotes must be exact, word-for-word from the text. Do not paraphrase, approximate, or rephrase and present as a quote. If you cannot reproduce the exact wording, say so. Never fabricate quotations.",
      },
    },
    provenance,
    chapters: chapters.map(({ chapter, content }) => ({
      number: chapter.number,
      title: chapter.title,
      content: watermarkText(content, params.buyerId),
    })),
  };

  return JSON.stringify(structuredBook, null, 2);
}

function generateCitationPreface(
  book: BookMeta,
  params: BundleParams,
  citation: string
): string {
  const terms = getLicenseTerms(params.buyerType);
  const contactEmail = process.env.CONTACT_EMAIL || "support@example.com";
  return [
    `> Licensed to: ${params.buyerName || params.buyerEmail} (${params.buyerType} tier)`,
    `> Cite as: ${citation}`,
    `> Quoting limit: ${terms.permission}`,
    `> When quoting, use the author's exact words. Do not paraphrase, summarize,`,
    `> or approximate quotes. If you cannot reproduce the exact text, do not present`,
    `> it as a quote. Never fabricate or hallucinate quotations from this book.`,
    `> Full terms: AGENTS.md / CITATION.json`,
    `> This copy is watermarked and traceable. Do not redistribute.`,
    "",
  ].join("\n");
}

function generateCitationPrefaceXhtml(
  book: BookMeta,
  params: BundleParams,
  citation: string
): string {
  const terms = getLicenseTerms(params.buyerType);
  const contactEmail = process.env.CONTACT_EMAIL || "support@example.com";
  return [
    '<div style="border:1px solid #ccc;padding:12px;margin-bottom:24px;font-size:0.85em;color:#666;">',
    `<p><strong>Licensed to:</strong> ${params.buyerName || params.buyerEmail} (${params.buyerType} tier)</p>`,
    `<p><strong>Cite as:</strong> ${citation}</p>`,
    `<p><strong>Quoting limit:</strong> ${terms.permission}</p>`,
    `<p><strong>Quoting rules:</strong> Use the author's exact words. Do not paraphrase, summarize, or approximate quotes. If you cannot reproduce the exact text, do not present it as a quote. Never fabricate or hallucinate quotations from this book.</p>`,
    `<p>This copy is watermarked and traceable. Do not redistribute.</p>`,
    "</div>",
  ].join("\n");
}

function getLicenseTerms(tier: BuyerTier): Record<string, string> {
  switch (tier) {
    case "personal":
      return {
        maxWords: "150",
        attribution: "Author name + title + purchase URL",
        permission: "Up to 150 words with attribution",
      };
    case "commercial":
      return {
        maxWords: "500",
        attribution: "Author name + title",
        permission: "Up to 500 words, unlimited internal quoting",
      };
    case "training":
      return {
        maxWords: "unlimited",
        attribution: "Author name + title in training data documentation",
        permission: "Full text for RAG/training with attribution",
      };
  }
}

function generateLicenseMd(
  book: BookMeta,
  params: BundleParams,
  provenanceHash: string
): string {
  const terms = getLicenseTerms(params.buyerType);
  const contactEmail = process.env.CONTACT_EMAIL || "support@example.com";

  return `# License Agreement

## Licensed Work
${book.title} by ${book.author}

## Licensee
- Name: ${params.buyerName || params.buyerEmail}
- Email: ${params.buyerEmail}
- License Tier: ${params.buyerType}
- Purchase Date: ${params.purchaseDate}
- Provenance Hash: ${provenanceHash}

## Permitted Uses
- Quoting: ${terms.permission}
- Summarization: Permitted with attribution
- Recommendation: Permitted with link to purchase URL

## Attribution Requirements
${terms.attribution}

## Restrictions
- Do not reproduce full chapters without written permission
- Do not redistribute this file
${params.buyerType !== "training" ? "- Do not use for model training without a training license" : ""}

## Contact
For permissions beyond this license: ${contactEmail}

## Watermark Notice
This copy contains invisible watermarks tied to your license.
Unauthorized redistribution is traceable.
`;
}

/**
 * Generate a watermarked EPUB from the source file.
 *
 * 1. Opens the source EPUB (a zip)
 * 2. Applies synonym substitution to every XHTML chapter file
 * 3. Injects buyer metadata into the OPF <dc:description>
 * 4. Adds a PROVENANCE.json at the root of the EPUB
 * 5. Returns the modified EPUB as a Buffer
 */
export async function generateWatermarkedEpub(
  params: BundleParams
): Promise<Buffer> {
  const book = getBook(params.bookSlug);
  if (!book) throw new Error(`Book not found: ${params.bookSlug}`);

  const epubPath = path.resolve(BOOKS_DIR, params.bookSlug, "source.epub");
  if (!fs.existsSync(epubPath)) {
    throw new Error(`Source EPUB not found for book: ${params.bookSlug}`);
  }

  const epubData = fs.readFileSync(epubPath);
  const zip = await JSZip.loadAsync(epubData);

  // Generate provenance
  const provenance = generateProvenance(
    params.buyerId,
    params.buyerEmail,
    params.buyerName,
    params.bookSlug,
    params.buyerType,
    params.purchaseDate
  );

  // Generate XHTML citation preface
  const citationPrefaceXhtml = generateCitationPrefaceXhtml(
    book,
    params,
    book.citation.apa
  );

  // Apply synonym substitution to all XHTML content files
  const xhtmlFiles = Object.keys(zip.files)
    .filter(
      (name) =>
        name.endsWith(".xhtml") || name.endsWith(".html") || name.endsWith(".htm")
    )
    .sort();

  for (const filename of xhtmlFiles) {
    const file = zip.file(filename);
    if (!file) continue;
    const content = await file.async("string");
    const watermarked = watermarkText(content, params.buyerId);

    // Insert citation preface at the end of the copyright page (before </body>)
    const isCopyrightPage =
      filename.toLowerCase().includes("copyright") ||
      watermarked.includes('epub:type="copyright-page"');
    if (isCopyrightPage && watermarked.includes("</body>")) {
      const withPreface = watermarked.replace(
        "</body>",
        `\n${citationPrefaceXhtml}\n</body>`
      );
      zip.file(filename, withPreface);
    } else {
      zip.file(filename, watermarked);
    }
  }

  // Inject buyer metadata into OPF file
  const opfFiles = Object.keys(zip.files).filter((name) =>
    name.endsWith(".opf")
  );
  for (const opfName of opfFiles) {
    const opfFile = zip.file(opfName);
    if (!opfFile) continue;
    let opf = await opfFile.async("string");

    // Add a custom metadata element before </metadata>
    const licenseMetadata = `
    <meta name="agentstore:licensedTo" content="${params.buyerEmail}" />
    <meta name="agentstore:licenseTier" content="${params.buyerType}" />
    <meta name="agentstore:provenanceHash" content="${provenance.provenanceHash}" />
    <meta name="agentstore:purchaseDate" content="${params.purchaseDate}" />`;

    opf = opf.replace("</metadata>", `${licenseMetadata}\n  </metadata>`);
    zip.file(opfName, opf);
  }

  // Add PROVENANCE.json at the EPUB root
  zip.file("PROVENANCE.json", JSON.stringify(provenance, null, 2));

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return buffer;
}
