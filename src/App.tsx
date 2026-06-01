import { useMemo, useState } from 'react'
import './App.css'
import {
  erstelleSpielzustand,
  starteAusspielphase,
  ermittleLegaleAktionen,
  anwendeAktion,
  beendeAusspielphase,
  beendeAufgabenpruefung,
  beendeZug,
  MAX_KARTEN_PRO_ZUG,
  berechneSpielzustandGesamtwertung,
  berechneGewinner,
} from './engine'
import type { SpielAktion, Spielzustand } from './engine'

const defaultZustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))

function kartenIds(karten: { id: string }[]): string {
  return karten.map(k => k.id).join(', ')
}

function aktionsLabel(aktion: SpielAktion): string {
  switch (aktion.typ) {
    case 'NeueSchlangeStarten':
      return `Neue Schlange starten mit Karte ${aktion.handkartenId}`
    case 'KarteAnlegen':
      return `Karte ${aktion.handkartenId} an Schlange ${aktion.schlangenId} ${aktion.position} anlegen`
    case 'PflichtAbwurf':
      return `Karte ${aktion.handkartenId} abwerfen`
  }
}

interface AppProps {
  initialZustand?: Spielzustand
}

function App({ initialZustand = defaultZustand }: AppProps) {
  const [zustand, setZustand] = useState(initialZustand)
  const legaleAktionen = useMemo(() => ermittleLegaleAktionen(zustand), [zustand])
  const gesamtwertung = useMemo(() => berechneSpielzustandGesamtwertung(zustand), [zustand])
  const gewinnerErgebnis = useMemo(
    () => zustand.zugphase === 'Spielende' ? berechneGewinner(zustand.spieler) : null,
    [zustand.zugphase, zustand.spieler],
  )
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]

  function fuhreAktionAus(aktion: SpielAktion) {
    setZustand(z => anwendeAktion(z, aktion))
  }

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
        <p>Zugphase: {zustand.zugphase}</p>
        <p>Aktiver Spieler: {aktiverSpieler.id}</p>
        {aktiverSpieler.schlangen.map(schlange => (
          <p key={schlange.id}>
            Schlange {schlange.id}: {kartenIds(schlange.karten)}
          </p>
        ))}
        <p>
          Handkarten:{' '}
          {aktiverSpieler.hand.length > 0 ? kartenIds(aktiverSpieler.hand) : 'keine'}
        </p>
        {zustand.ablagestapel.length > 0 && (
          <p>Ablagestapel: {kartenIds(zustand.ablagestapel)}</p>
        )}
        <div>
          {legaleAktionen.map((aktion, i) => (
            <button key={i} onClick={() => fuhreAktionAus(aktion)}>
              {aktionsLabel(aktion)}
            </button>
          ))}
        </div>
        <p>Gespielte Karten: {zustand.zugpflichten.gespielteKarten}/{MAX_KARTEN_PRO_ZUG}</p>
        {legaleAktionen.length === 0 && <p>Keine weiteren legalen Aktionen.</p>}
        {zustand.zugphase === 'Ausspielphase' && zustand.zugpflichten.gespielteKarten > 0 && (
          <button onClick={() => setZustand(z => beendeAusspielphase(z))}>
            Ausspielphase beenden
          </button>
        )}
        {zustand.zugphase === 'Aufgabenpruefung' && (
          <button onClick={() => setZustand(z => beendeAufgabenpruefung(z, { aufgabenGeprueft: true }))}>
            Aufgabenprüfung beenden
          </button>
        )}
        {zustand.zugphase === 'Zugabschluss' && (
          <button onClick={() => setZustand(z => beendeZug(z, { pflichtenErfuellt: true }))}>
            Zug beenden
          </button>
        )}
        {zustand.zugphase === 'Nachziehphase' && (
          <button onClick={() => setZustand(z => starteAusspielphase(z))}>
            Ausspielphase starten
          </button>
        )}
        {gesamtwertung.spielerwertungen.map(eintrag => (
          <p key={eintrag.spielerId}>Wertung {eintrag.spielerId}: {eintrag.gesamtPunkte} Punkte</p>
        ))}
        {gewinnerErgebnis && gewinnerErgebnis.gewinner.map(g => (
          <p key={g.spielerId}>Gewinner {g.spielerId}: {g.gesamtPunkte} Punkte</p>
        ))}
        <p>Quelle: engine.ermittleLegaleAktionen</p>
      </section>
    </main>
  )
}

export default App
