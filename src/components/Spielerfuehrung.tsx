/*
Author: rahn
Datum: 05.06.2026
Version: 1.2
Beschreibung: F25 Spielerführung – stellt die Mini-Checkliste als geordnete
              Schrittfolge für den aktiven Spieler dar.
*/

import { useId } from 'react'
import { EMPFOHLENE_AKTION_ID } from './AktionenPanel'

interface SpielerfuehrungProps {
  pflichtschrittLabel: string
  empfohleneAktionLabel: string
  aktionszielId?: string
  aktionszielSatzText?: string
  aktionszielLinkText?: string
  onAktionszielHervorheben?: (zielId: string) => void
}

export default function Spielerfuehrung({
  pflichtschrittLabel,
  empfohleneAktionLabel,
  aktionszielId = EMPFOHLENE_AKTION_ID,
  aktionszielSatzText = 'empfohlene Aktion',
  aktionszielLinkText = 'empfohlenen Aktion',
  onAktionszielHervorheben,
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
      <ol aria-labelledby={checklisteUeberschriftId} className="spielerfuehrung__checkliste">
        <li className="spielerfuehrung__checkschritt">Pflichtschritt prüfen: {pflichtschrittLabel}</li>
        <li className="spielerfuehrung__checkschritt">Empfohlene Aktion wählen: {aktionsHinweis}</li>
        <li className="spielerfuehrung__checkschritt">Unten im Aktionenbereich ausführen</li>
      </ol>
      <p>Klicke unten auf die {aktionszielSatzText}, um deinen Zug fortzusetzen.</p>
      <a href={`#${aktionszielId}`} className="spielerfuehrung__aktionslink" onClick={() => onAktionszielHervorheben?.(aktionszielId)}>Zur {aktionszielLinkText} im Aktionsbereich</a>
    </section>
  )
}
