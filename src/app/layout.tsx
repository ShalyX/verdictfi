import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const ibmPlexSans = IBM_Plex_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const ibmPlexMono = IBM_Plex_Mono({ variable: "--font-evidence", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "VerdictFi — Evidence-Led AI Market Verdicts",
  description: "A case-file style finance agent that turns SoSoValue market data into risk-checked evidence packets and outcome logs.",
  keywords: ["SoSoValue", "SoDEX", "AI finance", "evidence packet", "risk verdict", "WaveHack"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sourceSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
