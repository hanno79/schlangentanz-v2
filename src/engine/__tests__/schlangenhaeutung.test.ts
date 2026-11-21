import { describe, expect, it } from 'vitest'
import { ermittleAktionen, pruefeAktion } from '../index'
import type { Spielzustand } from '../index'
import { ablage, aktionen, aktionFuer, farbkarte, fuehreAus, grund, hand, tischMitHaenden, verletzteInvarianten } from './zugablauf_hilfen'
import { arten, farbfolge, gruppenpunkte, haeutungAuf, haeutungen, haeutungId, ids, selbstGebaut, stellen, tisch } from './schlangenhaeutung_hilfen'

/*
E9, Schlangenhäutung in der eigenen Schlange: A7.9 (Text, beide Beispiele,
Wichtige Regeln), das Beispiel zur Aufgabe „Schlangentanz“ in A9, D26 (die
Farbfolge muss sich ändern), D13 und D25 (wirkungslos nur ohne Ziel), A6 (die
gespielte Karte kommt auf den Ablagestapel dessen, der sie gespielt hat).
Gegnerische Schlangen, Abwehr und Ereignisse prüft `schlangenhaeutung_abwehr.test.ts`.
*/

/** Die Handkarten, die die Engine zum wirkungslosen Ablegen anbietet (D13, D25). */
function wirkungslosAblegbar(zustand: Spielzustand): string[] {
  return aktionen(zustand, 'SonderkarteWirkungslosAblegen').flatMap((aktion) => ('karteId' in aktion ? [aktion.karteId] : []))
}

/** Die gewählten Abschnitte als „erste Stelle + Länge“, jeder einmal, in der Reihenfolge der Aufzählung. */
function abschnitte(zustand: Spielzustand): string[] {
  return [...new Set(haeutungen(zustand).map((aktion) => `${aktion.schlangenId}:${stellen(zustand, aktion)[0]}+${aktion.neueReihenfolge.length}`))]
}

