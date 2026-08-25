"use client";

import { requestConsentChange } from "@/lib/consent";

// Footer control that reopens the consent bar.
//
// The Footer is a server component, so this exists purely to carry the click.
// It is a button and not a link because it changes state rather than navigating,
// which is also what a screen reader needs to be told.
export default function CookieChoicesLink() {
  return (
    <button type="button" onClick={requestConsentChange} className="hover:text-text-2">
      Cookie choices
    </button>
  );
}
