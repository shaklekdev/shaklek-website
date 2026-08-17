import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            fontSize: 84,
            fontWeight: 400,
            letterSpacing: 3,
            color: "#1a1a1a",
            lineHeight: 1,
          }}
        >
          SK
        </div>
        <div
          style={{
            marginTop: 16,
            width: 56,
            height: 3,
            background: "#9c8445",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
