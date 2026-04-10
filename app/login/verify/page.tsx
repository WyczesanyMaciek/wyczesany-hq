// /login/verify — strona po wyslaniu magic linka.
// Informuje usera ze ma sprawdzic maila.

export default function VerifyPage() {
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
          border: "3px solid #1F1F2E",
          borderRadius: 12,
          boxShadow: "4px 4px 0 #1F1F2E",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#1F1F2E",
            margin: "0 0 8px",
          }}
        >
          Sprawdz maila
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Wyslalismy Ci magic link. Kliknij w link w mailu zeby sie zalogowac.
          Jesli nie widzisz maila, sprawdz spam.
        </p>
      </div>
    </div>
  );
}
