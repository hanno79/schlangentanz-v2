---
id: TF-BRETT-002
titel: Eine Farbenfusion in deinen Schlangen zeigt die zwei Karten darunter ganz, ohne dass du scrollen musst.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O4-spieltisch (PR #34)
---

## Worum es geht

Unter einer Farbenfusion liegen zwei Farbkarten, und sie zählen in der Wertung mit. Der Tisch zeigt sie als halbe Karten unter der Fusion. In deinem eigenen Bereich unten sollen sie zu sehen sein, ohne dass du erst im Bereich wischst.

## Bestanden, wenn

In jeder der fünf Klassen liegen im Szenario Mittelspiel und im Volltisch beide Bilder der Gruppe „Unter der Farbenfusion“ in „Deine Schlangen“ ganz innerhalb des Bereichs `.st-eigene` (Unterkante der Bilder ≤ Unterkante des Bereichs), und der Bereich muss dafür nicht gescrollt werden.

## Fehlgeschlagen, wenn

Die Bilder unter der Fusion reichen in einer Klasse unter die Unterkante von „Deine Schlangen“ und sind ohne Wischen nur zum Teil zu sehen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright-Kontexte aus `scripts/pruefung/geraeteklassen.mjs` |
| Ausgangslage | Spielstand `mittelspiel` oder `volltisch` aus `src/ui/tisch/__tests__/szenarien.ts` im Local Storage |

## Testdaten

Mittelspiel: deine Schlange 2 ist Blau, Farbenfusion (auf Gelb und Gelb), Blau. Volltisch: deine Schlange 2 trägt die Fusion an Platz 10.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Spielstand legen, `/spiel` öffnen | Szenario | Tisch erscheint |
| 2 | Deine Schlangen | Lage der Gruppe „Unter der Farbenfusion“ und von `.st-eigene` lesen, ohne zu scrollen | | Unterkante der Bilder ≤ Unterkante des Bereichs |
| 3 | Deine Schlangen | Foto ansehen | | beide gelben halben Karten ganz zu sehen |

## Zurücksetzen

Browserkontext schliessen.

## Nicht abgedeckte Grenzfälle

Eine Fusion in einer Gegnerschlange liegt in der scrollbaren Tischfläche und ist dort über TF-BRETT-001 abgedeckt.
