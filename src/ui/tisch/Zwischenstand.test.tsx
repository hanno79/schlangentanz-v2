import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import type { Spielzustand } from '../../engine'
import { erzeugeSzenario } from '../../entwicklung/szenarien'
import { vorschauFuer } from '../spiel/haeutungsvorschau'
import { tischAnsicht } from '../spiel/tischAnsicht'
import { Tisch } from './Tisch'

/*
O8 K5: Während der Partie zeigt der Tisch je Spieler den Zwischenstand ohne
Kettenbonus, bei den Gegnern im Kopf, bei dir neben „Deine Schlangen“. Nach
Spielende trägt kein Gegner mehr „ist dran“.
*/

afterEach(cleanup)

function zeige(zustand: Spielzustand) {
  return render(<Tisch ansicht={tischAnsicht(zustand)} fuehreAus={() => {}} ablehnung={null} haeutungsVorschau={vorschauFuer(zustand)} />)
}

describe('O8 K5: Zwischenstand am Tisch', () => {
  it('O8 K5: jeder Gegner zeigt seine Punkte, du deine, mit dem Hinweis „ohne Kettenbonus“', () => {
    zeige(erzeugeSzenario('wertung-joker'))
    const gegner = within(screen.getByRole('region', { name: 'Gegner' })).getAllByRole('article')
    expect(gegner.map((kasten) => within(kasten).getByTestId('punkte').textContent)).toEqual([
      'Zwischenstand ohne Kettenbonus: 14 Punkte',
      'Zwischenstand ohne Kettenbonus: 0 Punkte',
      'Zwischenstand ohne Kettenbonus: 55 Punkte',
    ])
    const eigene = screen.getByRole('region', { name: 'Deine Schlangen' })
    expect(within(eigene).getByTestId('punkte')).toHaveTextContent('Zwischenstand ohne Kettenbonus: 15 Punkte')
  })

  it('O8 K5: sichtbar steht die Zahl mit „Punkte“, der Hinweis wird nur vorgelesen', () => {
    zeige(erzeugeSzenario('wertung-joker'))
    const eigene = within(screen.getByRole('region', { name: 'Deine Schlangen' })).getByTestId('punkte')
    expect(within(eigene).getByText('15 Punkte')).toBeInTheDocument()
    expect(within(eigene).getByText('Zwischenstand ohne Kettenbonus:')).toHaveClass('nur-vorlesen')
  })
})

describe('O8: Nach Spielende ist am Tisch niemand dran', () => {
  it('O8: ein beendeter Stand zeigt bei keinem Gegner „ist dran“', () => {
    zeige(erzeugeSzenario('wertung-beispiele'))
    expect(screen.queryByText('ist dran')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Die Partie ist beendet.')
  })

  it('O8 Gegenprobe: in der laufenden Schlussrunde trägt KI-Gegner 1 „ist dran“', () => {
    zeige(erzeugeSzenario('schlussrunde-ohne-dich'))
    expect(within(screen.getByRole('article', { name: 'KI-Gegner 1' })).getByText('ist dran')).toBeInTheDocument()
  })
})
