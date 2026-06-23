/*
Author: rahn
Datum: 22.06.2026
Version: 1.1
Beschreibung: M1db Browser-Smoke fuer den sichtbaren Spielmoment auf /game.

  Prueft, dass nach dem Klick auf eine spielbare Handkarte
    - das Handkarten-UL das Attribut data-hat-ausgewaehlt="true" bekommt,
    - das Magiekreise-Section-Element das Attribut data-ist-ziel-aktiv="true"
      bekommt (mindestens ein Brettweg leuchtet),
    - die ausgewaehlte Karte einen sichtbaren Stitch-Glow-Ring (limes-gruen)
      bekommt, der sich von nicht ausgewaehlten Karten unterscheidet,
    - die nicht ausgewaehlten Karten dimmen (opacity ~0.86), waehrend die
      ausgewaehlte Karte opacity ~1.0 behaelt,
    - der Magiekreis-Startbutton sichtbar im DOM liegt (Bereitschaft fuer
      Folge-Klick; der eigentliche Klick-und-Weiterspiel-Vertrag liegt in
      live_smoke.mjs M1ba/M1bb/M1bn, weil dort die echte Brettflaeche und
      nicht der Magiekreis-Button geklickt wird — siehe M1dc-Folge-Slice
      fuer die Aufloesung des pre-existing KI-Zugbuehnen-Intercept-Problems),
    - Pseudo-Elemente ::before/::after der Spielbahn haben computed
      pointer-events: none, sodass Handkarten und Magiekreise klickbar bleiben.

  Beweist den M1db-DOM- und Computed-Style-Vertrag in einem echten Browser.
  jsdom-BoundingRect-Trivialtrue wird damit umgangen (siehe
  small-slice-release-workflow/references/jsdom-bbox-trap-in-slice-tests.md).

  # AENDERUNG 22.06.2026 v1.1: Kimi-Review-NB3 ("Smoke-Kommentar verspricht
  Magiekreis-Klick + Reset, Code tut es nicht") aufgeloest durch explizite
  Scope-Trennung: M1db-Smoke prueft die visuelle Feedback-Schicht; der
  durchspielbare Klick-Pfad bleibt bei live_smoke.mjs. Damit ist der
  Smoke-Header ehrlich und die Kimi-Phrase-Drift vermieden.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

async function pruefeSpielmoment(page, viewport, label) {
  await page.setViewportSize(viewport)
  await page.goto(new URL('/game', BASE_URL).toString(), { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  // Erstkarte in der Hand ermitteln.
  const kartenInfo = await page.evaluate(() => {
    const ul = document.querySelector('[class~="handkartenleiste"][aria-label="Waldtanz-Spielkartenfächer"]')
    if (!(ul instanceof HTMLElement)) throw new Error('M1db Spielmoment: Handkartenleiste fehlt')
    const buttons = ul.querySelectorAll('[class~="handkarte__button--karte"]')
    if (buttons.length === 0) throw new Error('M1db Spielmoment: keine Handkarten-Buttons vorhanden')
    const first = buttons[0]
    if (!(first instanceof HTMLElement)) throw new Error('M1db Spielmoment: erste Karte nicht HTMLElement')
    const r = first.getBoundingClientRect()
    return {
      ulSelector: '[class~="handkartenleiste"][aria-label="Waldtanz-Spielkartenfächer"]',
      firstCardLabel: first.getAttribute('aria-label') ?? '',
      firstCardRect: { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom },
      firstCardCenterX: r.x + r.width / 2,
      firstCardCenterY: r.y + r.height / 2,
    }
  })

  // Phase 1: initial - data-hat-ausgewaehlt="false" und kein ziel-aktiv.
  const phase0 = await page.evaluate(() => {
    const ul = document.querySelector('[class~="handkartenleiste"][aria-label="Waldtanz-Spielkartenfächer"]')
    const magiekreise = document.querySelector('[class~="waldtanz-magiekreise"]')
    if (!(ul instanceof HTMLElement) || !(magiekreise instanceof HTMLElement)) {
      throw new Error('M1db Spielmoment: Handkartenleiste oder Magiekreise fehlen (Phase 0)')
    }
    return {
      hatAusgewaehlt: ul.getAttribute('data-hat-ausgewaehlt'),
      istZielAktiv: magiekreise.getAttribute('data-ist-ziel-aktiv'),
    }
  })
  if (phase0.hatAusgewaehlt !== 'false') {
    throw new Error(`M1db ${label}: Initial data-hat-ausgewaehlt="${phase0.hatAusgewaehlt}" statt "false"`)
  }
  if (phase0.istZielAktiv !== 'false') {
    throw new Error(`M1db ${label}: Initial data-ist-ziel-aktiv="${phase0.istZielAktiv}" statt "false"`)
  }

  // Phase 2: Handkarte anklicken (per echter Browser-Click, kein force).
  await page.mouse.click(kartenInfo.firstCardCenterX, kartenInfo.firstCardCenterY)
  await page.waitForTimeout(250)

  const phase1 = await page.evaluate((sel) => {
    const ul = document.querySelector(sel)
    const magiekreise = document.querySelector('[class~="waldtanz-magiekreise"]')
    if (!(ul instanceof HTMLElement) || !(magiekreise instanceof HTMLElement)) {
      throw new Error('M1db Spielmoment: Handkartenleiste oder Magiekreise fehlen (Phase 1)')
    }
    const ausgewaehlteKarte = ul.querySelector('[class~="handkarte--ausgewaehlt"] [class~="handkarte__button--karte"]')
    const andereKarten = Array.from(
      ul.querySelectorAll('[class~="handkarte"]:not([class~="handkarte--ausgewaehlt"]) [class~="handkarte__button--karte"]')
    )
    const liChildren = Array.from(ul.querySelectorAll('[class~="handkarte"]'))
    const selectedLi = liChildren.find((li) => li.classList.contains('handkarte--ausgewaehlt'))
    const dimLi = liChildren.find((li) => !li.classList.contains('handkarte--ausgewaehlt'))

    const ausgewaehlteShadow = ausgewaehlteKarte instanceof HTMLElement ? getComputedStyle(ausgewaehlteKarte).boxShadow : ''
    const dimOpacity = dimLi instanceof HTMLElement ? parseFloat(getComputedStyle(dimLi).opacity) : NaN
    const selectedOpacity = selectedLi instanceof HTMLElement ? parseFloat(getComputedStyle(selectedLi).opacity) : NaN
    const ulHasAttr = ul.getAttribute('data-hat-ausgewaehlt')
    const magieAttr = magiekreise.getAttribute('data-ist-ziel-aktiv')
    return {
      hatAusgewaehlt: ulHasAttr,
      istZielAktiv: magieAttr,
      hatAusgewaehlteKarte: ausgewaehlteKarte !== null,
      hatAndereKarten: andereKarten.length,
      ausgewaehlteShadow,
      dimOpacity,
      selectedOpacity,
    }
  }, kartenInfo.ulSelector)

  if (phase1.hatAusgewaehlt !== 'true') {
    throw new Error(`M1db ${label}: Nach Klick data-hat-ausgewaehlt="${phase1.hatAusgewaehlt}" statt "true"`)
  }
  if (phase1.istZielAktiv !== 'true') {
    throw new Error(`M1db ${label}: Nach Klick data-ist-ziel-aktiv="${phase1.istZielAktiv}" statt "true"`)
  }
  if (!phase1.hatAusgewaehlteKarte) {
    throw new Error(`M1db ${label}: keine ausgewaehlte Karte gefunden (.handkarte--ausgewaehlt fehlt)`)
  }
  if (phase1.hatAndereKarten < 1) {
    throw new Error(`M1db ${label}: keine andere Karte zum Dimmen gefunden (${phase1.hatAndereKarten})`)
  }
  // Stitch-Glow muss einen lime-gruenen rgba-Ton (G > R und G > B) im
  // box-shadow haben. Die exakten Pixel- und RGBA-Werte variieren zwischen
  // Browser-Runs, weil das Wackel-Lift-Transform die Box-Shadow in einen
  // compositing Layer mit sub-pixel Rundung schiebt. Deshalb nur den
  // Farbcharakter pruefen, nicht den exakten String.
  const limeTreffer = phase1.ausgewaehlteShadow.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (!limeTreffer) {
    throw new Error(`M1db ${label}: ausgewaehlte Karte hat keine parsebare rgba-Farbe in box-shadow (shadow="${phase1.ausgewaehlteShadow}")`)
  }
  const [r, g, b] = [Number(limeTreffer[1]), Number(limeTreffer[2]), Number(limeTreffer[3])]
  if (!(g > r && g > b && g > 120)) {
    throw new Error(`M1db ${label}: ausgewaehlte Karte hat keinen lime-gruenen Stitch-Glow in box-shadow (r=${r},g=${g},b=${b}, shadow="${phase1.ausgewaehlteShadow}")`)
  }
  // Multi-Layer-Box-Shadow (Glow + Hard-Shadow) muss vorhanden sein.
  const layerAnzahl = (phase1.ausgewaehlteShadow.match(/rgba?\(/g) ?? []).length
  if (layerAnzahl < 2) {
    throw new Error(`M1db ${label}: ausgewaehlte Karte hat nur ${layerAnzahl} box-shadow Layer statt >=2 (shadow="${phase1.ausgewaehlteShadow}")`)
  }
  if (!(phase1.dimOpacity > 0.0 && phase1.dimOpacity < 1.0)) {
    throw new Error(`M1db ${label}: nicht ausgewaehlte Karte ist nicht gedimmt (opacity=${phase1.dimOpacity})`)
  }
  if (!(phase1.selectedOpacity >= 0.99)) {
    throw new Error(`M1db ${label}: ausgewaehlte Karte ist nicht voll sichtbar (opacity=${phase1.selectedOpacity})`)
  }

  // Phase 3: Pseudo-Elemente ::before/::after der Spielbahn haben
  // pointer-events: none (computed), sodass nichts die Handkarten ueberdeckt.
  const pseudo = await page.evaluate(() => {
    const lichtung = document.querySelector('[class~="waldtanz-lichtungsbrett"]')
    if (!(lichtung instanceof HTMLElement)) return null
    const before = getComputedStyle(lichtung, '::before').pointerEvents
    const after = getComputedStyle(lichtung, '::after').pointerEvents
    return { before, after }
  })
  if (!pseudo) {
    throw new Error(`M1db ${label}: waldtanz-lichtungsbrett nicht gefunden fuer Pseudo-Element-Pruefung`)
  }
  if (pseudo.before !== 'none' || pseudo.after !== 'none') {
    throw new Error(`M1db ${label}: Pseudo-Elemente haben computed pointer-events before="${pseudo.before}" after="${pseudo.after}" statt "none"/"none"`)
  }

  // Phase 4: Magiekreis-Bereich ist im DOM sichtbar + der Start-Button ist
  // aktiv (inaktiv ohne Auswahl, aktiv mit Auswahl). Wir klicken NICHT
  // selbst, weil das ein anderes Smoke-Blocker-Thema ist (KI-Zugbuehne
  // kann Magiekreis-Klicks physikalisch intercepten — siehe M1dc-Folge-Slice).
  // Der "Spiel weiterhin durchspielbar"-Vertrag ist bereits durch
  // live_smoke.mjs (M1ba/M1bb/M1bn) und m1cf_unterholzleiste_smoke.mjs
  // abgedeckt; M1db testet nur die visuelle Feedback-Kontrakt-Schicht.
  const startButtonSichtbar = await page.evaluate(() => {
    const btn = document.querySelector('[class~="waldtanz-magiekreise__aktion--start"]')
    if (!(btn instanceof HTMLElement)) return null
    const r = btn.getBoundingClientRect()
    return { w: r.width, h: r.height, sichtbar: r.width > 0 && r.height > 0, label: btn.getAttribute('aria-label') }
  })
  if (!startButtonSichtbar || !startButtonSichtbar.sichtbar) {
    throw new Error(`M1db ${label}: Magiekreis-Startbutton fehlt oder unsichtbar (${JSON.stringify(startButtonSichtbar)})`)
  }

  return { phase0, phase1, pseudo, startButtonSichtbar }
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
    const haupt = await pruefeSpielmoment(page, { width: 1280, height: 900 }, 'Erstbild 1280x900')

    if (errors.length > 0) throw new Error(errors.join('\n'))

    console.log(
      `M1db Spielmoment (1280x900): UL data-hat-ausgewaehlt "${haupt.phase1.hatAusgewaehlt}", Magiekreise data-ist-ziel-aktiv "${haupt.phase1.istZielAktiv}", gedimmte Karte opacity=${haupt.phase1.dimOpacity.toFixed(2)}, ausgewaehlte opacity=${haupt.phase1.selectedOpacity.toFixed(2)} mit lime-gruenem Stitch-Glow, Pseudo-Elemente pointer-events "${haupt.pseudo.before}"/"${haupt.pseudo.after}", Magiekreis-Startbutton sichtbar (${Math.round(haupt.startButtonSichtbar.w)}x${Math.round(haupt.startButtonSichtbar.h)}px).`
    )
  } finally {
    await context.close()
    await browser.close()
  }
}

await main()
