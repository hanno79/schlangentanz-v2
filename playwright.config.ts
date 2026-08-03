/*
Author: Claude Code (AP-2)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Playwright-Konfiguration für die Layout-Verträge unter `tests/layout/`.

Hintergrund (AP-2, Onboarding-Finding 2): Layout-Verträge wurden bisher geprüft,
indem Vitest-Tests `src/App.css` als Text lasen und mit selbstgebauten
Klammer-Parsern auf exakte `clamp()`-Werte matchten. Die Absicht dahinter ist fast
immer geometrisch („der Arenastein darf nicht so hoch werden, dass die Hand aus dem
1280×900-Erstbild rutscht"). Genau das wird hier gemessen statt geraten.

Die Parameter sind bewusst identisch mit denen der Production-Smokes in
`scripts/*.mjs` (Viewport 1280×900, `reducedMotion: 'reduce'`), damit lokale
Messwerte und Production-Smoke-Werte direkt vergleichbar bleiben. Verifiziert am
30.07.2026: die lokale Preview liefert dieselbe Geometrie wie Production
(Arenastein 378 px, Unterkante erste Handkarte 927 px, body.scrollHeight 1061 px).

Aufruf: `npm run test:layout`. Bewusst NICHT Teil von `npm test` — der Lauf braucht
einen Production-Build und ist um Größenordnungen langsamer als Vitest.
*/

/*
ÄNDERUNG [03.08.2026]: Zweiter Auftrag für hook-abhängige Bildschirme (Punkt 1b).

Die Sieger-Party war von keinem Vertrag gedeckt, und genau deshalb blieben dort
vier Fehler unbemerkt, bis sie zum ersten Mal jemand ansah. Der Grund ist
strukturell: Der Bildschirm ist nur über `/game?phase=spielende` erreichbar, und
dieser Hook ist im Produktionsbuild aus (`testHooksAktiv()` verlangt `DEV` oder
`VITE_TEST_HOOKS=1`; letzteres gehört laut `docs/WORKFLOW.md` ausdrücklich NICHT
in Production).

Deshalb zwei Aufträge statt einer Ausnahme:

| Projekt | Server | Build | Verträge |
|---|---|---|---|
| `chromium` | :4173 `dist` | Produktionsbuild | alle außer `*.hooks.spec.ts` |
| `chromium-testhooks` | :4174 `dist-testhooks` | `VITE_TEST_HOOKS=1` | nur `*.hooks.spec.ts` |

Die beiden Builds unterscheiden sich um **genau eine Flagge** — sonst identische
Vite-Konfiguration, identischer Viewport, identisches `reducedMotion`. Was der
zweite Auftrag misst, gilt damit auch für Production, solange der gemessene
Bildschirm nicht selbst am Hook hängt (er hängt nur am *Erreichen* des Zustands).

Die 34 bestehenden Verträge bleiben unangetastet am Produktionsbuild: Sie prüfen
Bildschirme, die ein Spieler ohne Hook erreicht, und sollen weiter genau den
Build messen, der ausgeliefert wird.
*/

import { defineConfig, devices } from '@playwright/test'

const PREVIEW_URL = 'http://localhost:4173'
const TESTHOOKS_URL = 'http://localhost:4174'

/** Verträge, die den `?phase=`-Hook brauchen — nur im zweiten Auftrag. */
const HOOK_VERTRAEGE = /\.hooks\.spec\.ts$/

export default defineConfig({
  testDir: './tests/layout',
  // Layout-Verträge sind Geometrie-Messungen: ein Retry würde ein echtes
  // Cascade-Problem als Flake verschleiern.
  retries: 0,
  fullyParallel: true,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 900 },
    // In dieser Playwright-Version liegt `reducedMotion` unter `contextOptions`,
    // nicht direkt in `use`.
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [
    { name: 'chromium', use: { baseURL: PREVIEW_URL }, testIgnore: HOOK_VERTRAEGE },
    { name: 'chromium-testhooks', use: { baseURL: TESTHOOKS_URL }, testMatch: HOOK_VERTRAEGE },
  ],
  /*
  ÄNDERUNG [03.08.2026, Punkt 1b]: `reuseExistingServer: false` — auch lokal.

  Vorher stand hier `!process.env.CI`, und die Kompensation war eine Zeile Doku
  („vor dem Lauf `ss -ltn | grep 4173`"). Das ist keine Absicherung, sondern eine
  Merkhilfe: Läuft noch ein verwaister `vite preview`, baut Playwright **nicht**
  neu und misst still den alten Build. Der Fehler ist grün — er bescheinigt einen
  Build, den es nicht gibt.

  Beim Bauen dieses Slices sind daran drei Gegenproben wertlos geworden, bevor es
  auffiel. Mit zwei Servern verdoppelt sich die Angriffsfläche; mit `false`
  benutzt Playwright einen erreichbaren bestehenden Server nicht weiter, sondern
  bricht den Start sofort ab, sobald unter der URL schon etwas antwortet
  („… is already used"). Der Preis ist ein Neubau je Lauf, und der ist gegenüber
  einem falsch-grünen Gate geschenkt.

  Der Abbruch nennt die URL, aber nicht, wer dort antwortet. `ss -ltn | grep -E
  '4173|4174'` ist dafür die Vorprüfung — Diagnose neben der Mechanik, nicht ihr
  Ersatz (siehe `docs/WORKFLOW.md`).
  */
  /* Beide Server bauen mit `vite build`, nicht mit `npm run build` — also ohne
     `tsc -b`. Der Typecheck ist ein eigenes Gate (`npm run typecheck`) und
     kostete hier gemessen 5,0 s, während der Bau selbst 0,17 s braucht. Playwright
     startet **alle** `webServer`-Einträge, auch bei `--project=…` oder einem
     Dateifilter, und zwar nacheinander; der Typecheck lief also zweimal je Lauf
     mit, ohne etwas zu prüfen, was nicht ohnehin geprüft wird. */
  webServer: [
    {
      command: 'vite build && vite preview',
      url: PREVIEW_URL,
      // `VITE_TEST_HOOKS: '0'` überschreibt die Umgebung des Aufrufers: Steht die
      // Variable dort auf `1`, backte dieser Bau die Hooks mit ein und der erste
      // Auftrag prüfte einen Build, den es in Production nicht gibt — dasselbe
      // falsch-grüne Ergebnis wie beim verwaisten Preview-Server, nur eine Ebene
      // tiefer. Playwright legt `env` über `process.env`.
      env: { VITE_TEST_HOOKS: '0' },
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npm run build:testhooks && npm run preview:testhooks',
      url: TESTHOOKS_URL,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
})
