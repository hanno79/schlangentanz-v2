// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, deserialisiere, ermittleAktionen, erzeugeZufall, pruefeInvarianten, werteSchlangen } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { sichtFuer } from '../sicht'
import { nachDurchlassen } from '../__tests__/stellungen'
import { bewerte } from './bewertung'
import { planeZug } from './zugsuche'

/*
K2b, Vollenden bei Gleichstand (Plan K2, Kriterium 1, und K3, Kriterium 2): Sind
zwei Züge gleich bewertet, entscheidet nicht die Reihenfolge der Vorauswahl,
sondern zuerst die Zahl der eigenen Gruppen, dann die Punkte, die die Sicht schon
sicher zeigt; „Zug beenden“ gewinnt nur, wenn keine Karte etwas davon hebt.

Die Stellungen stammen aus Partien, gespeichert, damit eine spätere Änderung der
KI sie nicht verschiebt:
- `saat-7154-x5-schlussrunde.json`: Partie 7154 mit Erweiterung (Prüfprotokoll K2,
  Iteration 2) auf dem Branch von X5, die solide KI an Stelle 0 im letzten Zug. Weil
  der Stand vor X4 entstand, ist `zug.comebackBedingung` nachgetragen: falsch, ihre
  längste Schlange ist die längste am Tisch (A8.1, D48).
- `saat-651-zug-17.json`: Partie 651 ohne Erweiterung, zu zweit, die solide KI
  (Saat 1) an Stelle 0 gegen die Zufalls-KI (Saat 101), Beginn ihres 18. Zuges.
- `saat-7154-basis-zug-23.json`: Partie 7154 ohne Erweiterung mit den Saaten des
  Prüfprotokolls (KI 7154 × 13 + 3, Gegner 7154 × 7 + 12), Beginn ihres 24. Zuges.
- `x5-merge-k21-erweiterung.json`: die Stellung, in der der Partietest zu K2.1
  (Saaten ab 600, mit Erweiterung) auf dem Branch von X5 nach dem Merge von
  `neuaufbau` 02038f4a rot wurde, Beginn ihres Zuges, vom Umsetzer von X5 gespeichert.

Die beiden Rückstände von 0.1 (X6: 39.50 gegen 39.60, X5: 27.30 gegen 27.40) sind
weder ein Gleichstand noch ein Fehler der Bewertung: Die KI plant beide Male eine
Blockade beim Gegner und damit strikt mehr als jede Vollendung; der Gegner wehrt die
Blockade in der Partie mit Farbenschutz ab, und das sieht sie bei der Wahl nicht
(K2.7). Der Partietest misst deshalb ihren Zug, wie sie ihn wählt (`geplantesEnde`).
*/

function stellung(datei: string): Spielzustand {
  const zustand = deserialisiere(readFileSync(join(__dirname, '../__tests__/stellungen', datei), 'utf8'))
  expect(pruefeInvarianten(zustand).filter((befund) => befund.verletzt), `Testaufbau: ${datei} erfüllt jede Invariante`).toEqual([])
  return zustand
}

function gruppen(zustand: Spielzustand, sitz: number): number {
  return werteSchlangen(zustand.spieler[sitz].schlangen, zustand.erweiterung).schlangen.reduce((summe, schlange) => summe + schlange.gruppen.length, 0)
}

const endwertung = (zustand: Spielzustand, sitz: number) => berechneEndwertung(zustand).spieler[sitz].summe
const wert = (zustand: Spielzustand, sitz: number) => bewerte(sichtFuer(zustand, sitz))

/** Der erste Teilzug der soliden KI an Stelle `sitz` bis „Zug beenden“, wie sie ihn plant: gefragte Gegner lassen durch. */
function ersterTeilzug(start: Spielzustand, sitz: number, saat: number): { aktionen: SpielAktion[]; ende: Spielzustand } {
  let zustand = start
  const aktionen: SpielAktion[] = []
  for (let schritt = 0; schritt < 10; schritt += 1) {
    const { aktion } = planeZug(sichtFuer(zustand, sitz), ermittleAktionen(zustand), erzeugeZufall(saat))
    aktionen.push(aktion)
    if (aktion.typ === 'ZugBeenden') return { aktionen, ende: zustand }
    zustand = nachDurchlassen(zustand, aktion, sitz)
  }
  throw new Error('Testaufbau: Der Teilzug endet nicht nach zehn Schritten.')
}

