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
  const response = await seite.goto(`${basisUrl}/game`, { waitUntil: 'networkidle' })
  if (!response || response.status() !== 200) throw new Error(`M1cb Zielranken: /game HTTP ${response?.status()}`)
  await seite.getByRole('region', { name: 'Spieltisch' }).waitFor()
  const farbkarte = seite.locator('.handkartenleiste--spielkartenfaecher .handkarte__button--karte').filter({ hasText: 'Farbkarte' }).first()
  await farbkarte.click()

  const ergebnis = await seite.evaluate(() => {
    const zielspur = document.querySelector('.waldtanz-zielspur--rankenpfad')
    const ranken = Array.from(document.querySelectorAll('.waldtanz-zielranken .waldtanz-zielranke'))
    const schlangenbereich = document.querySelector('.schlangenbereich--waldlichtung')
    const handbank = document.querySelector('.handkarten-panel')
    if (!(zielspur instanceof HTMLElement)) throw new Error('M1cb Zielranken: Zielspur fehlt')
    if (!(schlangenbereich instanceof HTMLElement)) throw new Error('M1cb Zielranken: Schlangenbereich fehlt')
    if (!(handbank instanceof HTMLElement)) throw new Error('M1cb Zielranken: Handbank fehlt')
    const zielspurStil = getComputedStyle(zielspur)
    const rankenStil = ranken[0] instanceof HTMLElement ? getComputedStyle(ranken[0]) : null
    return {
      zielspurText: zielspur.textContent ?? '',
      rankenLabel: document.querySelector('.waldtanz-zielranken')?.getAttribute('aria-label') ?? '',
      rankenText: ranken.map((ranke) => ranke.textContent?.trim() ?? ''),
      statusCount: schlangenbereich.querySelectorAll('[role="status"]').length,
      border: zielspurStil.borderTopWidth,
      shadow: zielspurStil.boxShadow,
      display: zielspurStil.display,
      rankenDisplay: getComputedStyle(document.querySelector('.waldtanz-zielranken')).display,
      rankeRadius: rankenStil?.borderRadius ?? '',
      zielspur: zielspur.getBoundingClientRect().toJSON(),
      handbank: handbank.getBoundingClientRect().toJSON(),
    }
  })

  if (!ergebnis.zielspurText.includes('Rankenpfad aktiv') || !/Brettziel(?:e)? leuchte(?:t|n)/.test(ergebnis.zielspurText)) {
    throw new Error(`M1cb Zielranken: Zielspur-Text fehlt (${ergebnis.zielspurText})`)
  }
  if (ergebnis.rankenLabel !== 'Waldtanz-Zielranken') throw new Error(`M1cb Zielranken: falsches Listenlabel ${ergebnis.rankenLabel}`)
  if (ergebnis.rankenText.join('|') !== 'Handkarte|Waldlichtung|Brettziel') throw new Error(`M1cb Zielranken: falsche Rankenpunkte ${JSON.stringify(ergebnis.rankenText)}`)
  if (ergebnis.statusCount !== 1) throw new Error(`M1cb Zielranken: erwartete genau einen Status, erhalten ${ergebnis.statusCount}`)
  if (ergebnis.display !== 'grid' || ergebnis.border !== '3px' || !ergebnis.shadow.includes('rgb(6, 57, 7)')) {
    throw new Error(`M1cb Zielranken: Computed Style gebrochen ${JSON.stringify({ display: ergebnis.display, border: ergebnis.border, shadow: ergebnis.shadow })}`)
  }
  if (ergebnis.rankenDisplay !== 'grid' || ergebnis.rankeRadius === '0px') {
    throw new Error(`M1cb Zielranken: Ranken wirken nicht als koerperliche Pfadpunkte ${JSON.stringify({ display: ergebnis.rankenDisplay, radius: ergebnis.rankeRadius })}`)
  }
  if (ergebnis.zielspur.y < ergebnis.handbank.bottom - 8) {
    throw new Error(`M1cb Zielranken: Zielspur ueberlappt die Handbank ${JSON.stringify({ zielspur: ergebnis.zielspur, handbank: ergebnis.handbank })}`)
  }
  if (consoleErrors.length || pageErrors.length) throw new Error(`M1cb Zielranken: Browserfehler ${JSON.stringify({ consoleErrors, pageErrors })}`)
  console.log(`M1cb Zielranken: ${ergebnis.rankenText.length} Rankenpunkte, 3px-Rand, Hard Shadow und ein einziger Status im Brett.`)
} finally {
  await context.close()
  await browser.close()
}
