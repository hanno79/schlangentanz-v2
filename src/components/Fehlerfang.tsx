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

**Warum die Partie trotzdem weg ist.** Es gibt kein Speichern und kein Laden
(siehe `docs/WORKFLOW.md`, „Bewusst nicht implementiert"). Ein Neustart ist alles,
was angeboten werden kann — und das gehört ehrlich dagestanden, statt einen
Weiterspielen-Knopf hinzustellen, der nichts rettet.
*/

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

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
    /* Der Diagnoseweg, solange es kein externes Fehler-Tracking gibt: Die
       Meldung steht für den Spieler auf dem Schirm, der Stack für den
       Entwickler in der Konsole. Bewusst `console.error` und nicht mehr — ein
       Fremddienst wäre die erste Abhängigkeit im Produktionsbundle. */
    console.error('Fehler beim Zeichnen des Spielbretts:', fehler, info.componentStack)
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
          Die laufende Partie lässt sich nicht fortsetzen — Schlangentanz speichert
          keine Spielstände.
        </p>
        <button type="button" className="fehlerfang__knopf" onClick={this.zurueck}>
          Zurück zur Lobby
        </button>
      </main>
    )
  }
}
