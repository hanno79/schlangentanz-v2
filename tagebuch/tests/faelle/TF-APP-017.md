---
id: TF-APP-017
titel: In Querformaten zwischen den Geräteklassen (1024×600, 740×360, 667×375) bleiben alle Knöpfe der Lobby ohne Scrollen erreichbar.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O2b-lobby-flach (PR #35)
grenzfall_von: TF-APP-003
---

## Worum es geht

Die fünf Geräteklassen haben feste Masse. Echte Geräte liegen dazwischen: ein kleines Notebook mit 1024×600, ein Android-Handy quer mit 740×360, ein iPhone SE quer mit 667×375. Die Lobby schaltet im Querformat ab 560 px Breite auf zwei Spalten. Hier wird geprüft, ob das auch bei diesen Grössen reicht.

## Bestanden, wenn

In allen drei Fenstern liegen in der leeren Lobby, mit laufender Partie, mit offener Rückfrage und nach einem unlesbaren Spielstand „Weiterspielen“, 1, 2 und 3, „Mit Erweiterung“, „Neue Partie“, „Ja, neue Partie“, „Abbrechen“ und „Regeln“ ganz zwischen 0 px und der Fensterhöhe. Die Seite ist nicht breiter als das Fenster.

## Fehlgeschlagen, wenn

Ein Knopf ragt unten oder oben aus dem Bild, oder die Seite ist breiter als das Fenster.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright Chromium mit Touch (`hasTouch`, `isMobile`) |
| Ausgangslage | Local Storage leer |

## Testdaten

Fenster 1024×600, 740×360 und 667×375. Unlesbarer Stand: `schlangentanz-v2:partie` = `{"version":1,"kaputt":true}`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | Seite öffnen, Lage aller Knöpfe lesen | `/` | alles im Bild |
| 2 | Lobby | „Neue Partie“ antippen, Zurück | | „Laufende Partie“ mit „Weiterspielen“, alles im Bild |
| 3 | Lobby | „Neue Partie“ antippen | | Rückfrage mit beiden Knöpfen im Bild |
| 4 | Lobby | unlesbaren Stand setzen, neu laden | | Hinweis und alle Knöpfe im Bild |

## Zurücksetzen

Local Storage löschen.
