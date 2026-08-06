import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Texas HS Football Tracker | UIL & TAPPS",
  description: "Officially sourced Texas high school football game center, live scores, schedules, and current-season publication status for UIL and TAPPS.",
  keywords: "Texas high school football, UIL football, TAPPS football, Texas playoffs, six-man football",
  openGraph: {
    title: "Texas HS Football Tracker",
    description: "Officially sourced live scores, schedules, and current-season status for Texas high school football",
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
