import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { anwendeAktion, deserialisiere, ermittleAktionen, ermittleEntscheider, pruefeAktion, serialisiere } from '../index'
import type { Spielzustand } from '../index'
import { giltNachJederAktion } from '../aufgaben/definition'
import { definitionFuerAufgabe } from '../aufgabenKarten'
import { ENTSCHEIDUNGSREGISTER } from '../entscheidungsregister'
import { verlangeEntscheidung } from '../reaktion'
import { entferneTestbedingungen, immer, setzeTestbedingungen } from '../testing/testaufgaben'
import { baukasten } from '../testing/szenario'
import { TEST_GEGNERWAHL, TEST_KARTENWAHL, verlangeTestwahl } from '../testing/testentscheidung'
import { entscheidung, mitTestentscheidungen, pruefeSchritt, spieleTestkarte, testkarte, TESTKARTE, typenDer } from './rahmen_hilfen'
import { ablage, durchlassen, ereignisseVom, fuehreAus, grubeAuf, grund, hand, MIT_GRUBE, MIT_SCHUTZ, tischMitHaenden } from './zugablauf_hilfen'

/*
X3, Kriterium 3: der allgemeine Entscheidungsablauf (`reaktion.ts`). Eine
Wirkung verlangt eine Entscheidung, auch von einem Gegner, etwa „der
begünstigte Gegner wählt“ (D52) oder „Freie Wahl bei Misserfolg“ (A8.2). Die
Engine nennt den Entscheider, bietet nur seine Wahl an, und Speichern und Laden
setzt mitten darin fort. Die Abwehr nach D33 bleibt, wie sie ist.

Geprüft wird mit den Test-Entscheidungen aus `testing/testentscheidung.ts`: Die
Test-Karte deckt die oberste Karte auf, der Spieler am Zug wählt einen Gegner,
und der wählt zwischen der aufgedeckten Karte und der obersten Stapelkarte.
*/

let austragen: () => void

beforeEach(() => {
  austragen = mitTestentscheidungen()
  testkarte((zustand, spielerIndex) => verlangeTestwahl(zustand, spielerIndex, zustand.spieler[spielerIndex].ablagestapel.at(-1)!.id))
})

afterEach(() => {
  austragen()
  vi.restoreAllMocks()
})

