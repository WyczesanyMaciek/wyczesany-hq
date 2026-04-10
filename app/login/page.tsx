// /login — strona logowania magic linkiem. Linear v2 style.

import { signIn } from "@/auth";

export default function LoginPage() {
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
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
          Wyczesany HQ
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 24px", lineHeight: 1.5 }}>
          Zaloguj sie magic linkiem — wpisz email i sprawdz skrzynke.
        </p>

        <form
          action={async (formData) => {
            "use server";
            await signIn("resend", formData);
          }}
        >
          <label
            htmlFor="email"
            style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            placeholder="maciek@wyczesany.com"
            style={{
              width: "100%",
              padding: "10px 12px",
              fontSize: 14,
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              background: "#fff",
              font: "inherit",
              marginBottom: 16,
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px 0",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "#5B3DF5",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              font: "inherit",
            }}
          >
            Wyslij magic link
          </button>
        </form>
      </div>
    </div>
  );
}
