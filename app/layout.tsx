import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0A0A",
};

export const metadata: Metadata = {
  title: "Jagadeesh | High-End Web, AI Agents & CRMs",
  description: "Strategic engineering & design by Jagadeesh. Building high-converting websites, autonomous AI agents, and bespoke CRM architectures.",
  keywords: ["Jagadeesh", "Solo Engineer", "Creative Developer", "AI Agents", "Custom CRM", "Next.js Portfolio", "Scrollytelling"],
  authors: [{ name: "Jagadeesh" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="bg-[#0A0A0A] text-white/60 antialiased selection:bg-white/20 selection:text-white min-h-screen">
        <div className="fixed inset-0 noise-overlay pointer-events-none z-50" />
        {children}
      </body>
    </html>
  );
}
