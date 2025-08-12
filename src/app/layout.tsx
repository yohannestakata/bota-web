import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Providers from "./providers";
import Footer from "@/components/layout/footer";
import { Brand, NavigationMenu, UserActions } from "@/features/home";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bota",
  description: "Bota",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${inter.className} bg-background antialiased`}
      >
        <header>
          <div className="relative container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Brand />
            <NavigationMenu />
            <UserActions />
          </div>
        </header>
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}
