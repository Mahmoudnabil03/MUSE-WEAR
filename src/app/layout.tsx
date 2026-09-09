import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider, CartProvider, WishlistProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import MetaPixel from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: "MUSE WEAR | Cairo, Egypt — Curated Fashion. Made in Cairo.",
  description: "MUSE WEAR — Cairo, Egypt. The MW mark. Curated fashion, made in Cairo. Men, Women, Accessories. COD & Paymob. Ships across Egypt.",
  metadataBase: new URL("https://muse-wear.pages.dev"),
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "MUSE WEAR — Cairo, Egypt",
    description: "The MW mark. Curated fashion, made in Cairo.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "MUSE WEAR — Cairo, Egypt" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MUSE WEAR — Cairo, Egypt",
    description: "The MW mark. Curated fashion, made in Cairo.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#ffedd7] antialiased">
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                <main className="flex-1 bg-[#0a0a0a] text-[#ffedd7]">{children}</main>
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
