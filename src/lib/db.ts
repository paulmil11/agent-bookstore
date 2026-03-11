import Database from "better-sqlite3";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const DB_PATH =
  process.env.NODE_ENV === "production"
    ? path.join("/tmp", "store.db")
    : path.join(process.cwd(), "data", "store.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS purchases (
        id TEXT PRIMARY KEY,
        buyer_email TEXT NOT NULL,
        buyer_name TEXT DEFAULT '',
        buyer_type TEXT NOT NULL CHECK(buyer_type IN ('personal', 'commercial', 'training')),
        organization TEXT DEFAULT '',
        book_slug TEXT NOT NULL,
        stripe_session_id TEXT,
        stripe_payment_intent TEXT,
        price_cents INTEGER NOT NULL,
        download_token TEXT UNIQUE NOT NULL,
        download_count INTEGER DEFAULT 0,
        max_downloads INTEGER DEFAULT 5,
        token_expires_at TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'expired')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_purchases_token ON purchases(download_token);
      CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(buyer_email);
      CREATE INDEX IF NOT EXISTS idx_purchases_stripe ON purchases(stripe_session_id);
    `);
  }
  return db;
}

export interface Purchase {
  id: string;
  buyer_email: string;
  buyer_name: string;
  buyer_type: string;
  organization: string;
  book_slug: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  price_cents: number;
  download_token: string;
  download_count: number;
  max_downloads: number;
  token_expires_at: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export function createPurchase(params: {
  buyerEmail: string;
  buyerName?: string;
  buyerType: string;
  organization?: string;
  bookSlug: string;
  stripeSessionId: string;
  priceCents: number;
}): Purchase {
  const id = uuidv4();
  const downloadToken = uuidv4();
  const tokenExpiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString(); // 7 days

  const stmt = getDb().prepare(`
    INSERT INTO purchases (id, buyer_email, buyer_name, buyer_type, organization, book_slug, stripe_session_id, price_cents, download_token, token_expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    params.buyerEmail,
    params.buyerName || "",
    params.buyerType,
    params.organization || "",
    params.bookSlug,
    params.stripeSessionId,
    params.priceCents,
    downloadToken,
    tokenExpiresAt
  );

  return getPurchaseById(id)!;
}

export function completePurchase(
  stripeSessionId: string,
  paymentIntent: string
): Purchase | null {
  const stmt = getDb().prepare(`
    UPDATE purchases
    SET status = 'completed', stripe_payment_intent = ?, completed_at = datetime('now')
    WHERE stripe_session_id = ? AND status = 'pending'
  `);
  stmt.run(paymentIntent, stripeSessionId);

  return getPurchaseByStripeSession(stripeSessionId);
}

export function getPurchaseById(id: string): Purchase | null {
  return getDb()
    .prepare("SELECT * FROM purchases WHERE id = ?")
    .get(id) as Purchase | null;
}

export function getPurchaseByStripeSession(
  sessionId: string
): Purchase | null {
  return getDb()
    .prepare("SELECT * FROM purchases WHERE stripe_session_id = ?")
    .get(sessionId) as Purchase | null;
}

export function getPurchaseByToken(token: string): Purchase | null {
  return getDb()
    .prepare("SELECT * FROM purchases WHERE download_token = ?")
    .get(token) as Purchase | null;
}

export function incrementDownloadCount(token: string): void {
  getDb()
    .prepare(
      "UPDATE purchases SET download_count = download_count + 1 WHERE download_token = ?"
    )
    .run(token);
}

