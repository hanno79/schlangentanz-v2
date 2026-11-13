import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SpielAktion, Spielzustand } from '../index'
import { KARTENREGISTER } from '../karten/register'
import { baukasten } from '../testing/szenario'
import type { Kartenwahl, Schlangenglied } from '../testing/szenario'
import { ablage, aktionFuer, aktionen, fuehreAus, grund, hand, typen, zugBeenden } from './zugablauf_hilfen'

/*
E2, Ausspielen: A5 (Karten ausspielen, Wichtig, Schlangen), D12, D13, D25.

Die Sonderkarten „ohne mögliches Ziel“ sind so gewählt, dass sie auch nach den
Kartentasks keines haben: Regenbogenschlange, Blockade, Farbendieb und
Schlangenfrass brauchen eine Schlange am Tisch (D16, A7.1, A7.4), und hier liegt
keine. Farbenschutz darf immer wirkungslos abgelegt werden (D25).
*/

const GEGNERHAND: Kartenwahl[] = ['Blau', 'Blau', 'Rot', 'Rot', 'Gelb']

/** Zwei Spieler, Spieler 1 am Zug mit genau dieser Hand und diesen Schlangen; der Gegner hat keine Schlange. */
function tisch(hand0: Kartenwahl[], schlangen: Schlangenglied[][] = []): Spielzustand {
  const bau = baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, hand0).hand(1, GEGNERHAND)
  for (const glieder of schlangen) bau.schlange(0, glieder)
  return bau.zustand()
}

function karteId(zustand: Spielzustand, index: number): string {
  return zustand.spieler[0].hand[index].id
}

function neueSchlange(zustand: Spielzustand, index: number): SpielAktion {
  return { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: karteId(zustand, index), ziel: { art: 'neueSchlange' } }
}

function wirkungslos(zustand: Spielzustand, index: number): SpielAktion {
  return { typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: karteId(zustand, index) }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('A5/D12: mindestens eine, höchstens zwei Karten', () => {
  it('A5: wer Karten hält und noch keine gespielt hat, darf den Zug nicht beenden', () => {
    const zustand = tisch(['Blau', 'Regenbogenschlange'])
    expect(typen(zustand)).not.toContain('ZugBeenden')
    expect(grund(zustand, zugBeenden(zustand))).toMatch(/mindestens eine Karte.*\(A5, D12\)/)
  })

  it('D12: eine Farbkarte genügt; danach ist „Zug beenden“ erlaubt', () => {
    const zustand = tisch(['Blau', 'Regenbogenschlange'])
    const nach = fuehreAus(zustand, neueSchlange(zustand, 0)).zustand
    expect(typen(nach)).toContain('ZugBeenden')
    expect(fuehreAus(nach, zugBeenden(nach)).zustand.zug.spielerIndex).toBe(1)
  })

  it('D12/D13: eine Sonderkarte genügt, auch wirkungslos abgelegt und obwohl eine Farbkarte auf der Hand ist', () => {
    const zustand = tisch(['Blau', 'Regenbogenschlange'])
    const nach = fuehreAus(zustand, wirkungslos(zustand, 1)).zustand
    expect(typen(nach)).toContain('ZugBeenden')
    expect(fuehreAus(nach, zugBeenden(nach)).zustand.zug.spielerIndex).toBe(1)
  })

  it('D12: höchstens eine Farbkarte je Zug', () => {
    const zustand = tisch(['Blau', 'Rot', 'Farbenschutz'])
    const nach = fuehreAus(zustand, neueSchlange(zustand, 0)).zustand
    const rot = nach.spieler[0].hand.find((karte) => karte.typ === 'Farbkarte')!
    expect(aktionen(nach, 'FarbkarteLegen')).toEqual([])
    expect(grund(nach, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: rot.id, ziel: { art: 'neueSchlange' } })).toMatch(
      /schon eine Farbkarte gespielt.*höchstens eine Farbkarte und eine Sonderkarte \(A5, D12\)/,
    )
  })

  it('D12/D13: höchstens eine Sonderkarte je Zug; die wirkungslos abgelegte zählt als Sonderkarte des Zuges', () => {
    const zustand = tisch(['Blau', 'Regenbogenschlange', 'Farbenschutz'])
    const nach = fuehreAus(zustand, wirkungslos(zustand, 1)).zustand
    const farbenschutz = nach.spieler[0].hand.find((karte) => karte.typ === 'Sonderkarte')!
    expect(aktionen(nach, 'SonderkarteWirkungslosAblegen')).toEqual([])
    expect(grund(nach, { typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: farbenschutz.id })).toMatch(
      /schon eine Sonderkarte gespielt.*\(A5, D12\)/,
    )
    expect(typen(nach)).toEqual(['FarbkarteLegen', 'ZugBeenden'])
  })

  it.each([
    ['erst die Farbkarte, dann die Sonderkarte', [0, 1]],
    ['erst die Sonderkarte, dann die Farbkarte', [1, 0]],
  ])('A5: Farbkarte und Sonderkarte in beliebiger Reihenfolge (%s); danach bleibt nur „Zug beenden“', (_, reihenfolge) => {
    let zustand = tisch(['Blau', 'Farbenschutz', 'Rot', 'Farbenschutz'])
    const blau = karteId(zustand, 0)
    const schutz = karteId(zustand, 1)
    for (const index of reihenfolge) {
      const aktion = index === 0 ? aktionFuer(zustand, 'FarbkarteLegen', blau) : aktionFuer(zustand, 'SonderkarteWirkungslosAblegen', schutz)
      zustand = fuehreAus(zustand, aktion).zustand
    }
    expect(zustand.zug).toMatchObject({ gespielteFarbkarten: 1, gespielteSonderkarten: 1 })
    expect(aktionen(zustand)).toEqual([zugBeenden(zustand)])
  })

  it('A5/D12: die Grenze gilt je Zug: im nächsten eigenen Zug sind wieder eine Farbkarte und eine Sonderkarte erlaubt', () => {
    let zustand = tisch(['Blau', 'Farbenschutz', 'Rot', 'Gelb', 'Farbenschutz'])
    zustand = fuehreAus(zustand, aktionFuer(zustand, 'FarbkarteLegen', karteId(zustand, 0))).zustand
    zustand = fuehreAus(zustand, aktionFuer(zustand, 'SonderkarteWirkungslosAblegen', karteId(zustand, 0))).zustand
    zustand = fuehreAus(zustand, zugBeenden(zustand)).zustand
    zustand = fuehreAus(zustand, aktionen(zustand, 'FarbkarteLegen')[0]).zustand
    zustand = fuehreAus(zustand, zugBeenden(zustand)).zustand
    expect(zustand.zug).toMatchObject({ spielerIndex: 0, teilzug: 1, gespielteFarbkarten: 0, gespielteSonderkarten: 0, abschnitt: 'Ausspielen' })
    expect(typen(zustand)).toEqual(expect.arrayContaining(['FarbkarteLegen', 'SonderkarteWirkungslosAblegen']))
  })
})

