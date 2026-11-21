---
id: TF-TISCH-016
titel: Kann der Schlangenfrass mit c) nur eine Karte fressen, geht „Ausführen“ schon nach dieser einen Karte.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/O5-karten-spielen (PR #73)
grenzfall_von: TF-TISCH-013
---

## Worum es geht

Nach A7.4 frisst c) zwei Karten aus den Schlangen der Mitspieler, „sofern möglich“. Liegt beim Gegner nur eine Karte, die c) nehmen darf, nennt die Engine eine Aktion mit einer Karte. Die Oberfläche soll dann nach dieser einen Karte die Ansage zeigen und nicht auf eine zweite warten.

## Bestanden, wenn

Nach dem Antippen des Schlangenfrass steht in der Zugleiste nur die Möglichkeit c). Nach c) ist genau „KI-Gegner 1, Schlange 1, Karte 1: Farbkarte Blau, 1 Punkt“ markiert. Danach steht „Ansage: Schlangenfrass frisst Blau aus der Schlange 1 von KI-Gegner 1.“ mit „Ausführen“, und nach „Ausführen“ hat KI-Gegner 1 nur noch eine Karte (die Schlangenblockade).

## Fehlgeschlagen, wenn

Die Schlangenblockade ist markiert, nach einer Karte fehlt „Ausführen“, oder nach dem Ausführen liegt die Blau noch.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Playwright Chromium, Handy hochkant 390 × 844 mit Touch, Stand ab Commit 27d85d3 |
| Datenstand | Spielstand mit dem Baukasten der Engine, vor dem Laden in den Local Storage geschrieben |

## Testdaten

Zwei Spieler ohne Erweiterung, Zufall aus Saat 5. KI-Gegner 1 hat die Schlange Blau, Schlangenblockade und hält Rot, Gelb, Violett, Braun, Grün. Du hältst Schlangenfrass, Rot, Gelb, Violett, Braun, hast keine Schlange und bist am Zug. Die Engine nennt genau eine Aktion SchlangenfrassSpielen: c) mit der Blau.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Entwicklerwerkzeuge | Spielstand schreiben, `/spiel?tempo=sofort` öffnen | Spielstand | „Du bist dran“ |
| 2 | Deine Hand | „Sonderkarte Schlangenfrass“ antippen | | Zugleiste zeigt nur c) |
| 3 | Zugleiste | c) antippen | | nur die Blau beim Gegner markiert |
| 4 | Tisch | die Blau antippen | | Ansage mit einer Karte, „Ausführen“ da |
| 5 | Zugleiste | „Ausführen“ antippen | | KI-Gegner 1: 1 Karte |

## Zurücksetzen

Browserkontext schliessen.
