/*
Author: rahn
Datum: 18.06.2026
Version: 1.0
Beschreibung: Körperliche Waldtanz-Zugtafel fuer den aktiven Spieler vor den Entwicklungsdaten.
*/

import type { Spielzustand } from '../engine'

interface AktiverSpielerZugtafelProps {
  spieler: Spielzustand['spieler'][number]
  punkte: number
  pflichtschrittLabel: string
  zugfuehrungLabel: string
  letzteAktion: string | null
  geheimeAufgabeText: string
}

export default function AktiverSpielerZugtafel({
  spieler,
  punkte,
  pflichtschrittLabel,
  zugfuehrungLabel,
  letzteAktion,
  geheimeAufgabeText,
}: AktiverSpielerZugtafelProps) {
  return (
    <section className="waldtanz-zugtafel" aria-label="Waldtanz-Zugtafel">
      <div className="waldtanz-zugtafel__kopf">
        <span className="waldtanz-zugtafel__avatar" aria-hidden="true">{spieler.steuerung === 'Mensch' ? '🧙' : '🐸'}</span>
        <div>
          <h3>Waldtanz-Zugtafel</h3>
          <strong>{spieler.name}</strong>
          <span>{zugfuehrungLabel}</span>
        </div>
      </div>
      <div className="waldtanz-zugtafel__pflicht">
        <span>Nächster Schritt</span>
        <strong>{pflichtschrittLabel}</strong>
      </div>
      <div className="waldtanz-zugtafel__chips" aria-label="Aktive Zugwerte">
        <span>{punkte} Punkte</span>
        <span>{spieler.hand.length} Handkarten</span>
        <span>{spieler.schlangen.length} {spieler.schlangen.length === 1 ? 'Schlange' : 'Schlangen'}</span>
      </div>
      <p className="waldtanz-zugtafel__aktion">
        {letzteAktion ? <>Letzte Aktion: <strong>{letzteAktion}</strong></> : 'Noch keine Aktion ausgeführt.'}
      </p>
      <p className="waldtanz-zugtafel__quest">Persönliche Quest: {geheimeAufgabeText}</p>
    </section>
  )
}
