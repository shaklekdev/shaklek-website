import { ImageResponse } from "next/og";

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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 17,
            fontWeight: 400,
            letterSpacing: 0.5,
            color: "#1a1a1a",
            lineHeight: 1,
          }}
        >
          SK
        </div>
        <div
          style={{
            marginTop: 3,
            width: 12,
            height: 1.5,
            background: "#9c8445",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
