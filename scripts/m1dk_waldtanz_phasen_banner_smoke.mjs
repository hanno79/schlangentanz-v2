#!/usr/bin/env node
/*
 * Author: rahn
 * Datum: 25.06.2026
 * Version: 1.0
 * Beschreibung: M1dk Production-Smoke fuer das sichtbare Waldtanz-Spielphasen-Banner.
 *              Verifiziert auf 1280x900 mit reducedMotion, dass das Phasen-Banner
 *              auf /game existiert, alle 4 Phasen rendert, die aktive Phase korrekt
 *              hervorgehoben ist und die Banner-Klasse mit Stitch-Optik sichtbar ist.
 *
 * Verwendung:
 *   node scripts/m1dk_waldtanz_phasen_banner_smoke.mjs                # live gegen SMOKE_BASE_URL
 *   node scripts/m1dk_waldtanz_phasen_banner_smoke.mjs --self-test   # Offline-Konfig-Check
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const SELF_TEST = process.argv.includes('--self-test')

export async function pruefeM1dkPhasenBanner(page) {
  /* ÄNDERUNG [31.07.2026]: S-3 — auf /game ist das Banner bewusst unsichtbar.
     M2r (27.06.2026) blendet es dort per display:none aus, damit die
     Schlangenlichtung als Bühne atmet; die Phaseninformation lebt seither im
     Rankenchip des Seitenmenüs. Die React-Elemente bleiben im DOM (M2r hat sie
     ausdrücklich nicht entfernt, weil Vitest-Tests sie erwarten) — deshalb lief
     dieser Smoke in einen 5-Sekunden-Timeout auf `state: 'visible'`.

     Geprüft wird jetzt beides getrennt: die Struktur des Banners (unten, per
     DOM-Zählung, unabhängig von der Sichtbarkeit) und dass die Phaseninformation
     dem Spieler auf /game tatsächlich angezeigt wird (Phasen-Texte weiter unten).
     Damit fällt der Vertrag auf, wenn M2r zurückgenommen wird — und auch, wenn
     die Phaseninfo ganz verschwindet. */
  const banner = page.locator('.waldtanz-phasen-banner').first()
  await banner.waitFor({ state: 'attached', timeout: 5000 })
  if (await banner.isVisible()) {
    const box = await banner.boundingBox()
    if (!box) throw new Error('Phasen-Banner sichtbar, aber ohne boundingBox')
    if (box.height < 24) throw new Error(`Phasen-Banner zu niedrig: ${box.height}px < 24px`)
  }

  // Alle 4 Phasen-Pillen muessen rendern.
  const pillen = page.locator('.waldtanz-phasen-banner__phase')
  const pillenAnzahl = await pillen.count()
  if (pillenAnzahl !== 4) throw new Error(`Phasen-Banner erwartet 4 Pillen, hat ${pillenAnzahl}`)

  // Genau eine --aktiv-Pille.
  const aktivePillen = page.locator('.waldtanz-phasen-banner__phase--aktiv')
  const aktiveAnzahl = await aktivePillen.count()
  if (aktiveAnzahl !== 1) throw new Error(`Phasen-Banner erwartet 1 aktive Pille, hat ${aktiveAnzahl}`)

  /* Alle 4 Phasen-Texte müssen im Banner stehen — als Text, nicht als
     Sichtbarkeit. ÄNDERUNG [31.07.2026]: S-3 — vorher wurde jeder der vier
     Texte per isVisible() geprüft. Auf /game zeigt der Rankenchip des
     Seitenmenüs nur die *laufende* Phase an; die drei anderen sind dort
     naturgemäß nicht sichtbar, seit M2r das Banner ausblendet. */
  const bannerText = (await banner.textContent()) ?? ''
  const erwartetePhasen = ['Nachziehphase', 'Ausspielphase', 'Aufgabenprüfung', 'Zugabschluss']
  for (const phase of erwartetePhasen) {
    if (!bannerText.includes(phase)) throw new Error(`Phasen-Banner ohne Phase "${phase}": ${bannerText}`)
  }

  /* Und die laufende Phase muss dem Spieler auf /game angezeigt werden — egal
     ob im Banner oder in dessen Nachfolger. Das ist der Teil des Vertrags, der
     den Spieler betrifft: Er muss wissen, wo im Zug er steht. */
  const aktivePhase = ((await aktivePillen.first().textContent()) ?? '').trim()
  const aktiverName = erwartetePhasen.find((phase) => aktivePhase.includes(phase))
  if (!aktiverName) throw new Error(`Aktive Pille trägt keinen bekannten Phasennamen: "${aktivePhase}"`)
  if (!(await page.getByText(aktiverName, { exact: false }).first().isVisible())) {
    throw new Error(`Laufende Phase "${aktiverName}" wird dem Spieler nirgends angezeigt`)
  }

  console.log(`M1dk Phasen-Banner OK: 4 Pillen, 1 aktiv (${aktiverName}), laufende Phase sichtbar`)
  return { pillenAnzahl, aktiveAnzahl, aktiverName }
}

async function smoke() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('console.error:', msg.text())
  })
  page.on('pageerror', (err) => console.error('pageerror:', err.message))

  try {
    await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle', timeout: 30000 })
    const ergebnis = await pruefeM1dkPhasenBanner(page)
    console.log('M1dk Selbsttest bestanden:', JSON.stringify(ergebnis))
  } finally {
    await browser.close()
  }
}

if (SELF_TEST) {
  console.log('M1dk Selbsttest bestanden (Konfig + Helper geladen)')
  process.exit(0)
}

smoke().catch((err) => {
  console.error('M1dk Smoke fehlgeschlagen:', err.message)
  process.exit(1)
})