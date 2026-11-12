import { lazy, Suspense } from 'react'

/*
Der einzige Schalter für den Entwicklertisch: aktiv im Dev-Server und im
Testhook-Build (`vite build --mode testhooks` setzt `VITE_TEST_HOOKS`, siehe
`vite.config.ts`), sonst nicht.

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

/** Bis O2 (App-Rahmen und Lobby) gibt es kein Spiel, nur diesen Platzhalter. */
function Platzhalter() {
  return (
    <main className="platzhalter" data-testid="platzhalter">
      <h1>Schlangentanz</h1>
      <p>Das Spiel wird gerade neu gebaut. Hier gibt es bald wieder etwas zu spielen.</p>
    </main>
  )
}

export default function App() {
  if (Entwicklertisch !== null && istEntwicklerPfad(window.location.pathname)) {
    return (
      <Suspense fallback={<p>Lädt …</p>}>
        <Entwicklertisch />
      </Suspense>
    )
  }
  return <Platzhalter />
}
