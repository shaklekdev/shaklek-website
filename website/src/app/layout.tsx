import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/CartContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shaklek — Your look, your way",
  description:
    "Design your own unique piece with Shaklek, cut by a real tailor in sustainable cotton and linen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1a1a1a",
          fontFamily: "-apple-system, 'Segoe UI', Roboto, sans-serif",
        },
        elements: {
          avatarBox: { backgroundColor: "#1a1a1a", color: "#ffffff" },
        },
      }}
    >
      <html lang="en" className="h-full antialiased">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-full flex flex-col bg-bg text-text">
          <CartProvider>
            {children}
            <Footer />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
