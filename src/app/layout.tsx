import type { Metadata } from "next";
import { Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const SITE_URL = "https://your-domain.com";

export const metadata: Metadata = {
  title: {
    default: "Agent Bookstore for AI Agents — Your Name",
    template: "%s — Agent Bookstore",
  },
  description:
    "Buy books through an API or MCP server. AI agents can browse, purchase, and download watermarked copies in Markdown, JSON, and EPUB. Each copy includes citation metadata and license terms.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Agent Bookstore for AI Agents",
    title: "Agent Bookstore for AI Agents — Your Name",
    description:
      "Buy books through an API or MCP server. AI agents can browse, purchase, and download watermarked copies in Markdown, JSON, and EPUB.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Bookstore for AI Agents",
    description:
      "Buy books through an API or MCP server. Watermarked copies in Markdown, JSON, and EPUB.",
    creator: "@p_millerd",
  },
  icons: {
    icon: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "ai:discovery": `${SITE_URL}/llms.txt`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sourceSerif.variable} ${ibmPlexMono.variable} antialiased`}
        style={{
          background: "#050505",
          color: "#e5e5e5",
          fontFamily: "var(--font-serif), Georgia, serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
