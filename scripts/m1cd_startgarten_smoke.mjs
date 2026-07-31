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
      /* ÄNDERUNG [31.07.2026]: S-3 — .schlangen-startgarten existiert nicht
         mehr. Er war die Text-Bubble links neben der Startzone („Noch keine
         eigene Schlange"), die M2s (Schlangenlichtung-Empty-State als ruhige
         Forest-Lichtung) zusammen mit zwei weiteren Bubbles entfernt hat. Die
         Startzone hat seine Aufgabe übernommen und trägt die Aufforderung
         selbst. Alle Prüfungen laufen deshalb auf der Startzone; die
         Lagebeziehung „Garten links neben Zone" ist mit dem Garten entfallen. */
      const startzone = document.querySelector('.schlangen-startzone')
      const handkarte = document.querySelector('.handkartenleiste--spielkartenfaecher .handkarte__button--karte')
      if (!(startzone instanceof HTMLElement)) throw new Error('M1cd Startgarten: Startzone fehlt')
      if (!(handkarte instanceof HTMLElement)) throw new Error('M1cd Startgarten: Handkarte fehlt')

      startzone.scrollIntoView({ block: 'center', inline: 'center' })
      const zoneBox = startzone.getBoundingClientRect()
      const zonenStil = getComputedStyle(startzone)
      const zonePunkt = { x: zoneBox.x + zoneBox.width / 2, y: zoneBox.y + zoneBox.height / 2 }
      const zoneHit = document.elementFromPoint(zonePunkt.x, zonePunkt.y)
      handkarte.scrollIntoView({ block: 'center', inline: 'center' })
      const handBox = handkarte.getBoundingClientRect()
      const handPunkt = { x: handBox.x + handBox.width / 2, y: handBox.y + handBox.height / 2 }
      const handHit = document.elementFromPoint(handPunkt.x, handPunkt.y)

      return {
        text: startzone.textContent?.replace(/\s+/g, ' ').trim(),
        zone: zoneBox.toJSON(),
        hand: handBox.toJSON(),
        border: zonenStil.borderTopWidth,
        shadow: zonenStil.boxShadow,
        zoneHitClass: zoneHit?.closest('.schlangen-startzone')?.className ?? zoneHit?.className ?? '',
        handHitClass: handHit?.closest('button')?.className ?? handHit?.className ?? '',
      }
    })

    /* ÄNDERUNG [31.07.2026]: S-3 — Textvertrag auf die heutige Beschriftung
       gezogen. Erwartet wurden „Noch keine eigene Schlange" und „Startkreis
       rechts". Beide hat M2s (Schlangenlichtung-Empty-State als ruhige
       Forest-Lichtung) bewusst entfernt — der Slice heißt im Log ausdrücklich
       „3 Notification-Bubbles weg". An ihre Stelle trat eine Handlungs-
       aufforderung statt einer Zustandsmeldung. Geprüft wird die, denn sie
       trägt denselben Vertrag: Der Spieler erfährt an der Startzone, was er
       hier tun kann. */
    for (const erwartet of ['Leuchtender Startplatz', 'Ziehe eine Farbkarte hierher']) {
      if (!ergebnis.text.includes(erwartet)) {
        throw new Error(`M1cd Startgarten: Textvertrag gebrochen — "${erwartet}" fehlt in ${JSON.stringify(ergebnis.text)}`)
      }
    }
    if (ergebnis.border !== '3px' || !ergebnis.shadow.includes('rgb(6, 57, 7)')) {
      throw new Error(`M1cd Startgarten: Computed Style gebrochen ${JSON.stringify({ border: ergebnis.border, shadow: ergebnis.shadow })}`)
    }
    if (!String(ergebnis.zoneHitClass).includes('schlangen-startzone')) {
      throw new Error(`M1cd Startgarten: Startzone-Mitte nicht hit-testbar ${JSON.stringify(ergebnis.zoneHitClass)}`)
    }
    if (!String(ergebnis.handHitClass).includes('handkarte__button--karte')) {
      throw new Error(`M1cd Startgarten: Handkarte nach Startgarten-Layout nicht klickbar ${JSON.stringify(ergebnis.handHitClass)}`)
    }
    if (consoleErrors.length || pageErrors.length) throw new Error(`M1cd Startgarten: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
    console.log(`M1cd Startgarten ${viewport.width}px: Startzone trägt die Aufforderung, Startkreis und Handkarte hit-testbar.`)
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
