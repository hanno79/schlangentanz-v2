/*
 * Author: rahn
 * Datum: 12.06.2026
 * Version: 1.0
 * Beschreibung: R178 macht auswählbare Board-Ziele nach Handkartenauswahl sichtbar.
 */

import { fireEvent, render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { erstelleSpieltischMitEineSchlange, ermittleSpielbereiche } from './testUtils'

describe('R178 Board-Zielmarkierungen', () => {
  it('markiert nach Auswahl einer Handkarte Startzone und passende Schlange als direkte Board-Ziele', () => {
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange('schlange-r178-ziel')
    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) })
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })
    const schlangenKarte = within(eigeneGruppe).getByText('schlange-r178-ziel').closest('li')!

    expect(startzone).not.toHaveClass('schlangen-startzone--zielbereit')
    expect(schlangenKarte).not.toHaveClass('schlangekarte--zielbereit')

    fireEvent.click(handkartenButton)

    expect(startzone).toHaveClass('schlangen-startzone--zielbereit')
    expect(schlangenKarte).toHaveClass('schlangekarte--zielbereit')
    expect(within(startzone).getByText(`Bereit: ${anlegekarteId}`)).toBeVisible()
    expect(within(startzone).getByText('Karte loslassen oder klicken, um die erste Schlange zu legen.')).toBeVisible()
    expect(within(schlangenKarte).getByText('Ausgewählte Karte hier anlegen.')).toBeVisible()
  })

  it('markiert bei ausgewählter Sonderkarte keine Farbkarten-Board-Ziele', () => {
    const { zustand } = erstelleSpieltischMitEineSchlange('schlange-r178-sonderkarte')
    const sonderkarte = zustand.nachziehstapel.find((karte) => karte.typ === 'Sonderkarte')
    if (!sonderkarte) throw new Error('Testsetup erwartet eine Sonderkarte im Nachziehstapel.')
    zustand.spieler[0].hand = [sonderkarte, ...zustand.spieler[0].hand]

    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(sonderkarte.id) })
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })
    const schlangenKarte = within(eigeneGruppe).getByText('schlange-r178-sonderkarte').closest('li')!

    fireEvent.click(handkartenButton)

    expect(startzone).not.toHaveClass('schlangen-startzone--zielbereit')
    expect(schlangenKarte).not.toHaveClass('schlangekarte--zielbereit')
    expect(within(startzone).queryByText(/Bereit:/)).toBeNull()
    expect(within(startzone).queryByText('Karte loslassen oder klicken, um die erste Schlange zu legen.')).toBeNull()
    expect(within(schlangenKarte).queryByText('Ausgewählte Karte hier anlegen.')).toBeNull()
  })
})
