---
id: TF-TISCH-017
titel: Drehst du das Handy mitten in der Auswahl, bleibt sie stehen; lädst du neu, beginnt sie leer, und gespielt ist nichts.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O5-karten-spielen (PR #73)
grenzfall_von: TF-TISCH-013
---

## Worum es geht

Die Auswahl lebt nur in der Oberfläche, bis „Ausführen“ sie an die Engine gibt. Wechselt das Layout vom Hoch- ins Querformat, soll sie erhalten bleiben. Ein Neuladen darf sie verwerfen, aber nichts halb ausführen.

## Bestanden, wenn

Nach Farbendieb und der Blau des Gegners sagt die Zugleiste „Wähle die Stelle (+) in der Schlange.“. Nach dem Drehen auf 844 × 390 steht derselbe Satz da, zwei Knöpfe sind gedrückt (Farbendieb und Blau), die drei Stellen deiner Schlange sind markiert, und die Seite scrollt nicht waagrecht. Nach dem Neuladen steht „Wähle eine Karte aus deiner Hand.“, kein Ziel ist markiert, und der gespeicherte Spielstand ist derselbe wie vor dem Neuladen.

## Fehlgeschlagen, wenn

Die Auswahl verschwindet beim Drehen, Ziele fehlen danach, oder nach dem Neuladen ist eine Karte gespielt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Playwright Chromium, Start in Handy hochkant 390 × 844 mit Touch, Stand ab Commit 27d85d3 |

## Testdaten

Adresse `/spiel?szenario=farbendieb&tempo=sofort`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | | „Du bist dran“ |
| 2 | Deine Hand | „Sonderkarte Farbendieb“ antippen | | Karten des Gegners markiert |
| 3 | Tisch | „KI-Gegner 1, Schlange 1, Karte 1: Farbkarte Blau, 1 Punkt“ antippen | | Stellen deiner Schlange markiert |
| 4 | Gerät | auf 844 × 390 drehen | | Satz, gedrückte Knöpfe und Stellen bleiben |
| 5 | Browser | neu laden | | keine Auswahl, Spielstand unverändert |

## Zurücksetzen

Browserkontext schliessen.
