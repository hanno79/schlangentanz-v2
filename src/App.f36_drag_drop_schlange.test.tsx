/*
 * Author: rahn
 * Datum: 06.06.2026
 * Version: 1.1
 * Beschreibung: F36 UI-Test für das erste Drag-and-Drop-Ausspielen einer Handkarte auf eine eigene Schlange.
 */

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { SpielAktion } from './engine'
import { erstelleSpielzustand, ermittleLegaleAktionen, starteAusspielphase } from './engine'

function erstelleSpieltischMitEineSchlange() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const [startkarte] = zustand.spieler[0].hand

  zustand.spieler[0].schlangen = [
    { id: 'schlange-spieler-1-f36', zustand: 'aktiv', karten: [startkarte] },
  ]

  const legaleKarteAnlegen = ermittleLegaleAktionen(zustand).find(
    (aktion): aktion is Extract<SpielAktion, { typ: 'KarteAnlegen' }> => {
      if (aktion.typ !== 'KarteAnlegen') {
        return false
      }

      return aktion.handkartenId !== startkarte.id
    },
  )
  if (!legaleKarteAnlegen) {
    throw new Error('Testsetup erwartet eine legale Karten-Anlegeaktion.')
  }

  return { zustand, startkarte, anlegekarteId: legaleKarteAnlegen.handkartenId, legaleKarteAnlegen }
}

function erstelleSpieltischMitVorhandenerSchlangeUndStartaktion() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const [startkarte] = zustand.spieler[0].hand

  zustand.spieler[0].schlangen = [
    { id: 'schlange-spieler-1-f36-2', zustand: 'aktiv', karten: [startkarte] },
  ]

  const legaleStartaktion = ermittleLegaleAktionen(zustand).find(
    (aktion): aktion is Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }> => aktion.typ === 'NeueSchlangeStarten',
  )

  if (!legaleStartaktion) {
    throw new Error('Testsetup erwartet eine legale Startaktion trotz vorhandener Schlange.')
  }

  return { zustand, legaleStartaktion, startkarte }
}

function erstelleSpieltischOhneEigeneSchlangen() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const legaleStartaktion = ermittleLegaleAktionen(zustand).find(
    (aktion): aktion is Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }> => aktion.typ === 'NeueSchlangeStarten',
  )

  if (!legaleStartaktion) {
    throw new Error('Testsetup erwartet eine legale Startaktion für eine neue Schlange.')
  }

  return { zustand, legaleStartaktion }
}

function erstelleDataTransfer() {
  const daten: Record<string, string> = {}

  return {
    dropEffect: 'move',
    effectAllowed: 'move',
    setData: (typ: string, wert: string) => {
      daten[typ] = wert
    },
    getData: (typ: string) => daten[typ] ?? '',
  } as unknown as DataTransfer
}

