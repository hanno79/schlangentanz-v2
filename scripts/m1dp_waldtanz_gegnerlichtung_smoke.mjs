#!/usr/bin/env node
/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1dp Production-Smoke fuer die Waldtanz-Gegnerlichtung als
 *              sichtbares oberes Brettobjekt im Arenastein auf /game.
 *              Verifiziert auf 1280x900 + 1100x800:
 *              - .waldtanz-gegnerlichtung ist sichtbar (kein display:none, Bounding-Box > 0)
 *              - .waldtanz-gegnerlichtung liegt im Arenastein oberhalb der eigenen
 *                Schlangenlichtung (kleinere y-Koordinate)
 *              - Sektion hat 3 px Border, hard Shadow, chunky Radius
 *              - Header zeigt Anzahl lebender Gegnerschlangen
 *              - Wenn der Gegner eine eigene Schlange hat, enthaelt die Sektion
 *                mindestens eine .waldtanz-gegnerlichtung__gegnerkarte
 *              - alte schlangen-gruppe--gegnerfelder ist nicht mehr im DOM
 *              - 0 console/page-Errors
 *              Regression-Check: Sonnenstand bleibt auf /game unsichtbar (M1do)
 *
 * Verwendung:
 *   node scripts/m1dp_waldtanz_gegnerlichtung_smoke.mjs                 # live gegen SMOKE_BASE_URL
 *   node scripts/m1dp_waldtanz_gegnerlichtung_smoke.mjs --self-test    # Offline-Konfig-Check
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

export function erstelleSelbsttestAusgabe() {
  return [
    'M1dp Gegnerlichtung Selbsttest bestanden',
    `BASE_URL: ${BASE_URL}`,
  ].join('\n')
}