describe('A7.9: ein Abschnitt von 3 bis 5 aufeinanderfolgenden Farbkarten wird neu angeordnet (Kriterium 1)', () => {
  it('A7.9 Beispiel 1: aus Blau, Rot, Gelb, Rot, Gelb wird Gelb, Gelb, Blau, Rot, Rot; die Häutung liegt danach auf dem Ablagestapel (A6)', () => {
    const start = tisch().schlange(0, ['Blau', 'Rot', 'Gelb', 'Rot', 'Gelb']).zustand()
    const karte = haeutungId(start)
    const { zustand } = fuehreAus(start, haeutungAuf(start, 0, 0, ['Gelb', 'Gelb', 'Blau', 'Rot', 'Rot']))
    expect(arten(zustand, 0)).toEqual(['Gelb', 'Gelb', 'Blau', 'Rot', 'Rot'])
    expect([...ids(zustand, 0)].sort(), 'A7.9: Die Gesamtstruktur bleibt erhalten, keine Karte kommt dazu oder geht weg').toEqual([...ids(start, 0)].sort())
    expect(ablage(zustand, 0), 'A6: die gespielte Häutung kommt auf den Ablagestapel des Spielers').toEqual([karte])
    expect(hand(zustand, 0)).not.toContain(karte)
    expect(verletzteInvarianten(zustand)).toEqual([])
  })

  it('A7.9: aufgezählt ist jeder Abschnitt von 3, 4 und 5 Farbkarten einer längeren Folge, jeder mit jeder neuen Farbfolge', () => {
    const zustand = tisch().schlange(0, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun', 'Violett']).zustand()
    expect(abschnitte(zustand)).toEqual(['schlange-1:0+3', 'schlange-1:0+4', 'schlange-1:0+5', 'schlange-1:1+3', 'schlange-1:1+4', 'schlange-1:1+5', 'schlange-1:2+3', 'schlange-1:2+4', 'schlange-1:3+3'])
    // Sechs verschiedene Farben: je Abschnitt alle Anordnungen ausser der bisherigen (D26).
    expect(haeutungen(zustand)).toHaveLength(4 * 5 + 3 * 23 + 2 * 119)
    for (const aktion of haeutungen(zustand)) {
      const belegt = stellen(zustand, aktion)
      expect(belegt, `A7.9: ${aktion.neueReihenfolge.join(', ')} liegt nicht aufeinanderfolgend`).toEqual(belegt.map((_, index) => belegt[0] + index))
      expect(pruefeAktion(zustand, aktion), `aufgezählt, aber abgelehnt: ${JSON.stringify(aktion)}`).toEqual({ erlaubt: true })
    }
  })

  it('A7.9: nur der gewählte Abschnitt wird neu geordnet; die Karten davor und dahinter bleiben an ihrer Stelle', () => {
    const start = tisch().schlange(0, ['Grün', 'Blau', 'Rot', 'Gelb', 'Braun', 'Violett', 'Grün']).zustand()
    const vorher = ids(start, 0)
    const { zustand } = fuehreAus(start, haeutungAuf(start, 0, 2, ['Braun', 'Rot', 'Gelb']))
    expect(arten(zustand, 0)).toEqual(['Grün', 'Blau', 'Braun', 'Rot', 'Gelb', 'Violett', 'Grün'])
    const nachher = ids(zustand, 0)
    expect([nachher[0], nachher[1], nachher[5], nachher[6]]).toEqual([vorher[0], vorher[1], vorher[5], vorher[6]])
    expect([nachher[2], nachher[3], nachher[4]]).toEqual([vorher[4], vorher[2], vorher[3]])
  })

  it('A7.9: der Abschnitt darf am Anfang und am Ende der Schlange liegen', () => {
    const start = tisch().schlange(0, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun']).zustand()
    expect(arten(fuehreAus(start, haeutungAuf(start, 0, 0, ['Gelb', 'Rot', 'Blau'])).zustand, 0)).toEqual(['Gelb', 'Rot', 'Blau', 'Grün', 'Braun'])
    expect(arten(fuehreAus(start, haeutungAuf(start, 0, 2, ['Braun', 'Grün', 'Gelb'])).zustand, 0)).toEqual(['Blau', 'Rot', 'Braun', 'Grün', 'Gelb'])
  })

  it('A7.9: eine Schlange mit genau 3 Farbkarten hat einen Abschnitt mit fünf neuen Farbfolgen', () => {
    const zustand = tisch().schlange(0, ['Blau', 'Rot', 'Gelb']).zustand()
    expect(abschnitte(zustand)).toEqual(['schlange-1:0+3'])
    expect(haeutungen(zustand).map((aktion) => farbfolge(zustand, aktion).join('-')).sort()).toEqual(
      ['Blau-Gelb-Rot', 'Gelb-Blau-Rot', 'Gelb-Rot-Blau', 'Rot-Blau-Gelb', 'Rot-Gelb-Blau'],
    )
  })

  it('A7.9: weniger als 3 und mehr als 5 Karten werden abgelehnt, auch ein Abschnitt von 6', () => {
    const zustand = tisch().schlange(0, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun', 'Violett']).zustand()
    const [b, r, g, gr, br, v] = ids(zustand, 0)
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [v, br, gr, g, r, b]))).toMatch(/3 bis 5 .*Farbkarten.*A7\.9/)
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [r, b]))).toMatch(/3 bis 5 .*Farbkarten.*A7\.9/)
  })

  it('A7.9: nur zusammenhängende Farbkarten dürfen gewählt werden; Lücken im Abschnitt werden abgelehnt', () => {
    const zustand = tisch().schlange(0, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun']).zustand()
    const [b, r, , gr] = ids(zustand, 0)
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [gr, r, b]))).toMatch(/aufeinanderfolgend.*A7\.9/)
  })

  it('A7.9: eine unbekannte Schlange, eine Karte aus einer anderen Schlange und eine doppelt genannte Karte werden abgelehnt', () => {
    const zustand = tisch().schlange(0, ['Blau', 'Rot', 'Gelb']).schlange(1, ['Grün']).zustand()
    const [b, r, g] = ids(zustand, 0)
    const fremd = ids(zustand, 1)[0]
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-9', [g, r, b]))).toMatch(/Schlange schlange-9 gibt es nicht/)
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [g, r, fremd]))).toMatch(new RegExp(`${fremd} liegt nicht in der Schlange schlange-1`))
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [g, g, b]))).toMatch(/doppelt.*A7\.9/)
  })

  it('A9 Beispiel „Schlangentanz“: die letzten 5 Karten Rot, Violett, Violett, Rot, Violett werden zu Rot, Rot, Violett, Violett, Violett; die neuen Gruppen zählen in der Wertung', () => {
    const start = tisch()
      .schlange(0, ['Blau', 'Grün', 'Grün', 'Blau', 'Grün', 'Rot', 'Rot', 'Violett', 'Violett', 'Rot', 'Violett'])
      .zustand()
    expect(gruppenpunkte(start, 0)).toBe(0)
    const { zustand } = fuehreAus(start, haeutungAuf(start, 0, 6, ['Rot', 'Rot', 'Violett', 'Violett', 'Violett']))
    expect(arten(zustand, 0)).toEqual(['Blau', 'Grün', 'Grün', 'Blau', 'Grün', 'Rot', 'Rot', 'Rot', 'Violett', 'Violett', 'Violett'])
    // Die rote Dreiergruppe entsteht nur mit dem Rot an Stelle 5 ausserhalb des Abschnitts (Grenzfall aus dem Plan).
    expect(gruppenpunkte(zustand, 0), 'A7.9: Neue Farbgruppen zählen für die Punktewertung (Rot×3 = 3, Violett×3 = 6)').toBe(9)
  })
})

