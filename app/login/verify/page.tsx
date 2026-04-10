// /login/verify — strona po wyslaniu magic linka. Linear v2 style.

export default function VerifyPage() {
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
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>📧</div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
          Sprawdz maila
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
          Wyslalismy Ci magic link. Kliknij w link w mailu zeby sie zalogowac.
          Jesli nie widzisz maila, sprawdz spam.
        </p>
      </div>
    </div>
  );
}
