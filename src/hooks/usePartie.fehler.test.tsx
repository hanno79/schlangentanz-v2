/*
Author: Claude Code
Datum: 03.08.2026
Version: 1.1
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

import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePartie } from './usePartie'
import { ermittleLegaleAktionen } from '../engine'
import type { SpielAktion, Spielzustand } from '../engine'
import { ladeSpielstand, speichereSpielstand, SPIELSTAND_SCHLUESSEL } from '../spielstand'
import { einzelspielerPartie } from '../test/brettTest'

/* Der Gegnerzug wird gemockt, um sein Scheitern zu erzwingen. Nur diese eine
   Funktion — alles andere im Modul bleibt echt. */
vi.mock('../kiZug', async (echt) => ({
  ...(await echt<typeof import('../kiZug')>()),
  spieleKiZuegeBisZumMenschen: vi.fn((zustand) => ({ zustand, protokoll: [], spielzuege: [] })),
}))


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

describe('usePartie — abgelehnte Aktion', () => {
  it('meldet die deutsche Engine-Meldung, statt still zu scheitern', () => {
    const start = einzelspielerPartie()
    const { result } = renderHook(() => usePartie({ initialZustand: start }))

    act(() => result.current.fuhreAktionAus(abgelehnteAktion(start)))

    expect(result.current.fehler).toBe(
      'Die Karte befindet sich nicht auf der Hand des aktiven Spielers.',
    )
  })

  it('lässt den Spielzustand unberührt', () => {
    const start = einzelspielerPartie()
    const { result } = renderHook(() => usePartie({ initialZustand: start }))
    const vorher = result.current.zustand

    act(() => result.current.fuhreAktionAus(abgelehnteAktion(start)))

    // Identität, nicht nur Gleichheit: setZustand darf gar nicht gelaufen sein.
    expect(result.current.zustand).toBe(vorher)
  })

  /*
   * Der Regressionsschutz für die Reihenfolge. Vor der Korrektur lief das
   * Zurücksetzen der Auswahl vor dem Engine-Aufruf — dieser Test wäre rot
   * gewesen, alle anderen grün.
   */
  it('behält die gewählte Handkarte, damit der Spieler etwas anderes probieren kann', () => {
    const start = einzelspielerPartie()
    const { result } = renderHook(() => usePartie({ initialZustand: start }))

    const aktiver = start.spieler[start.aktiverSpielerIndex]
    const gewaehlt = { spielerId: aktiver.id, karteId: aktiver.hand[0].id }
    act(() => result.current.setAusgewaehlteHandkarteAuswahl(gewaehlt))

    act(() => result.current.fuhreAktionAus(abgelehnteAktion(start)))

    expect(result.current.ausgewaehlteHandkarteAuswahl).toEqual(gewaehlt)
  })

  it('räumt die Meldung weg, sobald wieder etwas gelingt', () => {
    const start = einzelspielerPartie()
    const { result } = renderHook(() => usePartie({ initialZustand: start }))

    act(() => result.current.fuhreAktionAus(abgelehnteAktion(start)))
    expect(result.current.fehler).not.toBeNull()

    // Die Engine selbst nach einer legalen Aktion fragen, statt eine nachzubauen.
    const [legale] = ermittleLegaleAktionen(result.current.zustand)
    expect(legale, 'Testsetup erwartet mindestens eine legale Aktion.').toBeDefined()
    act(() => result.current.fuhreAktionAus(legale))

    expect(result.current.fehler).toBeNull()
  })
})

/*
 * ÄNDERUNG [03.08.2026]: Angeregt vom Codex-Review. `App.starteNeuesSpiel`
 * wechselte bisher immer auf `/game` — auch wenn die Partie gar nicht entstanden
 * war. Der Spieler landete dann auf dem Brett der *alten* Partie, mit einer
 * Meldung, die dort je nach Lage nicht zu sehen war.
 *
 * Über die Lobby ist der Fall nicht erreichbar: Sie bietet nur 1 bis 3 Gegner
 * an, und die sind alle gültig. Geprüft wird deshalb an der Stelle, an der er
 * erreichbar ist — der Rückgabewert ist genau das, worauf `App` seine
 * Navigationsentscheidung stützt.
 */
