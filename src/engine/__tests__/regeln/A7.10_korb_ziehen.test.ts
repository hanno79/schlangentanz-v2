import { describe, expect, it } from 'vitest'
import { zugInSicht } from '../../index'
import type { Spielzustand } from '../../index'
import type { Kartenwahl } from '../../testing/szenario'
import { meldeZugerweiterung } from '../../zuggrenzen'
import { verrateneHandkarten } from '../nachrechnen'
import { aktionen, ereignisseVom, fuehreAus, grund, hand, zugBeenden } from '../zugablauf_hilfen'
import { angeboteneBoni, handIds, KORB, korb, korbId, korbtisch, mitWirkung, spiele, spieleKarte, spieleKorb } from '../korb_hilfen'

/*
X6, Kriterium 3, Bonus 1 des Schlangenkorbs (A7.10): „Ziehe 3 zusätzliche
Karten und spiele sofort bis zu 2 davon aus.“ Nach D43 kommen die bis zu 2
Karten zusätzlich zu den Karten des Zuges, in beliebiger Art. Ein so gezogener
Verdoppler wirkt nicht, weil der Korb den Zug schon erweitert (A7.8, D47).
Liegen weniger als 3 Karten im Stapel, zieht man, was da ist; wer so die
letzte Karte zieht, spielt seinen Zug zu Ende und darf die gezogenen Karten
noch spielen, dann beginnt die Schlussrunde (A10, D57). Die gezogenen Karten
liegen verdeckt auf der Hand (B2).
*/

/** Spieler 1 hält Korb und Blau; oben auf dem Stapel liegen `oben`. */
function mitStapel(oben: Kartenwahl[], hand: Kartenwahl[] = [KORB, 'Blau']): Spielzustand {
  return korbtisch(hand).stapelOben(oben).zustand()
}

