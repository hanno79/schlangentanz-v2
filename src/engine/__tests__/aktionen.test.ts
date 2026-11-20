import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  AKTIONSTYPEN,
  anwendeAktion,
  erstellePartie,
  ermittleAktionen,
  ermittleEntscheider,
  pruefeAktion,
  serialisiere,
} from '../index'
import type { SpielAktion, Spielzustand } from '../index'
import { KARTENREGISTER, definitionFuer } from '../karten/register'
import { baukasten } from '../testing/szenario'
import { erzeugeZufall } from '../testing/zufall'

function start(spielerzahl = 2, erweiterung = true): Spielzustand {
  return erstellePartie({ spielerzahl, erweiterung, zufall: erzeugeZufall(21) })
}

function grund(zustand: Spielzustand, aktion: unknown): string {
  const ergebnis = pruefeAktion(zustand, aktion as SpielAktion)
  if (ergebnis.erlaubt) throw new Error(`Testaufbau: ${JSON.stringify(aktion)} ist erlaubt`)
  return ergebnis.grund
}

/** Ein Tisch, an dem Spieler 1 bestimmte Karten hält. */
function mitHand(karten: Parameters<ReturnType<typeof baukasten>['hand']>[1]): Spielzustand {
  return baukasten({ spielerzahl: 2, erweiterung: true }).hand(0, karten).haendeAuffuellen().zustand()
}

describe('A5/A6/A7: die Aktionstypen', () => {
  it('A5/A6/A7: alle Aktionstypen der Basis-Engine sind festgelegt, auch die der späteren Tasks', () => {
    expect([...AKTIONSTYPEN]).toEqual([
      'FarbkarteLegen',
      'RegenbogenschlangeLegen',
      'BlockadeLegen',
      'FusionLegen',
      'FarbendiebSpielen',
      'SchlangenfrassSpielen',
      'SchlangengrubeSpielen',
      'VerdopplerSpielen',
      'SchlangenhaeutungSpielen',
      'SonderkarteWirkungslosAblegen',
      'ZugBeenden',
      'UeberhandAbwerfen',
      'Reagieren',
    ])
  })

  it('A7.9: die Schlangenhäutung hat einen eigenen Aktionstyp', () => {
    expect(KARTENREGISTER['Schlangenhäutung'].aktionstyp).toBe('SchlangenhaeutungSpielen')
  })
})

describe('A1/A7: das Kartenregister', () => {
  const ARTEN = [
    ['Farbkarte', 'farbkarte', 'FarbkarteLegen'],
    ['Farbenschutz', 'farbenschutz', null],
    ['Regenbogenschlange', 'regenbogenschlange', 'RegenbogenschlangeLegen'],
    ['Schlangenfrass', 'schlangenfrass', 'SchlangenfrassSpielen'],
    ['Schlangenblockade', 'schlangenblockade', 'BlockadeLegen'],
    ['Farbendieb', 'farbendieb', 'FarbendiebSpielen'],
    ['Schlangengrube', 'schlangengrube', 'SchlangengrubeSpielen'],
    ['Farbenfusion', 'farbenfusion', 'FusionLegen'],
    ['Verdoppler', 'verdoppler', 'VerdopplerSpielen'],
    ['Schlangenhäutung', 'schlangenhaeutung', 'SchlangenhaeutungSpielen'],
    ['Schlangenkorb des Glücks', 'schlangenkorb', null],
  ] as const

  it('A1: das Register hat je Kartenart genau einen Eintrag', () => {
    expect(Object.keys(KARTENREGISTER).sort()).toEqual(ARTEN.map(([kartenart]) => kartenart).sort())
  })

  it.each(ARTEN)('A7: %s steht in karten/%s.ts und wird mit %s gespielt', (kartenart, datei, aktionstyp) => {
    expect(existsSync(resolve(__dirname, `../karten/${datei}.ts`)), `A7: karten/${datei}.ts fehlt`).toBe(true)
    expect(KARTENREGISTER[kartenart].art).toBe(kartenart)
    expect(KARTENREGISTER[kartenart].aktionstyp).toBe(aktionstyp)
  })

  it('A7: definitionFuer findet zu jeder Karte ihren Eintrag', () => {
    const zustand = start(4, true)
    for (const karte of zustand.nachziehstapel) {
      const definition = definitionFuer(karte)
      expect(definition.art).toBe(karte.typ === 'Farbkarte' ? 'Farbkarte' : karte.name)
    }
  })

  // Die Farbkarte setzt E2 um (A5), die übrigen Karten ihre Tasks E3 bis E9 und X6.
  it.each(ARTEN.filter(([kartenart]) => kartenart !== 'Farbkarte'))('D13: %s ist noch ein Platzhalter ohne Ziele, der mit deutschem Grund ablehnt', (kartenart) => {
    const zustand = start()
    const definition = KARTENREGISTER[kartenart]
    const karte = zustand.spieler[0].hand[0]
    expect(definition.ziele(zustand, 0, karte)).toEqual([])
    expect(definition.betroffene(zustand, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: karte.id })).toEqual([])
    const ablehnung = definition.pruefe(zustand, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: karte.id })
    expect(ablehnung).toMatch(new RegExp(`${kartenart} ist noch nicht umgesetzt \\(kommt mit [EX]\\d`))
    expect(() => definition.wirke(zustand, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: karte.id }, [])).toThrow(
      /noch nicht umgesetzt/,
    )
  })
})

