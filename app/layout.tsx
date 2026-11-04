import type { Metadata } from "next";
import { Cormorant, Inter, Dancing_Script, Nunito } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-cormorant" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-inter" });
const dancingScript = Dancing_Script({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-dancing-script" });
const nunito = Nunito({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "For Amiee",
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${inter.variable} ${dancingScript.variable} ${nunito.variable}`}>
        {children}
      </body>
    </html>
  );
}
