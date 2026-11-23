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

  it('P0.5f: „Stand und Verlauf“ führt die Rückfragen aus X3, die A10-Einordnung und die Streichungen nach X1', () => {
    expect(fehlende(teil('E'), ['- **23.11.2026, Task P0.5f:**', 'D56 und D57', 'In Iteration 2 ordnet D57', 'den Satz aus A10 zu den zuletzt gezogenen Karten', 'C1, C15 und C20'])).toEqual([])
  })

  it('P0.5g: „Stand und Verlauf“ führt die Rückfragen aus X2 und X3 als D58–D65, die Ergänzung von D48 und die Streichungen nach X2b', () => {
    const e = teil('E')
    expect(fehlende(e, ['- **23.11.2026, Task P0.5g:**', 'D58–D65', 'D48 ist um die Antwort ergänzt', 'C21 und C23', 'Teil A unverändert.'])).toEqual([])
    // Der neueste Eintrag steht oben.
    expect(e.indexOf('Task P0.5g:'), 'P0.5g steht nicht vor P0.5f').toBeLessThan(e.indexOf('Task P0.5f:'))
  })
})
