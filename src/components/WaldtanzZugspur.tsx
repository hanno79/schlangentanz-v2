/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-nahe Waldtanz-Zugspur für den letzten sichtbaren Spielzug und Ablage-Feedback.
*/

import type { Spielkarte, Spielzustand } from '../engine'

interface WaldtanzZugspurProps {
  zustand: Spielzustand
  letzteAktion: string | null
  pflichtschrittLabel: string
}

function karteLabel(karte: Spielkarte): string {
  return karte.typ === 'Farbkarte'
    ? `${karte.id} · ${karte.farbe} · ${karte.punkte} Punkte`
    : `${karte.id} · Sonderkarte ${karte.name}`
}

function ablageKurzstatus(zustand: Spielzustand): string {
  const letzteKarte = zustand.ablagestapel.at(-1)
  return letzteKarte
    ? `Ablage zeigt: ${karteLabel(letzteKarte)}`
    : 'Ablage wartet auf Sonderkarten oder Abwürfe.'
}

export default function WaldtanzZugspur({ zustand, letzteAktion, pflichtschrittLabel }: WaldtanzZugspurProps) {
  return (
    <section className="waldtanz-zugspur" aria-label="Waldtanz-Zugspur" aria-live="polite" aria-atomic="true">
      <div className="waldtanz-zugspur__kopf">
        <h4>Waldtanz-Zugspur</h4>
        <span className="waldtanz-zugspur__label">{letzteAktion ? 'Letzter Spielzug' : 'Bereit'}</span>
      </div>
      <p className="waldtanz-zugspur__aktion">
        {letzteAktion ?? 'Noch keine Aktion auf der Lichtung.'}
      </p>
      <p className="waldtanz-zugspur__naechster-schritt">Nächster Schritt: {pflichtschrittLabel}</p>
      <p className="waldtanz-zugspur__ablage">{ablageKurzstatus(zustand)}</p>
    </section>
  )
}
