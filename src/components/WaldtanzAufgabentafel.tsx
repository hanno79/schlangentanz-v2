/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-nahe Waldtanz-Aufgabentafel für offene Questkarten und Aufgabenstapel-Status.
*/

import type { AufgabenkarteInfo, Spielzustand } from '../engine'
import type { CSSProperties } from 'react'

interface WaldtanzAufgabentafelProps {
  zustand: Spielzustand
  istEndspurt: boolean
}

function aufgabenPunkte(aufgabe: AufgabenkarteInfo, istEndspurt: boolean): string {
  return istEndspurt ? `${aufgabe.punkte} Punkte ×2` : `${aufgabe.punkte} Punkte`
}

export default function WaldtanzAufgabentafel({ zustand, istEndspurt }: WaldtanzAufgabentafelProps) {
  return (
    <section className="waldtanz-aufgabentafel" aria-label="Waldtanz-Aufgabentafel">
      <div className="waldtanz-aufgabentafel__kopf">
        <h4>Waldtanz-Aufgabentafel</h4>
        <span className="waldtanz-aufgabentafel__zaehler">
          {zustand.offeneAufgaben.length} offene {zustand.offeneAufgaben.length === 1 ? 'Aufgabe' : 'Aufgaben'}
        </span>
        <span>Aufgabenstapel: {zustand.aufgabenStapel.length} Karten</span>
      </div>
      {zustand.offeneAufgaben.length === 0 ? (
        <p className="waldtanz-aufgabentafel__leer">Keine Questkarten offen. Die Lichtung wartet auf neue Aufgaben.</p>
      ) : (
        <ul className="waldtanz-aufgabentafel__liste">
          {zustand.offeneAufgaben.map((aufgabe, index) => (
            <li key={aufgabe.id} className="waldtanz-questkarte" style={{ '--quest-rotation': `${(index - 1) * 1.5}deg` } as CSSProperties}>
              <span className="waldtanz-questkarte__label">Questkarte</span>
              <strong>{aufgabe.name}</strong>
              <span className="waldtanz-questkarte__punkte">{aufgabenPunkte(aufgabe, istEndspurt)}</span>
              <p>{aufgabe.bedingung}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="waldtanz-aufgabentafel__hinweis">Baue deine Schlangen gezielt auf diese Questkarten hin.</p>
    </section>
  )
}