describe('A5: Farbkarte legen und Schlangen', () => {
  it('A5: eine Farbkarte, separat gelegt, beginnt eine neue eigene Schlange', () => {
    const zustand = tisch(['Blau', 'Rot'])
    const blau = zustand.spieler[0].hand[0]
    const { zustand: nach, ereignisse } = fuehreAus(zustand, neueSchlange(zustand, 0))
    expect(nach.spieler[0].schlangen).toEqual([{ id: 'schlange-1', karten: [blau], fusionen: [] }])
    expect(hand(nach, 0)).not.toContain(blau.id)
    expect(nach.schlangenZaehler).toBe(1)
    expect(ereignisse).toEqual([{ typ: 'KarteGespielt', spielerIndex: 0, karteId: blau.id, aktion: 'FarbkarteLegen' }])
  })

  it.each([
    ['anfang', (alt: string[], neu: string) => [neu, ...alt]],
    ['ende', (alt: string[], neu: string) => [...alt, neu]],
  ] as const)('A5: eine Farbkarte setzt eine eigene Schlange am Ende „%s“ fort', (seite, erwartet) => {
    const zustand = tisch(['Gelb'], [['Rot', 'Blau']])
    const schlange = zustand.spieler[0].schlangen[0]
    const gelb = karteId(zustand, 0)
    const aktion: SpielAktion = { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: gelb, ziel: { art: 'schlange', schlangenId: schlange.id, seite } }
    const nach = fuehreAus(zustand, aktion).zustand
    expect(nach.spieler[0].schlangen[0].karten.map((karte) => karte.id)).toEqual(erwartet(schlange.karten.map((karte) => karte.id), gelb))
  })

  it('A5: aufgezählt werden beide Enden jeder eigenen Schlange und, mit weniger als 2 Schlangen, eine neue Schlange', () => {
    const zustand = tisch(['Gelb'], [['Rot']])
    const gelb = karteId(zustand, 0)
    const ziele = aktionen(zustand, 'FarbkarteLegen').map((aktion) => (aktion.typ === 'FarbkarteLegen' ? aktion.ziel : null))
    expect(ziele).toHaveLength(3)
    expect(ziele).toEqual(
      expect.arrayContaining([
        { art: 'neueSchlange' },
        { art: 'schlange', schlangenId: 'schlange-1', seite: 'anfang' },
        { art: 'schlange', schlangenId: 'schlange-1', seite: 'ende' },
      ]),
    )
    expect(aktionen(zustand, 'FarbkarteLegen').every((aktion) => 'karteId' in aktion && aktion.karteId === gelb)).toBe(true)
  })

  it('A5: ein Spieler darf höchstens 2 Schlangen haben', () => {
    const zustand = tisch(['Gelb'], [['Rot'], ['Blau']])
    const ziele = aktionen(zustand, 'FarbkarteLegen').map((aktion) => (aktion.typ === 'FarbkarteLegen' ? aktion.ziel.art : null))
    expect(ziele).toEqual(['schlange', 'schlange', 'schlange', 'schlange'])
    expect(grund(zustand, neueSchlange(zustand, 0))).toMatch(/höchstens 2 Schlangen \(A5\)/)
  })

  it('A5: eine Schlange hat keine Längengrenze', () => {
    const lang: Schlangenglied[] = Array.from({ length: 24 }, (_, index) => (['Blau', 'Rot', 'Gelb'] as const)[index % 3])
    const zustand = tisch(['Violett'], [lang])
    const schlange = zustand.spieler[0].schlangen[0]
    const aktion: SpielAktion = {
      typ: 'FarbkarteLegen',
      spielerId: 'spieler-1',
      karteId: karteId(zustand, 0),
      ziel: { art: 'schlange', schlangenId: schlange.id, seite: 'ende' },
    }
    expect(fuehreAus(zustand, aktion).zustand.spieler[0].schlangen[0].karten).toHaveLength(25)
  })

  it('A5: eine unbekannte Schlange und eine Farbkarte auf eine Sonderkarte werden mit Grund abgelehnt', () => {
    const zustand = tisch(['Gelb', 'Farbenschutz'])
    expect(
      grund(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: karteId(zustand, 0), ziel: { art: 'schlange', schlangenId: 'schlange-9', seite: 'ende' } }),
    ).toMatch(/schlange-9/)
    expect(grund(zustand, { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: karteId(zustand, 1), ziel: { art: 'neueSchlange' } })).toMatch(
      /braucht eine Farbkarte/,
    )
  })
})

