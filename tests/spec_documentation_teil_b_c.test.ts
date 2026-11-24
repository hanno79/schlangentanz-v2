import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { fehlende, spalten, tabelleMitSpalte, teil } from './spec_documentation_hilfen'

/*
`docs/GAME_SPEC.md`, Teil B (digitale Fassung) und Teil C (Abweichungen der
Engine, Arbeitsliste).
*/

/** B1, Spalte „Digital heute“ der Zeile „15 Aufgabenkarten“. */
function aufgabenZeileB1(): string {
  const zeile = spalten(tabelleMitSpalte(teil('B'), 'Digital heute'), 'Bestandteil', 'Digital heute').find(([was]) => was === '15 Aufgabenkarten')
  expect(zeile, 'B1: Zeile „15 Aufgabenkarten“ fehlt').toBeDefined()
  return zeile?.[1] ?? ''
}

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
    expect(aufgabenZeileB1(), 'B1: Zeile „15 Aufgabenkarten“').not.toContain('14 von 15')
  })

  // Stand vor dem Merge von X2a: Wer C10 und C14 streicht, passt diesen Test und den zu B1 an.
  it('P0.5g: C21 und C23 sind nach X2b gestrichen; C10 und C14 nennen den Stand nach X2b und X2c', () => {
    const c = teil('C')
    const zeilen = new Map(spalten(tabelleMitSpalte(c, 'Fundstelle'), 'Nr.', 'Engine heute').map(([nr, engine]) => [nr, engine]))
    expect(['C21', 'C23'].filter((nr) => zeilen.has(nr)), 'Teil C führt noch').toEqual([])
    expect(fehlende(c, ['C21 und C23 (X2b, 23.11.2026)', 'C10 teilweise (X2b, X2c, 23.11.2026)'])).toEqual([])
    expect(fehlende(zeilen.get('C10') ?? '', ['X2b und X2c behoben', 'X2a']), 'C10: Spalte „Engine heute“').toEqual([])
    expect(fehlende(zeilen.get('C14') ?? '', ['Platzhalter, der nie erfüllt ist', 'X2a']), 'C14: Spalte „Engine heute“').toEqual([])
  })

  it('P0.5g: jede Fundstelle in Teil C nennt eine Datei, die es gibt', () => {
    const fehlend = spalten(tabelleMitSpalte(teil('C'), 'Fundstelle'), 'Nr.', 'Fundstelle').flatMap(([nr, fundstelle]) =>
      [...fundstelle.matchAll(/`(src\/[^`]+)`/g)].filter(([, pfad]) => !existsSync(pfad)).map(([, pfad]) => `${nr}: ${pfad}`),
    )
    expect(fehlend, 'Teil C: Fundstellen ohne Datei').toEqual([])
  })

  it('P0.5g: die Einleitung von B1 nennt den Stand der Tabelle nicht mehr mit dem 12.11.2026', () => {
    const einleitung = teil('B').slice(teil('B').indexOf('### B1 Umfang'), teil('B').indexOf('| Bestandteil'))
    expect(einleitung, 'B1: Einleitung').not.toContain('am 12.11.2026 umgesetzt')
    expect(fehlende(einleitung, ['Die Tabelle zeigt den Stand vom 23.11.2026'])).toEqual([])
  })

  it('P0.5g: B1 nennt die Bedingungen aus X2b und X2c als umgesetzt und nur die fünf aus X2a als Platzhalter', () => {
    const aufgaben = aufgabenZeileB1()
    expect(aufgaben, 'B1: Zeile „15 Aufgabenkarten“').not.toContain('die 15 Bedingungen sind noch Platzhalter')
    expect(fehlende(aufgaben, ['zehn Bedingungen nach A9 (X2b, X2c, 23.11.2026)', '„Farbenpracht“, „Farbharmonie“, „Farbkombination“, „Gelber Schatz“ und „Lila Riese“', 'X2a'])).toEqual([])
  })
})
