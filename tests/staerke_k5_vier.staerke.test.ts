// @vitest-environment node
import { describe, it } from 'vitest'
import { MESSLAEUFE, pruefeMesslauf } from './staerke_k5'

describe('K5: Stärkenachweis der soliden KI ohne Erweiterung, Kriterium 3', () => {
  it('K5 Kriterium 3 und 4: 300 Partien zu viert gegen drei Zufalls-KIs, mindestens die Schwelle an Siegen; alle enden ohne Invariantenverletzung', async () => {
    await pruefeMesslauf(MESSLAEUFE.vier)
  }, 3_600_000)
})
