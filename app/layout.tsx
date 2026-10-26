import type { Metadata } from "next";
import { Antonio, Geist, Geist_Mono } from "next/font/google";
import "./sportsbook.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Storefront display and price numerals.
const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Openfront Sportsbook",
  description: "Fixed-odds sportsbook: live and upcoming prices, bet slip, wallet and safer-play controls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={antonio.variable}>
      <head>
        <link href="/favicon.svg" rel="icon" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
