import { chromium } from 'playwright'

const basisUrl = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const browser = await chromium.launch({ headless: true })
const viewports = [
  { width: 900, height: 900, label: 'Tabletbrett' },
  { width: 1280, height: 900, label: 'Standardbrett' },
]

async function pruefeStartgarten(viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
  const seite = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  seite.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  seite.on('pageerror', (error) => pageErrors.push(error.message))

  try {
    await seite.addInitScript(() => { Math.random = () => 0.999999 })
    const response = await seite.goto(`${basisUrl}/game`, { waitUntil: 'networkidle' })
    if (!response || response.status() !== 200) throw new Error(`M1cd Startgarten: /game HTTP ${response?.status()}`)
    await seite.getByRole('region', { name: 'Spieltisch' }).waitFor()

    const ergebnis = await seite.evaluate(() => {
      const startgarten = document.querySelector('.schlangen-startgarten')
      const startzone = document.querySelector('.schlangen-startzone')
      const handkarte = document.querySelector('.handkartenleiste--spielkartenfaecher .handkarte__button--karte')
      if (!(startgarten instanceof HTMLElement)) throw new Error('M1cd Startgarten: Startgarten fehlt')
      if (!(startzone instanceof HTMLElement)) throw new Error('M1cd Startgarten: Startzone fehlt')
      if (!(handkarte instanceof HTMLElement)) throw new Error('M1cd Startgarten: Handkarte fehlt')

      startzone.scrollIntoView({ block: 'center', inline: 'center' })
      const gartenBox = startgarten.getBoundingClientRect()
      const zoneBox = startzone.getBoundingClientRect()
      const gartenStil = getComputedStyle(startgarten)
      const zonePunkt = { x: zoneBox.x + zoneBox.width / 2, y: zoneBox.y + zoneBox.height / 2 }
      const zoneHit = document.elementFromPoint(zonePunkt.x, zonePunkt.y)
      handkarte.scrollIntoView({ block: 'center', inline: 'center' })
      const handBox = handkarte.getBoundingClientRect()
      const handPunkt = { x: handBox.x + handBox.width / 2, y: handBox.y + handBox.height / 2 }
      const handHit = document.elementFromPoint(handPunkt.x, handPunkt.y)

      return {
        text: startgarten.textContent?.replace(/\s+/g, ' ').trim(),
        garten: gartenBox.toJSON(),
        zone: zoneBox.toJSON(),
        hand: handBox.toJSON(),
        border: gartenStil.borderTopWidth,
        shadow: gartenStil.boxShadow,
        zoneHitClass: zoneHit?.closest('.schlangen-startzone')?.className ?? zoneHit?.className ?? '',
        handHitClass: handHit?.closest('button')?.className ?? handHit?.className ?? '',
      }
    })

    if (!ergebnis.text.includes('Noch keine eigene Schlange') || !ergebnis.text.includes('Startkreis rechts')) {
      throw new Error(`M1cd Startgarten: Textvertrag gebrochen ${JSON.stringify(ergebnis.text)}`)
    }
    if (ergebnis.border !== '3px' || !ergebnis.shadow.includes('rgb(6, 57, 7)')) {
      throw new Error(`M1cd Startgarten: Computed Style gebrochen ${JSON.stringify({ border: ergebnis.border, shadow: ergebnis.shadow })}`)
    }
    if (ergebnis.garten.right > ergebnis.zone.x - 1 || Math.abs(ergebnis.garten.y - ergebnis.zone.y) > 40) {
      throw new Error(`M1cd Startgarten: Startgarten muss links neben der Startzone liegen ${JSON.stringify({ viewport, garten: ergebnis.garten, zone: ergebnis.zone })}`)
    }
    if (!String(ergebnis.zoneHitClass).includes('schlangen-startzone')) {
      throw new Error(`M1cd Startgarten: Startzone-Mitte nicht hit-testbar ${JSON.stringify(ergebnis.zoneHitClass)}`)
    }
    if (!String(ergebnis.handHitClass).includes('handkarte__button--karte')) {
      throw new Error(`M1cd Startgarten: Handkarte nach Startgarten-Layout nicht klickbar ${JSON.stringify(ergebnis.handHitClass)}`)
    }
    if (consoleErrors.length || pageErrors.length) throw new Error(`M1cd Startgarten: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
    console.log(`M1cd Startgarten ${viewport.width}px: Startgarten und Startzone getrennt, Startkreis und Handkarte hit-testbar.`)
  } finally {
    await context.close()
  }
}

try {
  for (const viewport of viewports) {
    await pruefeStartgarten(viewport)
  }
} finally {
  await browser.close()
}
