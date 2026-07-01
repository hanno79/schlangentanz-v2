/**
 * M3e: Waldtanz-Spielmat-Boden als sichtbare "Hier spielen"-Affordance
 * im Brettrund-Zentrum.
 *
 * Vertrag: Rendert eine zentrale gestrichelte Hexagon-Silhouette als
 * Drop-Zone-Indikator fuer den Spieler. Signalisiert visuell, dass
 * das Brettrund-Zentrum die Spielflaeche ist.
 *
 * Aussehen (Stitch-Spielmat-Box):
 * - 3px forest-green border + dashed style
 * - Lime/forest-gradient background (passt zum Arenastein)
 * - Border-radius (Hexagon-Optik)
 * - Dezente Pulsing-Animation
 *
 * Sichtbarkeit: persistent auf /game im Brettrund-Zentrum, zwischen
 * Schlangenlichtung-Kopf und Magiekreise. Zeigt immer das
 * "Hier spielen"-Hexagon; der Hinweistext passt sich an ob der Spieler
 * schon eine Schlange hat oder nicht (Empty-State-Text vs.
 * Permanent-Spielmat-Text).
 *
 * Pitfall #22: Komponente ist im Initial-State sichtbar, kein State-Setup noetig.
 *
 * Codex-Review-Blocker #1 (2026-07-01): Komponente war als
 * Empty-State (return null sobald Schlange existiert) implementiert,
 * das widerspricht der Slice-Spec "persistent sichtbare Spielmat-Box".
 * Fix: return null entfernt, Hinweistext wird konditional variiert.
 */

import type { ReactNode } from 'react'

interface WaldtanzSpielmatBodenProps {
  /** Anzahl eigener Schlangen — beeinflusst nur den Hinweistext (nicht die Sichtbarkeit). */
  anzahlEigenerSchlangen: number
}

export default function WaldtanzSpielmatBoden({
  anzahlEigenerSchlangen,
}: WaldtanzSpielmatBodenProps): ReactNode {
  const hinweis =
    anzahlEigenerSchlangen === 0
      ? 'Hier deine erste Schlange ablegen — zieh eine Handkarte in den leuchtenden Kreis.'
      : 'Spielmat-Boden des Brettrund — hier wachsen deine Schlangen und Brettschritte.'

  return (
    <section
      className="waldtanz-spielmat-boden"
      aria-label="Waldtanz-Spielmat"
      data-waldtanz-spielmat={anzahlEigenerSchlangen === 0 ? 'leer' : 'belegt'}
    >
      <div className="waldtanz-spielmat-boden__inner">
        <svg
          className="waldtanz-spielmat-boden__hexagon"
          viewBox="0 0 200 100"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M 50 10 L 90 10 L 110 30 L 110 70 L 90 90 L 50 90 L 30 70 L 30 30 Z"
            fill="none"
            stroke="var(--st-color-border-strong, #063907)"
            strokeWidth="3"
            strokeDasharray="8 5"
            strokeLinejoin="round"
          />
          <circle cx="70" cy="50" r="6" fill="var(--st-color-border-strong, #063907)" />
        </svg>
        <p className="waldtanz-spielmat-boden__hinweis">{hinweis}</p>
      </div>
    </section>
  )
}
