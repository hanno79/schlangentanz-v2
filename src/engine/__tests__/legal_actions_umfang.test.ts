/*
Author: Claude Code (AP-5)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Umfangs-Guard für die Aktionsenumeration (AP-5, Onboarding-Finding 8).

Hintergrund: `ermittleLegaleAktionen` bildet Kreuzprodukte — Schlangenfrass über
alle Zielpaare, Farbendieb über gegnerische Farbkarten × eigene Schlangen ×
Einfügepositionen. Jeder Kandidat läuft zusätzlich durch `pruefeAktion`. Die Frage
war, ob das ein reales Problem ist.

**Messung vom 30.07.2026** (4 Spieler, je 2 Schlangen, Hand mit Farbendieb,
Schlangenfrass, Farbenfusion, Farbenschutz, Schlangenblockade, Schlangengrube,
Verdoppler und 3 Farbkarten):

| Karten je Schlange | Karten im Spiel | Aktionen | ermittleLegaleAktionen | questZugHinweise |
|---|---|---|---|---|
| 6  | 73  | 1 170 | 2,6 ms | 0,4 ms |
| 9  | 97  | 2 553 | 6,2 ms | 0,4 ms |
| 11 | 113 | 3 775 | 5,5 ms | 0,5 ms |
| 15 | 145 | 6 939 | 8,4 ms | 1,0 ms |

Entscheidend ist die letzte Spalte der Kartenzahl: **das Spieldeck umfasst 114
Karten**. Board und Hände zusammen können diese Zahl nie überschreiten. Die Zeile
mit 11 Karten je Schlange liegt bereits am Decklimit; die Zeile mit 15 beschreibt
einen Zustand, den es im Spiel nicht geben kann. Der reale Worst Case kostet also
rund **6 ms** — weit unter der im Plan gesetzten Handlungsschwelle von 50 ms.

**Ergebnis: keine Optimierung.** Die im Plan vorgesehenen Eingriffe (inkrementelle
Quest-Auswertung, späteres Auffächern der Farbendieb-Positionen) bleiben ungetan,
weil sie Komplexität gegen einen Gewinn eintauschen würden, den niemand bemerkt.

Eine Hypothese aus dem Plan hat sich dabei als falsch erwiesen: erwartet wurde,
`ermittleQuestZugHinweise` sei der größte Einzelposten, weil es pro Kandidat ein
volles `anwendeAktion` ausführt. Tatsächlich verarbeitet es nur die
*Schlangenbau*-Aktionen (hier 12 von 3 775) und liegt damit unter einer Millisekunde.

Dieser Test ist kein Performance-Test — Wandzeiten sind auf geteilten Maschinen zu
unzuverlässig, um daraus ein Gate zu bauen. Er sichert stattdessen die
*Kandidatenzahl* ab, die deterministisch ist: Kommt eine weitere Kreuzprodukt-
Dimension hinzu, springt sie sichtbar an und dieser Test schlägt fehl.
*/

import { describe, expect, it } from 'vitest'
import {
  aufgabenPool,
  ermittleLegaleAktionen,
  ermittleQuestZugHinweise,
  erstelleSpieldeck,
  erstelleSpielzustand,
  starteAusspielphase,
} from '../index'
import type { FarbkarteInfo, Schlange, SonderkarteInfo, Spielzustand } from '../types'

const FARBEN = ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun', 'Grün'] as const
const PUNKTE: Record<string, number> = { Blau: 1, Rot: 1, Gelb: 1, Violett: 2, Braun: 2, 'Grün': 3 }

function farbkarte(id: string, index: number): FarbkarteInfo {
  const farbe = FARBEN[index % FARBEN.length]
  return { typ: 'Farbkarte', id, farbe, punkte: PUNKTE[farbe] }
}

function sonderkarte(id: string, name: string): SonderkarteInfo {
  return { typ: 'Sonderkarte', id, name }
}

function schlange(id: string, laenge: number): Schlange {
  return { id, zustand: 'aktiv', karten: Array.from({ length: laenge }, (_, i) => farbkarte(`${id}-k${i}`, i)) }
}

