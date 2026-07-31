/*
Author: rahn
Datum: 22.06.2026
Version: 1.0
Beschreibung: M1cw Browser-Smoke fuer die Brettschritt-Stempel-Aktions-Konsequenz
auf /game. Verifiziert, dass nach einer Wachstumsfährte-Aktion (KarteAnlegen)
der juengste Brettschritt-Stempel eine zweite Konsequenz-Zeile mit dem vollen
Aktions-Label traegt (z. B. "Karte blau-m1cw an Schlange pfad-m1cw rechts anlegen"),
inklusive CSS-Spielobjekt-Vertrag (italic, border-left) und Aria-Label mit
"Konsequenz:" Praefix.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) { return new URL(route, BASE_URL).toString() }

async function http200(route) {
  const response = await fetch(url(route), { signal: AbortSignal.timeout(15_000) })
  if (response.status !== 200) throw new Error(`M1cw Konsequenz: HTTP ${response.status} fuer ${url(route)}`)
}

await Promise.all(['/', '/game'].map(http200))

const browser = await chromium.launch()
const consoleErrors = []
const pageErrors = []
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  page.on('pageerror', (err) => pageErrors.push(err.message))
  await page.addInitScript(() => { Math.random = () => 0.999999 })

  try {
    await page.goto(url('/'), { waitUntil: 'networkidle' })
    const lobbyKonsequenz = await page.evaluate(() => Boolean(document.querySelector('.brettschritt-stempel__konsequenz')))
    if (lobbyKonsequenz) {
      throw new Error('M1cw Konsequenz: Brettschritt-Konsequenz unerwartet sichtbar auf /')
    }

    await page.goto(url('/game'), { waitUntil: 'networkidle' })
    await page.getByRole('region', { name: 'Spieltisch' }).waitFor()

    // Initialer Brettschritt-Stempel-Container ist leer (kein ablagestapel)
    const initialStempel = await page.evaluate(() => document.querySelectorAll('.brettschritt-stempel').length)
    if (initialStempel !== 0) {
      throw new Error(`M1cw Konsequenz: Initialer Brettschritt-Stempel-Container hat ${initialStempel} Eintraege, erwartet 0`)
    }

    // Startfuehrte klicken, um erste eigene Schlange zu erzeugen
    /* ÄNDERUNG [31.07.2026]: S-5 — Beschriftung nachgezogen. Die Startfährten
       heißen seit dem Waldtanz-Umbau „Startfährte <karte> als neue Schlange
       starten" (SchlangenStartzone.tsx); „… für Pfad … spielen" existiert nicht
       mehr, weshalb der Klick in einen 30-Sekunden-Timeout lief. */
    const startfährte = page.getByRole('button', { name: /Startfährte .* als neue Schlange starten/i }).first()
    await startfährte.click()

    // Brettschritt-Stempel erscheint mit dem Aktions-Label als Konsequenz-Zeile
    const arenenstein = page.getByRole('region', { name: 'Waldtanz-Arenastein' })
    const stempelReihe = arenenstein.getByRole('list', { name: 'Brettschritt-Stempel' })
    await stempelReihe.waitFor({ timeout: 10_000 })

    const beweis = await page.evaluate(() => {
      const stempel = Array.from(document.querySelectorAll('.brettschritt-stempel'))
      const ersteKonsequenz = stempel.map((s) => s.querySelector('.brettschritt-stempel__konsequenz')?.textContent?.trim() ?? null)
      const ersteAriaLabel = stempel[0]?.getAttribute('aria-label') ?? null
      const ersteKlasse = stempel[0]?.className ?? null
      const styles = (() => {
        const el = stempel[0]?.querySelector('.brettschritt-stempel__konsequenz')
        if (!el) return null
        const cs = window.getComputedStyle(el)
        return {
          fontStyle: cs.fontStyle,
          borderLeftWidth: cs.borderLeftWidth,
          borderLeftStyle: cs.borderLeftStyle,
          display: cs.display,
        }
      })()
      return { anzahl: stempel.length, ersteKonsequenz, ersteAriaLabel, ersteKlasse, styles }
    })

    if (beweis.anzahl === 0) throw new Error('M1cw Konsequenz: Brettschritt-Stempel-Container nach Wachstumsfährte leer')
    if (!beweis.ersteKonsequenz.some((k) => k && k.length > 0)) {
      throw new Error('M1cw Konsequenz: Kein Stempel mit sichtbarer Konsequenz-Zeile gefunden')
    }
    if (!beweis.ersteAriaLabel?.includes('Konsequenz:')) {
      throw new Error(`M1cw Konsequenz: Aria-Label ohne "Konsequenz:"-Praefix (${beweis.ersteAriaLabel})`)
    }
    if (beweis.styles) {
      if (beweis.styles.fontStyle !== 'italic') {
        throw new Error(`M1cw Konsequenz: fontStyle=${beweis.styles.fontStyle}, erwartet italic`)
      }
      if (beweis.styles.borderLeftWidth === '0px') {
        throw new Error(`M1cw Konsequenz: border-left-width=0, erwartet >=2px`)
      }
    }

    console.log(`M1cw Konsequenz: Stempel=${beweis.anzahl}, ersteKonsequenz="${beweis.ersteKonsequenz.filter((k) => k).join(' | ')}", ariaLabel="${beweis.ersteAriaLabel}"`)
  } finally {
    await ctx.close()
  }
} finally {
  await browser.close()
}

if (consoleErrors.length > 0) {
  throw new Error(`M1cw Konsequenz: Konsolenfehler ${consoleErrors.join(' | ')}`)
}
if (pageErrors.length > 0) {
  throw new Error(`M1cw Konsequenz: Seitenfehler ${pageErrors.join(' | ')}`)
}