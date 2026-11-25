// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, erzeugeZufall, pruefeInvarianten } from '../engine'
import type { Spielzustand } from '../engine'
import { baukasten } from '../engine/testing/szenario'
import { AUFGABENREGISTER } from '../engine/aufgabenKarten'
import { erstellePartie } from '../engine'
import { entferneTestbedingungen, immer, setzeTestbedingungen } from '../engine/testing/testaufgaben'
import { bestimmeZustand, sichtFuer, simuliere } from './sicht'
import type { Sicht } from './sicht'
import { erstelleZufallsKi } from './strategien/zufallsKi'
import { alleTexte, mischeVerborgenes, verborgeneIds } from './__tests__/verborgenes'
import { jederNte, partieZustaende, zufallszustaende } from './__tests__/stellungen'

/*
K2, Vorgabe aus P0.3d: Eine Strategie bekommt nie einen Zustand, auch nicht für die
Zugsuche. Der Rahmen errät aus der Sicht einen Zustand (`bestimmeZustand`) und
liefert der Strategie darauf zu jeder Aktion die Sicht danach (`simuliere`, `nach`).
*/

const zufallsKis = (anzahl: number) => Array.from({ length: anzahl }, (_, sitz) => erstelleZufallsKi(erzeugeZufall(70 + sitz)))

/** 200 Stellungen: 100 Zufallszustände und 100 aus Partien der Zufalls-KI mit 2 bis 4 Spielern, mit und ohne Erweiterung. */
const STELLUNGEN: Spielzustand[] = [
  ...zufallszustaende(100, 9000),
  ...[
    { spielerzahl: 2, erweiterung: false, saat: 31 },
    { spielerzahl: 3, erweiterung: true, saat: 32 },
    { spielerzahl: 4, erweiterung: false, saat: 33 },
    { spielerzahl: 4, erweiterung: true, saat: 34 },
  ].flatMap((partie) => jederNte(partieZustaende(partie, zufallsKis(partie.spielerzahl)), 7).slice(0, 25)),
]

/** Jede Stellung für jeden Spieler. */
const BLICKE = STELLUNGEN.flatMap((zustand) => zustand.spieler.map((_, ich) => ({ zustand, ich })))

describe('K2 Vorgabe: der Rahmen errät aus der Sicht einen Zustand (Determinisierung)', () => {
  it(`K2: der erratene Zustand zeigt dem Spieler genau seine Sicht, ${BLICKE.length} Blicke aus 200 Stellungen`, () => {
    expect(STELLUNGEN).toHaveLength(200)
    for (const [nummer, { zustand, ich }] of BLICKE.entries()) {
      const sicht = sichtFuer(zustand, ich)
      expect(sichtFuer(bestimmeZustand(sicht, erzeugeZufall(nummer)), ich), `K2: Blick ${nummer}, Spieler ${ich}`).toEqual(sicht)
    }
  })

  it('K2: der erratene Zustand erfüllt jede Invariante der Engine', () => {
    for (const [nummer, { zustand, ich }] of BLICKE.entries()) {
      const verletzt = pruefeInvarianten(bestimmeZustand(sichtFuer(zustand, ich), erzeugeZufall(nummer))).filter((befund) => befund.verletzt)
      expect(verletzt.map((befund) => `${befund.name}: ${befund.detail}`), `K2: Blick ${nummer}, Spieler ${ich}`).toEqual([])
    }
  })

  it('K2: verdeckt liegen im erratenen Zustand genau die Karten, die der Spieler nirgends sieht, mit den echten Handgrössen', () => {
    for (const [nummer, { zustand, ich }] of BLICKE.entries()) {
      const geraten = bestimmeZustand(sichtFuer(zustand, ich), erzeugeZufall(nummer))
      const verdeckt = (stand: Spielzustand) => [...verborgeneIds(stand, ich)].sort()
      expect(verdeckt(geraten), `K2: Blick ${nummer}`).toEqual(verdeckt(zustand))
      expect(geraten.spieler.map((spieler) => spieler.hand.length)).toEqual(zustand.spieler.map((spieler) => spieler.hand.length))
      expect(geraten.nachziehstapel).toHaveLength(zustand.nachziehstapel.length)
      expect(geraten.spieler[ich].hand, 'K2: die eigene Hand ist die echte').toEqual(zustand.spieler[ich].hand)
    }
  })

  it('K2.7: der erratene Zustand hängt nicht vom Verdeckten ab: neu gemischte fremde Hände, Stapel und geheime Aufgaben ändern nichts', () => {
    let veraendert = 0
    for (const [nummer, { zustand, ich }] of BLICKE.entries()) {
      const gemischt = mischeVerborgenes(zustand, ich, erzeugeZufall(5000 + nummer))
      if (JSON.stringify(gemischt) !== JSON.stringify(zustand)) veraendert += 1
      const echt = bestimmeZustand(sichtFuer(zustand, ich), erzeugeZufall(nummer))
      expect(bestimmeZustand(sichtFuer(gemischt, ich), erzeugeZufall(nummer)), `K2.7: Blick ${nummer}, Spieler ${ich}`).toEqual(echt)
    }
    expect(veraendert, 'K2.7: in den meisten Blicken ändert das Mischen den echten Zustand').toBeGreaterThan(BLICKE.length * 0.8)
  })

  it('K2: das Verdeckte füllt der Zufall der KI; mit anderem Zufall errät der Rahmen anders', () => {
    const zustand = baukasten({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(4) }).haendeAuffuellen().zustand()
    const sicht = sichtFuer(zustand, 1)
    const erster = bestimmeZustand(sicht, erzeugeZufall(1))
    expect(bestimmeZustand(sicht, erzeugeZufall(1)), 'K2: gleicher Zufall, gleich geraten').toEqual(erster)
    expect(bestimmeZustand(sicht, erzeugeZufall(2)).nachziehstapel, 'K2: anderer Zufall, anderer Stapel').not.toEqual(erster.nachziehstapel)
    expect(erster.spieler[0].geheimeAufgabe, 'K2: mit Erweiterung hat jeder Gegner eine geheime Aufgabe (A4)').not.toBeNull()
    expect(erster.spieler.map((spieler) => spieler.geheimeAufgabeErfuellt), 'K2: fremde geheime Aufgaben gelten als nicht erfüllt (A9)').toEqual([
      false,
      zustand.spieler[1].geheimeAufgabeErfuellt,
      false,
    ])
  })

  it('U12: passt die Sicht zu keinem Zustand, nennt der Fehler den Grund', () => {
    const sicht = sichtFuer(baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(4) }).haendeAuffuellen().zustand(), 0)
    expect(() => bestimmeZustand({ ...sicht, nachziehstapelGroesse: sicht.nachziehstapelGroesse + 1 }, erzeugeZufall(1))).toThrow(
      'Simulation: Verdeckt sind 103 Karten, die Sicht verlangt 5 in fremden Händen und 99 im Nachziehstapel.',
    )
    expect(() => bestimmeZustand({ ...sicht, hand: sicht.hand.slice(1) }, erzeugeZufall(1))).toThrow(
      'Simulation: Verdeckt sind 104 Karten, die Sicht verlangt 5 in fremden Händen und 98 im Nachziehstapel.',
    )
  })
})

