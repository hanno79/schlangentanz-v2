/*
 * Author: rahn
 * Datum: 06.06.2026
 * Version: 1.2
 * Beschreibung: F36 UI-Test für Drag-and-Drop-Status, Fehlfeedback und robuste Drop-Ränder auf eigene Schlangen.
 */

import { fireEvent, render, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import {
  aktionsName,
  erstelleDataTransfer,
  erstelleSpieltischMitEineSchlange,
  erstelleSpieltischOhneEigeneSchlangen,
  ermittleSpielbereiche,
} from './testUtils'

describe('F36 Drag-and-Drop-Status für Schlangen', () => {
  it('ignoriert illegale Drag-Over-Ziele an der Startzone', () => {
    const { zustand } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getAllByRole('button')[0]
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    dataTransfer.setData('text/plain', 'illegal-card-id')
    fireEvent.dragOver(startzone, { dataTransfer })

    expect(startzone).not.toHaveClass('schlangen-startzone--dragover')
    expect(within(schlangenbereich).getByRole('status')).toHaveTextContent('Karte kann hier nicht abgelegt werden.')
  })

  it('räumt illegales Drag-Over-Feedback beim Verlassen der Startzone zurück', () => {
    const { zustand } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getAllByRole('button')[0]
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    dataTransfer.setData('text/plain', 'illegal-card-id')
    fireEvent.dragOver(startzone, { dataTransfer })

    const statusElement = within(schlangenbereich).getByRole('status')
    expect(statusElement).toHaveTextContent('Karte kann hier nicht abgelegt werden.')

    fireEvent.dragLeave(startzone, { relatedTarget: document.body, dataTransfer })

    expect(statusElement).toBeEmptyDOMElement()
  })

  it('ignoriert Drag-Over auf einen falschen expliziten Anlegebutton', () => {
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')!

    const legaleHandkarte = within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) })
    const falscherButton = within(schlangenKarte)
      .getAllByRole('button')
      .find((button) => aktionsName(button).startsWith('Schlangenbereich: Karte') && !aktionsName(button).includes(anlegekarteId))

    if (!falscherButton) {
      throw new Error('Testsetup erwartet mindestens einen zweiten expliziten Anlegebutton.')
    }

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(legaleHandkarte, { dataTransfer })
    fireEvent.dragOver(schlangenKarte, { dataTransfer })

    const statusElement = within(schlangenbereich).getByRole('status')
    expect(statusElement).toHaveTextContent('Karte kann auf Schlange schlange-spieler-1-f36 abgelegt werden.')

    fireEvent.dragOver(falscherButton, { dataTransfer })

    expect(schlangenKarte).not.toHaveClass('schlangekarte--dragover')
    expect(statusElement).toHaveTextContent('Karte kann hier nicht abgelegt werden.')
  })

  it('ignoriert Drag-Over auf einen falschen Startbutton', () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByText(legaleStartaktion.handkartenId).closest('button')!
    const startbutton = within(eigeneGruppe).getByRole('button', {
      name: new RegExp(`Startkreis mit Karte ${legaleStartaktion.handkartenId}`),
    })
    const falscherButton = within(eigeneGruppe)
      .getAllByRole('button')
      .find((button) => aktionsName(button).startsWith('Startkreis mit Karte') && !aktionsName(button).includes(legaleStartaktion.handkartenId))

    if (!falscherButton) {
      throw new Error('Testsetup erwartet mindestens einen zweiten Startbutton.')
    }

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(startbutton, { dataTransfer })

    const statusElement = within(schlangenbereich).getByRole('status')
    expect(statusElement).toHaveTextContent('Karte kann als neue Schlange gestartet werden.')

    fireEvent.dragOver(falscherButton, { dataTransfer })

    expect(statusElement).toHaveTextContent('Karte kann hier nicht abgelegt werden.')
    expect(within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })).not.toHaveClass('schlangen-startzone--dragover')
  })

  it('meldet einen illegalen Drop auf eine eigene Schlange klar als nicht möglich', () => {
    const { zustand } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const handkartenButton = within(handBereich).getAllByRole('button')[0]
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')!

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    dataTransfer.setData('text/plain', 'illegal-card-id')
    fireEvent.drop(schlangenKarte, { dataTransfer })

    expect(schlangenKarte).not.toHaveClass('schlangekarte--dragover')
    expect(handkartenButton).toBeInTheDocument()
    expect(within(schlangenbereich).getByRole('status')).toHaveTextContent('Karte kann hier nicht abgelegt werden.')
  })

  it('meldet einen illegalen Drop auf die Startzone klar als nicht möglich', () => {
    const { zustand } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getAllByRole('button')[0]
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    dataTransfer.setData('text/plain', 'illegal-card-id')
    fireEvent.drop(startzone, { dataTransfer })

    expect(startzone).not.toHaveClass('schlangen-startzone--dragover')
    expect(within(schlangenbereich).getByRole('status')).toHaveTextContent('Karte kann hier nicht abgelegt werden.')
  })

  it('startet per Drag-and-drop über die explizite Start-Schaltfläche eine neue Schlange', () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByText(legaleStartaktion.handkartenId).closest('button')!
    const startbutton = within(eigeneGruppe).getByRole('button', {
      name: new RegExp(`Startkreis mit Karte ${legaleStartaktion.handkartenId}`),
    })

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(startbutton, { dataTransfer })

    const statusElement = within(schlangenbereich).getByRole('status')
    expect(statusElement).toHaveTextContent('Karte kann als neue Schlange gestartet werden.')

    fireEvent.drop(startbutton, { dataTransfer })
    fireEvent.dragEnd(handkartenButton, { dataTransfer })

    expect(within(handBereich).queryByText(legaleStartaktion.handkartenId)).toBeNull()
    expect(eigeneGruppe.querySelectorAll('li')).toHaveLength(1)
    expect(statusElement).toHaveTextContent('')
  })

  it('behält den Drag-Over-Status beim Wechsel von einer Schlange zur Startzone im selben Bereich', () => {
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')!
    const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) })
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(schlangenKarte, { dataTransfer })

    const statusElement = within(schlangenbereich).getByRole('status')
    expect(statusElement).toHaveTextContent('Karte kann auf Schlange schlange-spieler-1-f36 abgelegt werden.')

    fireEvent.dragLeave(schlangenKarte, { relatedTarget: startzone, dataTransfer })
    fireEvent.dragOver(startzone, { dataTransfer })

    expect(startzone).toHaveClass('schlangen-startzone--dragover')
    expect(statusElement).toHaveTextContent('Karte kann als neue Schlange gestartet werden.')
  })

  it('räumt Drag-Over-Status beim Verlassen einer Schlange ohne Drop zurück', () => {
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36').closest('li')!
    const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) })

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(schlangenKarte, { dataTransfer })

    const statusElement = within(schlangenbereich).getByRole('status')
    expect(statusElement).toHaveTextContent('Karte kann auf Schlange schlange-spieler-1-f36 abgelegt werden.')

    fireEvent.dragLeave(schlangenKarte, { relatedTarget: document.body, dataTransfer })

    expect(schlangenKarte).not.toHaveClass('schlangekarte--dragover')
    expect(statusElement).toHaveTextContent('')
  })

  it('räumt Drag-Over-Status beim Verlassen der Startzone ohne Drop zurück', () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByText(legaleStartaktion.handkartenId).closest('button')!
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(startzone, { dataTransfer })

    const statusElement = within(schlangenbereich).getByRole('status')
    expect(statusElement).toHaveTextContent('Karte kann als neue Schlange gestartet werden.')

    fireEvent.dragLeave(startzone, { relatedTarget: document.body, dataTransfer })

    expect(startzone).not.toHaveClass('schlangen-startzone--dragover')
    expect(statusElement).toHaveTextContent('')
  })

  it('räumt Drag-Over-Status beim Abbrechen einer Drag-Bewegung an der Startzone zurück', () => {
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)
    const { handBereich, schlangenbereich } = ermittleSpielbereiche()
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByText(legaleStartaktion.handkartenId).closest('button')!
    const startzone = within(eigeneGruppe).getByRole('button', { name: 'Neue Schlange starten' })

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.dragOver(startzone, { dataTransfer })

    const statusElement = within(schlangenbereich).getByRole('status')
    expect(statusElement).toHaveTextContent('Karte kann als neue Schlange gestartet werden.')

    fireEvent.dragEnd(handkartenButton, { dataTransfer })

    expect(statusElement).toHaveTextContent('')
  })
})
