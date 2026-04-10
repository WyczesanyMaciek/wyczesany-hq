// /login/error — strona bledu logowania. Linear v2 style.

import Link from "next/link";

export default function LoginErrorPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fafbfc",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          padding: 32,
          background: "#fff",
          border: "1px solid #fecaca",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#b91c1c", margin: "0 0 8px" }}>
          Blad logowania
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 20px", lineHeight: 1.6 }}>
          Twoj email nie jest na liscie. Popros admina o dodanie Twojego maila.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "8px 20px",
            fontSize: 13,
            fontWeight: 600,
            color: "#5B3DF5",
            border: "1px solid #5B3DF5",
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
