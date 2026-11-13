import type { AufgabenkarteInfo, Spielzustand } from '../engine'
import { baukasten } from '../engine/testing/szenario'
import type { Baukasten } from '../engine/testing/szenario'
import type { Szenario } from './szenarien'

/*
Szenarien zur Wertung (E10). Die Schlangen sind die Rechenbeispiele der Website
(A11, A7.3, A7.7) und die Grenzfälle mit Jokern; das Material reicht nicht für
alle Beispiele in einer Partie, deshalb sind es drei Szenarien. Am Tisch steht je
Spieler die Aufschlüsselung: Gruppen je Schlange, Farbe jedes Jokers,
Vielfaltbonus, Kette, Aufgaben und Summe.
*/

/** Nimmt die Aufgabe `name` aus der Auslage, dem Stapel oder einer geheimen Hand; die Lücke füllt der Stapel. */
function nimmAufgabe(zustand: Spielzustand, name: string): AufgabenkarteInfo {
  for (const liste of [zustand.offeneAufgaben, zustand.aufgabenStapel]) {
    const index = liste.findIndex((aufgabe) => aufgabe.name === name)
    if (index >= 0) {
      const [aufgabe] = liste.splice(index, 1)
      if (liste === zustand.offeneAufgaben && zustand.aufgabenStapel.length > 0) liste.push(zustand.aufgabenStapel.shift() as AufgabenkarteInfo)
      return aufgabe
    }
  }
  throw new Error(`Szenario: Die Aufgabe ${name} liegt nicht frei.`)
}

/** X1/X2 prüfen Aufgaben erst später; hier werden sie als erfüllt gesetzt, damit die Wertung sie zeigt. */
function mitAufgaben(bau: Baukasten, offen: Array<[number, string]>, geheim: Array<[number, string]>): Baukasten {
  return bau.aendere((zustand) => {
    for (const [spieler, name] of offen) zustand.spieler[spieler].erfuellteAufgaben.push(nimmAufgabe(zustand, name))
    for (const [spieler, name] of geheim) {
      const neu = nimmAufgabe(zustand, name)
      const alt = zustand.spieler[spieler].geheimeAufgabe
      if (alt !== null) zustand.aufgabenStapel.push(alt)
      zustand.spieler[spieler].geheimeAufgabe = neu
      zustand.spieler[spieler].geheimeAufgabeErfuellt = true
    }
  })
}

