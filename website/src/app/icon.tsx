import { ImageResponse } from "next/og";

// THE MONOGRAM IS THE ARABIC SHEEN, ش -- literally the "sh" sound and the first
// letter of شكلك. It replaced "SK" set in Georgia: initials in a system serif
// say nothing about a brand, and Georgia is no longer the brand's face anyway.
//
// EMBEDDED AS AN OUTLINED SVG, NOT AS TEXT, for two reasons. ImageResponse has
// no Arabic-capable font unless one is shipped and loaded with it, and a glyph
// it cannot render fails as a BLANK SQUARE rather than as an error. And satori,
// the renderer behind it, supports neither dangerouslySetInnerHTML nor
// arbitrary SVG children -- so the mark travels as a data URI.
//
// The bytes below are branding/logo/shaklek-monogram-black.svg, byte for
// byte, so the favicon and the printed mark cannot drift apart. Regenerate both
// together or neither. That file is centred on its MEASURED ink rather than on
// font metrics: the sheen's three dots are a separate glyph with their own
// offset, and centring on the glyph bounding boxes put the mark flush against
// the top edge with a third of the canvas empty underneath it.
const MARK =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMzQwLjg5IDEzNDAuODkiIHdpZHRoPSIxMzQxIiBoZWlnaHQ9IjEzNDEiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iU2hha2xlayI+CiAgPHRpdGxlPlNoYWtsZWs8L3RpdGxlPgogIDxkZXNjPlRoZSBTaGFrbGVrIG1vbm9ncmFtOiB0aGUgQXJhYmljIGxldHRlciBzaGVlbiwgd2hpY2ggaXMgdGhlICJzaCIgc291bmQgYW5kIHRoZSBmaXJzdCBsZXR0ZXIgb2Yg2LTZg9mE2YMuIFJlZW0gS3VmaSwgY29udmVydGVkIHRvIG91dGxpbmVzLjwvZGVzYz4KICA8ZyBmaWxsPSIjMUExQTFBIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMzQuODkgOTQ5LjMzKSI+PHBhdGggdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDQ1LjAwMCAtNTUwLjAwMCkgc2NhbGUoMS4wMDAwMDAgLTEuMDAwMDAwKSIgZD0iTTE0NSA5MlExMjEgOTIgMTA0IDEwOVE4NyAxMjYgODcgMTUwUTg3IDE3NCAxMDQgMTkxUTEyMSAyMDggMTQ1IDIwOFExNjkgMjA4IDE4NiAxOTFRMjAzIDE3NCAyMDMgMTUwUTIwMyAxMjYgMTg2IDEwOVExNjkgOTIgMTQ1IDkyWk0yMzEgLTU4UTIwNyAtNTggMTkwIC00MVExNzMgLTI0IDE3MyAwUTE3MyAyNCAxOTAgNDFRMjA3IDU4IDIzMSA1OFEyNTUgNTggMjcyIDQxUTI4OSAyNCAyODkgMFEyODkgLTI0IDI3MiAtNDFRMjU1IC01OCAyMzEgLTU4Wk01OCAtNThRMzQgLTU4IDE3IC00MVEwIC0yNCAwIDBRMCAyNCAxNyA0MVEzNCA1OCA1OCA1OFE4MiA1OCA5OSA0MVExMTYgMjQgMTE2IDBRMTE2IC0yNCA5OSAtNDFRODIgLTU4IDU4IC01OFoiLz48cGF0aCB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMCAwLjAwMCkgc2NhbGUoMS4wMDAwMDAgLTEuMDAwMDAwKSIgZD0iTTQyNSAxMDBMNTQ1IDEwMEw1NDUgMjc4TDY0NSAzMDBMNjQ1IDEwMEw3NDUgMTAwTDc0NSAyNzhMODQ1IDMwMEw4NDUgMjNRODQ1IDExIDgzNSA2UTgyNSAxIDgxNSAwLjVRODA1IDAgODA1IDBMNDI1IDBaTTIxNiAtMjAwUTE1NSAtMjAwIDExNyAtMTc4UTc5IC0xNTYgNTkgLTEyM1EzOSAtOTAgMzIgLTU2LjVRMjUgLTIzIDI1IDBRMjUgNDQgNDMuNSA4NFE2MiAxMjQgOTEgMTU1LjVRMTIwIDE4NyAxNTEgMjA3UTE1MyAxODggMTQ5IDE3MVExNDUgMTU0IDEzMSAxMzVRMTQyIDEzMCAxNDkuNSAxMjAuNVExNTcgMTExIDE2MCAxMDBRMTYzIDg5IDE2MCA3N1ExNDYgODUgMTM1LjUgODguNVExMjUgOTIgMTExIDkwUTgzIDg3IDY5IDU4UTU1IDI5IDU1IDBRNTUgLTM4IDY5LjUgLTcwLjVRODQgLTEwMyAxMTkgLTEyM1ExNTQgLTE0MyAyMTYgLTE0M1EyNjcgLTE0MyAyOTUgLTEyMC41UTMyMyAtOTggMzM0IC01Ni41UTM0NSAtMTUgMzQ1IDQwTDM0NSAyNzhMNDQ1IDMwMEw0NDUgMFE0NDUgLTU2IDQxOSAtMTAxLjVRMzkzIC0xNDcgMzQyLjUgLTE3My41UTI5MiAtMjAwIDIxNiAtMjAwWiIvPjwvZz4KPC9zdmc+Cg==";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK} width={30} height={30} alt="" />
      </div>
    ),
    { ...size },
  );
}
