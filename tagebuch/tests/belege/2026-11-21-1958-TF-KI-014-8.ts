// @vitest-environment node
// Diagnose des Prüfers K2, Iteration 4: die fünf Zeilen VERSTOSS der Probe aus TF-KI-014 auf ihren Saaten.
import { appendFileSync } from 'node:fs'
import { it } from 'vitest'
import { anwendeAktion, berechneEndwertung, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall, werteSchlangen } from '../src/engine'
import { sichtFuer } from '../src/ki/sicht'
import { bewerte } from '../src/ki/strategien/bewertung'
import { planeZug } from '../src/ki/strategien/zugsuche'
import type { SpielAktion, Spielzustand } from '../src/engine'
import { kiWahl } from '../src/ki/schritt'
import { entscheiderVon } from '../src/ki/sicht'
import { erstelleSolideKi } from '../src/ki/strategien/solideKi'
import { erstelleZufallsKi } from '../src/ki/strategien/zufallsKi'

const LOG = process.env.PRUEFER_LOG ?? 'diag014.log'
const log = (z: string) => appendFileSync(LOG, z + '\n')
const gruppen = (z: Spielzustand, s: number) => werteSchlangen(z.spieler[s].schlangen, z.erweiterung).schlangen.reduce((a, b) => a + b.gruppen.length, 0)
function durch(z: Spielzustand, a: SpielAktion, s: number): Spielzustand {
  let j = anwendeAktion(z, a).zustand
  for (let g = ermittleEntscheider(j); j.schwebend !== null && g !== null && g !== s; g = ermittleEntscheider(j)) {
    j = anwendeAktion(j, { typ: 'Reagieren', spielerId: j.spieler[g].id, farbenschutzId: null }).zustand
  }
  return j
}
const kurz = (a: SpielAktion) => JSON.stringify(a).replace(/"spielerId":"[^"]*",?/, '')

function fall(n: number, erw: boolean, saat: number, ende: number): void {
  const sitz = (saat * 7) % n
  const kis = Array.from({ length: n }, (_, i) => (i === sitz ? erstelleSolideKi(erzeugeZufall(saat * 101 + 7)) : erstelleZufallsKi(erzeugeZufall(saat * 53 + i + 3))))
  let z = erstellePartie({ spielerzahl: n, erweiterung: erw, zufall: erzeugeZufall(saat) })
  const zeilen: string[] = []
  let ersteKarteVollendet = false
  let ersteKarteAbgewehrt = false
  let ersteKarte: SpielAktion | null = null
  let start: Spielzustand | null = null
  for (let schritt = 0; schritt <= ende; schritt += 1) {
    const e = entscheiderVon(z)!
    const a = kiWahl(z, kis[e.index])!
    // Zugbeginn der KI zurücksetzen
    if (e.index === sitz && z.zug.spielerIndex === sitz && z.zug.teilzug === 1 && z.zug.gespielteFarbkarten === 0 && z.zug.gespielteSonderkarten === 0 && z.schwebend === null) {
      zeilen.length = 0
      start = z
      ersteKarte = a.typ === 'ZugBeenden' ? null : a
      ersteKarteVollendet = a.typ !== 'ZugBeenden' && gruppen(durch(z, a, sitz), sitz) > gruppen(z, sitz)
      ersteKarteAbgewehrt = false
    }
    if (e.index !== sitz && a.typ === 'Reagieren' && a.farbenschutzId !== null && ersteKarte !== null && zeilen.length === 1) ersteKarteAbgewehrt = true
    zeilen.push(`${schritt}:${e.index === sitz ? 'KI' : 'G' + e.index} ${kurz(a)}`)
    z = anwendeAktion(z, a).zustand
  }
  log(`Saat ${saat} Schritt ${ende}: erste Karte vollendet unter Durchlassen: ${ersteKarteVollendet}; vom Gegner abgewehrt: ${ersteKarteAbgewehrt}`)
  log(`  ${zeilen.join(' | ')}`)
  const z0 = start!
  const bew = (x: Spielzustand) => bewerte(sichtFuer(x, sitz))
  const g0 = gruppen(z0, sitz)
  let best = -Infinity
  for (const v of ermittleAktionen(z0).filter((a) => a.typ !== 'ZugBeenden' && gruppen(durch(z0, a, sitz), sitz) > g0)) {
    const s1 = durch(z0, v, sitz)
    best = Math.max(best, bew(s1))
    if (ermittleEntscheider(s1) === sitz && s1.zug.spielerIndex === sitz && s1.zug.teilzug === 1 && s1.zug.abschnitt === 'Ausspielen') {
      for (const b of ermittleAktionen(s1)) if (b.typ !== 'ZugBeenden') best = Math.max(best, bew(durch(s1, b, sitz)))
    }
  }
  let p = z0
  const plan: string[] = []
  for (let i = 0; i < 10; i += 1) {
    const a = planeZug(sichtFuer(p, sitz), ermittleAktionen(p), erzeugeZufall(5)).aktion
    plan.push(kurz(a))
    if (a.typ === 'ZugBeenden') break
    p = durch(p, a, sitz)
  }
  log(`  Plan unter Durchlassen: ${plan.join(' ; ')}; Gruppen ${g0}->${gruppen(p, sitz)}; Bewertung ${bew(p).toFixed(4)} End ${berechneEndwertung(p).spieler[sitz].summe}; beste Vollendung ${best.toFixed(4)}; Abstand ${(bew(p) - best).toFixed(4)}`)
}

it('Diagnose TF-KI-014', () => {
  fall(2, true, 8851, 134)
  fall(2, true, 8855, 23)
  fall(3, false, 8905, 35)
  fall(3, true, 8951, 132)
  fall(4, true, 9055, 166)
}, 600_000)
