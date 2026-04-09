# MANIFESTS.md — configi i manifesty projektu

Wszystkie pliki konfiguracyjne i manifesty projektu w jednym miejscu. Struktura: nagłówek plik + zawartość.

---

## `package.json`

```json
{
  "name": "wyczesany-hq",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "mkdir -p .next && next dev -p 3002 2>&1 | tee .next/dev-server.log",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@base-ui/react": "^1.3.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@prisma/adapter-pg": "^7.7.0",
    "@prisma/client": "^7.7.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.7.0",
    "motion": "^12.38.0",
    "next": "16.2.2",
    "pg": "^8.20.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "shadcn": "^4.2.0",
    "tailwind-merge": "^3.5.0",
    "tw-animate-css": "^1.4.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/pg": "^8.20.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.2",
    "prisma": "^7.7.0",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}
```

### Uwagi o zależnościach
- **Next.js 16.2.2** — App Router (Turbopack dev).
- **React 19.2.4** — serwerowe komponenty, `useOptimistic`, `useTransition`.
- **Prisma 7.7.0** — z adapterem Postgres (`@prisma/adapter-pg`) + `pg`.
- **`@base-ui/react` 1.3.0** — unstyled primitives pod shadcn (dialog, button).
- **shadcn 4.2.0** — style `base-nova`, `baseColor: neutral`, CSS variables.
- **Tailwind v4** — nowa architektura, bez `tailwind.config.js`, wszystko w CSS (`app/globals.css`).
- **`@dnd-kit/core` 6.3.1 + sortable 10 + utilities 3.2.2** — drag & drop w dashboardzie.
- **`motion` 12.38.0** — Framer Motion (pakiet od Framera pod nową nazwą).
- **`lucide-react` 1.7.0** — ikony.
- **`tsx`** — seed i scripts.

---

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

---

## `next.config.ts`

```ts
import type { NextConfig } from "next";
import { execSync } from "node:child_process";

function readGitHash(): string {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "nogit";
  }
}

const buildTime = new Date().toLocaleTimeString("pl-PL", {
  hour: "2-digit",
  minute: "2-digit",
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: "0.2.0",
    NEXT_PUBLIC_GIT_HASH: readGitHash(),
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
};

export default nextConfig;
```

Build info (wersja + hash + godzina) trafia do `NEXT_PUBLIC_*` — stopka sidebaru je wyświetla.

---

## `postcss.config.mjs`

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

Tailwind v4 nie ma już osobnego `tailwind.config.js` — cała konfiguracja (tokeny, theme) jest w `app/globals.css` przez `@theme` i `@import "tailwindcss"`.

---

## `eslint.config.mjs`

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

---

## `prisma.config.ts`

```ts
// Prisma config — ladujemy .env.local (Next.js convention) przed .env,
// zeby CLI (migrate, db seed, studio) widzial ten sam DATABASE_URL co app runtime.
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

---

## `components.json` (shadcn)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

---

## `.gitignore` (skrót)

```
/node_modules
/.next/
/out/
/build
.env*
.vercel
*.tsbuildinfo
next-env.d.ts
/lib/generated/prisma
*.db
*.db-journal
```

---

## Brak `.env.example`

**Plik nie istnieje.** Zmienne środowiskowe używane:

- `DATABASE_URL` — Postgres connection string (Neon w produkcji, lokalnie też Postgres).
- `NEXT_PUBLIC_APP_VERSION` — ustawiane w `next.config.ts` przy build
- `NEXT_PUBLIC_GIT_HASH` — ustawiane w `next.config.ts` przy build
- `NEXT_PUBLIC_BUILD_TIME` — ustawiane w `next.config.ts` przy build

## Brak Dockerfile / docker-compose

Nie używane. Deploy bezpośrednio na Vercel, baza w Neon.

---

## Prisma schema

Pełna definicja w `DOMAIN_MODEL.md`. Tu tylko nagłówek:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Migracje w `prisma/migrations/`:
- `20260409111159_init_postgres` — pierwsza migracja, wszystkie modele
- `20260409131020_tasks_details_and_order` — dodanie pól do `Task` (order, assignee, notes) + `TaskAttachment` + `TaskLink`
