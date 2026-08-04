/*
Author: Claude Code
Datum: 03.08.2026
Version: 1.0
Beschreibung: Was passiert, wenn die Engine eine Aktion ablehnt oder das
              Zeichnen scheitert.

`GAME_SPEC.md` Abschnitt 6 verlangt: „Bei einem Verstoß soll die UI die deutsche
Engine-Meldung sichtbar machen, statt still zu scheitern." Diese Anforderung war
bis zum 03.08.2026 offen. Die Engine wirft an rund 220 Stellen; die gesamte
UI-Schicht hatte eine einzige `try/catch`, und die lag im Gegnerzug.

Zwei Wege führen dabei zu ganz verschiedenen Ausfällen:

- **Klickpfad:** Ein Fehler im `onClick` wird von React nicht gefangen. Der Knopf
  tat nichts, kommentarlos — und schlimmer: Die Kartenauswahl war weg, weil sie
  vor dem Engine-Aufruf zurückgesetzt wurde.
- **Render:** `Spielbrett` ruft die Wertung beim Zeichnen (`ermittleSpielerLagen`
  → `scoring.ts`). Ein Fehler dort tötet den React-Baum: weiße Seite.
*/

import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import Fehlerfang from '../components/Fehlerfang'
import type { Spielzustand } from '../engine'
import { SPIELSTAND_SCHLUESSEL } from '../spielstand'
import { aufBrettRoute, einzelspielerPartie } from '../test/brettTest'


/* Die Route setzt `src/test/setup.ts` global zurück — hier nur die Spione. */
afterEach(() => {
  vi.restoreAllMocks()
})


