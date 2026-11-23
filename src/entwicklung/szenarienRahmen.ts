import { trageEntscheidungenEin } from '../engine/entscheidungsregister'
import { baukasten } from '../engine/testing/szenario'
import { TESTENTSCHEIDUNGEN, verlangeTestwahl } from '../engine/testing/testentscheidung'
import { erzeugeZufall } from '../engine/testing/zufall'
import { meldeZugerweiterung } from '../engine/zuggrenzen'
import type { Szenario } from './szenarien'

/*
Szenarien für den Rahmen aus X3 (Zusatzaktionen und Entscheidungen). Comeback,
Risiko-Belohnung und Schlangenkorb kommen erst mit X4 bis X6; die Szenarien
zeigen den Rahmen deshalb mit Test-Zusatzaktionen, die der Baukasten im Rahmen
anmeldet, und mit den Test-Entscheidungen aus
`engine/testing/testentscheidung.ts`. Damit der Tisch sie kennt, trägt diese
Datei sie ins Entscheidungsregister ein; sie gehört nur zum Entwicklertisch und
steht nicht im Produktionsbündel.

Der Ablauf ahmt den Misserfolg einer Risiko-Aktion nach (A8.2, D52): Die
oberste Karte ist offen aufgedeckt, Spieler 1 wählt frei einen Gegner, und der
wählt, ob er die aufgedeckte Karte nimmt oder die oberste Stapelkarte zieht.
*/

trageEntscheidungenEin(TESTENTSCHEIDUNGEN)

/**
 * Drei Spieler, Spieler 1 am Zug; die Test-Karte (eine Regenbogenschlange) liegt
 * auf seinem Ablagestapel, Violett ist aufgedeckt. KI-Gegner 2 hält schon 6 Karten,
 * wie nach einer früheren Ersatzbelohnung (A8.2).
 */
function mitOffenerWahl(stapel: number | null): Szenario['erzeuge'] {
  return () => {
    const bau = baukasten({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(301) })
      .hand(0, ['Blau', 'Rot', 'Gelb', 'Grün'])
      .hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
      .hand(2, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun', 'Braun'])
      .ablage(0, ['Regenbogenschlange'])
      .stapelOben(['Violett'])
    if (stapel !== null) bau.stapelBehalten(stapel)
    return bau
      // Die Test-Karte liegt zuunterst; `stapelBehalten` legt den übrigen Stapel darauf.
      .aendere((zustand) => verlangeTestwahl(zustand, 0, zustand.spieler[0].ablagestapel[0].id))
      .zustand()
  }
}

export const RAHMEN_SZENARIEN: readonly Szenario[] = [
  {
    name: 'zusatzaktionen-test',
    beschreibung:
      'X3, A8.1, D46, D47 (Test-Zusatzaktionen): Zwei Spieler. Spieler 1 hat zwei Zusatzaktionen für eine Farb- oder Sonderkarte, angemeldet wie von einer Comeback-Karte. Er hält Blau, Rot, Gelb, zwei Farbenfusionen und einen Verdoppler und hat die Schlange Grün, Grün, Braun, Braun.',
    erwartet:
      'Lage: Zusatzaktionen „Comeback: Farbkarte/Sonderkarte“ zweimal, „in dieser Runde: Comeback“. Der Verdoppler hat nur „SonderkarteWirkungslosAblegen“ (D47). Spieler 1 legt Blau, Rot und Gelb nacheinander an (drei Farbkarten, D46) und spielt eine Farbenfusion auf Grün-Grün; danach bleibt für die zweite Fusion und den Verdoppler kein Platz mehr, nur „Zug beenden“. Spielt er die Fusion zuerst, hat die zweite Fusion danach nur „SonderkarteWirkungslosAblegen“ (D46, D56). Nach „Zug beenden“ zieht er nach und KI-Gegner 1 beginnt ohne Zusatzaktionen.',
    erzeuge: () =>
      baukasten({ spielerzahl: 2, erweiterung: true, zufall: erzeugeZufall(302) })
        .hand(0, ['Blau', 'Rot', 'Gelb', 'Farbenfusion', 'Farbenfusion', 'Verdoppler'])
        .hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
        .schlange(0, ['Grün', 'Grün', 'Braun', 'Braun'])
        .aendere((zustand) => {
          const zusatz = { quelle: 'Comeback', erlaubt: ['Farbkarte', 'Sonderkarte'], nurKarten: null }
          meldeZugerweiterung(zustand.zug, 'Comeback', [zusatz, zusatz])
        })
        .zustand(),
  },
  {
    name: 'entscheidung-gegner',
    beschreibung:
      'X3, A8.2, D52 (Test-Entscheidung): Drei Spieler; KI-Gegner 2 hält schon 6 Karten. Spieler 1 ist am Zug; seine Test-Karte hat die oberste Karte (Violett) offen aufgedeckt und verlangt, dass er einen Gegner wählt. Der gewählte Gegner entscheidet danach, ob er die aufgedeckte Karte nimmt oder die oberste Stapelkarte zieht.',
    erwartet:
      'Lage: Entscheidung offen, Spieler 1 entscheidet; zwei Knöpfe „Entscheiden“ für Spieler 1 (spieler-2, spieler-3), sonst keiner. Wahl spieler-3: Ereignisse Entschieden und EntscheidungVerlangt, jetzt entscheidet KI-Gegner 2 mit den Knöpfen „aufgedeckte“ und „stapel“; am Zug bleibt Spieler 1. Wahl „aufgedeckte“: Violett liegt auf der Hand von KI-Gegner 2 (7 Karten), KartenVersetzt nennt nur „verdeckte Karte“, die Entscheidung ist zu, Spieler 1 spielt weiter. Er spielt eine Karte und beendet den Zug; KI-Gegner 1 und 2 spielen; KI-Gegner 2 zieht zu Zugbeginn nichts, spielt eine Karte und wirft erst an seinem eigenen Zugende eine überzählige ab (AbwerfenVerlangt, A8.2). Speichern und Laden mitten in der Entscheidung: Die Invariante „Der Spielstand übersteht Speichern und Laden unverändert“ ist in jedem Schritt erfüllt; ein echtes Neuladen mitten darin geht unter /spiel.',
    erzeuge: mitOffenerWahl(null),
  },
  {
    name: 'entscheidung-letzte-karte',
    beschreibung:
      'X3, A10, D55 (Test-Entscheidung): wie „entscheidung-gegner“, aber nach dem Aufdecken liegt nur noch eine Karte im Nachziehstapel.',
    erwartet:
      'Spieler 1 wählt einen Gegner, der wählt „stapel“: Er zieht die letzte Karte, Violett kommt auf den Ablagestapel von Spieler 1. Ereignisse Entschieden, KartenVersetzt, SchlussrundeBegonnen „ausgelöst von Spieler 1“, nicht vom Gegner (D55). Partiephase Schlussrunde; Spieler 1 spielt seinen Zug zu Ende, danach hat jeder Gegner genau einen Zug ohne Nachziehen, dann ist die Partie beendet.',
    erzeuge: mitOffenerWahl(2),
  },
]
