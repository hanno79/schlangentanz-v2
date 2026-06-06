/*
 * Author: rahn
 * Datum: 06.06.2026
 * Version: 1.0
 * Beschreibung: F36 Regressionstest für verzögerte ungültige Drop-Rückmeldungen nach Drag-Ende.
 */

import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { SpielAktion } from './engine'
import { erstelleSpielzustand, ermittleLegaleAktionen, starteAusspielphase } from './engine'
import { erstelleDataTransfer, erstelleSpieltischMitEineSchlange, erstelleSpieltischOhneEigeneSchlangen } from './testUtils'

function erstelleSpieltischMitBeidseitigerAnlegekarte() {
  const zustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
  const [startkarte] = zustand.spieler[0].hand

  zustand.spieler[0].schlangen = [
    { id: 'schlange-spieler-1-f36-timeout', zustand: 'aktiv', karten: [startkarte] },
  ]

  const anlegeAktionen = ermittleLegaleAktionen(zustand).filter(
    (aktion): aktion is Extract<SpielAktion, { typ: 'KarteAnlegen' }> =>
      aktion.typ === 'KarteAnlegen' && aktion.handkartenId !== startkarte.id,
  )
  const beidseitigeKartenId = anlegeAktionen.find((aktion) =>
    anlegeAktionen.some(
      (eintrag) => eintrag.handkartenId === aktion.handkartenId && eintrag.position !== aktion.position,
    ),
  )?.handkartenId

  if (!beidseitigeKartenId) {
    throw new Error('Testsetup erwartet eine Karte, die links und rechts angelegt werden kann.')
  }

  return { zustand, anlegekarteId: beidseitigeKartenId, startkarteId: startkarte.id }
}

