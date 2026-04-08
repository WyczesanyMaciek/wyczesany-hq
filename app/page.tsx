export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <div className="max-w-2xl border-[3px] border-[var(--border-strong)] rounded-2xl p-10 bg-white/40">
        <h1 className="mb-4">Wyczesany HQ</h1>
        <p className="mb-6">
          Centrum dowodzenia. Tu zyje cala twoja praca: konteksty, projekty,
          taski, pomysly i problemy.
        </p>
        <div className="flex gap-3 flex-wrap">
          <span
            className="px-4 py-2 rounded-full text-white font-bold"
            style={{ background: "var(--ctx-salony)" }}
          >
            Salony
          </span>
          <span
            className="px-4 py-2 rounded-full text-white font-bold"
            style={{ background: "var(--ctx-not-bad-stuff)" }}
          >
            Not Bad Stuff
          </span>
          <span
            className="px-4 py-2 rounded-full text-white font-bold"
            style={{ background: "var(--ctx-szkolenia)" }}
          >
            Szkolenia
          </span>
          <span
            className="px-4 py-2 rounded-full text-white font-bold"
            style={{ background: "var(--ctx-marka-osobista)" }}
          >
            Marka Osobista
          </span>
        </div>
        <p className="mt-8 text-sm opacity-70">Etap 1 — Fundament</p>
      </div>
    </main>
  );
}
