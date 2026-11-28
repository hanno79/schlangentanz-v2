// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, erfuelltAufgabe, ermittleAktionen, erzeugeZufall, offeneHandkarteDer } from '../engine'
import type { Spielzustand } from '../engine'
import { legeAufgabenAus } from '../engine/testing/aufgaben'
import { baukasten } from '../engine/testing/szenario'
import { simuliere, sichtFuer } from './sicht'
import { erstelleZufallsKi } from './strategien/zufallsKi'
import { mischeVerborgenes, verborgeneIds } from './__tests__/verborgenes'
import { jederNte, partieZustaende } from './__tests__/stellungen'

/*
K4, Kriterium 4 (K2.7): Was der Rahmen einer Strategie mit Erweiterung zusätzlich
anbietet, verrät nichts Verdecktes (B2). `Stellung.ungesehen()` nennt die Karten, die
der Spieler nirgends sieht, als Menge nach Id geordnet: Sie folgt aus dem Material und
der Sicht, nicht aus ihrem Ort. `Stellung.erfuellbar()` prüft die Bedingungen der
offenen und der eigenen geheimen Aufgabe (A9) an den eigenen Schlangen und Sonderkarten.
*/

/** Stellungen aus Partien der Zufalls-KI mit Erweiterung, 2 bis 4 Spieler. */
const STELLUNGEN: Spielzustand[] = [2, 3, 4].flatMap((spielerzahl, nummer) =>
  jederNte(
    partieZustaende(
      { spielerzahl, erweiterung: true, saat: 5400 + nummer },
      Array.from({ length: spielerzahl }, (_, sitz) => erstelleZufallsKi(erzeugeZufall(nummer * 10 + sitz))),
    ),
    7,
  ),
)

describe('K4, B2: die ungesehenen Karten', () => {
  it('K4, B2: ungesehen() sind genau die Karten in fremden Händen ohne die offen benannte (D52) und im Nachziehstapel, nach Id geordnet', () => {
    expect(STELLUNGEN.length, 'Testaufbau').toBeGreaterThan(60)
    for (const [nummer, zustand] of STELLUNGEN.entries()) {
      for (const ich of zustand.spieler.keys()) {
        const ungesehen = simuliere(sichtFuer(zustand, ich), erzeugeZufall(nummer)).ungesehen().map((karte) => karte.id)
        const benannt = offeneHandkarteDer(zustand.entscheidung)?.karteId
        const fremde = zustand.spieler.flatMap((spieler, index) => (index === ich ? [] : spieler.hand.map((karte) => karte.id).filter((id) => id !== benannt)))
        expect(ungesehen, `K4: Stellung ${nummer}, Spieler ${ich}`).toEqual([...fremde, ...zustand.nachziehstapel.map((karte) => karte.id)].sort())
        const verborgen = new Set(verborgeneIds(zustand, ich))
        expect(ungesehen.every((id) => verborgen.has(id)), `B2: Stellung ${nummer}, Spieler ${ich}, nur verdeckte Karten`).toBe(true)
      }
    }
  })

  it('K4, K2.7: neu gemischtes Verdecktes und ein anderer Zufall der KI ändern ungesehen() nicht', () => {
    for (const [nummer, zustand] of STELLUNGEN.entries()) {
      for (const ich of zustand.spieler.keys()) {
        const gemischt = mischeVerborgenes(zustand, ich, erzeugeZufall(700 + nummer))
        const ids = (stand: Spielzustand, saat: number) => JSON.stringify(simuliere(sichtFuer(stand, ich), erzeugeZufall(saat)).ungesehen())
        expect(ids(gemischt, nummer + 1), `K2.7: Stellung ${nummer}, Spieler ${ich}`).toBe(ids(zustand, nummer))
      }
    }
  })
})

describe('K4, Codex-Befund 6, K2.7: das Mischen ändert die Sicht nicht', () => {
  it('K2.7, D43: auch nicht, wenn ein Gegner Karten mit dem Korb verdeckt gezogen hat und die Zusatzaktionen nur für sie gelten', () => {
    const start = baukasten({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(57) }).hand(0, ['Schlangenkorb des Glücks']).haendeAuffuellen().zustand()
    const ziehen = ermittleAktionen(start).find((aktion) => aktion.typ === 'SchlangenkorbSpielen' && aktion.bonus.art === 'ziehen')!
    const zustand = anwendeAktion(start, ziehen).zustand
    expect(zustand.zug.zusatzaktionen.some((zusatz) => (zusatz.nurKarten?.length ?? 0) > 0), 'Testaufbau: Zusatzaktionen nur für die gezogenen Karten').toBe(true)
    for (const ich of [1, 2]) {
      for (const saat of [1, 2, 3, 4, 5]) {
        expect(sichtFuer(mischeVerborgenes(zustand, ich, erzeugeZufall(saat)), ich), `K2.7: Spieler ${ich}, Saat ${saat}`).toEqual(sichtFuer(zustand, ich))
      }
    }
  })
})

