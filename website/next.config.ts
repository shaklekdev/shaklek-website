import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its font .afm files relative to its own package dir at
  // runtime -- bundling it silently breaks that lookup (ENOENT on
  // Helvetica.afm). Keeping it external preserves the real node_modules
  // path instead.
  serverExternalPackages: ["pdfkit"],
  images: {
    // 75 is the default and what the catalog photography uses. 55 is for the
    // homepage hero only: it sits under a bg-white/55 wash and is already
    // upscaled (source is 1584px wide, a DPR2 desktop asks for ~2551), so
    // detail there is not recoverable and not worth 20kb. Next 16 rejects any
    // quality not declared here.
    qualities: [55, 75],
  },
};

export default nextConfig;
