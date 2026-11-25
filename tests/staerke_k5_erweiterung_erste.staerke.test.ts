// @vitest-environment node
import { describe, it } from 'vitest'
import { MESSLAEUFE_ERWEITERUNG, pruefeMesslauf } from './staerke_k5'

describe('K5: Stärkenachweis der soliden KI mit Erweiterung, Kriterium 5 zu Kriterium 2', () => {
  it('K5 Kriterium 5 und 4: mit Erweiterung 500 Partien zu zweit gegen „erste erlaubte Aktion“, mindestens die Schwelle an Siegen; alle enden ohne Invariantenverletzung', async ({ annotate }) => {
    await pruefeMesslauf(MESSLAEUFE_ERWEITERUNG.erste, annotate)
  }, 3_600_000)
})
