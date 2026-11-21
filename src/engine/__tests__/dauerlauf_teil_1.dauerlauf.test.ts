import { describe, it } from 'vitest'
import { pruefeLangenDauerlauf } from './dauerlauf_lang'

describe('A10/A5/A6/B2: Dauerlauf mit 2000 Zufallspartien, Teil 1 von 4 (E11, Kriterium 3)', () => {
  it('A10: 500 Zufallspartien (Saaten 1 bis 250 ohne, 1001 bis 1250 mit Erweiterung) enden alle; Invarianten, Speichern und Laden, Aufzählung, verfälschte Aktionen, Handgrenze und Stapel halten in jedem Schritt', () => {
    pruefeLangenDauerlauf(1)
  }, 3_600_000)
})
