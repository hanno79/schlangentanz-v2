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
} from './regelfragen_lesen'

// Stand der Antworten des Autors. Die Form jeder Antwort prüft
// tests/regelfragen.test.ts; hier steht, was der Autor wann geantwortet hat.

/** Am 13.11.2026 hat der Autor F1–F15 und die Nachfrage F8a beantwortet. */
const DATUM_F = '13.11.2026'
/** Am 20.11.2026 hat der Autor G9 beantwortet. */
const DATUM_G9 = '20.11.2026'
/** Am 21.11.2026 hat der Autor alle übrigen Fragen G mit einer Sammelantwort beantwortet. */
const DATUM_G = '21.11.2026'
/** Sammelantwort vom 21.11.2026 zu G1–G8 und G10–G23, wörtlich. */
const SAMMELANTWORT_G = ['„ja zu deinen vorschlägen.“']

/** `datum` fehlt bei den Antworten vom 13.11.2026 (`DATUM_F`). */
type Erwartung = { wahl: string; kern: string[]; verboten?: string[]; wortlaut?: string[]; datum?: string }

/**
 * Was der Autor gewählt hat, abgeleitet aus seinen Worten, nicht aus den Dateien:
 * „Alle andere Vorschläge sind passend“ (also der Vorschlag), F8 frei, F11 „mindestens
 * aus 3 Farbkarten … sonst ok“ mit der Bestätigung „Ja, genau so“, F8a „Ja, ohne Wirkung“, G9 „Ja, als Gruppe“ (Vorschlag a, 20.11.2026),
 * die übrigen Fragen G „ja zu deinen vorschlägen.“ (also je der Vorschlag, 21.11.2026).
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
  // P0.5e: `verboten` sind je Teil die Kernsätze der nicht gewählten Möglichkeiten (Gegenprobe).
  G1: sammelantwort('a', ['keine Schlangenhäutung, keinen Schlangenkorb', 'genau einen Schalter'], ['einzeln wählbar']),
  G2: sammelantwort('a', ['sobald sie einmal in einem eigenen Zug erfüllt war', 'nicht mehr zerstören'], ['bei der Wertung am Spielende erfüllt']),
  G3: sammelantwort(
    'a',
    ['aus der Hand gespielt hat', 'auch ein Farbenschutz zur Abwehr', 'eine abgewehrte und der Schlangenkorb'],
    ['ausserhalb des Zuges zählt nicht', 'deren Wirkung eingetreten ist'],
  ),
  G4: sammelantwort(
    'a, c',
    ['selbst in einer eigenen Schlange', 'aus derselben Häutung entstehen'],
    ['auch wenn ein Gegner sie gespielt hat', 'aus zwei Häutungen stammen'],
  ),
  G5: sammelantwort(
    'b, c',
    ['zwei Schlangen mit je mindestens vier Farben', 'über alle vorhandenen Schlangen'],
    ['eine Schlange genügt:', 'mit einer Schlange ist die Aufgabe nie erfüllt'],
  ),
  G6: sammelantwort(
    'b, c',
    ['ungerade', 'die mittlere Karte ist die Achse', 'Joker zählen als die passende Farbe', 'ist die Aufgabe nicht erfüllt'],
    ['muss gerade sein', 'werden übersprungen', 'auch ein Joker, verhindert'],
  ),
  G7: sammelantwort('a', ['mindestens zweimal direkt hintereinander', 'AABCAABC'], ['genau einmal vor', 'durch andere Karten getrennt']),
  G8: sammelantwort(
    'b, c',
    ['irgendwo in derselben Schlange', 'Joker zählen mit', 'eine Farbenfusion zählt als eine Karte'],
    ['müssen nebeneinander liegen', 'nur echte gelbe'],
  ),
  G10: sammelantwort(
    'a, c, e',
    ['zählt zu den 5 Handkarten', 'ist die Sonderkarte des Zuges', 'die vollständige Liste'],
    ['sofort durch eine neue Karte ersetzt', 'kommt zusätzlich', 'es gibt weitere Boni'],
  ),
  G11: sammelantwort(
    'a, c, e',
    ['zusätzlich zu den Karten des Zuges, in beliebiger Art', 'nicht mit Wirkung gespielt', 'zieht, was da ist'],
    ['zusammen höchstens eine Farbkarte', 'gibt einen zweiten Zug', 'nicht wählbar'],
  ),
  G12: sammelantwort(
    'a, d',
    ['nur Farbkarten gegen Farbkarten', 'die getauschte Karte kommt auf die Hand'],
    ['beliebige Karten in beide Richtungen', 'auf den eigenen Ablagestapel'],
  ),
  G13: sammelantwort(
    'a, c, e',
    ['auch eine Schlangenblockade', 'abwehrbar mit Farbenschutz', 'des Spielers, der den Korb nutzt'],
    ['jede ausser der Schlangenblockade', 'nicht abwehrbar', 'dem die Schlange gehört'],
  ),
  G14: sammelantwort(
    'a, c, f, g',
    ['dieselben drei wie bei der Comeback-Karte', 'auch zweimal dieselbe Art', 'nicht mit anderen zugerweiternden Effekten kombinierbar'],
    ['zwei Fusionen in einem Zug sind möglich', 'gibt einen zweiten Zug', 'zusammen höchstens eine weitere'],
  ),
  G15: sammelantwort('a', ['schliessen sich gegenseitig aus', 'Risiko-Karten zählen nicht dazu'], ['dürfen zusammen genutzt werden', 'zählt als zugerweiternd']),
  G16: sammelantwort(
    'a, d, f',
    ['jede Karte in der Schlange zählt eins', 'samt ihren zwei Karten zählt eins', 'die Länge null', 'irgendwann in diesem Zug'],
    ['zählt drei', 'nur Farbkarten zählen', 'nicht einsetzbar', 'vor der ersten Karte'],
  ),
  G17: sammelantwort(
    'a, c, e, g',
    ['nicht wählbar', 'zieht, was da ist', 'weil nichts gezogen werden kann', 'wie A8.1 es für alle Zusatzaktionen sagt'],
    ['zieht trotzdem drei', 'blosses Abwerfen', 'nur einmal je Zug'],
  ),
  G18: sammelantwort('a', ['samt zweitem Zug nach einem Verdoppler', 'keine zweite Risiko-Karte'], ['heisst Teilzug', 'weitere Risiko-Karte erlaubt']),
  G19: sammelantwort(
    'a, c, e, g',
    ['auf den eigenen Ablagestapel', 'es ist ein Tausch', 'bei Erfolg auf die eigene Hand, bei Misserfolg auf den eigenen Ablagestapel'],
    ['in beiden Fällen auf den eigenen Ablagestapel', 'an den begünstigten Gegner', 'die Hand wird kleiner'],
  ),
  G20: sammelantwort(
    'a, c, e, g',
    ['benennt der Spieler eine Farbkarte seiner Hand', 'zwischen der geplanten Farbkarte und der obersten Stapelkarte', 'nicht wählbar', 'Ende einer eigenen Schlange'],
    ['der Spieler am Zug wählt', 'jedes Ende jeder Schlange', 'erst bei Misserfolg wählt'],
  ),
  G21: sammelantwort('a, d', ['jede Farbkarte der Hand', 'davor oder dahinter'], ['auch eine Sonderkarte wie die Regenbogenschlange', 'immer direkt dahinter', 'mit demselben Punktewert wie die ersetzte']),
  G22: sammelantwort(
    'a, c, e',
    ['die erste der zwei Karten', 'bleibt nur die andere Möglichkeit', 'liegen nie auf einem Ablagestapel'],
    ['zieht zwei weitere', 'nicht wählbar', 'eine Sperre'],
  ),
  G23: sammelantwort('a, c', ['nicht spielbar, weil keine Karte aufgedeckt werden kann', 'gleich wer die letzte Karte nimmt'], ['gilt sie als gescheitert', 'zählt die Schlussrunde von ihm aus']),
}

/** Erwartung zu einer Frage, die die Sammelantwort vom 21.11.2026 beantwortet. */
function sammelantwort(wahl: string, kern: string[], verboten: string[]): Erwartung {
  return { wahl, kern, verboten, wortlaut: SAMMELANTWORT_G, datum: DATUM_G }
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
