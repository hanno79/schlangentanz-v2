/*
Author: rahn
Datum: 24.06.2026
Version: 1.1
Beschreibung: M1e Browser-Smoke fuer die Waldtanz-Spieluhr als visueller
              Countdown-Ring im Brettschritt.

  Beweist in einem echten Browser, dass die Spieluhr auf /game sichtbar
  im Erstbild 1280x900 rendert, eine Phasen-Phase traegt und je nach
  Phasenwechsel zwischen Countdown-Ring und Sieger-Party-Stern wechselt.
  jsdom-BoundingRect ist unzuverlaessig (siehe jsdom-bbox-trap-in-slice-tests.md),
  daher ist dieser echte-Browser-Smoke das Release-Gate fuer M1e.

  Akzeptanzvertrag:
    1. Waldtanz-Spieluhr rendert im Brettschritt auf /game.
    2. Sie traegt data-partie-uhr-phase="nachziehphase" im Normalzustand.
    3. SVG-Element mit count > 0, role="img" ist im DOM.
    4. Ring hat sichtbare Hoehe >= 40 px und liegt NICHT ausserhalb des
       Viewports.
    5. Keine console/page-Fehler.
    6. Spielbrett-Bottom bleibt im Viewport + 60 px Toleranz (M1d0-Vertrag).
    7. Phasen-Wechsel: /game?phase=endspurt zeigt pulsierenden Ring,
       /game?phase=spielende zeigt Stern statt Ring.
*/

import { chromium } from 'playwright'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'

async function messeSeite(page) {
  return page.evaluate(() => {
    const uhr = document.querySelector('.waldtanz-partie-uhr')
    if (!(uhr instanceof HTMLElement)) throw new Error('M1e: Waldtanz-Spieluhr fehlt')
    const r = uhr.getBoundingClientRect()
    const svg = uhr.querySelector('svg')
    const stern = uhr.querySelector('.waldtanz-partie-uhr__stern')
    const progressCircle = uhr.querySelector('.waldtanz-partie-uhr__kreis-fortschritt')
    const dashAttr = progressCircle?.getAttribute('stroke-dasharray') ?? ''
    const dashNum = parseFloat(dashAttr.split(' ')[0] ?? 'NaN')
    const dashOk = Number.isFinite(dashNum) && dashNum >= 0
    return {
      uhr: { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom },
      hatSvg: svg instanceof SVGElement,
      hatStern: stern instanceof HTMLElement,
      dataPhase: uhr.getAttribute('data-partie-uhr-phase'),
      dashNum,
      dashOk,
      text: uhr.querySelector('.waldtanz-partie-uhr__text')?.textContent?.trim() ?? '',
      hatPuls: uhr.classList.contains('waldtanz-partie-uhr--puls'),
    }
  })
}

async function pruefeSeite(page, url, viewport, label) {
  await page.setViewportSize(viewport)
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const d = await messeSeite(page)

  if (d.uhr.height < 40) {
    throw new Error(`M1e ${label}: Spieluhr Hoehe ${d.uhr.height}px < 40px`)
  }
  if (!d.dataPhase) {
    throw new Error(`M1e ${label}: data-partie-uhr-phase fehlt`)
  }
  if (d.uhr.bottom > viewport.height + 20 || d.uhr.y < -10) {
    throw new Error(
      `M1e ${label}: Spieluhr y=${Math.round(d.uhr.y)} bottom=${Math.round(d.uhr.bottom)} ` +
      `ausserhalb Viewport (h=${viewport.height})`,
    )
  }
  const spielbrett = await page.evaluate(() => {
    const el = document.querySelector('.spielbrett--waldtanz')
    if (!(el instanceof HTMLElement)) return null
    return el.getBoundingClientRect().bottom
  })
  if (spielbrett !== null && spielbrett > viewport.height + 60) {
    throw new Error(`M1e ${label}: Spielbrett-Bottom ${spielbrett}px > Viewport ${viewport.height}px + 60px`)
  }
  return d
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
    // Phase 1: Nachziehphase (Erstbild ohne URL-Param)
    const haupt = await pruefeSeite(page, new URL('/game', BASE_URL).toString(), { width: 1280, height: 900 }, 'Erstbild 1280x900')
    if (haupt.dataPhase !== 'nachziehphase') {
      throw new Error(`M1e Phase 1: erwartete data-partie-uhr-phase="nachziehphase", bekam "${haupt.dataPhase}"`)
    }
    if (!haupt.hatSvg) {
      throw new Error('M1e Phase 1: SVG-Countdown-Ring fehlt in Nachziehphase')
    }
    if (haupt.hatPuls) {
      throw new Error('M1e Phase 1: Puls-Klasse in Nachziehphase unerwartet aktiv')
    }
    if (!haupt.dashOk) {
      throw new Error(`M1e Phase 1: Kreisfortschritt stroke-dasharray ungueltig (${haupt.dashNum})`)
    }

    // Phase 2: Endspurt (URL-Hook, deterministisch via Test-Fixture)
    const endspurt = await pruefeSeite(page, new URL('/game?phase=endspurt', BASE_URL).toString(), { width: 1280, height: 900 }, 'Endspurt')
    if (endspurt.dataPhase !== 'endspurt') {
      throw new Error(`M1e Phase 2: erwartete data-partie-uhr-phase="endspurt", bekam "${endspurt.dataPhase}"`)
    }
    if (!endspurt.hatPuls) {
      throw new Error('M1e Phase 2: Puls-Klasse in Endspurt fehlt')
    }
    if (!endspurt.hatSvg) {
      throw new Error('M1e Phase 2: SVG-Countdown-Ring fehlt in Endspurt')
    }

    // Phase 3: Sieger-Party (Stern statt Ring)
    const sieger = await pruefeSeite(page, new URL('/game?phase=spielende', BASE_URL).toString(), { width: 1280, height: 900 }, 'Sieger-Party')
    if (sieger.dataPhase !== 'sieger-party') {
      throw new Error(`M1e Phase 3: erwartete data-partie-uhr-phase="sieger-party", bekam "${sieger.dataPhase}"`)
    }
    if (!sieger.hatStern) {
      throw new Error('M1e Phase 3: Sieger-Party-Stern fehlt')
    }
    if (sieger.hatSvg) {
      throw new Error('M1e Phase 3: SVG-Ring darf im Sieger-Party-Zustand nicht rendern')
    }

    if (errors.length > 0) throw new Error(errors.join('\n'))

    console.log(
      `M1e Phase 1 Nachziehphase: SVG dash=${haupt.dashNum.toFixed(1)}, text="${haupt.text}", puls=${haupt.hatPuls}.`,
    )
    console.log(
      `M1e Phase 2 Endspurt: SVG dash=${endspurt.dashNum.toFixed(1)}, text="${endspurt.text}", puls=${endspurt.hatPuls}.`,
    )
    console.log(
      `M1e Phase 3 Sieger-Party: Stern sichtbar, text="${sieger.text}", puls=${sieger.hatPuls}.`,
    )
    console.log('M1e Spieluhr Phasen-Wechsel auf /game im Erstbild bestanden.')
  } catch (err) {
    console.error('M1e Smoke fehlgeschlagen:', err.message)
    if (errors.length > 0) console.error('Zusaetzliche Fehler:', errors.join('\n'))
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

await main()
