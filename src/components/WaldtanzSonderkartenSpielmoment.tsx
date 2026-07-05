/*
Author: rahn
Datum: 26.06.2026
Version: 1.1
Beschreibung: M1dq — sichtbarer Stitch-Spielmoment-Bubble in der Handbuehne fuer
              ausgewaehlte Sonderkarten. Wird NUR sichtbar, wenn
              (a) eine Sonderkarte ausgewaehlt ist UND
              (b) mindestens eine legale Sonderkarten-Aktion fuer diese Karte existiert.
              Zeigt Sonderkarte-Name + Ziel-Art-Beschreibung + Link auf das erste
              legale Ziel. Damit hat der Spieler einen klaren "Hier entlang"-Moment
              direkt in der Handbuehne, ohne die Spielhilfe im Seitenmenue lesen
              zu muessen.
              Die zielspurKey-Logik spiegelt exakt die Schluessel aus
              Schlangenbereich.tsx: Schlangenfrass nutzt
              `frass:${aktiverSpielerId}:${schlange.id}:${karte.id}`,
              Farbenschutz `schutz:${schlange.id}`,
              Farbenfusion `fusion:${schlange.id}:${karte.id}`.
              So kann der Spieler-Link das Brett-Element ueber die gleiche
              data-zielspur-key-Achse anspringen, die Schlangenbereich
              bereits fuer scrollIntoView nutzt.
# AENDERUNG 26.06.2026: M1dq v1.1 — korrekte zielspurKey-Ableitung aus
              SpielAktion + verdeckter Anker-Span fuer DOM-IDREF-Konsistenz.
*/
import { useId } from 'react'
import type { SpielAktion, Spielkarte } from '../engine'
import { blockadeKey, diebKey, frassKey, fusionKey, schutzKey } from './zielspurKey'

interface WaldtanzSonderkartenSpielmomentProps {
  ausgewaehlteHandkarte: Spielkarte
  legaleAktionen: SpielAktion[]
  aktiverSpielerId: string
  onZielspurAktivieren?: (zielspurKey: string) => void
}

function zielartLabel(aktion: SpielAktion): string {
  switch (aktion.typ) {
    case 'NeueSchlangeStarten': return 'Startkreis'
    case 'KarteAnlegen': return 'Schlangenende'
    case 'FarbenschutzSpielen': return 'Schutzring'
    case 'FarbenfusionSpielen': return 'Fusionspaar'
    case 'SchlangenhaeutungSpielen': return 'Häutungspfad'
    case 'SchlangenfrassSpielen': return 'Schlangenfrass-Ziel'
    case 'SchlangenblockadeSpielen': return 'Blockadeziel'
    case 'FarbendiebSpielen': return 'Beutekarte'
    case 'SonderkarteSpielen': return 'Spielerziel'
    case 'VerdopplerSpielen': return 'Bonuszauber'
    default: return 'Brett-Ziel'
  }
}

function zielspurKeyAusAktion(aktion: SpielAktion): string | null {
  // ÄNDERUNG [05.07.2026]: gemeinsame Factory statt handkopierter Schlüssel. Der frühere Code
  // verwendete für Frass die aktiverSpielerId (statt der Ziel-Spieler-Id) und ließ bei
  // Blockade/Dieb die zielSpielerId weg — dadurch trafen die Sprung-Links die Brett-Anker nicht.
  switch (aktion.typ) {
    case 'SchlangenfrassSpielen': {
      const ziel = aktion.ziele[0]
      if (!ziel) return null
      return frassKey(ziel.spielerId, ziel.schlangenId, ziel.kartenId)
    }
    case 'FarbenschutzSpielen':
      return schutzKey(aktion.zielSchlangenId)
    case 'FarbenfusionSpielen':
      return fusionKey(aktion.zielSchlangenId, aktion.zielKartenId)
    case 'SchlangenblockadeSpielen':
      return blockadeKey(aktion.zielSpielerId, aktion.zielSchlangenId)
    case 'FarbendiebSpielen':
      return diebKey(aktion.zielSpielerId, aktion.zielSchlangenId, aktion.zielKartenId)
    default:
      return null
  }
}

