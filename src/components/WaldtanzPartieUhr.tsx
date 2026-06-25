/*
Author: rahn
Datum: 24.06.2026
Version: 1.0
Beschreibung: Visueller Countdown-Ring fuer den Brettschritt der Waldtanz-Partie.
              Atmet mit dem Spielzustand (Karten im Nachziehstapel ->
              Endrunden-Zuege -> Sieger-Party-Stern) und ersetzt den
              textuellen Countdown durch ein sichtbares Spieluhr-Brettjuwel.
*/

import type { Spielzustand } from '../engine'

interface WaldtanzPartieUhrProps {
  zustand: Spielzustand
}

type PhasenPhase = 'nachziehphase' | 'endspurt' | 'sieger-party'

function ermittlePhase(zustand: Spielzustand): PhasenPhase {
  if (zustand.zugphase === 'Spielende') return 'sieger-party'
  if (zustand.spielphase === 'Endspurt') return 'endspurt'
  return 'nachziehphase'
}

function zaehlerText(zustand: Spielzustand, phase: PhasenPhase): string {
  if (phase === 'sieger-party') return 'Sieger-Party'
  if (phase === 'endspurt') {
    const zuege = zustand.endrunde.verbleibendeSpielerIndizes.length
    return `${zuege} ${zuege === 1 ? 'Zug' : 'Züge'} bis zur Sieger-Party`
  }
  return `${zustand.nachziehstapel.length} Karten bis zur Sieger-Party`
}

function phaseHinweis(phase: PhasenPhase): string {
  switch (phase) {
    case 'nachziehphase':
      return 'Nachziehstapel zählt zur Endrunde.'
    case 'endspurt':
      return 'Endrundenzüge laufen ohne Nachziehen.'
    case 'sieger-party':
      return 'Alle Züge gespielt — die Sieger-Party eröffnet.'
  }
  const nichtErfasstePhase: never = phase
  return nichtErfasstePhase
}

function kreisBahnParams(phase: PhasenPhase, zustand: Spielzustand): { radius: number; umfang: number; fortschritt: number; label: number } {
  const radius = 44
  const umfang = 2 * Math.PI * radius
  if (phase === 'sieger-party') {
    return { radius, umfang, fortschritt: umfang, label: 100 }
  }
  if (phase === 'endspurt') {
    const verbleibend = zustand.endrunde.verbleibendeSpielerIndizes.length
    const gesamt = zustand.spieler.length || 1
    const erledigt = Math.max(0, gesamt - verbleibend)
    const anteil = gesamt === 0 ? 0 : Math.min(1, erledigt / gesamt)
    return { radius, umfang, fortschritt: umfang * anteil, label: Math.round(anteil * 100) }
  }
  const karten = zustand.nachziehstapel.length
  const startKarten = Math.max(karten + 1, 16)
  const anteil = Math.max(0, Math.min(1, 1 - karten / startKarten))
  return { radius, umfang, fortschritt: umfang * anteil, label: Math.round(anteil * 100) }
}

export default function WaldtanzPartieUhr({ zustand }: WaldtanzPartieUhrProps) {
  const phase = ermittlePhase(zustand)
  const text = zaehlerText(zustand, phase)
  const hinweis = phaseHinweis(phase)
  const bahn = kreisBahnParams(phase, zustand)
  const istPulsierend = phase === 'endspurt'
  const klassen = `waldtanz-partie-uhr${istPulsierend ? ' waldtanz-partie-uhr--puls' : ''}`

  return (
    <section
      className={klassen}
      aria-label="Waldtanz-Spieluhr"
      data-partie-uhr-phase={phase}
    >
      <header className="waldtanz-partie-uhr__kopf">
        <span className="waldtanz-partie-uhr__label">Spieluhr</span>
        <strong className="waldtanz-partie-uhr__text">{text}</strong>
      </header>
      {phase === 'sieger-party' ? (
        <span className="waldtanz-partie-uhr__stern" aria-label="Sieger-Party-Stern" role="img">
          ★
        </span>
      ) : (
        <svg
          className="waldtanz-partie-uhr__svg"
          viewBox="0 0 100 100"
          role="img"
          aria-label={`Countdown bis zur Sieger-Party: ${text}`}
        >
          <circle
            className="waldtanz-partie-uhr__kreis-hintergrund"
            cx="50"
            cy="50"
            r={bahn.radius}
          />
          <circle
            className="waldtanz-partie-uhr__kreis-fortschritt"
            cx="50"
            cy="50"
            r={bahn.radius}
            strokeDasharray={`${bahn.fortschritt} ${bahn.umfang}`}
            transform="rotate(-90 50 50)"
          />
          <text className="waldtanz-partie-uhr__zahl" x="50" y="55" textAnchor="middle">
            {bahn.label}%
          </text>
        </svg>
      )}
      <p className="waldtanz-partie-uhr__hinweis">{hinweis}</p>
    </section>
  )
}
