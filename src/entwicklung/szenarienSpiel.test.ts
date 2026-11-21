import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider } from '../engine'
import type { Spielzustand } from '../engine'
import { erzeugeZufall } from '../engine/testing/zufall'
import { findeSzenario } from './szenarien'

/*
Szenarien für `/spiel?szenario=` (O3, Kriterium 7): Sie zeigen, was die
Partie-Steuerung trägt, bevor O5 und O6 die Bedienung bauen.
*/

function erzeuge(name: string): Spielzustand {
  const szenario = findeSzenario(name)
  if (szenario === undefined) throw new Error(`Szenario ${name} fehlt`)
  return szenario.erzeuge()
}

describe('O3: Szenarien für den Spieltisch', () => {
  it('O3/A6, D33: angriff-auf-dich: die Schlangengrube von KI-Gegner 1 schwebt über dir, du hältst einen Farbenschutz', () => {
    const zustand = erzeuge('angriff-auf-dich')
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect(zustand.schwebend?.karte.name).toBe('Schlangengrube')
    expect(zustand.schwebend?.aktion.spielerId).toBe('spieler-2')
    expect(ermittleAktionen(zustand).map((aktion) => (aktion.typ === 'Reagieren' ? aktion.farbenschutzId !== null : null))).toEqual([true, false])
  })

  it('O3/A10: schlussrunde-ohne-dich: du hast deinen letzten Zug gespielt, die drei KI-Gegner spielen die Partie zu Ende', () => {
    const zufall = erzeugeZufall(5)
    let zustand = erzeuge('schlussrunde-ohne-dich')
    expect(zustand.spieler).toHaveLength(4)
    expect(zustand.partiephase).toBe('Schlussrunde')
    for (let schritt = 0; schritt < 200 && zustand.partiephase !== 'Beendet'; schritt += 1) {
      const entscheider = ermittleEntscheider(zustand)
      expect(zustand.spieler[entscheider!].steuerung, `Schritt ${schritt}: es entscheidet ein Mensch`).toBe('KI')
      const aktionen = ermittleAktionen(zustand)
      zustand = anwendeAktion(zustand, aktionen[Math.floor(zufall() * aktionen.length)]).zustand
    }
    expect(zustand.partiephase).toBe('Beendet')
  })
})
