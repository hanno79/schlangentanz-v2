/*
Author: rahn
Datum: 24.06.2026
Version: 1.0
Beschreibung: M1d1 Browser-Smoke fuer das Flex-Column-Arena-Layout auf /game.

  Beweist in einem echten Browser, dass die Schlangenlichtung im
  1280x900-Erstbild SICHTBAR bleibt, nachdem das Arena von Block-Flow auf
  display:flex; flex-direction:column umgestellt wurde. jsdom-BoundingRect
  ist unzuverlaessig (siehe jsdom-bbox-trap-in-slice-tests.md), daher ist
  dieser echte-Browser-Smoke das Release-Gate fuer M1d1.

  Akzeptanzvertrag (m1d1-arena-flex-column-playfield-visibility):
    1. waldtanz-arenastein computedStyle display=flex, flex-direction=column.
    2. waldtanz-arenastein__spielfeld computedStyle flex enthaelt '1 1' (grow).
    3. waldtanz-gegnerplakette computed max-height <= 6.5rem (104 px).
    4. Die Schlangenlichtung hat eine SICHTBARE Hoehe >= 70 px innerhalb
       des Arena-Clips (Schnittmenge Schlangenlichtung-Box ∩ Arena-Clip-Box).
       Vor M1d1 war die Lichtung unter den Kopf-Elementen begraben und
       der sichtbare Anteil lag bei ~0-30 px.
    5. Keine console/page-Fehler.
    6. Spielbrett-Bottom bleibt im Viewport + 60 px Toleranz (M1d0-Vertrag
       bleibt erhalten — M1d1 darf ihn nicht reissen).
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function runde(rect) {
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    w: Math.round(rect.width),
    h: Math.round(rect.height),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
  }
}

async function messeSeite(page) {
  return page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel)
      if (!(el instanceof HTMLElement)) throw new Error(`M1d1: ${sel} fehlt`)
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
    }
    const computed = (sel, props) => {
      const el = document.querySelector(sel)
      if (!(el instanceof HTMLElement)) throw new Error(`M1d1: ${sel} fehlt`)
      const c = getComputedStyle(el)
      const out = {}
      for (const p of props) out[p] = c.getPropertyValue(p)
      return out
    }
    return {
      arena: rect('.waldtanz-arenastein'),
      spielfeld: rect('.waldtanz-arenastein__spielfeld'),
      schlangenlichtung: rect('.schlangenbereich'),
      arenaCss: computed('.waldtanz-arenastein', ['display', 'flex-direction', 'overflow']),
      spielfeldCss: computed('.waldtanz-arenastein__spielfeld', ['flex', 'flex-grow', 'display']),
      gegnerCss: computed('.waldtanz-gegnerplakette', ['max-height']),
      spielbrett: rect('.spielbrett--waldtanz'),
    }
  })
}

function sichtbareHoeheSchlangenlichtung(d) {
  // Sichtbarer Anteil = Schnittmenge der Schlangenlichtung-Box mit dem
  // Arena-Clip-Bereich (overflow:hidden). Nur der Teil innerhalb der
  // Arena-Kanten ist fuer den Spieler sichtbar.
  const clipTop = d.arena.y
  const clipBottom = d.arena.y + d.arena.height
  const sichtTop = Math.max(d.schlangenlichtung.y, clipTop)
  const sichtBottom = Math.min(d.schlangenlichtung.bottom, clipBottom)
  return Math.max(0, sichtBottom - sichtTop)
}

async function pruefeViewport(page, viewport, label) {
  await page.setViewportSize(viewport)
  await page.goto(new URL('/game', BASE_URL).toString(), { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const d = await messeSeite(page)

  // 1. Arena ist flex-column.
  if (d.arenaCss.display !== 'flex') {
    throw new Error(`M1d1 ${label}: Arena display=${d.arenaCss.display} (erwartet flex)`)
  }
  if (d.arenaCss['flex-direction'] !== 'column') {
    throw new Error(`M1d1 ${label}: Arena flex-direction=${d.arenaCss['flex-direction']} (erwartet column)`)
  }

  // 2. Spielfeld hat flex:1 1 (grow >= 1).
  const flexVal = d.spielfeldCss.flex
  const flexGrow = d.spielfeldCss['flex-grow']
  const growOk = /\b1\b/.test(flexVal) || flexGrow === '1'
  if (!growOk) {
    throw new Error(`M1d1 ${label}: Spielfeld flex=${flexVal} grow=${flexGrow} (erwartet grow=1)`)
  }

  // 3. Gegnerplakette max-height <= 6.5rem (~104 px).
  const gegnerMaxH = d.gegnerCss['max-height']
  const pxMatch = gegnerMaxH.match(/([\d.]+)px/)
  if (pxMatch && parseFloat(pxMatch[1]) > 108) {
    throw new Error(`M1d1 ${label}: Gegnerplakette max-height=${gegnerMaxH} (${pxMatch[1]}px > 108px)`)
  }

  // 4. Schlangenlichtung sichtbare Hoehe >= 70 px.
  const sichtH = sichtbareHoeheSchlangenlichtung(d)
  if (sichtH < 70) {
    throw new Error(
      `M1d1 ${label}: Schlangenlichtung sichtbar ${sichtH}px < 70px ` +
      `(lichtung y=${Math.round(d.schlangenlichtung.y)} bottom=${Math.round(d.schlangenlichtung.bottom)}, ` +
      `arena y=${Math.round(d.arena.y)} h=${Math.round(d.arena.height)})`,
    )
  }

  // 6. M1d0-Vertrag bleibt erhalten: Spielbrett im Viewport + 60 px.
  const maxBottom = viewport.height + 60
  if (d.spielbrett.bottom > maxBottom) {
    throw new Error(`M1d1 ${label}: Spielbrett-Bottom ${d.spielbrett.bottom}px > Viewport ${viewport.height}px + 60px`)
  }

  return { sichtH, ...d }
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (err) => errors.push(`Page-Fehler: ${err.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`) })
  await page.addInitScript(() => { Math.random = () => 0.999999 })

  try {
    const haupt = await pruefeViewport(page, { width: 1280, height: 900 }, 'Erstbild 1280x900')
    const gross = await pruefeViewport(page, { width: 1440, height: 900 }, 'Grossbild 1440x900')

    if (errors.length > 0) throw new Error(errors.join('\n'))

    console.log(
      `M1d1 Erstbild 1280x900: Arena ${haupt.arenaCss.display}/${haupt.arenaCss['flex-direction']}, ` +
      `Spielfeld flex=${haupt.spielfeldCss.flex}, ` +
      `Schlangenlichtung sichtbar ${haupt.sichtH}px (>= 70px), ` +
      `Gegner maxH=${haupt.gegnerCss['max-height']}.`,
    )
    console.log(
      `M1d1 Grossbild 1440x900: Schlangenlichtung sichtbar ${gross.sichtH}px, ` +
      `Spielbrett-Bottom ${Math.round(gross.spielbrett.bottom)}px.`,
    )
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
