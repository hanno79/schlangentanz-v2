import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Spielzustand } from '../../index'
import { zieheVomStapel } from '../../stapel'
import { baukasten } from '../../testing/szenario'
import { spieleTestkarte, testkarte, TESTKARTE } from '../rahmen_hilfen'
import { aktionen, ereignisseVom, farbkarte, fuehreAus, hand, zugBeenden } from '../zugablauf_hilfen'

/*
X3, Kriterium 4: Wer ausserhalb seines Zuges Karten bekommt und mehr als 5
hält, baut sie an seinem eigenen Zugende ab, nicht sofort und nicht am Zugende
des Spielers am Zug (A8.2 „am Ende des jeweils eigenen Zuges“, A5 Punkt 2).
Zu Beginn seines Zuges zieht er dann nichts (A5 „bis du wieder 5
Handkarten hast“). Die Karten kommen hier über die Test-Karte, die einem
Gegner zwei Karten vom Stapel gibt.
*/

afterEach(() => {
  vi.restoreAllMocks()
})

/** Spieler 1 am Zug mit der Test-Karte; sie gibt KI-Gegner 1 zwei Karten vom Stapel. */
function nachDemGeschenk(spielerzahl = 2, vorher: (bau: ReturnType<typeof baukasten>) => void = () => {}): Spielzustand {
  testkarte((zustand) => {
    zieheVomStapel(zustand, 1, 2)
  })
  const bau = baukasten({ spielerzahl, erweiterung: true }).hand(0, [TESTKARTE, 'Blau', 'Rot', 'Gelb', 'Grün']).hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
  for (let index = 2; index < spielerzahl; index += 1) bau.hand(index, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
  vorher(bau)
  return spieleTestkarte(bau.zustand()).zustand
}

describe('A8.2/A5: mehr als 5 Handkarten bei einem Spieler, der nicht am Zug ist', () => {
  it('A8.2: er hält sie bis zu seinem Zug; am Zugende des Spielers am Zug wirft nur dieser ab', () => {
    const geschenkt = nachDemGeschenk()
    expect(hand(geschenkt, 1)).toHaveLength(7)
    const ende = fuehreAus(geschenkt, zugBeenden(geschenkt))
    expect(ereignisseVom(ende.ereignisse, 'AbwerfenVerlangt'), 'A8.2: am fremden Zugende baut niemand ab').toEqual([])
    expect(hand(ende.zustand, 1), 'A5: zu Beginn seines Zuges zieht er nichts').toHaveLength(7)
    expect(ereignisseVom(ende.ereignisse, 'KartenGezogen').map((ereignis) => ereignis.spielerIndex)).toEqual([0])
    expect(ende.zustand.zug).toMatchObject({ spielerIndex: 1, abschnitt: 'Ausspielen' })
  })

  it('A8.2/A5: an seinem eigenen Zugende legt er die überzähligen Karten auf seinen Ablagestapel', () => {
    const geschenkt = nachDemGeschenk()
    const seinZug = fuehreAus(geschenkt, zugBeenden(geschenkt)).zustand
    const gespielt = fuehreAus(seinZug, farbkarte(seinZug)).zustand
    const ende = fuehreAus(gespielt, zugBeenden(gespielt))
    expect(ereignisseVom(ende.ereignisse, 'AbwerfenVerlangt')).toEqual([{ typ: 'AbwerfenVerlangt', spielerIndex: 1, anzahl: 1 }])
    const abwurf = aktionen(ende.zustand, 'UeberhandAbwerfen')[0]
    const danach = fuehreAus(ende.zustand, abwurf)
    expect(hand(danach.zustand, 1)).toHaveLength(5)
    expect(danach.zustand.zug.spielerIndex).toBe(0)
  })

  it('A8.2/A7.6: setzt er wegen einer Schlangengrube aus, hat er kein Zugende; er baut erst am Ende seines nächsten gespielten Zuges ab', () => {
    const geschenkt = nachDemGeschenk(3, (bau) => bau.grube(0, 1))
    const ende = fuehreAus(geschenkt, zugBeenden(geschenkt))
    expect(ereignisseVom(ende.ereignisse, 'Ausgesetzt').map((ereignis) => ereignis.spielerIndex)).toEqual([1])
    expect(ereignisseVom(ende.ereignisse, 'AbwerfenVerlangt')).toEqual([])
    expect(hand(ende.zustand, 1)).toHaveLength(7)
    expect(ende.zustand.zug.spielerIndex).toBe(2)
  })

  it('A8.2/A10: in der Schlussrunde baut er an seinem letzten Zugende ebenso ab', () => {
    const geschenkt = nachDemGeschenk(2, (bau) => bau.stapelBehalten(2))
    expect(geschenkt.partiephase, 'die zwei geschenkten Karten waren die letzten').toBe('Schlussrunde')
    const seinZug = fuehreAus(geschenkt, zugBeenden(geschenkt)).zustand
    const gespielt = fuehreAus(seinZug, farbkarte(seinZug)).zustand
    const ende = fuehreAus(gespielt, zugBeenden(gespielt))
    expect(ereignisseVom(ende.ereignisse, 'AbwerfenVerlangt')).toEqual([{ typ: 'AbwerfenVerlangt', spielerIndex: 1, anzahl: 1 }])
  })
})
