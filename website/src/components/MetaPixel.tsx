"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { PIXEL, pixelEnabled } from "@/lib/metaPixel";

/**
 * Loads the Meta Pixel and fires PageView on client-side navigations.
 *
 * Renders NOTHING unless NEXT_PUBLIC_META_PIXEL_ID is set, so this can ship
 * ahead of the ad account existing: no pixel id, no script, no cookie, no
 * network call. That is deliberate -- it means the plumbing can be deployed
 * and verified now, and switching ads on tomorrow is an environment variable
 * rather than a code change on a live storefront.
 *
 * `afterInteractive` on purpose: the pixel must not compete with the LCP
 * image. A performance review today found six speculative catalog images
 * already loading ahead of the visible one; adding a tracker in front of it
 * would repeat that mistake for a script no customer benefits from.
 */
export default function MetaPixel() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (!pixelEnabled) return;
    // The snippet below fires the initial PageView itself. Skipping the first
    // effect run stops it being counted twice, which would inflate every
    // downstream rate Meta optimises against.
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      const w = window as unknown as { fbq?: (...a: unknown[]) => void };
      w.fbq?.("track", "PageView");
    } catch {
      /* never break navigation for a tracker */
    }
  }, [pathname]);

  if (!pixelEnabled) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
