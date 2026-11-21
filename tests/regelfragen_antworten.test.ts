// @vitest-environment node
import { describe, expect, it } from 'vitest'
import {
  FREI,
  NACHFRAGE,
  OFFEN,
  ZITAT,
  abschnitt,
  alsWort,
  bloecke,
  feld,
  gewaehlt,
  moeglichkeitText,
  nachfragen,
  normalisiert,
  spec,
  teilD,
  teilDTabelle,
  teileDerFrage,
} from './regelfragen_lesen'
import { DATUM_G, ERWARTET_G, type Teil } from './regelfragen_sammelantwort'

// Stand der Antworten des Autors. Die Form jeder Antwort prüft
// tests/regelfragen.test.ts; hier steht, was der Autor wann geantwortet hat.

/** Am 13.11.2026 hat der Autor F1–F15 und die Nachfrage F8a beantwortet. */
const DATUM_F = '13.11.2026'
/** Am 20.11.2026 hat der Autor G9 beantwortet. */
const DATUM_G9 = '20.11.2026'

/** `datum` fehlt bei den Antworten vom 13.11.2026 (`DATUM_F`). */
type Erwartung = { wahl: string; kern: string[]; verboten?: string[]; wortlaut?: string[]; datum?: string; teile?: Record<string, Teil> }

/**
 * Was der Autor gewählt hat, abgeleitet aus seinen Worten, nicht aus den Dateien:
 * „Alle andere Vorschläge sind passend“ (also der Vorschlag), F8 frei, F11 „mindestens
 * aus 3 Farbkarten … sonst ok“ mit der Bestätigung „Ja, genau so“, F8a „Ja, ohne Wirkung“, G9 „Ja, als Gruppe“ (Vorschlag a, 20.11.2026),
 * die übrigen Fragen G „ja zu deinen vorschlägen.“ (also je der Vorschlag, 21.11.2026; tests/regelfragen_sammelantwort.ts).
 * `kern` sind die tragenden Aussagen: Sie stehen in REGELFRAGEN.md (in der Antwort oder
 * in der gewählten Möglichkeit) und im Eintrag in Teil D; `verboten` steht an keiner
 * dieser Stellen. `wortlaut` zitiert den Autor in der Antwort; dass jedes Zitat auch in
 * Teil D steht, prüft tests/regelfragen.test.ts.
 */
const ERWARTET: Record<string, Erwartung> = {
  F1: { wahl: 'b', kern: ['zwei Züge', 'eigenen Zug'], verboten: ['Ein Zug:'] },
  F2: { wahl: 'a', kern: ['wehrt den ganzen Schlangenfrass', 'beide Karten bleiben liegen'] },
  F3: { wahl: 'a', kern: ['nur eine Farbkarte beginnt eine Schlange'] },
  F4: { wahl: 'a, c', kern: ['nur in eine eigene Schlange', 'beliebige Stelle', 'neue eigene Schlange'] },
  F5: { wahl: 'a, c', kern: ['kein Auffüllen im ausgesetzten Zug', 'auch zwischen Grube und ausgesetztem Zug'] },
  F6: { wahl: 'a', kern: ['nur an ein Ende einer bestehenden gegnerischen Schlange'] },
  F7: { wahl: 'a', kern: ['nur zwei Farbkarten derselben Farbe'] },
  F8: {
    wahl: FREI,
    kern: ['der letzte Zug verfällt', 'keinen letzten Zug mehr', 'darf sich mit Farbenschutz verteidigen'],
    wortlaut: [
      '„man darf auch in der letzten Runde einen Spieler aussetzen lassen. Er hat dann keinen letzetn Zug mehr. Er darf aber verteidigen mit Farbenschutz“',
    ],
  },
  F8a: {
    wahl: 'b',
    kern: ['ohne Wirkung auf den Ablagestapel'],
    verboten: ['kein Ziel'],
    wortlaut: ['„Ja, ohne Wirkung“'],
  },
  F9: { wahl: 'a', kern: ['alle Punktgleichen gewinnen'] },
  F10: {
    wahl: 'a',
    kern: ['ein weiterer Zug folgt nicht', 'kein weiterer Verdoppler mit Wirkung'],
    // Rückfrage vom 20.11.2026 zu A7.8 („Im zweiten Zug darfst du keinen weiteren Verdoppler spielen“).
    wortlaut: ['„Ja, wirkungslos“'],
  },
  F11: {
    wahl: 'b, d',
    kern: ['ab 3 Farbkarten', 'bekommt niemand den Bonus'],
    verboten: ['schon ab 2 Farbkarten'],
    wortlaut: ['„längste Schlange muss mindestens aus 3 Farbkarten bestehen nicht nur 2. sonst ok“', '„Ja, genau so“'],
  },
  F12: {
    wahl: 'a',
    kern: ['nur, wenn die Karte kein mögliches Ziel hat', 'Farbenschutz darf immer wirkungslos abgelegt werden'],
  },
  F13: { wahl: 'a', kern: ['muss danach anders sein'] },
  F14: { wahl: 'a', kern: ['im zweiten Zug nach einem Verdoppler ist wieder eine'] },
  F15: { wahl: 'a', kern: ['vollständig einsehbar'] },
  G9: {
    wahl: 'a',
    kern: [
      'drei Joker nebeneinander',
      'gültige Gruppe',
      'Vielfaltbonus',
      'Farbharmonie',
      // Präzisierung vom 20.11.2026: Regenbogenschlangen bringen keine Punkte, die Fusion die Summe darunter.
      'drei Regenbogenschlangen nebeneinander: eine Gruppe mit 0 Punkten',
      'Regenbogenschlange, Farbenfusion aus Grün und Grün, Regenbogenschlange: eine Gruppe mit 6 Punkten',
    ],
    // Gegenprobe: Möglichkeit b verlangt eine echte Farbkarte in jeder Gruppe.
    verboten: ['echte Farbkarte', 'zählen weder'],
    wortlaut: ['„Ja, als Gruppe“'],
    datum: DATUM_G9,
  },
  // Sammelantwort vom 21.11.2026, je Teil der Frage (P0.5e).
  ...ERWARTET_G,
}

