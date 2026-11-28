// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { ermittleAktionen, erzeugeZufall } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { kiWahl } from '../schritt'
import { entscheiderVon, sichtFuer } from '../sicht'
import { aufgabenwert, ersteZuege, gruppenzahl, ladeStellung } from '../__tests__/stellungen'
import type { Zugschritt } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { ERSTZUG_HALTEN, imErstenZug, setztAuslageEin } from './eroeffnung'
import { schaetzeRisiko } from './risiko'
import { erstelleSolideKi } from './solideKi'
import { erstelleSuche } from './suche'
import { schaetzeZiehen, ziehtVerdeckt } from './ziehen'

/*
K4, Kriterium 2 im ersten Zug (Prüfprotokoll K4, Iteration 2): Comeback-Karte, Risiko-Karte
und Schlangenkorb setzt die solide KI im ersten Zug nur ein, wenn der Zug eine Gruppe
vollendet, eine Aufgabe erfüllt oder die Bewertung um mehr als ERSTZUG_HALTEN steigt. Die
Regel greift an drei Stellen: beim Plan der Zugsuche, beim verdeckten Ziehen mit dem Korb und
bei der Risiko-Karte. Je Stelle gibt es eine Stellung aus einer Zufallspartie, in der die KI
ohne diese Stelle eine der Karten einsetzen würde; dazu die Eigenschaft über die ersten Züge
der Partien des Prüfers (Saat 810'000 bis 810'099, KI-Saat wie bei ihm).
*/

/** Die Stellungen: Saat 810'100 und 810'110 aus dem Prüfprotokoll, die anderen aus einer Suche auf denselben Saaten. */
const STELLUNGEN = [
  ['saat-810100-erster-zug-korb.json', 'Zugsuche: Korb „aktionen“, ohne Gruppe und Aufgabe 1.57 gegen Halten 1.28'],
  ['saat-810110-erster-zug-korb.json', 'Zugsuche: Korb „aktionen“, ohne Gruppe und Aufgabe -1.88 gegen Halten -1.92'],
  ['saat-810067-erster-zug-korb-ziehen.json', 'verdecktes Ziehen: Korb „ziehen“'],
  ['saat-810015-erster-zug-risiko.json', 'Risiko-Karte mit Aktion 2'],
] as const

describe('K4 Kriterium 2 im ersten Zug: je Stelle der Regel eine Stellung', () => {
  it.each(STELLUNGEN)('K4.2, %s (%s): im ersten Zug setzt sie keine der drei Karten ein, sondern beendet den Zug', (datei) => {
    const start = ladeStellung(datei)
    const sitz = entscheiderVon(start)!.index
    expect(imErstenZug(sichtFuer(start, sitz)), 'Testaufbau: erster Zug').toBe(true)
    expect(ermittleAktionen(start).some(setztAuslageEin), 'Testaufbau: eine der Karten ist angeboten').toBe(true)
    for (const saat of [1, 2, 3]) {
      const wahl = kiWahl(start, erstelleSolideKi(erzeugeZufall(saat)))
      expect(wahl?.typ, `K4.2: Saat ${saat}, gewählt ${JSON.stringify(wahl)}`).toBe('ZugBeenden')
    }
  })
})

/** Die Bewertung der Zugsuche ab `start` für den Spieler am Zug, auf dem echten Zustand. */
function wert(start: Spielzustand, zustand: Spielzustand): number {
  const sitz = start.zug.spielerIndex
  return bewerte(sichtFuer(zustand, sitz)) + aufgabenwert(start, zustand, sitz)
}

/** Was die KI selbst bei einer verdeckten Aktion über dem Halten erwartet: Risiko-Karte (`risiko.ts`) oder verdecktes Ziehen (`ziehen.ts`). */
function erwarteterAnstieg(vorher: Spielzustand, aktion: SpielAktion): number {
  const sicht = sichtFuer(vorher, vorher.zug.spielerIndex)
  const suche = erstelleSuche(sicht, erzeugeZufall(1))
  const aktionen = ermittleAktionen(vorher)
  if (aktion.typ === 'RisikoKarteSpielen') {
    const risiko = schaetzeRisiko(sicht, aktionen, suche.schaetzrechnung)!
    return risiko.wert - risiko.jetzt
  }
  return schaetzeZiehen(sicht, aktionen, suche.schaetzrechnung)!.wert - suche.ergebnis(suche.wurzel).wert
}

