import type { Metadata } from "next";
import { Newsreader, Public_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const publicSans = Public_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const spaceMono = Space_Mono({ variable: "--font-evidence", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "VerdictFi — Evidence-Led AI Market Verdicts",
  description: "A case-file style finance agent that turns SoSoValue market data into risk-checked evidence packets and outcome logs.",
  keywords: ["SoSoValue", "SoDEX", "AI finance", "evidence packet", "risk verdict", "WaveHack"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${newsreader.variable} ${publicSans.variable} ${spaceMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
