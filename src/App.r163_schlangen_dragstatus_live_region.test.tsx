/*
Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: R163 UI-Test für den Schlangen-Dragstatus als explizite polite Live-Region.
*/

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('R163 Schlangen-Dragstatus Live-Region', () => {
  it('kennzeichnet den permanenten Dragstatus im Schlangenbereich explizit als polite Live-Region', () => {
    render(
      <>
        <App />
        <App />
      </>,
    )

    const schlangenbereiche = screen.getAllByRole('region', { name: 'Schlangenbereich' })
    expect(schlangenbereiche).toHaveLength(2)

    for (const schlangenbereich of schlangenbereiche) {
      const status = within(schlangenbereich).getByRole('status')

      expect(status).toHaveClass('schlangen-dragstatus')
      expect(status).toHaveAttribute('aria-live', 'polite')
      expect(status).toHaveAttribute('aria-atomic', 'true')
      expect(status).not.toHaveAttribute('aria-label')
      expect(status).toHaveTextContent('')
    }
  })
})
