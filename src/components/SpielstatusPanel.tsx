/*
Author: rahn
Datum: 13.06.2026
Version: 1.0
Beschreibung: Kompakter Spielstatus-HUD fuer Zugphase, Partiephase und Zugfortschritt.
*/

import type { Spielzustand } from '../engine'
import { MAX_KARTEN_PRO_ZUG } from '../engine'
import DebugGruppe from './DebugGruppe'
import Zugfortschritt from './Zugfortschritt'
import { zugphaseLabel } from '../zugphaseLabels'

interface SpielstatusPanelProps {
  zustand: Spielzustand
  titelId: string
  istSpielende: boolean
  istEndspurt: boolean
  entwicklungsdatenOffen?: boolean
}

function spielphaseLabel(spielphase: Spielzustand['spielphase']): string {
  switch (spielphase) {
    case 'Normal':
      return 'Laufende Partie'
    case 'Endspurt':
      return 'Endrunde läuft'
    case 'Beendet':
      return 'Partie beendet'
  }
}

export default function SpielstatusPanel({ zustand, titelId, istSpielende, istEndspurt, entwicklungsdatenOffen = true }: SpielstatusPanelProps) {
  const aktiverSpieler = zustand.spieler[zustand.aktiverSpielerIndex]
  const phaseText = zugphaseLabel(zustand.zugphase)
  const spielphaseText = spielphaseLabel(zustand.spielphase)
  const kartenzugMaximum = MAX_KARTEN_PRO_ZUG + (zustand.zugpflichten.verdopplerBonusAktiv ? 1 : 0)

  return (
    <section className="info-panel info-panel--spielstatus waldtanz-hud waldtanz-hud--status" aria-labelledby={titelId} aria-live="polite" aria-atomic="true">
      <h2 id={titelId}>Spielstatus</h2>
      <div className="waldtanz-sonnenstand" role="group" aria-label="Waldtanz-Sonnenstand">
        <div className="waldtanz-sonnenstand__hauptkarte">
          <span className="waldtanz-sonnenstand__eyebrow">Sonnenstand</span>
          <strong className="waldtanz-sonnenstand__phase">{phaseText}</strong>
          <span>{aktiverSpieler.name} am Zug</span>
        </div>
        <div className="waldtanz-sonnenstand__chips" aria-label="Sonnenstand-Werte">
          <span className="waldtanz-sonnenstand__chip">{zustand.spieler.length} Spieler am Tisch</span>
          <span className="waldtanz-sonnenstand__chip">Zugkarten: {zustand.zugpflichten.gespielteKarten}/{kartenzugMaximum}</span>
          <span className="waldtanz-sonnenstand__chip">{spielphaseText}</span>
        </div>
      </div>
      <DebugGruppe titel="Spielphase" standardOffen={entwicklungsdatenOffen} kompakteSchublade={!entwicklungsdatenOffen}>
        <p>Aktueller Spielschritt: {phaseText}</p>
        <p>Spielschritt im Zug: {phaseText}</p>
        <p>Partiestatus: {spielphaseText}</p>
        {istSpielende && <p>Spielende erreicht.</p>}
        {zustand.spielphase === 'Endspurt' && zustand.endrunde.ausloeserSpielerIndex !== null && (
          <>
            <p>Endrunde aktiv: ja</p>
            <p>Endrunde ausgelöst durch: {zustand.spieler[zustand.endrunde.ausloeserSpielerIndex].name}</p>
          </>
        )}
        {zustand.spielphase !== 'Normal' && (
          <p>
            Verbleibende Endrunde:{' '}
            {zustand.endrunde.verbleibendeSpielerIndizes.length > 0
              ? zustand.endrunde.verbleibendeSpielerIndizes.map(i => zustand.spieler[i].name).join(', ')
              : 'keine'}
          </p>
        )}
        {istEndspurt && (
          <>
            <p>Nachziehen in der Endrunde: aus</p>
            <p>Verbleibende Züge ohne Nachziehen: {zustand.endrunde.verbleibendeSpielerIndizes.length}</p>
          </>
        )}
        <p>Am Zug: Spieler {zustand.aktiverSpielerIndex + 1} von {zustand.spieler.length}</p>
      </DebugGruppe>
      <Zugfortschritt zugphase={zustand.zugphase} />
    </section>
  )
}
