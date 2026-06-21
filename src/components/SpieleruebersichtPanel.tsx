/*
Author: rahn
Datum: 18.06.2026
Version: 1.0
Beschreibung: Spielerübersicht-HUD mit körperlichen Waldtanz-Spielerbänken und stabilen Entwicklungsdaten.
*/
import DebugGruppe from './DebugGruppe'
import type { SchlangenZustand, SpielerWertungsEintrag, Spielzustand } from '../engine'

interface SpieleruebersichtPanelProps {
  zustand: Spielzustand
  spielerwertungen: SpielerWertungsEintrag[]
  aktiverSpielerId: string
  titelId: string
  entwicklungsdatenOffen?: boolean
  brettFokus?: boolean
}

function schlangenZustandLabel(zustand: SchlangenZustand): string {
  if (zustand === 'aktiv') return 'spielbereit'
  if (zustand === 'blockiert') return 'gerade blockiert'
  return 'geschützt'
}

function punkteFuer(spielerId: string, wertungen: SpielerWertungsEintrag[]): number {
  return wertungen.find((wertung) => wertung.spielerId === spielerId)?.gesamtPunkte ?? 0
}

export default function SpieleruebersichtPanel({ zustand, spielerwertungen, aktiverSpielerId, titelId, entwicklungsdatenOffen = true, brettFokus = false }: SpieleruebersichtPanelProps) {
  if (brettFokus) return null
  const aktiverSpieler = zustand.spieler.find(spieler => spieler.id === aktiverSpielerId) ?? zustand.spieler[zustand.aktiverSpielerIndex]
  const schlangenGesamt = zustand.spieler.reduce((sum, s) => sum + s.schlangen.length, 0)
  const handkartenGesamt = zustand.spieler.reduce((sum, s) => sum + s.hand.length, 0)

  return (
    <section className="info-panel info-panel--spieleruebersicht waldtanz-hud waldtanz-hud--spieler spieleruebersicht-panel--brettfokus" aria-labelledby={titelId} aria-live="polite" aria-atomic="true">
      <h2 id={titelId}>Spielerübersicht</h2>
      <div className="spielerbaenke" role="group" aria-label="Waldtanz-Spielerbänke">
        <div className="spielerbaenke__kopf">
          <span className="spielerbaenke__icon" aria-hidden="true">🪑</span>
          <div>
            <strong>Tischrunde bereit</strong>
            <span>{zustand.spieler.length} Sitzplätze · {aktiverSpieler.name} ist am Zug</span>
          </div>
        </div>
        <ol className="spielerbaenke__liste" aria-label="Sitzplätze der Tischrunde">
          {zustand.spieler.map((spieler) => {
            const istAktiv = spieler.id === aktiverSpielerId
            const status = istAktiv ? 'am Zug' : spieler.steuerung === 'KI' ? 'KI wartet' : 'wartet'
            return (
              <li key={spieler.id} className={`spielerbaenke__sitz${istAktiv ? ' spielerbaenke__sitz--aktiv' : ''}`} aria-current={istAktiv ? 'true' : undefined}>
                <span className="spielerbaenke__avatar" aria-hidden="true">{spieler.steuerung === 'Mensch' ? '🧙' : '🐸'}</span>
                <strong>{spieler.name}</strong>
                <span className="spielerbaenke__status">{status}</span>
                <span>{punkteFuer(spieler.id, spielerwertungen)} Punkte</span>
                <span>{spieler.hand.length} Handkarten</span>
                <span>{spieler.schlangen.length} {spieler.schlangen.length === 1 ? 'Schlange' : 'Schlangen'}</span>
                <span>{spieler.erfuellteAufgaben.length} Aufgaben</span>
              </li>
            )
          })}
        </ol>
      </div>
      <DebugGruppe titel="Spielerstatus" standardOffen={entwicklungsdatenOffen} kompakteSchublade={!entwicklungsdatenOffen}>
        {zustand.spieler.map(spieler => {
          const istAktiv = spieler.id === aktiverSpielerId
          return (
            <p key={spieler.id} aria-current={istAktiv ? 'true' : undefined}>
              {spieler.name}: {spieler.hand.length} Handkarten, {spieler.schlangen.length} {spieler.schlangen.length === 1 ? 'Schlange' : 'Schlangen'}{istAktiv ? ' — am Zug' : ''}
            </p>
          )
        })}
        {zustand.spieler.flatMap(spieler =>
          spieler.schlangen.map((schlange, index) => (
            <p key={`zustand-${spieler.id}-${schlange.id}`}>
              Schlange {index + 1} von {spieler.name}: {schlangenZustandLabel(schlange.zustand)}.
            </p>
          ))
        )}
        {zustand.spieler.map(spieler => (
          <p key={`aufgaben-${spieler.id}`}>
            {spieler.name} — erfüllte Aufgaben: {spieler.erfuellteAufgaben.length === 0 ? 'keine' : spieler.erfuellteAufgaben.map(a => `${a.name} (${a.punkte} Punkte)`).join(', ')}
          </p>
        ))}
        <p>Schlangen insgesamt: {schlangenGesamt}</p>
        <p>Handkarten insgesamt: {handkartenGesamt}</p>
      </DebugGruppe>
    </section>
  )
}
