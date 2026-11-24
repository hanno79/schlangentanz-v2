// @vitest-environment node
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { anwendeAktion, erstellePartie, erzeugeZufall } from '../../engine'
import { kiWahl } from '../schritt'
import { erstelleSolideKi } from './solideKi'

/*
X3, Prüfprotokoll Iteration 1, Mangel 1: Der Rahmen aus X3 (Zusatzaktionen,
Entscheidungen) ändert ohne Erweiterung nichts an den Regeln, also darf er auch
die Wahl der soliden KI nicht ändern. Die Probe spielt Partien ohne Erweiterung
allein mit der soliden KI und fasst jede ihrer Wahlen in einer Prüfsumme
zusammen. Die erwartete Summe ist auf `origin/neuaufbau` 47f2676 gemessen, dem
Stand ohne X3. Ändert eine spätere KI-Task die Wahl mit Absicht, misst sie die
Summe neu und nennt das im PR.

K2b (Vollenden bei Gleichstand) ändert die Wahl mit Absicht und hat die Summe neu
gemessen. Auf dem Verlauf dieser sechs Partien wählt die KI von K2b in 4 von 1064
Wahlen anders (Partie 73004 Schritte 104 und 120, 73005 Schritt 134, 73006 Schritt
143). Jedes Mal sind beide Züge gleich bewertet und gleich in Gruppen und Punkten;
vorher entschied dort ein Rundungsrest im Vorwert der Vorauswahl, jetzt die
Reihenfolge der Engine. Vorher: 095a4b72479d5ef49a323a84c3da37420e94ef0511efec4b493fc752269e20f9 1064.
*/

const PARTIEN = [73001, 73002, 73003, 73004, 73005, 73006]
const ERWARTET = 'c55351e4d24c6ea562801a694248ce4c0f18702abc8c093b1b021ea8c025e2f7 1064'

/** Die Wahlen der soliden KI in einer Partie ohne Erweiterung, Schritt für Schritt. */
function wahlen(saat: number, spielerzahl: number): string[] {
  let zustand = erstellePartie({ spielerzahl, erweiterung: false, zufall: erzeugeZufall(saat) })
  const ki = erstelleSolideKi(erzeugeZufall(saat * 13 + 5))
  const protokoll: string[] = []
  for (let aktion = kiWahl(zustand, ki); aktion !== null; aktion = kiWahl(zustand, ki)) {
    if (protokoll.length > 5000) throw new Error(`Partie ${saat} endet nicht.`)
    protokoll.push(JSON.stringify(aktion))
    zustand = anwendeAktion(zustand, aktion).zustand
  }
  return protokoll
}

describe('X3/K2: ohne Erweiterung wählt die solide KI wie vor X3', () => {
  it('X3: die Prüfsumme der Wahlen über sechs Partien ohne Erweiterung ist die vom Stand ohne X3', () => {
    const hash = createHash('sha256')
    let schritte = 0
    PARTIEN.forEach((saat, index) => {
      const protokoll = wahlen(saat, 2 + (index % 3))
      schritte += protokoll.length
      hash.update(protokoll.join('\n'))
    })
    expect(`${hash.digest('hex')} ${schritte}`, 'X3: die solide KI wählt ohne Erweiterung anders als vor X3').toBe(ERWARTET)
  }, 120_000)
})
