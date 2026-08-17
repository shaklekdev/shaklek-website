import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its font .afm files relative to its own package dir at
  // runtime -- bundling it silently breaks that lookup (ENOENT on
  // Helvetica.afm). Keeping it external preserves the real node_modules
  // path instead.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
