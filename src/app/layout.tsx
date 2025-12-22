import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Texas HS Football Tracker | UIL & TAPPS",
  description: "Live scores, standings, and playoff brackets for Texas high school football. Track UIL 6A through 1A Six-Man and TAPPS divisions.",
  keywords: "Texas high school football, UIL football, TAPPS football, Texas playoffs, six-man football",
  openGraph: {
    title: "Texas HS Football Tracker",
    description: "Live scores and standings for 1,400+ Texas high school football teams",
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
