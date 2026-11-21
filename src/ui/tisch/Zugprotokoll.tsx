import { useId } from 'react'
import type { Verlauf } from '../spiel/useSpiel'
import { PROTOKOLL } from './protokolltexte'

/*
Das Protokoll am Tisch (Plan O6, Kriterium 1): jeder Schritt mit Karte und
Ziel, der jüngste Schritt oben und hervorgehoben. Es steht in der
Tischfläche und scrollt mit ihr; gezeigt werden die letzten Einträge, damit es
die Fläche nicht füllt. Vorgelesen wird es nicht von selbst: Den
jüngsten Schritt eines Gegners sagt schon die Zugleiste an, und zweimal
dasselbe hilft niemandem.
*/

/** So viele Einträge zeigt der Tisch; die Steuerung behält mehr. */
const SICHTBAR = 20

export function Zugprotokoll({ verlauf }: { verlauf: Verlauf }) {
  const titel = useId()
  const eintraege = verlauf.eintraege
  const juengster = eintraege.at(-1)?.schritt
  return (
    <section className="st-protokoll" aria-labelledby={titel}>
      <h2 id={titel} className="st-bereichstitel">
        {PROTOKOLL.titel}
      </h2>
      <ol className="st-protokoll-liste" role="log" aria-live="off" aria-label={PROTOKOLL.titel}>
        {eintraege.length === 0 ? (
          <li className="st-leer">{PROTOKOLL.leer}</li>
        ) : (
          eintraege
            .map((eintrag, stelle) => ({ ...eintrag, stelle }))
            .slice(-SICHTBAR)
            // Der jüngste Schritt oben; innerhalb eines Schritts in der Reihenfolge des Geschehens (sort ist stabil).
            .sort((a, b) => b.schritt - a.schritt)
            .map((eintrag) => (
              <li key={eintrag.stelle} className={eintrag.schritt === juengster ? 'st-protokoll-eintrag st-protokoll-eintrag--neu' : 'st-protokoll-eintrag'}>
                {eintrag.text}
              </li>
            ))
        )}
      </ol>
    </section>
  )
}
