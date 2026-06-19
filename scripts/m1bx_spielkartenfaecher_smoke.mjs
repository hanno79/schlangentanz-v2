import { chromium } from 'playwright'

const basisUrl = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
const seite = await context.newPage()
const consoleErrors = []
const pageErrors = []
seite.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()) })
seite.on('pageerror', (error) => pageErrors.push(error.message))

try {
  await seite.addInitScript(() => { Math.random = () => 0.999999 })
  await seite.goto(`${basisUrl}/game`, { waitUntil: 'networkidle' })
  const ergebnis = await seite.evaluate(() => {
    const liste = document.querySelector('.handkartenleiste--spielkartenfaecher')
    const karten = Array.from(document.querySelectorAll('.handkartenleiste--spielkartenfaecher .handkarte__button--karte'))
    const startzone = document.querySelector('.schlangen-startzone')
    const handbank = document.querySelector('.handkarten-panel')
    const dritte = karten[2]
    const kartenMessung = karten.map((karte) => {
      const rect = karte.getBoundingClientRect()
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      const hit = document.elementFromPoint(center.x, center.y)
      const css = getComputedStyle(karte)
      return {
        bottom: rect.bottom,
        height: rect.height,
        width: rect.width,
        border: css.borderTopWidth,
        shadow: css.boxShadow,
        hit: Boolean(hit?.closest('.handkarte__button--karte') === karte),
      }
    })
    const dritteRect = dritte?.getBoundingClientRect()
    const startRect = startzone?.getBoundingClientRect()
    const handRect = handbank?.getBoundingClientRect()
    return {
      count: karten.length,
      label: liste?.getAttribute('aria-label') ?? '',
      cards: kartenMessung,
      selectedBefore: document.querySelectorAll('.handkarte--ausgewaehlt').length,
      thirdCenter: dritteRect ? { x: dritteRect.left + dritteRect.width / 2, y: dritteRect.top + dritteRect.height / 2 } : null,
      separation: startRect && handRect ? handRect.top - startRect.bottom : -1,
      handBottom: handRect?.bottom ?? 9999,
    }
  })
  if (ergebnis.label !== 'Waldtanz-Spielkartenfächer') throw new Error(`M1bx Spielkartenfächer: falsches Label ${ergebnis.label}`)
  if (ergebnis.count !== 5) throw new Error(`M1bx Spielkartenfächer: erwartete 5 Karten, erhalten ${ergebnis.count}`)
  const schlechteKarte = ergebnis.cards.find((karte) => karte.bottom > 900 || karte.height < 116 || karte.width < 104 || karte.border !== '3px' || !karte.shadow.includes('rgb(6, 57, 7)') || !karte.hit)
  if (schlechteKarte) throw new Error(`M1bx Spielkartenfächer: Karten-Geometrie/Hit-Test gebrochen (${JSON.stringify(schlechteKarte)})`)
  if (ergebnis.separation < 8 || ergebnis.handBottom > 900) throw new Error(`M1bx Spielkartenfächer: Lichtung und Handbank überlappen (${JSON.stringify({ separation: ergebnis.separation, handBottom: ergebnis.handBottom })})`)
  if (!ergebnis.thirdCenter) throw new Error('M1bx Spielkartenfächer: dritte Karte fehlt')
  await seite.mouse.click(ergebnis.thirdCenter.x, ergebnis.thirdCenter.y)
  const selectedAfter = await seite.locator('.handkarte--ausgewaehlt').count()
  if (selectedAfter !== ergebnis.selectedBefore + 1) throw new Error(`M1bx Spielkartenfächer: Klick hebt keine Karte aus dem Fächer (selectedAfter=${selectedAfter})`)
  if (consoleErrors.length || pageErrors.length) throw new Error(`M1bx Spielkartenfächer: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
  const erste = ergebnis.cards[0]
  console.log(`M1bx Spielkartenfächer: ${ergebnis.count} große Karten (${Math.round(erste.width)}x${Math.round(erste.height)}px), alle hit-testbar, Klick hebt Karte aus dem Fächer.`)
} finally {
  await context.close()
  await browser.close()
}
