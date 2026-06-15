/*
Author: rahn
Datum: 15.06.2026
Version: 1.0
Beschreibung: Wertungsbereich mit Stitch-Rangtafel, klassischer Punktetafel und Entwicklungsdaten.
*/

import { useId } from 'react'
import type { GewinnerErgebnis, SpielerWertungsEintrag, SpielGesamtwertungErgebnis, Spielzustand } from '../engine'
import DebugGruppe from './DebugGruppe'

interface WertungPanelProps {
  zustand: Spielzustand
  spielerwertungen: SpielerWertungsEintrag[]
  gesamtwertung: SpielGesamtwertungErgebnis
  gewinnerErgebnis: GewinnerErgebnis | null
  istSpielende: boolean
  ergebnisText: string
  spielerNameFuerId: (spielerId: string) => string
}

function rangStatus(index: number, istAktiv: boolean): string {
  if (index === 0 && istAktiv) return 'führt · am Zug'
  if (index === 0) return 'führt'
  if (istAktiv) return 'am Zug'
  return 'wartet'
}

export default function WertungPanel({
  zustand,
  spielerwertungen,
  gesamtwertung,
  gewinnerErgebnis,
  istSpielende,
  ergebnisText,
  spielerNameFuerId,
}: WertungPanelProps) {
  const wertungTitelId = useId()
  const rangtafelTitelId = useId()
  const punktetafelTitelId = useId()
  const aktiverSpielerId = zustand.spieler[zustand.aktiverSpielerIndex].id
  const rangliste = spielerwertungen
    .map((eintrag, originalIndex) => ({
      eintrag,
      originalIndex,
      spieler: zustand.spieler.find((spieler) => spieler.id === eintrag.spielerId),
    }))
    .sort((a, b) => b.eintrag.gesamtPunkte - a.eintrag.gesamtPunkte || a.originalIndex - b.originalIndex)

  return (
    <section className="info-panel info-panel--wertung waldtanz-hud waldtanz-hud--wertung" aria-labelledby={wertungTitelId} aria-live="polite" aria-atomic="true">
      <h2 id={wertungTitelId}>Wertung</h2>
      {istSpielende && (
        <>
          <p>Spielende erreicht.</p>
          <p>Ergebnis: {ergebnisText}</p>
        </>
      )}
      <section className="waldtanz-rangtafel" aria-labelledby={rangtafelTitelId}>
        <h3 id={rangtafelTitelId}>Waldtanz-Rangtafel</h3>
        <ol className="waldtanz-rangtafel__liste">
          {rangliste.map(({ eintrag, spieler }, index) => {
            const istAktiv = eintrag.spielerId === aktiverSpielerId
            const status = rangStatus(index, istAktiv)
            return (
              <li
                key={eintrag.spielerId}
                className={`waldtanz-rangtafel__karte${index === 0 ? ' waldtanz-rangtafel__karte--fuehrung' : ''}${istAktiv ? ' waldtanz-rangtafel__karte--aktiv' : ''}`}
                aria-current={istAktiv ? 'true' : undefined}
              >
                <span className="waldtanz-rangtafel__rang">#{index + 1}</span>
                <strong>{spieler?.name ?? eintrag.name}</strong>
                <span className="waldtanz-rangtafel__punkte">{eintrag.gesamtPunkte} Punkte</span>
                <span className="waldtanz-rangtafel__status">{status}</span>
                <span>Handkarten {spieler?.hand.length ?? 0}</span>
                <span>Schlangen {spieler?.schlangen.length ?? 0}</span>
                <span>Farbgruppen {eintrag.wertung.farbgruppenPunkte.gesamtPunkte}</span>
                <span>Quests {eintrag.wertung.aufgabenPunkte.gesamtPunkte}</span>
              </li>
            )
          })}
        </ol>
      </section>
      <section className="scoreboard-bereich" aria-labelledby={punktetafelTitelId} aria-live="polite" aria-atomic="true">
        <h3 id={punktetafelTitelId}>Punktetafel</h3>
        <ul className="scoreboard-liste">
          {spielerwertungen.map(eintrag => {
            const spieler = zustand.spieler.find(s => s.id === eintrag.spielerId)

            return (
              <li key={eintrag.spielerId} className="scoreboard-karte">
                <strong>{spieler?.name ?? eintrag.spielerId}</strong>
                <span>Gesamt: {eintrag.gesamtPunkte} Punkte</span>
                <span>Farbgruppen: {eintrag.wertung.farbgruppenPunkte.gesamtPunkte} Punkte</span>
                <span>Aufgaben: {eintrag.wertung.aufgabenPunkte.gesamtPunkte} Punkte</span>
              </li>
            )
          })}
        </ul>
      </section>
      <DebugGruppe titel="Punkteübersicht">
        {gesamtwertung.spielerwertungen.map(eintrag => (
          <div key={eintrag.spielerId}>
            <p>Punktestand von {spielerNameFuerId(eintrag.spielerId)}: {eintrag.gesamtPunkte} Punkte</p>
            <p>
              Punktequellen von {spielerNameFuerId(eintrag.spielerId)}: Farbgruppen {eintrag.wertung.farbgruppenPunkte.gesamtPunkte} Punkte, Aufgaben {eintrag.wertung.aufgabenPunkte.gesamtPunkte} Punkte
            </p>
          </div>
        ))}
      </DebugGruppe>
      {gewinnerErgebnis && gewinnerErgebnis.gewinner.map(g => (
        <p key={g.spielerId}>Gewinner {spielerNameFuerId(g.spielerId)}: {g.gesamtPunkte} Punkte</p>
      ))}
    </section>
  )
}
