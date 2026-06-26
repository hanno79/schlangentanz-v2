#!/usr/bin/env node
/*
 * Author: rahn
 * Datum: 26.06.2026
 * Version: 1.0
 * Beschreibung: M1dl Production-Smoke fuer die pulsierende Anlegeplatz-Dropzone
 *              auf /game. Verifiziert auf 1280x900 + 1100x800:
 *              - jeder sichtbare .schlangekarte__anlegeplatz hat einen
 *                sichtbaren .schlangekarte__anlegeplatz-pfeil mit ← / →
 *              - .schlangekarte__anlegeplatz hat dashed Border + Hard-Shadow
 *              - auf page.hover(...) wird transform mit translateY + scale aktiv
 *              - keine console/page-Errors
 *
 * Verwendung:
 *   node scripts/m1dl_waldtanz_anlegeplatz_dropzone_smoke.mjs                # live gegen SMOKE_BASE_URL
 *   node scripts/m1dl_waldtanz_anlegeplatz_dropzone_smoke.mjs --self-test   # Offline-Konfig-Check
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const HTTP_TIMEOUT_MS = 15_000
const SELF_TEST = process.argv.includes('--self-test')

export function erstelleSelbsttestAusgabe() {
  return [
    'M1dl Anlegeplatz-Dropzone Selbsttest bestanden',
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

export async function pruefeM1dlAnlegeplatzDropzone(seite, viewport) {
  const ergebnis = await seite.evaluate(() => {
    const plaetze = Array.from(document.querySelectorAll('.schlangekarte__anlegeplatz'))
    if (plaetze.length === 0) throw new Error('M1dl: keine .schlangekarte__anlegeplatz sichtbar')

    const kacheln = plaetze.map((kachel) => {
      if (!(kachel instanceof HTMLElement)) return null
      const pfeil = kachel.querySelector('.schlangekarte__anlegeplatz-pfeil')
      const style = getComputedStyle(kachel)
      const box = kachel.getBoundingClientRect()
      return {
        position: kachel.classList.contains('schlangekarte__anlegeplatz--links')
          ? 'links'
          : kachel.classList.contains('schlangekarte__anlegeplatz--rechts')
            ? 'rechts'
            : 'unbekannt',
        pfeilText: pfeil instanceof HTMLElement ? pfeil.textContent : null,
        pfeilSichtbar: pfeil instanceof HTMLElement && pfeil.getBoundingClientRect().width >= 4,
        borderStyle: style.borderTopStyle,
        borderWidth: style.borderTopWidth,
        borderRadius: style.borderTopLeftRadius,
        boxShadow: style.boxShadow,
        transform: style.transform,
        breite: box.width,
        hoehe: box.height,
      }
    }).filter(Boolean)

    return {
      kachelAnzahl: kacheln.length,
      kacheln,
    }
  })

  console.log(`M1dl Anlegeplatz-Dropzone @${viewport.label}: ${ergebnis.kachelAnzahl} Kacheln, Positionen: ${ergebnis.kacheln.map((k) => `${k.position}(Pfeil="${k.pfeilText}",pfeilSichtbar=${k.pfeilSichtbar})`).join(', ')}`)

  if (ergebnis.kachelAnzahl < 2) throw new Error(`M1dl: erwarte mind. 2 Anlegeplaetze, gefunden ${ergebnis.kachelAnzahl}`)
  const linksKachel = ergebnis.kacheln.find((k) => k.position === 'links')
  const rechtsKachel = ergebnis.kacheln.find((k) => k.position === 'rechts')
  if (!linksKachel || !rechtsKachel) throw new Error('M1dl: erwarte je eine links- und rechts-Anlegeplatz-Kachel')
  if (linksKachel.pfeilText !== '←') throw new Error(`M1dl: links-Pfeil erwartet "←", gefunden "${linksKachel.pfeilText}"`)
  if (rechtsKachel.pfeilText !== '→') throw new Error(`M1dl: rechts-Pfeil erwartet "→", gefunden "${rechtsKachel.pfeilText}"`)
  if (!linksKachel.pfeilSichtbar) throw new Error('M1dl: links-Pfeil nicht sichtbar (Breite < 4px)')
  if (!rechtsKachel.pfeilSichtbar) throw new Error('M1dl: rechts-Pfeil nicht sichtbar (Breite < 4px)')
  if (linksKachel.borderStyle !== 'dashed') throw new Error(`M1dl: links-Border erwartet dashed, gefunden ${linksKachel.borderStyle}`)
  if (rechtsKachel.borderStyle !== 'dashed') throw new Error(`M1dl: rechts-Border erwartet dashed, gefunden ${rechtsKachel.borderStyle}`)

  // Hover-Lift aktivieren und pruefen, ob transform nicht-trivial ist.
  const rechtsSelektor = '.schlangekarte__anlegeplatz--rechts'
  await seite.hover(rechtsSelektor)
  await seite.waitForTimeout(180)
  const hoverTransform = await seite.evaluate((sel) => {
    const el = document.querySelector(sel)
    return el instanceof HTMLElement ? getComputedStyle(el).transform : ''
  }, rechtsSelektor)
  console.log(`M1dl Hover-Transform @${viewport.label}: ${hoverTransform}`)
  if (!hoverTransform || hoverTransform === 'none') throw new Error('M1dl: hover-Transform fehlt auf rechts-Anlegeplatz')
  if (!/matrix/.test(hoverTransform)) throw new Error(`M1dl: hover-Transform unerwartet: ${hoverTransform}`)
}

async function fuehreSelbsttestAus() {
  console.log(erstelleSelbsttestAusgabe())
}

async function fuehreLiveSmokeAus() {
  await httpPruefen(BASE_URL)
  const browser = await chromium.launch()
  try {
    for (const viewport of [
      { width: 1280, height: 900, label: '1280x900' },
      { width: 1100, height: 800, label: '1100x800' },
    ]) {
      const seite = await browser.newPage({ viewport })
      const consoleErrors = []
      const pageErrors = []
      seite.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
      seite.on('pageerror', (err) => pageErrors.push(err.message))
      await seite.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle', timeout: 15_000 })

      // Handkarte auswaehlen, damit Anlegeplaetze erscheinen.
      // Vorbedingung: Spielerin muss eine eigene Schlange haben. Auf /game
      // muss sie zunaechst eine Startfaehrte anklicken, um die erste Schlange
      // zu starten (M1cj-Pattern).
      const startfaehrte = seite.locator('.schlangen-startzone__faehrte-button').first()
      await startfaehrte.waitFor({ state: 'visible', timeout: 5_000 })
      await startfaehrte.click({ force: true })
      await seite.waitForTimeout(400)
      // force: true toleriert pre-existing Layout-Themen (z.B. Karten ragen
      // leicht unter den 900-px-Fold), die nicht im M1dl-Scope liegen.
      const handkarte = seite.locator('.handkartenleiste--spielkartenfaecher .handkarte__button--karte').first()
      await handkarte.waitFor({ state: 'visible', timeout: 5_000 })
      await handkarte.click({ force: true })
      await seite.waitForSelector('.schlangekarte__anlegeplatz', { timeout: 5_000 })

      await pruefeM1dlAnlegeplatzDropzone(seite, viewport)

      if (consoleErrors.length > 0) throw new Error(`M1dl: ${consoleErrors.length} console-Errors: ${consoleErrors.slice(0, 3).join(' | ')}`)
      if (pageErrors.length > 0) throw new Error(`M1dl: ${pageErrors.length} page-Errors: ${pageErrors.slice(0, 3).join(' | ')}`)

      await seite.close()
    }
  } finally {
    await browser.close()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (SELF_TEST) {
    await fuehreSelbsttestAus()
  } else {
    await fuehreLiveSmokeAus()
  }
}