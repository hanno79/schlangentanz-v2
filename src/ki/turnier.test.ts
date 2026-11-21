import { afterEach, describe, expect, it, vi } from 'vitest'
import { anwendeAktion, berechneEndwertung, erstellePartie, erzeugeZufall } from '../engine'
import type { Spielzustand } from '../engine'
import { baukasten } from '../engine/testing/szenario'
import type { Ki } from './strategien/strategie'
import { sitzordnung, spielePartie, turnier } from './turnier'
import type { Teilnehmer, TurnierErgebnis } from './turnier'
import { erstelleZufallsKi } from './strategien/zufallsKi'

const ZUFALL: Teilnehmer = { name: 'Zufalls-KI', erstelle: erstelleZufallsKi }
const zufallsTeilnehmer = (anzahl: number): Teilnehmer[] => Array.from({ length: anzahl }, (_, index) => ({ ...ZUFALL, name: `Zufall ${index + 1}` }))

afterEach(() => vi.restoreAllMocks())

describe('K1: Sitzordnung im Turnier', () => {
  it('K1: der Sitz rotiert von Partie zu Partie', () => {
    expect([0, 1, 2].map((partie) => sitzordnung(partie, 2))).toEqual([[0, 1], [1, 0], [0, 1]])
    expect([0, 1, 2, 3].map((partie) => sitzordnung(partie, 3))).toEqual([[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 1, 2]])
    expect(sitzordnung(1, 4)).toEqual([1, 2, 3, 0])
  })

  it('K1: jede Partie hat ihre Saat und ihre Sitzordnung; jeder Teilnehmer beginnt gleich oft', () => {
    const ergebnis = turnier({ teilnehmer: zufallsTeilnehmer(3), partien: 6, ersteSaat: 40, kiSaat: 7, erweiterung: false })
    expect(ergebnis.partien.map((partie) => partie.saat)).toEqual([40, 41, 42, 43, 44, 45])
    expect(ergebnis.partien.map((partie) => partie.sitze)).toEqual([0, 1, 2, 3, 4, 5].map((partie) => sitzordnung(partie, 3)))
    expect(ergebnis.partien.map((partie) => partie.sitze[0]).sort()).toEqual([0, 0, 1, 1, 2, 2])
  })

  it('A2: zwei bis vier Teilnehmer, mindestens eine Partie; sonst ein Fehler mit Grund', () => {
    expect(() => turnier({ teilnehmer: zufallsTeilnehmer(1), partien: 1, ersteSaat: 1, kiSaat: 7, erweiterung: false })).toThrow(
      'Turnier: 1 Teilnehmer; eine Partie hat 2 bis 4 Spieler (A2).',
    )
    expect(() => turnier({ teilnehmer: zufallsTeilnehmer(5), partien: 1, ersteSaat: 1, kiSaat: 7, erweiterung: false })).toThrow(/5 Teilnehmer/)
    expect(() => turnier({ teilnehmer: zufallsTeilnehmer(2), partien: 0, ersteSaat: 1, kiSaat: 7, erweiterung: false })).toThrow(
      'Turnier: Ungültige Zahl der Partien 0; erwartet eine ganze Zahl ab 1.',
    )
  })
})

