import { describe, expect, it } from 'vitest'
import { fehlende, spalten, tabelleMitSpalte, teil } from './spec_documentation_hilfen'

/*
`docs/GAME_SPEC.md`, Teil B (digitale Fassung) und Teil C (Abweichungen der
Engine, Arbeitsliste).
*/

describe('GAME_SPEC Teil B — digitale Fassung', () => {
  it('trennt den digitalen Umfang von den Regeln', () => {
    expect(
      fehlende(teil('B'), [
        '### B1 Umfang',
        '### B2 Festlegungen',
        'Nichts hier ändert eine Regel aus Teil A.',
        'ein Mensch gegen 1, 2 oder 3 KI-Gegner',
        '**Verdeckte Information:**',
      ]),
    ).toEqual([])
  })
})

describe('GAME_SPEC Teil C — Abweichungen der Engine', () => {
  it('führt jede Abweichung der Engine mit Nummer und Fundstelle im Code', () => {
    // Die Liste darf leer werden: Das ist ihr Ziel. Jede Zeile, die dasteht,
    // muss aber eine Nummer und eine Datei nennen.
    const abweichungen = spalten(tabelleMitSpalte(teil('C'), 'Fundstelle'), 'Nr.', 'Fundstelle')
    const unvollstaendig = abweichungen.filter(
      ([nummer, fundstelle]) => !/^C\d+$/.test(nummer) || !/`src\/[^`]+`/.test(fundstelle),
    )
    expect(unvollstaendig).toEqual([])
  })

  it('P0.5f: C1, C15 und C20 sind nach X1 gestrichen und als behoben vermerkt; B1 nennt den Stand nach X1', () => {
    const nummern = spalten(tabelleMitSpalte(teil('C'), 'Fundstelle'), 'Nr.').map(([nr]) => nr)
    for (const nr of ['C1', 'C15', 'C20']) expect(nummern, `Teil C führt ${nr} noch`).not.toContain(nr)
    expect(fehlende(teil('C'), ['C1, C15 und C20 (X1, 23.11.2026)'])).toEqual([])
    const aufgaben = spalten(tabelleMitSpalte(teil('B'), 'Digital heute'), 'Bestandteil', 'Digital heute').find(([was]) => was === '15 Aufgabenkarten')
    expect(aufgaben?.[1], 'B1: Zeile „15 Aufgabenkarten“').not.toContain('14 von 15')
    expect(aufgaben?.[1], 'B1: Zeile „15 Aufgabenkarten“').toContain('X1')
  })
})
