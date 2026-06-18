/*
 * Author: rahn
 * Datum: 14.06.2026
 * Version: 1.0
 * Beschreibung: M2d macht Schlangenhäutung nach Handkarten-Auswahl direkt auf der eigenen Schlange spielbar.
 */

import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import App from './App'
import { erstelleSpielzustand, starteAusspielphase } from './engine'
import type { FarbkarteInfo, SonderkarteInfo } from './engine'
import { ermittleSpielbereiche } from './testUtils'

const farbkarte = (id: string, farbe: FarbkarteInfo['farbe'], punkte: number): FarbkarteInfo => ({
  typ: 'Farbkarte',
  id,
  farbe,
  punkte,
})

const sonderkarte = (id: string, name: string): SonderkarteInfo => ({
  typ: 'Sonderkarte',
  id,
  name,
})

describe('M2d Schlangenhäutung-Brettziel', () => {
  it('macht eine ausgewählte Schlangenhäutung direkt an der eigenen Schlange ausführbar', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const schlangenhaeutung = sonderkarte('schlangenhaeutung-m2d', 'Schlangenhäutung')
    zustand.spieler[0].hand = [schlangenhaeutung]
    zustand.spieler[0].schlangen = [{
      id: 'schlange-m2d-lichtung',
      zustand: 'aktiv',
      karten: [
        farbkarte('rot-m2d-a', 'Rot', 1),
        farbkarte('blau-m2d-b', 'Blau', 2),
        farbkarte('gruen-m2d-c', 'Grün', 3),
      ],
    }]

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneSchlangen = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const zielSchlange = within(eigeneSchlangen).getByRole('button', { name: /Schlange schlange-m2d-lichtung/ })

    expect(within(zielSchlange).queryByRole('group', { name: 'Schlangenhäutung am Brett für Schlange schlange-m2d-lichtung' })).toBeNull()

    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenhaeutung-m2d/ }))

    expect(zielSchlange).toHaveClass('schlangekarte--haeutung-ziel')
    const brettAuswahl = within(zielSchlange).getByRole('group', { name: 'Schlangenhäutung am Brett für Schlange schlange-m2d-lichtung' })
    expect(brettAuswahl).toHaveClass('schlangenhaeutung-haeutungsring')
    expect(within(brettAuswahl).getByText('Schlangenhäutung-Häutungsring')).toBeVisible()
    expect(within(brettAuswahl).getByText('Kartenhaut lösen')).toBeVisible()
    expect(within(brettAuswahl).queryByText('Schlangenhäutung am Brett')).toBeNull()
    expect(within(brettAuswahl).getByText('Aktuell: rot-m2d-a → blau-m2d-b → gruen-m2d-c')).toBeVisible()
    expect(within(brettAuswahl).getByText('Umkehr: gruen-m2d-c → blau-m2d-b → rot-m2d-a')).toBeVisible()
    expect(within(brettAuswahl).getByText('Erste Karte ans Ende: blau-m2d-b → gruen-m2d-c → rot-m2d-a')).toBeVisible()

    fireEvent.click(within(brettAuswahl).getByRole('button', {
      name: 'Schlangenhäutung am Brett mit Karte schlangenhaeutung-m2d: Schlange schlange-m2d-lichtung umkehren',
    }))

    expect(screen.getByText('Zuletzt ausgeführt: Schlangenhäutung mit Karte schlangenhaeutung-m2d auf Schlange schlange-m2d-lichtung spielen')).toBeVisible()
    const aktualisierteReihe = within(eigeneSchlangen).getByRole('list', { name: 'Kartenreihe schlange-m2d-lichtung' })
    const karten = within(aktualisierteReihe).getAllByRole('listitem').map((karte) => within(karte).getByText(/m2d-/).textContent)
    expect(karten).toEqual(['gruen-m2d-c', 'blau-m2d-b', 'rot-m2d-a'])
  })

  it('führt auch die Häutungsring-Option Erste Karte ans Ende über den Engine-Pfad aus', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    zustand.spieler[0].hand = [sonderkarte('schlangenhaeutung-m2d-ende', 'Schlangenhäutung')]
    zustand.spieler[0].schlangen = [{
      id: 'schlange-m2d-ende',
      zustand: 'aktiv',
      karten: [
        farbkarte('rot-m2d-ende-a', 'Rot', 1),
        farbkarte('blau-m2d-ende-b', 'Blau', 2),
        farbkarte('gruen-m2d-ende-c', 'Grün', 3),
      ],
    }]

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenhaeutung-m2d-ende/ }))

    const eigeneSchlangen = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const ring = within(eigeneSchlangen).getByRole('group', { name: 'Schlangenhäutung am Brett für Schlange schlange-m2d-ende' })
    fireEvent.click(within(ring).getByRole('button', {
      name: 'Schlangenhäutung am Brett mit Karte schlangenhaeutung-m2d-ende: erste Karte von Schlange schlange-m2d-ende ans Ende setzen',
    }))

    expect(screen.getByText('Zuletzt ausgeführt: Schlangenhäutung mit Karte schlangenhaeutung-m2d-ende auf Schlange schlange-m2d-ende spielen')).toBeVisible()
    const reihe = within(eigeneSchlangen).getByRole('list', { name: 'Kartenreihe schlange-m2d-ende' })
    const karten = within(reihe).getAllByRole('listitem').map((karte) => within(karte).getByText(/m2d-ende/).textContent)
    expect(karten).toEqual(['blau-m2d-ende-b', 'gruen-m2d-ende-c', 'rot-m2d-ende-a'])
  })

  it('blendet die Brett-Schlangenhäutung während eines KI-Zugs wie andere Einzelaktionen aus', () => {
    const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
    const schlangenhaeutung = sonderkarte('schlangenhaeutung-m2d-ki', 'Schlangenhäutung')
    zustand.spieler[0].steuerung = 'KI'
    zustand.spieler[0].hand = [schlangenhaeutung]
    zustand.spieler[0].schlangen = [{
      id: 'schlange-m2d-ki',
      zustand: 'aktiv',
      karten: [farbkarte('rot-m2d-ki-a', 'Rot', 1), farbkarte('blau-m2d-ki-b', 'Blau', 2)],
    }]

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    fireEvent.click(within(handBereich).getByRole('button', { name: /schlangenhaeutung-m2d-ki/ }))

    const eigeneSchlangen = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const zielSchlange = within(eigeneSchlangen).getByText('schlange-m2d-ki').closest('.schlangekarte') as HTMLElement

    expect(zielSchlange).not.toHaveClass('schlangekarte--haeutung-ziel')
    expect(within(zielSchlange).queryByRole('group', { name: 'Schlangenhäutung am Brett für Schlange schlange-m2d-ki' })).toBeNull()
  })

  it('legt den Häutungsring als körperliches Stitch-Spielobjekt mit eigenem Button-Cascade-Vertrag ab', () => {
    const css = readFileSync('src/App.css', 'utf8')
    const ringBlock = css.match(/\.schlangenhaeutung-haeutungsring \{[^}]+\}/)?.[0] ?? ''
    const iconBlock = css.match(/\.schlangenhaeutung-haeutungsring__icon \{[^}]+\}/)?.[0] ?? ''
    const buttonBlock = css.match(/\.schlangenhaeutung-haeutungsring \.schlangenhaeutung-haeutungsring__button \{[^}]+\}/)?.[0] ?? ''

    expect(ringBlock).toContain('border: var(--st-border-width-chunky) solid var(--st-color-border-strong)')
    expect(ringBlock).toContain('border-radius: var(--st-radius-xl)')
    expect(ringBlock).toContain('box-shadow: var(--st-shadow-hard)')
    expect(ringBlock).toContain('radial-gradient')
    expect(iconBlock).toContain('border-radius: 999px')
    expect(buttonBlock).toContain('background: var(--st-color-secondary-container)')
    expect(buttonBlock).toContain('box-shadow: 0 3px 0 var(--st-color-border-strong)')
  })
})
