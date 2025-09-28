export const metadata = {
  robots: { index: false, follow: false, nocache: true },
} satisfies import("next").Metadata;

export default function DeleteAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
