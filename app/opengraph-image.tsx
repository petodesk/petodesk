import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 60,
        }}
      >
        <img
          src="https://www.petodesk.com/logo.svg"
          width="120"
          height="120"
          style={{ marginBottom: 40 }}
        />

        <div style={{ fontWeight: "bold" }}>Petodesk</div>

        <div
          style={{
            fontSize: 32,
            marginTop: 20,
            color: "#555",
          }}
        >
          Business Management Software
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}