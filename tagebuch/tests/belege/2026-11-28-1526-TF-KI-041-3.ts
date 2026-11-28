// @vitest-environment node
// Messprobe K4 Iteration 2, nicht für das Repo.
import { writeFileSync } from 'node:fs'
import { it } from 'vitest'
import { anwendeAktion, berechneEndwertung, erstellePartie, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { waehleFuer } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import type { Ki } from './strategie'
import { erstelleSolideKi } from './solideKi'
import { imErstenZug, setztAuslageEin } from './eroeffnung'

const env = process.env
const MODUS = env.K4_MODUS ?? 'nutzung'
const VON = Number(env.K4_VON ?? 0)
const BIS = Number(env.K4_BIS ?? 10)
const AUS = env.K4_AUS ?? 'k4-mess.json'
type Einstellung = { erstzug?: number; risiko?: number; ohneErstzug?: boolean }
const A: Einstellung = JSON.parse(env.K4_A ?? '{}')
const B: Einstellung = JSON.parse(env.K4_B ?? '{"ohneErstzug":true}')
const glob = globalThis as { __k4?: Einstellung }

/** Spielt eine Partie; `erster[sitz]` ist 0 vor, 1 im und 2 nach dem ersten eigenen Zug. */
function partie(start: Spielzustand, kis: Ki[], einstellungen: Einstellung[], beobachte: (zustand: Spielzustand, sitz: number, imErsten: boolean, aktion: SpielAktion) => void) {
  const erster = kis.map(() => 0)
  let zustand = start
  for (let schritt = 0; schritt < 5000; schritt += 1) {
    const am = zustand.zug.spielerIndex
    if (erster[am] === 0) erster[am] = 1
    const entscheider = entscheiderVon(zustand)
    if (entscheider === null) return berechneEndwertung(zustand)
    const sitz = entscheider.index
    glob.__k4 = einstellungen[sitz]
    const imErsten = erster[sitz] === 1 && am === sitz
    const ki = kis[sitz]
    const gefiltert: Ki = einstellungen[sitz].ohneErstzug && imErsten
      ? { name: ki.name, waehle: (sicht, aktionen) => { const erlaubt = aktionen.filter((a) => !setztAuslageEin(a)); return ki.waehle(sicht, erlaubt.length > 0 ? erlaubt : aktionen) } }
      : ki
    const aktion = waehleFuer(zustand, entscheider, gefiltert)
    if (env.K4_SPUR && aktuell === Number(env.K4_SPUR) && schritt < 60) faelle.push(`spur ${schritt} am=${am} sitz=${sitz} erster=${erster.join('')} ${aktion.typ}`)
    beobachte(zustand, sitz, imErsten, aktion)
    const vorher = zustand
    zustand = anwendeAktion(zustand, aktion).zustand
    if (vorher.zug.spielerIndex === sitz && erster[sitz] === 1) {
      const z = zustand.zug
      const neuerZug = z.spielerIndex !== sitz || ((aktion.typ === 'ZugBeenden' || aktion.typ === 'UeberhandAbwerfen') && z.teilzug === 1 && z.abschnitt === 'Ausspielen' && z.verwendet.length === 0)
      if (neuerZug) erster[sitz] = 2
    }
  }
  throw new Error('Schrittgrenze')
}

const faelle: string[] = []
let aktuell = 0
function fall(art: string, zustand: Spielzustand, sitz: number, aktion: SpielAktion) {
  if (faelle.length > 400) return
  const sp = zustand.spieler[sitz]
  faelle.push(JSON.stringify({ art, n: aktuell, sitz, teilzug: zustand.zug.teilzug, abschnitt: zustand.zug.abschnitt, verwendet: zustand.zug.verwendet, schlangen: sp.schlangen.map((s) => s.karten.map((k) => (k.typ === 'Farbkarte' ? k.farbe : k.typ === 'Sonderkarte' ? k.name : k.typ))), ausgespielt: sp.ausgespielteSonderkarten, ablage: sp.ablagestapel.length, risiko: sp.risikoKarten.length, aktion: aktion.typ, entscheidung: zustand.entscheidung?.art ?? null, schwebend: zustand.schwebend !== null }))
}
it('K4 Messung', () => {
  const ergebnis = { modus: MODUS, von: VON, bis: BIS, A, B, partien: 0, ersteZuege: 0, ersteMitKarte: 0, arten: {} as Record<string, number>, praedikat: { tp: 0, fp: 0, fn: 0, tn: 0 }, risikoGespielt: 0, risikoMoeglich: 0, punkteA: 0, unentschieden: 0, summeA: 0, summeB: 0 }
  for (let n = VON; n < BIS; n += 1) {
    aktuell = n
    if (MODUS === 'nutzung') {
      const spielerzahl = 2 + (n % 3)
      const start = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(66_000 + n) })
      const kis = Array.from({ length: spielerzahl }, (_, sitz) => erstelleSolideKi(erzeugeZufall(7_000 + 10 * n + sitz)))
      const genutzt = new Set<number>()
      partie(start, kis, kis.map(() => A), (zustand, sitz, imErsten, aktion) => {
        if (zustand.zug.spielerIndex === sitz) {
          const p = imErstenZug(sichtFuer(zustand, sitz))
          if (p && imErsten) ergebnis.praedikat.tp += 1
          else if (p) { ergebnis.praedikat.fp += 1; fall('fp', zustand, sitz, aktion) }
          else if (imErsten) { ergebnis.praedikat.fn += 1; fall('fn', zustand, sitz, aktion) }
          else ergebnis.praedikat.tn += 1
        }
        if (aktion.typ === 'RisikoKarteSpielen') ergebnis.risikoGespielt += 1
        if (imErsten && setztAuslageEin(aktion) && !genutzt.has(sitz)) {
          genutzt.add(sitz)
          ergebnis.ersteMitKarte += 1
          ergebnis.arten[aktion.typ] = (ergebnis.arten[aktion.typ] ?? 0) + 1
        }
      })
      ergebnis.risikoMoeglich += 2 * spielerzahl
      ergebnis.ersteZuege += spielerzahl
      ergebnis.partien += 1
    } else {
      for (const sitzA of [0, 1]) {
        const start = erstellePartie({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(88_000 + n) })
        const kis = [0, 1].map((sitz) => erstelleSolideKi(erzeugeZufall(5_000 + 2 * n + sitz)))
        const einstellungen = [0, 1].map((sitz) => (sitz === sitzA ? A : B))
        const wertung = partie(start, kis, einstellungen, () => {})
        const sieger = wertung.spieler.flatMap((spieler, sitz) => (wertung.gewinner.includes(spieler.spielerId) ? [sitz] : []))
        ergebnis.partien += 1
        if (sieger.length > 1) { ergebnis.unentschieden += 1; ergebnis.punkteA += 0.5 }
        else if (sieger[0] === sitzA) ergebnis.punkteA += 1
        ergebnis.summeA += wertung.spieler[sitzA].summe
        ergebnis.summeB += wertung.spieler[1 - sitzA].summe
      }
    }
  }
  writeFileSync(AUS, [JSON.stringify(ergebnis), ...faelle].join(String.fromCharCode(10)))
}, 36_000_000)
