/**
 * Test script: verifies all three format generators produce valid output.
 * Run with: npx tsx scripts/test-formats.ts
 */
import { generateMarkdownBundle, generateStructuredJson, generateWatermarkedEpub, type BundleParams } from "../src/lib/formats";
import JSZip from "jszip";

const TEST_PARAMS: BundleParams = {
  bookSlug: "my-book",
  buyerId: "test-buyer-001",
  buyerEmail: "test@example.com",
  buyerName: "Test Buyer",
  buyerType: "personal",
  purchaseDate: "2026-03-10T00:00:00Z",
};

const GW_PARAMS: BundleParams = {
  ...TEST_PARAMS,
  bookSlug: "my-book",
  buyerId: "test-buyer-002",
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

async function testMarkdownBundle(params: BundleParams) {
  console.log(`\n📦 Testing Markdown Bundle: ${params.bookSlug}`);
  const buffer = await generateMarkdownBundle(params);
  assert(buffer.length > 0, `Output is non-empty (${(buffer.length / 1024).toFixed(1)}KB)`);

  const zip = await JSZip.loadAsync(buffer);
  const files = Object.keys(zip.files);

  // Check required files
  const prefix = params.bookSlug + "/";
  assert(files.includes(prefix + "AGENTS.md"), "Contains AGENTS.md");
  assert(files.includes(prefix + "LICENSE.md"), "Contains LICENSE.md");
  assert(files.includes(prefix + "CITATION.json"), "Contains CITATION.json");
  assert(files.includes(prefix + "meta.json"), "Contains meta.json");
  assert(files.includes(prefix + "PROVENANCE.json"), "Contains PROVENANCE.json");

  // Check chapters exist
  const chapterFiles = files.filter(f => f.startsWith(prefix + "chapters/") && f.endsWith(".md"));
  assert(chapterFiles.length > 0, `Contains ${chapterFiles.length} chapter files`);

  // Check AGENTS.md is personalized (no template placeholders)
  const agentsMd = await zip.file(prefix + "AGENTS.md")!.async("string");
  assert(!agentsMd.includes("{{BUYER_NAME}}"), "AGENTS.md buyer name is filled in");
  assert(!agentsMd.includes("{{LICENSE_TYPE}}"), "AGENTS.md license type is filled in");
  assert(!agentsMd.includes("{{PROVENANCE_HASH}}"), "AGENTS.md provenance hash is filled in");
  assert(agentsMd.includes(params.buyerName), `AGENTS.md contains buyer name "${params.buyerName}"`);

  // Check PROVENANCE.json
  const prov = JSON.parse(await zip.file(prefix + "PROVENANCE.json")!.async("string"));
  assert(prov.buyerEmail === params.buyerEmail, "PROVENANCE.json has correct email");
  assert(prov.licenseTier === params.buyerType, "PROVENANCE.json has correct tier");
  assert(typeof prov.provenanceHash === "string" && prov.provenanceHash.length === 64, "PROVENANCE.json has valid hash");

  // Check CITATION.json
  const citation = JSON.parse(await zip.file(prefix + "CITATION.json")!.async("string"));
  assert(typeof citation.apa === "string", "CITATION.json has APA format");
  assert(typeof citation.bibtex === "string", "CITATION.json has BibTeX format");

  // Check meta.json
  const meta = JSON.parse(await zip.file(prefix + "meta.json")!.async("string"));
  assert(typeof meta.title === "string" && meta.title.length > 0, `meta.json title: "${meta.title}"`);
  assert(typeof meta.isbn === "string" && meta.isbn.length > 0, `meta.json isbn: "${meta.isbn}"`);

  // Verify watermarking happened (chapters should differ between buyers)
  return { chapterFiles, zip, prefix };
}

async function testStructuredJson(params: BundleParams) {
  console.log(`\n📄 Testing Structured JSON: ${params.bookSlug}`);
  const json = generateStructuredJson(params);
  assert(json.length > 0, `Output is non-empty (${(json.length / 1024).toFixed(1)}KB)`);

  const parsed = JSON.parse(json);
  assert(parsed.format === "pathless-store-book", "Has correct format identifier");
  assert(parsed.version === "1.0", "Has version 1.0");

  // Metadata
  assert(typeof parsed.metadata.title === "string", `Title: "${parsed.metadata.title}"`);
  assert(typeof parsed.metadata.isbn === "string", `ISBN: "${parsed.metadata.isbn}"`);
  assert(typeof parsed.metadata.author === "string", `Author: "${parsed.metadata.author}"`);

  // License
  assert(parsed.license.licensedTo === (params.buyerName || params.buyerEmail), "License has correct licensee");
  assert(parsed.license.licenseTier === params.buyerType, "License has correct tier");
  assert(typeof parsed.license.provenanceHash === "string", "License has provenance hash");

  // Chapters
  assert(Array.isArray(parsed.chapters) && parsed.chapters.length > 0, `Has ${parsed.chapters.length} chapters`);
  assert(typeof parsed.chapters[0].content === "string" && parsed.chapters[0].content.length > 0, "Chapters have content");
  assert(typeof parsed.chapters[0].title === "string", "Chapters have titles");

  // Citation
  assert(typeof parsed.citation === "object", "Has citation data");

  return parsed;
}

async function testEpub(params: BundleParams) {
  console.log(`\n📖 Testing EPUB: ${params.bookSlug}`);
  const buffer = await generateWatermarkedEpub(params);
  assert(buffer.length > 0, `Output is non-empty (${(buffer.length / 1024).toFixed(1)}KB)`);

  const zip = await JSZip.loadAsync(buffer);
  const files = Object.keys(zip.files);

  // Check PROVENANCE.json was added
  assert(files.includes("PROVENANCE.json"), "Contains PROVENANCE.json");
  const prov = JSON.parse(await zip.file("PROVENANCE.json")!.async("string"));
  assert(prov.buyerEmail === params.buyerEmail, "PROVENANCE.json has correct email");

  // Check OPF has license metadata
  const opfFiles = files.filter(f => f.endsWith(".opf"));
  assert(opfFiles.length > 0, `Has ${opfFiles.length} OPF file(s)`);

  if (opfFiles.length > 0) {
    const opf = await zip.file(opfFiles[0])!.async("string");
    assert(opf.includes("pathless:licensedTo"), "OPF contains licensedTo metadata");
    assert(opf.includes("pathless:provenanceHash"), "OPF contains provenanceHash metadata");
    assert(opf.includes(params.buyerEmail), "OPF contains buyer email");
  }

  // Check XHTML files exist (content)
  const xhtmlFiles = files.filter(f => f.endsWith(".xhtml") || f.endsWith(".html"));
  assert(xhtmlFiles.length > 0, `Has ${xhtmlFiles.length} XHTML content files`);

  // Verify mimetype file (required for valid EPUB)
  assert(files.includes("mimetype"), "Contains mimetype file");
  if (files.includes("mimetype")) {
    const mimetype = await zip.file("mimetype")!.async("string");
    assert(mimetype.trim() === "application/epub+zip", "Mimetype is correct");
  }

  return buffer;
}

async function testWatermarkDifference() {
  console.log("\n🔍 Testing watermark uniqueness (two buyers, same book)");

  const buyer1Params: BundleParams = {
    bookSlug: "my-book",
    buyerId: "buyer-alpha-111",
    buyerEmail: "alpha@example.com",
    buyerName: "Alpha Buyer",
    buyerType: "personal",
    purchaseDate: "2026-03-10T00:00:00Z",
  };

  const buyer2Params: BundleParams = {
    ...buyer1Params,
    buyerId: "buyer-beta-222",
    buyerEmail: "beta@example.com",
    buyerName: "Beta Buyer",
  };

  const json1 = JSON.parse(generateStructuredJson(buyer1Params));
  const json2 = JSON.parse(generateStructuredJson(buyer2Params));

  // Same chapter content should differ due to watermarking
  const ch1 = json1.chapters[0].content;
  const ch2 = json2.chapters[0].content;
  assert(ch1 !== ch2, "Same chapter produces different content for different buyers");
  assert(json1.license.provenanceHash !== json2.license.provenanceHash, "Different provenance hashes for different buyers");
}

async function main() {
  console.log("=== Format Generator Verification ===\n");

  // Test all formats for The Pathless Path
  await testMarkdownBundle(TEST_PARAMS);
  await testStructuredJson(TEST_PARAMS);
  await testEpub(TEST_PARAMS);

  // Test all formats for Good Work
  await testMarkdownBundle(GW_PARAMS);
  await testStructuredJson(GW_PARAMS);
  await testEpub(GW_PARAMS);

  // Test watermark uniqueness
  await testWatermarkDifference();

  console.log(`\n${"=".repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("✅ All format generators working correctly!");
  }
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
