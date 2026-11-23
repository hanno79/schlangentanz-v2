import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, pruefeAktion, zugBeendenGesperrt } from '../../index'
import type { Pruefergebnis, SpielAktion, Spielzustand } from '../../index'
import { baukasten } from '../../testing/szenario'
import { erzeugeZufall } from '../../testing/zufall'
import { zufallszustand } from '../../testing/zufallszustand'

/*
O5, Prüfprotokoll Iteration 1: Die Oberfläche zeigt neben einem gesperrten
„Zug beenden“, warum. Den Grund kennt nur die Engine; `zugBeendenGesperrt`
nennt ihn für den Spieler am Zug, ohne dass die Oberfläche eine Aktion baut
(U3). Er ist genau der Grund, mit dem `pruefeAktion` das Beenden ablehnt.
*/

const beenden = (zustand: Spielzustand): SpielAktion => ({ typ: 'ZugBeenden', spielerId: zustand.spieler[zustand.zug.spielerIndex].id })

/** Die Ablehnung, mit der die Engine das Beenden ablehnt, oder `null`, wenn sie es erlaubt. */
function grundDerPruefung(zustand: Spielzustand): Pruefergebnis | null {
  const ergebnis = pruefeAktion(zustand, beenden(zustand))
  return ergebnis.erlaubt ? null : ergebnis
}

const tisch = () =>
  baukasten({ spielerzahl: 2, erweiterung: false })
    .hand(0, ['Rot', 'Blau', 'Gelb', 'Farbenschutz', 'Grün'])
    .hand(1, ['Blau', 'Blau', 'Rot', 'Rot', 'Gelb'])
    .zustand()

describe('A5/D12: Warum der Zug nicht beendet werden kann, sagt die Engine', () => {
  it('A5 Wichtig/D12: vor der ersten Karte ist das Beenden gesperrt, mit dem Grund aus pruefeAktion', () => {
    const zustand = tisch()
    const grund = zugBeendenGesperrt(zustand)
    expect(grund, 'gesperrt vor der ersten Karte').not.toBeNull()
    expect(grund).toEqual(grundDerPruefung(zustand))
    expect(grund?.grund).toMatch(/mindestens eine Karte/)
    expect(ermittleAktionen(zustand).some((aktion) => aktion.typ === 'ZugBeenden')).toBe(false)
  })

  it('A5/D12: nach einer Karte ist das Beenden nicht gesperrt (null), wie die Aufzählung es anbietet', () => {
    const start = tisch()
    const farbkarte = ermittleAktionen(start).find((aktion) => aktion.typ === 'FarbkarteLegen')!
    const nach = anwendeAktion(start, farbkarte).zustand
    expect(zugBeendenGesperrt(nach)).toBeNull()
    expect(grundDerPruefung(nach)).toBeNull()
    expect(ermittleAktionen(nach).some((aktion) => aktion.typ === 'ZugBeenden')).toBe(true)
  })

  it('A5: im Abschnitt Abwerfen nennt sie den Grund aus pruefeAktion', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .hand(0, ['Rot', 'Blau', 'Gelb', 'Grün', 'Violett', 'Braun', 'Farbenschutz'])
      .aendere((stand) => {
        stand.zug.abschnitt = 'Abwerfen'
      })
      .zustand()
    expect(zugBeendenGesperrt(zustand)).toEqual(grundDerPruefung(zustand))
    expect(zugBeendenGesperrt(zustand)?.grund).toMatch(/abgeworfen/)
  })

  it('A6: schwebt eine angesagte Sonderkarte, nennt sie den Grund aus pruefeAktion', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .hand(1, ['Farbenschutz'])
      .schwebend(0, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-2' }), [1])
      .zustand()
    expect(zugBeendenGesperrt(zustand)).toEqual(grundDerPruefung(zustand))
    expect(zugBeendenGesperrt(zustand)?.grund).toMatch(/schwebt/)
  })

  it('A5/D12: mit leerer Hand ist das Beenden nicht gesperrt, auch ohne gespielte Karte', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false }).hand(1, ['Blau']).zustand()
    expect(zustand.spieler[0].hand).toHaveLength(0)
    expect(zugBeendenGesperrt(zustand)).toBeNull()
    expect(grundDerPruefung(zustand)).toBeNull()
  })

  it('A7.8/D12: im zweiten Zug nach dem Verdoppler gilt die Kartenpflicht neu; eine Sonderkarte allein erfüllt sie', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, ['Farbenschutz', 'Rot']).amZug(0, 2).zustand()
    expect(zugBeendenGesperrt(zustand)).toEqual(grundDerPruefung(zustand))
    expect(zugBeendenGesperrt(zustand)?.grund).toMatch(/mindestens eine Karte/)
    const ablegen = ermittleAktionen(zustand).find((aktion) => aktion.typ === 'SonderkarteWirkungslosAblegen')!
    const nach = anwendeAktion(zustand, ablegen).zustand
    expect(zugBeendenGesperrt(nach)).toBeNull()
  })

  it('A10: nach dem Spielende nennt sie den Grund aus pruefeAktion', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false }).hand(0, ['Rot']).beendet(0).zustand()
    expect(zugBeendenGesperrt(zustand)).toEqual(grundDerPruefung(zustand))
    expect(zugBeendenGesperrt(zustand)?.grund).toMatch(/A10/)
  })

  it('A5, A6, A10: in 1000 Zufallszuständen jeder Phase derselbe Grund wie pruefeAktion, und gesperrt genau dann, wenn sie ablehnt', () => {
    let gesperrt = 0
    for (let saat = 1; saat <= 1000; saat += 1) {
      const zustand = zufallszustand(erzeugeZufall(saat))
      const grund = zugBeendenGesperrt(zustand)
      expect(grund, `Saat ${saat}`).toEqual(grundDerPruefung(zustand))
      if (grund !== null) gesperrt += 1
    }
    expect(gesperrt, 'gesperrte und freie Zustände kommen beide vor').toBeGreaterThan(0)
    expect(gesperrt).toBeLessThan(1000)
  })
})
