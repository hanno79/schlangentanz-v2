/*
Author: rahn
Datum: 14.06.2026
Version: 1.1
Beschreibung: Stitch-Spielerrahmen für den Waldtanz-Spieltisch mit kompletter Tischrunde, Gegnerhänden und Zugstatus.
*/
import type { Spieler, SpielerWertungsEintrag, Spielzustand } from '../engine'

interface WaldtanzSpielerrahmenProps {
  zustand: Spielzustand
  spielerwertungen: SpielerWertungsEintrag[]
  kiZugProtokoll: string[]
}

function punkteFuer(spielerId: string, wertungen: SpielerWertungsEintrag[]): number {
  return wertungen.find((wertung) => wertung.spielerId === spielerId)?.gesamtPunkte ?? 0
}

function spielerLabel(spieler: Spieler, istAktiv: boolean): string {
  if (spieler.steuerung === 'Mensch') return istAktiv ? `Du — ${spieler.name}` : `Gegner: ${spieler.name}`
  return istAktiv ? `Aktiv — ${spieler.name}` : `Gegner: ${spieler.name}`
}

function kartenruecken(spieler: Spieler) {
  return Array.from({ length: spieler.hand.length }, (_, index) => (
    <span key={index} className="waldtanz-spielerrahmen__kartenruecken" aria-hidden="true">🍃</span>
  ))
}

export default function WaldtanzSpielerrahmen({
  zustand,
  spielerwertungen,
  kiZugProtokoll,
}: WaldtanzSpielerrahmenProps) {
  const aktiverIndex = zustand.aktiverSpielerIndex
  const aktiverSpieler = zustand.spieler[aktiverIndex]
  const naechsterIndex = (aktiverIndex + 1) % zustand.spieler.length
  const naechsterSpieler = zustand.spieler[naechsterIndex]
  const gegnerSpieler = zustand.spieler.filter((_, index) => index !== aktiverIndex)
  const hatAbgeschlossenenGegnerzug = aktiverSpieler.steuerung === 'Mensch' && kiZugProtokoll.length > 0

  return (
    <section className="waldtanz-spielerrahmen" aria-label="Waldtanz-Spielerrahmen">
      <div className="waldtanz-spielerrahmen__statusband">
        <span>Tischrunde: {zustand.spieler.length} Spieler</span>
        <span>Nächster Zug: {naechsterSpieler.name}</span>
        {hatAbgeschlossenenGegnerzug && <span>Gegnerzug zurück bei dir</span>}
      </div>
      <ol className="waldtanz-spielerrahmen__gegnerliste" aria-label="Gegner am Tisch">
        {gegnerSpieler.map((spieler) => {
          const istNaechster = spieler.id === naechsterSpieler.id

          return (
            <li key={spieler.id} className="waldtanz-spielerrahmen__gegnerplatz">
              <article className={`waldtanz-spielerrahmen__plakette waldtanz-spielerrahmen__plakette--gegner${istNaechster ? ' waldtanz-spielerrahmen__plakette--naechster' : ''}`}>
                <span className="waldtanz-spielerrahmen__avatar" aria-hidden="true">🐸</span>
                <div>
                  <strong>{spielerLabel(spieler, false)}</strong>
                  <span>{punkteFuer(spieler.id, spielerwertungen)} Punkte</span>
                  {istNaechster && <span>nächster Zug</span>}
                </div>
              </article>
              <div className="waldtanz-spielerrahmen__handruecken" aria-label={`${spieler.hand.length} verdeckte Karten von ${spieler.name}`}>
                {kartenruecken(spieler)}
              </div>
              <span className="waldtanz-spielerrahmen__handzahl">{spieler.hand.length} verdeckte Karten</span>
            </li>
          )
        })}
      </ol>
      <div className="waldtanz-spielerrahmen__reihe waldtanz-spielerrahmen__reihe--du">
        <article className="waldtanz-spielerrahmen__plakette waldtanz-spielerrahmen__plakette--du waldtanz-spielerrahmen__plakette--aktiv">
          <div>
            <strong>{spielerLabel(aktiverSpieler, true)}</strong>
            <span>{punkteFuer(aktiverSpieler.id, spielerwertungen)} Punkte</span>
          </div>
          <span className="waldtanz-spielerrahmen__avatar" aria-hidden="true">🧙</span>
        </article>
        <span className="waldtanz-spielerrahmen__handzahl">{aktiverSpieler.hand.length} Handkarten bereit</span>
      </div>
    </section>
  )
}
