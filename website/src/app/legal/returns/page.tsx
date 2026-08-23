import { permanentRedirect } from "next/navigation";

// Returns is now a section of the single Terms document rather than its own
// page. Kept as a permanent redirect rather than deleted: the footer, the
// customer confirmation email, the sitemap and anything a customer has
// bookmarked all point here, and a 404 on a returns policy is exactly the
// wrong thing to show someone with a fit problem.
export default function ReturnsPage() {
  permanentRedirect("/legal/terms#returns");
}
