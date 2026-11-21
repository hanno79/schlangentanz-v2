// @vitest-environment node
// Prüferprobe K2 Iteration 2, Kriterium 8: Zeit und Bewertungen in späten Stellungen; liegt nur während des Laufs hier.
import { it, vi } from 'vitest'
import { appendFileSync } from 'node:fs'
import { ermittleAktionen, erzeugeZufall, pruefeAktion } from '../src/engine'
import type { Spielzustand } from '../src/engine'
import { baukasten } from '../src/engine/testing/szenario'
import type { Kartenwahl, Schlangenglied } from '../src/engine/testing/szenario'
import { kiWahl } from '../src/ki/schritt'
import { sichtFuer } from '../src/ki/sicht'
import { erstelleSolideKi } from '../src/ki/strategien/solideKi'
import { GRENZE_BEWERTUNGEN, planeZug } from '../src/ki/strategien/zugsuche'

const zaehler = vi.hoisted(() => ({ n: 0 }))
vi.mock('../src/ki/strategien/bewertung', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/ki/strategien/bewertung')>()
  return { ...original, bewerte: (...args: Parameters<typeof original.bewerte>) => { zaehler.n++; return original.bewerte(...args) } }
})

const LOG = process.env.PRUEFER_LOG ?? 'pruefer.log'
const log = (...t: unknown[]) => appendFileSync(LOG, t.join(' ') + '\n')

const LANG: Schlangenglied[][] = [
  ['Rot', 'Rot', 'Blau', 'Blau', 'Gelb', 'Gelb', 'Grün', 'Grün'],
  ['Violett', 'Violett', 'Braun', 'Braun', 'Rot', 'Rot', 'Blau', 'Blau'],
  ['Gelb', 'Gelb', 'Grün', 'Grün', 'Violett', 'Violett', 'Braun', 'Braun'],
  ['Blau', 'Rot', 'Gelb', 'Grün', 'Violett', 'Braun', 'Rot', 'Blau'],
]
const KURZ: Schlangenglied[][] = [
  ['Violett', 'Braun', 'Violett', 'Braun', 'Gelb'],
  ['Gelb', 'Grün', 'Gelb', 'Grün', 'Violett'],
  ['Rot', 'Blau', 'Rot', 'Blau', 'Rot'],
  ['Grün', 'Gelb', 'Braun', 'Violett', 'Grün'],
]

function stellung(spielerzahl: number, erweiterung: boolean, hand: Kartenwahl[], schluss: boolean, gespielt: number): Spielzustand {
  let b = baukasten({ spielerzahl, erweiterung, zufall: erzeugeZufall(500 + spielerzahl) })
  for (let i = 0; i < spielerzahl; i++) b = b.schlange(i, LANG[i]).schlange(i, KURZ[i])
  b = b.hand(0, hand)
  for (let i = 1; i < spielerzahl; i++) b = b.hand(i, ['Rot', 'Blau', 'Gelb'])
  if (schluss) b = b.schlussrunde(1)
  return b.amZug(0).aendere((z) => (z.zug.gespielteFarbkarten = gespielt)).zustand()
}

it('Zeit je Schritt in späten Stellungen', () => {
  const faelle: Array<[string, Spielzustand]> = []
  for (const n of [2, 3, 4]) {
    for (const erw of [false, true]) {
      faelle.push([`${n}/${erw ? 'E' : 'B'} laufend, Farbkarte offen`, stellung(n, erw, ['Farbendieb', 'Schlangenfrass', erw ? 'Schlangenhäutung' : 'Schlangenblockade', 'Farbenfusion', 'Rot'], false, 0)])
      faelle.push([`${n}/${erw ? 'E' : 'B'} laufend, nach Farbkarte`, stellung(n, erw, ['Farbendieb', 'Schlangenfrass', erw ? 'Schlangenhäutung' : 'Schlangenblockade', 'Farbenfusion', 'Rot'], false, 1)])
      faelle.push([`${n}/${erw ? 'E' : 'B'} Schlussrunde`, stellung(n, erw, ['Farbendieb', 'Schlangenfrass', erw ? 'Schlangenhäutung' : 'Schlangenblockade', 'Farbenfusion', 'Rot'], true, 0)])
    }
  }
  log(`GRENZE_BEWERTUNGEN ${GRENZE_BEWERTUNGEN}`)
  let maxMs = 0
  let maxBew = 0
  let maxAlle = 0
  for (const [name, z] of faelle) {
    const aktionen = ermittleAktionen(z)
    const typen = new Map<string, number>()
    for (const a of aktionen) typen.set(a.typ, (typen.get(a.typ) ?? 0) + 1)
    planeZug(sichtFuer(z, 0), structuredClone(aktionen), erzeugeZufall(1)) // Aufwärmen
    zaehler.n = 0
    const t0 = performance.now()
    const plan = planeZug(sichtFuer(z, 0), structuredClone(aktionen), erzeugeZufall(1))
    const ms = performance.now() - t0
    const alle = zaehler.n
    const t1 = performance.now()
    const gewaehlt = kiWahl(z, erstelleSolideKi(erzeugeZufall(2)))!
    const msGanz = performance.now() - t1
    const erlaubt = pruefeAktion(z, gewaehlt).erlaubt
    maxMs = Math.max(maxMs, ms)
    maxBew = Math.max(maxBew, plan.bewertungen)
    maxAlle = Math.max(maxAlle, alle)
    log(`${name}: ${aktionen.length} Aktionen (${[...typen].map(([t, k]) => `${t} ${k}`).join(', ')}); planeZug ${ms.toFixed(1)} ms, gezählte Bewertungen ${plan.bewertungen}, Aufrufe von bewerte insgesamt ${alle}; kiWahl ganz ${msGanz.toFixed(1)} ms; gewählt ${gewaehlt.typ}, erlaubt ${erlaubt}`)
  }
  log(`höchstens ${maxMs.toFixed(1)} ms, ${maxBew} gezählte Bewertungen, ${maxAlle} Aufrufe von bewerte`)
}, 600_000)
