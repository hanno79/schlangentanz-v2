/*
Author: rahn
Datum: 18.06.2026
Version: 1.0
Beschreibung: Physischer Waldtanz-Nachziehstapel als board-nahes Waldobjekt.
*/

import type { Spielzustand } from '../engine'

interface WaldtanzNachziehstapelProps {
  zustand: Spielzustand
}

export default function WaldtanzNachziehstapel({ zustand }: WaldtanzNachziehstapelProps) {
  const anzahl = zustand.nachziehstapel.length

  return (
    <section className="waldtanz-nachziehstapel" aria-label="Waldtanz-Nachziehstapel">
      <div className="waldtanz-nachziehstapel__kopf">
        <h4>Waldtanz-Nachziehstapel</h4>
        <span className="waldtanz-nachziehstapel__zaehler">Nachziehstapel: {anzahl} Karten</span>
      </div>
      <div className="waldtanz-nachziehstapel__deckreihe">
        <div className="waldtanz-nachziehstapel__kartenruecken" role="img" aria-label="Verdeckter Nachziehstapel als Kartenrücken">
          <span className="waldtanz-nachziehstapel__badge">Ziehstapel</span>
          <strong>{anzahl}</strong>
          <span>Karten</span>
        </div>
        <p>Neue Handkarten warten als Waldkarten-Stapel.</p>
      </div>
    </section>
  )
}
