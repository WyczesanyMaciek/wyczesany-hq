import type { Metadata } from "next";
import { Nunito, Inter } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

// Inter — font dashboardu (Linear-style). Nunito zostaje na stronach
// service'owych (settings, dev/logs) przez klase .linear-app scope'owana.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Wyczesany HQ",
  description: "Centrum dowodzenia Maćka — tasker i dashboard projektów",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${nunito.variable} ${inter.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        style={{
          fontFamily: "var(--font-nunito), 'Nunito', -apple-system, sans-serif",
          background: "var(--bg-base)",
          color: "var(--text-primary)",
          fontSize: 15,
          WebkitFontSmoothing: "antialiased",
        }}
      >{children}</body>
    </html>
  );
}
