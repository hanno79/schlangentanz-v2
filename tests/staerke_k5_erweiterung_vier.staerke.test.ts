// @vitest-environment node
import { describe, it } from 'vitest'
import { MESSLAEUFE_ERWEITERUNG, pruefeMesslauf } from './staerke_k5'

describe('K5: Stärkenachweis der soliden KI mit Erweiterung, Kriterium 5 zu Kriterium 3', () => {
  it('K5 Kriterium 5 und 4: mit Erweiterung 300 Partien zu viert gegen drei Zufalls-KIs, mindestens die Schwelle an Siegen; alle enden ohne Invariantenverletzung', async ({ annotate }) => {
    await pruefeMesslauf(MESSLAEUFE_ERWEITERUNG.vier, annotate)
  }, 3_600_000)
})
