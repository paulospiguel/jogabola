import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "JogaBola — Encontra a tua malta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const imagePath = join(process.cwd(), "src/assets/og/pitch-night.jpg");
  const imageBase64 = readFileSync(imagePath).toString("base64");
  const backgroundSrc = `data:image/jpeg;base64,${imageBase64}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        position: "relative",
        backgroundColor: "#06090D",
      }}
    >
      <img
        src={backgroundSrc}
        alt=""
        width={1200}
        height={630}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1200px",
          height: "630px",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1200px",
          height: "630px",
          background:
            "linear-gradient(0deg, #06090D 8%, rgba(6,9,13,0.65) 42%, rgba(6,9,13,0.15) 68%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 14,
              border: "2px solid rgba(124,255,79,0.5)",
              background: "rgba(124,255,79,0.15)",
              fontSize: 26,
              color: "#7CFF4F",
            }}
          >
            ⚽
          </div>
          <span
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#F5F7FA",
              letterSpacing: "-0.5px",
            }}
          >
            jogabola
          </span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-2px",
            color: "#F5F7FA",
          }}
        >
          Joga mais.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-2px",
            color: "#7CFF4F",
            marginBottom: 26,
          }}
        >
          Organiza menos.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 500,
            color: "#A7B0BE",
            maxWidth: 760,
          }}
        >
          Confirmações, pagamentos e comprovativos no mesmo sítio.
        </div>
      </div>
    </div>,
    { ...size },
  );
}