describe('F36 Drag-and-Drop für Schlangen', () => {
  it('erlaubt das Ablegen einer Handkarte auf einer eigenen Schlange', () => {
    const { zustand, anlegekarteId, startkarte } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const handkartenButton = within(handBereich).getByRole('button', {
      name: new RegExp(anlegekarteId),
    })
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')

    if (!schlangenKarte) {
      throw new Error('Testsetup erwartet eine sichtbare eigene Schlange.')
    }

    expect(handkartenButton).toHaveAttribute('draggable', 'true')

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(schlangenKarte, { dataTransfer })
    fireEvent.drop(schlangenKarte, { dataTransfer })
    fireEvent.dragEnd(handkartenButton, { dataTransfer })

    expect(within(handBereich).queryByText(anlegekarteId)).toBeNull()
    expect(within(schlangenKarte).getByText(anlegekarteId)).toBeInTheDocument()
    expect(within(schlangenKarte).getByText(startkarte.id)).toBeInTheDocument()
  })

  it('legt die ausgewählte Karte per Klick direkt auf die Schlange', () => {
    const { zustand, anlegekarteId, startkarte } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const handkartenButton = within(handBereich).getByRole('button', {
      name: new RegExp(anlegekarteId),
    })
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')

    if (!schlangenKarte) {
      throw new Error('Testsetup erwartet eine sichtbare eigene Schlange.')
    }

    fireEvent.click(handkartenButton)
    fireEvent.click(schlangenKarte)

    expect(within(handBereich).queryByText(anlegekarteId)).toBeNull()
    expect(within(schlangenKarte).getByText(anlegekarteId)).toBeInTheDocument()
    expect(within(schlangenKarte).getByText(startkarte.id)).toBeInTheDocument()
  })

  it('startet im leeren eigenen Schlangenbereich per Klick eine neue Schlange', async () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByText(legaleStartaktion.handkartenId).closest('button')
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })

    if (!handkartenButton) {
      throw new Error('Testsetup erwartet eine sichtbare Handkarte für die Startaktion.')
    }

    const handkartenVorher = within(handBereich).getAllByRole('button').length
    fireEvent.click(handkartenButton)
    await waitFor(() => {
      expect(within(handBereich).getByText(new RegExp(`Ausgewählte Handkarte: ${legaleStartaktion.handkartenId}`))).toBeInTheDocument()
    })
    fireEvent.click(startzone)

    expect(within(handBereich).getAllByRole('button').length).toBe(handkartenVorher - 1)
    expect(eigeneGruppe.querySelectorAll('li')).toHaveLength(1)
  })

  it('startet im leeren eigenen Schlangenbereich per Drag-and-drop die gezogene Karte', () => {
    const { zustand } = erstelleSpieltischOhneEigeneSchlangen()
    const legaleStartaktionen = ermittleLegaleAktionen(zustand).filter(
      (aktion): aktion is Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }> => aktion.typ === 'NeueSchlangeStarten',
    )
    const alternativeStartaktion = legaleStartaktionen.at(-1)

    if (!alternativeStartaktion) {
      throw new Error('Testsetup erwartet mindestens eine legale Startaktion für eine neue Schlange.')
    }

    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByText(alternativeStartaktion.handkartenId).closest('button')
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })

    if (!handkartenButton) {
      throw new Error('Testsetup erwartet eine sichtbare Handkarte für die Startaktion.')
    }

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(startzone, { dataTransfer })
    fireEvent.drop(startzone, { dataTransfer })
    fireEvent.dragEnd(handkartenButton, { dataTransfer })

    expect(within(handBereich).queryByText(alternativeStartaktion.handkartenId)).toBeNull()
    expect(eigeneGruppe.querySelectorAll('li')).toHaveLength(1)
  })

  it('startet trotz vorhandener Schlange per Drag-and-drop eine zweite neue Schlange', () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischMitVorhandenerSchlangeUndStartaktion()
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByText(legaleStartaktion.handkartenId).closest('button')

    if (!handkartenButton) {
      throw new Error('Testsetup erwartet eine sichtbare Handkarte für die zweite Schlange.')
    }

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(eigeneGruppe, { dataTransfer })
    fireEvent.drop(eigeneGruppe, { dataTransfer })
    fireEvent.dragEnd(handkartenButton, { dataTransfer })

    expect(within(handBereich).queryByText(legaleStartaktion.handkartenId)).toBeNull()
    expect(eigeneGruppe.querySelectorAll('li')).toHaveLength(2)
  })

  it('zeigt und bedient die explizite Anlege-Schaltfläche für die legale Position', () => {
    const { zustand, anlegekarteId, legaleKarteAnlegen, startkarte } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')

    if (!schlangenKarte) {
      throw new Error('Testsetup erwartet eine sichtbare eigene Schlange.')
    }

    const button = within(schlangenKarte).getByRole('button', {
      name: new RegExp(`schlangenbereich: karte ${anlegekarteId} ${legaleKarteAnlegen.position} anlegen`, 'i'),
    })

    fireEvent.click(button)

    expect(within(handBereich).queryByText(anlegekarteId)).toBeNull()
    expect(within(schlangenKarte).getByText(anlegekarteId)).toBeInTheDocument()
    expect(within(schlangenKarte).getByText(startkarte.id)).toBeInTheDocument()
  })

  it('markiert eine Schlange sichtbar beim Überfahren mit einer gezogenen Karte', () => {
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const handkartenButton = within(handBereich).getByRole('button', {
      name: new RegExp(anlegekarteId),
    })
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')

    if (!schlangenKarte) {
      throw new Error('Testsetup erwartet eine sichtbare eigene Schlange.')
    }

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(schlangenKarte, { dataTransfer })

    expect(schlangenKarte).toHaveClass('schlangekarte--dragover')

    fireEvent.drop(schlangenKarte, { dataTransfer })
    fireEvent.dragEnd(handkartenButton, { dataTransfer })

    expect(schlangenKarte).not.toHaveClass('schlangekarte--dragover')
  })
})
