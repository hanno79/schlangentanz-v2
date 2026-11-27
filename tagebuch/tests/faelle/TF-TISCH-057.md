---
id: TF-TISCH-057
titel: Ohne Erweiterung zeigt der Tisch nichts von Aufgaben, Auslage, Risiko-Karte, Comeback-Karte oder Korb.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-27
veraendert_daten: ja
aenderung: task/O10-erweiterung-tisch (PR #124)
---

## Worum es geht

Die Erweiterung ist ein Schalter für alles (D34). Ohne sie darf am Tisch nichts davon stehen.

## Bestanden, wenn

Nach einer neuen Partie ohne Erweiterung und nach dem ersten Zug der KI kommt im Text der Seite keines der Wörter „Auslage“, „Aufgabe“, „Risiko“, „Comeback“, „Schlangenkorb“, „Zusatzaktion“, „Aufgedeckt“ oder „erfüllt“ vor, und es gibt kein Bild einer Aufgaben-, Comeback- oder Risiko-Karte.

## Fehlgeschlagen, wenn

Eines dieser Wörter oder Bilder erscheint.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 4ad16f8 |
| Ausgangslage prüfen | Lobby, Schalter „Mit Erweiterung“ steht auf „Aus“ |

## Testdaten

Lobby: 1 Gegner, ohne Erweiterung.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | „Neue Partie“, bei Nachfrage „Ja, neue Partie“ | | Tisch ohne Auslage und Aufgaben |
| 2 | Hand | eine Farbkarte, „Neue Schlange“, „Ausführen“, „Zug beenden“ | | Zug der KI läuft |
| 3 | Seite | Text der Seite durchsuchen | | keines der Wörter |

## Zurücksetzen

„Zur Lobby“.

## Nicht abgedeckte Grenzfälle

Die Wertung ohne Erweiterung (kein Vielfaltbonus, keine Aufgaben) prüft O8; hier nicht bis zum Ende gespielt.
