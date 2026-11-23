import { baukasten } from '../engine/testing/szenario'
import type { Baukasten, Kartenwahl } from '../engine/testing/szenario'
import { erzeugeZufall } from '../engine/testing/zufall'
import type { Szenario } from './szenarien'

/*
Szenarien der Risiko-Belohnungs-Karten (A8.2, X5). Drei Spieler mit
Erweiterung; Spieler 1 ist am Zug und hat beide Risiko-Karten noch vor sich.
Was oben auf dem Nachziehstapel liegt, entscheidet über Erfolg und
Misserfolg; jede der vier Aktionen lässt sich daran ausprobieren.
*/

/** Spieler 1 hält Blau, Rot, Verdoppler und Farbenschutz, hat die Schlange Gelb, Grün und auf dem Ablagestapel Farbendieb und Braun. */
function tisch(saat: number, oben: Kartenwahl[]): Baukasten {
  return baukasten({ spielerzahl: 3, erweiterung: true, zufall: erzeugeZufall(saat) })
    .hand(0, ['Blau', 'Rot', 'Verdoppler', 'Farbenschutz'])
    .hand(1, ['Blau', 'Rot', 'Gelb', 'Grün', 'Braun'])
    .hand(2, ['Blau', 'Rot', 'Gelb', 'Violett', 'Braun'])
    .schlange(0, ['Gelb', 'Grün'])
    .schlange(1, ['Rot', 'Rot'])
    .ablage(0, ['Farbendieb', 'Braun'])
    .ablage(1, ['Verdoppler'])
    .stapelOben(oben)
}

export const RISIKO_SZENARIEN: readonly Szenario[] = [
  {
    name: 'risiko-erfolg',
    beschreibung:
      'A8.2, D50 bis D54 (Erfolg): Drei Spieler. Spieler 1 hält Blau, Rot, Verdoppler und Farbenschutz, hat die Schlange Gelb, Grün und auf dem Ablagestapel Farbendieb und Braun. Oben auf dem Nachziehstapel liegen Blau, Rot und Gelb, jede Farbkarte zählt 1 Punkt.',
    erwartet:
      'Sechs Knöpfe „RisikoKarteSpielen“ mit risiko-belohnung-01: Aktion 1, Aktion 2 je für Blau und Rot, Aktion 3 je für Gelb und Grün der eigenen Schlange, Aktion 4. Aktion 1: KartenVersetzt (Blau aufgedeckt), RisikoKarteGespielt „Erfolg“, KartenVersetzt (drei verdeckte Karten auf die Hand); Spieler 1 hält 7 Karten, risiko-belohnung-01 steht unter „aus dem Spiel“, und es gibt keinen Risiko-Knopf mehr (D50). Aktion 2 mit Rot: Blau kommt auf die Hand, dann Knöpfe „Entscheiden“ nur mit einer Farbkarte der Hand an Anfang oder Ende der eigenen Schlange, nie an die Schlange von KI-Gegner 1 (D52). Aktion 3 mit Gelb: Tausch-Knöpfe je Farbkarte der Hand und „kein Tausch“; Aktion 3 mit Grün (3 Punkte gegen 1): Knöpfe „davor“ und „dahinter“ (D53). Aktion 4: Knöpfe „Ablagestapel Farbendieb“, „Ablagestapel Braun“ und „stapel“ (D54). Nach jeder Risiko-Aktion bleiben Farbkarte und Sonderkarte des Zuges frei; der Verdoppler wirkt noch (D47).',
    erzeuge: () => tisch(501, ['Blau', 'Rot', 'Gelb']).zustand(),
  },
  {
    name: 'risiko-misserfolg',
    beschreibung:
      'A8.2, D51, D52, D54 (Misserfolg): wie „risiko-erfolg“, aber oben liegt Schlangenfrass, darunter Violett. KI-Gegner 1 hat einen Verdoppler auf dem Ablagestapel, KI-Gegner 2 einen leeren.',
    erwartet:
      'Jede Aktion scheitert (RisikoKarteGespielt „Misserfolg“). Aktion 1: Spieler 1 wählt KI-Gegner 1 oder 2, der Gewählte nimmt den Schlangenfrass auf die Hand und hält 6 Karten; zu Beginn seines Zuges zieht er nichts nach. Aktion 2 mit Blau: Der Schlangenfrass liegt auf dem Ablagestapel von Spieler 1; Spieler 1 wählt den Gegner, dann entscheidet dieser Gegner selbst mit „geplante“ (Blau von Spieler 1) oder „stapel“ (Violett); danach ist wieder Spieler 1 dran. Aktion 3: der Schlangenfrass auf den eigenen Ablagestapel, die Schlange bleibt. Aktion 4: Spieler 1 wählt den Gegner; KI-Gegner 1 hat „Ablagestapel Verdoppler“ und „stapel“, KI-Gegner 2 nur „stapel“. Die Knöpfe zeigen nie eine Handkarte eines anderen Spielers; nur Blau ist für Aktion 2 offen benannt.',
    erzeuge: () => tisch(502, ['Schlangenfrass', 'Violett']).zustand(),
  },
  {
    name: 'risiko-letzte-karte',
    beschreibung: 'A8.2, D55: wie „risiko-misserfolg“, aber im Nachziehstapel liegen nur Farbendieb und Violett.',
    erwartet:
      'Aktion 2 mit Blau, Spieler 1 wählt KI-Gegner 1, der wählt „stapel“ und zieht Violett, die letzte Karte. Ereignisse Entschieden, KartenVersetzt, SchlussrundeBegonnen „ausgelöst von Spieler 1“, nicht vom Gegner (D55). Spieler 1 spielt seinen Zug zu Ende, danach hat jeder Gegner genau einen Zug ohne Nachziehen, dann ist die Partie beendet.',
    erzeuge: () => tisch(503, ['Farbendieb', 'Violett']).stapelBehalten(2).zustand(),
  },
  {
    name: 'risiko-schlussrunde',
    beschreibung: 'A8.2, D55: wie „risiko-erfolg“, aber in der Schlussrunde; KI-Gegner 1 hat sie ausgelöst, der Nachziehstapel ist leer.',
    erwartet:
      'Partiephase Schlussrunde. Spieler 1 hat beide Risiko-Karten noch offen vor sich, es gibt aber keinen Knopf „RisikoKarteSpielen“ (D55); angeboten sind nur seine Karten. Alle Invarianten erfüllt.',
    erzeuge: () => tisch(504, []).schlussrunde(1).zustand(),
  },
]