export const WERTUNGS_SZENARIEN: readonly Szenario[] = [
  {
    name: 'wertung-beispiele',
    beschreibung:
      'Rechenbeispiele der Website als Schlangen, vier Spieler mit Erweiterung, Partie beendet. Spieler 1: A11 Beispiel 2 (Blau, Blau, Fusion auf zwei Blau, Violett, Violett) und A7.7 Beispiel 1 (Blau, Blau, Fusion auf zwei Gelb). KI-Gegner 1: A11 Rot-Rot-Rot-Blau-Rot-Rot-Rot-Rot. KI-Gegner 2: beide Vielfalt-Beispiele aus A11. KI-Gegner 3: A7.3 Beispiele 1 und 3.',
    erwartet:
      'Endwertung: Spieler 1 Schlangen 6 (Fusion als Violett) und 4 (Fusion als Blau), Summe 10. KI-Gegner 1: Rot 3 + 4 = 7, Kette 4, Kettenbonus 5, Summe 12. KI-Gegner 2: 15 (Rot, Violett, Braun, Vielfalt 2) und 11 (Regenbogenschlange als Rot, Vielfalt 2), höchster Bonus 2, Summe 28. KI-Gegner 3: 2 (Regenbogenschlange als Blau) und 4 (Regenbogenschlange als Braun), Summe 6. Gewonnen hat KI-Gegner 2 mit 28.',
    erzeuge: () =>
      baukasten({ spielerzahl: 4, erweiterung: true })
        .schlange(0, ['Blau', 'Blau', { fusion: ['Blau', 'Blau'] }, 'Violett', 'Violett'])
        .schlange(0, ['Blau', 'Blau', { fusion: ['Gelb', 'Gelb'] }])
        .schlange(1, ['Rot', 'Rot', 'Rot', 'Blau', 'Rot', 'Rot', 'Rot', 'Rot'])
        .schlange(2, ['Rot', 'Rot', 'Rot', 'Violett', 'Violett', 'Violett', 'Braun', 'Braun', 'Braun'])
        .schlange(2, ['Blau', 'Blau', 'Blau', 'Rot', 'Regenbogenschlange', 'Rot', 'Violett', 'Violett', 'Violett'])
        .schlange(3, ['Blau', 'Blau', 'Regenbogenschlange'])
        .schlange(3, ['Rot', 'Rot', 'Regenbogenschlange', 'Braun', 'Braun'])
        .beendet(0)
        .zustand(),
  },
  {
    name: 'wertung-beispiele-kette',
    beschreibung:
      'Längste Farbkette nach A11 und D24, drei Spieler ohne Erweiterung, Partie beendet. Spieler 1: Rot-Rot-Rot-Regenbogenschlange-Rot-Rot-Rot-Rot. KI-Gegner 1: A11 Beispiel 1 (Blau³, Rot⁴). KI-Gegner 2: A7.7 Beispiel 2 (Blau, Blau, Fusion auf zwei Gelb, Rot, Rot).',
    erwartet:
      'Spieler 1: 7 Gruppenpunkte, Kette 4 (die Regenbogenschlange unterbricht), Kettenbonus 5, Summe 12. KI-Gegner 1: 3 + 4 = 7, Kette 4, ebenfalls Kettenbonus 5, Summe 12. KI-Gegner 2: Fusion als Blau (gleich gut wie Rot, feste Reihenfolge), 4 Punkte, keine Kette ab 3, Summe 4. Gleichstand: Spieler 1 und KI-Gegner 1 gewinnen beide mit 12 (D22). Kein Vielfaltbonus, keine Aufgaben (ohne Erweiterung).',
    erzeuge: () =>
      baukasten({ spielerzahl: 3, erweiterung: false })
        .schlange(0, ['Rot', 'Rot', 'Rot', 'Regenbogenschlange', 'Rot', 'Rot', 'Rot', 'Rot'])
        .schlange(1, ['Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Rot', 'Rot'])
        .schlange(2, ['Blau', 'Blau', { fusion: ['Gelb', 'Gelb'] }, 'Rot', 'Rot'])
        .beendet(2)
        .zustand(),
  },
  {
    name: 'wertung-joker',
    beschreibung:
      'Grenzfälle mit Jokern, vier Spieler mit Erweiterung, Partie läuft. Spieler 1: Blau³-Gelb-Blau-Blau-Regenbogenschlange-Rot-Rot und Blau-Blau-Fusion(Gelb)-Rot-Rot, Aufgabe Farbkombination als erfüllt gesetzt. KI-Gegner 1: Gelb-Gelb-Regenbogenschlange-Gelb-Gelb und Grün-Fusion(Grün)-Regenbogenschlange-Violett-Violett, geheime Aufgabe Gelber Schatz als erfüllt gesetzt. KI-Gegner 2: keine Schlange. KI-Gegner 3: eine Schlange mit allen 6 Farben je dreimal, eine mit 5 Farben.',
    erwartet:
      'Spieler 1: Regenbogenschlange als Rot (gleich viele Gruppenpunkte wie Blau, aber eine zweite Farbe: Vielfalt 1), Fusion als Blau (gleich gut wie Rot, feste Reihenfolge); Gruppen 9, Kette 3 mit Bonus 5, Aufgabe 5, Endwertung 20. KI-Gegner 1: Regenbogenschlange verbindet zu Gelb×5 (4 Punkte), Fusion und Regenbogenschlange als Violett (10 statt 9 als Grün), Gruppen 14, geheime Aufgabe 5, Endwertung 19. KI-Gegner 2: 0. KI-Gegner 3: 30 + 21 = 51, Vielfalt je Schlange 4 (6 und 5 Farben), Kette 3 mit Bonus 5 (Gleichstand mit Spieler 1), Endwertung 60. Zwischenstand aus Sicht von Spieler 1: 15, 14 (ohne die geheime Aufgabe), 0, 55, ohne Kettenbonus.',
    erzeuge: () =>
      mitAufgaben(
        baukasten({ spielerzahl: 4, erweiterung: true })
          .schlange(0, ['Blau', 'Blau', 'Blau', 'Gelb', 'Blau', 'Blau', 'Regenbogenschlange', 'Rot', 'Rot'])
          .schlange(0, ['Blau', 'Blau', { fusion: ['Gelb', 'Gelb'] }, 'Rot', 'Rot'])
          .schlange(1, ['Gelb', 'Gelb', 'Regenbogenschlange', 'Gelb', 'Gelb'])
          .schlange(1, ['Grün', { fusion: ['Grün', 'Grün'] }, 'Regenbogenschlange', 'Violett', 'Violett'])
          .schlange(3, ['Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Rot', 'Gelb', 'Gelb', 'Gelb', 'Violett', 'Violett', 'Violett', 'Braun', 'Braun', 'Braun', 'Grün', 'Grün', 'Grün'])
          .schlange(3, ['Blau', 'Blau', 'Blau', 'Rot', 'Rot', 'Rot', 'Gelb', 'Gelb', 'Gelb', 'Violett', 'Violett', 'Violett', 'Braun', 'Braun', 'Braun']),
        [[0, 'Farbkombination']],
        [[1, 'Gelber Schatz']],
      )
        .haendeAuffuellen()
        .amZug(0)
        .zustand(),
  },
]
