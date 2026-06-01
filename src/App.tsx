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
import type { AufgabenkarteInfo, SpielAktion, Spielzustand } from './engine'

const defaultZustand = starteAusspielphase(erstelleSpielzustand(2, () => 0.999999))

function kartenIds(karten: { id: string }[]): string {
  return karten.map(k => k.id).join(', ')
}

function aufgabeLabel(a: AufgabenkarteInfo): string {
  return `${a.name} (${a.punkte} Punkte): ${a.bedingung}`
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
        <section aria-label="Spielstatus">
          <h2>Spielstatus</h2>
          <p>Engine-Demo: Ausspielphase</p>
          <p>Zugphase: {zustand.zugphase}</p>
          <p>Spielphase: {zustand.spielphase}</p>
          {zustand.endrunde.ausloeserSpielerIndex !== null && (
            <p>Endrunde ausgelöst durch: {zustand.spieler[zustand.endrunde.ausloeserSpielerIndex].id}</p>
          )}
          {zustand.spielphase !== 'Normal' && (
            <p>
              Verbleibende Endrunde:{' '}
              {zustand.endrunde.verbleibendeSpielerIndizes.length > 0
                ? zustand.endrunde.verbleibendeSpielerIndizes.map(i => zustand.spieler[i].id).join(', ')
                : 'keine'}
            </p>
          )}
          <p>Spieler am Zug: {zustand.aktiverSpielerIndex + 1}/{zustand.spieler.length}</p>
        </section>
        <section aria-label="Aktiver Spieler">
          <h2>Aktiver Spieler</h2>
          <p>Aktiver Spieler: {aktiverSpieler.id}</p>
          <p>Aktiver Spieler-Details: {aktiverSpieler.id} — {aktiverSpieler.name} ({aktiverSpieler.steuerung})</p>
          <p>
            {aktiverSpieler.geheimeAufgabe
              ? `Geheime Aufgabe: ${aufgabeLabel(aktiverSpieler.geheimeAufgabe)}`
              : 'Geheime Aufgabe: keine'}
          </p>
          {aktiverSpieler.schlangen.map(schlange => (
            <p key={schlange.id}>
              Schlange {schlange.id}: {kartenIds(schlange.karten)}
            </p>
          ))}
          <p>
            Handkarten:{' '}
            {aktiverSpieler.hand.length > 0 ? kartenIds(aktiverSpieler.hand) : 'keine'}
          </p>
          <p>
            Handkarten-Details:{' '}
            {aktiverSpieler.hand.length === 0
              ? 'keine'
              : aktiverSpieler.hand
                  .map(k =>
                    k.typ === 'Farbkarte'
                      ? `${k.id} (Farbkarte ${k.farbe}, ${k.punkte} Punkte)`
                      : `${k.id} (Sonderkarte ${k.name})`
                  )
                  .join(', ')}
          </p>
        </section>
        <section aria-label="Spielerübersicht">
          <h2>Spielerübersicht</h2>
          {zustand.spieler.map(spieler => (
            <p key={spieler.id}>
              Spielerübersicht {spieler.id}: {spieler.name} ({spieler.steuerung}) — {spieler.hand.length} Handkarten, {spieler.schlangen.length} Schlangen
            </p>
          ))}
          {zustand.spieler.map(spieler => (
            <p key={`schlangen-${spieler.id}`}>
              Schlangenübersicht {spieler.id}:{' '}
              {spieler.schlangen.length === 0
                ? 'keine'
                : spieler.schlangen.map(s => `${s.id} (${kartenIds(s.karten)})`).join('; ')}
            </p>
          ))}
          {zustand.spieler.flatMap(spieler =>
            spieler.schlangen.map(schlange => (
              <p key={`zustand-${spieler.id}-${schlange.id}`}>
                Schlangenzustand {spieler.id}/{schlange.id}: {schlange.zustand}
              </p>
            ))
          )}
          {zustand.spieler.map(spieler => (
            <p key={`aufgaben-${spieler.id}`}>
              Erfüllte Aufgaben {spieler.id}:{' '}
              {spieler.erfuellteAufgaben.length === 0
                ? 'keine'
                : spieler.erfuellteAufgaben.map(a => `${a.name} (${a.punkte} Punkte)`).join(', ')}
            </p>
          ))}
          <p>Schlangen gesamt: {zustand.spieler.reduce((sum, s) => sum + s.schlangen.length, 0)}</p>
          <p>Handkarten gesamt: {zustand.spieler.reduce((sum, s) => sum + s.hand.length, 0)}</p>
        </section>
        <section aria-label="Material und Aufgaben">
          <h2>Material und Aufgaben</h2>
          <p>Ablagestapelgröße: {zustand.ablagestapel.length} Karten</p>
          <p>Ablagestapel: {zustand.ablagestapel.length > 0 ? kartenIds(zustand.ablagestapel) : 'keine'}</p>
          <p>Nachziehstapel: {zustand.nachziehstapel.length} Karten</p>
          <p>Aufgabenstapel: {zustand.aufgabenStapel.length} Karten</p>
          <p>
            Offene Aufgaben:{' '}
            {zustand.offeneAufgaben.length > 0
              ? zustand.offeneAufgaben.map(a => `${a.name} (${a.punkte} Punkte)`).join(', ')
              : 'keine'}
          </p>
          <p>
            Offene Aufgaben-Details:{' '}
            {zustand.offeneAufgaben.length > 0
              ? zustand.offeneAufgaben.map(aufgabeLabel).join('; ')
              : 'keine'}
          </p>
        </section>
        <section aria-label="Wertung">
          <h2>Wertung</h2>
          {gesamtwertung.spielerwertungen.map(eintrag => (
            <p key={eintrag.spielerId}>Wertung {eintrag.spielerId}: {eintrag.gesamtPunkte} Punkte</p>
          ))}
          {gewinnerErgebnis && gewinnerErgebnis.gewinner.map(g => (
            <p key={g.spielerId}>Gewinner {g.spielerId}: {g.gesamtPunkte} Punkte</p>
          ))}
        </section>
        <section aria-label="Aktionen">
          <h2>Aktionen</h2>
          <p>Legale Aktionen: {legaleAktionen.length}</p>
          {legaleAktionen.map((aktion) => (
            <button key={aktionsLabel(aktion)} onClick={() => fuhreAktionAus(aktion)}>
              {aktionsLabel(aktion)}
            </button>
          ))}
          <p>Gespielte Karten: {zustand.zugpflichten.gespielteKarten}/{MAX_KARTEN_PRO_ZUG}</p>
          <p>Gespielte Kartenarten: {zustand.zugpflichten.gespielteFarbkarten} Farbkarten, {zustand.zugpflichten.gespielteSonderkarten} Sonderkarten</p>
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
          <p>Quelle: engine.ermittleLegaleAktionen</p>
        </section>
      </section>
    </main>
  )
}

export default App
