// @vitest-environment node
import { appendFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, erstellePartie, erzeugeZufall, pruefeInvarianten } from '../../engine'
import type { SpielAktion } from '../../engine'
import { waehleFuer } from '../schritt'
import { entscheiderVon } from '../sicht'
import type { Sicht } from '../sicht'
import { setztAuslageEin } from './eroeffnung'
import { STRATEGIEN } from './index'
import type { Ki } from './strategie'

/*
Prüfer K4, Iteration 2: eigene Spiegelpartien zu Kriterium 2. A = solide KI wie geliefert,
B = dieselbe KI, der im ersten Zug (gemessen am echten Zugverlauf, nicht an der Sicht)
Comeback, Risiko-Karte und Schlangenkorb nicht angeboten werden. Je Saat zwei Partien
mit vertauschten Sitzen. Temporäre Probe, wird nach der Messung gelöscht.
*/

const ERSTE = Number(process.env.P2_ERSTE ?? '0')
const ANZAHL = Number(process.env.P2_ANZAHL ?? '0')
const AUSGABE = process.env.P2_AUSGABE ?? ''

function spiele(saat: number, aSitz: number): { a: number; erstA: number; erstB: number; schritte: number } {
  let zustand = erstellePartie({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(saat) })
  const erster = [true, true]
  const gesehen = [false, false]
  const genutzt = [0, 0]
  const kis: Ki[] = [0, 1].map((sitz) => {
    const innen = STRATEGIEN.solideKi(erzeugeZufall((saat * 31 + sitz * 7 + 12_345) >>> 0))
    if (sitz === aSitz) return innen
    return {
      name: 'ohne-erstzug',
      waehle(sicht: Sicht, aktionen: readonly SpielAktion[]) {
        if (erster[sitz] && sicht.zug.spielerIndex === sitz) {
          const rest = aktionen.filter((aktion) => !setztAuslageEin(aktion))
          if (rest.length > 0) return innen.waehle(sicht, rest)
        }
        return innen.waehle(sicht, aktionen)
      },
    }
  })
  for (let schritt = 0; schritt < 5000; schritt += 1) {
    const verletzt = pruefeInvarianten(zustand).filter((befund) => befund.verletzt)
    if (verletzt.length > 0) throw new Error(`Invariante Saat ${saat}: ${verletzt.map((b) => b.name).join(', ')}`)
    const am = zustand.zug.spielerIndex
    if (zustand.partiephase !== 'Beendet') {
      if (gesehen[1 - am]) erster[1 - am] = false
      gesehen[am] = true
    }
    const entscheider = entscheiderVon(zustand)
    if (entscheider === null) {
      const wertung = berechneEndwertung(zustand)
      const sieger = wertung.spieler.flatMap((spieler, sitz) => (wertung.gewinner.includes(spieler.spielerId) ? [sitz] : []))
      const a = sieger.includes(aSitz) ? (sieger.length === 2 ? 0.5 : 1) : 0
      return { a, erstA: genutzt[aSitz], erstB: genutzt[1 - aSitz], schritte: schritt }
    }
    const aktion = waehleFuer(zustand, entscheider, kis[entscheider.index])
    if (erster[entscheider.index] && am === entscheider.index && setztAuslageEin(aktion)) genutzt[entscheider.index] += 1
    zustand = anwendeAktion(zustand, aktion).zustand
  }
  throw new Error(`Saat ${saat} endet nicht`)
}

describe('Prüfer K4 Iteration 2: Spiegelpartien', () => {
  it('spielt die Saaten', () => {
    expect(AUSGABE, 'P2_AUSGABE fehlt').not.toBe('')
    for (let saat = ERSTE; saat < ERSTE + ANZAHL; saat += 1) {
      const zeilen = [0, 1].map((aSitz) => ({ saat, aSitz, ...spiele(saat, aSitz) }))
      appendFileSync(AUSGABE, zeilen.map((zeile) => JSON.stringify(zeile)).join('\n') + '\n')
    }
  }, 6 * 3600_000)
})
