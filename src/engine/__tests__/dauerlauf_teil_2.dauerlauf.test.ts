// @vitest-environment node
import { describe, it } from 'vitest'
import { pruefeLangenDauerlauf } from './dauerlauf_lang'

describe('A10/A5/A6/B2: Dauerlauf mit 3000 Zufallspartien, davon 2000 mit Erweiterung, Teil 2 von 4 (E11 Kriterium 3, X7)', () => {
  it('A10/A8/A9: 750 Zufallspartien, 250 ohne und 500 mit Erweiterung, enden alle; Invarianten, Speichern und Laden, Aufzählung, verfälschte Aktionen, Handgrenze und Stapel halten in jedem Schritt, und alle Teile der Erweiterung kommen vor', () => {
    pruefeLangenDauerlauf(2)
  }, 3_600_000)
})
