import AuthProvider from "@/components/AuthProvider";

/**
 * Size guide — mounts Clerk.
 *
 * The size guide carries SaveMeasurements too -- the founder's point being that
 * measurements should be collectable wherever someone is thinking about fit.
 *
 * See src/components/AuthProvider.tsx for why the provider is per-route rather
 * than in the root layout: it is 356KB, and it used to load on every page.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
