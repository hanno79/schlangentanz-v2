/*
Author: Claude Code
Datum: 03.08.2026
Version: 1.0
Beschreibung: Fängt Render-Fehler ab, damit aus einem Wertungsfehler keine weiße
              Seite wird.

**Warum eine Klassenkomponente.** Sie ist die einzige im Projekt, und das bleibt
sie hoffentlich: React bietet für das Abfangen von Render-Fehlern bis heute nur
`getDerivedStateFromError` und `componentDidCatch` an — beides gibt es nicht als
Hook. Das ist keine Stilfrage und kein Rückfall, sondern die einzige Bauform, die
es dafür gibt.

**Warum es das braucht.** Die Engine wirft an rund 220 Stellen, und ein Teil
davon läuft im Render: `Spielbrett.tsx` ruft `ermittleSpielerLagen`, das führt
über `berechneSpielzustandGesamtwertung` in `scoring.ts` mit sieben eigenen
Wurfstellen. Ein `try/catch` in einem Klick-Handler erreicht das nicht — wirft
der Render, stirbt der React-Baum, und der Spieler sieht eine weiße Seite ohne
ein Wort dazu.

**Warum die Partie trotzdem weg ist.** Seit dem 03.08.2026 überlebt eine Partie
den Reload (`src/spielstand.ts`) — ausgerechnet hier hilft das aber nicht: Der
Weg zurück zur Lobby verwirft den Spielstand mit Absicht. Ein Zustand, an dem das
Zeichnen gescheitert ist, käme sonst nach jedem Reload zurück, und der Spieler
säße dauerhaft auf dieser Seite. Der Verlust ist der Preis dafür, wieder
hineinzukommen; das gehört ehrlich dagestanden, statt einen Weiterspielen-Knopf
hinzustellen, der nichts rettet.
*/

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { meldeFehler } from '../fehlerdienst'

interface FehlerfangProps {
  children: ReactNode
  /**
   * Führt zurück in die Lobby.
   *
   * ÄNDERUNG [03.08.2026]: Hieß zuerst `onNeuesSpiel` und war optional. Beides
   * war falsch: Der Handler startet keine Partie, sondern navigiert — die Zahl
   * der Gegner wählt man in der Lobby. Und optional war er nur, um einen Zweig
   * zu haben, den ausschließlich sein eigener Test benutzte.
   */
  onZurueckZurLobby: () => void
}

interface FehlerfangState {
  meldung: string | null
}

export default class Fehlerfang extends Component<FehlerfangProps, FehlerfangState> {
  state: FehlerfangState = { meldung: null }

  static getDerivedStateFromError(fehler: unknown): FehlerfangState {
    return {
      meldung: fehler instanceof Error ? fehler.message : 'Unbekannter Fehler.',
    }
  }

  componentDidCatch(fehler: unknown, info: ErrorInfo): void {
    /* ÄNDERUNG [04.08.2026]: Der Fehler geht jetzt auch nach außen.

       Hier stand: „Bewusst `console.error` und nicht mehr — ein Fremddienst wäre
       die erste Abhängigkeit im Produktionsbundle." Das war richtig beschrieben und
       als Zustand falsch: `console.error` erreicht niemanden. Ein Spieler sah die
       Meldung unten, und niemand sonst erfuhr, dass die Wertung geworfen hat.

       `@sentry/browser` ist damit die erste externe Produktionsabhängigkeit. Der
       Preis ist gemessen und steht in `docs/PLAYABILITY_GATE.md`; ohne
       `VITE_SENTRY_DSN` passiert nichts (siehe `src/fehlerdienst.ts`).

       `console.error` bleibt: Es ist der Weg für den Entwickler am eigenen Rechner,
       wo keine DSN gesetzt ist. */
    console.error('Fehler beim Zeichnen des Spielbretts:', fehler, info.componentStack)
    meldeFehler(fehler, { componentStack: info.componentStack ?? 'unbekannt' })
  }

  /* Erst den eigenen Fehlerzustand räumen, dann navigieren: Sonst zeigt der Fang
     nach der Rückkehr weiter die alte Meldung, obwohl die Lobby längst da ist. */
  private zurueck = (): void => {
    this.setState({ meldung: null })
    this.props.onZurueckZurLobby()
  }

  render(): ReactNode {
    const { meldung } = this.state
    if (meldung === null) return this.props.children

    return (
      <main className="fehlerfang" role="alert">
        <h1 className="fehlerfang__titel">Das Spielbrett konnte nicht gezeichnet werden</h1>
        <p className="fehlerfang__meldung">{meldung}</p>
        <p className="fehlerfang__hinweis">
          Die laufende Partie lässt sich nicht fortsetzen — ihr Spielstand wird
          verworfen, damit der Fehler sich beim nächsten Aufruf nicht wiederholt.
        </p>
        <button type="button" className="fehlerfang__knopf" onClick={this.zurueck}>
          Zurück zur Lobby
        </button>
      </main>
    )
  }
}