describe('A5/A6: wer entscheidet', () => {
  it('A5: ohne schwebende Karte entscheidet der Spieler am Zug', () => {
    expect(ermittleEntscheider(start())).toBe(0)
    expect(ermittleEntscheider(baukasten({ spielerzahl: 3, erweiterung: false }).amZug(2).zustand())).toBe(2)
  })

  it('A6: schwebt eine Karte, entscheidet der nächste Betroffene; ohne Betroffene der Angreifer', () => {
    const angriff = baukasten({ spielerzahl: 3, erweiterung: false })
      .schwebend(0, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-3' }), [2])
      .zustand()
    expect(ermittleEntscheider(angriff)).toBe(2)
    const ohne = baukasten({ spielerzahl: 3, erweiterung: false })
      .schwebend(1, 'Verdoppler', (karteId, spielerId) => ({ typ: 'VerdopplerSpielen', spielerId, karteId }), [])
      .amZug(1)
      .zustand()
    expect(ermittleEntscheider(ohne)).toBe(1)
  })

  it('A10: nach Spielende entscheidet niemand', () => {
    expect(ermittleEntscheider(baukasten({ spielerzahl: 2, erweiterung: false }).beendet(0).zustand())).toBeNull()
  })
})

describe('A5/B2: Aufzählen, Prüfen und Anwenden', () => {
  it('A5: zu Beginn zählt die Engine nur Aktionen des Spielers am Zug auf, und noch kein „Zug beenden“ (D12)', () => {
    for (const spielerzahl of [2, 3, 4]) {
      for (const erweiterung of [false, true]) {
        const angeboten = ermittleAktionen(start(spielerzahl, erweiterung))
        expect(angeboten.length).toBeGreaterThan(0)
        expect(angeboten.every((aktion) => aktion.spielerId === 'spieler-1' && aktion.typ !== 'ZugBeenden')).toBe(true)
      }
    }
  })

  it('A10: nach Spielende gibt es keine Aktion und jede wird abgelehnt', () => {
    const ende = baukasten({ spielerzahl: 2, erweiterung: false }).beendet(1).zustand()
    expect(ermittleAktionen(ende)).toEqual([])
    expect(grund(ende, { typ: 'ZugBeenden', spielerId: 'spieler-1' })).toMatch(/Partie ist beendet/)
  })

  it('B2: eine Aktion in falscher Form wird mit Grund abgelehnt', () => {
    const zustand = start()
    expect(grund(zustand, null)).toMatch(/kein Objekt/)
    expect(grund(zustand, { typ: 'Zaubern', spielerId: 'spieler-1' })).toMatch(/Unbekannter Aktionstyp „Zaubern“/)
    expect(grund(zustand, { typ: 'BlockadeLegen', spielerId: 'spieler-1', karteId: 'x', schlangenId: 's' })).toMatch(/position/)
    expect(grund(zustand, { typ: 'ZugBeenden', spielerId: 'spieler-1', extra: 1 })).toMatch(/extra/)
  })

  it('B2: ein unbekannter Spieler oder ein Spieler, der nicht am Zug ist, wird abgelehnt', () => {
    const zustand = start()
    expect(grund(zustand, { typ: 'ZugBeenden', spielerId: 'niemand' })).toMatch(/Unbekannter Spieler „niemand“/)
    expect(grund(zustand, { typ: 'ZugBeenden', spielerId: 'spieler-2' })).toMatch(/KI-Gegner 1 ist nicht am Zug/)
  })

  it('A6: während eine Karte schwebt, ist nur Reagieren dran, und nur für den, der entscheidet', () => {
    const zustand = baukasten({ spielerzahl: 3, erweiterung: false })
      .schwebend(0, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-3' }), [2])
      .zustand()
    expect(grund(zustand, { typ: 'ZugBeenden', spielerId: 'spieler-1' })).toMatch(/Schlangengrube schwebt/)
    expect(grund(zustand, { typ: 'Reagieren', spielerId: 'spieler-2', farbenschutzId: null })).toMatch(/entscheidet gerade nicht/)
    expect(grund(zustand, { typ: 'Reagieren', spielerId: 'spieler-3', farbenschutzId: null })).toMatch(/kommt mit E4/)
    expect(grund(start(), { typ: 'Reagieren', spielerId: 'spieler-1', farbenschutzId: null })).toMatch(/nichts abzuwehren/)
  })

  it('A5: eine Karte, die nicht auf der Hand liegt, oder eine Karte der falschen Art wird abgelehnt', () => {
    const zustand = mitHand(['Blau', 'Verdoppler'])
    const [blau, verdoppler] = zustand.spieler[0].hand
    const fremde = zustand.spieler[1].hand[0]
    expect(grund(zustand, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: fremde.id })).toMatch(
      new RegExp(`${fremde.id} liegt nicht auf der Hand von Spieler 1`),
    )
    expect(grund(zustand, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: blau.id })).toMatch(/braucht einen Verdoppler/)
    expect(grund(zustand, { typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: blau.id })).toMatch(
      /nur Sonderkarten/,
    )
    expect(grund(zustand, { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: verdoppler.id })).toMatch(
      /Verdoppler ist noch nicht umgesetzt \(kommt mit E3\)/,
    )
  })

  it('B2: anwendeAktion lehnt mit dem Grund ab und lässt den Zustand unverändert', () => {
    const zustand = mitHand(['Blau'])
    const vorher = serialisiere(zustand)
    expect(() => anwendeAktion(zustand, { typ: 'ZugBeenden', spielerId: 'spieler-1' })).toThrow(/mindestens eine Karte/)
    expect(serialisiere(zustand)).toBe(vorher)
  })
})
