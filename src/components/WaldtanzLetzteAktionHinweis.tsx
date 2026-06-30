/*
 * Author: Hermes Agent (Cron-Lauf 2026-06-29)
 * Datum: 29.06.2026
 * Version: 1.0
 * Beschreibung: M8a — Kleine Stitch-Pille am Brettrand, die das "Zuletzt
 *              ausgeführt: ..." Feedback aus dem Aktiver-Spieler-Debug
 *              auf /game sichtbar macht. Vorher war das Feedback nur
 *              auf der Lobby-Route sichtbar (im Debug-Block), was den
 *              Spieler auf /game ohne Rückmeldung liess, ob seine
 *              Sonderkarte-Aktion tatsächlich ausgeführt wurde.
 *
 * Pattern: M2v Brettrand-Zugknopf, M5a Sieger-Party, M2g Brettrand-Questpille
 * (Stitch-Hero-Affordance-Mid-Slice Familie).
 */
interface WaldtanzLetzteAktionHinweisProps {
  letzteAktion: string | null
}

export default function WaldtanzLetzteAktionHinweis({ letzteAktion }: WaldtanzLetzteAktionHinweisProps) {
  if (!letzteAktion) return null

  return (
    <aside
      className="waldtanz-letzte-aktion-hinweis"
      role="status"
      aria-live="polite"
      data-testid="waldtanz-letzte-aktion-hinweis"
    >
      <span className="waldtanz-letzte-aktion-hinweis__eyebrow">Zuletzt ausgeführt:</span>
      <p className="waldtanz-letzte-aktion-hinweis__text">{letzteAktion}</p>
    </aside>
  )
}
