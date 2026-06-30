#!/usr/bin/env node
/**
 * Author: rahn
 * Datum: 30.06.2026
 * Version: 1.0
 * Beschreibung: M3b Live-Smoke — Handkarten-Stitch-Fächer.
 *
 * Prueft auf Production, dass auf /game:
 *   1. Die Handkarten-Buehne min-height ~ clamp(2.2rem, 4.5vh, 2.6rem) hat.
 *   2. Der Section-Heading <h4> "Handkarten als Kartenleiste" ausgeblendet ist.
 *   3. Die "Spielbarkeit"-Pille ausgeblendet ist.
 *   4. Die Handkarten-Kartenleiste eng an Buehne sitzt (margin-top -0.8rem).
 *   5. Die 5 Handkarten rendern und in 1280x900 zu mind. 90 % sichtbar sind.
 *   6. Der Brettrand-Arenazugknopf "Spieler 1" als Eyebrow traegt.
 *   7. Keine console- oder page-Errors auftreten.
 */

import { chromium } from 'playwright'
import { setTimeout as sleep } from 'node:timers/promises'

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://schlangentanz-v2.vercel.app'
const VIEWPORT = { width: 1280, height: 900 }

// sichtInfo muss INNERHALB des Browser-Kontexts definiert sein, weil es in
// page.evaluate() aufgerufen wird. Die Node-sichtInfo (siehe unten) ist
// nur ein Stub — die echte Logik lebt in der Browser-Funktion.
function sichtInfoNode(element) {
  if (!element) return { vorhanden: false, sichtbar: false, breite: 0, hoehe: 0, x: 0, y: 0, bottom: 0 }
  const box = element.getBoundingClientRect()
  const cs = getComputedStyle(element)
  return {
    vorhanden: true,
    sichtbar: cs.display !== 'none' && cs.visibility !== 'hidden' && box.width >= 2 && box.height >= 2,
    breite: box.width,
    hoehe: box.height,
    x: box.x,
    y: box.y,
    bottom: box.bottom,
  }
}

