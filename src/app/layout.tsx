import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider, CartProvider, WishlistProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import MetaPixel from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: "MUSE WEAR | Cairo, Egypt - Multibrand Fashion",
  description: "MUSE WEAR EGYPT - Egypt's Namshi competitor. Multibrand + our own manufacturing. Men, Women, Accessories. COD & Paymob. Ships across Egypt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className="h-full">
      <body className="min-h-full flex flex-col bg-[#100904] text-[#ffedd7] antialiased">
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Navbar />
                <main className="flex-1 bg-[#100904] text-[#ffedd7]">{children}</main>
                <Footer />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
