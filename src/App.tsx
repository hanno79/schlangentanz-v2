import './App.css'
import { erstelleSpielzustand, starteAusspielphase, ermittleLegaleAktionen } from './engine'
import type { SpielAktion } from './engine'

const demoZustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))
const legaleAktionen = ermittleLegaleAktionen(demoZustand)
const aktiverSpieler = demoZustand.spieler[demoZustand.aktiverSpielerIndex]

function aktionsLabel(aktion: SpielAktion): string {
  switch (aktion.typ) {
    case 'NeueSchlangeStarten':
      return `Neue Schlange starten mit Karte ${aktion.handkartenId}`
    case 'KarteAnlegen':
      return `Karte ${aktion.handkartenId} an Schlange ${aktion.schlangenId} ${aktion.position} anlegen`
  }
}

function App() {
  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="title">
        <p className="eyebrow">Neues Projekt · neues GitHub-Repo · neues Vercel-Projekt</p>
        <h1 id="title">Schlangentanz v2 Greenfield Rebuild</h1>
        <p>
          Dieses Repository ist der saubere Neustart. Es übernimmt keinen alten
          Paperclip- oder Schlangentanz-v1-Code. Die Umsetzung beginnt erst nach
          Freigabe der <code>docs/GAME_SPEC.md</code>.
        </p>
        <ul>
          <li>Hermes orchestriert und prüft die Gates.</li>
          <li>Claude Code baut kleine, getestete Slices.</li>
          <li>Codex reviewed adversarial gegen Spec und Tests.</li>
        </ul>
      </section>
      <section aria-label="Legale Aktionen">
        <p>Engine-Demo: Ausspielphase</p>
        <p>Aktiver Spieler: {aktiverSpieler.id}</p>
        <div>
          {legaleAktionen.map((aktion, i) => (
            <button key={i}>{aktionsLabel(aktion)}</button>
          ))}
        </div>
        <p>Quelle: engine.ermittleLegaleAktionen</p>
      </section>
    </main>
  )
}

export default App
