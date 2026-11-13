---
id: TF-BRETT-007
titel: Sitzt der Mensch nicht auf Platz 1, steht er trotzdem unten, und die Gegner folgen in Sitzordnung nach ihm.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O4-spieltisch (PR #34)
grenzfall_von: TF-BRETT-001
---

## Worum es geht

Alle Szenarien setzen den Menschen auf Platz 1. Der Tisch soll ihn aber an jedem Platz unten zeigen und die Gegner in der Reihenfolge, in der sie nach ihm spielen.

## Bestanden, wenn

Ist im Mittelspiel Spieler 3 der Mensch, zeigt der Tisch oben „Spieler 1“, dann „KI-Gegner 1“; unten stehen die Schlangen von Spieler 3 als „Deine Schlange 1“ (4 Karten); die Statuszeile sagt „Spieler 1 ist dran“.

## Fehlgeschlagen, wenn

Der Mensch erscheint oben, die Gegner stehen in falscher Reihenfolge, oder unten stehen fremde Schlangen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Desktop 1280×900 |
| Ausgangslage | Szenario `mittelspiel`, im gespeicherten JSON `steuerung` von Spieler 3 auf `Mensch`, der übrigen auf `KI` gesetzt |

## Testdaten

Mittelspiel, Mensch auf Platz 3.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | geänderten Spielstand legen, `/spiel` öffnen | | Tisch erscheint |
| 2 | Tisch | Namen der Gegnerkästen lesen | | „Spieler 1“, „KI-Gegner 1“ |
| 3 | Deine Schlangen | Name der ersten Schlange lesen | | „Deine Schlange 1: 4 Karten …“ |

## Zurücksetzen

Browserkontext schliessen.
