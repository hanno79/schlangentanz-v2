import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, ermittleEntscheider, zugBeendenGesperrt } from '../../engine'
import type { Spielzustand } from '../../engine'
import { erzeugeZufall } from '../../engine/testing/zufall'
import { starteEntwicklerPartie } from '../../entwicklung/partie'
import { angriffAufMich, geheimeHaende, mittelspiel, verrateneIds, volltisch, zehnHandkarten } from '../tisch/__tests__/szenarien'
import { tischAnsicht } from './tischAnsicht'

/*
O3: Was die Bedienung aus `tischAnsicht` braucht, sind die Aktionen, die der
Mensch jetzt wählen darf. Sie stehen nur darin, solange er entscheidet: Die
Aktionen eines Gegners nennen dessen Handkarten (B2, „auch nicht mittelbar über
angebotene Aktionen“).
*/

/** Spielt eine Partie mit gleichverteilter Wahl für alle und liefert jeden Zustand bis zum Ende. */
function partie(saat: number, spieler: number, erweiterung: boolean): Spielzustand[] {
  const zufall = erzeugeZufall(saat * 7919)
  const zustaende = [starteEntwicklerPartie(saat, spieler, erweiterung)]
  for (let schritt = 0; schritt < 2000; schritt += 1) {
    const zustand = zustaende[zustaende.length - 1]
    const aktionen = ermittleAktionen(zustand)
    if (aktionen.length === 0) return zustaende
    zustaende.push(anwendeAktion(zustand, aktionen[Math.floor(zufall() * aktionen.length)]).zustand)
  }
  throw new Error(`Partie aus Saat ${saat} endet nicht nach 2000 Schritten.`)
}

const PARTIEN = [
  { saat: 1, spieler: 2, erweiterung: false },
  { saat: 2, spieler: 3, erweiterung: true },
  { saat: 3, spieler: 4, erweiterung: false },
]

describe('O3: Die Aktionen des Menschen in der Sicht', () => {
  it('O3/U3: entscheidet der Mensch, stehen genau die Aktionen der Engine in der Sicht, in ihrer Reihenfolge', () => {
    for (const zustand of [mittelspiel(), angriffAufMich(), zehnHandkarten()]) {
      expect(ermittleEntscheider(zustand)).toBe(0)
      expect(tischAnsicht(zustand).aktionen).toEqual(ermittleAktionen(zustand))
    }
  })

  it('O3/B2: entscheidet ein Gegner, bietet die Sicht keine Aktion an', () => {
    for (const zustand of [volltisch(), geheimeHaende()]) {
      expect(ermittleEntscheider(zustand)).not.toBe(0)
      expect(ermittleAktionen(zustand).length, 'der Gegner hätte Aktionen').toBeGreaterThan(0)
      expect(tischAnsicht(zustand).aktionen).toEqual([])
    }
  })

  it('O3/A10: nach Spielende bietet die Sicht keine Aktion an', () => {
    const [ende] = partie(5, 2, false).slice(-1)
    expect(ende.partiephase).toBe('Beendet')
    expect(tischAnsicht(ende).aktionen).toEqual([])
  })

  it('O5/A5: entscheidest du, steht der Grund der Engine darin, warum du den Zug nicht beenden darfst; sonst nichts', () => {
    const zustaende = partie(1, 2, false)
    let gesperrt = 0
    for (const zustand of zustaende) {
      const ansicht = tischAnsicht(zustand)
      const erwartet = ermittleEntscheider(zustand) === 0 ? zugBeendenGesperrt(zustand) : null
      expect(ansicht.zugBeendenGesperrt).toBe(erwartet)
      expect(ansicht.zugBeendenGesperrt === null, 'gesperrt genau dann, wenn die Engine kein ZugBeenden aufzählt').toBe(
        ansicht.aktionen.length === 0 || ansicht.aktionen.some((aktion) => aktion.typ === 'ZugBeenden'),
      )
      if (ansicht.zugBeendenGesperrt !== null) gesperrt += 1
    }
    expect(gesperrt, 'mindestens ein Zustand, in dem du nicht beenden darfst').toBeGreaterThan(0)
  })
})

describe('O3 K6/B2: Keine fremde Handkarte und keine fremde geheime Aufgabe, nach jedem Schritt einer Partie', () => {
  it.each(PARTIEN)('O3 K6: Partie aus Saat $saat mit $spieler Spielern (Erweiterung $erweiterung)', ({ saat, spieler, erweiterung }) => {
    const zustaende = partie(saat, spieler, erweiterung)
    expect(zustaende[zustaende.length - 1].partiephase).toBe('Beendet')
    let menschEntschied = 0
    for (const [schritt, zustand] of zustaende.entries()) {
      const ansicht = tischAnsicht(zustand)
      if (ansicht.aktionen.length > 0) menschEntschied += 1
      expect(verrateneIds(zustand, JSON.stringify(ansicht)), `Schritt ${schritt}: verborgene Ids in tischAnsicht`).toEqual([])
    }
    expect(menschEntschied, 'der Mensch hat in der Partie nie entschieden').toBeGreaterThan(0)
  })
})
