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
  buchstabenAm,
  feld,
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

type Erwartung = { wahl: string; kern: string[]; verboten?: string[] }

/**
 * Was der Autor gewählt hat, abgeleitet aus seinen Worten, nicht aus den Dateien:
 * „Alle andere Vorschläge sind passend“ (also der Vorschlag), F8 frei („man darf auch
 * in der letzten Runde einen Spieler aussetzen lassen …“), F11 „mindestens aus 3
 * Farbkarten … sonst ok“ mit der Bestätigung „Ja, genau so“, F8a „Ja, ohne Wirkung“.
 * `kern` sind die tragenden Aussagen. Sie stehen in REGELFRAGEN.md (in der Antwort oder
 * in der gewählten Möglichkeit) und im Eintrag in Teil D; `verboten` steht in keinem von beiden.
 */
const ERWARTET: Record<string, Erwartung> = {
  F1: { wahl: 'b', kern: ['zwei Züge', 'eigenen Zug'], verboten: ['Ein Zug:'] },
  F2: { wahl: 'a', kern: ['wehrt den ganzen Schlangenfrass', 'beide Karten bleiben liegen'] },
  F3: { wahl: 'a', kern: ['nur eine Farbkarte beginnt eine Schlange'] },
  F4: { wahl: 'a, c', kern: ['nur in eine eigene Schlange', 'beliebige Stelle', 'neue eigene Schlange'] },
  F5: { wahl: 'a, c', kern: ['kein Auffüllen im ausgesetzten Zug', 'auch zwischen Grube und ausgesetztem Zug'] },
  F6: { wahl: 'a', kern: ['nur an ein Ende einer bestehenden gegnerischen Schlange'] },
  F7: { wahl: 'a', kern: ['nur zwei Farbkarten derselben Farbe'] },
  F8: { wahl: FREI, kern: ['letzte Zug verfällt', 'keinen letzten Zug mehr', 'Farbenschutz'] },
  F8a: { wahl: 'b', kern: ['ohne Wirkung auf den Ablagestapel'], verboten: ['kein Ziel'] },
  F9: { wahl: 'a', kern: ['alle Punktgleichen gewinnen'] },
  F10: { wahl: 'a', kern: ['ein weiterer Zug folgt nicht'] },
  F11: {
    wahl: 'b, d',
    kern: ['ab 3 Farbkarten', 'bekommt niemand den Bonus', '„Ja, genau so“'],
    verboten: ['schon ab 2 Farbkarten'],
  },
  F12: {
    wahl: 'a',
    kern: ['nur, wenn die Karte kein mögliches Ziel hat', 'Farbenschutz darf immer wirkungslos abgelegt werden'],
  },
  F13: { wahl: 'a', kern: ['muss danach anders sein'] },
  F14: { wahl: 'a', kern: ['im zweiten Zug nach einem Verdoppler ist wieder eine'] },
  F15: { wahl: 'a', kern: ['vollständig einsehbar'] },
}

/** Kleinbuchstaben, Leerraum zusammengefasst: Kernaussagen gelten auch am Satzanfang. */
function vergleichbar(text: string): string {
  return normalisiert(text).toLowerCase()
}

describe('P0.5: Antworten des Autors vom 13.11.2026', () => {
  it('P0.5: genau die beantworteten Fragen stehen in der Erwartungstabelle', () => {
    const beantwortet = [...bloecke].filter(([, block]) => feld(block, 'Antwort') !== OFFEN).map(([nr]) => nr)

    expect(beantwortet.sort(), 'beantwortete Fragen ohne oder mit überzähliger Erwartung').toEqual(
      Object.keys(ERWARTET).sort(),
    )
  })

  for (const [nr, { wahl, kern, verboten = [] }] of Object.entries(ERWARTET)) {
    it(`P0.5: ${nr}: gewählt „${wahl}“, die Kernaussage steht in REGELFRAGEN.md und in Teil D`, () => {
      const block = bloecke.get(nr) ?? ''
      const antwort = feld(block, 'Antwort')
      const gewaehlt = antwort.startsWith(FREI) ? FREI : buchstabenAm(antwort)
      const gewaehlteTexte = wahl === FREI ? [] : wahl.split(', ').map((b) => moeglichkeitText(block, b))
      const fragenblatt = vergleichbar([antwort, ...gewaehlteTexte].join(' '))
      const eintrag = vergleichbar(teilD.get(nr)?.antwort ?? '')

      expect(gewaehlt, `${nr}: gewählte Möglichkeit`).toBe(wahl)
      expect(feld(block, 'Datum'), `${nr}: Datum der Antwort`).toBe(DATUM_F)
      for (const aussage of kern.map(vergleichbar)) {
        expect(fragenblatt, `${nr}: REGELFRAGEN.md ohne Kernaussage „${aussage}“`).toContain(aussage)
        expect(eintrag, `${nr}: Teil D ohne Kernaussage „${aussage}“`).toContain(aussage)
      }
      for (const aussage of verboten.map(vergleichbar)) {
        expect(vergleichbar(antwort), `${nr}: REGELFRAGEN.md enthält „${aussage}“`).not.toContain(aussage)
        expect(eintrag, `${nr}: Teil D enthält „${aussage}“`).not.toContain(aussage)
      }
    })
  }

  it('P0.5: F8, F8a und F11 halten den Wortlaut des Autors fest', () => {
    const f8 = bloecke.get('F8') ?? ''
    const f8a = bloecke.get('F8a') ?? ''
    const f11 = bloecke.get('F11') ?? ''

    expect(normalisiert(feld(f8, 'Antwort')), 'F8: Wortlaut des Autors').toContain(
      '„man darf auch in der letzten Runde einen Spieler aussetzen lassen. Er hat dann keinen letzetn Zug mehr. Er darf aber verteidigen mit Farbenschutz“',
    )
    expect(feld(f11, 'Antwort'), 'F11: Wortlaut des Autors').toContain(
      '„längste Schlange muss mindestens aus 3 Farbkarten bestehen nicht nur 2. sonst ok“',
    )
    expect(feld(f8a, 'Frage'), 'F8a: Frage, wie sie dem Autor gestellt wurde').toBe(
      'Darf man die Schlangengrube auf einen Spieler spielen, der seinen letzten Zug schon gemacht hat?',
    )
    expect(feld(f8a, 'Antwort'), 'F8a: Wortlaut des Autors').toContain('„Ja, ohne Wirkung“')
  })

  it('P0.5: jede Nachfrage steht direkt nach ihrer Ausgangsfrage, und deren Antwort nennt sie', () => {
    const reihenfolge = [...bloecke.keys()]

    expect(nachfragen, 'Nachfrage F8a fehlt').toContain('F8a')
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
