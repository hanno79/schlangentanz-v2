// Playwright für Z1, ganze Partien im Browser (`npm run test:vollpartien`).
// Nicht Teil von `npm run test:layout`: Ein Lauf spielt Partien von der Lobby bis
// zur Wertung und dauert Minuten statt Sekunden.
//
// Zwei Projekte aus den Geräteklassen (scripts/pruefung/geraeteklassen.mjs):
// Desktop 1280×900 und Handy hochkant 390×844 mit Touch, beide mit „weniger
// Bewegung“, denn danach richtet sich die Pause vor jedem KI-Schritt, um die der
// Lauf die angehaltene Uhr der Seite vorstellt (tests/vollpartien/seite.ts).
//
// Ziel: ohne Umgebungsvariable ein eigener Produktionsbuild auf Port 4175, nicht
// 4173 oder 4174, damit der Lauf neben `test:layout` anderer Agenten laufen kann.
// Testhooks braucht er nicht, die feste Saat kommt über `Math.random`. Mit
// `Z1_BASIS_URL` läuft er gegen diese Adresse, etwa eine Vercel-Vorschau, ohne
// eigenen Server; ist die Vorschau geschützt, nennt `Z1_VERCEL_SCHUTZ` das
// Geheimnis aus „Protection Bypass for Automation“ (docs/WORKFLOW.md).

import { defineConfig, devices, type Project } from '@playwright/test'
import { GERAETEKLASSEN, chromiumPfad, kontextOptionen } from './scripts/pruefung/geraeteklassen.mjs'

const LOKAL_URL = 'http://localhost:4175'
const PROJEKTE = ['desktop', 'handy-hochkant']

/** Die Adresse aus `Z1_BASIS_URL`; ohne Variable `null`. Was keine Adresse ist, bricht ab, statt still lokal zu laufen. */
function basisAusUmgebung(): string | null {
  const wert = process.env.Z1_BASIS_URL?.trim() ?? ''
  if (wert === '') return null
  if (!URL.canParse(wert)) throw new Error(`Z1_BASIS_URL ist keine Adresse: „${wert}“. Erwartet etwa https://<vorschau>.vercel.app`)
  return wert.replace(/\/+$/, '')
}

const basis = basisAusUmgebung()
const schutz = process.env.Z1_VERCEL_SCHUTZ?.trim() ?? ''
const executablePath = chromiumPfad()

const projekte: Project[] = PROJEKTE.map((name) => {
  const klasse = GERAETEKLASSEN.find((eintrag) => eintrag.name === name)
  if (klasse === undefined) throw new Error(`Geräteklasse ${name} fehlt in scripts/pruefung/geraeteklassen.mjs.`)
  return { name, use: kontextOptionen(klasse) }
})

export default defineConfig({
  testDir: './tests/vollpartien',
  outputDir: './test-results/vollpartien',
  // Ein zweiter Versuch würde einen Fehler, der nur manchmal kommt, als Wackler verdecken.
  retries: 0,
  fullyParallel: true,
  reporter: 'list',
  timeout: 15 * 60_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: basis ?? LOKAL_URL,
    contextOptions: { reducedMotion: 'reduce' },
    ...(schutz === '' ? {} : { extraHTTPHeaders: { 'x-vercel-protection-bypass': schutz, 'x-vercel-set-bypass-cookie': 'true' } }),
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: projekte,
  // Wie in playwright.config.ts: Antwortet unter der Adresse schon ein Server, bricht
  // Playwright ab, statt einen fremden oder alten Build zu spielen.
  webServer:
    basis === null
      ? {
          command: 'vite build --outDir dist-vollpartien --emptyOutDir && vite preview --outDir dist-vollpartien --port 4175 --strictPort',
          url: LOKAL_URL,
          // Überschreibt eine gesetzte Variable des Aufrufers, sonst trüge der Build die Testhooks.
          env: { VITE_TEST_HOOKS: '0' },
          reuseExistingServer: false,
          timeout: 120_000,
        }
      : undefined,
})
