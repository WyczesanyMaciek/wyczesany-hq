// /login/error — strona bledu logowania.

import Link from "next/link";

export default function LoginErrorPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FBF8F3",
        fontFamily: "var(--font-nunito), Nunito, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 32,
          background: "#fff",
          border: "3px solid #DC2626",
          borderRadius: 12,
          boxShadow: "4px 4px 0 #1F1F2E",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#DC2626",
            margin: "0 0 8px",
          }}
        >
          Blad logowania
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            margin: "0 0 20px",
            lineHeight: 1.6,
          }}
        >
          Twoj email nie jest na liscie. Poproś admina o dodanie Twojego maila.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "8px 20px",
            fontSize: 14,
            fontWeight: 600,
            color: "#5B3DF5",
            border: "2px solid #5B3DF5",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          Sprobuj ponownie
        </Link>
      </div>
    </div>
  );
}
