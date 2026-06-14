/*
Author: rahn
Datum: 14.06.2026
Version: 1.0
Beschreibung: Board-naher Partiefortschritt fuer Endspurt- und Sieger-Party-Orientierung im Waldtanz-Spieltisch.
*/

import type { SpielerWertungsEintrag, Spielzustand } from '../engine'

interface PartiefortschrittProps {
  zustand: Spielzustand
  spielerwertungen: SpielerWertungsEintrag[]
}

function spielerName(zustand: Spielzustand, index: number): string {
  return zustand.spieler[index]?.name ?? `Spieler ${index + 1}`
}

function punktestand(spielerwertungen: SpielerWertungsEintrag[], spielerId: string): number {
  return spielerwertungen.find(eintrag => eintrag.spielerId === spielerId)?.gesamtPunkte ?? 0
}

function fuehrungLabel(zustand: Spielzustand, spielerwertungen: SpielerWertungsEintrag[]): string {
  const besteWertung = spielerwertungen.reduce<SpielerWertungsEintrag | null>(
    (beste, eintrag) => beste === null || eintrag.gesamtPunkte > beste.gesamtPunkte ? eintrag : beste,
    null,
  )
  if (!besteWertung) return 'Aktuelle Führung: noch keine Punkte'
  const spieler = zustand.spieler.find(s => s.id === besteWertung.spielerId)
  return `Aktuelle Führung: ${spieler?.name ?? besteWertung.spielerId} mit ${besteWertung.gesamtPunkte} Punkten`
}

function menschLabel(zustand: Spielzustand, spielerwertungen: SpielerWertungsEintrag[]): string {
  const mensch = zustand.spieler.find(spieler => spieler.steuerung === 'Mensch') ?? zustand.spieler[0]
  return `Du: ${mensch ? punktestand(spielerwertungen, mensch.id) : 0} Punkte`
}

function endrundenSpielerLabel(zustand: Spielzustand): string {
  if (zustand.endrunde.verbleibendeSpielerIndizes.length === 0) return 'Noch am Zug: niemand'
  return `Noch am Zug: ${zustand.endrunde.verbleibendeSpielerIndizes.map(index => spielerName(zustand, index)).join(', ')}`
}

function statusLabel(zustand: Spielzustand): string {
  if (zustand.zugphase === 'Spielende') return 'Sieger-Party bereit'
  if (zustand.spielphase === 'Endspurt') return 'Endspurt läuft'
  return `${zustand.nachziehstapel.length} Karten bis zum Endspurt`
}

function zielLabel(zustand: Spielzustand): string {
  if (zustand.zugphase === 'Spielende') return 'Die Sieger-Party zeigt jetzt die finale Wertung.'
  if (zustand.spielphase === 'Endspurt') return 'Endrunden-Züge ohne Nachziehen: Spiele die letzten Stationen bis zur Sieger-Party.'
  return 'Leere den Nachziehstapel, dann beginnt die Endrunde mit den letzten Zügen bis zur Sieger-Party.'
}

function countdownLabel(zustand: Spielzustand): string {
  if (zustand.zugphase === 'Spielende') return 'Finale erreicht'
  if (zustand.spielphase === 'Endspurt') {
    const zuege = zustand.endrunde.verbleibendeSpielerIndizes.length
    return `${zuege} ${zuege === 1 ? 'Zug' : 'Züge'} bis zur Sieger-Party`
  }
  return `${zustand.nachziehstapel.length} Karten im Nachziehstapel`
}

export default function Partiefortschritt({ zustand, spielerwertungen }: PartiefortschrittProps) {
  return (
    <section className="partiefortschritt" aria-label="Partiefortschritt">
      <div className="partiefortschritt__kopf">
        <h4>Partiefortschritt</h4>
        <span className="partiefortschritt__status">{statusLabel(zustand)}</span>
      </div>
      <div className="partiefortschritt__spur">
        <p>{countdownLabel(zustand)}</p>
        <p>{fuehrungLabel(zustand, spielerwertungen)}</p>
        <p>{menschLabel(zustand, spielerwertungen)}</p>
      </div>
      {zustand.spielphase === 'Endspurt' && <p className="partiefortschritt__endrunde">{endrundenSpielerLabel(zustand)}</p>}
      <p>{zielLabel(zustand)}</p>
    </section>
  )
}