describe('D13/D25: Sonderkarte wirkungslos ablegen', () => {
  it('D13: eine Sonderkarte ohne mögliches Ziel kommt wirkungslos auf den eigenen Ablagestapel', () => {
    const zustand = tisch(['Blau', 'Schlangenblockade'])
    const blockade = karteId(zustand, 1)
    const { zustand: nach, ereignisse } = fuehreAus(zustand, wirkungslos(zustand, 1))
    expect(ablage(nach, 0)).toEqual([blockade])
    expect(ablage(nach, 1)).toEqual([])
    expect(hand(nach, 0)).toEqual([karteId(zustand, 0)])
    expect(nach.spieler.flatMap((spieler) => spieler.schlangen)).toEqual([])
    expect(nach.zug).toMatchObject({ gespielteSonderkarten: 1, gespielteFarbkarten: 0 })
    expect(ereignisse).toEqual([{ typ: 'KarteGespielt', spielerIndex: 0, karteId: blockade, aktion: 'SonderkarteWirkungslosAblegen' }])
  })

  it('D13: jederzeit, auch wenn man eine Farbkarte hätte: jede Sonderkarte ohne Ziel wird zum Ablegen angeboten', () => {
    const zustand = tisch(['Blau', 'Regenbogenschlange', 'Farbendieb', 'Schlangenfrass'])
    const angeboten = aktionen(zustand, 'SonderkarteWirkungslosAblegen').map((aktion) => ('karteId' in aktion ? aktion.karteId : ''))
    expect(angeboten).toEqual([karteId(zustand, 1), karteId(zustand, 2), karteId(zustand, 3)])
  })

  it('D13: eine Farbkarte lässt sich nicht wirkungslos ablegen', () => {
    const zustand = tisch(['Blau'])
    expect(grund(zustand, wirkungslos(zustand, 0))).toMatch(/nur Sonderkarten \(D13\)/)
  })

  it('D25: Farbenschutz darf immer wirkungslos abgelegt werden, auch neben Farbkarten und eigenen Schlangen', () => {
    const zustand = tisch(['Blau', 'Farbenschutz'], [['Rot', 'Rot']])
    const schutz = karteId(zustand, 1)
    expect(aktionFuer(zustand, 'SonderkarteWirkungslosAblegen', schutz)).toEqual(wirkungslos(zustand, 1))
    expect(ablage(fuehreAus(zustand, wirkungslos(zustand, 1)).zustand, 0)).toEqual([schutz])
  })

  it('D25: Farbenschutz darf immer wirkungslos abgelegt werden, gleich was sein Registereintrag an Zielen meldet', () => {
    const zustand = tisch(['Blau', 'Farbenschutz'])
    const fremdesZiel: SpielAktion = { typ: 'VerdopplerSpielen', spielerId: 'spieler-1', karteId: karteId(zustand, 1) }
    vi.spyOn(KARTENREGISTER.Farbenschutz, 'ziele').mockReturnValue([fremdesZiel])
    expect(aktionen(zustand, 'SonderkarteWirkungslosAblegen')).toEqual([wirkungslos(zustand, 1)])
    expect(ablage(fuehreAus(zustand, wirkungslos(zustand, 1)).zustand, 0)).toEqual([karteId(zustand, 1)])
  })

  it('D25: eine Sonderkarte mit möglichem Ziel lässt sich nicht wirkungslos ablegen; aufgezählt wird ihre Aktion mit Wirkung', () => {
    const zustand = tisch(['Blau', 'Schlangengrube'])
    const grube = karteId(zustand, 1)
    const mitWirkung: SpielAktion = { typ: 'SchlangengrubeSpielen', spielerId: 'spieler-1', karteId: grube, zielSpielerId: 'spieler-2' }
    vi.spyOn(KARTENREGISTER.Schlangengrube, 'ziele').mockReturnValue([mitWirkung])
    expect(aktionen(zustand, 'SonderkarteWirkungslosAblegen')).toEqual([])
    expect(aktionen(zustand, 'SchlangengrubeSpielen')).toEqual([mitWirkung])
    expect(grund(zustand, wirkungslos(zustand, 1))).toMatch(/mögliches Ziel.*\(D25\)/)
  })
})

