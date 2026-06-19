import { chromium } from 'playwright'

const basisUrl = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const viewports = [
  { width: 1100, height: 900, label: 'enge Desktopkante' },
  { width: 1280, height: 900, label: 'Standardbrett' },
]
const browser = await chromium.launch({ headless: true })

async function pruefeHandsteg(viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
  const seite = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  seite.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  seite.on('pageerror', (error) => pageErrors.push(error.message))

  try {
    await seite.addInitScript(() => { Math.random = () => 0.999999 })
    const response = await seite.goto(`${basisUrl}/game`, { waitUntil: 'networkidle' })
    if (!response || response.status() !== 200) throw new Error(`M1cc Handsteg: /game HTTP ${response?.status()} (${viewport.label})`)
    await seite.getByRole('region', { name: 'Spieltisch' }).waitFor()

    const ergebnis = await seite.evaluate(() => {
      const handsteg = document.querySelector('.handkarten-buehne__handsteg')
      const waldtaschen = document.querySelector('.waldtanz-waldtaschen')
      const handkarte = document.querySelector('.handkartenleiste--spielkartenfaecher .handkarte__button--karte')
      if (!(handsteg instanceof HTMLElement)) throw new Error('M1cc Handsteg: Handsteg fehlt')
      if (!(waldtaschen instanceof HTMLElement)) throw new Error('M1cc Handsteg: Waldtaschen fehlen')
      if (!(handkarte instanceof HTMLElement)) throw new Error('M1cc Handsteg: Handkarte fehlt')
      const handstegStil = getComputedStyle(handsteg)
      const handstegBox = handsteg.getBoundingClientRect()
      const waldtaschenBox = waldtaschen.getBoundingClientRect()
      const handkarteBox = handkarte.getBoundingClientRect()
      const pruefpunkt = {
        x: handkarteBox.x + handkarteBox.width / 2,
        y: handkarteBox.y + handkarteBox.height / 2,
      }
      const hit = document.elementFromPoint(pruefpunkt.x, pruefpunkt.y)
      return {
        handsteg: handstegBox.toJSON(),
        waldtaschen: waldtaschenBox.toJSON(),
        handkarte: handkarteBox.toJSON(),
        pruefpunkt,
        border: handstegStil.borderTopWidth,
        shadow: handstegStil.boxShadow,
        background: handstegStil.backgroundImage,
        pointerEvents: handstegStil.pointerEvents,
        hitClass: hit?.closest('button')?.className ?? hit?.className ?? '',
      }
    })

    if (ergebnis.border !== '3px' || !ergebnis.shadow.includes('rgb(6, 57, 7)') || !ergebnis.background.includes('gradient')) {
      throw new Error(`M1cc Handsteg: Computed Style gebrochen ${JSON.stringify({ viewport, border: ergebnis.border, shadow: ergebnis.shadow, background: ergebnis.background })}`)
    }
    if (ergebnis.pointerEvents !== 'none') {
      throw new Error(`M1cc Handsteg: dekorativer Steg darf keine Klicks abfangen (${ergebnis.pointerEvents}, ${viewport.label})`)
    }
    if (ergebnis.handsteg.right > ergebnis.waldtaschen.x - 8) {
      throw new Error(`M1cc Handsteg: Steg ragt in die Waldtaschen ${JSON.stringify({ viewport, handsteg: ergebnis.handsteg, waldtaschen: ergebnis.waldtaschen })}`)
    }
    if (!String(ergebnis.hitClass).includes('handkarte__button--karte')) {
      throw new Error(`M1cc Handsteg: Handkarte am Mittelpunkt nicht klickbar ${JSON.stringify({ viewport, pruefpunkt: ergebnis.pruefpunkt, hitClass: ergebnis.hitClass })}`)
    }
    if (consoleErrors.length || pageErrors.length) throw new Error(`M1cc Handsteg: Browserfehler ${JSON.stringify({ viewport, consoleErrors, pageErrors })}`)
    console.log(`M1cc Handsteg ${viewport.width}px: Steg endet ${Math.round(ergebnis.waldtaschen.x - ergebnis.handsteg.right)}px vor Waldtaschen, Handkarte klickbar.`)
  } finally {
    await context.close()
  }
}

try {
  for (const viewport of viewports) {
    await pruefeHandsteg(viewport)
  }
} finally {
  await browser.close()
}
