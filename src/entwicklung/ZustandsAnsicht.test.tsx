import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { spieleBisZumEnde } from '../ui/spiel/__tests__/endstaende'
import { erzeugeSzenario } from './szenarien'
import { ZustandsAnsicht } from './ZustandsAnsicht'

/*
O8 am Entwicklertisch (Hinweis H1 aus E2): Nach Spielende bleibt
`zug.spielerIndex` beim zuletzt Spielenden stehen. Das ist kein „am Zug“; die
Lage sagt „niemand“, und keine Spielerkarte darf die Marke tragen.
*/

afterEach(cleanup)

describe('O8: Marke „am Zug“ am Entwicklertisch', () => {
  it('O8: nach einer ganzen Partie trägt kein Spieler die Marke „am Zug“', () => {
    render(<ZustandsAnsicht zustand={spieleBisZumEnde(5, 3, false)} />)
    expect(screen.getByTestId('partiephase')).toHaveTextContent('Beendet')
    expect(screen.queryByText('am Zug')).toBeNull()
    expect(document.querySelector('.et-spieler--aktiv')).toBeNull()
  })

  it('O8 Gegenprobe: in einer laufenden Partie trägt genau ein Spieler die Marke', () => {
    render(<ZustandsAnsicht zustand={erzeugeSzenario('schlussrunde-ohne-dich')} />)
    expect(screen.getAllByText('am Zug')).toHaveLength(1)
  })
})
