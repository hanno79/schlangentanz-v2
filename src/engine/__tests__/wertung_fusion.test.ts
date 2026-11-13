import { describe, expect, it } from 'vitest'
import { berechneFarbgruppenPunkte } from '../index'
import { baukasten } from '../testing/szenario'

/*
E1 legt die beiden Karten unter einer Farbenfusion in den Zustand (A7.7) und
streicht die gespeicherte Punktsumme. Die Wertung liest die Punkte deshalb jetzt
unter der Fusion ab. Die vollständigen Rechenbeispiele bringt E10.
*/
describe('A7.7/A11: die Farbenfusion bringt die Punkte der beiden Karten darunter', () => {
  it('A11 Beispiel 2: Blau, Blau, Blau+Fusion+Blau, Violett, Violett ergibt 6 Punkte', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .schlange(0, ['Blau', 'Blau', { fusion: ['Blau', 'Blau'] }, 'Violett', 'Violett'])
      .zustand()
    expect(berechneFarbgruppenPunkte(zustand.spieler[0].schlangen[0]).gesamtPunkte).toBe(6)
  })

  it('A7.7: Rot, Rot und eine Fusion aus zwei grünen Karten bringen 1 + 1 + 6 = 8 Punkte', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .schlange(0, ['Rot', 'Rot', { fusion: ['Grün', 'Grün'] }])
      .zustand()
    expect(berechneFarbgruppenPunkte(zustand.spieler[0].schlangen[0]).gesamtPunkte).toBe(8)
  })
})
