import { describe, expect, it } from 'vitest'
import { anwendeAktion, ermittleAktionen, pruefeAktion, zugBeendenGesperrt } from '../../index'
import type { SpielAktion, Spielzustand } from '../../index'
import { baukasten } from '../../testing/szenario'

/*
O5, Prüfprotokoll Iteration 1: Die Oberfläche zeigt neben einem gesperrten
„Zug beenden“, warum. Den Grund kennt nur die Engine; `zugBeendenGesperrt`
nennt ihn für den Spieler am Zug, ohne dass die Oberfläche eine Aktion baut
(U3). Er ist genau der Grund, mit dem `pruefeAktion` das Beenden ablehnt.
*/

const beenden = (zustand: Spielzustand): SpielAktion => ({ typ: 'ZugBeenden', spielerId: zustand.spieler[zustand.zug.spielerIndex].id })

/** Der Grund, mit dem die Engine das Beenden ablehnt, oder `null`, wenn sie es erlaubt. */
function grundDerPruefung(zustand: Spielzustand): string | null {
  const ergebnis = pruefeAktion(zustand, beenden(zustand))
  return ergebnis.erlaubt ? null : ergebnis.grund
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
    expect(grund).toBe(grundDerPruefung(zustand))
    expect(grund).toMatch(/mindestens eine Karte/)
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
    expect(zugBeendenGesperrt(zustand)).toBe(grundDerPruefung(zustand))
    expect(zugBeendenGesperrt(zustand)).toMatch(/abgeworfen/)
  })

  it('A6: schwebt eine angesagte Sonderkarte, nennt sie den Grund aus pruefeAktion', () => {
    const zustand = baukasten({ spielerzahl: 2, erweiterung: false })
      .hand(1, ['Farbenschutz'])
      .schwebend(0, 'Schlangengrube', (karteId, spielerId) => ({ typ: 'SchlangengrubeSpielen', spielerId, karteId, zielSpielerId: 'spieler-2' }), [1])
      .zustand()
    expect(zugBeendenGesperrt(zustand)).toBe(grundDerPruefung(zustand))
    expect(zugBeendenGesperrt(zustand)).toMatch(/schwebt/)
  })
})