describe('Abgelehnte Aktion', () => {
  it('zeigt keine Fehlermeldung, solange nichts schiefgeht', () => {
    aufBrettRoute()
    render(<App initialZustand={einzelspielerPartie()} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  /*
   * Der Fehlerpfad wird über einen Zustand ausgelöst, den die Engine ablehnt:
   * Eine Schlange mit einer Farbenfusion-Karte, für die kein `farbenfusionen`
   * -Eintrag existiert, lässt `scoring.ts` werfen
   * („Farbenfusion konnte nicht den fusionierten Punkten zugeordnet werden.").
   *
   * Das ist kein konstruierter Sonderfall: Genau diese Inkonsistenz war der
   * Audit-Fund K2, und `bereinigeFarbenfusionen` in `zugHelfer.ts` existiert,
   * um sie zu verhindern. Der Test prüft, was passiert, wenn so ein Zustand
   * trotzdem entsteht.
   */
  function zustandMitKaputterWertung(): Spielzustand {
    const zustand = einzelspielerPartie()
    zustand.spieler[0].schlangen = [
      {
        id: 'schlange-kaputt',
        zustand: 'aktiv',
        karten: [{ typ: 'Sonderkarte', id: 'farbenfusion-99', name: 'Farbenfusion' }],
      },
    ]
    return zustand
  }

  it('fängt einen Wertungsfehler beim Zeichnen ab, statt eine weiße Seite zu zeigen', () => {
    // Der Fehlerfang schreibt den Stack in die Konsole — im Test unerwünscht.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    aufBrettRoute()
    render(<App initialZustand={zustandMitKaputterWertung()} />)

    const meldung = screen.getByRole('alert')
    expect(meldung).toHaveTextContent('Das Spielbrett konnte nicht gezeichnet werden')
    expect(meldung).toHaveTextContent('Farbenfusion konnte nicht den fusionierten Punkten zugeordnet werden.')
    /* Ehrlich bleiben: Die Partie ist verloren — nicht weil nicht gespeichert
       würde, sondern weil der Fehlerfang den Stand mit Absicht verwirft. */
    expect(meldung).toHaveTextContent(/Spielstand wird\s+verworfen/i)
  })

  it('bietet nach einem Zeichenfehler den Weg zurück in die Lobby an', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    aufBrettRoute()
    render(<App initialZustand={zustandMitKaputterWertung()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Zurück zur Lobby' }))

    /* Die Lobby ist wieder da — und zwar die Lobby, nicht ein zweites kaputtes
       Brett. Dort wählt man die Gegnerzahl, was auf `/game` gar nicht ginge. */
    expect(screen.getByRole('heading', { name: 'Schlangentanz' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  /*
   * ÄNDERUNG [03.08.2026]: Der eigentliche Beweis, angeregt vom Codex-Review.
   * Zurück in die Lobby zu kommen nützt nichts, wenn der nächste Start wieder im
   * selben kaputten Brett endet — der Fehler steckte ja im Spielzustand. Erst
   * dieser Test zeigt, dass `handleNeuesLobbySpiel` ihn wirklich ersetzt.
   */
  it('führt aus der Lobby zu einem spielbaren Brett zurück, nicht zurück in den Fehler', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    aufBrettRoute()
    render(<App initialZustand={zustandMitKaputterWertung()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Zurück zur Lobby' }))

    fireEvent.click(screen.getAllByRole('button', { name: /Waldparty starten/ })[0])

    expect(screen.getByRole('region', { name: 'Deine Hand' })).toBeInTheDocument()
    expect(screen.queryByText(/konnte nicht gezeichnet werden/)).not.toBeInTheDocument()
  })

  /*
   * ÄNDERUNG [03.08.2026]: Die Falle, die erst die Persistenz aufstellt.
   *
   * Ein Zustand, der beim Zeichnen wirft, läge nach dem Speichern dauerhaft im
   * Browser. Ohne Gegenmaßnahme säße der Spieler nach jedem Reload wieder im
   * Fehlerfang — und käme mit keinem Klick heraus, weil ein Neustart den
   * Eintrag nicht anfasst. Deshalb verwirft der Weg zurück zur Lobby ihn.
   *
   * **Zwei Dinge beim Schreiben dieses Tests gelernt.**
   *
   * Erstens: `serialisiere` lässt den Zustand aus `zustandMitKaputterWertung`
   * durch, erst `deserialisiere` lehnt ihn ab („Farbenfusion-Karte in
   * schlange.karten ohne farbenfusionen-Eintrag"). Die Persistenz-Validierung
   * ist also **strenger als die Wertung** — und weil `ladeSpielstand` verwirft,
   * was es nicht lesen kann, räumt sich dieser Fall selbst auf. Die Falle ist
   * deutlich enger als befürchtet.
   *
   * Zweitens, und deshalb steht hier `getItem` statt `ladeSpielstand`: Genau
   * diese Selbstheilung macht jeden Nachweis über `ladeSpielstand` wertlos. Er
   * liefert immer `null`, ob der Fehlerfang aufräumt oder nicht — die erste
   * Fassung dieses Tests blieb mit ausgebautem Verwerfen grün und maß nichts.
   *
   * Ausgeschlossen ist die Falle nicht: `scoring.ts` hat Laufzeitpfade, die
   * keine Strukturprüfung sieht (etwa „Regenbogenschlange kann nicht ohne aktive
   * Farbe fortgesetzt werden"). Geprüft wird deshalb am rohen Eintrag.
   */
  it('verwirft den gespeicherten Spielstand, damit der Fehler den Reload nicht überlebt', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    aufBrettRoute()
    render(<App initialZustand={zustandMitKaputterWertung()} />)
    // Der Speichern-Effekt hat den kaputten Zustand weggeschrieben.
    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Zurück zur Lobby' }))

    expect(window.localStorage.getItem(SPIELSTAND_SCHLUESSEL)).toBeNull()
  })
})

describe('Fehlerfang', () => {
  function Wirft(): never {
    throw new Error('Absichtlicher Testfehler.')
  }

  it('zeigt die Meldung statt der Kindkomponente', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <Fehlerfang onZurueckZurLobby={() => {}}>
        <Wirft />
      </Fehlerfang>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Absichtlicher Testfehler.')
  })

  it('reicht Kinder unverändert durch, solange nichts wirft', () => {
    render(
      <Fehlerfang onZurueckZurLobby={() => {}}>
        <p>Alles in Ordnung</p>
      </Fehlerfang>,
    )

    expect(screen.getByText('Alles in Ordnung')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
