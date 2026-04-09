// / — placeholder glownego dashboardu.
// Prosty szkielet: naglowek + cztery liczniki (projekty aktywne, taski
// aktywne, pomysly, problemy). Docelowo tu bedzie porzadna strona
// powitalna — na razie to tylko miejsce trzymajace.

import { getGlobalStats } from "@/lib/queries/dashboard";

export default async function Home() {
  const stats = await getGlobalStats();

  const tiles = [
    { label: "Projekty", value: stats.projects },
    { label: "Taski", value: stats.tasks },
    { label: "Pomysły", value: stats.ideas },
    { label: "Problemy", value: stats.problems },
  ];

  return (
    <div className="linear-app" style={{ minHeight: "100vh", padding: "40px 48px" }}>
      <h3 style={{ margin: "0 0 28px", fontSize: 20, fontWeight: 700 }}>
        To jest główny dashboard
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(160px, 1fr))",
          gap: 16,
          maxWidth: 800,
        }}
      >
        {tiles.map((t) => (
          <div
            key={t.label}
            style={{
              border: "1px solid var(--l-line)",
              borderRadius: 10,
              padding: "18px 20px",
              background: "#fff",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "var(--l-ink)",
                lineHeight: 1.1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {t.value}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--l-muted)",
                marginTop: 6,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontWeight: 600,
              }}
            >
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
