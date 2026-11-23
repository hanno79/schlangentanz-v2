import { describe, expect, it } from 'vitest'
import { fehlende, teil } from './spec_documentation_hilfen'

/*
`docs/GAME_SPEC.md`, Teil E: frühere R-Nummern, Stand und Verlauf.
*/

describe('GAME_SPEC Teil E — frühere R-Nummern und Verlauf', () => {
  it('macht die früheren R-Nummern auffindbar', () => {
    expect(
      fehlende(teil('E'), [
        'R1.2a',
        'R2.3a',
        'R3.5a',
        'R6.4',
        'R7.1a',
        'R8.4a',
        '### Stand und Verlauf',
      ]),
    ).toEqual([])
  })

  it('P0.5f: „Stand und Verlauf“ führt die Rückfragen aus X3 vom 22.11.2026', () => {
    expect(fehlende(teil('E'), ['- **23.11.2026, Task P0.5f:**', 'D56 und D57', 'Iteration 2', 'A10', 'C1, C15 und C20'])).toEqual([])
  })
})
