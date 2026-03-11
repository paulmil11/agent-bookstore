import fs from "fs";
import path from "path";

const BOOKS_DIR = path.resolve(process.cwd(), "content", "books");

/** Verify a resolved path stays inside BOOKS_DIR to prevent path traversal */
function assertInsideBooksDir(resolved: string): void {
  if (!resolved.startsWith(BOOKS_DIR + path.sep) && resolved !== BOOKS_DIR) {
    throw new Error("Invalid path");
  }
}

export interface BookChapter {
  file: string;
  title: string;
  number: number;
}

export interface BookPricing {
  personal: number; // cents
  commercial: number;
  training: number;
  quoteLicense: number;
}

export type BuyerTier =
  | "personal"
  | "commercial"
  | "training";

export interface BookMeta {
  slug: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  publisher: string;
  description: string;
  shortDescription: string;
  coverImage: string;
  sampleChapter: string;
  pricing: BookPricing;
  chapters: BookChapter[];
  citation: {
    apa: string;
    bibtex: string;
    mla: string;
  };
  tags: string[];
  pageCount: number;
  wordCount?: number;
  purchaseUrl: string;
}

export function listBooks(): BookMeta[] {
  const dirs = fs.readdirSync(BOOKS_DIR, { withFileTypes: true });
  return dirs
    .filter((d) => d.isDirectory())
    .map((d) => {
      const metaPath = path.join(BOOKS_DIR, d.name, "book.json");
      if (!fs.existsSync(metaPath)) return null;
      const raw = fs.readFileSync(metaPath, "utf-8");
      return JSON.parse(raw) as BookMeta;
    })
    .filter((b): b is BookMeta => b !== null);
}

export function getBook(slug: string): BookMeta | null {
  const metaPath = path.resolve(BOOKS_DIR, slug, "book.json");
  assertInsideBooksDir(metaPath);
  if (!fs.existsSync(metaPath)) return null;
  const raw = fs.readFileSync(metaPath, "utf-8");
  return JSON.parse(raw) as BookMeta;
}

export function getChapterContent(
  slug: string,
  chapterFile: string
): string | null {
  const chapterPath = path.resolve(BOOKS_DIR, slug, "chapters", chapterFile);
  assertInsideBooksDir(chapterPath);
  if (!fs.existsSync(chapterPath)) return null;
  return fs.readFileSync(chapterPath, "utf-8");
}

export function getAllChapters(
  slug: string
): { chapter: BookChapter; content: string }[] {
  const book = getBook(slug);
  if (!book) return [];
  return book.chapters
    .map((ch) => {
      const content = getChapterContent(slug, ch.file);
      if (!content) return null;
      return { chapter: ch, content };
    })
    .filter(
      (c): c is { chapter: BookChapter; content: string } => c !== null
    );
}

export function getSample(slug: string): string | null {
  const book = getBook(slug);
  if (!book) return null;
  const samplePath = path.resolve(BOOKS_DIR, slug, book.sampleChapter);
  assertInsideBooksDir(samplePath);
  if (!fs.existsSync(samplePath)) return null;
  return fs.readFileSync(samplePath, "utf-8");
}

export function getAgentsMd(slug: string): string | null {
  const agentsPath = path.resolve(BOOKS_DIR, slug, "AGENTS.md");
  assertInsideBooksDir(agentsPath);
  if (!fs.existsSync(agentsPath)) return null;
  return fs.readFileSync(agentsPath, "utf-8");
}

export function getPriceForTier(
  book: BookMeta,
  tier: BuyerTier
): number {
  return book.pricing[tier];
}

export function formatPriceDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
