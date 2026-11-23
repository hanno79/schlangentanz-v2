---
id: TF-DEV-045
titel: Nimmt ein Gegner im Szenario entscheidung-letzte-karte die letzte Stapelkarte, löst Spieler 1 die Schlussrunde aus, spielt seinen Zug zu Ende, und danach hat jeder Gegner noch genau einen Zug.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

Wer mitten im Zug die letzte Karte nimmt, ändert nichts daran, wer die Schlussrunde auslöst: Es ist der Spieler am Zug (A10, D55). Das Szenario lässt einen Gegner die letzte Karte ziehen.

## Bestanden, wenn

Nach der Wahl „stapel“ stehen die Ereignisse „Entschieden“, „KartenVersetzt“ (violett-06 auf den Ablagestapel von Spieler 1, eine verdeckte Karte vom Nachziehstapel zu KI-Gegner 1) und „SchlussrundeBegonnen: ausgelöst von Spieler 1“. Der Nachziehstapel hat 0 Karten, „Am Zug“ ist weiter Spieler 1. Nach seinem Zug spielt jeder Gegner einen Zug ohne „KartenGezogen“, dann steht „PartieBeendet“.

## Fehlgeschlagen, wenn

Die Schlussrunde nennt KI-Gegner 1 als Auslöser, Spieler 1 verliert den Rest seines Zuges, ein Gegner zieht nach, oder die Partie endet nicht nach je einem Gegnerzug.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 686159e |

## Testdaten

Szenario `entscheidung-letzte-karte`: wie `entscheidung-gegner`, aber nach dem Aufdecken liegt nur eine Karte im Nachziehstapel.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Adresse | öffnen | `/dev?szenario=entscheidung-letzte-karte` | „Nachziehstapel: 1 Karten“, Partiephase „Laufend“ |
| 2 | Aktionen der Engine | klicken | „Entscheiden: KI-Gegner 1 (spieler-2)“ | „Entscheidet: KI-Gegner 1“ |
| 3 | Aktionen der Engine | klicken | „Entscheiden: stapel“ | „SchlussrundeBegonnen: ausgelöst von Spieler 1“, Partiephase „Schlussrunde“, „Nachziehstapel: 0 Karten“ |
| 4 | Aktionen der Engine | eine Farbkarte auf „neue Schlange“, dann „ZugBeenden“ | | „ZugBegonnen: KI-Gegner 1“, kein „KartenGezogen“ |
| 5 | Kopf | „KI-Schritt (solide)“ klicken, bis „PartieBeendet“ erscheint | | genau ein Zug je Gegner, danach Partiephase „Beendet“ |

## Nicht abgedeckte Grenzfälle

Dass ein Gegner aus dem leeren Stapel nichts zieht, wenn schon die aufgedeckte Karte die letzte war, prüft TF-ENGINE-064.
