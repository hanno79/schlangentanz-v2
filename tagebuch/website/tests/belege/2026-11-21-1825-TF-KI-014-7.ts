// @vitest-environment node
// Prüferprobe K2 Iteration 3: Saat 8803, Schritt 124 bis 127 im Einzelnen. Liegt nur während des Laufs hier.
import { it } from 'vitest'
import { appendFileSync } from 'node:fs'
import { anwendeAktion, berechneEndwertung, ermittleAktionen, ermittleEntscheider, erstellePartie, erzeugeZufall, werteSchlangen } from '../src/engine'
import type { SpielAktion, Spielzustand } from '../src/engine'
import { kiWahl } from '../src/ki/schritt'
import { entscheiderVon, sichtFuer } from '../src/ki/sicht'
import { bewerte, neuerMerker } from '../src/ki/strategien/bewertung'
import { erstelleSolideKi } from '../src/ki/strategien/solideKi'
import { erstelleZufallsKi } from '../src/ki/strategien/zufallsKi'
import { vorauswahl } from '../src/ki/strategien/vorauswahl'
import { planeZug } from '../src/ki/strategien/zugsuche'
import type { Ki } from '../src/ki/strategien/strategie'

const LOG = process.env.PRUEFER_LOG ?? 'pruefer.log'
const log = (...t: unknown[]) => appendFileSync(LOG, t.join(' ') + '\n')
function durch(z: Spielzustand, a: SpielAktion, sitz: number): Spielzustand {
  let n = anwendeAktion(z, a).zustand
  for (let k = 0; k < 10; k++) {
    const e = ermittleEntscheider(n)
    if (n.schwebend === null || e === null || e === sitz) break
    n = anwendeAktion(n, { typ: 'Reagieren', spielerId: n.spieler[e].id, farbenschutzId: null }).zustand
  }
  return n
}
const summe = (z: Spielzustand, i: number) => berechneEndwertung(z).spieler[i].summe
const gruppen = (z: Spielzustand, i: number) => werteSchlangen(z.spieler[i].schlangen, z.erweiterung).schlangen.reduce((s, x) => s + x.gruppen.length, 0)
const kurz = (a: SpielAktion) => JSON.stringify(a).replace(/"spielerId":"[^"]*",?/, '')

it('Saat 8803', () => {
  const saat = 8803, n = 2, sitz = 1
  const kis: Ki[] = [erstelleZufallsKi(erzeugeZufall(saat * 53 + 0 + 3)), erstelleSolideKi(erzeugeZufall(saat * 101 + 7))]
  let z = erstellePartie({ spielerzahl: n, erweiterung: false, zufall: erzeugeZufall(saat) })
  for (let s = 0; s < 124; s++) z = anwendeAktion(z, kiWahl(z, kis[entscheiderVon(z)!.index])!).zustand
  const start = z
  const sicht = sichtFuer(start, sitz)
  const w0 = bewerte(sicht)
  const aktionen = ermittleAktionen(start)
  log(`Start Schritt 124: Bewertung ${w0}, Endwertung ${summe(start, sitz)}, Gruppen ${gruppen(start, sitz)}, Aktionen ${aktionen.length}`)
  const karten = aktionen.filter((a) => a.typ !== 'ZugBeenden')
  const { geordnet } = vorauswahl(sicht, karten, 16, neuerMerker())
  const rang = new Map(geordnet.map((a, i) => [JSON.stringify(a), i]))
  const zeilen = karten.map((a) => {
    const nn = durch(start, a, sitz)
    const zweite = ermittleAktionen(nn).filter((b) => b.typ !== 'ZugBeenden' && b.typ !== 'UeberhandAbwerfen')
    let best = { w: bewerte(sichtFuer(nn, sitz)), p: summe(nn, sitz), b: '' }
    for (const b of zweite) {
      const m = durch(nn, b, sitz)
      const w = bewerte(sichtFuer(m, sitz))
      if (w > best.w + 1e-12 || (Math.abs(w - best.w) <= 1e-12 && summe(m, sitz) > best.p)) best = { w, p: summe(m, sitz), b: kurz(b) }
    }
    return { a, w1: bewerte(sichtFuer(nn, sitz)), p1: summe(nn, sitz), g: gruppen(nn, sitz) > gruppen(start, sitz), best, rang: rang.get(JSON.stringify(a))! }
  }).sort((x, y) => y.best.w - x.best.w || y.best.p - x.best.p)
  for (const r of zeilen.slice(0, 14)) log(`  Plan ${r.best.w.toFixed(6)} / Endwertung ${r.best.p} | erste Karte ${r.w1.toFixed(6)} / ${r.p1}${r.g ? ' VOLLENDET' : ''} | Rang Vorauswahl ${r.rang} | ${kurz(r.a)} + ${r.best.b}`)
  const plan = planeZug(sicht, aktionen, erzeugeZufall(5))
  log(`planeZug: ${kurz(plan.aktion)}`)
  const g = zeilen.find((r) => JSON.stringify(r.a) === JSON.stringify(plan.aktion))!
  const v = zeilen.find((r) => r.g)!
  log(`Gewählt: Plan ${g.best.w.toPrecision(17)} Endwertung ${g.best.p}; beste Vollendung: Plan ${v.best.w.toPrecision(17)} Endwertung ${v.best.p}; Differenz ${(g.best.w - v.best.w).toExponential(3)}`)
}, 300_000)
