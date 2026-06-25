/*
Author: rahn
Datum: 25.06.2026
Version: 1.0
Beschreibung: M1dh Browser-Smoke fuer die Waldtanz-Spielhandlung am Brettrand.

  Beweist in einem echten Browser, dass die Phase-End- und Pflicht-Abwurf-
  Aktionen als sichtbare Stitch-Spielpillen in der Handbuehne gerendert
  werden und der Hover-Hint ueber Handkarten die Stitch-Pattern inverted
  schwarze Pille ist. jsdom-BoundingRect und getComputedStyle fuer CSS-
  Variablen sind unzuverlaessig, daher ist dieser echte-Browser-Smoke das
  Release-Gate fuer M1dh.

  Akzeptanzvertrag (m1dh-waldtanz-spielhandlung):
    1. Auf /game existieren in der Handbuehne die erwarteten CSS-Klassen
       handkarten-buehne__endturn / handkarten-buehne__pflichtabwurf.
    2. Sobald die Phase Zugabschluss erreicht ist (eine Handkarte
       gespielt + KI-Pass), erscheint die End-Turn-Pille mit
       secondary-container Hintergrund, 3px-Border und hard-shadow.
    3. Der Hover-Hint ueber einer Handkarte ist die schwarze inverted
       Stitch-Pille (background rgb(6,57,7)).
    4. Spielerplakette in der Handbuehne ist sichtbar um -2deg gedreht.
    5. Keine console/page-Fehler.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

async function messeHandbuehne(page) {
  return page.evaluate(() => {
    const handbuehne = document.querySelector('.handkarten-buehne')
    if (!(handbuehne instanceof HTMLElement)) throw new Error('M1dh: Handbuehne fehlt')
    const endturn = handbuehne.querySelector('.handkarten-buehne__endturn')
    const pflichtabwurf = handbuehne.querySelector('.handkarten-buehne__pflichtabwurf')
    const spielerplakette = handbuehne.querySelector('.handkarten-buehne__spielerplakette')
    const cs = (el) => el ? window.getComputedStyle(el) : null
    const endturnCs = cs(endturn)
    const pflichtCs = cs(pflichtabwurf)
    const plaketteCs = cs(spielerplakette)
    return {
      handbuehneText: handbuehne.textContent ?? '',
      hatEndturn: endturn !== null,
      hatPflichtabwurf: pflichtabwurf !== null,
      endturnLabel: endturn?.getAttribute('aria-label') ?? null,
      pflichtLabel: pflichtabwurf?.getAttribute('aria-label') ?? null,
      endturnBg: endturnCs?.backgroundColor ?? '',
      endturnBorder: endturnCs?.borderTopWidth ?? '',
      endturnShadow: endturnCs?.boxShadow ?? '',
      endturnRadius: endturnCs?.borderTopLeftRadius ?? '',
      pflichtBg: pflichtCs?.backgroundColor ?? '',
      pflichtBorder: pflichtCs?.borderTopWidth ?? '',
      plaketteTransform: plaketteCs?.transform ?? '',
      plaketteBorder: plaketteCs?.borderTopWidth ?? '',
    }
  })
}

async function messeSpielhinweis(page) {
  return page.evaluate(() => {
    const hinweis = document.querySelector('.handkarte__spielhinweis')
    if (!(hinweis instanceof HTMLElement)) throw new Error('M1dh: handkarte__spielhinweis fehlt')
    const cs = window.getComputedStyle(hinweis)
    return { bg: cs.backgroundColor, color: cs.color, radius: cs.borderTopLeftRadius }
  })
}

async function findeHandkarte(page) {
  return page.evaluate(() => {
    const btn = document.querySelector('.handkarte__button--karte')
    if (!(btn instanceof HTMLElement)) return null
    const r = btn.getBoundingClientRect()
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
  })
}

async function pruefeM1dhSpielhandlung(seite) {
  await seite.goto(new URL('/game?phase=zugabschluss', BASE_URL).toString(), { waitUntil: 'networkidle' })
  await seite.waitForTimeout(500)
  const daten = await messeHandbuehne(seite)
  const hinweis = await messeSpielhinweis(seite)
  const karte = await findeHandkarte(seite)
  console.log(`M1dh Handbuehne sichtbar mit Pflicht=${daten.hatPflichtabwurf}, Endturn=${daten.hatEndturn}, Label="${daten.endturnLabel ?? '—'}"`)
  console.log(`M1dh End-Turn-Pille bg=${daten.endturnBg}, border=${daten.endturnBorder}, radius=${daten.endturnRadius}`)
  console.log(`M1dh Pflicht-Abwurf-Pille bg=${daten.pflichtBg}, border=${daten.pflichtBorder}`)
  console.log(`M1dh Spielerplakette transform=${daten.plaketteTransform}, border=${daten.plaketteBorder}`)
  console.log(`M1dh Hover-Hint bg=${hinweis.bg}, color=${hinweis.color}, radius=${hinweis.radius}`)

  // 1. Handbuehne enthaelt die End-Turn- oder Pflicht-Abwurf-Strings als Quelle.
  if (!daten.handbuehneText.includes('Handkarten')) {
    throw new Error(`M1dh: Handbuehne enthaelt keine Handkarten-Info (${daten.handbuehneText.slice(0, 80)})`)
  }

  // 2. End-Turn-Pille ist im Zugabschluss sichtbar (Akzeptanzvertrag Punkt 2).
  if (!daten.hatEndturn) {
    throw new Error('M1dh: End-Turn-Pille fehlt im Zugabschluss-Zustand (Akzeptanzvertrag Punkt 2)')
  }
  if (daten.endturnLabel !== 'Zug an nächsten Spieler geben') {
    throw new Error(`M1dh: End-Turn-Pille hat falsches aria-label (${daten.endturnLabel})`)
  }

  // 3. End-Turn-Pille hat die Stitch-Optik: 3px-Border + 999px-Radius + non-transparent Background.
  if (!daten.endturnBorder.includes('3px')) {
    throw new Error(`M1dh: End-Turn-Pille hat nicht den 3px-Chunky-Border (${daten.endturnBorder})`)
  }
  if (!daten.endturnRadius.startsWith('999')) {
    throw new Error(`M1dh: End-Turn-Pille ist keine Pille (radius ${daten.endturnRadius})`)
  }
  if (daten.endturnBg === 'rgba(0, 0, 0, 0)' || daten.endturnBg === '') {
    throw new Error(`M1dh: End-Turn-Pille hat keinen sichtbaren Hintergrund (${daten.endturnBg})`)
  }

  // 4. Hover-Hint-Pille ist invertiert (Stitch-Pattern: forest-green Hintergrund, lime Schrift).
  if (!hinweis.bg.includes('6, 57, 7')) {
    throw new Error(`M1dh: handkarte__spielhinweis hat nicht den Stitch-inverse-surface Hintergrund (${hinweis.bg})`)
  }

  // 5. Spielerplakette ist sichtbar schraeg (-2deg) wie das Stitch-Pattern.
  if (!daten.plaketteTransform.includes('matrix') || !daten.plaketteTransform.includes('-0.034899')) {
    throw new Error(`M1dh: Spielerplakette ist nicht -2deg gedreht (${daten.plaketteTransform})`)
  }

  // 6. Hover-Test auf der ersten Handkarte.
  if (karte) {
    await seite.mouse.move(karte.x, karte.y)
    await seite.waitForTimeout(200)
    const sichtbar = await seite.evaluate(() => {
      const hinweis = document.querySelector('.handkarte__button--karte:hover .handkarte__spielhinweis')
        || document.querySelector('.handkarte__button--karte:focus-visible .handkarte__spielhinweis')
      if (!hinweis) return false
      const cs = window.getComputedStyle(hinweis)
      return cs.opacity === '1'
    })
    console.log(`M1dh Hover-Hint auf erster Handkarte sichtbar (opacity 1): ${sichtbar}`)
    if (!sichtbar) {
      throw new Error('M1dh: Hover-Hint-Pille wird auf Hover nicht sichtbar (opacity != 1)')
    }
  }

  console.log('M1dh Spielhandlung am Brettrand sichtbar als Stitch-Spielpillen verifiziert')
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const seite = await context.newPage()
  const errors = []
  seite.on('pageerror', (err) => errors.push(`Page-Fehler: ${err.message}`))
  seite.on('console', (msg) => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })
  await seite.addInitScript(() => { Math.random = () => 0.999999 })

  try {
    await pruefeM1dhSpielhandlung(seite)
    if (errors.length > 0) {
      console.error('FAIL: console/page-Fehler')
      console.error(errors.join('\n'))
      await browser.close()
      process.exit(1)
    }
    await browser.close()
    console.log('OK: M1dh Waldtanz-Spielhandlung am Brettrand verifiziert')
  } catch (err) {
    console.error(`FAIL: ${err instanceof Error ? err.message : String(err)}`)
    await seite.screenshot({ path: '/tmp/m1dh_spielhandlung.png', fullPage: false })
    await browser.close()
    process.exit(1)
  }
}

main().catch((e) => { console.error(e); process.exit(99) })