"use client";

// /dev/logs — podglad ostatnich 200 linii dev servera.
// Auto-refresh co 2s, przycisk "Skopiuj wszystko".

import { useEffect, useState, useCallback } from "react";
import { Copy, Check, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type LogsResponse = {
  lines: string[];
  total: number;
  path: string;
  error?: string;
  devOnly?: boolean;
};

export default function DevLogsPage() {
  const [data, setData] = useState<LogsResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs", { cache: "no-store" });
      const json: LogsResponse = await res.json();
      setData(json);
      setFetchError(null);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    // fetchLogs setuje state w srodku — to jest zamierzone (inicjalny fetch
    // + polling co 2s). Eslint reguly set-state-in-effect sa zbyt restrykcyjne
    // dla legit polling use-case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
    // Polling tylko w dev mode — na produkcji endpoint zwraca devOnly i nie
    // ma sensu go odpytywac co 2s.
    if (process.env.NODE_ENV !== "development") return;
    const id = setInterval(fetchLogs, 2000);
    return () => clearInterval(id);
  }, [fetchLogs]);

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const isDevOnly = data?.devOnly === true;

  return (
    <main className="p-10 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="mb-1">Logi dev servera</h1>
          <p className="opacity-70 text-[15px]">
            Ostatnie 200 linii z{" "}
            <code className="text-xs bg-black/5 px-1 rounded">
              {data?.path ?? ".next/dev-server.log"}
            </code>
            {isDevOnly ? "" : ". Auto-refresh co 2s."}
          </p>
        </div>
        {!isDevOnly && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchLogs}>
              <RotateCw size={16} /> Odswiez
            </Button>
            <Button onClick={handleCopy} disabled={!data || data.lines.length === 0}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Skopiowano" : "Skopiuj wszystko"}
            </Button>
          </div>
        )}
      </div>

      {isDevOnly && (
        <div className="mb-4 p-4 border-[3px] border-[var(--border-strong)] bg-white rounded-xl">
          <div className="font-extrabold text-[17px] mb-2">
            To narzędzie działa tylko lokalnie (dev mode)
          </div>
          <div className="text-[15px] opacity-80 leading-relaxed">
            Logi dev servera są pipowane przez <code>npm run dev</code> do pliku{" "}
            <code className="text-xs bg-black/5 px-1 rounded">
              .next/dev-server.log
            </code>
            . Na Vercel (produkcja, serverless Lambda) ten plik nie istnieje
            i filesystem jest read-only. Żeby zobaczyć logi requestów i błędów
            z produkcji, zajrzyj do{" "}
            <a
              href="https://vercel.com/wyczesanymacieks-projects/wyczesany-hq/logs"
              target="_blank"
              rel="noreferrer"
              className="underline font-bold"
            >
              Vercel Dashboard → Logs
            </a>
            .
          </div>
        </div>
      )}

      {data?.error && !isDevOnly && (
        <div className="mb-4 p-3 border-2 border-red-300 bg-red-50 text-red-700 text-sm rounded-md">
          {data.error}
          <div className="mt-1 opacity-70">
            Uruchom <code>npm run dev</code> — skrypt pipuje wyjscie do
            pliku loga.
          </div>
        </div>
      )}

      {fetchError && (
        <div className="mb-4 p-3 border-2 border-red-300 bg-red-50 text-red-700 text-sm rounded-md">
          Blad fetcha: {fetchError}
        </div>
      )}

      {!isDevOnly && (
        <div className="border-[3px] border-[var(--border-strong)] rounded-xl bg-white/60 overflow-hidden">
          <div className="px-4 py-2 border-b-2 border-[var(--border-strong)] text-xs font-mono opacity-60">
            {data ? `${data.lines.length} / ${data.total} linii` : "laduje..."}
          </div>
          <pre className="p-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-all overflow-auto max-h-[70vh]">
            {data?.lines.length ? data.lines.join("\n") : "(brak logow)"}
          </pre>
        </div>
      )}
    </main>
  );
}
