// @vitest-environment node
import { describe, it } from 'vitest'
import { MESSLAEUFE, pruefeMesslauf } from './staerke_k5'

describe('K5: Stärkenachweis der soliden KI ohne Erweiterung, Kriterium 2', () => {
  it('K5 Kriterium 2 und 4: 500 Partien zu zweit gegen „erste erlaubte Aktion“, mindestens die Schwelle an Siegen; alle enden ohne Invariantenverletzung', async () => {
    await pruefeMesslauf(MESSLAEUFE.erste)
  }, 3_600_000)
})
