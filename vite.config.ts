import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// `npm run build:testhooks` baut mit `--mode testhooks`. Dieser Modus schaltet den
// Entwicklertisch unter `/dev` ein (Schalter in `src/App.tsx`). Hier
// statt in einer `.env.testhooks`, weil `scripts/regelcheck.py` jede eingecheckte
// `.env.*` als Secret ablehnt; und statt `VITE_TEST_HOOKS=1 vite build`, weil diese
// Schreibweise unter Windows nicht läuft. Die Vercel-Vorschau setzt die Variable
// weiter selbst in ihrer Umgebung.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: mode === 'testhooks' ? { 'import.meta.env.VITE_TEST_HOOKS': JSON.stringify('1') } : {},
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    // Ab Node 25 ist das eingebaute `localStorage` standardmässig an. Ohne
    // `--localstorage-file` ist es ein Objekt ohne Methoden und verdeckt in den
    // Test-Workern das `localStorage` von jsdom; die Spielstand-Tests schlagen
    // dann mit „setItem is not a function“ fehl.
    execArgv: ['--no-experimental-webstorage'],
    // Mehrere Tests rechnen ganze Partien oder Tausende Zustände durch und brauchen allein
    // 3 bis 6 s. Laufen mehrere Agenten gleichzeitig, reicht die Vorgabe von 5 s (Hooks 10 s)
    // nicht, und das Gate fällt ohne Fehler im Code aus. Ein Test, der wirklich hängt,
    // scheitert weiterhin an dieser Grenze.
    testTimeout: 20_000,
    hookTimeout: 30_000,
    // ÄNDERUNG [30.07.2026]: AP-2 — `tests/layout/**` enthält Playwright-Verträge,
    // die einen echten Browser und den Preview-Server brauchen. Ohne diesen
    // Ausschluss würde Vitest sie wegen des `.spec.ts`-Suffixes einsammeln und in
    // jsdom ausführen, wo `@playwright/test` nicht funktioniert.
    // Lauf über `npm run test:layout`.
    // Der lange Dauerlauf (`*.dauerlauf.test.ts`, E11) braucht mehrere Minuten und läuft
    // nur mit `npm run test:dauerlauf` (`--mode dauerlauf`), nicht im Gate `npm test`.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/layout/**', ...(mode === 'dauerlauf' ? [] : ['**/*.dauerlauf.test.ts'])],
    // Gesucht wird nur unter src/ und tests/, wie bei den anderen Gates. Ohne diese
    // Angabe sucht Vitest im ganzen Baum und sammelt im Hauptordner auch die
    // vollständigen Repo-Kopien unter .claude/worktrees/ (Worktrees der Agenten) ein.
    include: mode === 'dauerlauf' ? ['src/**/*.dauerlauf.test.ts'] : ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
  },
}))