/** Kleinbuchstaben, Leerraum zusammengefasst: Kernaussagen gelten auch am Satzanfang. */
function vergleichbar(text: string): string {
  return normalisiert(text).toLowerCase()
}

describe('P0.5: Antworten des Autors vom 13.11.2026, 20.11.2026 und 21.11.2026', () => {
  it('P0.5: genau die beantworteten Fragen stehen in der Erwartungstabelle', () => {
    const beantwortet = [...bloecke].filter(([, block]) => feld(block, 'Antwort') !== OFFEN).map(([nr]) => nr)

    expect(beantwortet.sort(), 'beantwortete Fragen ohne oder mit überzähliger Erwartung').toEqual(
      Object.keys(ERWARTET).sort(),
    )
  })

  for (const [nr, { wahl, kern, verboten = [], wortlaut = [], datum = DATUM_F }] of Object.entries(ERWARTET)) {
    it(`P0.5: ${nr}: gewählt „${wahl}“, die Kernaussage steht in REGELFRAGEN.md und in Teil D`, () => {
      const block = bloecke.get(nr) ?? ''
      const antwort = feld(block, 'Antwort')
      const gewaehlteTexte = wahl.split(', ').map((buchstabe) => moeglichkeitText(block, buchstabe))
      const fragenblatt = vergleichbar([antwort, ...gewaehlteTexte].join(' '))
      const eintrag = vergleichbar(teilD.get(nr)?.antwort ?? '')

      expect(gewaehlt(antwort), `${nr}: gewählte Möglichkeit`).toBe(wahl)
      expect(feld(block, 'Datum'), `${nr}: Datum der Antwort`).toBe(datum)
      for (const aussage of kern.map(vergleichbar)) {
        expect(fragenblatt, `${nr}: REGELFRAGEN.md ohne Kernaussage „${aussage}“`).toContain(aussage)
        expect(eintrag, `${nr}: Teil D ohne Kernaussage „${aussage}“`).toContain(aussage)
      }
      for (const aussage of verboten.map(vergleichbar)) {
        expect(fragenblatt, `${nr}: REGELFRAGEN.md enthält „${aussage}“`).not.toContain(aussage)
        expect(eintrag, `${nr}: Teil D enthält „${aussage}“`).not.toContain(aussage)
      }
      for (const zitat of wortlaut) {
        expect(normalisiert(antwort), `${nr}: Wortlaut des Autors fehlt`).toContain(zitat)
      }
    })
  }

  for (const [nr, { teile }] of Object.entries(ERWARTET)) {
    if (!teile) continue
    it(`P0.5e: ${nr}: jeder gewählte Teil hat eine eigene Kernaussage, jede andere Möglichkeit desselben Teils eine Gegenprobe`, () => {
      const block = bloecke.get(nr) ?? ''
      const eintrag = vergleichbar(teilD.get(nr)?.antwort ?? '')
      const gruppen = teileDerFrage(block)
      const gewaehlteBuchstaben = Object.keys(teile)
      expect(
        gewaehlteBuchstaben.map((buchstabe) => gruppen.findIndex((gruppe) => gruppe.includes(buchstabe))),
        `${nr}: je Teil der Frage genau eine gewählte Möglichkeit, in der Reihenfolge der Teile`,
      ).toEqual(gruppen.map((_, i) => i))

      for (const [buchstabe, { kern, verboten }] of Object.entries(teile)) {
        const andereTeile = gewaehlteBuchstaben.filter((b) => b !== buchstabe).map((b) => vergleichbar(moeglichkeitText(block, b)))
        const gruppe = gruppen.find((g) => g.includes(buchstabe)) ?? []
        expect(kern.length, `${nr} ${buchstabe}: keine Kernaussage`).toBeGreaterThan(0)
        for (const aussage of kern.map(vergleichbar)) {
          expect(vergleichbar(moeglichkeitText(block, buchstabe)), `${nr} ${buchstabe}: Kernaussage stammt nicht aus der Möglichkeit`).toContain(aussage)
          for (const text of andereTeile) {
            expect(text, `${nr} ${buchstabe}: Kernaussage „${aussage}“ passt auch zu einem anderen Teil`).not.toContain(aussage)
          }
          expect(eintrag.split(aussage).length - 1, `${nr} ${buchstabe}: Kernaussage „${aussage}“ steht nicht genau einmal in Teil D`).toBe(1)
        }
        expect(Object.keys(verboten), `${nr} ${buchstabe}: Gegenproben für genau die anderen Möglichkeiten dieses Teils`).toEqual(
          gruppe.filter((b) => b !== buchstabe),
        )
        for (const [andere, saetze] of Object.entries(verboten)) {
          expect(saetze.length, `${nr} ${andere}: keine Gegenprobe`).toBeGreaterThan(0)
          for (const satz of saetze.map(vergleichbar)) {
            expect(vergleichbar(moeglichkeitText(block, andere)), `${nr} ${andere}: Gegenprobe „${satz}“ stammt nicht aus der Möglichkeit`).toContain(satz)
          }
        }
      }
    })
  }

  it('P0.5e: keine Frage ist mehr offen; G1–G8 und G10–G23 stehen der Reihe nach als D34–D55 in Teil D', () => {
    const offen = [...bloecke].filter(([, block]) => feld(block, 'Antwort') === OFFEN || feld(block, 'Datum') === OFFEN)
    expect(offen.map(([nr]) => nr), 'Fragen ohne Antwort oder Datum').toEqual([])

    const sammel = Object.entries(ERWARTET).filter(([, erwartung]) => erwartung.datum === DATUM_G).map(([nr]) => nr)
    const g = [...bloecke.keys()].filter((nr) => nr.startsWith('G') && nr !== 'G9')
    expect(sammel, 'Sammelantwort vom 21.11.2026: genau G1–G8 und G10–G23').toEqual(g)
    expect(g.map((nr) => teilD.get(nr)?.nr), 'Teil D: Nummern der Antworten auf G1–G8 und G10–G23').toEqual(
      g.map((_, i) => `D${34 + i}`),
    )
  })

  it('P0.5: F8a steht so da, wie die Nachfrage dem Autor gestellt wurde', () => {
    expect(feld(bloecke.get('F8a') ?? '', 'Frage')).toBe(
      'Darf man die Schlangengrube auf einen Spieler spielen, der seinen letzten Zug schon gemacht hat?',
    )
  })

  it('P0.5: jede Nachfrage steht direkt nach ihrer Ausgangsfrage, und deren Antwort nennt sie', () => {
    const reihenfolge = [...bloecke.keys()]

    for (const nr of nachfragen) {
      const ausgang = NACHFRAGE.exec(nr)?.[1] ?? ''
      const davor = reihenfolge
        .slice(0, reihenfolge.indexOf(nr))
        .filter((n) => !NACHFRAGE.test(n))
        .at(-1)

      expect(davor, `${nr}: steht nicht nach ihrer Ausgangsfrage ${ausgang}`).toBe(ausgang)
      expect(feld(bloecke.get(ausgang) ?? '', 'Antwort'), `${ausgang}: Antwort nennt ${nr} nicht`).toMatch(alsWort(nr))
    }
  })

  it('P0.5: Teil D vergibt jede Nummer einmal und führt nur Regelfragen aus REGELFRAGEN.md', () => {
    const nummern = teilDTabelle.zeilen.map((zeile) => zeile[teilDTabelle.kopf.indexOf('Nr.')])

    expect(teilDTabelle.kopf, 'Teil D: Spalte „Datum“ fehlt').toContain('Datum')
    expect(new Set(nummern).size, `Teil D: doppelte Nummer in ${nummern.join(', ')}`).toBe(nummern.length)
    for (const nr of teilD.keys()) {
      expect(bloecke.has(nr), `Teil D: ${nr} gibt es in REGELFRAGEN.md nicht`).toBe(true)
    }
  })

  it('P0.5: Teil A bleibt Spiegel der Website und enthält keine der neuen Antworten', () => {
    const teilA = normalisiert(abschnitt(spec, '##', 'Teil A'))

    expect(teilA, 'Teil A enthält das Datum der Antworten').not.toContain(DATUM_F)
    expect(teilA, 'Teil A enthält „Website folgt“').not.toContain('Website folgt')
    for (const { antwort } of teilD.values()) {
      for (const zitat of antwort.match(ZITAT) ?? []) {
        expect(teilA, `Teil A enthält den Wortlaut des Autors ${zitat}`).not.toContain(zitat)
      }
    }
  })
})
