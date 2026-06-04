/*
Author: rahn
Datum: 04.06.2026
Version: 1.0
Beschreibung: F14 Spielerführung – bündelt Pflichtschritt und empfohlene Aktion
              in einer verständlichen Handlungsanweisung für den aktiven Spieler.
*/

interface SpielerfuehrungProps {
  pflichtschrittLabel: string
  empfohleneAktionLabel: string
}

export default function Spielerfuehrung({ pflichtschrittLabel, empfohleneAktionLabel }: SpielerfuehrungProps) {
  const aktionsHinweis = empfohleneAktionLabel || pflichtschrittLabel.replace(/\.$/, '')

  return (
    <section aria-label="Spielerführung" className="spielerfuehrung">
      <h3>Spielerführung</h3>
      <p>Dein nächster Schritt</p>
      <p>{pflichtschrittLabel}</p>
      <p>Empfohlene Aktion</p>
      <p className="spielerfuehrung__karte">{aktionsHinweis}</p>
      <p>Klicke unten auf die empfohlene Aktion, um deinen Zug fortzusetzen.</p>
    </section>
  )
}
