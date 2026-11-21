import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneZwischenstand, ermittleAktionen, ermittleEntscheider } from '../engine'
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

  it('O7 K3/A7.9: haeutung-punkte: Häutungen in deiner Schlange (0 Punkte) und in der von KI-Gegner 1 (Grün, Grün, Grün: 9 Punkte)', () => {
    const zustand = erzeugeSzenario('haeutung-punkte')
    expect(ermittleEntscheider(zustand)).toBe(0)
    expect(zustand.erweiterung).toBe(true)
    const farben = (spieler: number) => zustand.spieler[spieler].schlangen[0].karten.map((karte) => (karte.typ === 'Farbkarte' ? karte.farbe : karte.name))
    expect(farben(0)).toEqual(['Rot', 'Blau', 'Rot', 'Rot', 'Gelb'])
    expect(farben(1)).toEqual(['Grün', 'Grün', 'Grün', 'Blau', 'Rot'])
    expect(berechneZwischenstand(zustand, 'spieler-1').spieler.map((wertung) => wertung.summe)).toEqual([0, 9])
    const ziele = new Set(ermittleAktionen(zustand).flatMap((aktion) => (aktion.typ === 'SchlangenhaeutungSpielen' ? [aktion.schlangenId] : [])))
    expect([...ziele].sort()).toEqual(['schlange-1', 'schlange-2'])
    expect(zustand.spieler[1].hand.some((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Farbenschutz'), 'KI-Gegner 1 kann nicht abwehren').toBe(false)
  })
})
