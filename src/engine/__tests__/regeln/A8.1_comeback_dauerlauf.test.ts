// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Aktionstyp } from '../../index'
import { dauerlauf, dauerlaufPartien } from '../../testing/dauerlauf'
import type { SchrittPruefer } from '../../testing/dauerlauf'
import { allePruefer, neueReaktionen, reaktionsPruefer, regelPruefer, stapelPruefer } from '../dauerlauf_pruefer'

/*
X4, „Für alle drei“: Der Dauerlauf mit Erweiterung spielt die Comeback-Karte.
Gewählt wird gleichverteilt unter den aufgezählten Aktionen; dass dabei
Comeback-Karten eingesetzt werden und „Zwei Karten abwerfen, drei ziehen“
vorkommt, zeigt, dass die Prüfer des Dauerlaufs diese Züge auch sehen.
*/

describe('X4/A8.1: Dauerlauf mit Erweiterung und Comeback-Karte', () => {
  it('A8.1/D49: in 40 Zufallspartien mit Erweiterung kommen Comeback und Abwerfen vor; jede Partie endet ohne Befund', () => {
    const gezaehlt = new Map<Aktionstyp, number>()
    const zaehler: SchrittPruefer = (_vorher, aktion) => {
      gezaehlt.set(aktion.typ, (gezaehlt.get(aktion.typ) ?? 0) + 1)
      return null
    }
    const neuerPruefer = () => allePruefer(regelPruefer(), reaktionsPruefer(neueReaktionen()), stapelPruefer, zaehler)
    const ergebnisse = dauerlauf(dauerlaufPartien(40, true, 6001), { neuerPruefer })
    expect(ergebnisse.filter((ergebnis) => ergebnis.ausgang !== 'beendet'), 'X4: Partien, die nicht regulär endeten').toEqual([])
    expect(gezaehlt.get('ComebackEinsetzen') ?? 0, 'A8.1: eingesetzte Comeback-Karten').toBeGreaterThan(0)
    expect(gezaehlt.get('ZweiAbwerfenDreiZiehen') ?? 0, 'D49: „Zwei Karten abwerfen, drei ziehen“').toBeGreaterThan(0)
  }, 300_000)
})
