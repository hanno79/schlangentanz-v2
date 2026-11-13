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
  nachfragen,
  normalisiert,
  planFragen,
  spec,
  teilD,
  teilDTabelle,
} from './regelfragen_lesen'

// Stand der Antworten des Autors. Die Form jeder Antwort prüft
// tests/regelfragen.test.ts; hier steht, was der Autor wann geantwortet hat.

/** Am 13.11.2026 hat der Autor F1–F15 und die Nachfrage F8a beantwortet. */
const DATUM_F = '13.11.2026'

describe('P0.5: Antworten des Autors vom 13.11.2026', () => {
  it(`P0.5: F1–F15 hat der Autor am ${DATUM_F} beantwortet`, () => {
    for (const { nr } of planFragen.filter((frage) => frage.nr.startsWith('F'))) {
      const block = bloecke.get(nr) ?? ''

      expect(feld(block, 'Antwort'), `${nr}: noch offen`).not.toBe(OFFEN)
      expect(feld(block, 'Datum'), `${nr}: Datum der Antwort`).toBe(DATUM_F)
    }
  })

  it('P0.5: F8 frei, F11 b, d und F8a b halten den Wortlaut des Autors fest', () => {
    const f8 = bloecke.get('F8') ?? ''
    const f8a = bloecke.get('F8a') ?? ''
    const f11 = bloecke.get('F11') ?? ''

    expect(feld(f8, 'Antwort').startsWith(FREI), 'F8: als freie Antwort gekennzeichnet').toBe(true)
    expect(normalisiert(feld(f8, 'Antwort')), 'F8: Wortlaut des Autors').toContain(
      '„man darf auch in der letzten Runde einen Spieler aussetzen lassen. Er hat dann keinen letzetn Zug mehr. Er darf aber verteidigen mit Farbenschutz“',
    )
    expect(buchstabenAm(feld(f11, 'Antwort')), 'F11: Antwort').toBe('b, d')
    expect(feld(f11, 'Antwort'), 'F11: Wortlaut des Autors').toContain(
      '„längste Schlange muss mindestens aus 3 Farbkarten bestehen nicht nur 2. sonst ok“',
    )
    expect(feld(f8a, 'Frage'), 'F8a: Frage, wie sie dem Autor gestellt wurde').toBe(
      'Darf man die Schlangengrube auf einen Spieler spielen, der seinen letzten Zug schon gemacht hat?',
    )
    expect(buchstabenAm(feld(f8a, 'Antwort')), 'F8a: Antwort').toBe('b')
    expect(feld(f8a, 'Antwort'), 'F8a: Wortlaut des Autors').toContain('„Ja, ohne Wirkung“')
    expect(feld(f8a, 'Datum'), 'F8a: Datum der Antwort').toBe(DATUM_F)
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
