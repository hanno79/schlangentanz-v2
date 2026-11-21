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
})
