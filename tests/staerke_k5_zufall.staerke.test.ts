// @vitest-environment node
import { describe, it } from 'vitest'
import { MESSLAEUFE, pruefeMesslauf } from './staerke_k5'

describe('K5: Stärkenachweis der soliden KI ohne Erweiterung, Kriterium 1', () => {
  it('K5 Kriterium 1 und 4: 500 Partien zu zweit gegen die Zufalls-KI, mindestens die Schwelle an Siegen; alle enden ohne Invariantenverletzung', async () => {
    await pruefeMesslauf(MESSLAEUFE.zufall)
  }, 3_600_000)
})