describe('A5 Wichtig: nur Sonderkarten, nur Farbenschutz', () => {
  it('A5: wer nur Sonderkarten hält, muss eine davon spielen: „Zug beenden“ gibt es erst danach', () => {
    const zustand = tisch(['Regenbogenschlange', 'Schlangenblockade', 'Farbendieb', 'Schlangenfrass', 'Farbenschutz'])
    expect(typen(zustand)).toEqual(['SonderkarteWirkungslosAblegen'])
    expect(aktionen(zustand)).toHaveLength(5)
    const nach = fuehreAus(zustand, wirkungslos(zustand, 2)).zustand
    expect(aktionen(nach)).toEqual([zugBeenden(nach)])
  })

  it('A5: wer nur Farbenschutz hält, legt einen ohne Wirkung ab, zieht nach, und der Zug ist beendet', () => {
    const zustand = tisch(['Farbenschutz', 'Farbenschutz', 'Farbenschutz'])
    expect(aktionen(zustand)).toEqual([wirkungslos(zustand, 0), wirkungslos(zustand, 1), wirkungslos(zustand, 2)])
    const abgelegt = fuehreAus(zustand, wirkungslos(zustand, 0)).zustand
    expect(ablage(abgelegt, 0)).toEqual([karteId(zustand, 0)])
    expect(aktionen(abgelegt)).toEqual([zugBeenden(abgelegt)])
    const { zustand: nach, ereignisse } = fuehreAus(abgelegt, zugBeenden(abgelegt))
    // A5 „Zug beenden“: aufgefüllt wird auf 5 Handkarten (aus 2 Farbenschutz werden 5 Karten).
    expect(nach.spieler[0].hand).toHaveLength(5)
    expect(ereignisse[0]).toEqual({ typ: 'KartenGezogen', spielerIndex: 0, anzahl: 3 })
    expect(nach.zug.spielerIndex).toBe(1)
  })

  it('A5: die nachgezogene Karte darf er erst im nächsten Zug ausspielen', () => {
    const zustand = tisch(['Farbenschutz', 'Farbenschutz'])
    const abgelegt = fuehreAus(zustand, wirkungslos(zustand, 0)).zustand
    const nach = fuehreAus(abgelegt, zugBeenden(abgelegt)).zustand
    const neu = nach.spieler[0].hand[nach.spieler[0].hand.length - 1]
    const aktion: SpielAktion =
      neu.typ === 'Farbkarte'
        ? { typ: 'FarbkarteLegen', spielerId: 'spieler-1', karteId: neu.id, ziel: { art: 'neueSchlange' } }
        : { typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: neu.id }
    expect(grund(nach, aktion)).toMatch(/Spieler 1 ist nicht am Zug/)
    expect(aktionen(nach).every((angeboten) => angeboten.spielerId === 'spieler-2')).toBe(true)
  })
})
