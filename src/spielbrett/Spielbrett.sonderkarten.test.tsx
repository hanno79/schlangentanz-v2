/*
Author: Claude Code (G-7)
Datum: 31.07.2026
Version: 1.0
Beschreibung: Schlangenhäutung und Reaktionsfenster.

Beide waren auf `/game` beschädigt, und beide auf dieselbe Weise: Der Ort, der
sie vollständig anbot, war das `AktionenPanel` — und das wurde per CSS
versteckt.

- **Schlangenhäutung** ist die einzige Aktion, die die Engine nicht enumeriert
  (`legalActions.ts:293`); eine Schlange aus n Karten hat n! Reihenfolgen. Am
  Brett blieben zwei Presets übrig, alle anderen Reihenfolgen waren unspielbar.
- **Das Reaktionsfenster** gehört dem *Verteidiger*, nicht dem Zugspieler, und
  blockiert das ganze Spiel: Solange es offen ist, liefert
  `ermittleLegaleAktionen` ein leeres Array.
*/

import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App'
import { erstelleEinzelspielerSpielzustand, starteAusspielphase } from '../engine'
import type { Spielzustand } from '../engine'
import { farbkarte, sonderkarte } from '../engine/__tests__/testHelpers'
import { aufBrettRoute } from '../test/brettTest'


afterEach(() => {
  window.history.pushState({}, '', '/')
})

/** Aktive Schlange aus drei unterscheidbaren Karten plus Häutungskarte auf der Hand. */
function mitHaeutung(): Spielzustand {
  const zustand = starteAusspielphase(erstelleEinzelspielerSpielzustand(1))
  const spieler = zustand.spieler[zustand.aktiverSpielerIndex]
  spieler.schlangen = [
    {
      id: 'schlange-test',
      zustand: 'aktiv',
      karten: [farbkarte('a', 'Blau'), farbkarte('b', 'Rot'), farbkarte('c', 'Gelb')],
    },
  ]
  spieler.hand = [sonderkarte('haeutung-1', 'Schlangenhäutung')]
  return zustand
}

