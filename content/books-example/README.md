# Book Content Structure

This directory shows the expected structure for books. Your real book content goes in `content/books/` (which is gitignored).

## Setup

```bash
# Copy the example and customize
cp -r content/books-example/my-book content/books/your-book-slug
```

## Required structure per book

```
content/books/your-book-slug/
├── book.json           # Metadata: title, pricing, chapters, citations
├── AGENTS.md           # Machine-readable citation & licensing for AI agents
├── sample.md           # Free sample chapter (returned by API without purchase)
├── source.epub         # Original EPUB file (optional, for EPUB format generation)
└── chapters/
    ├── 01-introduction.md
    ├── 02-chapter-two.md
    └── ...
```

## book.json fields

| Field | Type | Description |
|-------|------|-------------|
| `slug` | string | URL-safe identifier, matches directory name |
| `title` | string | Full book title |
| `author` | string | Author name |
| `isbn` | string | ISBN-13 |
| `publishedYear` | number | Publication year |
| `publisher` | string | Publisher name |
| `description` | string | Long description for storefront |
| `shortDescription` | string | One-liner for catalog |
| `pricing.personal` | number | Price in cents for personal tier |
| `pricing.commercial` | number | Price in cents for commercial tier |
| `pricing.training` | number | Price in cents for training tier |
| `chapters` | array | `[{ file, title, number }]` — ordered chapter list |
| `citation` | object | `{ apa, bibtex, mla }` — pre-formatted citation strings |
| `pageCount` | number | Total pages |
| `wordCount` | number | Total words (optional) |

## Notes

- Chapter filenames in `book.json` must match actual files in `chapters/`
- The `sample.md` file path is specified in `book.json` as `sampleChapter`
- `source.epub` is only needed if you want to offer EPUB downloads
- Pricing is always in cents (e.g., 2500 = $25.00)
