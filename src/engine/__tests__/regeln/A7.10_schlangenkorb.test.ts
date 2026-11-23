import { describe, expect, it } from 'vitest'
import { deserialisiere, erstellePartie, erzeugeZufall, pruefeAktion, serialisiere } from '../../index'
import type { SpielAktion } from '../../index'
import { alleSpielkarten } from '../../invarianten'
import { istPlatzhalter } from '../../karten/platzhalter'
import { KARTENREGISTER } from '../../karten/register'
import { aktionen, ereignisseVom, fuehreAus, grund, hand, zugBeenden } from '../zugablauf_hilfen'
import { angeboteneBoni, aufEinemAblagestapel, KORB, korb, korbId, korbtisch, mitWirkung, spiele, spieleKorb } from '../korb_hilfen'

/*
X6, A7.10: der Schlangenkorb des Glücks als Karte (Kriterien 1, 2 und 5). Er
liegt nur mit Erweiterung genau einmal im Deck, wird gezogen, liegt auf der
Hand und zählt zu den 5 Handkarten (D42). Sein Einsatz ist die Sonderkarte des
Zuges; daneben gibt es keine weitere, ausser über die Boni selbst (D42). Nach
der Nutzung kommt er aus dem Spiel und liegt nie auf einem Ablagestapel (A7.10,
D54). Die Boni prüfen die Dateien `A7.10_korb_*.test.ts`.
*/

const istKorb = (karte: { typ: string; name?: string }) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenkorb des Glücks'

describe('A7.10/D42: der Korb im Deck und auf der Hand (X6, Kriterium 1)', () => {
  it('A7.10/A4: nur mit Erweiterung liegt der Korb im Spiel, dann genau einmal', () => {
    for (const spielerzahl of [2, 3, 4]) {
      const ohne = erstellePartie({ spielerzahl, erweiterung: false, zufall: erzeugeZufall(spielerzahl) })
      const mit = erstellePartie({ spielerzahl, erweiterung: true, zufall: erzeugeZufall(spielerzahl) })
      expect(alleSpielkarten(ohne).filter(istKorb), `ohne Erweiterung, ${spielerzahl} Spieler`).toHaveLength(0)
      expect(alleSpielkarten(mit).filter(istKorb), `mit Erweiterung, ${spielerzahl} Spieler`).toHaveLength(1)
    }
  })

  it('A7.10: der Korb ist umgesetzt, kein Platzhalter mehr', () => {
    expect(istPlatzhalter(KARTENREGISTER['Schlangenkorb des Glücks'])).toBe(false)
  })

  it('D42: wer ihn beim Auffüllen zieht, hält ihn auf der Hand, und er zählt zu den 5 Handkarten', () => {
    const start = korbtisch(['Blau', 'Rot', 'Gelb', 'Grün']).stapelOben([KORB]).zustand()
    const gelegt = spiele(start, aktionen(start, 'FarbkarteLegen')[0]).zustand
    const ende = fuehreAus(gelegt, zugBeenden(gelegt)).zustand
    expect(ende.spieler[0].hand, 'D42: nach dem Auffüllen fünf Karten, der Korb eingeschlossen').toHaveLength(5)
    expect(ende.spieler[0].hand.filter(istKorb)).toHaveLength(1)
  })
})

