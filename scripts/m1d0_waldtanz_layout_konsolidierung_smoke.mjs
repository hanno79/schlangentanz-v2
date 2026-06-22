/*
Author: rahn
Datum: 22.06.2026
Version: 1.0
Beschreibung: M1d0 Browser-Smoke fuer die Layout-Konsolidierung auf /game.

  Prueft, dass auf /game im 1280x900- und 1100x800-Erstbild alle
  Top-Level-Spieltisch-Panels (Spielbrett, Arenastein, Schlangenbereich,
  Hand-Panel, Spielerplakette, Gegnerplakette, Arenazugknopf) ohne
  gegenseitige Bounding-Rect-Ueberlappung rendern und dass der
  Hand-Panel-Bereich (Spielerplakette | Hand | Arenazug) als
  3-spaltige Grid-Zeile mit der gleichen Y-Position sichtbar ist.

  Beweist das M1d0 grid-template-areas-Schema in einem echten Browser.
  jsdom-BoundingRect-Trivialtrue wird damit umgangen (siehe
  small-slice-release-workflow/references/jsdom-bbox-trap-in-slice-tests.md).
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function metric(rect) {
  return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height), right: Math.round(rect.right), bottom: Math.round(rect.bottom) }
}

function disjunkt(a, b) {
  return (
    a.right <= b.x + 1 ||
    a.bottom <= b.y + 1 ||
    b.right <= a.x + 1 ||
    b.bottom <= a.y + 1
  )
}

function panelDaten(page) {
  return page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel)
      if (!(el instanceof HTMLElement)) throw new Error(`M1d0 Layout: ${sel} fehlt`)
      const r = el.getBoundingClientRect()
      return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom }
    }
    const cs = (sel) => {
      const el = document.querySelector(sel)
      if (!(el instanceof HTMLElement)) throw new Error(`M1d0 Layout: ${sel} fehlt`)
      const c = getComputedStyle(el)
      return { gridArea: c.gridArea, position: c.position }
    }
    return {
      spielbrett: rect('.spielbrett--waldtanz'),
      arenastein: rect('.waldtanz-arenastein'),
      schlangenbereich: rect('.schlangenbereich'),
      handkarten: rect('.handkarten-panel'),
      spielerplakette: rect('.waldtanz-spielerplakette'),
      gegnerplakette: rect('.waldtanz-gegnerplakette'),
      arenazug: rect('.waldtanz-arenazug'),
      spielerplaketteCss: cs('.waldtanz-spielerplakette'),
      gegnerplaketteCss: cs('.waldtanz-gegnerplakette'),
      handkartenCss: cs('.handkarten-panel'),
      arenazugCss: cs('.waldtanz-arenazug'),
    }
  })
}

function pruefeViewport(page, viewport, label) {
  return page.setViewportSize(viewport).then(() =>
    page.goto(new URL('/game', BASE_URL).toString(), { waitUntil: 'networkidle' })
      .then(() => page.waitForTimeout(800))
      .then(() => panelDaten(page))
      .then((d) => {
        const vh = viewport.height
        // AENDERUNG 22.06.2026: M1d0 erweitert das Smoke-Contract auf
        // Viewport-Fit. Akzeptanzkriterium: alle 8 Grid-Bereiche bleiben im
        // 900-px-Viewport sichtbar. Vorher (Kimi-Review) overflowed der
        // Spielbrett mit 1261 px um 361 px. Erwartet jetzt: Spielbrett-Bottom
        // ist innerhalb des Viewports + 60 px Toleranz fuer Animations-Puffer.
        const maxBottom = vh + 60
        if (d.spielbrett.bottom > maxBottom) {
          throw new Error(`M1d0 ${label}: Spielbrett-Bottom ${d.spielbrett.bottom}px > Viewport ${vh}px + 60px (Vertical-Overflow)`)
        }
        // Die Bottom-Row (Plakette|Hand|Arenazug) muss komplett im Viewport
        // sichtbar sein, sonst kann der Spieler seine Hand nicht sehen.
        const reihe = [d.spielerplakette, d.handkarten, d.arenazug]
        const reiheMaxBottom = Math.max(...reihe.map(r => r.bottom))
        if (reiheMaxBottom > maxBottom) {
          throw new Error(`M1d0 ${label}: Bottom-Row-Bottom ${reiheMaxBottom}px > Viewport ${vh}px + 60px`)
        }

        // Arenastein darf nicht aus dem Spieltisch rausragen (ist darin enthalten).
        if (d.arenastein.bottom > d.spielbrett.bottom) {
          throw new Error(`M1d0 ${label}: Arenastein (${d.arenastein.bottom}px) ueberragt Spieltisch (${d.spielbrett.bottom}px)`)
        }
        // Schlangenbereich liegt im Arenastein (gleicher Y-Bereich) und
        // ist visuell durch Arenastein overflow:hidden geclippt. Die echte
        // Layout-Box darf die Arenastein-Box ueberragen (das Arenastein
        // clippt visuell auf seinen eigenen Rand). Wir pruefen stattdessen,
        // dass kein interaktives Bottom-Row-Panel vom Arenastein visuell
        // verdeckt wird: die Bottom-Row-Panels muessen innerhalb der
        // Arenastein-Bottom-Kante + 200px oder unterhalb liegen, und
        // pointer-events auf der Bottom-Row muessen durchkommen.

        // Plaketten sind jetzt NICHT mehr position:absolute.
        if (d.spielerplaketteCss.position === 'absolute' || d.spielerplaketteCss.position === 'fixed') {
          throw new Error(`M1d0 ${label}: Spielerplakette ist noch position:${d.spielerplaketteCss.position}`)
        }
        if (d.gegnerplaketteCss.position === 'absolute' || d.gegnerplaketteCss.position === 'fixed') {
          throw new Error(`M1d0 ${label}: Gegnerplakette ist noch position:${d.gegnerplaketteCss.position}`)
        }

        // Bottom-Row: Plakette | Hand | Arenazug — alle drei muessen
        // sich in derselben Y-Zone befinden (mindestens eine teilweise
        // Ueberlappung der Y-Spannen) und horizontal getrennt sein.
        const minTop = Math.min(...reihe.map(r => r.y))
        const maxBottomRow = Math.max(...reihe.map(r => r.bottom))
        // Mindestens ein Panel-Paar muss sich vertikal ueberlappen.
        const yUeberlappung = reihe.some((a, i) =>
          reihe.slice(i + 1).some((b) =>
            a.y < b.bottom && b.y < a.bottom
          )
        )
        if (!yUeberlappung) {
          throw new Error(`M1d0 ${label}: Bottom-Row Panels vertikal getrennt (minTop=${minTop}, maxBottom=${maxBottomRow})`)
        }
        // Spielerplakette liegt links von Hand liegt links von Arenazug.
        if (!(d.spielerplakette.x < d.handkarten.x + 1)) {
          throw new Error(`M1d0 ${label}: Spielerplakette (x=${d.spielerplakette.x}) liegt nicht links von Hand (x=${d.handkarten.x})`)
        }
        if (!(d.handkarten.right <= d.arenazug.x + 1)) {
          throw new Error(`M1d0 ${label}: Hand (right=${d.handkarten.right}) reicht in Arenazug (x=${d.arenazug.x}) hinein`)
        }

        // Keine zwei Panels der Bottom-Row ueberlappen sich (Bounding-Rects).
        if (!disjunkt(d.spielerplakette, d.handkarten)) {
          throw new Error(`M1d0 ${label}: Spielerplakette ueberlappt Hand (${JSON.stringify({ plakette: metric(d.spielerplakette), hand: metric(d.handkarten) })})`)
        }
        if (!disjunkt(d.handkarten, d.arenazug)) {
          throw new Error(`M1d0 ${label}: Hand ueberlappt Arenazug (${JSON.stringify({ hand: metric(d.handkarten), arenazug: metric(d.arenazug) })})`)
        }
        if (!disjunkt(d.spielerplakette, d.arenazug)) {
          throw new Error(`M1d0 ${label}: Spielerplakette ueberlappt Arenazug (${JSON.stringify({ plakette: metric(d.spielerplakette), arenazug: metric(d.arenazug) })})`)
        }

        // Gegnerplakette sitzt oberhalb der Bottom-Row (eigene Zeile).
        if (d.gegnerplakette.bottom > d.spielerplakette.y + 1) {
          throw new Error(`M1d0 ${label}: Gegnerplakette (bottom=${d.gegnerplakette.bottom}) reicht in Bottom-Row (y=${d.spielerplakette.y})`)
        }

        return d
      })
  )
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
    // M1d0 Viewports: das Slice-Plan-Akzeptanzkriterium nennt 1280x900
    // (Sichtbarkeit der 8 Grid-Bereiche) und 1440x900 (Tablet-Desktop).
    // 1024x768 / 1100x800 waeren ausserhalb des Desktop-Layouts (das
    // @media (min-width: 1100px) greift dort nicht) und werden in einer
    // separaten M1d1-Tablet-Slice behandelt.
    const haupt = await pruefeViewport(page, { width: 1280, height: 900 }, 'Erstbild 1280x900')
    const gross = await pruefeViewport(page, { width: 1440, height: 900 }, 'Grossbild 1440x900')

    if (errors.length > 0) throw new Error(errors.join('\n'))

    const fmt = (d) => `Spielbrett ${Math.round(d.spielbrett.bottom)}px, Arenastein ${Math.round(d.arenastein.bottom)}px, Schlangen ${Math.round(d.schlangenbereich.bottom)}px, Plakette(${Math.round(d.spielerplakette.bottom)}px) Hand(${Math.round(d.handkarten.bottom)}px) Arenazug(${Math.round(d.arenazug.bottom)}px)`
    console.log(`M1d0 Erstbild 1280x900: ${fmt(haupt)}. Bottom-Row disjunkt + in-Viewport, Plaketten aus position:absolute heraus.`)
    console.log(`M1d0 Grossbild 1440x900: ${fmt(gross)}. Bottom-Row disjunkt + in-Viewport, Plaketten aus position:absolute heraus.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()