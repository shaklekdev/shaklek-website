import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Sign-in / sign-up frame (founder 2026-11-21: the bare Clerk card on a white
 * page had "aucune mise en page, trop moche"). Photo + form, like the
 * homepage hero: desktop = photo left, form right on the hero's cream;
 * phones = a short photo band above the form.
 */
export default function AuthShell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="grid flex-1 md:grid-cols-2">
      <div className="relative h-[200px] md:h-auto md:min-h-[640px]">
        <Image
          src="/marketing/home-hero-oldtown-door-soft2.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover object-[50%_25%]"
        />
      </div>
      <div className="flex flex-col items-center justify-center bg-[#F6F1E9] px-6 py-12 md:px-12">
        <div className="w-full max-w-[400px]">
          <p className="text-center text-[11px] tracking-[0.22em] text-text-2 uppercase">{sub}</p>
          <h1 className="mt-3 text-center">{title}</h1>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Clerk appearance for the auth pages only: the card disappears into the
 * cream panel, square corners, our type, a black square button. The
 * "Secured by Clerk" line stays (removing it needs a paid Clerk plan).
 */
export const authAppearance = {
  variables: {
    colorPrimary: "#1a1a1a",
    colorBackground: "#F6F1E9",
    colorInputBackground: "#ffffff",
    colorText: "#1a1a1a",
    borderRadius: "0px",
    fontFamily: "-apple-system, 'Segoe UI', Roboto, sans-serif",
    fontSize: "15px",
  },
  elements: {
    rootBox: { width: "100%" },
    cardBox: { width: "100%", boxShadow: "none", border: "none" },
    card: { boxShadow: "none", border: "none", background: "transparent", padding: "0" },
    header: { display: "none" },
    footer: { background: "transparent", boxShadow: "none" },
    formButtonPrimary: {
      backgroundColor: "#1a1a1a",
      textTransform: "uppercase",
      letterSpacing: "0.16em",
      fontSize: "12px",
      padding: "14px 0",
      boxShadow: "none",
    },
    formFieldInput: { padding: "12px 14px", fontSize: "16px", borderColor: "#d8d1c4" },
    formFieldLabel: { fontSize: "12px", letterSpacing: "0.06em", color: "#555" },
    // NO GOOGLE BUTTON (founder 2026-11-21: "on a dit qu'il marchait pas").
    // Production Clerk shows email only today; this keeps it hidden even if a
    // social provider is switched on later (the dev instance has Google on).
    socialButtonsRoot: { display: "none" },
    dividerRow: { display: "none" },
    footerActionLink: { color: "#1a1a1a", textDecoration: "underline" },
  },
};