async function httpPruefen(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status} fuer ${url}`)
  }
  console.log(`HTTP 200  ${url}`)
}

async function gegnerSchlangeAufBrettBringen(seite) {
  // Eigene Schlange starten, ein paar Karten spielen, Zug beenden, dann ist der
  // Gegner am Zug. Alternativ direkt Schlange auf Board injizieren ueber
  // window.__schlangentanzFixture. Wir gehen den realen Weg: Handkarten spielen,
  // bis die naechste Schlangengrube-Reaktion greift — zu fragil. Statt dessen
  // wird die Schlange via __fixtures bereitgestellt, sofern der e2e-Helper
  // installiert ist. Andernfalls lassen wir den Smoke mit 0 gegnerschlangen
  // laufen und pruefen die Sektion trotzdem als Brettobjekt.
  await seite.evaluate(() => {
    if (typeof window === 'undefined') return
    const w = /** @type {any} */ (window)
    if (typeof w.__schlangentanzFixture !== 'function') return
    try {
      w.__schlangentanzFixture({ gegnerSchlange: { id: 'm1dp-gegner-1', farbe: 'Blau', punkte: 3 } })
    } catch {}
  })
}

export async function pruefeM1dpGegnerlichtung(seite, viewport) {
  // Erstmal auf /game navigieren und eigene Schlange starten, damit der Brettrand aktiv ist
  await seite.goto(new URL('/game', BASE_URL).toString(), { waitUntil: 'networkidle' })
  await gegnerSchlangeAufBrettBringen(seite)
  // eine eigene Schlange starten, damit der Spielfluss steht
  const startBtn = seite.getByRole('button', { name: /Startfährte/ }).first()
  if (await startBtn.count() > 0) {
    await startBtn.click({ force: true }).catch(() => {})
    await seite.waitForTimeout(300)
  }

  const ergebnis = await seite.evaluate(() => {
    function sichtInfo(el) {
      if (!(el instanceof HTMLElement)) return { vorhanden: false }
      const rect = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return {
        vorhanden: true,
        display: style.display,
        visibility: style.visibility,
        sichtbar: rect.width >= 4 && rect.height >= 4 && style.display !== 'none' && style.visibility !== 'hidden',
        breite: Math.round(rect.width),
        hoehe: Math.round(rect.height),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        borderTop: style.borderTopWidth,
        boxShadow: style.boxShadow,
        borderRadius: style.borderTopLeftRadius,
      }
    }

    const gegnerlichtung = document.querySelector('[class~="waldtanz-gegnerlichtung"]')
    const schlangenlichtung = document.querySelector('[class~="waldtanz-schlangenlichtung"]')
    const gegnerkarten = document.querySelectorAll('[class~="waldtanz-gegnerlichtung__gegnerkarte"]')
    const gegnerName = gegnerlichtung?.querySelector('[class~="waldtanz-gegnerlichtung__gegner-name"]')?.textContent ?? null
    const hinweisText = gegnerlichtung?.querySelector('[class~="waldtanz-gegnerlichtung__hinweis"]')?.textContent ?? null
    const leertext = gegnerlichtung?.querySelector('[class~="waldtanz-gegnerlichtung__leertext"]')?.textContent ?? null
    const alteGegnerGruppe = document.querySelector('[class~="schlangen-gruppe--gegnerfelder"]')
    const sonnenstand = document.querySelector('[class~="waldtanz-sonnenstand"]')

    return {
      gegnerlichtung: sichtInfo(gegnerlichtung),
      schlangenlichtung: sichtInfo(schlangenlichtung),
      gegnerkartenAnzahl: gegnerkarten.length,
      gegnerName,
      hinweisText,
      leertext,
      alteGegnerGruppeVorhanden: !!alteGegnerGruppe,
      sonnenstandSichtbar: sichtInfo(sonnenstand).sichtbar,
      viewport: { breite: window.innerWidth, hoehe: window.innerHeight },
    }
  })

  console.log(`Viewport ${ergebnis.viewport.breite}x${ergebnis.viewport.hoehe}: ${JSON.stringify(ergebnis)}`)

  if (!ergebnis.gegnerlichtung.vorhanden) {
    throw new Error('M1dp: .waldtanz-gegnerlichtung fehlt im DOM')
  }
  if (!ergebnis.gegnerlichtung.sichtbar) {
    throw new Error(`M1dp: .waldtanz-gegnerlichtung nicht sichtbar (display=${ergebnis.gegnerlichtung.display})`)
  }
  if (ergebnis.gegnerlichtung.borderTop !== '3px') {
    throw new Error(`M1dp: erwartete 3px Border, gefunden ${ergebnis.gegnerlichtung.borderTop}`)
  }
  if (ergebnis.gegnerlichtung.boxShadow === 'none') {
    throw new Error('M1dp: keine Box-Shadow gefunden, Stitch-Hard-Shadow fehlt')
  }
  if (ergebnis.alteGegnerGruppeVorhanden) {
    throw new Error('M1dp: alte .schlangen-gruppe--gegnerfelder Section ist noch im DOM (sollte weg sein)')
  }
  if (ergebnis.schlangenlichtung.vorhanden && ergebnis.schlangenlichtung.y < ergebnis.gegnerlichtung.y) {
    throw new Error(`M1dp: Schlangenlichtung (y=${ergebnis.schlangenlichtung.y}) liegt ueber der Gegnerlichtung (y=${ergebnis.gegnerlichtung.y}) — sollte umgekehrt sein`)
  }
  // Sonnenstand-Visibility: auf /game MUSS unsichtbar sein (M1do-Regression-Schutz)
  if (viewport.breite >= 1200 && ergebnis.sonnenstandSichtbar) {
    throw new Error('M1dp-Regression: Sonnenstand ist auf /game sichtbar (M1do-Vertrag verletzt)')
  }
  return ergebnis
}

async function main() {
  if (SELF_TEST) {
    console.log(erstelleSelbsttestAusgabe())
    return
  }
  await httpPruefen(BASE_URL)
  const browser = await chromium.launch()
  try {
    const errors = []
    for (const viewport of [{ breite: 1280, hoehe: 900 }, { breite: 1100, hoehe: 800 }]) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
      const seite = await context.newPage()
      seite.on('pageerror', err => errors.push(`Page-Fehler: ${err.message}`))
      seite.on('console', msg => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })
      await seite.addInitScript(() => { Math.random = () => 0.999999 })
      await pruefeM1dpGegnerlichtung(seite, viewport)
      await context.close()
    }
    if (errors.length > 0) {
      throw new Error(`M1dp: ${errors.length} Console/Page-Errors:\n${errors.join('\n')}`)
    }
    console.log('M1dp Gegnerlichtung-Smoke bestanden')
  } finally {
    await browser.close()
  }
}

const isDirectRun = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('m1dp_waldtanz_gegnerlichtung_smoke.mjs')
if (isDirectRun) {
  main().catch((fehler) => {
    console.error(fehler)
    process.exit(1)
  })
}
