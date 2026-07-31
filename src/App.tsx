/*
Author: Claude Code (G-8)
Datum: 31.07.2026
Version: 2.0
Beschreibung: Einstiegspunkt — Lobby auf `/`, Spielbrett auf `/game`.

Bis G-8 lag hier zusätzlich die vollständige alte Waldtanz-Ansicht: rund
250 Zeilen JSX mit 53 Komponententypen, von denen 13 per CSS unsichtbar waren.
Sie ist mit diesem Paket entfallen; `/game` zeigt das Brett aus
`src/spielbrett/` (docs/SPIELBRETT_SPEC.md).

Die Route ist React-Zustand und nicht bloß `window.location.pathname`: Der
Lobby-Start muss nach `/game` wechseln, ohne die Seite neu zu laden — sonst ginge
die gerade erzeugte Partie beim Remount verloren. Eine Router-Bibliothek gibt es
im Projekt nicht, und für zwei Routen wäre sie überzogen.
*/

import { useState } from 'react'
import './App.css'
import type { Spielzustand } from './engine'
import { usePartie } from './hooks/usePartie'
import type { BrettschrittEintrag } from './hooks/usePartie'
import SonnigesNestLobby from './components/SonnigesNestLobby'
import type { KiGegnerAnzahl } from './components/SonnigesNestLobby'
import SiegerParty from './components/SiegerParty'
import Spielbrett from './spielbrett/Spielbrett'

interface AppProps {
  initialZustand?: Spielzustand
  initialBrettschrittEintraege?: BrettschrittEintrag[]
}

/** `/game` und alles darunter zeigt das Spielbrett, alles andere die Lobby. */
function istSpielPfad(pfad: string): boolean {
  return pfad === '/game' || pfad.startsWith('/game/')
}

function App({ initialZustand, initialBrettschrittEintraege }: AppProps) {
  const [pfad, setPfad] = useState(() =>
    typeof window === 'undefined' ? '/' : window.location.pathname,
  )
  const partie = usePartie({ initialZustand, initialBrettschrittEintraege })

  function starteNeuesSpiel(kiGegner: KiGegnerAnzahl) {
    partie.handleNeuesLobbySpiel(kiGegner)
    if (typeof window !== 'undefined') window.history.pushState({}, '', '/game')
    setPfad('/game')
  }

  if (istSpielPfad(pfad)) {
    return (
      <>
        <Spielbrett partie={partie} />
        {/* Die Siegerehrung legt sich über das Brett, sobald die Partie endet. */}
        <SiegerParty zustand={partie.zustand} onNeuesSpiel={starteNeuesSpiel} />
      </>
    )
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Das Kartenspiel</p>
        <h1 className="app-title">Schlangentanz</h1>
        <p>Bereit für deine nächste Schlange</p>
        <ul>
          <li>Baue farbige Schlangen</li>
          <li>Erfülle Aufgaben</li>
          <li>Nutze Sonderkarten</li>
        </ul>
      </section>
      <SonnigesNestLobby
        aktiveKiGegner={partie.zustand.spieler.filter((spieler) => spieler.steuerung === 'KI').length}
        onNeuesSpiel={starteNeuesSpiel}
      />
    </main>
  )
}

export default App
