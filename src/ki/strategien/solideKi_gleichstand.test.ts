// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { anwendeAktion, berechneEndwertung, ermittleAktionen, pruefeInvarianten } from '../../engine'
import type { SpielAktion, Spielzustand } from '../../engine'
import { sichtFuer } from '../sicht'
import { ersterTeilzug, gruppenzahl, ladeStellung, mitZweiterKarte, nachDurchlassen } from '../__tests__/stellungen'
import { bewerte } from './bewertung'

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

Seit X6 wirkt der Schlangenkorb, den die KI in beiden Stellungen mit Erweiterung auf
der Hand hält; dort war er noch ohne Wirkung. Wie sie ihn klug nutzt, gehört zu K4
(Kriterium 2). Für den Korb gilt deshalb die Voraussetzung „keine Karte besser als
Halten“ nicht, und in `x5-merge-k21-erweiterung.json` spielt sie jetzt den Korb statt
der Blockade; die Erklärung des Rückstands von 0.1 trägt dort nur noch die Stellung
ohne Erweiterung. Was K2.1 verlangt, gilt in beiden weiter.
*/

function stellung(datei: string): Spielzustand {
  const zustand = ladeStellung(datei)
  expect(pruefeInvarianten(zustand).filter((befund) => befund.verletzt), `Testaufbau: ${datei} erfüllt jede Invariante`).toEqual([])
  return zustand
}

const endwertung = (zustand: Spielzustand, sitz: number) => berechneEndwertung(zustand).spieler[sitz].summe
const wert = (zustand: Spielzustand, sitz: number) => bewerte(sichtFuer(zustand, sitz))

