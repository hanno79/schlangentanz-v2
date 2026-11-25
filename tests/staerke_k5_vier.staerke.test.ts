// @vitest-environment node
import { describe, it } from 'vitest'
import { MESSDAUER, MESSLAEUFE, pruefeMesslauf, titel } from './staerke_k5'

describe('K5: Stärkenachweis der soliden KI ohne Erweiterung, Kriterium 3', () => {
  it(titel(MESSLAEUFE.vier), async ({ annotate }) => {
    await pruefeMesslauf(MESSLAEUFE.vier, annotate)
  }, MESSDAUER)
})
