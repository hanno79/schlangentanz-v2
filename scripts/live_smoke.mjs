/*
Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: R107 Production-Smoke — prüft / und /game per HTTP sowie sichtbare
              Kernregionen im Browser. Mit --self-test: offline Selbstprüfung der
              Konfiguration, kein Netzwerk/Browser nötig.
*/

import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'https://schlangentanz-v2.vercel.app'
const PFLICHT_ROUTEN = ['/', '/game']
const PFLICHT_KERN_TEXTE = ['Spielstatus', 'Aktiver Spieler', 'Aktionen', 'Schlangenbereich']
const ROUTEN = [...PFLICHT_ROUTEN]
const KERN_TEXTE = [...PFLICHT_KERN_TEXTE]
const HTTP_TIMEOUT_MS = 15_000

// ---------------------------------------------------------------------------
// Selbsttest
// ---------------------------------------------------------------------------

function arraysSindGleich(links, rechts) {
  return JSON.stringify(links) === JSON.stringify(rechts)
}

function validiereBasisUrl() {
  try {
    new URL(BASE_URL)
  } catch {
    throw new Error(`BASE_URL ungültig — ${BASE_URL}`)
  }
}

export function erstelleSelbsttestAusgabe() {
  validiereBasisUrl()

  if (!arraysSindGleich(ROUTEN, PFLICHT_ROUTEN)) {
    throw new Error(`Pflichtrouten abweichend — ${ROUTEN.join(', ')}`)
  }
  if (!arraysSindGleich(KERN_TEXTE, PFLICHT_KERN_TEXTE)) {
    throw new Error(`Kerntexte abweichend — ${KERN_TEXTE.join(' | ')}`)
  }

  return [
    `Routen: ${ROUTEN.join(', ')}`,
    `Kerntexte: ${KERN_TEXTE.join(' | ')}`,
    'R107 Selbsttest bestanden',
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Production-Smoke
// ---------------------------------------------------------------------------

function erstelleUrl(route) {
  return new URL(route, BASE_URL).toString()
}

async function httpPruefen(route) {
  const url = erstelleUrl(route)
  const response = await fetch(url, { signal: AbortSignal.timeout(HTTP_TIMEOUT_MS) })

  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status} für ${url}`)
  }

  console.log(`HTTP 200  ${url}`)
}

async function browserSmoke() {
  const browser = await chromium.launch()
  const seite = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []

  seite.on('pageerror', (err) => errors.push(`Page-Fehler: ${err.message}`))
  seite.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`)
  })

  try {
    await seite.goto(erstelleUrl('/game'), { waitUntil: 'networkidle' })

    for (const text of KERN_TEXTE) {
      const sichtbar = await kernTextSichtbar(seite, text)
      if (!sichtbar) {
        throw new Error(`Kernregion nicht sichtbar: "${text}"`)
      }
      console.log(`Sichtbar: "${text}"`)
    }

    await pruefeM1asErstzugLichtung(seite)
    await pruefeM1awHandkante(seite)

    await seite.waitForTimeout(500)

    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
  } finally {
    await browser.close()
  }
}

async function pruefeM1asErstzugLichtung(seite) {
  const arenaBox = await seite.getByRole('region', { name: 'Waldtanz-Arenastein' }).boundingBox()
  const schlangenBox = await seite.getByRole('region', { name: 'Schlangenbereich' }).boundingBox()
  const handBox = await seite.getByRole('region', { name: 'Handkarten' }).boundingBox()

  if (!arenaBox || !schlangenBox || !handBox) {
    throw new Error('M1as Layout-Smoke: Arena, Schlangenbereich oder Handkarten fehlen')
  }

  const sichtbareSchlangenHoehe = Math.min(900, schlangenBox.y + schlangenBox.height) - Math.max(0, schlangenBox.y)
  if (sichtbareSchlangenHoehe < 220) {
    throw new Error(`M1as Layout-Smoke: Schlangenbereich zu wenig im Erstbild sichtbar (${Math.round(sichtbareSchlangenHoehe)}px)`)
  }

  const handAbstandZurArena = handBox.y - (arenaBox.y + arenaBox.height)
  if (handAbstandZurArena < -330 || handAbstandZurArena > 40) {
    throw new Error(`M1as Layout-Smoke: Handkarten nicht board-nah zur Arena (${Math.round(handAbstandZurArena)}px Abstand)`)
  }

  console.log(`M1as Layout: Schlangenbereich ${Math.round(sichtbareSchlangenHoehe)}px sichtbar, Handkante ${Math.round(handAbstandZurArena)}px zur Arena`)
}