describe('K2b: bei Gleichstand gewinnt der Zug, der eine Gruppe vollendet oder sicher Punkte bringt', () => {
  it('K2b, K2.1 (X5, Saat 7154, Schlussrunde mit Erweiterung): keine Karte ist besser bewertet als Halten, viele Schlangenfrass gleich, und jeder davon löst eine erfüllte offene Aufgabe ein; sie beendet den Zug nicht', () => {
    const start = stellung('saat-7154-x5-schlussrunde.json')
    const [halten, punkte] = [wert(start, 0), endwertung(start, 0)]
    // Ohne den Schlangenkorb: Ihn klug zu nutzen gehört zu K4, Kriterium 2 (X6).
    const unterschiede = ermittleAktionen(start)
      .filter((aktion) => aktion.typ !== 'ZugBeenden' && aktion.typ !== 'SchlangenkorbSpielen')
      .map((aktion) => {
        const danach = nachDurchlassen(start, aktion, 0)
        return { aktion, danach, unterschied: wert(danach, 0) - halten }
      })
    expect(Math.max(...unterschiede.map(({ unterschied }) => unterschied)), 'Testaufbau: keine Karte ist besser bewertet als Halten').toBeLessThan(1e-9)
    const gleich = unterschiede.filter(({ aktion, unterschied }) => aktion.typ === 'SchlangenfrassSpielen' && Math.abs(unterschied) < 1e-9)
    expect(gleich.length, 'Testaufbau: mehr gleich bewertete Schlangenfrass, als die Vorauswahl durchrechnet (16)').toBeGreaterThan(16)
    for (const { aktion, danach } of gleich) {
      expect(endwertung(danach, 0) - punkte, `A9: ${JSON.stringify(aktion)} löst „Farbharmonie“ (10) ein`).toBeGreaterThanOrEqual(10)
    }
    for (const saat of [1, 2, 3, 4, 5]) {
      const { aktionen, ende } = ersterTeilzug(start, 0, saat)
      expect(aktionen[0].typ, `K2b: Saat ${saat}, gespielt ${JSON.stringify(aktionen)}`).not.toBe('ZugBeenden')
      expect(endwertung(ende, 0), `K2b: Saat ${saat}, sichere Punkte nach dem Zug`).toBeGreaterThanOrEqual(punkte + 10)
      expect(wert(ende, 0), `K2b: Saat ${saat}, nicht schlechter bewertet als Halten`).toBeGreaterThanOrEqual(halten - 1e-9)
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
    expect([gruppenzahl(ohneVollendung, 0), gruppenzahl(vollendet, 0)], 'Testaufbau: nur die zweite vollendet eine Gruppe').toEqual([gruppenzahl(start, 0), gruppenzahl(start, 0) + 1])

    for (const saat of [1, 2, 3]) {
      const { aktionen, ende } = ersterTeilzug(start, 0, saat)
      const [bewertung, gruppenNachher] = [wert(ende, 0), gruppenzahl(ende, 0)]
      const zahlen = `Saat ${saat}: Bewertung ${bewertung.toFixed(2)}, Gruppen ${gruppenNachher} statt ${gruppenzahl(start, 0)}, gespielt ${JSON.stringify(aktionen)}`
      expect(gruppenNachher, `K2b: ${zahlen}`).toBeGreaterThan(gruppenzahl(start, 0))
      expect(bewertung, `K2b: nicht schlechter bewertet als die bisherige Wahl, ${zahlen}`).toBeGreaterThanOrEqual(42.7 - 1e-9)
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
  ])('K2b, K2.1 (%s, %s): sie plant %s, strikt besser als jede Vollendung samt zweiter Karte (%s); der Rückstand von 0.1 im Partietest kam aus der Abwehr des Gegners (%s)', (datei, _quelle, geplant, vollendung, abgewehrt) => {
    const start = stellung(datei)
    const { aktionen, ende } = ersterTeilzug(start, 0, 1)
    expect(aktionen.map((aktion) => aktion.typ), 'K2b: Farbkarte, Blockade beim Gegner, Zug beenden').toEqual(['FarbkarteLegen', 'BlockadeLegen', 'ZugBeenden'])
    expect(wert(mitAbwehr(start, aktionen), 0), 'A6: derselbe Zug, der Gegner wehrt die Blockade mit Farbenschutz ab').toBeCloseTo(abgewehrt, 9)
    // Wie im Partietest zu K2.1: jede Karte, die eine Gruppe vollendet, samt jeder zweiten Karte desselben Zuges.
    const vollendungen = ermittleAktionen(start)
      .filter((aktion) => aktion.typ !== 'ZugBeenden' && aktion.typ !== 'UeberhandAbwerfen')
      .map((aktion) => nachDurchlassen(start, aktion, 0))
      .filter((danach) => gruppenzahl(danach, 0) > gruppenzahl(start, 0))
    const beste = Math.max(...vollendungen.flatMap((danach) => mitZweiterKarte(danach, 0)).map((danach) => wert(danach, 0)))
    const geplanterWert = wert(ende, 0)
    expect(geplanterWert, 'K2b: der geplante Zug, der Gegner lässt durch').toBeCloseTo(geplant, 9)
    expect(beste, 'K2b: die beste Vollendung samt zweiter Karte').toBeCloseTo(vollendung, 9)
    expect(geplanterWert, 'K2.1: ihr Zug ist strikt besser bewertet').toBeGreaterThan(beste + 1e-9)
  })

  it('K2.1 (x5-merge-k21-erweiterung.json, mit Erweiterung): mit dem Schlangenkorb, der seit X6 wirkt, ist ihr Zug strikt besser bewertet als jede Vollendung samt zweiter Karte', () => {
    const start = stellung('x5-merge-k21-erweiterung.json')
    const { aktionen, ende } = ersterTeilzug(start, 0, 1)
    expect(aktionen.map((aktion) => aktion.typ), 'Testaufbau: sie spielt jetzt den Korb, nicht mehr die Blockade').toContain('SchlangenkorbSpielen')
    const vollendungen = ermittleAktionen(start)
      .filter((aktion) => aktion.typ !== 'ZugBeenden' && aktion.typ !== 'UeberhandAbwerfen')
      .map((aktion) => nachDurchlassen(start, aktion, 0))
      .filter((danach) => gruppenzahl(danach, 0) > gruppenzahl(start, 0))
    const beste = Math.max(...vollendungen.flatMap((danach) => mitZweiterKarte(danach, 0)).map((danach) => wert(danach, 0)))
    expect(wert(ende, 0), `K2.1: ihr Zug ${JSON.stringify(aktionen.map((aktion) => aktion.typ))} gegen die beste Vollendung ${beste.toFixed(2)}`).toBeGreaterThan(beste + 1e-9)
  })
})
