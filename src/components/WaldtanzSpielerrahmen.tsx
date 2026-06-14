/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Stitch-Spielerrahmen für den Waldtanz-Spieltisch mit Gegnerhand und Punkteplaketten.
*/
import type { Spieler, SpielerWertungsEintrag } from '../engine'

interface WaldtanzSpielerrahmenProps {
  aktiverSpieler: Spieler
  gegnerSpieler: Spieler[]
  spielerwertungen: SpielerWertungsEintrag[]
}

function punkteFuer(spielerId: string, wertungen: SpielerWertungsEintrag[]): number {
  return wertungen.find((wertung) => wertung.spielerId === spielerId)?.gesamtPunkte ?? 0
}

export default function WaldtanzSpielerrahmen({
  aktiverSpieler,
  gegnerSpieler,
  spielerwertungen,
}: WaldtanzSpielerrahmenProps) {
  const gegner = gegnerSpieler[0]
  const aktiverSpielerPunkte = punkteFuer(aktiverSpieler.id, spielerwertungen)
  const gegnerPunkte = gegner ? punkteFuer(gegner.id, spielerwertungen) : 0
  const aktiverSpielerLabel = aktiverSpieler.steuerung === 'Mensch'
    ? `Du — ${aktiverSpieler.name}`
    : `Aktiv — ${aktiverSpieler.name}`

  return (
    <section className="waldtanz-spielerrahmen" aria-label="Waldtanz-Spielerrahmen">
      <div className="waldtanz-spielerrahmen__reihe waldtanz-spielerrahmen__reihe--gegner">
        {gegner ? (
          <article className="waldtanz-spielerrahmen__plakette waldtanz-spielerrahmen__plakette--gegner">
            <span className="waldtanz-spielerrahmen__avatar" aria-hidden="true">🐸</span>
            <div>
              <strong>Gegner: {gegner.name}</strong>
              <span>{gegnerPunkte} Punkte</span>
            </div>
          </article>
        ) : (
          <p>Keine Gegner am Tisch.</p>
        )}
        <div className="waldtanz-spielerrahmen__handruecken" aria-label={gegner ? `${gegner.hand.length} verdeckte Karten` : 'Keine verdeckten Karten'}>
          {Array.from({ length: gegner?.hand.length ?? 0 }, (_, index) => (
            <span key={index} className="waldtanz-spielerrahmen__kartenruecken" aria-hidden="true">🍃</span>
          ))}
        </div>
        {gegner && <span className="waldtanz-spielerrahmen__handzahl">{gegner.hand.length} verdeckte Karten</span>}
      </div>
      <div className="waldtanz-spielerrahmen__reihe waldtanz-spielerrahmen__reihe--du">
        <article className="waldtanz-spielerrahmen__plakette waldtanz-spielerrahmen__plakette--du">
          <div>
            <strong>{aktiverSpielerLabel}</strong>
            <span>{aktiverSpielerPunkte} Punkte</span>
          </div>
          <span className="waldtanz-spielerrahmen__avatar" aria-hidden="true">🧙</span>
        </article>
        <span className="waldtanz-spielerrahmen__handzahl">{aktiverSpieler.hand.length} Handkarten bereit</span>
      </div>
    </section>
  )
}
