/*
 * Author: rahn
 * Datum: 27.06.2026
 * Version: 1.0
 * Beschreibung: M2g — Sichtbare Brettrand-Questpille als Stitch-Hero fuer die
 *              persoenliche Quest des aktiven Spielers. Die Quest wird
 *              von einer <p>-Zeile in der AktiverSpielerZugtafel-Sidebar
 *              zu einer prominenten Lime-Pille am Brettrand promoted.
 *              Single-Source-of-Truth: Auf /game rendert die Pille den
 *              geheimeAufgabeText, auf / (Lobby) bleibt die Sidebar-Zeile
 *              sichtbar (kein Route-Leak).
 */

interface WaldtanzBrettrandQuestpilleProps {
  geheimeAufgabeText: string
}

export default function WaldtanzBrettrandQuestpille({
  geheimeAufgabeText,
}: WaldtanzBrettrandQuestpilleProps) {
  return (
    <aside
      className="waldtanz-brettrand-questpille"
      role="group"
      aria-label="Aktive Quest"
      aria-live="polite"
    >
      <span className="waldtanz-brettrand-questpille__icon" aria-hidden="true">
        🌿
      </span>
      <span className="waldtanz-brettrand-questpille__text">
        Quest: {geheimeAufgabeText}
      </span>
      <span className="waldtanz-brettrand-questpille__status" aria-hidden="true">
        aktiv
      </span>
    </aside>
  )
}