function findeAnlegeTimeoutElemente(anlegekarteId: string) {
  const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
  const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
  const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
  const schlangenKarte = within(schlangenbereich).getByText('schlange-spieler-1-f36-timeout').closest('li')
  const handkartenButton = within(handBereich).getByRole('button', { name: new RegExp(anlegekarteId) })

  if (!schlangenKarte) {
    throw new Error('Testsetup erwartet eine sichtbare eigene Schlange.')
  }

  const falscherButton = within(schlangenKarte).getAllByRole('button').find((button) => {
    const ariaLabel = button.getAttribute('aria-label') ?? ''
    return ariaLabel.startsWith('Schlangenbereich: Karte') && !ariaLabel.includes(anlegekarteId)
  })

  if (!falscherButton) {
    throw new Error('Testsetup erwartet mindestens einen falschen Anlegebutton.')
  }

  return { handBereich, schlangenbereich, schlangenKarte, handkartenButton, falscherButton }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('F36 Drag-and-Drop Timeout-Reset', () => {
  it('lässt ungültiges Drop-Feedback am falschen Anlegebutton nach Drag-Ende nicht hängen', () => {
    vi.useFakeTimers()
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange('schlange-spieler-1-f36-timeout')
    render(<App initialZustand={zustand} />)

    const { schlangenbereich, handkartenButton, falscherButton } = findeAnlegeTimeoutElemente(anlegekarteId)

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    dataTransfer.setData('text/plain', 'ungueltige-testkarte')
    fireEvent.drop(falscherButton, { dataTransfer })
    fireEvent.dragEnd(handkartenButton, { dataTransfer })
    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(within(schlangenbereich).getByRole('status')).toHaveTextContent('')
  })

  it('lässt ungültiges Drop-Feedback am falschen Startbutton nach Drag-Ende nicht hängen', () => {
    vi.useFakeTimers()
    const { zustand, legaleStartaktion } = erstelleSpieltischOhneEigeneSchlangen()
    render(<App initialZustand={zustand} />)

    const spieltisch = screen.getByRole('region', { name: 'Spieltisch' })
    const handBereich = within(spieltisch).getByRole('region', { name: 'Handkarten' })
    const schlangenbereich = within(spieltisch).getByRole('region', { name: 'Schlangenbereich' })
    const eigeneGruppe = within(schlangenbereich).getByRole('region', { name: 'Eigene Schlangen' })
    const handkartenButton = within(handBereich).getByText(legaleStartaktion.handkartenId).closest('button')

    if (!handkartenButton) {
      throw new Error('Testsetup erwartet eine sichtbare Handkarte für die Startaktion.')
    }

    const falscherButton = within(eigeneGruppe).getAllByRole('button').find((button) => {
      const ariaLabel = button.getAttribute('aria-label') ?? ''
      return ariaLabel.startsWith('Schlangenbereich-Start mit Karte') && !ariaLabel.includes(legaleStartaktion.handkartenId)
    })

    if (!falscherButton) {
      throw new Error('Testsetup erwartet mindestens einen falschen Startbutton.')
    }

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    dataTransfer.setData('text/plain', 'ungueltige-testkarte')
    fireEvent.drop(falscherButton, { dataTransfer })
    fireEvent.dragEnd(handkartenButton, { dataTransfer })
    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(within(schlangenbereich).getByRole('status')).toBeEmptyDOMElement()
  })

  it('überschreibt neuen legalen Drag-Status nicht durch ein altes ungültiges Timeout', () => {
    vi.useFakeTimers()
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange('schlange-spieler-1-f36-timeout')
    render(<App initialZustand={zustand} />)

    const { schlangenbereich, schlangenKarte, handkartenButton, falscherButton } = findeAnlegeTimeoutElemente(anlegekarteId)

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    dataTransfer.setData('text/plain', 'ungueltige-testkarte')
    fireEvent.drop(falscherButton, { dataTransfer })
    dataTransfer.setData('text/plain', anlegekarteId)
    fireEvent.dragOver(schlangenKarte, { dataTransfer })
    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(within(schlangenbereich).getByRole('status')).toHaveTextContent(
      'Karte kann auf Schlange schlange-spieler-1-f36-timeout abgelegt werden.',
    )
  })

  it('überschreibt erfolgreichen direkten Schlangen-Drop nicht durch ein altes ungültiges Timeout', () => {
    vi.useFakeTimers()
    const { zustand, anlegekarteId } = erstelleSpieltischMitEineSchlange('schlange-spieler-1-f36-timeout')
    render(<App initialZustand={zustand} />)

    const { handBereich, schlangenbereich, schlangenKarte, handkartenButton, falscherButton } = findeAnlegeTimeoutElemente(anlegekarteId)

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    dataTransfer.setData('text/plain', 'ungueltige-testkarte')
    fireEvent.drop(falscherButton, { dataTransfer })
    dataTransfer.setData('text/plain', anlegekarteId)
    fireEvent.drop(schlangenKarte, { dataTransfer })
    act(() => {
      vi.runOnlyPendingTimers()
    })

    expect(within(handBereich).queryByText(anlegekarteId)).toBeNull()
    expect(within(schlangenbereich).getByRole('status')).toBeEmptyDOMElement()
  })

  it('behält beim Drop auf Anlegebutton die gewählte rechte Position bei', () => {
    const { zustand, anlegekarteId, startkarteId } = erstelleSpieltischMitBeidseitigerAnlegekarte()
    render(<App initialZustand={zustand} />)

    const { schlangenKarte, handkartenButton } = findeAnlegeTimeoutElemente(anlegekarteId)
    const rechterButton = within(schlangenKarte).getByRole('button', {
      name: new RegExp(`schlangenbereich: karte ${anlegekarteId} rechts anlegen`, 'i'),
    })

    const dataTransfer = erstelleDataTransfer()
    fireEvent.dragStart(handkartenButton, { dataTransfer })
    fireEvent.drop(rechterButton, { dataTransfer })

    const kartenreihe = within(schlangenKarte).getByRole('list', { name: 'Kartenreihe schlange-spieler-1-f36-timeout' })
    const kartenLabels = within(kartenreihe).getAllByRole('listitem').map((element) => element.textContent)

    expect(kartenLabels[0]).toContain(startkarteId)
    expect(kartenLabels[1]).toContain(anlegekarteId)
  })
})
