import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://botareview.com";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join Bota to discover top restaurants, cafes, and places in Ethiopia. Write reviews, upload photos, and share your favorite spots.",
  alternates: {
    canonical: `${baseUrl}/signup`,
  },
  openGraph: {
    title: "Create Account | Bota",
    description:
      "Join Bota to discover and review the best places in Ethiopia.",
    url: `${baseUrl}/signup`,
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
