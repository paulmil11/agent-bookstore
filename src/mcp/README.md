# Agent Bookstore MCP Server

MCP server for your agent-first bookstore — sell books in agent-readable formats.

## What It Does

Gives AI agents tools to browse, purchase, and download your books as watermarked, citable files with machine-readable licensing.

## Quick Start

### Claude Desktop / Cursor

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agent-bookstore": {
      "command": "npx",
      "args": ["-y", "@your-scope/bookstore"]
    }
  }
}
```

### Other MCP Clients

```json
{
  "command": "npx",
  "args": ["-y", "@your-scope/bookstore"]
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `browse_catalog` | List all books with pricing, descriptions, samples |
| `get_book_info` | Detailed info for a specific book — TOC, citations, sample |
| `purchase` | Start a Stripe checkout for a book |
| `get_citation` | Get citation in APA, MLA, BibTeX, Chicago, JSON-LD |
| `check_purchase` | Check if a payment has completed |
| `download` | Get the watermarked book in Markdown, JSON, or EPUB |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_BOOKSTORE_URL` | `http://localhost:3000` | API base URL |

## License

MIT
