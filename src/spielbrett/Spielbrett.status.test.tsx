/*
Author: Claude Code (G-5)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Was das Brett über die Lage sagt.

Drei Angaben, die auf `/game` gar nicht sichtbar waren:

- **wer aussetzt** — `aussetzenSpielerIndizes` kam im gesamten `.tsx`-Code nicht
  ein einziges Mal vor. Ein Spieler, den eine Schlangengrube aussetzen lässt,
  erfuhr das nirgends.
- **das Zugbudget** samt Farb-/Sonderkartenaufteilung — der Zähler lebte im
  `AktionenPanel`, das per CSS versteckt wurde.
- **der nächste Pflichtschritt** als Klartext.
*/

import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App'
import { erstelleEinzelspielerSpielzustand, starteAusspielphase } from '../engine'
import type { Spielzustand } from '../engine'
import { aufBrettRoute } from '../test/brettTest'


afterEach(() => {
  window.history.pushState({}, '', '/')
})

function partie(): Spielzustand {
  return starteAusspielphase(erstelleEinzelspielerSpielzustand(1))
}

describe('Brett-Status', () => {
  it('warnt den Spieler, wenn er selbst aussetzen muss', () => {
    const zustand = partie()
    zustand.aussetzenSpielerIndizes = [zustand.aktiverSpielerIndex]

    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    expect(screen.getByText(/Du setzt aus/)).toBeInTheDocument()
  })

  it('zeigt am Gegner, dass er aussetzt', () => {
    const zustand = partie()
    const gegnerIndex = zustand.spieler.findIndex((_, index) => index !== zustand.aktiverSpielerIndex)
    zustand.aussetzenSpielerIndizes = [gegnerIndex]

    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    const gegnerbereich = screen.getByRole('region', { name: 'Gegner' })
    expect(gegnerbereich).toHaveTextContent('setzt aus')
  })

  it('sagt nichts über Aussetzen, solange niemand aussetzt', () => {
    aufBrettRoute()
    render(<App initialZustand={partie()} />)

    expect(screen.queryByText(/setzt aus/)).toBeNull()
    expect(screen.queryByText(/Du setzt aus/)).toBeNull()
  })

  it('führt das Zugbudget nach Farb- und Sonderkarten auf', () => {
    const zustand = partie()
    zustand.zugpflichten = { ...zustand.zugpflichten, gespielteKarten: 1, gespielteFarbkarten: 1 }

    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    expect(screen.getByText(/1\/2 Karten/)).toBeInTheDocument()
    expect(screen.getByText(/1 Farb-, 0 Sonderkarten/)).toBeInTheDocument()
  })

  it('weist auf den Verdoppler hin und hebt das Budget an', () => {
    const zustand = partie()
    zustand.zugpflichten = { ...zustand.zugpflichten, verdopplerBonusAktiv: true }

    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    expect(screen.getByText('Verdoppler aktiv')).toBeInTheDocument()
    expect(screen.getByText(/0\/3 Karten/)).toBeInTheDocument()
  })

  it('nennt den nächsten Pflichtschritt', () => {
    aufBrettRoute()
    render(<App initialZustand={partie()} />)

    // Frisch in der Ausspielphase, noch keine Karte gespielt.
    expect(screen.getByText(/auswählen\.|beenden\./)).toBeInTheDocument()
  })

  it('zeigt die geheime Aufgabe des Menschen, nie die einer KI', () => {
    const zustand = partie()
    const mensch = zustand.spieler.find((spieler) => spieler.steuerung === 'Mensch')!
    const ki = zustand.spieler.find((spieler) => spieler.steuerung === 'KI')!

    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    const seite = screen.getByRole('region', { name: 'Aktionen' })
    expect(seite).toHaveTextContent(mensch.geheimeAufgabe.name)
    if (ki.geheimeAufgabe.name !== mensch.geheimeAufgabe.name) {
      expect(seite).not.toHaveTextContent(ki.geheimeAufgabe.name)
    }
  })
})

describe('Verdeckte Information bleibt verdeckt', () => {
  /* ÄNDERUNG [01.08.2026]: Die geheime Aufgabe eines Gegners zu verbergen
     genügt nicht, wenn ihre Punkte sie verraten. Vorher sprang die angezeigte
     Punktzahl eines KI-Gegners um genau den Wert seiner geheimen Aufgabe,
     sobald er sie erfüllte. Dieser Test misst am Brett, nicht in der Logik. */
  function gegnerPunkte(): string {
    const text = screen.getByRole('region', { name: /^Gegner/ }).textContent ?? ''
    return /(\d+) Punkte/.exec(text)?.[1] ?? ''
  }

  it('ändert die Punktzahl eines Gegners nicht, wenn er seine geheime Aufgabe erfüllt', () => {
    aufBrettRoute()
    const zustand = partie()
    const { unmount } = render(<App initialZustand={zustand} />)
    const vorher = gegnerPunkte()
    unmount()

    const mitErfuellter: Spielzustand = {
      ...zustand,
      spieler: zustand.spieler.map((spieler, index) =>
        index === 1 ? { ...spieler, geheimeAufgabeErfuellt: true } : spieler,
      ),
    }
    render(<App initialZustand={mitErfuellter} />)

    expect(gegnerPunkte()).toBe(vorher)
  })

  it('sagt am Gegnerstreifen, dass die Punkte ohne geheime Aufgaben gelten', () => {
    aufBrettRoute()
    render(<App initialZustand={partie()} />)

    expect(screen.getByRole('region', { name: /^Gegner/ })).toHaveTextContent(/ohne geheime Aufgaben/)
  })
})