describe('Schlangenhäutung — beliebige Reihenfolge', () => {
  it('bietet den Editor an einer aktiven Schlange mit mehreren Karten an', () => {
    aufBrettRoute()
    render(<App initialZustand={mitHaeutung()} />)

    expect(screen.getByRole('button', { name: 'Häuten' })).toBeInTheDocument()
  })

  it('zeigt die aktuelle Reihenfolge in Spielernamen, nicht in Karten-Ids', () => {
    aufBrettRoute()
    render(<App initialZustand={mitHaeutung()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Häuten' }))

    expect(screen.getByText(/Vorher: Wasserwirbel → Feuerkeim → Sonnenblatt/)).toBeInTheDocument()
  })

  it('erlaubt beliebiges Verschieben, nicht nur zwei Presets', () => {
    aufBrettRoute()
    render(<App initialZustand={mitHaeutung()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Häuten' }))

    // Die mittlere Karte nach vorne — mit zwei Presets nicht erreichbar.
    fireEvent.click(screen.getByRole('button', { name: 'Feuerkeim nach vorne schieben' }))

    expect(screen.getByText(/Nachher: Feuerkeim → Wasserwirbel → Sonnenblatt/)).toBeInTheDocument()
  })

  it('kehrt die Reihenfolge auf Wunsch um', () => {
    aufBrettRoute()
    render(<App initialZustand={mitHaeutung()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Häuten' }))
    fireEvent.click(screen.getByRole('button', { name: 'Umkehren' }))

    expect(screen.getByText(/Nachher: Sonnenblatt → Feuerkeim → Wasserwirbel/)).toBeInTheDocument()
  })

  it('sperrt das Ausführen, solange nichts verändert wurde', () => {
    aufBrettRoute()
    render(<App initialZustand={mitHaeutung()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Häuten' }))

    expect(screen.getByRole('button', { name: 'Häutung ausführen' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Umkehren' }))
    expect(screen.getByRole('button', { name: 'Häutung ausführen' })).toBeEnabled()
  })

  it('stellt die Ausgangsreihenfolge auf Zurücksetzen wieder her', () => {
    aufBrettRoute()
    render(<App initialZustand={mitHaeutung()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Häuten' }))
    fireEvent.click(screen.getByRole('button', { name: 'Umkehren' }))
    fireEvent.click(screen.getByRole('button', { name: 'Zurücksetzen' }))

    expect(screen.getByText(/Nachher: Wasserwirbel → Feuerkeim → Sonnenblatt/)).toBeInTheDocument()
  })

  it('bietet keinen Editor ohne Häutungskarte auf der Hand', () => {
    const zustand = mitHaeutung()
    zustand.spieler[zustand.aktiverSpielerIndex].hand = [farbkarte('x', 'Blau')]

    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    expect(screen.queryByRole('button', { name: 'Häuten' })).toBeNull()
  })
})

/**
 * Offene Schlangengruben-Abwehr.
 *
 * **ÄNDERUNG [01.08.2026]:** Vorher verteidigte hier immer die KI, und die
 * Tests hielten fest, dass der Mensch deren Knöpfe sieht — sie beschrieben den
 * gemeldeten Fehler, statt ihn zu verhindern. Das Reaktionsfenster gehört dem
 * Angegriffenen; wer das ist, ist jetzt Teil des Aufbaus.
 *
 * `PendingSchlangengrubeAbwehr` arbeitet mit Spieler-*Indizes*.
 */
function mitOffenerReaktion(
  mitFarbenschutz = false,
  verteidigt: 'mensch' | 'ki' = 'mensch',
): { zustand: Spielzustand; verteidigerName: string } {
  const zustand = starteAusspielphase(erstelleEinzelspielerSpielzustand(1))
  const menschIndex = zustand.spieler.findIndex((spieler) => spieler.steuerung === 'Mensch')
  const kiIndex = zustand.spieler.findIndex((spieler) => spieler.steuerung === 'KI')
  const zielIndex = verteidigt === 'mensch' ? menschIndex : kiIndex
  const angreiferIndex = verteidigt === 'mensch' ? kiIndex : menschIndex
  zustand.aktiverSpielerIndex = angreiferIndex
  /* Die Hand des Verteidigers wird gesetzt statt gewürfelt: Ob er einen
     Farbenschutz hält, entscheidet, wie viele Optionen die Engine anbietet —
     mit zufälliger Hand wäre der Test mal ein-, mal zweiknöpfig. */
  zustand.spieler[zielIndex].hand = mitFarbenschutz
    ? [sonderkarte('schutz-1', 'Farbenschutz')]
    : [farbkarte('egal-1', 'Blau')]
  zustand.pendingReaktion = {
    typ: 'SchlangengrubeAbwehr',
    angreifenderSpielerIndex: angreiferIndex,
    zielSpielerIndex: zielIndex,
  }
  return { zustand, verteidigerName: zustand.spieler[zielIndex].name }
}

describe('Reaktionsfenster', () => {
  it('legt dem angegriffenen Menschen die Entscheidung vor', () => {
    const { zustand } = mitOffenerReaktion()

    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    const zugaktion = screen.getByRole('region', { name: 'Zugaktion' })
    expect(zugaktion).toHaveTextContent(/Du wirst angegriffen/)
    expect(within(zugaktion).getAllByRole('button').length).toBeGreaterThan(0)
  })

  /* Der gemeldete Fehler vom 01.08.2026: Nach einem Farbendieb gegen die KI
     fragte das Brett den Menschen, ob der *Gegner* seinen Farbenschutz
     einsetzen soll. Das ist die Entscheidung des Angegriffenen — und der
     Farbenschutz liegt auf dessen Hand. */
  it('legt dem Menschen keine Entscheidung vor, die einem KI-Gegner gehört', () => {
    const { zustand, verteidigerName } = mitOffenerReaktion(true, 'ki')

    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    const zugaktion = screen.getByRole('region', { name: 'Zugaktion' })
    expect(within(zugaktion).queryAllByRole('button')).toHaveLength(0)
    /* Beides zusammen: Der Mensch bekommt nichts zu drücken, *und* es steht da,
       auf wen gewartet wird. Nur das Ausbleiben zu prüfen ließe offen, ob das
       Brett den Zustand erklärt oder bloß leer bleibt. */
    expect(zugaktion).toHaveTextContent(new RegExp(`${verteidigerName} überlegt`))
  })

  it('nimmt der Aktionsliste alles andere, solange die Reaktion offen ist', () => {
    const { zustand } = mitOffenerReaktion()

    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    // Die Engine lehnt jede andere Aktion ab — die Liste darf keine anbieten.
    const seite = screen.getByRole('region', { name: 'Aktionen' })
    expect(within(seite).queryAllByRole('button')).toHaveLength(0)
  })

  it('bietet dem Verteidiger ohne Farbenschutz nur das Durchlassen an', () => {
    const { zustand } = mitOffenerReaktion(false)

    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    const zugaktion = screen.getByRole('region', { name: 'Zugaktion' })
    expect(within(zugaktion).getAllByRole('button')).toHaveLength(1)
    expect(zugaktion).toHaveTextContent(/Kein Farbenschutz/)
  })

  it('bietet mit Farbenschutz beide Wege an', () => {
    const { zustand } = mitOffenerReaktion(true)

    aufBrettRoute()
    render(<App initialZustand={zustand} />)

    const zugaktion = screen.getByRole('region', { name: 'Zugaktion' })
    expect(within(zugaktion).getAllByRole('button')).toHaveLength(2)
    expect(zugaktion).not.toHaveTextContent(/Kein Farbenschutz/)
  })
})