describe('K2b: bei Gleichstand gewinnt der Zug, der eine Gruppe vollendet oder sicher Punkte bringt', () => {
  it('K2b, K2.1 (X5, Saat 7154, Schlussrunde mit Erweiterung): keine Karte ist besser bewertet als Halten, viele Schlangenfrass gleich, und jeder davon löst eine erfüllte offene Aufgabe ein; sie beendet den Zug nicht', () => {
    const start = stellung('saat-7154-x5-schlussrunde.json')
    const karten = ermittleAktionen(start).filter((aktion) => aktion.typ !== 'ZugBeenden')
    const unterschiede = karten.map((aktion) => ({ aktion, danach: nachDurchlassen(start, aktion, 0) })).map((eintrag) => ({ ...eintrag, unterschied: wert(eintrag.danach, 0) - wert(start, 0) }))
    expect(Math.max(...unterschiede.map(({ unterschied }) => unterschied)), 'Testaufbau: keine Karte ist besser bewertet als Halten').toBeLessThan(1e-9)
    const gleich = unterschiede.filter(({ aktion, unterschied }) => aktion.typ === 'SchlangenfrassSpielen' && Math.abs(unterschied) < 1e-9)
    expect(gleich.length, 'Testaufbau: mehr gleich bewertete Schlangenfrass, als die Vorauswahl durchrechnet (16)').toBeGreaterThan(16)
    for (const { aktion, danach } of gleich) {
      expect(endwertung(danach, 0) - endwertung(start, 0), `A9: ${JSON.stringify(aktion)} löst „Farbharmonie“ (10) ein`).toBeGreaterThanOrEqual(10)
    }
    for (const saat of [1, 2, 3, 4, 5]) {
      const { aktionen, ende } = ersterTeilzug(start, 0, saat)
      expect(aktionen[0].typ, `K2b: Saat ${saat}, gespielt ${JSON.stringify(aktionen)}`).not.toBe('ZugBeenden')
      expect(endwertung(ende, 0), `K2b: Saat ${saat}, sichere Punkte nach dem Zug`).toBeGreaterThanOrEqual(endwertung(start, 0) + 10)
      expect(wert(ende, 0), `K2b: Saat ${saat}, nicht schlechter bewertet als Halten`).toBeGreaterThanOrEqual(wert(start, 0) - 1e-9)
    }
  })

  it('K2b, K2.1 (Saat 651, ohne Erweiterung): ihre beste Folge und eine Vollendung sind gleich bewertet (42.70); sie vollendet', () => {
    const start = stellung('saat-651-zug-17.json')
    const gruen = ermittleAktionen(start).find((aktion) => aktion.typ === 'FarbkarteLegen' && aktion.karteId === 'gruen-04' && aktion.ziel.art === 'schlange' && aktion.ziel.seite === 'anfang')
    if (gruen === undefined) throw new Error('Testaufbau: gruen-04 an den Anfang fehlt')
    const nachGruen = nachDurchlassen(start, gruen, 0)
    /** Die Stellung nach gruen-04 und dem Farbendieb auf `karteId` an Stelle `position` der Schlange 1. */
    const mitDieb = (karteId: string, position: number) => {
      const dieb = ermittleAktionen(nachGruen).find(
        (aktion) => aktion.typ === 'FarbendiebSpielen' && aktion.quelle.karteId === karteId && aktion.ziel.art === 'schlange' && aktion.ziel.schlangenId === 'schlange-1' && aktion.ziel.position === position,
      )
      if (dieb === undefined) throw new Error(`Testaufbau: Farbendieb auf ${karteId} an ${position} fehlt`)
      return nachDurchlassen(nachGruen, dieb, 0)
    }
    const ohneVollendung = mitDieb('gruen-05', 0)
    const vollendet = mitDieb('rot-09', 5)
    expect(wert(ohneVollendung, 0), 'Testaufbau: die bisherige Wahl').toBeCloseTo(42.7, 9)
    expect(wert(vollendet, 0) - wert(ohneVollendung, 0), 'Testaufbau: gleich bewertet').toBeCloseTo(0, 9)
    expect([gruppen(ohneVollendung, 0), gruppen(vollendet, 0)], 'Testaufbau: nur die zweite vollendet eine Gruppe').toEqual([gruppen(start, 0), gruppen(start, 0) + 1])

    for (const saat of [1, 2, 3]) {
      const { aktionen, ende } = ersterTeilzug(start, 0, saat)
      const zahlen = `Saat ${saat}: Bewertung ${wert(ende, 0).toFixed(2)}, Gruppen ${gruppen(ende, 0)} statt ${gruppen(start, 0)}, gespielt ${JSON.stringify(aktionen)}`
      expect(gruppen(ende, 0), `K2b: ${zahlen}`).toBeGreaterThan(gruppen(start, 0))
      expect(wert(ende, 0), `K2b: nicht schlechter bewertet als die bisherige Wahl, ${zahlen}`).toBeGreaterThanOrEqual(42.7 - 1e-9)
    }
  })

  /** Der Stand nach `aktionen` (ohne „Zug beenden“), wenn der Gefragte jede angesagte Karte mit Farbenschutz abwehrt (A6, A7.2). */
  function mitAbwehr(start: Spielzustand, aktionen: readonly SpielAktion[]): Spielzustand {
    let zustand = start
    for (const aktion of aktionen.filter((eintrag) => eintrag.typ !== 'ZugBeenden')) {
      zustand = anwendeAktion(zustand, aktion).zustand
      const abwehr = ermittleAktionen(zustand).find((angeboten) => angeboten.typ === 'Reagieren' && angeboten.farbenschutzId !== null)
      if (abwehr !== undefined) zustand = anwendeAktion(zustand, abwehr).zustand
    }
    return zustand
  }

  it.each([
    ['saat-7154-basis-zug-23.json', 'Saat 7154 ohne Erweiterung, Befund aus X6', 40, 39.6, 39.5],
    ['x5-merge-k21-erweiterung.json', 'Partietest K2.1 auf X5 nach dem Merge von 02038f4a, mit Erweiterung', 27.8, 27.4, 27.3],
  ])('K2b, K2.1 (%s, %s): sie plant %s, strikt besser als jede Vollendung samt zweiter Karte (%s); der Rückstand von 0.1 im Partietest kam aus der Abwehr des Gegners (%s)', (datei, _quelle, geplant, vollendung, abgewehrt) => {
    const start = stellung(datei)
    const { aktionen, ende } = ersterTeilzug(start, 0, 1)
    expect(aktionen.map((aktion) => aktion.typ), 'K2b: Farbkarte, Blockade beim Gegner, Zug beenden').toEqual(['FarbkarteLegen', 'BlockadeLegen', 'ZugBeenden'])
    expect(wert(ende, 0), 'K2b: der geplante Zug, der Gegner lässt durch').toBeCloseTo(geplant, 9)
    expect(wert(mitAbwehr(start, aktionen), 0), 'A6: derselbe Zug, der Gegner wehrt die Blockade mit Farbenschutz ab').toBeCloseTo(abgewehrt, 9)
    const vollendungen = ermittleAktionen(start)
      .filter((aktion) => aktion.typ !== 'ZugBeenden')
      .map((aktion) => nachDurchlassen(start, aktion, 0))
      .filter((danach) => gruppen(danach, 0) > gruppen(start, 0))
    const zweite = vollendungen.flatMap((danach) =>
      danach.zug.spielerIndex === 0 && danach.schwebend === null
        ? [danach, ...ermittleAktionen(danach).filter((aktion) => aktion.typ !== 'ZugBeenden').map((aktion) => nachDurchlassen(danach, aktion, 0))]
        : [danach],
    )
    const beste = Math.max(...zweite.map((danach) => wert(danach, 0)))
    expect(beste, 'K2b: die beste Vollendung samt zweiter Karte').toBeCloseTo(vollendung, 9)
    expect(wert(ende, 0), 'K2.1: ihr Zug ist strikt besser bewertet').toBeGreaterThan(beste + 1e-9)
  })
})
