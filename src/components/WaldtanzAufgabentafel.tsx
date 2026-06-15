/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-nahe Waldtanz-Aufgabentafel für offene Questkarten und Aufgabenstapel-Status.
*/

import { ermittleErfuellteOffeneAufgaben, type AufgabenkarteInfo, type Spielzustand } from '../engine'
import type { CSSProperties } from 'react'
import { ermittleQuestFaehrte } from './questFaehrte'

interface WaldtanzAufgabentafelProps {
  zustand: Spielzustand
  istEndspurt: boolean
  onAufgabenpruefungBeenden: () => void
}

function aufgabenPunkte(aufgabe: AufgabenkarteInfo, istEndspurt: boolean): string {
  return istEndspurt ? `${aufgabe.punkte} Punkte ×2` : `${aufgabe.punkte} Punkte`
}

export default function WaldtanzAufgabentafel({ zustand, istEndspurt, onAufgabenpruefungBeenden }: WaldtanzAufgabentafelProps) {
  const erfuellteIds = new Set(ermittleErfuellteOffeneAufgaben(zustand).map(aufgabe => aufgabe.id))
  const bereiteQuests = erfuellteIds.size
  const kannQuestsEinsammeln = zustand.zugphase === 'Aufgabenpruefung' && zustand.spieler[zustand.aktiverSpielerIndex]?.steuerung === 'Mensch' && !zustand.pendingReaktion

  return (
    <section className="waldtanz-aufgabentafel" aria-label="Waldtanz-Aufgabentafel">
      <div className="waldtanz-aufgabentafel__kopf">
        <h4>Waldtanz-Aufgabentafel</h4>
        <span className="waldtanz-aufgabentafel__zaehler">
          {zustand.offeneAufgaben.length} offene {zustand.offeneAufgaben.length === 1 ? 'Aufgabe' : 'Aufgaben'}
        </span>
        {bereiteQuests > 0 && (
          <span className="waldtanz-aufgabentafel__bereit">
            {bereiteQuests} {bereiteQuests === 1 ? 'Quest' : 'Quests'} bereit
          </span>
        )}
        <span>Aufgabenstapel: {zustand.aufgabenStapel.length} Karten</span>
      </div>
      {zustand.offeneAufgaben.length === 0 ? (
        <p className="waldtanz-aufgabentafel__leer">Keine Questkarten offen. Die Lichtung wartet auf neue Aufgaben.</p>
      ) : (
        <ul className="waldtanz-aufgabentafel__liste">
          {zustand.offeneAufgaben.map((aufgabe, index) => {
            const istErfuellbar = erfuellteIds.has(aufgabe.id)
            const faehrte = ermittleQuestFaehrte(aufgabe, zustand)

            return (
              <li key={aufgabe.id} className={`waldtanz-questkarte${istErfuellbar ? ' waldtanz-questkarte--erfuellbar' : ''}`} style={{ '--quest-rotation': `${(index - 1) * 1.5}deg` } as CSSProperties}>
                <span className="waldtanz-questkarte__label">Questkarte</span>
                <strong>{aufgabe.name}</strong>
                <span className="waldtanz-questkarte__punkte">{aufgabenPunkte(aufgabe, istEndspurt)}</span>
                <span className={`waldtanz-questkarte__status${istErfuellbar ? ' waldtanz-questkarte__status--bereit' : ''}`}>
                  {istErfuellbar ? 'Bereit zum Einsammeln' : 'Noch offen'}
                </span>
                <div className="waldtanz-questkarte__faehrte" aria-label={`Quest-Fährte ${aufgabe.name}`}>
                  <span className="waldtanz-questkarte__faehrte-label">Quest-Fährte</span>
                  <strong className="waldtanz-questkarte__faehrte-hauptwert">{faehrte.hauptwert}</strong>
                  <span className="waldtanz-questkarte__faehrte-chips">
                    {faehrte.chips.map((chip) => (
                      <span className="waldtanz-questkarte__faehrte-chip" key={chip}>{chip}</span>
                    ))}
                  </span>
                </div>
                <p>{aufgabe.bedingung}</p>
                {istErfuellbar && <p className="waldtanz-questkarte__sammelhinweis">In der nächsten Aufgabenprüfung kassierst du diese Punkte.</p>}
                {istErfuellbar && kannQuestsEinsammeln && (
                  <button type="button" className="waldtanz-questkarte__sammelbutton" onClick={onAufgabenpruefungBeenden}>
                    Questkarte {aufgabe.name} einsammeln
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      <p className="waldtanz-aufgabentafel__hinweis">Baue deine Schlangen gezielt auf diese Questkarten hin.</p>
    </section>
  )
}
