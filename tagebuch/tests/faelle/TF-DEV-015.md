---
id: TF-DEV-015
titel: Eine ganze Partie zu zweit lässt sich am Entwicklertisch bis „Beendet“ durchklicken, mit richtiger Handgrösse, Schlussrunde und Wertung.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/E2-zugablauf (PR #36)
grenzfall_von: TF-DEV-014
---

## Worum es geht

Die Szenarien zeigen einzelne Stellen. Erst eine ganze Partie vom Start bis zur Wertung zeigt, dass der Zugablauf über viele Züge trägt und am Ende eine Wertung steht, die man nachrechnen kann.

## Bestanden, wenn

Aus `start-2` endet die Partie nach etwa 100 Zügen mit „Die Partie ist beendet (A10)“ und Stapel 0. Nach jedem Zugwechsel im laufenden Spiel hält der Spieler, der beendet hat, 5 Karten, und die Anzeige „Hand (n)“ stimmt mit dem Zustand überein. Die Schlussrunde beginnt mit KartenGezogen, SchlussrundeBegonnen und ZugBegonnen des anderen, und danach folgt genau ein Zug. Die Endwertung stimmt mit der von Hand nachgerechneten Summe der Gruppen und Ketten aus den angezeigten Schlangen überein. Kein Konsolenfehler.

## Fehlgeschlagen, wenn

Die Partie stecken bleibt, eine Hand nach dem Zugende nicht 5 Karten hält, der Auslöser noch einmal spielt oder die Wertung von der nachgerechneten abweicht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, `npm run preview:testhooks` auf Port 4174, Fenster 1280×900 |

## Testdaten

Szenario `start-2` (Saat 1, zwei Spieler, ohne Erweiterung). Je Zug eine Karte (reihum eine andere aus der Liste der Knöpfe), dann „ZugBeenden“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev?szenario=start-2` | eine Karte, dann „ZugBeenden“ | | Ereignisse KartenGezogen (Spieler 1, 1), ZugBegonnen (KI-Gegner 1); Hände 5/5, Stapel 97 |
| 2 | dieselbe Seite | weiter je Zug eine Karte und „ZugBeenden“ | | nach jedem Zugende 5 Karten beim abgebenden Spieler |
| 3 | dieselbe Seite | Zug, in dem der Stapel leer wird | | KartenGezogen, SchlussrundeBegonnen (Auslöser), ZugBegonnen des anderen; Stapel 0 |
| 4 | dieselbe Seite | letzten Zug spielen | | PartieBeendet, keine Knöpfe |
| 5 | Abschnitt „Wertung“ | Schlangen und Endwertung lesen, Gruppen und Kette nachrechnen | | Endwertung gleich der nachgerechneten Summe, „Gewonnen“ nennt den Höchsten |
