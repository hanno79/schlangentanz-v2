// @vitest-environment node
import { describe, it } from 'vitest'
import { MESSDAUER, MESSLAEUFE_ERWEITERUNG, pruefeMesslauf, titel } from './staerke_k5'

describe('K5: Stärkenachweis der soliden KI mit Erweiterung, Kriterium 5 zu Kriterium 3', () => {
  it(titel(MESSLAEUFE_ERWEITERUNG.vier), async ({ annotate }) => {
    await pruefeMesslauf(MESSLAEUFE_ERWEITERUNG.vier, annotate)
  }, MESSDAUER)
})
