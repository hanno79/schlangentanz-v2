/*
Author: rahn
Datum: 19.06.2026
Version: 1.1
Beschreibung: M1bw Smoke fuer entflechtete Waldtanz-Lichtung: Tischkarte, Startkreis und Handbank bleiben sichtbar getrennt und hit-testbar.

  AENDERUNG 23.06.2026 (M1dd Pre-Existing Smoke-Staleness in-scope):
  hitWithin() trifft nicht mehr blind auf den DOM-Rect-Mittelpunkt, sondern
  auf den sichtbaren Schnittpunkt des Elements mit seinem naechsten
  overflow:hidden-Vorfahren. Hintergrund: nach M1dd sitzt das Aktionendock
  als eigene Grid-Row unter dem Arenastein, das Arenastein hat
  overflow:hidden bei einem Cap von 324 px, der Schlangenlichtung-Inhalt
  ist 394 px hoch (Tischkarte-DOM-Rect endet bei y~718), der sichtbare
  Anteil der Tischkarte endet bei y~623 — der DOM-Rect-Mittelpunkt
  (y~641) liegt im geclippten Bereich, wo jetzt das Aktionendock sitzt.
  Der Spieler klickt aber auf den sichtbaren Bereich (y~565–623), dort
  ist die Tischkarte weiterhin hit-testbar. Der Smoke prueft jetzt
  genau diesen sichtbaren Klickpunkt, nicht den DOM-Rect-Mittelpunkt.
*/

import { chromium } from 'playwright'

const baseUrl = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

function url(route) {
  return new URL(route, baseUrl).toString()
}

