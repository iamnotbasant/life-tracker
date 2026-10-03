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
  themeColor: "#070A11",
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
      <body className="bg-[#070A11] text-[#F8FAFC] min-h-screen selection:bg-[#FF5E1E] selection:text-white">
        {children}
      </body>
    </html>
  );
}