describe('A7.10/D43: Ziehe 3, spiele bis zu 2', () => {
  it('A7.10: der Spieler zieht die obersten 3 Karten auf die Hand; zwei Zusatzaktionen gelten genau für sie', () => {
    const start = mitStapel(['Rot', 'Gelb', 'Grün'])
    const oben = start.nachziehstapel.slice(0, 3).map((karte) => karte.id)
    const { zustand } = spieleKorb(start, 'ziehen')
    expect(hand(zustand, 0)).toEqual([...hand(start, 0).filter((id) => id !== korbId(start)), ...oben])
    expect(zustand.nachziehstapel).toHaveLength(start.nachziehstapel.length - 3)
    expect(zustand.zug.zusatzaktionen).toEqual([
      { quelle: 'Schlangenkorb', erlaubt: ['Farbkarte', 'Sonderkarte'], nurKarten: oben },
      { quelle: 'Schlangenkorb', erlaubt: ['Farbkarte', 'Sonderkarte'], nurKarten: oben },
    ])
    expect(zustand.zug.runde, 'D47: der Bonus erweitert den Zug').toEqual(['Schlangenkorb'])
  })

  it('D43: zusätzlich zur Farbkarte des Zuges gehen zwei gezogene Farbkarten; zusammen drei Farbkarten', () => {
    let zustand = spieleKorb(mitStapel(['Rot', 'Gelb', 'Grün']), 'ziehen').zustand
    const [blau] = handIds(zustand, 0, 'Blau')
    zustand = spiele(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: blau, ziel: { art: 'neueSchlange' } }).zustand
    zustand = spieleKarte(zustand, handIds(zustand, 0, 'Rot')[0]).zustand
    zustand = spieleKarte(zustand, handIds(zustand, 0, 'Gelb')[0]).zustand
    expect(zustand.zug).toMatchObject({ gespielteFarbkarten: 3, gespielteSonderkarten: 1 })
    expect(mitWirkung(zustand, handIds(zustand, 0, 'Grün')[0]), 'D43: bis zu 2, die dritte gezogene nicht mehr').toBe(false)
    // Keine Handkarte mehr, auch nicht wirkungslos; „Zug beenden“ ist angeboten. Die Risiko-Karte aus der Auslage (X5) ist keine Handkarte.
    expect(aktionen(zustand).filter((aktion) => 'karteId' in aktion), 'D43: keine weitere Karte').toEqual([])
    expect(aktionen(zustand).map((aktion) => aktion.typ)).toContain('ZugBeenden')
  })

  it('D43: in beliebiger Art: zwei gezogene Sonderkarten gehen beide, obwohl der Korb die Sonderkarte des Zuges war', () => {
    const start = korbtisch([KORB, 'Blau']).schlange(1, ['Grün', 'Grün']).stapelOben(['Schlangenblockade', 'Regenbogenschlange', 'Rot']).zustand()
    let zustand = spieleKorb(start, 'ziehen').zustand
    zustand = spieleKarte(zustand, handIds(zustand, 0, 'Schlangenblockade')[0]).zustand
    zustand = fuehreAus(zustand, aktionen(zustand, 'Reagieren')[0]).zustand
    zustand = spieleKarte(zustand, handIds(zustand, 0, 'Regenbogenschlange')[0]).zustand
    zustand = fuehreAus(zustand, aktionen(zustand, 'Reagieren')[0]).zustand
    expect(zustand.zug).toMatchObject({ gespielteSonderkarten: 3 })
  })

  it('D43: eine Karte, die schon vorher auf der Hand lag, belegt keine Zusatzaktion des Korbs', () => {
    let zustand = spieleKorb(mitStapel(['Rot', 'Gelb', 'Grün'], [KORB, 'Blau', 'Schlangenblockade']), 'ziehen').zustand
    zustand = spiele(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: handIds(zustand, 0, 'Blau')[0], ziel: { art: 'neueSchlange' } }).zustand
    const blockade = handIds(zustand, 0, 'Schlangenblockade')[0]
    expect(mitWirkung(zustand, blockade), 'D42, D43: die alte Blockade hat keinen Platz').toBe(false)
    expect(grund(zustand, { typ: 'BlockadeLegen', spielerId: 'spieler-1', karteId: blockade, schlangenId: zustand.spieler[0].schlangen[0].id, position: 0 })).toMatch(/D46/)
  })

  it('A7.8/D43/D47: ein so gezogener Verdoppler wirkt nicht; er lässt sich nur wirkungslos ablegen', () => {
    const zustand = spieleKorb(mitStapel(['Verdoppler', 'Rot', 'Gelb']), 'ziehen').zustand
    const [verdoppler] = handIds(zustand, 0, 'Verdoppler')
    expect(mitWirkung(zustand, verdoppler)).toBe(false)
    expect(aktionen(zustand, 'SonderkarteWirkungslosAblegen').map((aktion) => 'karteId' in aktion && aktion.karteId)).toEqual([verdoppler])
    expect(grund(zustand, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: verdoppler })).toMatch(/Schlangenkorbs.*D47/)
    const abgelegt = spiele(zustand, aktionen(zustand, 'SonderkarteWirkungslosAblegen')[0]).zustand
    const ende = fuehreAus(abgelegt, zugBeenden(abgelegt))
    expect(ereignisseVom(ende.ereignisse, 'ZugBegonnen'), 'A7.8: kein zweiter Zug').toEqual([{ typ: 'ZugBegonnen', spielerIndex: 1, teilzug: 1 }])
  })

  it('D43: die nicht gespielten gezogenen Karten bleiben auf der Hand; am Zugende baut der Spieler ab, was über 5 liegt (A5)', () => {
    const start = mitStapel(['Rot', 'Gelb', 'Grün'], [KORB, 'Blau', 'Blau', 'Blau', 'Blau'])
    let zustand = spieleKorb(start, 'ziehen').zustand
    expect(zustand.spieler[0].hand).toHaveLength(7)
    zustand = fuehreAus(zustand, zugBeenden(zustand)).zustand
    expect(zustand.zug.abschnitt).toBe('Abwerfen')
    expect(aktionen(zustand, 'UeberhandAbwerfen').map((aktion) => (aktion.typ === 'UeberhandAbwerfen' ? aktion.karteIds.length : 0))).toContain(2)
  })
})

