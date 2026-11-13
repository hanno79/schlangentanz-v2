import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Spielkarte } from '../../engine'
import { erstelleAufgabenStapel } from '../../engine/aufgabenKarten'
import { erstelleAuslagekarten, erstelleSpielkarten } from '../../engine/deck'
import { Karte, Kartenrueckseite } from './Karte'

/* O1: Die Kartenkomponente zeigt das Bild mit einem Alt-Text, der die Karte so
   nennt, wie ein Mensch sie ansagt — nie die technische ID. */

const material = erstelleSpielkarten(true)
const finde = (passt: (karte: Spielkarte) => boolean) => material.find(passt)!
const blau = finde((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Blau')
const gruen = finde((karte) => karte.typ === 'Farbkarte' && karte.farbe === 'Grün')
const korb = finde((karte) => karte.typ === 'Sonderkarte' && karte.name === 'Schlangenkorb des Glücks')
const farbenpracht = erstelleAufgabenStapel().find((aufgabe) => aufgabe.name === 'Farbenpracht')!
const { comeback } = erstelleAuslagekarten(0)

describe('O1: Karte zeigt das Kartenbild mit Alt-Text', () => {
  it('O1: Farbkarte nennt Farbe und Punkte', () => {
    render(<Karte karte={blau} />)
    const bild = screen.getByRole('img', { name: 'Farbkarte Blau, 1 Punkt' })
    expect(bild.getAttribute('src')).toBe('/karten/farbe-blau.webp')
  })

  it('O1: Mehrzahl bei mehr als einem Punkt', () => {
    render(<Karte karte={gruen} />)
    expect(screen.getByRole('img', { name: 'Farbkarte Grün, 3 Punkte' })).toBeInTheDocument()
  })

  it('O1: Sonderkarte nennt ihren Namen', () => {
    render(<Karte karte={korb} />)
    expect(screen.getByRole('img', { name: 'Sonderkarte Schlangenkorb des Glücks' })).toBeInTheDocument()
  })

  it('O1: Comeback-Karte (Auslagekarte der Engine) hat Bild und Namen', () => {
    render(<Karte karte={comeback} />)
    expect(screen.getByRole('img', { name: 'Comeback-Karte' }).getAttribute('src')).toBe('/karten/comeback.webp')
  })

  it('O1: Aufgabe nennt Name, Punkte und Bedingung', () => {
    render(<Karte karte={farbenpracht} />)
    const bild = screen.getByRole('img', { name: /^Aufgabe Farbenpracht, 8 Punkte: Habe am Ende/ })
    expect(bild.getAttribute('src')).toBe('/karten/aufgabe-farbenpracht.webp')
  })

  it('O1: das Bild trägt seine Grösse, damit der Tisch beim Laden nicht springt', () => {
    render(<Karte karte={blau} />)
    const bild = screen.getByRole('img')
    expect(Number(bild.getAttribute('width'))).toBeGreaterThan(0)
    expect(Number(bild.getAttribute('height'))).toBeGreaterThan(0)
  })

  it('O1: die Rückseite verrät keine Karte', () => {
    render(<Kartenrueckseite />)
    expect(screen.getByRole('img', { name: 'Verdeckte Karte' }).getAttribute('src')).toBe(
      '/karten/rueckseite-platzhalter.svg',
    )
  })
})
