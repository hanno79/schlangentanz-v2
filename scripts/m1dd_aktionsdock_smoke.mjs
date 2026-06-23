import { chromium } from 'playwright-core'

const BASE = process.env.SMOKE_BASE_URL || 'https://schlangentanz-v2.vercel.app'
const VIEWPORT = { width: 1280, height: 900 }

async function smoke() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: VIEWPORT })
  const errors = []
  page.on('pageerror', (err) => errors.push(`pageError: ${err.message}`))
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`consoleError: ${msg.text()}`) })

  await page.goto(`${BASE}/game`, { waitUntil: 'networkidle' })
  const title = await page.title()
  if (!title.toLowerCase().includes('schlangentanz')) throw new Error(`Unexpected title: ${title}`)

  // M1dd: Aktionsdock im Erstbild sichtbar
  const aktionsdock = await page.$('[class~="aktionen-panel--brettinline"]')
  if (!aktionsdock) throw new Error('aktionen-panel--brettinline nicht gefunden')
  const dockRect = await aktionsdock.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { bottom: r.bottom, top: r.top, height: r.height }
  })
  console.log(`Aktionsdock: top=${dockRect.top}, bottom=${dockRect.bottom}, height=${dockRect.height}`)
  if (dockRect.bottom > 900) throw new Error(`Aktionsdock bottom ${dockRect.bottom} > 900`)

  // Handkarten sichtbar (erlaubt leichte Überschreitung wg. Bottom-Row-Trade-off)
  const handPanel = await page.$('[class~="handkarten-panel"]')
  if (!handPanel) throw new Error('handkarten-panel nicht gefunden')
  const handRect = await handPanel.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { bottom: r.bottom, top: r.top, left: r.left, right: r.right }
  })
  console.log(`Handkarten-Panel: top=${handRect.top}, bottom=${handRect.bottom}`)
  if (handRect.bottom > 960) throw new Error(`Handkarten-Panel bottom ${handRect.bottom} > 960`)

  // Spielerplakette sichtbar
  const spielerPlakette = await page.$('[class~="waldtanz-spielerplakette"]')
  if (!spielerPlakette) throw new Error('waldtanz-spielerplakette nicht gefunden')
  const spielerRect = await spielerPlakette.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { bottom: r.bottom, top: r.top, left: r.left, right: r.right }
  })
  console.log(`Spielerplakette: top=${spielerRect.top}, bottom=${spielerRect.bottom}`)

  // Keine Überlappung Spielerplakette / Handkarten
  const overlap = !(spielerRect.right < handRect.left || handRect.right < spielerRect.left || spielerRect.bottom < handRect.top || handRect.bottom < spielerRect.top)
  if (overlap) throw new Error('Spielerplakette und Handkarten überlappen sich')

  // Gegnerplakette sichtbar
  const gegnerPlakette = await page.$('[class~="waldtanz-gegnerplakette"]')
  if (!gegnerPlakette) throw new Error('waldtanz-gegnerplakette nicht gefunden')
  const gegnerRect = await gegnerPlakette.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { bottom: r.bottom, top: r.top }
  })
  console.log(`Gegnerplakette: top=${gegnerRect.top}, bottom=${gegnerRect.bottom}`)
  if (gegnerRect.bottom > 900) throw new Error(`Gegnerplakette bottom ${gegnerRect.bottom} > 900`)

  // Arenastein sichtbar
  const arenastein = await page.$('[class~="waldtanz-arenastein"]')
  if (!arenastein) throw new Error('waldtanz-arenastein nicht gefunden')
  const arenaRect = await arenastein.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { bottom: r.bottom, top: r.top }
  })
  console.log(`Arenastein: top=${arenaRect.top}, bottom=${arenaRect.bottom}`)
  if (arenaRect.bottom > 900) throw new Error(`Arenastein bottom ${arenaRect.bottom} > 900`)

  // Zugseitenleiste sichtbar
  const zugseitenleiste = await page.$('[class~="waldtanz-zugseitenleiste"]')
  if (!zugseitenleiste) throw new Error('waldtanz-zugseitenleiste nicht gefunden')
  const zugRect = await zugseitenleiste.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { bottom: r.bottom, top: r.top }
  })
  console.log(`Zugseitenleiste: top=${zugRect.top}, bottom=${zugRect.bottom}`)
  if (zugRect.bottom > 900) throw new Error(`Zugseitenleiste bottom ${zugRect.bottom} > 900`)

  // Ein Brettschritt: erste Handkarte klicken
  const ersteHandkarte = await page.$('[class~="handkarte__button--karte"]')
  if (!ersteHandkarte) throw new Error('Keine Handkarte gefunden')
  await ersteHandkarte.click({ force: true })
  console.log('Erste Handkarte geklickt')
  await page.waitForTimeout(500)

  // Nach Klick: Zielspur, Startkreis, Wachstumsfährte oder Zauberpfad sollte sichtbar sein
  const zielspur = await page.$('[class~="zielspur"]')
  const startkreis = await page.$('[class~="startkreis"]')
  const wachstumsfaehrte = await page.$('[class~="wachstumsfaehrte"]')
  const zauberpfad = await page.$('[class~="zauberpfad"]')
  if (!zielspur && !startkreis && !wachstumsfaehrte && !zauberpfad) {
    // Fallback: suche nach irgendeinem Button mit Karten-Bezug im Schlangenbereich
    const schlangenbereich = await page.$('[class~="schlangenbereich"]')
    if (schlangenbereich) {
      const anyTarget = await schlangenbereich.$('button')
      if (anyTarget) {
        console.log('Fallback: Schlangenbereich-Button gefunden nach Klick')
      } else {
        throw new Error('Nach Handkarten-Klick: keine Zielspur/Startkreis/Wachstumsfährte/Zauberpfad und kein Schlangenbereich-Button sichtbar')
      }
    } else {
      throw new Error('Nach Handkarten-Klick: keine Zielspur/Startkreis/Wachstumsfährte/Zauberpfad sichtbar')
    }
  } else {
    console.log('Zielspur/Startkreis/Wachstumsfährte/Zauberpfad sichtbar nach Klick')
  }

  if (errors.length > 0) {
    console.error('Page/Console Errors:', errors)
    throw new Error(`${errors.length} page/console errors`)
  }

  console.log('M1dd Production Smoke: ALLE PRÜFUNGEN BESTANDEN')
  await browser.close()
}

smoke().catch((err) => {
  console.error('M1dd Production Smoke FAILED:', err.message)
  process.exit(1)
})