describe('K2 Vorgabe: die Folgefunktion liefert der Strategie die Sicht danach', () => {
  /** Je Stellung, in der jemand entscheidet, bis zu sechs seiner Aktionen, ohne die, die verdeckte Karten zieht oder aufdeckt (A8.2: Risiko-Karte, Wahl „stapel“). */
  const proben = STELLUNGEN.flatMap((zustand, nummer) => {
    const entscheider = ermittleEntscheider(zustand)
    if (entscheider === null) return []
    // X4: „Zwei Karten abwerfen, drei ziehen“ zieht verdeckt wie „Zug beenden“ (D49); X5: eine Risiko-Karte deckt auf, die Wahl „stapel“ zieht verdeckt (A8.2).
    const ziehtVerdeckt = new Set(['ZugBeenden', 'UeberhandAbwerfen', 'ZweiAbwerfenDreiZiehen', 'RisikoKarteSpielen'])
    const aktionen = ermittleAktionen(zustand).filter((aktion) => !ziehtVerdeckt.has(aktion.typ) && !(aktion.typ === 'Entscheiden' && aktion.wahl === 'stapel'))
    return jederNte(aktionen, Math.max(1, Math.floor(aktionen.length / 6))).map((aktion) => ({ zustand, nummer, entscheider, aktion }))
  })

  it(`K2: die Aktionen der Simulation sind die der Engine, wenn der Spieler selbst entscheidet (${STELLUNGEN.length} Stellungen)`, () => {
    for (const [nummer, zustand] of STELLUNGEN.entries()) {
      const entscheider = ermittleEntscheider(zustand)
      if (entscheider === null) continue
      const stellung = simuliere(sichtFuer(zustand, entscheider), erzeugeZufall(nummer))
      expect(stellung.entscheider).toBe(entscheider)
      expect(stellung.aktionen(), `K2: Stellung ${nummer}`).toEqual(ermittleAktionen(zustand))
    }
  })

  it('K2: nach einer eigenen Karte zeigt die Simulation dieselbe Sicht wie die echte Partie, auch die Id einer neuen Schlange', () => {
    expect(proben.length, 'K2: genug Proben').toBeGreaterThan(300)
    for (const { zustand, nummer, entscheider, aktion } of proben) {
      const stellung = simuliere(sichtFuer(zustand, entscheider), erzeugeZufall(nummer))
      const wo = `K2: Stellung ${nummer}, ${JSON.stringify(aktion)}`
      let nachher: Spielzustand
      let aufgedeckt = false
      try {
        const ergebnis = anwendeAktion(zustand, aktion)
        nachher = ergebnis.zustand
        aufgedeckt = ergebnis.ereignisse.some((ereignis) => ereignis.typ === 'AufgabeAufgedeckt')
      } catch (ablehnung) {
        // Manche Zufallszustände erreicht keine Partie; lehnt die Engine dort ab, lehnt sie in der Simulation gleich ab.
        expect(() => stellung.nach(aktion), wo).toThrow(ablehnung instanceof Error ? ablehnung.message : String(ablehnung))
        continue
      }
      // Löst die Karte eine Aufgabe ein, deckt sie die nächste vom verdeckten Aufgabenstapel auf (A9); wie beim Ziehen errät die Simulation diese nur.
      // Wird die aufgedeckte gleich mit eingelöst (Kette, D5), hängen Stapelgrösse und weitere Einlösungen davon ab;
      // verglichen werden dann nur die Aufgaben, die vor der Aktion offen oder eingelöst waren.
      const vorher = sichtFuer(zustand, entscheider)
      const bekannt = new Set([...vorher.offeneAufgaben, ...vorher.spieler.flatMap((spieler) => spieler.erfuellteAufgaben)].map((aufgabe) => aufgabe.id))
      const vergleichbar = (sicht: Sicht): Sicht =>
        aufgedeckt
          ? {
              ...sicht,
              offeneAufgaben: [],
              aufgabenstapelGroesse: 0,
              spieler: sicht.spieler.map((spieler) => ({ ...spieler, erfuellteAufgaben: spieler.erfuellteAufgaben.filter((aufgabe) => bekannt.has(aufgabe.id)) })),
            }
          : sicht
      const simuliert = stellung.nach(aktion)
      expect(vergleichbar(simuliert.sicht), wo).toEqual(vergleichbar(sichtFuer(nachher, entscheider)))
      expect(simuliert.entscheider, wo).toBe(ermittleEntscheider(nachher))
    }
  })

  it('U12: eine Aktion, die die Engine in der Simulation ablehnt, lehnt sie mit ihrem Grund ab', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(4) }).haendeAuffuellen().zustand()
    const stellung = simuliere(sichtFuer(zustand, 0), erzeugeZufall(1))
    expect(() => stellung.nach({ typ: 'ZugBeenden', spielerId: 'spieler-1' })).toThrow(/muss erst mindestens eine Karte spielen/)
  })

  it('K2.7, K4: eine Stellung bietet nur Sicht, Entscheider, Aktionen, Folge, die ungesehenen Karten und die erfüllbaren Aufgaben an und verrät nichts Verdecktes', () => {
    for (const [nummer, { zustand, ich }] of BLICKE.entries()) {
      const stellung = simuliere(sichtFuer(zustand, ich), erzeugeZufall(nummer))
      expect(Object.keys(stellung).sort()).toEqual(['aktionen', 'entscheider', 'erfuellbar', 'nach', 'sicht', 'ungesehen'])
      const texte = alleTexte(JSON.parse(JSON.stringify(stellung)))
      const verraten = verborgeneIds(zustand, ich).filter((id) => texte.has(id))
      expect(verraten, `K2.7: Blick ${nummer} verrät Verdecktes`).toEqual([])
    }
  })

  it('K2: die Simulation ändert den echten Zustand nicht, auch nicht, wenn die Strategie ihre Sicht verändert', () => {
    const zustand = STELLUNGEN[150]
    const vorher = structuredClone(zustand)
    const entscheider = ermittleEntscheider(zustand) ?? 0
    const stellung = simuliere(sichtFuer(zustand, entscheider), erzeugeZufall(3))
    stellung.sicht.hand.length = 0
    for (const aktion of stellung.aktionen().slice(0, 3)) void stellung.nach(aktion).sicht
    expect(zustand).toEqual(vorher)
  })
})

describe('X1/K2: erfüllte Aufgaben am Partiebeginn (Codex-Befund)', () => {
  afterEach(() => {
    entferneTestbedingungen()
  })

  it('K2/X1: löst der Spieler am Zug schon zu Beginn Aufgaben ein, errät der Rahmen trotzdem einen Zustand mit allen 15 Aufgaben', () => {
    setzeTestbedingungen(Object.fromEntries([...AUFGABENREGISTER.keys()].map((name) => [name, immer(0)])))
    const zustand = erstellePartie({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(3) })
    expect(zustand.spieler[0].erfuellteAufgaben.length, 'Testaufbau: Spieler 1 hat zu Beginn Aufgaben').toBeGreaterThan(0)
    for (const ich of [0, 1]) {
      const sicht = sichtFuer(zustand, ich)
      const erraten = bestimmeZustand(sicht, erzeugeZufall(4))
      expect(pruefeInvarianten(erraten).filter((befund) => befund.verletzt), `Sicht von Spieler ${ich}`).toEqual([])
      expect(sichtFuer(erraten, ich)).toEqual(sicht)
    }
  })
})