describe('K1 Kriterium 2: Zufalls-KI gegen Zufalls-KI', () => {
  it('K1: 200 Partien mit 2, 3 und 4 Spielern, mit und ohne Erweiterung, enden alle ohne Invariantenverletzung', () => {
    const laeufe: TurnierErgebnis[] = [
      turnier({ teilnehmer: zufallsTeilnehmer(2), partien: 70, ersteSaat: 1, kiSaat: 7, erweiterung: false }),
      turnier({ teilnehmer: zufallsTeilnehmer(2), partien: 70, ersteSaat: 101, kiSaat: 7, erweiterung: true }),
      turnier({ teilnehmer: zufallsTeilnehmer(3), partien: 30, ersteSaat: 201, kiSaat: 7, erweiterung: false }),
      turnier({ teilnehmer: zufallsTeilnehmer(4), partien: 30, ersteSaat: 301, kiSaat: 7, erweiterung: true }),
    ]
    const partien = laeufe.flatMap((lauf) => lauf.partien)
    expect(partien).toHaveLength(200)
    expect(partien.filter((partie) => partie.ausgang !== 'beendet').map(({ saat, ausgang, detail }) => ({ saat, ausgang, detail }))).toEqual([])
    expect(Math.min(...partien.map((partie) => partie.schritte)), 'K1: jede Partie dauert viele Züge').toBeGreaterThan(40)
    expect(partien.every((partie) => partie.sieger.length > 0), 'D22: jede beendete Partie hat mindestens einen Sieger').toBe(true)
    for (const lauf of laeufe) {
      const siege = lauf.partien.reduce((summe, partie) => summe + partie.sieger.length, 0)
      expect(lauf.siege.reduce((summe, zahl) => summe + zahl, 0), 'D22: bei Gleichstand zählt jeder Sieger').toBe(siege)
    }
  }, 300_000)

  it('D22: die Sieger sind die Teilnehmer mit der höchsten Endwertung; der Verlauf spielt die Partie genau nach', () => {
    const [partie] = turnier({ teilnehmer: zufallsTeilnehmer(3), partien: 2, ersteSaat: 77, kiSaat: 7, erweiterung: true }).partien.slice(1)
    let zustand = erstellePartie({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(partie.saat) })
    for (const aktion of partie.verlauf) zustand = anwendeAktion(zustand, aktion).zustand
    expect(zustand.partiephase).toBe('Beendet')
    const wertung = berechneEndwertung(zustand)
    const siegerSitze = zustand.spieler.flatMap((spieler, sitz) => (wertung.gewinner.includes(spieler.id) ? [sitz] : []))
    expect(partie.sieger).toEqual(siegerSitze.map((sitz) => partie.sitze[sitz]).sort())
    expect(partie.punkte).toEqual(partie.sitze.map((_, teilnehmer) => wertung.spieler[partie.sitze.indexOf(teilnehmer)].summe))
  })
})

describe('K1 Kriterium 3: gleiche Saat, gleicher Verlauf', () => {
  it('K1: dasselbe Turnier zweimal ergibt Zug für Zug dasselbe; eine andere Saat einen anderen Verlauf', () => {
    const optionen = { teilnehmer: zufallsTeilnehmer(2), partien: 4, ersteSaat: 9, kiSaat: 7, erweiterung: true }
    const erstes = turnier(optionen)
    expect(turnier(optionen)).toEqual(erstes)
    expect(erstes.partien[0].verlauf.length).toBeGreaterThan(40)
    const anderes = turnier({ ...optionen, ersteSaat: 10 })
    expect(anderes.partien[0].verlauf).not.toEqual(erstes.partien[0].verlauf)
    // P0.3d: Der KI-Zufall hat eine eigene Saat; mit ihr ändern sich die Wahlen, nicht die Partie.
    const andereKis = turnier({ ...optionen, kiSaat: 8 })
    expect(andereKis.partien.map((partie) => partie.saat)).toEqual(erstes.partien.map((partie) => partie.saat))
    expect(andereKis.partien[0].verlauf, 'K1: eine andere KI-Saat ergibt andere Wahlen').not.toEqual(erstes.partien[0].verlauf)
  })

  it('U4: das Turnier zieht keinen eigenen Zufall: Math.random wird nie gerufen', () => {
    const random = vi.spyOn(Math, 'random')
    turnier({ teilnehmer: zufallsTeilnehmer(2), partien: 2, ersteSaat: 3, kiSaat: 7, erweiterung: false })
    expect(random).not.toHaveBeenCalled()
  })

  it('K1: jede KI bekommt ihre eigene Zufallsquelle, auch zwei gleiche Teilnehmer spielen nicht im Gleichschritt', () => {
    const quellen: Array<() => number> = []
    const merkend: Teilnehmer = {
      name: 'Merk',
      erstelle: (zufall) => {
        quellen.push(zufall)
        return erstelleZufallsKi(zufall)
      },
    }
    turnier({ teilnehmer: [merkend, merkend], partien: 1, ersteSaat: 5, kiSaat: 7, erweiterung: false })
    expect(quellen).toHaveLength(2)
    expect(quellen[0]()).not.toBe(quellen[1]())
  })
})