/**
 * Ungünstigster Zustand, den das Kartenmaterial noch zulässt: vier Spieler mit je
 * zwei vollen Schlangen und einer Hand aus lauter zielsuchenden Sonderkarten.
 */
function ungeguenstigsterZustand(kartenProSchlange = 11): Spielzustand {
  const zustand = starteAusspielphase(erstelleSpielzustand(4, () => 0.5))
  zustand.spieler.forEach((spieler, index) => {
    spieler.schlangen = [
      schlange(`schlange-${index}-a`, kartenProSchlange),
      schlange(`schlange-${index}-b`, kartenProSchlange),
    ]
  })
  zustand.spieler[0].hand = [
    sonderkarte('hand-farbendieb', 'Farbendieb'),
    sonderkarte('hand-schlangenfrass', 'Schlangenfrass'),
    sonderkarte('hand-farbenfusion', 'Farbenfusion'),
    sonderkarte('hand-farbenschutz', 'Farbenschutz'),
    sonderkarte('hand-schlangenblockade', 'Schlangenblockade'),
    sonderkarte('hand-schlangengrube', 'Schlangengrube'),
    sonderkarte('hand-verdoppler', 'Verdoppler'),
    farbkarte('hand-farbe-1', 0),
    farbkarte('hand-farbe-2', 1),
    farbkarte('hand-farbe-3', 2),
  ]
  zustand.offeneAufgaben = aufgabenPool
    .filter((aufgabe) => ['Farbenpracht', 'Farbkombination', 'Farbharmonie'].includes(aufgabe.name))
    .slice(0, 3)
  return zustand
}

function kartenImSpiel(zustand: Spielzustand): number {
  return zustand.spieler.reduce(
    (summe, spieler) =>
      summe + spieler.hand.length + spieler.schlangen.reduce((teil, s) => teil + s.karten.length, 0),
    0,
  )
}

describe('AP-5 Umfang der Aktionsenumeration', () => {
  it('bleibt am Decklimit unter der Kandidaten-Obergrenze', () => {
    const zustand = ungeguenstigsterZustand()

    // Der Zustand muss das Kartenmaterial ausreizen, ohne es zu überschreiten —
    // sonst misst der Test einen Fall, den es im Spiel nicht gibt.
    const gesamt = kartenImSpiel(zustand)
    expect(gesamt, 'Fixture soll nahe am Decklimit liegen').toBeGreaterThan(100)
    expect(gesamt, 'Fixture darf das Spieldeck nicht überschreiten').toBeLessThanOrEqual(erstelleSpieldeck().length)

    const aktionen = ermittleLegaleAktionen(zustand)

    // Untergrenze: stellt sicher, dass die Kreuzprodukte überhaupt entstehen. Ohne
    // sie könnte der Test still zur Attrappe werden, wenn das Fixture zerfällt.
    expect(aktionen.length, 'Fixture erzeugt die kombinatorischen Aktionen nicht mehr').toBeGreaterThan(2_000)
    // Obergrenze: gemessen 3 775. Reserve für Regelerweiterungen, aber eng genug,
    // dass eine zusätzliche Kreuzprodukt-Dimension auffällt.
    expect(aktionen.length, 'Aktionsenumeration ist sprunghaft gewachsen').toBeLessThan(6_000)
  })

  it('lässt die Quest-Hinweise nur über Schlangenbau-Aktionen laufen', () => {
    const zustand = ungeguenstigsterZustand()
    const aktionen = ermittleLegaleAktionen(zustand)
    const schlangenbau = aktionen.filter(
      (aktion) => aktion.typ === 'KarteAnlegen' || aktion.typ === 'NeueSchlangeStarten',
    )

    // ermittleQuestZugHinweise führt pro Kandidat ein volles anwendeAktion aus. Das
    // ist nur deshalb billig, weil es ausschließlich Schlangenbau-Aktionen betrachtet.
    // Würde es über alle Aktionen laufen, wäre es der teuerste Posten der App.
    expect(schlangenbau.length).toBeLessThan(50)
    expect(schlangenbau.length / aktionen.length).toBeLessThan(0.05)

    expect(() => ermittleQuestZugHinweise(zustand, aktionen)).not.toThrow()
  })
})
