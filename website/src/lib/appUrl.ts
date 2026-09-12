// THE PUBLIC ADDRESS OF THIS SITE, for links that leave the server.
//
// ⚠️ NEVER `req.nextUrl.origin` FOR A REDIRECT A PERSON WILL FOLLOW. Amplify
// runs the Next server behind its own proxy, so inside the container that
// origin is `http://localhost:3000`. On 2026-09-12 the waitlist confirm link
// was correct in the email, pointed at www.shaklek.com, reached production --
// and then redirected the visitor to localhost:3000, where her phone showed
// ERR_CONNECTION_FAILED. The click worked. The landing did not. Nobody could
// confirm a signup, and the only signal was a founder testing her own form.
//
// req.nextUrl.origin is still right for things that stay server-side. It is
// wrong for anything a browser or a mail client is asked to follow.
//
// NEXT_PUBLIC_APP_URL is already in the Amplify build-spec allowlist. The
// fallback is the live site rather than localhost, deliberately: if the
// variable ever goes missing, a link to production is recoverable and a link to
// localhost is not.
export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://www.shaklek.com").replace(/\/$/, "");
}
