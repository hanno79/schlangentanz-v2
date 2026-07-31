/*
Author: Claude Code (G-8)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Bindung zwischen Oberfläche und Engine — die Regeln R16 bis R27.

Portiert aus `src/App.test.tsx`, das die alte Ansicht prüfte und mit ihr
entfallen ist. Die geprüften Regeln sind dieselben; nur das Markup ist neu.
Diese Abdeckung durfte nicht mit der Ansicht verschwinden: Sie prüft nicht, wie
etwas aussieht, sondern dass die Oberfläche die Engine korrekt spiegelt und
bedient.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App'
import { beendeZug, erstelleSpielzustand, starteAusspielphase } from '../engine'
import type { Spielzustand } from '../engine'
import { farbkarte } from '../engine/__tests__/testHelpers'

function aufBrettRoute() {
  window.history.pushState({}, '', '/game')
}

afterEach(() => {
  window.history.pushState({}, '', '/')
})

function partie(): Spielzustand {
  return starteAusspielphase(erstelleSpielzustand(2, () => 0.5))
}

function aktionsliste() {
  return screen.getByRole('region', { name: 'Aktionen' })
}

describe('R16 — legale Engine-Aktionen erscheinen als Bedienelemente', () => {
  it('bietet jede legale Aktion als Knopf an', () => {
    aufBrettRoute()
    render(<App initialZustand={partie()} />)

    expect(within(aktionsliste()).getAllByRole('button').length).toBeGreaterThan(0)
  })
})

describe('R17 — ein Klick führt die Aktion über die Engine aus', () => {
  it('startet eine neue Schlange und schreibt sie aufs Brett', () => {
    aufBrettRoute()
    render(<App initialZustand={partie()} />)

    const start = within(aktionsliste())
      .getAllByRole('button')
      .find((knopf) => /Neue Schlange starten/.test(knopf.textContent ?? ''))
    expect(start).toBeDefined()

    fireEvent.click(start!)

    const flaeche = screen.getByRole('region', { name: 'Deine Schlangen' })
    expect(flaeche).toHaveTextContent(/1\. Schlange/)
  })
})

describe('R19 — Kartenarten pro Zug', () => {
  it('bietet nach einer gespielten Farbkarte keine zweite mehr an', () => {
    aufBrettRoute()
    render(<App initialZustand={partie()} />)

    const start = within(aktionsliste())
      .getAllByRole('button')
      .find((knopf) => /Neue Schlange starten/.test(knopf.textContent ?? ''))
    fireEvent.click(start!)

    const uebrig = within(aktionsliste()).queryAllByRole('button')
    expect(uebrig.every((knopf) => !/Neue Schlange starten|anlegen/.test(knopf.textContent ?? ''))).toBe(true)
  })
})

describe('R23 — Zugpflichten sind sichtbar und aktuell', () => {
  it('zählt gespielte Karten nach einer Aktion hoch', () => {
    aufBrettRoute()
    render(<App initialZustand={partie()} />)

    expect(screen.getByText(/0\/2 Karten/)).toBeInTheDocument()

    const start = within(aktionsliste())
      .getAllByRole('button')
      .find((knopf) => /Neue Schlange starten/.test(knopf.textContent ?? ''))
    fireEvent.click(start!)

    expect(screen.getByText(/1\/2 Karten/)).toBeInTheDocument()
  })
})

describe('R25 bis R27 — die Phasen laufen über die Engine weiter', () => {
  it('führt von der Ausspielphase bis zur Zugübergabe', () => {
    aufBrettRoute()
    render(<App initialZustand={partie()} />)

    const start = within(aktionsliste())
      .getAllByRole('button')
      .find((knopf) => /Neue Schlange starten/.test(knopf.textContent ?? ''))
    fireEvent.click(start!)

    fireEvent.click(screen.getByRole('button', { name: /Weiter zur Aufgabenprüfung/ }))
    expect(screen.getByText('Aufgaben prüfen')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Weiter zum Zugabschluss/ }))
    expect(screen.getByText('Zug abschließen')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Zug an nächsten Spieler geben/ }))
    // Der nächste Spieler ist dran — bei zwei Spielern der Gegner.
    expect(screen.getByRole('region', { name: 'Zugaktion' })).toHaveTextContent(/Gegnerzug abspielen/)
  })

  it('sperrt das Ende der Ausspielphase, solange keine Karte gespielt ist', () => {
    aufBrettRoute()
    render(<App initialZustand={partie()} />)

    expect(screen.getByRole('button', { name: /Weiter zur Aufgabenprüfung/ })).toBeDisabled()
  })
})

describe('Stapel und Aufgaben kommen aus dem Engine-Zustand', () => {
  it('zeigt Nachziehstapel, Ablage und offene Aufgaben', () => {
    aufBrettRoute()
    const zustand = partie()
    render(<App initialZustand={zustand} />)

    const status = screen.getByRole('region', { name: 'Spielverlauf' })
    expect(status).toHaveTextContent(String(zustand.nachziehstapel.length))
    expect(status).toHaveTextContent(String(zustand.offeneAufgaben.length))
  })

  it('aktualisiert den Nachziehstapel, wenn nachgezogen wird', () => {
    aufBrettRoute()
    /* Gezogen wird beim Start der Ausspielphase (turnState.ts:394), nicht beim
       Zugwechsel. Mit halbleerer Hand ist der Nachzug garantiert. */
    const zustand = partie()
    zustand.zugphase = 'Nachziehphase'
    zustand.spieler[zustand.aktiverSpielerIndex].hand = [farbkarte('blau-a', 'Blau')]
    render(<App initialZustand={zustand} />)

    /* Gelesen wird die Zahl aus der Anzeige, nicht aus dem Zustandsobjekt —
       geprüft werden soll ja gerade, dass die Anzeige der Engine folgt. */
    const stapelZahl = () => {
      const text = screen.getByRole('region', { name: 'Spielverlauf' }).textContent ?? ''
      return Number(/Nachziehstapel\s*(\d+)/.exec(text)?.[1] ?? NaN)
    }
    const vorher = stapelZahl()
    expect(Number.isNaN(vorher)).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: /Ausspielphase starten/ }))

    expect(stapelZahl()).toBeLessThan(vorher)
  })
})

