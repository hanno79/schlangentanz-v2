import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('P0.4: Einstieg', () => {
  it('P0.4: / zeigt bis O2 einen schlichten Platzhalter', () => {
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.getByTestId('platzhalter')).toHaveTextContent('Schlangentanz')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('P0.4: /dev lädt im Testlauf (Dev-Modus) den Entwicklertisch nach', async () => {
    window.history.pushState({}, '', '/dev?seed=1&spieler=2')
    render(<App />)
    expect(await screen.findByTestId('entwicklertisch')).toBeInTheDocument()
  })
})
