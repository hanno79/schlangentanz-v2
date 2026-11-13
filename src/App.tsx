import { lazy, Suspense, useEffect } from 'react'
import Fehlerfang from './components/Fehlerfang'
import Lobby from './ui/lobby/Lobby'
import { geheZu, seiteZuPfad, useAdresse } from './ui/lobby/navigation'
import { verwirfPartie } from './ui/lobby/partie'
import Rahmen from './ui/lobby/Rahmen'
import { SEITENTITEL, UNBEKANNT, ZURUECK_ZUR_LOBBY } from './ui/lobby/texte'
import Verweis from './ui/lobby/Verweis'
import Spielseite from './ui/spiel/Spielseite'
import Regeln from './ui/regeln/Regeln'
import './ui/lobby/lobby.css'

/*
Der einzige Schalter für den Entwicklertisch: aktiv im Dev-Server und in jedem
Build mit `VITE_TEST_HOOKS=1`, sonst nicht. Lokal setzt `vite build --mode
testhooks` die Variable (siehe `vite.config.ts`), in der Vercel-Vorschau die
Umgebung des Projekts; in Production ist sie nicht gesetzt.

Er steht absichtlich hier als Konstante und nicht in einer Funktion: Vite ersetzt
beide Werte beim Bauen durch Literale, im Produktionsbuild wird daraus `false`,
und der Bundler lässt den Zweig samt dynamischem Import weg. Der Tisch ist dann
nicht nur unerreichbar, sein Code steht gar nicht im Bundle. Hinter einem
Funktionsaufruf bliebe der Import stehen; `tests/entwicklertisch_bundle.test.ts`
schlägt dann an.
*/
const Entwicklertisch =
  import.meta.env.DEV || import.meta.env.VITE_TEST_HOOKS === '1'
    ? lazy(() => import('./entwicklung/Entwicklertisch'))
    : null

function istEntwicklerPfad(pfad: string): boolean {
  return pfad === '/dev' || pfad.startsWith('/dev/')
}

/**
 * Der App-Rahmen: wählt zur Adresse die Seite und legt den Fehlerfang darum,
 * damit ein Fehler beim Start oder beim Zeichnen sichtbar wird (O2 K4).
 *
 * Der Weg aus dem Fehlerfang zurück in die Lobby verwirft den Spielstand mit
 * Absicht (Begründung in `Fehlerfang.tsx`): Sonst käme ein Stand, an dem das
 * Zeichnen scheitert, nach jedem Neuladen zurück.
 */
export default function App() {
  const pfad = useAdresse()

  // `key`: Wer nach einem Fehler mit Vor oder Zurück die Seite wechselt, sieht die neue Seite, nicht den alten Fehler.
  return (
    <Fehlerfang
      key={pfad}
      onZurueckZurLobby={() => {
        verwirfPartie()
        geheZu('lobby')
      }}
    >
      <Seiteninhalt pfad={pfad} />
    </Fehlerfang>
  )
}

function Seiteninhalt({ pfad }: { pfad: string }) {
  const seite = seiteZuPfad(pfad)
  const istEntwicklertisch = Entwicklertisch !== null && istEntwicklerPfad(pfad)

  useEffect(() => {
    if (!istEntwicklertisch) document.title = SEITENTITEL[seite ?? 'unbekannt']
  }, [seite, istEntwicklertisch])

  if (Entwicklertisch !== null && istEntwicklertisch) {
    return (
      <Suspense fallback={<p>Lädt …</p>}>
        <Entwicklertisch />
      </Suspense>
    )
  }

  switch (seite) {
    case 'lobby':
      return <Lobby />
    case 'spiel':
      return <Spielseite />
    case 'regeln':
      return <Regeln />
    case null:
      return (
        <Rahmen
          testId="unbekannte-seite"
          titel={UNBEKANNT.titel}
          text={UNBEKANNT.text(pfad)}
          fuss={
            <Verweis ziel="lobby" className="rahmen-verweis rahmen-verweis--haupt">
              {ZURUECK_ZUR_LOBBY}
            </Verweis>
          }
        />
      )
  }
}
