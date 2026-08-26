import AuthProvider from "@/components/AuthProvider";

/**
 * Design — mounts Clerk.
 *
 * The customizer carries SaveMeasurements, which opens Clerk's sign-up modal
 * at the moment a customer asks to keep their numbers.
 *
 * See src/components/AuthProvider.tsx for why the provider is per-route rather
 * than in the root layout: it is 356KB, and it used to load on every page.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
