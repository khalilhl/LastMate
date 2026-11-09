import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import AnnouncementBanner from "@/components/layout/AnnouncementBanner";
import MaintenanceShield from "@/components/layout/MaintenanceShield";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "LastMate 🎮 — Find Your Last VALORANT Teammate",
  description:
    "Looking for one more teammate? Discover VALORANT parties, grab their official party code, and complete your squad.",
  keywords: ["VALORANT", "LFG", "Party Code", "Teammates", "Squad Finder", "Esports", "Ranked"],
  authors: [{ name: "LastMate" }],
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-val-black text-val-white antialiased flex flex-col min-h-screen selection:bg-val-red selection:text-white">
        <ToastProvider>
          <AuthProvider>
            <AnnouncementBanner />
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
