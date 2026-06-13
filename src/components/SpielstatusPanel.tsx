/*
Author: rahn
Datum: 13.06.2026
Version: 1.0
Beschreibung: Kompakter Spielstatus-HUD fuer Zugphase, Partiephase und Zugfortschritt.
*/

import type { Spielzustand } from '../engine'
import DebugGruppe from './DebugGruppe'
import Zugfortschritt from './Zugfortschritt'
import { zugphaseLabel } from '../zugphaseLabels'

interface SpielstatusPanelProps {
  zustand: Spielzustand
  titelId: string
  istSpielende: boolean
  istEndspurt: boolean
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

export default function SpielstatusPanel({ zustand, titelId, istSpielende, istEndspurt }: SpielstatusPanelProps) {
  return (
    <section className="info-panel info-panel--spielstatus waldtanz-hud waldtanz-hud--status" aria-labelledby={titelId} aria-live="polite" aria-atomic="true">
      <h2 id={titelId}>Spielstatus</h2>
      <DebugGruppe titel="Spielphase">
        <p>Aktueller Spielschritt: {zugphaseLabel(zustand.zugphase)}</p>
        <p>Spielschritt im Zug: {zugphaseLabel(zustand.zugphase)}</p>
        <p>Partiestatus: {spielphaseLabel(zustand.spielphase)}</p>
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
