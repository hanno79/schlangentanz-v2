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

import { defineConfig, devices } from '@playwright/test'

const PREVIEW_URL = 'http://localhost:4173'

export default defineConfig({
  testDir: './tests/layout',
  // Layout-Verträge sind Geometrie-Messungen: ein Retry würde ein echtes
  // Cascade-Problem als Flake verschleiern.
  retries: 0,
  fullyParallel: true,
  reporter: process.env.CI ? 'list' : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: PREVIEW_URL,
    viewport: { width: 1280, height: 900 },
    // In dieser Playwright-Version liegt `reducedMotion` unter `contextOptions`,
    // nicht direkt in `use`.
    contextOptions: { reducedMotion: 'reduce' },
  },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: 'npm run build && npm run preview',
    url: PREVIEW_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
