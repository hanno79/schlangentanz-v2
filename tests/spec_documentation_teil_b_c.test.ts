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

  it('vermerkt jede gestrichene Nummer unter „Behoben und gestrichen“', () => {
    const c = teil('C')
    const nummern = spalten(tabelleMitSpalte(c, 'Fundstelle'), 'Nr.').map(([nr]) => Number(nr.slice(1)))
    const gestrichen = /Behoben und gestrichen:[^\n]*/.exec(c)?.[0] ?? ''
    const fehlend = Array.from({ length: Math.max(...nummern) }, (_, i) => `C${i + 1}`).filter(
      (nr) => !nummern.includes(Number(nr.slice(1))) && !new RegExp(`\\b${nr}\\b`).test(gestrichen),
    )
    expect(fehlend, 'Teil C: Nummern weder in der Tabelle noch unter „Behoben und gestrichen“').toEqual([])
  })

  it('P0.5f: C1, C15 und C20 sind nach X1 gestrichen; B1 nennt nicht mehr „14 von 15“', () => {
    const nummern = spalten(tabelleMitSpalte(teil('C'), 'Fundstelle'), 'Nr.').map(([nr]) => nr)
    expect(nummern.filter((nr) => ['C1', 'C15', 'C20'].includes(nr)), 'Teil C führt noch').toEqual([])
    expect(fehlende(teil('C'), ['C1, C15 und C20 (X1, 23.11.2026)'])).toEqual([])
    const aufgaben = spalten(tabelleMitSpalte(teil('B'), 'Digital heute'), 'Bestandteil', 'Digital heute').find(([was]) => was === '15 Aufgabenkarten')
    expect(aufgaben?.[1], 'B1: Zeile „15 Aufgabenkarten“').not.toContain('14 von 15')
  })
})