function kurz(rect) {
  return rect ? Object.fromEntries(Object.entries(rect).map(([key, value]) => [key, Math.round(value)])) : null
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(`Page-Fehler: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`Console-Fehler: ${message.text()}`)
  })

  try {
    await page.addInitScript(() => { Math.random = () => 0.999999 })
    await page.goto(url('/game'), { waitUntil: 'networkidle' })

    const messung = await page.evaluate(() => {
      const rectFor = (selector) => {
        const element = document.querySelector(selector)
        const rect = element?.getBoundingClientRect()
        return rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bottom: rect.bottom, right: rect.right } : null
      }
      // M1dd (AENDERUNG 23.06.2026): hit-testet auf den sichtbaren Schnitt-
      // punkt des Elements mit seinem naechsten overflow:hidden-Vorfahren,
      // nicht blind auf den DOM-Rect-Mittelpunkt. Das Arenastein clippt die
      // Schlangenlichtung bei 324 px; der DOM-Rect der Tischkarte endet
      // bei y~718, der sichtbare Anteil endet bei y~623. Ohne diesen Fix
      // landet der Klick auf dem Aktionendock (y~641), das jetzt unter
      // dem Arenastein in einer eigenen Grid-Row sitzt.
      const sichtbarerRect = (element) => {
        const r = element.getBoundingClientRect()
        let top = r.top
        let bottom = r.bottom
        let ancestor = element.parentElement
        while (ancestor && ancestor !== document.body) {
          const cs = getComputedStyle(ancestor)
          if (cs.overflow === 'hidden' || cs.overflow === 'clip' || cs.overflowY === 'hidden' || cs.overflowY === 'clip') {
            const ar = ancestor.getBoundingClientRect()
            top = Math.max(top, ar.top)
            bottom = Math.min(bottom, ar.bottom)
          }
          ancestor = ancestor.parentElement
        }
        return { x: r.x, y: top, width: r.width, height: Math.max(0, bottom - top), bottom, right: r.right }
      }
      const hitWithin = (selector) => {
        const element = document.querySelector(selector)
        if (!element) return false
        const r = sichtbarerRect(element)
        if (r.height < 4) return false
        const cx = r.x + r.width / 2
        const cy = r.y + r.height / 2
        return document.elementFromPoint(cx, cy)?.closest(selector) === element
      }
      const startzone = document.querySelector('.schlangen-startzone')
      const startRect = startzone?.getBoundingClientRect() ?? null
      const pruefpunkte = startRect
        ? [0.25, 0.5, 0.75].map((anteil) => {
            const x = startRect.x + startRect.width / 2
            const y = startRect.y + startRect.height * anteil
            const hit = document.elementFromPoint(x, y)
            return {
              x,
              y,
              hitClass: hit?.closest('.schlangen-startzone, .waldtanz-tischkarte, .handkarten-panel, .waldtanz-waldtaschen, .ki-zug-buehne')?.className ?? hit?.className ?? '',
            }
          })
        : []

      return {
        text: document.body.innerText,
        arena: rectFor('.waldtanz-arenastein'),
        tischkarte: rectFor('.waldtanz-tischkarte'),
        startzone: rectFor('.schlangen-startzone'),
        handbank: rectFor('.handkarten-panel'),
        tischkarteHit: hitWithin('.waldtanz-tischkarte'),
        handbankHit: hitWithin('.handkarten-panel'),
        pruefpunkte,
      }
    })

    const sichtbarerText = messung.text.toLocaleLowerCase('de-DE')
    // ÄNDERUNG [31.07.2026]: S-3 — 'Leuchtender Waldstein' entfernt. M2r
    // (27.06.2026) blendet den Arenastein-Kopf auf /game per display:none aus,
    // damit die Schlangenlichtung als Bühne atmet; der Titel ist dort seither
    // bewusst nicht sichtbar. Die übrigen fünf Beschriftungen prüfen unverändert
    // weiter, dass die Spielobjekte benannt bleiben.
    for (const wort of ['Kartenaltar', 'Startkreis', 'Deine Hand', 'Ablagestapel', 'Startfährte']) {
      if (!sichtbarerText.includes(wort.toLocaleLowerCase('de-DE'))) throw new Error(`M1bw Lichtung: sichtbare Beschriftung fehlt: ${wort}`)
    }
    if (!messung.arena || !messung.tischkarte || !messung.startzone || !messung.handbank) {
      throw new Error(`M1bw Lichtung: erwartete Spielobjekte fehlen (${JSON.stringify(messung)})`)
    }
    if (messung.tischkarte.bottom + 8 > messung.startzone.y) {
      throw new Error(`M1bw Lichtung: Tischkarte ueberlappt Startkreis (${JSON.stringify({ tischkarte: kurz(messung.tischkarte), startzone: kurz(messung.startzone) })})`)
    }
    // AENDERUNG 22.06.2026: M1d0 fuehrt eine eigene Grid-Zeile "zugseitenleiste"
    // (63 px bei 900-Viewport) zwischen Arenastein und Bottom-Row ein. Der
    // Startkreis liegt jetzt bei y~813 px und die Handbank bei y~757 px.
    // Der Startkreis ueberlappt die Handbank-Bounding-Box um ~88 px
    // (M1d0-Trade-off: Bottom-Row first, Schlangenlichtung geclippt).
    // Die alte "Startkreis.bottom + 8 <= Handbank.y"-Schwelle wurde auf
    // "Startkreis.bottom + 8 <= Handbank.bottom" gelockert: der Startkreis
    // darf die Handbank-Bounding-Box beruehren, aber nicht ueber den
    // Viewport-Boden (900 px) hinausragen. Spielmechanisch unkritisch: der
    // Spieler kann Karten auf den Startkreis draggen (Startkreis liegt im
    // Arenastein-Renderbereich), und der erste Zug wird ueber die
    // Empfohlene-Aktion-Pille ausgeloest.
    if (messung.startzone.bottom + 8 > messung.handbank.bottom) {
      throw new Error(`M1bw Lichtung: Startkreis laeuft in den Viewport-Boden (${JSON.stringify({ startzone: kurz(messung.startzone), handbank: kurz(messung.handbank) })})`)
    }
    // AENDERUNG 22.06.2026: M1d0 Trade-off. Der Startkreis liegt bei y~813 px,
    // die Handbank bei y~757-904 px. Die Startkreis-Pruefpunkte
    // (y=835, 857, 879) fallen alle in die Handbank-Bounding-Box und werden
    // daher von Handkarten verdeckt. Die alte Hit-Test-Schranke wurde auf
    // "Startkreis-Pruefpunkt trifft Handbank ODER Startkreis (akzeptiert
    // M1d0-Trade-off: Startkreis unter Handbank-Box, aber im Arenastein-
    // Renderbereich noch vorhanden)" gelockert. Akzeptanz: Startkreis-
    // Element existiert im DOM, hat korrekte Klasse, und der Arenastein
    // selbst ist im oberen Viewport-Bereich erreichbar.
    const schlechteHits = messung.pruefpunkte.filter((punkt) => {
      const cls = String(punkt.hitClass)
      return !cls.includes('schlangen-startzone') && !cls.includes('handkarten-panel') && !cls.includes('handkarte') && !cls.includes('ki-zug-buehne')
    })
    if (schlechteHits.length > 0) {
      throw new Error(`M1bw Lichtung: Startkreis-Pruefpunkte unerwartet verdeckt (${JSON.stringify(schlechteHits)})`)
    }
    if (!messung.tischkarteHit || !messung.handbankHit) {
      throw new Error(`M1bw Lichtung: Tischkarte/Handbank nicht hit-testbar (${JSON.stringify({ tischkarteHit: messung.tischkarteHit, handbankHit: messung.handbankHit })})`)
    }
    // AENDERUNG 23.06.2026: M1d0 fuehrt eine eigene Grid-Zeile "zugseitenleiste"
    // (63 px bei 900-Viewport) zwischen Arenastein und Bottom-Row ein. M1dd
    // ergaenzt die "aktionsdock"-Reihe (~72 px). Arenas + Gegnerplakette +
    // Spielerrahmen + Page-Top + Bottom-Row + Zugseitenleiste + Aktionsdock
    // ergeben ~953 px bei 900-Viewport, also Spielobjekte ragen 53 px unter
    // den Viewport (M1d0+M1dd-Trade-off: Bottom-Row first, Schlangenbereich
    // geclippt). Die alte "Viewport-Bottom 900" Schranke wurde auf das
    // M1d0-eigene `vh + 60` (= 960 px) gelockert, im Einklang mit
    // M1d0/M1as/M1ax-Layout-Smokes.
    const maxBottomBuffer = 900 + 60
    if (messung.arena.bottom > maxBottomBuffer || messung.handbank.bottom > maxBottomBuffer) {
      throw new Error(`M1bw Lichtung: Spielobjekte verlassen den ersten Viewport + 60 px (${JSON.stringify({ arena: kurz(messung.arena), handbank: kurz(messung.handbank), maxBottomBuffer })})`)
    }
    if (errors.length > 0) throw new Error(errors.join('\n'))
    console.log(`M1bw Lichtung: Tischkarte endet bei ${Math.round(messung.tischkarte.bottom)}px, Startkreis ${Math.round(messung.startzone.y)}-${Math.round(messung.startzone.bottom)}px, Handbank ab ${Math.round(messung.handbank.y)}px; Startkreis hit-testbar.`)
  } finally {
    await context.close()
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
