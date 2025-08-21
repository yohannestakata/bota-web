import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Providers from "./providers";
import Footer from "@/components/layout/footer";
import SiteHeader from "@/components/layout/site-header";
import PageViewTracker from "@/components/analytics/page-view-tracker";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com",
  ),
  title: {
    default: "Bota — Discover the best places in Ethiopia",
    template: "%s — Bota",
  },
  description:
    "Discover top restaurants, cafes, and places to shop in Ethiopia. See real reviews, photos, menus, and ratings across Addis Ababa and beyond.",
  keywords: [
    "Ethiopia",
    "Addis Ababa",
    "restaurants",
    "cafes",
    "best places to dine",
    "shopping",
    "places to eat",
    "food",
    "coffee",
    "reviews",
  ],
  openGraph: {
    type: "website",
    siteName: "Bota",
    title: "Bota — Discover the best places in Ethiopia",
    description:
      "Discover top restaurants, cafes, and places to shop in Ethiopia. See real reviews, photos, menus, and ratings across Addis Ababa and beyond.",
    url: "/",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Bota — Discover the best places in Ethiopia",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@bota",
    creator: "@bota",
    title: "Bota — Discover the best places in Ethiopia",
    description:
      "Discover top restaurants, cafes, and places to shop in Ethiopia. See real reviews, photos, menus, and ratings across Addis Ababa and beyond.",
    images: ["/og-default.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${manrope.variable} ${inter.className} bg-background antialiased`}
      >
        <Providers>
          <PageViewTracker />
          <SiteHeader />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