describe('K4, A9: die erfüllbaren Aufgaben', () => {
  /** Spieler 1 hat Blau ×4 und hält ein fünftes; offen liegen Farbkombination und Lila Riese, geheim hat er Gelber Schatz. */
  function tisch(): Spielzustand {
    return baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(54) })
      .schlange(0, ['Blau', 'Blau', 'Blau', 'Blau'])
      .hand(0, ['Blau'])
      .haendeAuffuellen()
      .aendere((zustand) =>
        legeAufgabenAus(zustand, {
          offen: ['Farbkombination', 'Lila Riese', 'Symmetriemeister'],
          geheim: [
            [0, 'Gelber Schatz'],
            [1, 'Schlangentanz'],
          ],
        }),
      )
      .zustand()
  }

  it('K4, A9, D41: mit einer fünften blauen Karte in den eigenen Schlangen nennt erfuellbar() Farbkombination, sonst nichts; die Prüfung ist die der Engine', () => {
    const zustand = tisch()
    const stellung = simuliere(sichtFuer(zustand, 0), erzeugeZufall(1))
    const eigen = stellung.sicht.spieler[0]
    expect(stellung.erfuellbar(eigen), 'A9: vier blaue Karten erfüllen nichts').toEqual([])
    const blau = stellung.sicht.hand[stellung.sicht.hand.findIndex((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Blau')]
    const schlangen = eigen.schlangen.map((schlange, index) => (index === 0 ? { ...schlange, karten: [...schlange.karten, blau] } : schlange))
    expect(stellung.erfuellbar({ ...eigen, schlangen }).map((aufgabe) => aufgabe.name)).toEqual(['Farbkombination'])
    const probe = structuredClone(zustand)
    probe.spieler[0].schlangen[0].karten.push(probe.spieler[0].hand.splice(probe.spieler[0].hand.findIndex((karte) => karte.id === blau.id), 1)[0])
    expect(erfuelltAufgabe(probe, 0, probe.offeneAufgaben[0]), 'A9: dieselbe Prüfung auf dem Zustand').toBe(true)
  })

  it('K4, D35, B2: erfuellbar() prüft nur freie Aufgaben des Spielers selbst: die eigene geheime, solange sie nicht erfüllt ist, nie eine fremde geheime; ohne Erweiterung nichts', () => {
    // Gelber Schatz (geheim, Spieler 1): sechs gelbe Karten in einer Gruppe (A9).
    const gelb = baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(56) }).schlange(0, ['Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb', 'Gelb']).haendeAuffuellen()
    const mitSchatz = gelb.aendere((stand) => legeAufgabenAus(stand, { offen: ['Symmetriemeister', 'Lila Riese', 'Farbharmonie'], geheim: [[0, 'Gelber Schatz'], [1, 'Schlangentanz']] })).zustand()
    const eigen = simuliere(sichtFuer(mitSchatz, 0), erzeugeZufall(2))
    expect(eigen.erfuellbar(eigen.sicht.spieler[0]).map((aufgabe) => aufgabe.name), 'A9: die eigene geheime Aufgabe').toEqual(['Gelber Schatz'])
    const fremd = simuliere(sichtFuer(mitSchatz, 1), erzeugeZufall(3))
    expect(fremd.erfuellbar(fremd.sicht.spieler[0]), 'B2: aus der Sicht von Spieler 2 nie die geheime Aufgabe von Spieler 1').toEqual([])
    const erfuellt = structuredClone(mitSchatz)
    erfuellt.spieler[0].geheimeAufgabeErfuellt = true
    const danach = simuliere(sichtFuer(erfuellt, 0), erzeugeZufall(4))
    expect(danach.erfuellbar(danach.sicht.spieler[0]), 'D35: eine erfüllte geheime Aufgabe ist nicht mehr frei').toEqual([])
    const ohne = baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(55) }).schlange(0, ['Blau', 'Blau', 'Blau', 'Blau', 'Blau']).haendeAuffuellen().zustand()
    const basis = simuliere(sichtFuer(ohne, 0), erzeugeZufall(5))
    expect(basis.erfuellbar(basis.sicht.spieler[0]), 'D34: ohne Erweiterung gibt es keine Aufgaben').toEqual([])
  })
})
