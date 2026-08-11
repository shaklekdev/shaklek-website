import type { Metadata } from "next";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shaklek — Your look, your way",
  description:
    "Design your own unique piece with Shaklek, cut by a real tailor in sustainable cotton and linen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-text">
        {children}
        <Footer />
      </body>
    </html>
  );
}
