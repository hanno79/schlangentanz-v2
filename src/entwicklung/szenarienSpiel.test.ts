import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider } from '../engine'
import { erzeugeZufall } from '../engine/testing/zufall'
import { erzeugeSzenario } from './szenarien'

/*
Szenarien für `/spiel?szenario=` (O3, Kriterium 7): Sie zeigen, was die
Partie-Steuerung trägt, bevor O5 und O6 die Bedienung bauen.
*/

describe('O3: Szenarien für den Spieltisch', () => {
  it('O3/A6, D33: angriff-auf-dich: die Schlangengrube von KI-Gegner 1 schwebt über dir, du hältst einen Farbenschutz', () => {
    const zustand = erzeugeSzenario('angriff-auf-dich')
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect(zustand.schwebend?.karte.name).toBe('Schlangengrube')
    expect(zustand.schwebend?.aktion.spielerId).toBe('spieler-2')
    expect(ermittleAktionen(zustand).map((aktion) => (aktion.typ === 'Reagieren' ? aktion.farbenschutzId !== null : null))).toEqual([true, false])
  })

  it('O3/A10: schlussrunde-ohne-dich: du hast deinen letzten Zug gespielt, die drei KI-Gegner spielen die Partie zu Ende', () => {
    const zufall = erzeugeZufall(5)
    let zustand = erzeugeSzenario('schlussrunde-ohne-dich')
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

  it('O5 K8/A5: zu-viele-handkarten: dein Zug ist beendet, du hältst 7 Karten und wählst 2 zum Ablegen', () => {
    const zustand = erzeugeSzenario('zu-viele-handkarten')
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect(zustand.zug.abschnitt).toBe('Abwerfen')
    expect(zustand.spieler[0].hand).toHaveLength(7)
    const aktionen = ermittleAktionen(zustand)
    expect(aktionen).toHaveLength(21)
    expect(aktionen.every((aktion) => aktion.typ === 'UeberhandAbwerfen' && aktion.karteIds.length === 2)).toBe(true)
  })

  it('O6 K2/D33: angriff-ohne-schutz: Schlangenfrass auf dein Violett, du kannst nur durchlassen', () => {
    const zustand = erzeugeSzenario('angriff-ohne-schutz')
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect(zustand.spieler[0].schlangen[0].karten[0].id).toBe('violett-01')
    expect(ermittleAktionen(zustand)).toEqual([{ typ: 'Reagieren', spielerId: 'spieler-1', farbenschutzId: null }])
  })

  it('O6 K4/A7.6: grube-vor-dir: nach dem Zug von KI-Gegner 1 setzt du aus', () => {
    let zustand = erzeugeSzenario('grube-vor-dir')
    expect(zustand.ausliegendeGruben.map((grube) => grube.vor)).toEqual([0])
    zustand = anwendeAktion(zustand, ermittleAktionen(zustand).find((aktion) => aktion.typ === 'FarbkarteLegen')!).zustand
    const { ereignisse } = anwendeAktion(zustand, ermittleAktionen(zustand).find((aktion) => aktion.typ === 'ZugBeenden')!)
    expect(ereignisse.some((ereignis) => ereignis.typ === 'Ausgesetzt' && ereignis.spielerIndex === 0)).toBe(true)
  })

  it.each([
    ['ki-angriff-mit-schutz', 2],
    ['ki-angriff-ohne-schutz', 1],
  ])('O6 K5/D33: %s: KI-Gegner 2 entscheidet und hat %i Möglichkeiten', (name, anzahl) => {
    const zustand = erzeugeSzenario(name)
    expect(ermittleEntscheider(zustand)).toBe(2)
    expect(ermittleAktionen(zustand)).toHaveLength(anzahl)
  })
})
