/*
 * Author: rahn
 * Datum: 06.06.2026
 * Version: 1.5
 * Beschreibung: F36 UI-Test für Drag-and-Drop, Klickpfad, Live-Status und robuste Drop-Ziele auf eigene Schlangen.
 */

import { fireEvent, render, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import type { SpielAktion } from './engine'
import { erstelleSpielzustand, ermittleLegaleAktionen, starteAusspielphase } from './engine'
import {
  erstelleDataTransfer,
  erstelleSpieltischMitEineSchlange,
  erstelleSpieltischOhneEigeneSchlangen,
  ermittleSpielbereiche,
} from './testUtils'

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

describe('F36 Drag-and-Drop für Schlangen', () => {
  it('erlaubt das Ablegen einer Handkarte auf einer eigenen Schlange', () => {
    const { zustand, anlegekarteId, startkarte } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) })
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')!

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
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) })
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')!

    fireEvent.click(handkartenButton)
    fireEvent.click(schlangenKarte)

    expect(within(handBereich).queryByText(anlegekarteId)).toBeNull()
    expect(within(schlangenKarte).getByText(anlegekarteId)).toBeInTheDocument()
    expect(within(schlangenKarte).getByText(startkarte.id)).toBeInTheDocument()
  })

  it('startet im leeren eigenen Schlangenbereich per Klick eine neue Schlange', async () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByText(legaleStartaktion.handkartenId).closest('button')!
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })

    const handkartenVorher = within(handBereich).getAllByRole('button').length
    fireEvent.click(handkartenButton)
    await waitFor(() => {
      expect(within(handBereich).getByText(new RegExp(`Ausgewählte Handkarte: ${legaleStartaktion.handkartenId}`))).toBeInTheDocument()
    })
    fireEvent.click(startzone)

    expect(within(handBereich).getAllByRole('button').length).toBe(handkartenVorher - 1)
    expect(eigeneGruppe.querySelectorAll('li')).toHaveLength(1)
  })

  it('startet im leeren eigenen Schlangenbereich per Klick ohne Vorauswahl eine neue Schlange', () => {
    const { zustand } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })

    const handkartenVorher = within(handBereich).getAllByRole('button').length
    fireEvent.click(startzone)

    expect(within(handBereich).getAllByRole('button').length).toBe(handkartenVorher - 1)
    expect(eigeneGruppe.querySelectorAll('li')).toHaveLength(1)
  })

  it('startet im leeren eigenen Schlangenbereich per Drag-and-drop die gezogene Karte', () => {
    const { zustand } = erstelleSpieltischOhneEigeneSchlangen()
    const legaleStartaktionen = ermittleLegaleAktionen(zustand).filter(
      (aktion): aktion is Extract<SpielAktion, { typ: 'NeueSchlangeStarten' }> => aktion.typ === 'NeueSchlangeStarten',
    )
    const alternativeStartaktion = legaleStartaktionen.at(-1)!

    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByText(alternativeStartaktion.handkartenId).closest('button')!
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })

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
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByText(legaleStartaktion.handkartenId).closest('button')!

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(eigeneGruppe, { dataTransfer })
    fireEvent.drop(eigeneGruppe, { dataTransfer })
    fireEvent.dragEnd(handkartenButton, { dataTransfer })

    expect(within(handBereich).queryByText(legaleStartaktion.handkartenId)).toBeNull()
    expect(eigeneGruppe.querySelectorAll('li')).toHaveLength(2)
  })

  it('bedient die explizite Anlege-Schaltfläche per Klick', () => {
    const { zustand, anlegekarteId, legaleKarteAnlegen, startkarte } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')!
    const button = within(schlangenKarte).getByRole('button', {
      name: new RegExp(`schlangenbereich: karte ${anlegekarteId} ${legaleKarteAnlegen.position} anlegen`, 'i'),
    })

    fireEvent.click(button)

    expect(within(handBereich).queryByText(anlegekarteId)).toBeNull()
    expect(within(schlangenKarte).getByText(anlegekarteId)).toBeInTheDocument()
    expect(within(schlangenKarte).getByText(startkarte.id)).toBeInTheDocument()
  })

  it('zeigt den Drag-and-drop-Pfad auf der expliziten Anlege-Schaltfläche', () => {
    const { zustand, anlegekarteId, legaleKarteAnlegen, startkarte } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')!
    const button = within(schlangenKarte).getByRole('button', {
      name: new RegExp(`schlangenbereich: karte ${anlegekarteId} ${legaleKarteAnlegen.position} anlegen`, 'i'),
    })
    const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) })

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(button, { dataTransfer })

    const statusElement = within(schlangenbereich).getByRole('status')
    expect(statusElement).toHaveTextContent('Karte kann auf Schlange schlange-spieler-1-f36 abgelegt werden.')

    fireEvent.drop(button, { dataTransfer })
    fireEvent.dragEnd(handkartenButton, { dataTransfer })

    expect(within(handBereich).queryByText(anlegekarteId)).toBeNull()
    expect(within(schlangenKarte).getByText(anlegekarteId)).toBeInTheDocument()
    expect(within(schlangenKarte).getByText(startkarte.id)).toBeInTheDocument()
    expect(statusElement).toHaveTextContent('')
  })

  it('ignoriert illegale Drag-Over-Ziele an einer eigenen Schlange', () => {
    const { zustand } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkartenButton = within(handBereich).getAllByRole('button')[0]
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')!

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    dataTransfer.setData('text/plain', 'illegal-card-id')
    fireEvent.dragOver(schlangenKarte, { dataTransfer })

    expect(schlangenKarte).not.toHaveClass('schlangekarte--dragover')
    expect(within(schlangenbereich).getByRole('status')).toHaveTextContent('Karte kann hier nicht abgelegt werden.')
  })

  it('räumt Drag-Over-Status beim Abbrechen einer Drag-Bewegung zurück', () => {
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) })
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')!

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(schlangenKarte, { dataTransfer })
    expect(schlangenKarte).toHaveClass('schlangekarte--dragover')
    fireEvent.dragEnd(handkartenButton, { dataTransfer })

    expect(schlangenKarte).not.toHaveClass('schlangekarte--dragover')
    expect(within(schlangenbereich).getByRole('status')).toHaveTextContent('')
  })
})
