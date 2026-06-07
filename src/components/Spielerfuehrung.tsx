/*
Author: rahn
Datum: 05.06.2026
Version: 1.7
Beschreibung: F26 Spielerführung – verwendet für die Mini-Checkliste eine
              semantische Überschrift und blendet die Klickführung bei fehlendem
              Springziel explizit aus.
Änderung v1.5: R113 – statischen Aktionsziel-Fallback durch DOM-sichere React-ID ersetzt.
Änderung v1.6: R113 Review – ohne echte Ziel-ID keinen Link auf ein nicht vorhandenes DOM-Ziel rendern.
Änderung v1.7: R116 – Haupt-Section per aria-labelledby über sichtbare h3 labeln (eindeutige React-ID).
*/

import { useId } from 'react'

interface SpielerfuehrungProps {
  pflichtschrittLabel: string
  empfohleneAktionLabel: string
  aktionszielId?: string
  aktionszielSatzText?: string
  aktionszielLinkText?: string
  onAktionszielHervorheben?: (zielId: string) => void
  zeigtAktionslink?: boolean
}

export default function Spielerfuehrung({
  pflichtschrittLabel,
  empfohleneAktionLabel,
  aktionszielId,
  aktionszielSatzText = 'empfohlene Aktion',
  aktionszielLinkText = 'empfohlenen Aktion',
  onAktionszielHervorheben,
  zeigtAktionslink = true,
}: SpielerfuehrungProps) {
  const aktionsHinweis = empfohleneAktionLabel || pflichtschrittLabel.replace(/\.$/, '')
  const aktionszielLinkId = aktionszielId?.trim() ? aktionszielId : null
  const zeigtAktionslinkEffektiv = zeigtAktionslink && aktionszielLinkId !== null
  const spielerfuehrungUeberschriftId = useId()
  const checklisteUeberschriftId = useId()

  return (
    <section aria-labelledby={spielerfuehrungUeberschriftId} className="spielerfuehrung">
      <h3 id={spielerfuehrungUeberschriftId}>Spielerführung</h3>
      <p>Dein nächster Schritt</p>
      <p>{pflichtschrittLabel}</p>
      <p>Empfohlene Aktion</p>
      <p className="spielerfuehrung__karte">{aktionsHinweis}</p>
      <h4 id={checklisteUeberschriftId}>Mini-Checkliste für deinen Zug</h4>
      <ol aria-labelledby={checklisteUeberschriftId} className="spielerfuehrung__checkliste">
        <li className="spielerfuehrung__checkschritt">Pflichtschritt prüfen: {pflichtschrittLabel}</li>
        <li className="spielerfuehrung__checkschritt">Empfohlene Aktion wählen: {aktionsHinweis}</li>
        <li className="spielerfuehrung__checkschritt">Unten im Aktionenbereich ausführen</li>
      </ol>
      {zeigtAktionslinkEffektiv ? (
        <>
          <p>Klicke unten auf die {aktionszielSatzText}, um deinen Zug fortzusetzen.</p>
          <a href={`#${aktionszielLinkId}`} className="spielerfuehrung__aktionslink" onClick={() => onAktionszielHervorheben?.(aktionszielLinkId)}>Zur {aktionszielLinkText} im Aktionsbereich</a>
        </>
      ) : (
        <p>Im Aktionsbereich gibt es aktuell kein Springziel.</p>
      )}
    </section>
  )
}