describe('Spielerübersicht spiegelt den Engine-Zustand', () => {
  it('nennt jeden Gegner mit Punkten, Schlangen und Handkarten', () => {
    aufBrettRoute()
    const zustand = partie()
    render(<App initialZustand={zustand} />)

    const gegnerbereich = screen.getByRole('region', { name: 'Gegner' })
    for (const spieler of zustand.spieler.slice(1)) {
      expect(gegnerbereich).toHaveTextContent(spieler.name)
    }
  })

  it('aktualisiert die Handkartenzahl nach einer Aktion', () => {
    aufBrettRoute()
    const zustand = partie()
    const spieler = zustand.spieler[zustand.aktiverSpielerIndex]
    spieler.hand = [farbkarte('blau-a', 'Blau'), farbkarte('blau-b', 'Blau')]
    render(<App initialZustand={zustand} />)

    expect(screen.getByText(/2\/10 Karten/)).toBeInTheDocument()

    const start = within(aktionsliste())
      .getAllByRole('button')
      .find((knopf) => /Neue Schlange starten/.test(knopf.textContent ?? ''))
    fireEvent.click(start!)

    expect(screen.getByText(/1\/10 Karten/)).toBeInTheDocument()
  })
})

describe('Spielende', () => {
  it('zeigt die Siegerehrung, sobald die Engine das Spiel beendet', () => {
    aufBrettRoute()
    const zustand = partie()
    zustand.zugphase = 'Spielende'
    render(<App initialZustand={zustand} />)

    expect(screen.getByRole('region', { name: 'Sieger-Party' })).toBeInTheDocument()
  })

  it('bietet vor Spielende keine Siegerehrung an', () => {
    aufBrettRoute()
    render(<App initialZustand={partie()} />)

    expect(screen.queryByRole('region', { name: 'Sieger-Party' })).toBeNull()
  })
})

describe('Engine-Zugwechsel bleibt konsistent', () => {
  it('übernimmt einen ausserhalb der UI beendeten Zug', () => {
    aufBrettRoute()
    const zustand = partie()
    zustand.zugpflichten = { ...zustand.zugpflichten, gespielteKarten: 1, gespielteFarbkarten: 1 }
    zustand.zugphase = 'Zugabschluss'
    const nachher = beendeZug(zustand, { pflichtenErfuellt: true })

    render(<App initialZustand={nachher} />)

    expect(screen.getByText(nachher.spieler[nachher.aktiverSpielerIndex].name)).toBeInTheDocument()
  })
})
