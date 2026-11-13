// Playwright für die Layout-Verträge unter tests/layout/ (`npm run test:layout`).
//
// Je Geräteklasse (scripts/pruefung/geraeteklassen.mjs) zwei Projekte:
//
// | Projekt              | Server                          | Verträge                     |
// |----------------------|---------------------------------|------------------------------|
// | `<klasse>`           | :4173, `dist`, Produktionsbuild | alle ausser `*.hooks.spec.ts` |
// | `<klasse>-testhooks` | :4174, `dist-testhooks`         | nur `*.hooks.spec.ts`         |
//
// Die beiden Builds unterscheiden sich nur im Vite-Modus `testhooks`. Verträge am
// Produktionsbuild messen genau das, was ausgeliefert wird; Bildschirme, die nur
// über einen Testhook erreichbar sind, misst der zweite Server.
//
// Ein eigenes Chromium nennt nur die Umgebungsvariable PW_CHROMIUM_PFAD; ohne sie
// nimmt Playwright das mit `npx playwright install chromium` geladene.

import { defineConfig, devices, type Project } from '@playwright/test'
import { GERAETEKLASSEN, chromiumPfad, kontextOptionen } from './scripts/pruefung/geraeteklassen.mjs'

const PRODUKTION_URL = 'http://localhost:4173'
const TESTHOOKS_URL = 'http://localhost:4174'

/** Verträge, die einen Testhook brauchen — nur gegen den Testhook-Build. */
const HOOK_VERTRAEGE = /\.hooks\.spec\.ts$/

const projekte: Project[] = GERAETEKLASSEN.flatMap((klasse) => {
  const { name } = klasse
  const geraet = kontextOptionen(klasse)
  return [
    { name, use: { ...geraet, baseURL: PRODUKTION_URL }, testIgnore: HOOK_VERTRAEGE },
    { name: `${name}-testhooks`, use: { ...geraet, baseURL: TESTHOOKS_URL }, testMatch: HOOK_VERTRAEGE },
  ]
})

const executablePath = chromiumPfad()

export default defineConfig({
  testDir: './tests/layout',
  // Layout-Verträge sind Messungen: Ein zweiter Versuch würde ein echtes Problem als
  // Wackler verdecken.
  retries: 0,
  fullyParallel: true,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    contextOptions: { reducedMotion: 'reduce' },
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: projekte,
  // `reuseExistingServer: false`, auch lokal: Antwortet unter der Adresse schon ein
  // Server (etwa ein verwaistes `vite preview` oder der eines parallel laufenden
  // Agenten), bricht Playwright ab, statt still einen fremden oder alten Build zu
  // messen. Vorher prüfen, ob 4173 und 4174 frei sind (docs/WORKFLOW.md).
  //
  // Gebaut wird mit `vite build`, nicht mit `npm run build`, also ohne `tsc -b`:
  // Den Typecheck macht `npm run typecheck` als eigenes Gate.
  webServer: [
    {
      command: 'vite build && vite preview --port 4173 --strictPort',
      url: PRODUKTION_URL,
      // Überschreibt eine gesetzte Variable des Aufrufers, sonst trüge der
      // Produktionsbuild die Testhooks.
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
