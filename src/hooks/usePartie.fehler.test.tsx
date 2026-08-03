/*
Author: Claude Code
Datum: 03.08.2026
Version: 1.0
Beschreibung: Was die Zustandsschicht tut, wenn die Engine eine Aktion ablehnt.

Bis zum 03.08.2026 lief `wechsleZustand` so ab: erst die Auswahl des Spielers
zurücksetzen, dann die Engine fragen. Warf die Engine — und sie wirft an rund 220
Stellen —, blieb der Spielzustand zwar unberührt (sie ist rein funktional), aber
die Kartenauswahl war weg und keine Meldung stand irgendwo. Aus Spielersicht: Der
Klick hat die Auswahl aufgehoben und sonst nichts getan.

Die Tests hier halten beide Hälften der Korrektur fest — die Meldung **und** die
erhaltene Auswahl. Die zweite ist der eigentliche Regressionsschutz: Sie ist die
einzige, die umfällt, wenn jemand die Reihenfolge wieder umdreht.
*/

import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePartie } from './usePartie'
import { erstelleEinzelspielerSpielzustand, starteAusspielphase } from '../engine'
import type { SpielAktion, Spielzustand } from '../engine'

function partie(): Spielzustand {
  return starteAusspielphase(erstelleEinzelspielerSpielzustand(1))
}

/**
 * Eine Aktion, die die Engine sicher ablehnt: Die Handkarte gehört nicht dem
 * aktiven Spieler. `pruefeAktion` antwortet darauf mit „Die Karte befindet sich
 * nicht auf der Hand des aktiven Spielers."
 */
function abgelehnteAktion(zustand: Spielzustand): SpielAktion {
  return {
    typ: 'NeueSchlangeStarten',
    spielerId: zustand.spieler[zustand.aktiverSpielerIndex].id,
    handkartenId: 'karte-die-es-nicht-gibt',
  }
}

/* Ein Hook lässt sich nur aus einer Komponente heraus aufrufen. Statt
   `renderHook` eine winzige Sonde: Sie reicht die Rückgabe nach außen und
   zeichnet die zwei Werte, die geprüft werden. So bleibt der Test an der
   öffentlichen Schnittstelle und nicht an Interna. */
function Sonde({ hinaus, initialZustand }: { hinaus: (p: ReturnType<typeof usePartie>) => void; initialZustand: Spielzustand }) {
  const partieHook = usePartie({ initialZustand })
  hinaus(partieHook)
  return (
    <div>
      <span data-testid="fehler">{partieHook.fehler ?? ''}</span>
      <span data-testid="auswahl">{partieHook.ausgewaehlteHandkarteAuswahl?.karteId ?? ''}</span>
    </div>
  )
}

describe('usePartie — abgelehnte Aktion', () => {
  it('meldet die deutsche Engine-Meldung, statt still zu scheitern', () => {
    const start = partie()
    let aktuell!: ReturnType<typeof usePartie>
    render(<Sonde hinaus={(p) => { aktuell = p }} initialZustand={start} />)

    act(() => aktuell.fuhreAktionAus(abgelehnteAktion(start)))

    expect(screen.getByTestId('fehler')).toHaveTextContent(
      'Die Karte befindet sich nicht auf der Hand des aktiven Spielers.',
    )
  })

  it('lässt den Spielzustand unberührt', () => {
    const start = partie()
    let aktuell!: ReturnType<typeof usePartie>
    render(<Sonde hinaus={(p) => { aktuell = p }} initialZustand={start} />)
    const vorher = aktuell.zustand

    act(() => aktuell.fuhreAktionAus(abgelehnteAktion(start)))

    // Identität, nicht nur Gleichheit: setZustand darf gar nicht gelaufen sein.
    expect(aktuell.zustand).toBe(vorher)
  })

  /*
   * Der Regressionsschutz für die Reihenfolge. Vor der Korrektur lief das
   * Zurücksetzen der Auswahl vor dem Engine-Aufruf — dieser Test wäre rot
   * gewesen, alle anderen grün.
   */
  it('behält die gewählte Handkarte, damit der Spieler etwas anderes probieren kann', () => {
    const start = partie()
    let aktuell!: ReturnType<typeof usePartie>
    render(<Sonde hinaus={(p) => { aktuell = p }} initialZustand={start} />)

    const aktiver = start.spieler[start.aktiverSpielerIndex]
    const gewaehlt = { spielerId: aktiver.id, karteId: aktiver.hand[0].id }
    act(() => aktuell.setAusgewaehlteHandkarteAuswahl(gewaehlt))
    expect(screen.getByTestId('auswahl')).toHaveTextContent(gewaehlt.karteId)

    act(() => aktuell.fuhreAktionAus(abgelehnteAktion(start)))

    expect(screen.getByTestId('auswahl')).toHaveTextContent(gewaehlt.karteId)
  })

  it('räumt die Meldung weg, sobald wieder etwas gelingt', () => {
    const start = partie()
    let aktuell!: ReturnType<typeof usePartie>
    render(<Sonde hinaus={(p) => { aktuell = p }} initialZustand={start} />)

    act(() => aktuell.fuhreAktionAus(abgelehnteAktion(start)))
    expect(screen.getByTestId('fehler')).not.toBeEmptyDOMElement()

    // Eine Aktion, die die Engine annimmt: die erste, die sie selbst anbietet.
    const legal = aktuell.zustand
    act(() => aktuell.fuhreAktionAus(ersteLegaleAktion(legal)))

    expect(screen.getByTestId('fehler')).toBeEmptyDOMElement()
  })
})

function ersteLegaleAktion(zustand: Spielzustand): SpielAktion {
  const aktiver = zustand.spieler[zustand.aktiverSpielerIndex]
  const farbkarte = aktiver.hand.find((karte) => karte.typ === 'Farbkarte')
  if (!farbkarte) throw new Error('Testsetup erwartet eine Farbkarte auf der Hand.')
  return { typ: 'NeueSchlangeStarten', spielerId: aktiver.id, handkartenId: farbkarte.id }
}
