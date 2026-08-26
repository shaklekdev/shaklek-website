import AuthProvider from "@/components/AuthProvider";

/**
 * Sign in — mounts Clerk.
 *
 * Clerk's own <SignIn /> component renders here.
 *
 * See src/components/AuthProvider.tsx for why the provider is per-route rather
 * than in the root layout: it is 356KB, and it used to load on every page.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
