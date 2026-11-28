// @vitest-environment node
import { writeFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, erstellePartie, erzeugeZufall, pruefeInvarianten } from '../../engine'
import type { SpielAktion } from '../../engine'
import { waehleFuer } from '../schritt'
import { entscheiderVon } from '../sicht'
import { STRATEGIEN } from '../strategien'
import type { Ki } from '../strategien/strategie'
import { setztAuslageEin } from '../strategien/eroeffnung'

// Prüfer K4 Iteration 3: Spiegelpartien zu zweit, KI mit Erstzug-Regel gegen dieselbe KI,
// die im ersten Zug weder Comeback-Karte noch Risiko-Karte noch Schlangenkorb einsetzt.
const BASIS = Number(process.env.PRUEF_BASIS ?? 5_100_000)
const ANZAHL = Number(process.env.PRUEF_ANZAHL ?? 5)
const AUS = process.env.PRUEF_AUS ?? 'spiegel.json'

function kiSaat(saat: number, sitz: number, rolle: number): number {
  return (Math.imul(saat ^ 0x5bd1e995, 0x27d4eb2d) + sitz * 7919 + rolle * 104729 + 13) >>> 0
}

/** Spielt eine Partie; der Sitz `regelSitz` spielt die KI wie sie ist, der andere im ersten Zug ohne die drei Karten. */
function partie(saat: number, regelSitz: number) {
  let zustand = erstellePartie({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(saat) })
  const kis: Ki[] = [0, 1].map((sitz) => STRATEGIEN.solideKi(erzeugeZufall(kiSaat(saat, sitz, sitz === regelSitz ? 1 : 2))))
  const fertig = new Set<number>()
  const eingesetzt = [0, 0]
  let schritte = 0
  for (;;) {
    const verletzt = pruefeInvarianten(zustand).filter((b) => b.verletzt)
    if (verletzt.length > 0) throw new Error(`Invariante Saat ${saat}: ${verletzt.map((b) => b.name).join(',')}`)
    const entscheider = entscheiderVon(zustand)
    if (entscheider === null) break
    schritte += 1
    if (schritte > 5000) throw new Error(`Schrittgrenze Saat ${saat}`)
    const am = zustand.zug.spielerIndex
    const sitz = entscheider.index
    const imErsten = sitz === am && !fertig.has(am)
    const inner = kis[sitz]
    const ki: Ki =
      imErsten && sitz !== regelSitz
        ? {
            name: 'Kontrolle',
            waehle: (s, a) => {
              const g = a.filter((x) => !setztAuslageEin(x))
              return inner.waehle(s, g.length > 0 ? g : a)
            },
          }
        : inner
    const aktion: SpielAktion = waehleFuer(zustand, entscheider, ki)
    if (imErsten && setztAuslageEin(aktion)) eingesetzt[sitz] += 1
    const nachher = anwendeAktion(zustand, aktion).zustand
    if (imErsten) {
      const neuerZug =
        nachher.zug.spielerIndex !== am ||
        ((aktion.typ === 'ZugBeenden' || aktion.typ === 'UeberhandAbwerfen') && nachher.zug.teilzug === 1 && nachher.zug.abschnitt === 'Ausspielen' && nachher.zug.verwendet.length === 0)
      if (neuerZug) fertig.add(am)
    }
    zustand = nachher
  }
  const wertung = berechneEndwertung(zustand)
  const sieger = wertung.spieler.flatMap((sp, i) => (wertung.gewinner.includes(sp.spielerId) ? [i] : []))
  const punkte = wertung.spieler.map((sp) => sp.summe)
  const ergebnis = sieger.includes(regelSitz) ? (sieger.length > 1 ? 0.5 : 1) : 0
  return { saat, regelSitz, ergebnis, sieger, punkte, eingesetzt, schritte }
}

it('Spiegelpartien', () => {
  const partien = []
  for (let n = 0; n < ANZAHL; n += 1) {
    const saat = BASIS + n
    partien.push(partie(saat, 0), partie(saat, 1))
  }
  writeFileSync(AUS, JSON.stringify(partien))
  const summe = partien.reduce((s, p) => s + p.ergebnis, 0)
  console.log(`Saaten ${BASIS}..${BASIS + ANZAHL - 1}: ${partien.length} Partien, Regel-KI ${summe} Punkte, ${((100 * summe) / partien.length).toFixed(2)} %`)
  expect(partien.length).toBe(2 * ANZAHL)
}, 7_200_000)
