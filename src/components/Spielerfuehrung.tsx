/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F14 Spielerführung – bündelt Pflichtschritt und empfohlene Aktion
              in einer verständlichen Handlungsanweisung für den aktiven Spieler.
*/

import { useId } from 'react'
import { EMPFOHLENE_AKTION_ID } from './AktionenPanel'

interface SpielerfuehrungProps {
  pflichtschrittLabel: string
  empfohleneAktionLabel: string
  aktionszielId?: string
  aktionszielSatzText?: string
  aktionszielLinkText?: string
}

export default function Spielerfuehrung({
  pflichtschrittLabel,
  empfohleneAktionLabel,
  aktionszielId = EMPFOHLENE_AKTION_ID,
  aktionszielSatzText = 'empfohlene Aktion',
  aktionszielLinkText = 'empfohlenen Aktion',
}: SpielerfuehrungProps) {
  const aktionsHinweis = empfohleneAktionLabel || pflichtschrittLabel.replace(/\.$/, '')
  const checklisteUeberschriftId = useId()

  return (
    <section aria-label="Spielerführung" className="spielerfuehrung">
      <h3>Spielerführung</h3>
      <p>Dein nächster Schritt</p>
      <p>{pflichtschrittLabel}</p>
      <p>Empfohlene Aktion</p>
      <p className="spielerfuehrung__karte">{aktionsHinweis}</p>
      <p id={checklisteUeberschriftId}>Mini-Checkliste für deinen Zug</p>
      <ul aria-labelledby={checklisteUeberschriftId} className="spielerfuehrung__checkliste">
        <li className="spielerfuehrung__checkschritt">Pflichtschritt prüfen: {pflichtschrittLabel}</li>
        <li className="spielerfuehrung__checkschritt">Empfohlene Aktion wählen: {aktionsHinweis}</li>
        <li className="spielerfuehrung__checkschritt">Unten im Aktionenbereich ausführen</li>
      </ul>
      <p>Klicke unten auf die {aktionszielSatzText}, um deinen Zug fortzusetzen.</p>
      <a href={`#${aktionszielId}`} className="spielerfuehrung__aktionslink">Zur {aktionszielLinkText} im Aktionsbereich</a>
    </section>
  )
}
