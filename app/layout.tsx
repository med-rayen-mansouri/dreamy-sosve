import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Petits Mondes",
  description: "Des événements SOS pensés pour chaque enfant.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
