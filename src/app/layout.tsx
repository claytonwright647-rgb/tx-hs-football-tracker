import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Texas HS Football Tracker | UIL & TAPPS",
  description: "Live scores, standings, playoffs, and rankings for Texas high school football. UIL 6A-1A (including Six-Man) and TAPPS coverage.",
  keywords: "Texas high school football, UIL football, TAPPS football, Texas football scores, high school playoffs, six-man football",
  authors: [{ name: "Wright Sports" }],
  openGraph: {
    title: "Texas HS Football Tracker",
    description: "Live scores and standings for Texas high school football",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
