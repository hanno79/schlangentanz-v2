// Fotografiert eine Adresse in allen drei Geräteklassen (scripts/pruefung/geraeteklassen.mjs).
//
// Aufruf:
//   node scripts/pruefung/bildschirmfotos.mjs <adresse> --name <präfix> [--ziel <ordner>] [--warte-auf <css-selektor>]
//
// Schreibt <ziel>/<präfix>-desktop.png, -tablet.png und -handy.png, Standardziel
// docs/abnahme/bilder. Jedes Bild zeigt genau das Fenster der Geräteklasse; das Skript
// liest die Grösse aus der PNG-Datei zurück und bricht ab, wenn sie nicht stimmt.
// Zu jedem Bild meldet es, ob Touch aktiv war und wie viele Fehler die Seite in die
// Konsole schrieb. Ansehen und beschreiben muss der Prüfer die Bilder selbst.
//
// Exit 0: drei Bilder in der richtigen Grösse. Exit 1: Seite nicht geladen oder Bild
// falsch. Exit 2: Aufruf falsch.

import { mkdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { GERAETEKLASSEN, chromiumPfad, kontextOptionen } from './geraeteklassen.mjs'

const AUFRUF =
  'Aufruf: node scripts/pruefung/bildschirmfotos.mjs <adresse> --name <präfix> [--ziel <ordner>] [--warte-auf <css-selektor>]\n' +
  'Beispiel: node scripts/pruefung/bildschirmfotos.mjs http://localhost:4173/ --name P0.4-start'
const PNG_SIGNATUR = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

/** Breite und Höhe aus dem IHDR-Block einer PNG-Datei. */
export function pngGroesse(daten) {
  if (daten.length < 24 || !daten.subarray(0, 8).equals(PNG_SIGNATUR)) {
    throw new Error('pngGroesse: Die Daten sind kein PNG (Signatur fehlt).')
  }
  return { breite: daten.readUInt32BE(16), hoehe: daten.readUInt32BE(20) }
}

function leseArgumente(argumente) {
  const optionen = { adresse: null, name: null, ziel: 'docs/abnahme/bilder', warteAuf: null }
  const schalter = { '--name': 'name', '--ziel': 'ziel', '--warte-auf': 'warteAuf' }
  for (let i = 0; i < argumente.length; i += 1) {
    const argument = argumente[i]
    if (argument in schalter) {
      const wert = argumente[(i += 1)]
      if (!wert) throw new Error(`${argument} braucht einen Wert.`)
      optionen[schalter[argument]] = wert
    } else if (!argument.startsWith('--') && optionen.adresse === null) {
      optionen.adresse = argument
    } else {
      throw new Error(`Unbekanntes Argument „${argument}“.`)
    }
  }
  if (!optionen.adresse) throw new Error('Die Adresse fehlt.')
  if (!optionen.name) throw new Error('--name fehlt.')
  return optionen
}

async function fotografiere(browser, klasse, optionen) {
  const kontext = await browser.newContext({ ...kontextOptionen(klasse), reducedMotion: 'reduce' })
  try {
    const seite = await kontext.newPage()
    const konsolenfehler = []
    seite.on('console', (meldung) => {
      if (meldung.type() === 'error') konsolenfehler.push(meldung.text())
    })
    seite.on('pageerror', (fehler) => konsolenfehler.push(fehler.message))

    await seite.goto(optionen.adresse, { waitUntil: 'load' })
    if (optionen.warteAuf) await seite.locator(optionen.warteAuf).first().waitFor({ state: 'visible', timeout: 15_000 })
    const grob = await seite.evaluate(() => matchMedia('(pointer: coarse)').matches)

    const pfad = join(optionen.ziel, `${optionen.name}-${klasse.name}.png`)
    await seite.screenshot({ path: pfad })
    const { breite, hoehe } = pngGroesse(readFileSync(pfad))
    if (breite !== klasse.viewport.width || hoehe !== klasse.viewport.height) {
      throw new Error(`${pfad}: ${breite}×${hoehe} statt ${klasse.viewport.width}×${klasse.viewport.height}`)
    }
    return { pfad, grob, konsolenfehler }
  } finally {
    await kontext.close()
  }
}

async function hauptprogramm() {
  let optionen
  try {
    optionen = leseArgumente(process.argv.slice(2))
  } catch (fehler) {
    console.error(`bildschirmfotos: ${fehler.message}\n${AUFRUF}`)
    process.exit(2)
  }
  mkdirSync(optionen.ziel, { recursive: true })

  const browser = await chromium.launch({ executablePath: chromiumPfad() })
  try {
    for (const klasse of GERAETEKLASSEN) {
      const { pfad, grob, konsolenfehler } = await fotografiere(browser, klasse, optionen)
      console.log(
        `${klasse.titel}: ${pfad} (${klasse.viewport.width}×${klasse.viewport.height} px), Touch ${klasse.hasTouch ? 'an' : 'aus'}, ` +
          `pointer: coarse ${grob ? 'ja' : 'nein'}, Konsolenfehler: ${konsolenfehler.length}`,
      )
      for (const text of konsolenfehler) console.log(`  Konsole: ${text}`)
    }
  } finally {
    await browser.close()
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  hauptprogramm().catch((fehler) => {
    console.error(`bildschirmfotos: ${fehler.message}`)
    process.exit(1)
  })
}
