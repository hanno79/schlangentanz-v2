import { describe, it } from 'vitest'
import { pruefeLangenDauerlauf } from './dauerlauf_lang'

describe('A10/A5/A6/B2: Dauerlauf mit 2000 Zufallspartien, Teil 4 von 4 (E11, Kriterium 3)', () => {
  it('A10: 500 Zufallspartien (Saaten 751 bis 1000 ohne, 1751 bis 2000 mit Erweiterung) enden alle; Invarianten, Speichern und Laden, Aufzählung, verfälschte Aktionen, Handgrenze und Stapel halten in jedem Schritt', () => {
    pruefeLangenDauerlauf(4)
  }, 3_600_000)
})
