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
          avatarBox: {
            backgroundColor: "#1a1a1a",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='8' r='3.5'/%3E%3Cpath d='M5 20c0-4.5 3.5-7 7-7s7 2.5 7 7'/%3E%3C/svg%3E\")",
            backgroundSize: "58%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          },
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