describe('A7.9: Sonderkarten unterbrechen den Abschnitt und bleiben liegen (Kriterien 2 und 3)', () => {
  it('A7.9 Beispiel 2: in Blau, Violett, Schlangenblockade, Grün, Violett gibt es keinen Abschnitt; die Häutung ist nur wirkungslos ablegbar', () => {
    const start = tisch().schlange(0, ['Blau', 'Violett', 'Schlangenblockade', 'Grün', 'Violett']).zustand()
    const karte = haeutungId(start)
    expect(haeutungen(start)).toEqual([])
    expect(wirkungslosAblegbar(start), 'D13: ohne mögliches Ziel ist die Häutung wirkungslos ablegbar').toContain(karte)
    const { zustand } = fuehreAus(start, aktionFuer(start, 'SonderkarteWirkungslosAblegen', karte))
    expect(arten(zustand, 0)).toEqual(['Blau', 'Violett', 'Schlangenblockade', 'Grün', 'Violett'])
    expect(ablage(zustand, 0)).toEqual([karte])
  })

  it('A7.9: eine Schlangenblockade trennt die Abschnitte; sie gehört nie dazu und bleibt an ihrer Stelle', () => {
    const start = tisch().schlange(0, ['Rot', 'Blau', 'Gelb', 'Schlangenblockade', 'Grün', 'Braun', 'Violett']).zustand()
    expect(abschnitte(start)).toEqual(['schlange-1:0+3', 'schlange-1:4+3'])
    const blockade = ids(start, 0)[3]
    const [r, b, g] = ids(start, 0)
    expect(grund(start, selbstGebaut(start, 'schlange-1', [blockade, g, b, r]))).toMatch(/Sonderkarte.*Schlangenblockade.*A7\.9/)
    const { zustand } = fuehreAus(start, haeutungAuf(start, 0, 4, ['Violett', 'Grün', 'Braun']))
    expect(arten(zustand, 0)).toEqual(['Rot', 'Blau', 'Gelb', 'Schlangenblockade', 'Violett', 'Grün', 'Braun'])
    expect(ids(zustand, 0)[3], 'A7.9: Die Position von Sonderkarten bleibt unverändert').toBe(blockade)
  })

  it('A7.9: auch ein Joker (Regenbogenschlange) gehört nie zum Abschnitt und unterbricht ihn', () => {
    const start = tisch().schlange(0, ['Rot', 'Blau', 'Regenbogenschlange', 'Grün', 'Braun', 'Violett']).zustand()
    expect(abschnitte(start)).toEqual(['schlange-1:3+3'])
    const [r, b, joker] = ids(start, 0)
    expect(grund(start, selbstGebaut(start, 'schlange-1', [joker, b, r]))).toMatch(/Sonderkarte.*Regenbogenschlange.*A7\.9/)
    const { zustand } = fuehreAus(start, haeutungAuf(start, 0, 3, ['Braun', 'Violett', 'Grün']))
    expect(ids(zustand, 0)[2]).toBe(joker)
  })

  it('A7.9/A7.7: eine Farbenfusion ist eine Sonderkarte und unterbricht; die Karten darunter gehören nicht zum Abschnitt und bleiben unter ihr', () => {
    const start = tisch().schlange(0, ['Rot', 'Blau', 'Gelb', { fusion: ['Grün', 'Grün'] }, 'Violett', 'Braun', 'Blau']).zustand()
    expect(abschnitte(start)).toEqual(['schlange-1:0+3', 'schlange-1:4+3'])
    const fusion = ids(start, 0)[3]
    const unter = start.spieler[0].schlangen[0].fusionen[0].unter.map((karte) => karte.id)
    const [r, b] = ids(start, 0)
    expect(grund(start, selbstGebaut(start, 'schlange-1', [unter[0], b, r]))).toMatch(/unter der Farbenfusion.*A7\.9/)
    expect(grund(start, selbstGebaut(start, 'schlange-1', [fusion, b, r]))).toMatch(/Sonderkarte.*Farbenfusion.*A7\.9/)
    const { zustand } = fuehreAus(start, haeutungAuf(start, 0, 4, ['Blau', 'Braun', 'Violett']))
    expect(arten(zustand, 0)).toEqual(['Rot', 'Blau', 'Gelb', 'Farbenfusion', 'Blau', 'Braun', 'Violett'])
    expect(zustand.spieler[0].schlangen[0].fusionen, 'A7.7: unter der Fusion bleibt alles, wie es war').toEqual(start.spieler[0].schlangen[0].fusionen)
  })
})

