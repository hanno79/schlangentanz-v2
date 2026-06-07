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
  const seite = await browser.newPage()
  const errors = []

  seite.on('pageerror', (err) => errors.push(`Page-Fehler: ${err.message}`))
  seite.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Console-Fehler: ${msg.text()}`)
  })

  try {
    await seite.goto(erstelleUrl('/game'), { waitUntil: 'networkidle' })

    for (const text of KERN_TEXTE) {
      const sichtbar = await seite.getByRole('region', { name: text, exact: true }).first().isVisible().catch(() => false)
      if (!sichtbar) {
        throw new Error(`Kernregion nicht sichtbar: "${text}"`)
      }
      console.log(`Sichtbar: "${text}"`)
    }

    await seite.waitForTimeout(500)

    if (errors.length > 0) {
      throw new Error(errors.join('\n'))
    }
  } finally {
    await browser.close()
  }
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