describe('D42: der Einsatz ist die Sonderkarte des Zuges (X6, Kriterium 2)', () => {
  it('D42: nach dem Korb ist keine weitere Sonderkarte spielbar, auch nicht wirkungslos; die Farbkarte des Zuges bleibt', () => {
    const start = korbtisch([KORB, 'Schlangenblockade', 'Farbenschutz', 'Blau']).schlange(0, ['Rot', 'Gelb']).schlange(1, ['Grün']).zustand()
    const nach = spieleKorb(start, 'tauschen').zustand
    const blockade = nach.spieler[0].hand.find((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenblockade')!.id
    expect(mitWirkung(nach, blockade), 'D42: keine zweite Sonderkarte mit Wirkung').toBe(false)
    expect(aktionen(nach, 'SonderkarteWirkungslosAblegen'), 'D42: auch keine wirkungslos').toEqual([])
    expect(aktionen(nach, 'FarbkarteLegen').length, 'A5: die Farbkarte des Zuges geht weiter').toBeGreaterThan(0)
    expect(grund(nach, { typ: 'BlockadeLegen', spielerId: 'spieler-1', karteId: blockade, schlangenId: nach.spieler[1].schlangen[0].id, position: 0 })).toMatch(/D12/)
  })

  it('D42: ist schon eine andere Sonderkarte gespielt, gibt es keinen Korb mehr in diesem Zug', () => {
    const start = korbtisch([KORB, 'Schlangenblockade', 'Blau']).schlange(1, ['Grün']).zustand()
    const blockade = aktionen(start, 'BlockadeLegen')[0]
    const nach = spiele(start, blockade).zustand
    expect(angeboteneBoni(nach)).toEqual([])
    expect(grund(nach, { typ: 'SchlangenkorbSpielen', spielerId: 'spieler-1', karteId: korbId(nach), bonus: { art: 'aktionen' } })).toMatch(/D12/)
  })

  it('D42: die vier Boni sind die vollständige Liste; wo alle passen, bietet die Engine genau sie an', () => {
    const start = korbtisch([KORB, 'Blau']).schlange(0, ['Rot', 'Schlangenblockade', 'Gelb']).schlange(1, ['Grün', 'Regenbogenschlange']).zustand()
    expect(angeboteneBoni(start)).toEqual(['ziehen', 'tauschen', 'entfernen', 'aktionen'])
  })

  it('D42/U12: einen fünften Bonus gibt es nicht; die Engine lehnt ihn mit Grund ab', () => {
    const start = korbtisch([KORB, 'Blau']).zustand()
    const fremd = { typ: 'SchlangenkorbSpielen', spielerId: 'spieler-1', karteId: korbId(start), bonus: { art: 'verdoppeln' } } as unknown as SpielAktion
    expect(pruefeAktion(start, fremd)).toEqual({ erlaubt: false, grund: 'Ungültige Aktion SchlangenkorbSpielen: Feld bonus ist ungültig.' })
  })

  it('A5/D12: der Korb zählt als Karte des Zuges; danach darf der Spieler den Zug beenden', () => {
    const start = korbtisch([KORB, 'Blau']).zustand()
    expect(aktionen(start, 'ZugBeenden'), 'A5: vor dem Korb ist keine Karte gespielt').toEqual([])
    const nach = spieleKorb(start, 'aktionen').zustand
    expect(aktionen(nach, 'ZugBeenden')).toHaveLength(1)
    expect(nach.zug).toMatchObject({ gespielteSonderkarten: 1 })
  })
})

describe('A7.10/D54: nach der Nutzung aus dem Spiel (X6, Kriterium 5)', () => {
  it.each(['ziehen', 'tauschen', 'entfernen', 'aktionen'] as const)('A7.10/D54: nach dem Bonus „%s“ liegt der Korb aus dem Spiel, auf keinem Ablagestapel', (art) => {
    const start = korbtisch([KORB, 'Blau']).schlange(0, ['Rot', 'Schlangenblockade', 'Gelb']).zustand()
    const id = korbId(start)
    const { zustand, ereignisse } = spieleKorb(start, art)
    expect(zustand.ausDemSpiel.map((karte) => karte.id)).toEqual([id])
    expect(aufEinemAblagestapel(zustand, id), 'D54: nie auf einem Ablagestapel').toBe(false)
    expect(hand(zustand, 0)).not.toContain(id)
    expect(ereignisseVom(ereignisse, 'KarteGespielt')).toEqual([{ typ: 'KarteGespielt', spielerIndex: 0, karteId: id, aktion: 'SchlangenkorbSpielen', nach: { ort: 'AusDemSpiel' } }])
  })

  it('D13/D54: hat der Korb kein mögliches Ziel, wird er wirkungslos abgelegt und kommt trotzdem aus dem Spiel, nicht auf den Ablagestapel', () => {
    // A7.8, D47: im zweiten Zug nach einem Verdoppler kein zugerweiternder Bonus; ohne Schlange und Farbkarte auch kein anderer.
    const start = korbtisch([KORB, 'Farbenschutz']).amZug(0, 2).zustand()
    const id = korbId(start)
    expect(angeboteneBoni(start)).toEqual([])
    const ablegen = aktionen(start, 'SonderkarteWirkungslosAblegen').find((aktion) => 'karteId' in aktion && aktion.karteId === id)!
    const { zustand, ereignisse } = spiele(start, ablegen)
    expect(zustand.ausDemSpiel.map((karte) => karte.id)).toEqual([id])
    expect(aufEinemAblagestapel(zustand, id)).toBe(false)
    expect(ereignisseVom(ereignisse, 'KarteGespielt')[0].nach).toEqual({ ort: 'AusDemSpiel' })
  })

  it('A7.10: aus dem Spiel ist aus dem Spiel; ein späterer Zug kennt keinen Korb mehr', () => {
    const start = korbtisch([KORB, 'Blau']).zustand()
    const nach = spieleKorb(start, 'aktionen').zustand
    const ende = fuehreAus(nach, zugBeenden(nach)).zustand
    expect(alleSpielkarten(ende).filter(istKorb).map((karte) => karte.id)).toEqual(ende.ausDemSpiel.map((karte) => karte.id))
  })
})

describe('D36: der Korb zählt als ausgespielte Sonderkarte (X2c, Hinweis aus der Prüfung)', () => {
  it('D36: mit Wirkung gespielt, steht der Korb bei den ausgespielten Sonderkarten', () => {
    const start = korbtisch([KORB, 'Blau']).zustand()
    expect(spieleKorb(start, 'aktionen').zustand.spieler[0].ausgespielteSonderkarten).toEqual(['Schlangenkorb des Glücks'])
  })

  it('D36: auch wirkungslos abgelegt zählt er als ausgespielt', () => {
    const start = korbtisch([KORB, 'Farbenschutz']).amZug(0, 2).zustand()
    const ablegen = aktionen(start, 'SonderkarteWirkungslosAblegen').find((aktion) => 'karteId' in aktion && aktion.karteId === korbId(start))!
    expect(spiele(start, ablegen).zustand.spieler[0].ausgespielteSonderkarten).toEqual(['Schlangenkorb des Glücks'])
  })
})

describe('A4: Speichern und Laden mitten im Zug nach dem Korb', () => {
  it('A4: nach „Ziehe 3“ übersteht der Zug mit seinen Zusatzaktionen Speichern und Laden', () => {
    const start = korbtisch([KORB, 'Blau']).zustand()
    const nach = spieleKorb(start, 'ziehen').zustand
    expect(nach.zug.zusatzaktionen).toHaveLength(2)
    expect(deserialisiere(serialisiere(nach))).toEqual(nach)
  })

  it('A4: die Aktion des Korbs nennt ihren Bonus; dieselbe Aktion zweimal geht nicht, der Korb ist dann aus dem Spiel', () => {
    const start = korbtisch([KORB, 'Blau']).zustand()
    const aktion = korb(start, 'aktionen')
    const nach = spiele(start, aktion).zustand
    expect(grund(nach, aktion)).toMatch(/liegt nicht auf der Hand/)
  })
})