export default function WaldtanzSonderkartenSpielmoment({
  ausgewaehlteHandkarte,
  legaleAktionen,
  // aktiverSpielerId bleibt Teil der Props (Aufrufer-Kompatibilität), wird aber seit der
  // zielspurKey-Factory-Migration nicht mehr benötigt (Ziel-Spieler-Id kommt aus der Aktion).
  onZielspurAktivieren,
}: WaldtanzSonderkartenSpielmomentProps) {
  const regionLabelId = useId()

  // Nur sichtbar bei Sonderkarten-Auswahl
  if (ausgewaehlteHandkarte.typ !== 'Sonderkarte') return null

  // Filtere legale Aktionen, die diese Sonderkarte nutzen
  const aktionen = legaleAktionen.filter(
    (a) => 'handkartenId' in a && a.handkartenId === ausgewaehlteHandkarte.id,
  )
  if (aktionen.length === 0) return null

  const ersteAktion = aktionen[0]
  if (!ersteAktion) return null

  const zielart = zielartLabel(ersteAktion)
  const zielspurKey = zielspurKeyAusAktion(ersteAktion)
  const sonderkarteName = ausgewaehlteHandkarte.name
  // Daten-attributierter Anker-Span: macht die zielspurKey zu einer echten
  // DOM-ID, sodass der Link `href="#key"` ein real existierendes Element
  // anspringt. Visuell versteckt; semantisch ein `aria-hidden` Ankerpunkt.
  const ankerId = zielspurKey ? `m1dq-sonderkarte-${zielspurKey}` : null

  return (
    <section
      className="handkarten-buehne__spielmoment waldtanz-sonderkarten-spielmoment"
      role="group"
      aria-labelledby={regionLabelId}
      data-sonderkarte-name={sonderkarteName}
      data-zielart={zielart}
    >
      <span id={regionLabelId} className="handkarten-buehne__spielmoment-region-label">
        Waldtanz-Sonderkarten-Spielmoment
      </span>
      {ankerId ? (
        <span
          id={ankerId}
          data-zielspur-key={zielspurKey ?? undefined}
          aria-hidden="true"
          className="handkarten-buehne__spielmoment-anker"
        />
      ) : null}
      <span className="handkarten-buehne__spielmoment-kicker" aria-hidden="true">Spielmoment</span>
      <h5 className="handkarten-buehne__spielmoment-titel">
        Sonderkarte {sonderkarteName}
      </h5>
      <span className="handkarten-buehne__spielmoment-zielart" aria-label={`Ziel-Art: ${zielart}`}>
        <span aria-hidden="true" className="handkarten-buehne__spielmoment-pfeil">↓</span>
        <span>{zielart}</span>
      </span>
      {ankerId ? (
        <a
          href={`#${ankerId}`}
          className="handkarten-buehne__spielmoment-link"
          aria-label={`Direkt zum ${zielart} der Sonderkarte ${sonderkarteName} springen`}
          onClick={(event) => {
            // Wir verhindern die Default-Fragmentnavigation NICHT — der Anker-Span
            // existiert real im DOM, der Sprung ans Brett funktioniert. Zusätzlich
            // scrollen wir das eigentliche data-zielspur-key-Element (das auf dem
            // Brett-Ziel gerendert wird) in den Viewport, damit der Spieler
            // sowohl visuell das Highlight sieht als auch die echte
            // Schlangenbereich-Scroll-Achse nutzt.
            if (zielspurKey && typeof document !== 'undefined') {
              const zielElement = document.querySelector(`[data-zielspur-key="${CSS.escape(zielspurKey)}"]`)
              if (zielElement instanceof HTMLElement) {
                event.preventDefault()
                zielElement.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
                const fokus = zielElement.querySelector('button, [tabindex]') ?? zielElement
                if (fokus instanceof HTMLElement) fokus.focus({ preventScroll: true })
                onZielspurAktivieren?.(zielspurKey)
              }
            }
          }}
        >
          Zum Brett-Ziel
        </a>
      ) : (
        <span className="handkarten-buehne__spielmoment-link handkarten-buehne__spielmoment-link--inaktiv">
          Brett-Ziel manuell wählen
        </span>
      )}
    </section>
  )
}
