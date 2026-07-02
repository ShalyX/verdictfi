import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-display", subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"] });
const inter = Inter({ variable: "--font-body", subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({ variable: "--font-evidence", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "VerdictFi — Evidence-Led AI Market Verdicts",
  description: "A case-file style finance agent that turns SoSoValue market data into risk-checked evidence packets and outcome logs.",
  keywords: ["SoSoValue", "SoDEX", "AI finance", "evidence packet", "risk verdict", "WaveHack"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