describe('K1: Ausgänge einer Partie', () => {
  const zwei = (saat: number): Ki[] => [erstelleZufallsKi(erzeugeZufall(saat)), erstelleZufallsKi(erzeugeZufall(saat + 1))]

  it('K1: eine verletzte Invariante hält die Partie an und nennt sie', () => {
    const kaputt: Spielzustand = baukasten({ spielerzahl: 2, erweiterung: false }).haendeAuffuellen().zustand()
    kaputt.spieler[1].hand.push(kaputt.spieler[0].hand[0])
    const ergebnis = spielePartie(kaputt, zwei(1))
    expect(ergebnis).toMatchObject({ ausgang: 'invariante', schritte: 0, verlauf: [], siegerSitze: [] })
    expect(ergebnis.detail).toMatch(/Jede Spielkarte liegt genau einmal an genau einem Ort/)
  })

  it('K1: eine Partie, die nicht endet, stösst an die Schrittgrenze', () => {
    const start = erstellePartie({ spielerzahl: 2, erweiterung: false, zufall: erzeugeZufall(2) })
    const ergebnis = spielePartie(start, zwei(2), 3)
    expect(ergebnis).toMatchObject({ ausgang: 'schrittgrenze', schritte: 3, siegerSitze: [] })
    expect(ergebnis.verlauf).toHaveLength(3)
    expect(ergebnis.detail).toBe('Nach 3 Schritten nicht beendet.')
  })

  it('K1: eine Partie braucht je Sitz genau eine KI', () => {
    const start = erstellePartie({ spielerzahl: 3, erweiterung: false, zufall: erzeugeZufall(2) })
    expect(() => spielePartie(start, zwei(2))).toThrow('Turnier: 2 KIs für 3 Sitze; jeder Sitz braucht genau eine KI.')
  })

  it('U3: baut eine KI ihre Aktion selbst, bricht das Turnier mit Saat und Grund ab', () => {
    const nachbau: Teilnehmer = { name: 'Nachbau', erstelle: () => ({ name: 'Nachbau-KI', waehle: (_, aktionen) => ({ ...aktionen[0] }) }) }
    expect(() => turnier({ teilnehmer: [ZUFALL, nachbau], partien: 1, ersteSaat: 12, kiSaat: 7, erweiterung: false })).toThrow(
      /^Turnier, Partie mit Saat 12, Schritt \d+: KI-Schritt: Nachbau-KI hat eine Aktion gewählt/,
    )
  })
})

describe('P0.3d: der KI-Zufall verrät die Partiesaat nicht', () => {
  /** Teilnehmer, die den ersten Wert ihrer Zufallsquelle aufschreiben, je Partie in Sitzreihenfolge. */
  function beobachter(anzahl: number) {
    const erste: number[] = []
    const teilnehmer: Teilnehmer[] = Array.from({ length: anzahl }, (_, index) => ({
      name: `Beobachter ${index + 1}`,
      erstelle(zufall) {
        erste.push(zufall())
        return erstelleZufallsKi(zufall)
      },
    }))
    return { erste, teilnehmer }
  }

  it('P0.3d: andere Partiesaat, gleiche KI-Saat: jede KI bekommt denselben Zufall', () => {
    const a = beobachter(2)
    const b = beobachter(2)
    const c = beobachter(2)
    // Schrittgrenze 0: Die KIs entstehen, gespielt wird nicht; mehr braucht der Vergleich nicht.
    turnier({ teilnehmer: a.teilnehmer, partien: 3, ersteSaat: 1, kiSaat: 9, erweiterung: false, schrittGrenze: 0 })
    turnier({ teilnehmer: b.teilnehmer, partien: 3, ersteSaat: 5000, kiSaat: 9, erweiterung: false, schrittGrenze: 0 })
    turnier({ teilnehmer: c.teilnehmer, partien: 3, ersteSaat: 1, kiSaat: 10, erweiterung: false, schrittGrenze: 0 })

    expect(b.erste, 'P0.3d: der KI-Zufall darf nicht von der Partiesaat abhängen').toEqual(a.erste)
    expect(c.erste, 'P0.3d: eine andere KI-Saat gibt anderen KI-Zufall').not.toEqual(a.erste)
  })

  it('P0.3d: der Angriff aus der Prüfung (Partiesaat aus dem ersten KI-Zufallswert) findet die Saat nicht', () => {
    const alteKiSaat = (saat: number, sitz: number) => (Math.imul(saat, 0x9e3779b1) + sitz + 1) >>> 0
    const { erste, teilnehmer } = beobachter(2)
    turnier({ teilnehmer, partien: 4, ersteSaat: 1, kiSaat: 9, erweiterung: false, schrittGrenze: 0 })

    // Wie der Angriff: alle kleinen Saaten durchprobieren, ohne die echte zu kennen.
    const gefunden = erste.flatMap((wert, stelle) =>
      Array.from({ length: 4096 }, (_, saat) => saat).filter((saat) => erzeugeZufall(alteKiSaat(saat, stelle % 2))() === wert),
    )

    expect(gefunden, 'P0.3d: erwartet, dass sich aus dem KI-Zufall keine Partiesaat ergibt').toEqual([])
  })
})
