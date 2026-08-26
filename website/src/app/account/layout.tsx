import AuthProvider from "@/components/AuthProvider";

/**
 * Your account — mounts Clerk.
 *
 * /account reads and writes the customer's saved measurements and name
 * through Clerk-authenticated client components.
 *
 * See src/components/AuthProvider.tsx for why the provider is per-route rather
 * than in the root layout: it is 356KB, and it used to load on every page.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
