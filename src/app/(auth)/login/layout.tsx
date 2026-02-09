import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Bota account to leave reviews, save favorite places, and discover the best restaurants and cafes in Ethiopia.",
  alternates: {
    canonical: `${baseUrl}/login`,
  },
  openGraph: {
    title: "Sign In | Bota",
    description:
      "Sign in to Bota to discover and review the best places in Ethiopia.",
    url: `${baseUrl}/login`,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