/** Drei Spieler; Spieler 1 hält die Test-Karte, oben auf dem Stapel liegt Violett. */
function tisch(): Spielzustand {
  return baukasten({ spielerzahl: 3, erweiterung: true })
    .hand(0, [TESTKARTE, 'Blau', 'Rot', 'Gelb', 'Grün'])
    .hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
    .hand(2, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
    .stapelOben(['Violett'])
    .zustand()
}

function ersteFrage(): Spielzustand {
  return spieleTestkarte(tisch()).zustand
}

describe('X3 Kriterium 3 (A8.2, D52): eine Wirkung verlangt eine Entscheidung', () => {
  it('A8.2: der Spieler am Zug entscheidet zuerst; angeboten ist je Gegner eine Wahl, sonst nichts', () => {
    const schritt = spieleTestkarte(tisch())
    expect(typenDer(schritt.ereignisse)).toEqual(['KartenVersetzt', 'KarteGespielt', 'EntscheidungVerlangt'])
    expect(ereignisseVom(schritt.ereignisse, 'EntscheidungVerlangt')).toEqual([
      { typ: 'EntscheidungVerlangt', spielerIndex: 0, art: TEST_GEGNERWAHL, karteId: schritt.zustand.spieler[0].ablagestapel.at(-1)!.id, optionen: ['spieler-2', 'spieler-3'] },
    ])
    expect(ermittleEntscheider(schritt.zustand), 'X3: die Engine nennt den Entscheider').toBe(0)
    expect(ermittleAktionen(schritt.zustand)).toEqual([
      { typ: 'Entscheiden', spielerId: 'spieler-1', wahl: 'spieler-2' },
      { typ: 'Entscheiden', spielerId: 'spieler-1', wahl: 'spieler-3' },
    ])
  })

  it('D52: der gewählte Gegner entscheidet danach; die Engine nennt ihn, und nur er darf wählen', () => {
    const schritt = entscheidung(ersteFrage(), 'spieler-3')
    expect(typenDer(schritt.ereignisse)).toEqual(['Entschieden', 'EntscheidungVerlangt'])
    expect(ereignisseVom(schritt.ereignisse, 'Entschieden')[0]).toMatchObject({ spielerIndex: 0, art: TEST_GEGNERWAHL, wahl: 'spieler-3' })
    expect(ereignisseVom(schritt.ereignisse, 'EntscheidungVerlangt')[0]).toMatchObject({ spielerIndex: 2, art: TEST_KARTENWAHL, optionen: ['aufgedeckte', 'stapel'] })
    expect(ermittleEntscheider(schritt.zustand)).toBe(2)
    expect(ermittleAktionen(schritt.zustand).map((aktion) => aktion.spielerId)).toEqual(['spieler-3', 'spieler-3'])
    expect(schritt.zustand.zug.spielerIndex, 'am Zug bleibt Spieler 1').toBe(0)
  })

  it('D52: nimmt der Gegner die aufgedeckte Karte, liegt sie auf seiner Hand; danach ist wieder der Spieler am Zug dran', () => {
    const gefragt = entscheidung(ersteFrage(), 'spieler-2').zustand
    const violett = gefragt.aufgedeckt[0].id
    const schritt = entscheidung(gefragt, 'aufgedeckte')
    expect(hand(schritt.zustand, 1)).toContain(violett)
    expect(schritt.zustand.aufgedeckt).toEqual([])
    expect(schritt.zustand.entscheidung).toBeNull()
    expect(ermittleEntscheider(schritt.zustand)).toBe(0)
    expect(ermittleAktionen(schritt.zustand).some((aktion) => aktion.typ === 'ZugBeenden')).toBe(true)
  })

  it('D52/B2: zieht der Gegner stattdessen die oberste Stapelkarte, nennt kein Ereignis ihre Id; die aufgedeckte kommt auf den Ablagestapel des Spielers am Zug', () => {
    const gefragt = entscheidung(ersteFrage(), 'spieler-2').zustand
    const violett = gefragt.aufgedeckt[0].id
    const oberste = gefragt.nachziehstapel[0].id
    const schritt = entscheidung(gefragt, 'stapel')
    expect(hand(schritt.zustand, 1)).toContain(oberste)
    expect(ablage(schritt.zustand, 0).at(-1)).toBe(violett)
    expect(JSON.stringify(schritt.ereignisse)).not.toContain(oberste)
    const versetzt = ereignisseVom(schritt.ereignisse, 'KartenVersetzt')[0]
    expect(versetzt.karten).toContainEqual({ karteId: null, von: { ort: 'Nachziehstapel' }, nach: { ort: 'Hand', spielerIndex: 1 } })
  })

  it('A5/A6: solange die Entscheidung offen ist, geht nur sie; die Gründe nennen den Entscheider', () => {
    const gefragt = entscheidung(ersteFrage(), 'spieler-2').zustand
    expect(grund(gefragt, { typ: 'ZugBeenden', spielerId: 'spieler-1' })).toMatch(/entscheidet.*KI-Gegner 1/)
    expect(grund(gefragt, { typ: 'Entscheiden', spielerId: 'spieler-1', wahl: 'aufgedeckte' })).toMatch(/Spieler 1 entscheidet gerade nicht.*KI-Gegner 1/)
    expect(grund(gefragt, { typ: 'Entscheiden', spielerId: 'spieler-2', wahl: 'nichts' })).toMatch(/„nichts“.*aufgedeckte, stapel/)
  })

  it('X3: ohne offene Entscheidung wird „Entscheiden“ abgelehnt', () => {
    expect(grund(tisch(), { typ: 'Entscheiden', spielerId: 'spieler-1', wahl: 'spieler-2' })).toMatch(/keine Entscheidung offen/)
  })
})

describe('X3 Kriterium 3 (D52, B2): Speichern und Laden mitten in einer Entscheidung', () => {
  it.each([
    ['vor der Wahl des Spielers am Zug', () => ersteFrage()],
    ['vor der Wahl des Gegners', () => entscheidung(ersteFrage(), 'spieler-3').zustand],
  ])('X3/E4 Kriterium 8: %s setzt das Laden genau dort fort', (_titel, erzeuge) => {
    const offen = erzeuge()
    const geladen = deserialisiere(serialisiere(offen))
    expect(geladen).toEqual(offen)
    expect(ermittleEntscheider(geladen)).toBe(ermittleEntscheider(offen))
    expect(ermittleAktionen(geladen)).toEqual(ermittleAktionen(offen))
    const wahl = ermittleAktionen(geladen)[0]
    expect(serialisiere(anwendeAktion(geladen, wahl).zustand)).toBe(serialisiere(anwendeAktion(offen, wahl).zustand))
  })

  it('X3: ein Spielstand mit einer unbekannten Entscheidung, einem Entscheider ausserhalb des Tisches oder ohne Wahl wird abgelehnt', () => {
    const offen = ersteFrage()
    const mit = (aendern: (zustand: Spielzustand) => void) => {
      const kopie = structuredClone(offen)
      aendern(kopie)
      return () => deserialisiere(serialisiere(kopie))
    }
    expect(mit((zustand) => (zustand.entscheidung!.art = 'Unbekannt'))).toThrow(/Entscheidung.*Unbekannt/)
    expect(mit((zustand) => (zustand.entscheidung!.entscheider = 7))).toThrow(/Spieler 7/)
    expect(mit((zustand) => (zustand.entscheidung!.optionen = []))).toThrow(/ohne Wahl/)
    expect(mit((zustand) => ((zustand.entscheidung as unknown as Record<string, unknown>).fremd = 1))).toThrow(/entscheidung:.*fremd/)
  })
})

describe('X3: Entscheidung und Abwehr (D33) kommen sich nicht in die Quere', () => {
  it('D33: die Abwehr verhält sich unverändert; der Gefragte bekommt nur Reagieren, kein Entscheiden', () => {
    const start = tischMitHaenden([MIT_GRUBE, MIT_SCHUTZ]).zustand()
    const angesagt = fuehreAus(start, grubeAuf(start, 1))
    expect(typenDer(angesagt.ereignisse)).toEqual(['KarteAngesagt', 'AbwehrGefragt'])
    expect(ermittleEntscheider(angesagt.zustand)).toBe(1)
    expect(new Set(ermittleAktionen(angesagt.zustand).map((aktion) => aktion.typ))).toEqual(new Set(['Reagieren']))
    expect(grund(angesagt.zustand, { typ: 'Entscheiden', spielerId: 'spieler-2', wahl: 'x' })).toMatch(/keine Entscheidung offen/)
    expect(fuehreAus(angesagt.zustand, durchlassen(angesagt.zustand)).zustand.ausliegendeGruben).toHaveLength(1)
  })

  it('X3: solange eine Karte schwebt, lässt sich keine Entscheidung verlangen (Fail-Fast)', () => {
    const start = tischMitHaenden([MIT_GRUBE, MIT_SCHUTZ]).zustand()
    const schwebt = structuredClone(fuehreAus(start, grubeAuf(start, 1)).zustand)
    expect(() =>
      verlangeEntscheidung(schwebt, { art: TEST_GEGNERWAHL, karteId: 'x', entscheider: 0, ausgeloestVon: 0, optionen: ['a'], daten: {} }),
    ).toThrow(/schwebt/)
  })

  it('X3: eine zweite Entscheidung neben einer offenen und eine ohne Wahl lehnt die Engine ab', () => {
    const offen = structuredClone(ersteFrage())
    const neu = { art: TEST_KARTENWAHL, karteId: 'x', entscheider: 1, ausgeloestVon: 0, optionen: ['a'], daten: {} }
    expect(() => verlangeEntscheidung(offen, neu)).toThrow(/schon offen/)
    expect(() => verlangeEntscheidung(structuredClone(tisch()), { ...neu, optionen: [] })).toThrow(/ohne Wahl/)
    expect(() => verlangeEntscheidung(structuredClone(tisch()), { ...neu, art: 'Unbekannt' })).toThrow(/Unbekannt/)
  })

  it('X3: eine Entscheidung, deren Art nicht mehr im Register steht, lehnt die Engine mit Grund ab', () => {
    const offen = ersteFrage()
    ENTSCHEIDUNGSREGISTER.delete(TEST_GEGNERWAHL)
    expect(pruefeAktion(offen, { typ: 'Entscheiden', spielerId: 'spieler-1', wahl: 'spieler-2' })).toMatchObject({ erlaubt: false, grund: expect.stringMatching(/unbekannt/) })
  })

  it('B2: jeder Schritt der Kette ist nachrechenbar und verrät keine Handkarte', () => {
    const erste = ersteFrage()
    const zweite = entscheidung(erste, 'spieler-2')
    for (const wahl of ['aufgedeckte', 'stapel']) expect(() => pruefeSchritt(zweite.zustand, anwendeAktion(zweite.zustand, { typ: 'Entscheiden', spielerId: 'spieler-2', wahl }))).not.toThrow()
  })
})

describe('A9/X3: die Aufgabenprüfung wartet, bis die Entscheidung gefallen ist', () => {
  afterEach(() => {
    entferneTestbedingungen()
  })

  it('A9: solange eine Entscheidung offen ist, löst niemand eine Aufgabe ein; nach der letzten Wahl prüft die Engine für den Spieler am Zug', () => {
    const start = tisch()
    // Eine Aufgabe, die nach jeder Aktion gilt; Farbenpracht gilt erst am Zugende (X2a).
    const name = start.offeneAufgaben.find((aufgabe) => giltNachJederAktion(definitionFuerAufgabe(aufgabe)))!.name
    setzeTestbedingungen({ [name]: immer(0) })
    const erste = spieleTestkarte(start)
    expect(typenDer(erste.ereignisse), 'A9: keine Prüfung, solange Spieler 1 noch entscheidet').not.toContain('AufgabeErfuellt')
    const zweite = entscheidung(erste.zustand, 'spieler-2')
    expect(typenDer(zweite.ereignisse), 'A9: keine Prüfung, solange der Gegner noch entscheidet').not.toContain('AufgabeErfuellt')
    const dritte = entscheidung(zweite.zustand, 'aufgedeckte')
    expect(typenDer(dritte.ereignisse).slice(0, 3)).toEqual(['Entschieden', 'KartenVersetzt', 'AufgabeErfuellt'])
    expect(dritte.zustand.spieler[0].erfuellteAufgaben.map((aufgabe) => aufgabe.name)).toEqual([name])
  })
})
