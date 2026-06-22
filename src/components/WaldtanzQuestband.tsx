/*
Author: rahn
Datum: 21.06.2026
Version: 1.0
Beschreibung: M1cv verbindet das Waldtanz-Questband direkt mit dem Leuchtenden
              Waldstein: offene Questkarten erscheinen als bunte Pillen-Reihe
              unter dem Waldstein-Kopf. Eigene Komponente, damit der Arenenstein
              sichtbar näher am Spieler ist und die offenen Questziele nicht in
              der rechten Waldtasche verschwinden.
*/

import { useId } from 'react'
import { ermittleErfuellteOffeneAufgaben, type AufgabenkarteInfo, type Spielzustand } from '../engine'
import { ermittleQuestFaehrte } from './questFaehrte'

interface WaldtanzQuestbandProps {
  zustand: Spielzustand
  istEndspurt: boolean
}

function aufgabenPunkte(aufgabe: AufgabenkarteInfo, istEndspurt: boolean): string {
  return istEndspurt ? `${aufgabe.punkte} Punkte ×2` : `${aufgabe.punkte} Punkte`
}

export default function WaldtanzQuestband({ zustand, istEndspurt }: WaldtanzQuestbandProps) {
  const questbandTitelId = useId()
  const erfuellteIds = new Set(ermittleErfuellteOffeneAufgaben(zustand).map((aufgabe) => aufgabe.id))
  const offeneAufgaben = zustand.offeneAufgaben

  return (
    <section className="waldtanz-questband" aria-labelledby={questbandTitelId}>
      <header className="waldtanz-questband__kopf">
        <h4 id={questbandTitelId}>Waldtanz-Questband</h4>
        <span className="waldtanz-questband__zaehler">
          {offeneAufgaben.length} {offeneAufgaben.length === 1 ? 'offene Quest' : 'offene Quests'}
        </span>
        {erfuellteIds.size > 0 && (
          <span className="waldtanz-questband__bereit">
            {erfuellteIds.size} {erfuellteIds.size === 1 ? 'Quest' : 'Quests'} bereit zum Einsammeln
          </span>
        )}
      </header>
      {offeneAufgaben.length === 0 ? (
        <p className="waldtanz-questband__leer">
          Keine offenen Quests auf dem Brett — die Aufgabenprüfung zieht neue Karten nach.
        </p>
      ) : (
        <ul className="waldtanz-questband__liste">
          {offeneAufgaben.map((aufgabe) => {
            const istErfuellbar = erfuellteIds.has(aufgabe.id)
            const faehrte = ermittleQuestFaehrte(aufgabe, zustand)
            const statusLabel = istErfuellbar ? 'Bereit' : 'Noch offen'
            const statusKlasse = istErfuellbar
              ? 'waldtanz-questband-pille--bereit'
              : 'waldtanz-questband-pille--offen'

            return (
              <li
                key={aufgabe.id}
                className={`waldtanz-questband-pille ${statusKlasse}`}
                aria-label={`Quest ${aufgabe.name} ${statusLabel}`}
              >
                <span className="waldtanz-questband-pille__label">Quest</span>
                <strong className="waldtanz-questband-pille__name">{aufgabe.name}</strong>
                <span className="waldtanz-questband-pille__punkte">{aufgabenPunkte(aufgabe, istEndspurt)}</span>
                <span className={`waldtanz-questband-pille__status${istErfuellbar ? ' waldtanz-questband-pille__status--bereit' : ''}`}>
                  {statusLabel}
                </span>
                <span className="waldtanz-questband-pille__hauptwert" aria-hidden="true">{faehrte.hauptwert}</span>
                <span className="waldtanz-questband-pille__chips" aria-label={`Fortschritt ${aufgabe.name}`}>
                  {faehrte.chips.map((chip) => (
                    <span className="waldtanz-questband-pille__chip" key={chip}>{chip}</span>
                  ))}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}