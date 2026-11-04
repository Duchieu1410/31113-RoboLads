import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P, Inter, Silkscreen, Oxanium, Chakra_Petch } from "next/font/google";
import { PixelProviders } from "@/components/pixel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  variable: "--font-silkscreen",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-oxanium",
  display: "swap",
});

const chakraPetch = Chakra_Petch({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-chakra",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HSGS ROBOLADS - FTC 31113",
  description: "Official website of HSGS RoboLads - FIRST Tech Challenge Team #31113",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart2P.variable} ${silkscreen.variable} ${inter.variable} ${oxanium.variable} ${chakraPetch.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <PixelProviders>{children}</PixelProviders>
      </body>
    </html>
  );
}
