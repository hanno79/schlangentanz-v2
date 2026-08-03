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
import Fehlerfang from './components/Fehlerfang'
import Spielbrett from './spielbrett/Spielbrett'
import { verwirfSpielstand } from './spielstand'

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

  /** Route wechseln, ohne die Seite neu zu laden. */
  function navigiere(zielPfad: string) {
    if (typeof window !== 'undefined') window.history.pushState({}, '', zielPfad)
    setPfad(zielPfad)
  }

  function starteNeuesSpiel(kiGegner: KiGegnerAnzahl) {
    /* ÄNDERUNG [03.08.2026]: Nur bei Erfolg aufs Brett wechseln. Vorher wurde
       immer navigiert — schlug die Factory fehl, stand der Spieler auf dem Brett
       der *alten* Partie, mit einer Meldung, die dort je nach Lage gar nicht zu
       sehen war (Codex-Review, Gate 7). Wer nicht starten konnte, bleibt in der
       Lobby, wo die Meldung hingehört. */
    if (partie.handleNeuesLobbySpiel(kiGegner)) navigiere('/game')
  }

  if (istSpielPfad(pfad)) {
    return (
      /* ÄNDERUNG [03.08.2026]: Der Fehlerfang sitzt hier und nicht in `main.tsx`
         um die ganze App. Stirbt das Brett an einem Wertungsfehler, soll die
         Lobby erreichbar bleiben — läge der Fang eine Ebene höher, nähme er auch
         den Weg zurück mit.

         Er führt zurück in die Lobby und startet nicht selbst eine Partie: Die
         Zahl der Gegner wählt man dort, und auf `/game` gäbe es dafür keine
         Oberfläche.

         ÄNDERUNG [03.08.2026]: Er verwirft dabei den gespeicherten Spielstand.
         Ohne das baut die Persistenz eine Falle: Ein Zustand, den
         `deserialisiere` durchlässt, der aber beim Zeichnen die Wertung wirft,
         käme nach jedem Reload zurück — der Spieler säße dauerhaft im
         Fehlerfang. Dass das Brett an ihm gescheitert ist, ist der stärkste
         Hinweis darauf, dass er nicht mehr taugt. */
      <Fehlerfang
        onZurueckZurLobby={() => {
          verwirfSpielstand()
          navigiere('/')
        }}
      >
        <Spielbrett partie={partie} />
        {/* Die Siegerehrung legt sich über das Brett, sobald die Partie endet.

            ÄNDERUNG [03.08.2026]: Erst ab `Spielende` gemountet. `SiegerParty`
            rechnet in zwei `useMemo` die volle Wertung, und die Hook-Regeln
            zwingen beide **vor** ihren eigenen `return null` — dauerhaft
            gemountet lief das also die ganze Partie über für eine Komponente,
            die nichts zeichnet. Mit dem Kettenbonus (R8.4a) wäre auch der
            zweimal je Zustandsänderung mitgelaufen. */}
        {partie.zustand.zugphase === 'Spielende' ? (
          <SiegerParty zustand={partie.zustand} onNeuesSpiel={starteNeuesSpiel} />
        ) : null}
      </Fehlerfang>
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