describe('D26: die Farbfolge im Abschnitt muss danach anders sein', () => {
  it('D26: dieselbe Reihenfolge wird abgelehnt', () => {
    const zustand = tisch().schlange(0, ['Blau', 'Rot', 'Gelb']).zustand()
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', ids(zustand, 0)))).toMatch(/Farbfolge.*D26/)
  })

  it('D26: zwei gleichfarbige Karten zu tauschen ändert die Farbfolge nicht und wird abgelehnt', () => {
    const zustand = tisch().schlange(0, ['Rot', 'Blau', 'Rot']).zustand()
    const [r1, b, r2] = ids(zustand, 0)
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', [r2, b, r1]))).toMatch(/Farbfolge.*D26/)
  })

  it('D26: jede aufgezählte Häutung ändert die Farbfolge, und keine Farbfolge eines Abschnitts ist doppelt', () => {
    const zustand = tisch().schlange(0, ['Blau', 'Blau', 'Rot', 'Rot', 'Gelb']).zustand()
    const fuenfer = haeutungen(zustand).filter((aktion) => aktion.neueReihenfolge.length === 5)
    const folgen = fuenfer.map((aktion) => farbfolge(zustand, aktion).join('-'))
    // 5! / (2! · 2!) = 30 Farbfolgen, ohne die bisherige.
    expect(new Set(folgen).size).toBe(29)
    expect(folgen).toHaveLength(29)
    expect(folgen).not.toContain('Blau-Blau-Rot-Rot-Gelb')
  })

  it('D26/F13: ein Abschnitt aus lauter gleichen Farben ist nicht wählbar; gibt es keinen anderen, ist die Häutung nur wirkungslos ablegbar', () => {
    const start = tisch().schlange(0, ['Rot', 'Rot', 'Rot', 'Rot', 'Schlangenblockade', 'Blau', 'Gelb']).zustand()
    expect(haeutungen(start)).toEqual([])
    expect(wirkungslosAblegbar(start)).toContain(haeutungId(start))
    const mitBlau = tisch().schlange(0, ['Rot', 'Rot', 'Rot', 'Blau']).zustand()
    expect(abschnitte(mitBlau), 'Rot, Rot, Rot allein ist kein Ziel, mit dem Blau schon').toEqual(['schlange-1:0+4', 'schlange-1:1+3'])
  })
})

describe('D13/D25: wirkungslos ablegen nur ohne Ziel', () => {
  it('D13: ohne Schlange am Tisch und ohne drei Farbkarten in Folge hat die Häutung kein Ziel', () => {
    const leer = tisch().zustand()
    expect(haeutungen(leer)).toEqual([])
    expect(wirkungslosAblegbar(leer)).toContain(haeutungId(leer))
    const kurz = tisch().schlange(0, ['Blau', 'Rot']).schlange(1, ['Gelb', 'Schlangenblockade', 'Grün', 'Rot']).zustand()
    expect(haeutungen(kurz)).toEqual([])
    expect(wirkungslosAblegbar(kurz)).toContain(haeutungId(kurz))
  })

  it('D25: hat die Häutung ein Ziel, auch nur beim Gegner, bietet die Engine kein wirkungsloses Ablegen an und lehnt es ab', () => {
    const zustand = tisch().schlange(1, ['Blau', 'Rot', 'Gelb']).zustand()
    const karte = haeutungId(zustand)
    expect(haeutungen(zustand)).toHaveLength(5)
    expect(wirkungslosAblegbar(zustand)).not.toContain(karte)
    expect(grund(zustand, { typ: 'SonderkarteWirkungslosAblegen', spielerId: 'spieler-1', karteId: karte })).toMatch(/D25/)
  })
})

describe('A5/A7.9: die Neuordnung erfolgt einmalig', () => {
  it('A7.9/A5: nach der Häutung bietet die Engine im selben Zug keine zweite an, eine Farbkarte schon', () => {
    const start = tischMitZweiHaeutungen().schlange(0, ['Blau', 'Rot', 'Gelb']).zustand()
    const { zustand } = fuehreAus(start, haeutungAuf(start, 0, 0, ['Gelb', 'Rot', 'Blau']))
    expect(haeutungen(zustand)).toEqual([])
    expect(ermittleAktionen(zustand).map((aktion) => aktion.typ)).toContain('FarbkarteLegen')
    const zweite = haeutungId(zustand)
    expect(grund(zustand, selbstGebaut(zustand, 'schlange-1', ids(start, 0)))).toMatch(/Sonderkarte/)
    expect(fuehreAus(zustand, farbkarte(zustand)).zustand.spieler[0].hand.map((karte) => karte.id)).toContain(zweite)
  })
})

function tischMitZweiHaeutungen() {
  return tischMitHaenden([['Schlangenhäutung', 'Schlangenhäutung', 'Blau', 'Rot', 'Gelb'], ['Blau', 'Rot', 'Gelb', 'Blau', 'Rot']], true)
}
