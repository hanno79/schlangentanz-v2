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
})
