/*
Author: rahn
Datum: 05.06.2026
Version: 1.1
Beschreibung: F27 UI-Test für das Sprungziel der Spielerführung mit Sichtbarkeit und Fokus.
Änderung v1.1: R113 – Fokusziel gegen tatsächliche Link-ID statt statischer ID geprüft.
*/
/// <reference types="node" />

import { fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'

function deterministischerZustand() {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
}

describe('F27 Sprungziel der Spielerführung sichtbar und fokussiert machen', () => {
  it('holt das Ziel per Klick in den Viewport und setzt den Fokus auf den Zielbereich', async () => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    })
    const scrollIntoViewSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView')

    render(<App initialZustand={deterministischerZustand()} />)

    const aktiverSpielerBereich = screen.getByRole('region', { name: 'Aktiver Spieler' })
    const spielerfuehrung = within(aktiverSpielerBereich).getByRole('region', { name: 'Spielerführung' })
    const sprunglink = within(spielerfuehrung).getByRole('link', {
      name: 'Zur empfohlenen Aktion im Aktionsbereich',
    })
    const zielRegion = screen.getByRole('region', { name: 'Empfohlene Aktion' })

    expect(sprunglink).toHaveAttribute('href', `#${zielRegion.id}`)
    expect(zielRegion.id).not.toBe('')
    expect(zielRegion).not.toHaveFocus()

    fireEvent.click(sprunglink)

    await waitFor(() => {
      expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1)
      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ block: 'center', inline: 'nearest' })
      expect(zielRegion).toHaveFocus()
      expect(zielRegion).toHaveClass('aktionen-gruppe--sprungziel')
    })

    scrollIntoViewSpy.mockRestore()
  })
})
