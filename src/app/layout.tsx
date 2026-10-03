import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life Tracker — Basant",
  description: "Track energy, nutrition, calisthenics, steps, and yearly consistency with daily points.",
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/app-icon.png",
    apple: "/assets/app-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0F0D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0F0D] text-[#F4F4F5] min-h-screen selection:bg-[#22C55E]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