describe('usePartie — neue Partie schlägt fehl', () => {
  it('meldet den Fehlschlag, statt eine halb gestartete Partie zu hinterlassen', () => {
    const start = einzelspielerPartie()
    const { result } = renderHook(() => usePartie({ initialZustand: start }))
    const vorher = result.current.zustand

    let gelungen: boolean | undefined
    act(() => {
      // 99 Gegner: `erstelleEinzelspielerSpielzustand` lehnt das ab (KI_GEGNER_MAX).
      gelungen = result.current.handleNeuesLobbySpiel(99 as never)
    })

    expect(gelungen).toBe(false)
    expect(result.current.fehler).toMatch(/Ungültige KI-Gegneranzahl/)
    expect(result.current.zustand).toBe(vorher)
  })

  it('meldet den Erfolg, damit die Ansicht aufs Brett wechseln darf', () => {
    const { result } = renderHook(() => usePartie({ initialZustand: einzelspielerPartie() }))

    let gelungen: boolean | undefined
    act(() => {
      gelungen = result.current.handleNeuesLobbySpiel(2)
    })

    expect(gelungen).toBe(true)
    expect(result.current.fehler).toBeNull()
  })
})

/*
 * ÄNDERUNG [03.08.2026]: Die Partie überlebt einen Reload. Ein echter Reload
 * lässt sich im Test nicht auslösen — geprüft wird deshalb, was ihn ausmacht:
 * Was steht im Speicher, und was liest ein frisch aufgesetzter Hook daraus?
 */
describe('usePartie — gespeicherte Partie', () => {
  it('schreibt den Zustand nach jeder Änderung weg', () => {
    const start = einzelspielerPartie()
    const { result } = renderHook(() => usePartie({ initialZustand: start }))

    const [legale] = ermittleLegaleAktionen(start)
    act(() => result.current.fuhreAktionAus(legale))

    const gespeichert = ladeSpielstand()
    expect(gespeichert).not.toBeNull()
    // Der neue Stand, nicht der alte: Die Aktion muss drin sein.
    expect(gespeichert!.zugpflichten.gespielteKarten).toBe(1)
  })

  it('nimmt beim Start die gespeicherte Partie, wenn keine vorgegeben ist', () => {
    const gespeichert = einzelspielerPartie()
    gespeichert.spieler[0].schlangen = [
      { id: 'schlange-wiedererkennbar', zustand: 'aktiv', karten: [] },
    ]
    speichereSpielstand(gespeichert)

    const { result } = renderHook(() => usePartie())

    expect(result.current.zustand.spieler[0].schlangen[0]?.id).toBe('schlange-wiedererkennbar')
  })

  /*
   * Die Reihenfolge ist die eigentliche Zusage: `initialZustand` gehört den
   * Tests. Läge der Spielstand davor, hinge die ganze Suite davon ab, was ein
   * früherer Lauf im Speicher hinterlassen hat.
   */
  it('lässt sich von einem vorgegebenen Zustand überstimmen', () => {
    const gespeichert = einzelspielerPartie()
    gespeichert.spieler[0].schlangen = [{ id: 'aus-dem-speicher', zustand: 'aktiv', karten: [] }]
    speichereSpielstand(gespeichert)

    const vorgegeben = einzelspielerPartie()
    const { result } = renderHook(() => usePartie({ initialZustand: vorgegeben }))

    expect(result.current.zustand.spieler[0].schlangen).toHaveLength(0)
  })

  /*
   * ÄNDERUNG [03.08.2026]: Die zweite Sackgasse, gefunden im Codex-Review.
   *
   * Die erste fängt der Fehlerfang ab — dort wirft das Zeichnen. Hier wirft
   * nichts beim Zeichnen: Der KI-Nachlauf scheitert, die Meldung landet im
   * Fehlerkanal, und das Brett steht still. Ist die KI am Zug, hat der Mensch
   * keine Aktion; ohne Verwerfen lüde jeder Reload denselben Zustand und damit
   * dieselbe Sackgasse.
   */
  it('verwirft den Spielstand, wenn der Gegnerzug scheitert', async () => {
    const { spieleKiZuegeBisZumMenschen } = await import('../kiZug')
    vi.mocked(spieleKiZuegeBisZumMenschen).mockImplementationOnce(() => {
      throw new Error('Engine-Fehler im Gegnerzug.')
    })

    const { result } = renderHook(() => usePartie({ initialZustand: einzelspielerPartie() }))
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).not.toBeNull()

    act(() => result.current.handleKiZugVorspulen())

    expect(result.current.fehler).toBe('Engine-Fehler im Gegnerzug.')
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBeNull()
  })
})
