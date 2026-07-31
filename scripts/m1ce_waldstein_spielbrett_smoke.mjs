import { chromium } from 'playwright'

const basisUrl = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const browser = await chromium.launch({ headless: true })
const viewports = [
  { width: 1100, height: 900, label: 'enge Desktopkante' },
  { width: 1280, height: 900, label: 'Standardbrett' },
]

async function pruefeWaldsteinSpielbrett(viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
  const seite = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  seite.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
  seite.on('pageerror', (error) => pageErrors.push(error.message))

  try {
    await seite.addInitScript(() => { Math.random = () => 0.999999 })
    const response = await seite.goto(`${basisUrl}/game`, { waitUntil: 'networkidle' })
    if (!response || response.status() !== 200) throw new Error(`M1ce Waldstein: /game HTTP ${response?.status()}`)
    await seite.getByRole('region', { name: 'Waldtanz-Arenastein' }).waitFor()

    const ergebnis = await seite.evaluate(() => {
      const arena = document.querySelector('.waldtanz-arenastein')
      const lichtung = document.querySelector('.waldtanz-arenastein__schlangenlichtung')
      const startzone = document.querySelector('.schlangen-startzone')
      const handkarte = document.querySelector('.handkartenleiste--spielkartenfaecher .handkarte__button--karte')
      const waldtaschen = document.querySelector('.waldtanz-waldtaschen')
      if (!(arena instanceof HTMLElement)) throw new Error('M1ce Waldstein: Arena fehlt')
      if (!(lichtung instanceof HTMLElement)) throw new Error('M1ce Waldstein: Lichtung fehlt')
      if (!(startzone instanceof HTMLElement)) throw new Error('M1ce Waldstein: Startzone fehlt')
      if (!(handkarte instanceof HTMLElement)) throw new Error('M1ce Waldstein: Handkarte fehlt')
      if (!(waldtaschen instanceof HTMLElement)) throw new Error('M1ce Waldstein: Waldtaschen fehlen')

      const arenaBox = arena.getBoundingClientRect()
      const lichtungBox = lichtung.getBoundingClientRect()
      const startBox = startzone.getBoundingClientRect()
      const handBox = handkarte.getBoundingClientRect()
      const waldtaschenBox = waldtaschen.getBoundingClientRect()
      const arenaStyle = getComputedStyle(arena)
      const startPunkt = { x: startBox.x + startBox.width * 0.72, y: startBox.y + Math.min(startBox.height * 0.5, 64) }
      const handPunkt = { x: handBox.x + handBox.width / 2, y: handBox.y + handBox.height / 2 }
      const startHit = document.elementFromPoint(startPunkt.x, startPunkt.y)
      const handHit = document.elementFromPoint(handPunkt.x, handPunkt.y)

      return {
        arena: arenaBox.toJSON(),
        lichtung: lichtungBox.toJSON(),
        start: startBox.toJSON(),
        hand: handBox.toJSON(),
        waldtaschen: waldtaschenBox.toJSON(),
        overflow: arenaStyle.overflow,
        scrollbarGutter: arenaStyle.scrollbarGutter,
        clientHeight: arena.clientHeight,
        scrollHeight: arena.scrollHeight,
        startHitClass: startHit?.closest('.schlangen-startzone')?.className ?? startHit?.className ?? '',
        handHitClass: handHit?.closest('button')?.className ?? handHit?.className ?? '',
      }
    })

    // ÄNDERUNG [31.07.2026]: S-3 — geprüft wird, ob die Arena scrollt, nicht
    // welches overflow-Schlüsselwort sie trägt. Der alte Test las
    // `overflow !== 'visible'` als „ist ein Scrollpanel". Das ist der falsche
    // Stellvertreter: M2r/M9.5 deckeln das Arenastein per height + max-height
    // und setzen dazu `overflow: hidden` — geclippt, aber gerade nicht
    // scrollbar. Der Vertrag ist „der Spieler muss nicht scrollen"; genau das
    // misst scrollHeight gegen clientHeight.
    if (ergebnis.scrollHeight > ergebnis.clientHeight + 1) {
      throw new Error(`M1ce Waldstein: Arena scrollt ${JSON.stringify({ scrollHeight: ergebnis.scrollHeight, clientHeight: ergebnis.clientHeight })}`)
    }
    if (String(ergebnis.scrollbarGutter).includes('stable')) {
      throw new Error(`M1ce Waldstein: Scrollbar-Gutter bleibt sichtbar ${ergebnis.scrollbarGutter}`)
    }
    if (ergebnis.arena.height < 520) {
      throw new Error(`M1ce Waldstein: Spielbrett zu niedrig ${Math.round(ergebnis.arena.height)}px`)
    }
    if (ergebnis.lichtung.height < 360 || ergebnis.waldtaschen.height < 260) {
      throw new Error(`M1ce Waldstein: Lichtung/Waldtaschen verlieren Spielfläche ${JSON.stringify({ lichtung: ergebnis.lichtung.height, waldtaschen: ergebnis.waldtaschen.height })}`)
    }
    if (!String(ergebnis.startHitClass).includes('schlangen-startzone')) {
      throw new Error(`M1ce Waldstein: Startkreis nicht hit-testbar ${JSON.stringify(ergebnis.startHitClass)}`)
    }
    if (!String(ergebnis.handHitClass).includes('handkarte__button--karte')) {
      throw new Error(`M1ce Waldstein: Handkarte nicht hit-testbar ${JSON.stringify(ergebnis.handHitClass)}`)
    }
    if (consoleErrors.length || pageErrors.length) throw new Error(`M1ce Waldstein: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
    console.log(`M1ce Waldstein-Spielbrett: Arena ${Math.round(ergebnis.arena.height)}px ohne internen Scroll, Startkreis und Handkarte hit-testbar.`)
  } finally {
    await context.close()
  }
}

try {
  for (const viewport of viewports) await pruefeWaldsteinSpielbrett(viewport)
} finally {
  await browser.close()
}