/** Ob der Einsatz an Stelle `stelle` des ersten Zuges eine Bedingung aus Kriterium 2 erfüllt; sonst warum nicht. */
function begruendung(zug: readonly Zugschritt[], stelle: number): string | null {
  const { vorher, aktion } = zug[stelle]
  const sitz = vorher.zug.spielerIndex
  // Was eine verdeckte Karte entscheidet, beurteilt die KI vorher nur im Erwartungswert (B2).
  if (aktion.typ === 'RisikoKarteSpielen' || ziehtVerdeckt(aktion)) {
    const anstieg = erwarteterAnstieg(vorher, aktion)
    return anstieg > ERSTZUG_HALTEN ? null : `${aktion.typ}: erwarteter Anstieg ${anstieg.toFixed(2)}`
  }
  const rest = zug.slice(stelle)
  const schluss = rest.findIndex(({ aktion: weiter }, index) => index > 0 && (weiter.typ === 'ZugBeenden' || weiter.typ === 'RisikoKarteSpielen' || ziehtVerdeckt(weiter)))
  // Zieht sie danach verdeckt (Comeback-Karte, Korb „aktionen“, D49), zählt der Erwartungswert dieses Ziehens.
  if (schluss >= 0 && ziehtVerdeckt(rest[schluss].aktion)) {
    const halten = erstelleSuche(sichtFuer(vorher, sitz), erzeugeZufall(1))
    const ziehen = rest[schluss]
    const sicht = sichtFuer(ziehen.vorher, sitz)
    const anstieg = schaetzeZiehen(sicht, ermittleAktionen(ziehen.vorher), erstelleSuche(sicht, erzeugeZufall(1)).schaetzrechnung)!.wert - halten.ergebnis(halten.wurzel).wert
    return anstieg > ERSTZUG_HALTEN ? null : `${aktion.typ}, danach ${ziehen.aktion.typ}: erwarteter Anstieg ${anstieg.toFixed(2)}`
  }
  const ende = schluss < 0 ? rest[rest.length - 1].nachher : rest[schluss].vorher
  // Gruppe und Aufgabe zählen bis zum Ende des Zuges, auch nach einer späteren Risiko-Karte (Prüfprotokoll Iteration 2, Saat 810'119).
  const zugende = rest[rest.length - 1].nachher
  const gruppe = gruppenzahl(zugende, sitz) > gruppenzahl(vorher, sitz)
  const aufgabe = zugende.spieler[sitz].erfuellteAufgaben.length > vorher.spieler[sitz].erfuellteAufgaben.length || (zugende.spieler[sitz].geheimeAufgabeErfuellt && !vorher.spieler[sitz].geheimeAufgabeErfuellt)
  const anstieg = wert(vorher, ende) - wert(vorher, vorher)
  return gruppe || aufgabe || anstieg > ERSTZUG_HALTEN ? null : `${JSON.stringify(aktion)}: ohne Gruppe und Aufgabe, Anstieg ${anstieg.toFixed(2)}`
}

const PARTIEN = Array.from({ length: 100 }, (_, nummer) => ({ saat: 810_000 + nummer, spielerzahl: 2 + ((810_000 + nummer) % 3) }))

describe('K4 Kriterium 2 im ersten Zug an Zufallsstarthänden: jeder Einsatz hat einen Grund', () => {
  it("K4.2: in den ersten Zügen der Saaten 810'000 bis 810'099 vollendet jeder Einsatz von Comeback-Karte, Risiko-Karte oder Korb eine Gruppe, erfüllt eine Aufgabe oder hebt die Bewertung um mehr als ERSTZUG_HALTEN", () => {
    let einsaetze = 0
    const ohneGrund: string[] = []
    for (const { saat, spielerzahl } of PARTIEN) {
      for (const zug of ersteZuege(saat, spielerzahl, (sitz) => (saat * 13 + sitz * 101 + 5) >>> 0)) {
        zug.forEach(({ aktion }, stelle) => {
          if (!setztAuslageEin(aktion)) return
          einsaetze += 1
          const grund = begruendung(zug, stelle)
          if (grund !== null) ohneGrund.push(`Saat ${saat}, Sitz ${zug[0].vorher.zug.spielerIndex}: ${grund}`)
        })
      }
    }
    expect(einsaetze, 'Testaufbau: in den Partien setzt sie im ersten Zug Karten ein').toBeGreaterThan(0)
    expect(ohneGrund, 'K4.2: Einsätze im ersten Zug ohne Gruppe, Aufgabe oder Anstieg über ERSTZUG_HALTEN').toEqual([])
  }, 600_000)
})