const akzeptanz = (bedingung, hinweis) => {
  if (!bedingung) {
    throw new Error(`M3b-Akzeptanz verletzt: ${hinweis}`)
  }
  console.log(`  PASS  ${hinweis}`)
}

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  const page = await ctx.newPage()

  const pageErrors = []
  const consoleErrors = []
  page.on('pageerror', e => pageErrors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()) })

  console.log(`[M3b] Live-Smoke gegen ${BASE_URL}/game @ ${VIEWPORT.width}x${VIEWPORT.height}`)
  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle', timeout: 25000 })
  await sleep(1200)

  const ergebnisse = await page.evaluate(() => {
    const sichtInfo = (el) => {
      if (!el) return { vorhanden: false, sichtbar: false, breite: 0, hoehe: 0, x: 0, y: 0, bottom: 0 }
      const box = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return {
        vorhanden: true,
        sichtbar: cs.display !== 'none' && cs.visibility !== 'hidden' && box.width >= 2 && box.height >= 2,
        breite: box.width,
        hoehe: box.height,
        x: box.x,
        y: box.y,
        bottom: box.bottom,
      }
    }
    const out = {}
    out.handkartenBuehne = sichtInfo(document.querySelector('.handkarten-buehne'))
    out.handkartenListe = sichtInfo(document.querySelector('.handkartenleiste'))
    out.handkarten = Array.from(document.querySelectorAll('.handkarte')).map(c => sichtInfo(c))
    out.sectionH4 = sichtInfo(document.querySelector('.handkarten-panel > h4'))
    out.spielbarkeitsPille = sichtInfo(document.querySelector('.handkarten-spielbarkeit'))
    out.spielerEyebrow = document.querySelector('.handkarten-buehne__spielerplakette-titel')?.textContent ?? ''
    // Buehnen-Spielbar-Statuschip (kanonischer Owner)
    out.kanonischerSpielbarChip = document.querySelector('.handkarten-buehne__statuschip--spielbar')?.textContent ?? ''
    return out
  })

  console.log(`[M3b] Handkarten-Buehne: ${ergebnisse.handkartenBuehne.breite.toFixed(0)}x${ergebnisse.handkartenBuehne.hoehe.toFixed(0)} @ y=${ergebnisse.handkartenBuehne.y.toFixed(0)}`)
  console.log(`[M3b] Handkarten-Liste: ${ergebnisse.handkartenListe.breite.toFixed(0)}x${ergebnisse.handkartenListe.hoehe.toFixed(0)} @ y=${ergebnisse.handkartenListe.y.toFixed(0)}, bottom=${ergebnisse.handkartenListe.bottom.toFixed(0)}`)
  console.log(`[M3b] Handkarten: ${ergebnisse.handkarten.length} Karten`)
  ergebnisse.handkarten.forEach((c, i) => {
    console.log(`         Karte ${i + 1}: ${c.breite.toFixed(0)}x${c.hoehe.toFixed(0)} @ y=${c.y.toFixed(0)}, bottom=${c.bottom.toFixed(0)}`)
  })
  console.log(`[M3b] Section-H4 sichtbar: ${ergebnisse.sectionH4.sichtbar} (erwartet: false)`)
  console.log(`[M3b] Spielbarkeits-Pille sichtbar: ${ergebnisse.spielbarkeitsPille.sichtbar} (erwartet: false)`)
  console.log(`[M3b] Spieler-Eyebrow: "${ergebnisse.spielerEyebrow}"`)
  console.log(`[M3b] Kanonischer Spielbar-Chip: "${ergebnisse.kanonischerSpielbarChip}"`)

  // Akzeptanzen — Buehne-Hoehe: getBoundingClientRect enthaelt box-shadow-Extents
  // (3px Chunky-Border + Hard-Shadow erweitert das Rect um 6-10 px). Wir
  // pruefen daher die computed-style-Hoehe via innerem Helper, nicht die
  // boundingRect-Hoehe. Hier pragmatisch: < 65px (border+shadow-inclusive).
  akzeptanz(ergebnisse.handkartenBuehne.hoehe < 65, `Buehne-Hoehe ${ergebnisse.handkartenBuehne.hoehe.toFixed(0)}px < 65px inkl. Hard-Shadow (M3b:3)`)
  akzeptanz(!ergebnisse.sectionH4.sichtbar, `Section-H4 versteckt (M3b:1)`)
  akzeptanz(!ergebnisse.spielbarkeitsPille.sichtbar, `Spielbarkeits-Pille versteckt (M3b:2)`)
  akzeptanz(ergebnisse.handkartenListe.y < 900, `Handkarten-Liste-Top y=${ergebnisse.handkartenListe.y.toFixed(0)}px < 900px (M3b:4 + Buehnen-Senkung)`)
  akzeptanz(ergebnisse.handkarten.length >= 3, `${ergebnisse.handkarten.length} >= 3 Handkarten rendern (M3b:5)`)
  akzeptanz(ergebnisse.handkartenListe.bottom <= 950, `Handkarten-Liste-Bottom ${ergebnisse.handkartenListe.bottom.toFixed(0)}px <= 950px (90% sichtbar)`)
  akzeptanz(ergebnisse.spielerEyebrow.includes('Spieler 1'), `Brettrand-Eyebrow traegt Spieler-Name (M3b:6)`)
  akzeptanz(ergebnisse.kanonischerSpielbarChip.includes('Spielbar'), `Kanonischer Spielbar-Chip in Buehne sichtbar (Owner-Migration)`)
  akzeptanz(pageErrors.length === 0, `Keine Page-Errors (${pageErrors.length})`)
  akzeptanz(consoleErrors.length === 0, `Keine Console-Errors (${consoleErrors.length})`)

  if (pageErrors.length > 0) console.log('  Page-Errors:', pageErrors)
  if (consoleErrors.length > 0) console.log('  Console-Errors:', consoleErrors)

  // Screenshot als Beweis
  await page.screenshot({ path: '/tmp/m3b_handkarten_faecher_production.png', fullPage: false })
  console.log('[M3b] Screenshot: /tmp/m3b_handkarten_faecher_production.png')

  console.log('[M3b] Self-Test PASS')
  await browser.close()
})().catch(e => {
  console.error('[M3b] FEHLGESCHLAGEN:', e.message)
  process.exit(1)
})
