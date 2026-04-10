// /login — strona logowania magic linkiem.
// Formularz z emailem. Auth.js wysyla magic link na maila.
// Jasny motyw, Nunito, spojny z reszta UI.

import { signIn } from "@/auth";

export default function LoginPage() {
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
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "#1F1F2E",
            margin: "0 0 4px",
          }}
        >
          Wyczesany HQ
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            margin: "0 0 24px",
            lineHeight: 1.5,
          }}
        >
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
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "#1F1F2E",
              marginBottom: 6,
            }}
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
              fontSize: 15,
              border: "2px solid #1F1F2E",
              borderRadius: 6,
              background: "#FBF8F3",
              font: "inherit",
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px 0",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              background: "#5B3DF5",
              border: "2px solid #1F1F2E",
              borderRadius: 6,
              cursor: "pointer",
              boxShadow: "2px 2px 0 #1F1F2E",
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