describe('D43/D57/A10: weniger als 3 Karten im Stapel', () => {
  it('D43/A10: liegen nur 2 Karten im Stapel, zieht er beide; die Schlussrunde beginnt, er ist ihr Auslöser', () => {
    const start = korbtisch([KORB, 'Blau']).stapelOben(['Rot', 'Gelb']).stapelBehalten(2).zustand()
    const [rot, gelb] = start.nachziehstapel.map((karte) => karte.id)
    const { zustand, ereignisse } = spieleKorb(start, 'ziehen')
    expect(hand(zustand, 0)).toEqual(expect.arrayContaining([rot, gelb]))
    expect(ereignisseVom(ereignisse, 'SchlussrundeBegonnen')).toEqual([{ typ: 'SchlussrundeBegonnen', ausloeser: 0 }])
    expect(zustand.zug.zusatzaktionen[0].nurKarten).toEqual([rot, gelb])
  })

  it('D57: die eben gezogenen letzten Karten darf er im selben Zug noch spielen; danach zieht niemand mehr', () => {
    const start = korbtisch([KORB, 'Blau']).stapelOben(['Rot', 'Gelb']).stapelBehalten(2).zustand()
    const [rot, gelb] = start.nachziehstapel.map((karte) => karte.id)
    let zustand = spieleKorb(start, 'ziehen').zustand
    zustand = spiele(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: rot, ziel: { art: 'neueSchlange' } }).zustand
    zustand = spieleKarte(zustand, gelb).zustand
    expect(zustand.spieler[0].schlangen.flatMap((schlange) => schlange.karten.map((karte) => karte.id))).toEqual(expect.arrayContaining([rot, gelb]))
    const ende = fuehreAus(zustand, zugBeenden(zustand))
    expect(ereignisseVom(ende.ereignisse, 'KartenGezogen')).toEqual([])
    expect(ende.zustand.partiephase).toBe('Schlussrunde')
  })

  it('D43: in der Schlussrunde zieht der Bonus nichts; die Zusatzaktionen gelten dann für keine Karte', () => {
    const start = korbtisch([KORB, 'Blau']).schlussrunde(1).zustand()
    const { zustand, ereignisse } = spieleKorb(start, 'ziehen')
    expect(zustand.spieler[0].hand).toHaveLength(1)
    expect(zustand.zug.zusatzaktionen.map((zusatz) => zusatz.nurKarten)).toEqual([[], []])
    expect(ereignisseVom(ereignisse, 'KartenVersetzt')).toEqual([])
  })
})

describe('D47: Ziehe 3 ist eine Zugerweiterung', () => {
  it('D47: neben einer Comeback-Karte gibt es den Bonus nicht', () => {
    const start = korbtisch([KORB, 'Blau'])
      .schlange(0, ['Rot'])
      .aendere((zustand) => meldeZugerweiterung(zustand.zug, 'Comeback', [{ quelle: 'Comeback', erlaubt: ['Farbkarte', 'Sonderkarte'], nurKarten: null }]))
      .zustand()
    expect(angeboteneBoni(start)).toEqual(['tauschen'])
    expect(grund(start, { typ: 'SchlangenkorbSpielen', spielerId: 'spieler-1', karteId: korbId(start), bonus: { art: 'ziehen' } })).toMatch(/Comeback-Karte.*D47/)
  })

  it('A7.8/D47: im zweiten Zug nach einem Verdoppler gibt es ihn auch nicht', () => {
    const start = korbtisch([KORB, 'Blau']).schlange(0, ['Rot']).amZug(0, 2).zustand()
    expect(angeboteneBoni(start)).toEqual(['tauschen'])
    expect(grund(start, { typ: 'SchlangenkorbSpielen', spielerId: 'spieler-1', karteId: korbId(start), bonus: { art: 'ziehen' } })).toMatch(/Verdoppler.*D47/)
  })
})

describe('B2: die gezogenen Karten bleiben verdeckt', () => {
  it('B2: kein Ereignis nennt eine gezogene Karte; KartenVersetzt meldet sie ohne Id', () => {
    const start = mitStapel(['Rot', 'Gelb', 'Grün'])
    const { zustand, ereignisse } = spieleKorb(start, 'ziehen')
    expect(verrateneHandkarten(zustand, ereignisse)).toEqual([])
    const [versetzt] = ereignisseVom(ereignisse, 'KartenVersetzt')
    expect(versetzt.karten).toEqual(Array.from({ length: 3 }, () => ({ karteId: null, von: { ort: 'Nachziehstapel' }, nach: { ort: 'Hand', spielerIndex: 0 } })))
  })

  it('B2: Störprobe: liegen andere Karten oben, sieht der Gegner nach dem Bonus denselben Zug und dieselben Ereignisse', () => {
    const erste = mitStapel(['Rot', 'Gelb', 'Grün'])
    const zweite = mitStapel(['Violett', 'Braun', 'Schlangenblockade'])
    expect(korbId(erste)).toBe(korbId(zweite))
    const nachErste = spiele(erste, korb(erste, 'ziehen'))
    const nachZweite = spiele(zweite, korb(zweite, 'ziehen'))
    expect(nachErste.zustand.zug.zusatzaktionen).not.toEqual(nachZweite.zustand.zug.zusatzaktionen)
    expect(zugInSicht(nachErste.zustand, 1), 'B2: der Zug in der Sicht des Gegners').toEqual(zugInSicht(nachZweite.zustand, 1))
    expect(zugInSicht(nachErste.zustand, 1).zusatzaktionen.map((zusatz) => zusatz.nurKarten)).toEqual([[], []])
    expect(nachErste.ereignisse, 'B2: die Ereignisse').toEqual(nachZweite.ereignisse)
    expect(zugInSicht(nachErste.zustand, 0).zusatzaktionen[0].nurKarten, 'der Spieler selbst sieht seine Karten').toHaveLength(3)
  })
})