async function pruefeM1awHandkante(seite) {
  const arenaBox = await seite.getByRole('region', { name: 'Waldtanz-Arenastein' }).boundingBox()
  const handBox = await seite.getByRole('region', { name: 'Handkarten' }).boundingBox()
  const ersteHandkarte = seite.locator('.handkartenleiste--tiefenfaecher .handkarte__button--karte').first()
  const ersteHandkarteBox = await ersteHandkarte.boundingBox()

  if (!arenaBox || !handBox || !ersteHandkarteBox) {
    throw new Error('M1aw Handkante: Arena, Handregion oder erste Handkarte fehlt')
  }

  if (handBox.y < arenaBox.y + 100) {
    throw new Error(`M1aw Handkante: Hand liegt zu hoch über dem Brett (${Math.round(handBox.y)}px)`)
  }
  if (handBox.y > 835) {
    throw new Error(`M1aw Handkante: Handbühne beginnt zu tief im Erstbild (${Math.round(handBox.y)}px)`)
  }
  if (ersteHandkarteBox.y > 875) {
    throw new Error(`M1aw Handkante: erste Spielkarte ist nicht am unteren Erstbildrand sichtbar (${Math.round(ersteHandkarteBox.y)}px)`)
  }

  const kartenStil = await ersteHandkarte.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      borderWidth: style.borderTopWidth,
      overflow: style.overflow,
      height: element.getBoundingClientRect().height,
    }
  })

  if (kartenStil.borderWidth !== '3px' || kartenStil.overflow !== 'hidden') {
    throw new Error(`M1aw Handkante: Kartenfläche nicht kompakt/chunky genug (${JSON.stringify(kartenStil)})`)
  }

  const center = {
    x: ersteHandkarteBox.x + ersteHandkarteBox.width / 2,
    y: ersteHandkarteBox.y + ersteHandkarteBox.height / 2,
  }
  const hitTest = await seite.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('button')?.className ?? '', center)
  if (!String(hitTest).includes('handkarte__button--karte')) {
    throw new Error(`M1aw Handkante: Handkarte ist am Mittelpunkt nicht klickbar (${hitTest})`)
  }

  const blankHandPoint = {
    x: handBox.x + Math.min(24, Math.max(8, handBox.width * 0.06)),
    y: handBox.y + Math.min(24, Math.max(8, handBox.height * 0.08)),
  }
  const blankHit = await seite.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y)
    return {
      hand: Boolean(element?.closest('.handkarten-panel')),
      board: Boolean(element?.closest('.waldtanz-arenastein')),
      klasse: element?.className ?? '',
    }
  }, blankHandPoint)
  if (blankHit.hand && !blankHit.board) {
    throw new Error(`M1aw Handkante: leere Handbühne blockiert das Brett (${JSON.stringify(blankHit)})`)
  }

  console.log(`M1aw Handkante: Hand bei ${Math.round(handBox.y)}px, erste Karte bei ${Math.round(ersteHandkarteBox.y)}px, Kartenhöhe ${Math.round(kartenStil.height)}px`)
}

async function kernTextSichtbar(seite, text) {
  const regionSichtbar = await seite.getByRole('region', { name: text, exact: true }).first().isVisible().catch(() => false)
  if (regionSichtbar) return true

  const headingSichtbar = await seite.getByRole('heading', { name: text, exact: true }).first().isVisible().catch(() => false)
  if (headingSichtbar) return true

  return seite.getByText(text, { exact: true }).first().isVisible().catch(() => false)
}

// ---------------------------------------------------------------------------
// Einstiegspunkt
// ---------------------------------------------------------------------------

async function main() {
  if (process.argv.includes('--self-test')) {
    console.log(erstelleSelbsttestAusgabe())
  } else {
    validiereBasisUrl()
    await Promise.all(ROUTEN.map(httpPruefen))
    await browserSmoke()
    console.log('R107 Production-Smoke bestanden')
  }
}

try {
  const istDirekterCliAufruf = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href
  if (istDirekterCliAufruf) {
    await main()
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
