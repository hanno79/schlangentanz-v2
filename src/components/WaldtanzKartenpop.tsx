/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-nahes Pop-/Sternenfeedback für erfolgreiche Waldtanz-Kartenaktionen.
*/

import { findeKartennameImText } from '../kartenTexte'

interface WaldtanzKartenpopProps {
  aktionLabel: string | null
}

export default function WaldtanzKartenpop({ aktionLabel }: WaldtanzKartenpopProps) {
  // ÄNDERUNG [30.07.2026]: AP-3 — vorher wurde die Karten-Id per Regex aus dem
  // Labeltext gefischt (`/Karte ([^\s]+)/`). Seit der Umstellung auf Klartext gibt
  // es dort keine Ids mehr; die Komponente rendere dadurch still gar nicht.
  const kartenId = aktionLabel ? findeKartennameImText(aktionLabel) : null
  if (!aktionLabel || !kartenId) return null

  return (
    <section className="waldtanz-kartenpop" role="status" aria-label="Waldtanz-Kartenpop" aria-live="polite" aria-atomic="true">
      <div className="waldtanz-kartenpop__sterne" aria-hidden="true">
        <span className="waldtanz-kartenpop__stern">✦</span>
        <span className="waldtanz-kartenpop__stern">✦</span>
        <span className="waldtanz-kartenpop__stern">✦</span>
      </div>
      <strong>Pop!</strong>
      <span>Karte geschnappt</span>
      <span className="waldtanz-kartenpop__karte">{kartenId}</span>
      <p>{aktionLabel}</p>
    </section>
  )
}
