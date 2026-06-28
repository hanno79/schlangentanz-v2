/**
 * M6a: Deine erste Schlange als Stitch-Waldlichtung-Onboarding.
 *
 * Empty-State fuer Spieler ohne eigene Schlangen. Zeigt:
 * - Stitch-Schlangen-Silhouette (dashed outline)
 * - Pulsierender Drop-Ring (leuchtender Kreis)
 * - "Deine erste Schlange"-Headline + aria-live Hinweis
 * - Schritt-fuer-Schritt-Pillen
 *
 * Verschwindet, sobald aktiverSpieler.schlangen.length > 0 (siehe
 * Schlangenbereich.tsx Empty-State-Branch).
 */
export default function WaldtanzErsteSchlangeOnboarding() {
  return (
    <section
      className="erste-schlange-onboarding"
      aria-label="Deine erste Schlange — Onboarding"
    >
      <h4 className="erste-schlange-onboarding__headline">Deine erste Schlange</h4>
      <svg
        className="erste-schlange-onboarding__silhouette"
        viewBox="0 0 200 100"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M 20 50 Q 50 20 80 50 T 140 50 T 200 50"
          fill="none"
          stroke="var(--st-color-border-strong, #063907)"
          strokeWidth="3"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
        <circle cx="20" cy="50" r="5" fill="var(--st-color-border-strong, #063907)" />
      </svg>
      <div className="erste-schlange-onboarding__drop-ring" aria-hidden="true" />
      <p
        className="erste-schlange-onboarding__hinweis"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Ziehe eine Handkarte in den leuchtenden Kreis, um deinen ersten Schlangenpfad zu legen.
      </p>
      <ol className="erste-schlange-onboarding__schritte" aria-label="Schritte zur ersten Schlange">
        <li className="erste-schlange-onboarding__schritt">1) Handkarte wählen</li>
        <li className="erste-schlange-onboarding__schritt">2) Auf den Kreis ziehen</li>
      </ol>
    </section>
  )
}