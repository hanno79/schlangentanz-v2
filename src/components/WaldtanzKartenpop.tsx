/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-nahes Pop-/Sternenfeedback für erfolgreiche Waldtanz-Kartenaktionen.
*/

interface WaldtanzKartenpopProps {
  aktionLabel: string | null
}

function kartenIdAusAktion(label: string): string | null {
  return label.match(/Karte ([^\s]+)/)?.[1] ?? null
}

export default function WaldtanzKartenpop({ aktionLabel }: WaldtanzKartenpopProps) {
  const kartenId = aktionLabel ? kartenIdAusAktion(aktionLabel) : null
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
