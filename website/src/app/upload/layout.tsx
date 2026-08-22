import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

// /upload is a client component, so its metadata lives here.
export const metadata: Metadata = pageMetadata({
  title: "Upload your own design",
  description:
    "Send us a sketch, a screenshot or a photo of something you love, and we will cut it to your measurements in cotton or linen.",
  path: "/upload",
});

export default function UploadLayout({ children }: LayoutProps<"/upload">) {
  return children;
}
