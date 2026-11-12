import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { geraeteklasseFuer } from './geraeteklasse'
import { ProbeSeite } from './ProbeSeite'

function setzeFenster(breite: number, grob: boolean) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: breite })
  vi.stubGlobal('matchMedia', (abfrage: string) => ({ matches: grob && abfrage === '(pointer: coarse)' }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('PROBE-1: geraeteklasseFuer', () => {
  it.each([
    [390, 'Handy'],
    [599, 'Handy'],
    [600, 'Tablet'],
    [1024, 'Tablet'],
    [1025, 'Desktop'],
    [1280, 'Desktop'],
  ])('PROBE-1: %i px ist %s', (breite, erwartet) => {
    expect(geraeteklasseFuer(breite)).toBe(erwartet)
  })
})

describe('PROBE-1: ProbeSeite', () => {
  it('PROBE-1: zeigt Geräteklasse, Touch und Breite', () => {
    setzeFenster(390, true)

    render(<ProbeSeite />)

    expect(screen.getByText('Geräteklasse: Handy')).toBeInTheDocument()
    expect(screen.getByText('Touch: ja')).toBeInTheDocument()
    expect(screen.getByText('Breite: 390 px')).toBeInTheDocument()
  })

  it('PROBE-1: passt sich an, wenn sich die Fensterbreite ändert', () => {
    setzeFenster(1280, false)
    render(<ProbeSeite />)
    expect(screen.getByText('Geräteklasse: Desktop')).toBeInTheDocument()

    setzeFenster(1024, false)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(screen.getByText('Geräteklasse: Tablet')).toBeInTheDocument()
    expect(screen.getByText('Touch: nein')).toBeInTheDocument()
  })

  it('PROBE-1: „Neu messen“ zählt die Messungen', () => {
    setzeFenster(1024, true)
    render(<ProbeSeite />)

    fireEvent.click(screen.getByRole('button', { name: 'Neu messen' }))
    fireEvent.click(screen.getByRole('button', { name: 'Neu messen' }))

    expect(screen.getByText('Messungen: 2')).toBeInTheDocument()
  })
})
