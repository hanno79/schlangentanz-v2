---
id: TF-BRETT-008
titel: Dreht man das Handy bei offener Grossansicht einer Aufgabe, bleibt sie offen, ganz im Bild und schliessbar.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O4-spieltisch (PR #34)
grenzfall_von: TF-BRETT-001
---

## Worum es geht

Aufgaben sind am Tisch zu klein zum Lesen; man tippt sie an und sieht sie gross. Wer dabei das Handy von hochkant auf quer dreht, soll die Karte weiter ganz sehen und den Knopf „Schliessen“ erreichen.

## Bestanden, wenn

Nach dem Drehen von 390×844 auf 844×390 ist der Dialog noch offen, das Kartenbild liegt ganz zwischen 0 und 390 px, „Schliessen“ ist mindestens 44 px hoch und im Bild, `scrollWidth` bleibt 844. Nach Antippen von „Schliessen“ ist kein Dialog mehr offen.

## Fehlgeschlagen, wenn

Der Dialog schliesst sich beim Drehen, die Karte oder der Knopf liegt unter dem Rand, oder die Seite wird breiter als das Fenster.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright-Kontext `handy-hochkant` |
| Ausgangslage | Spielstand `volltisch` im Local Storage |

## Testdaten

Erste offene Aufgabe; danach `setViewportSize({ width: 844, height: 390 })`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Tischmitte | erste offene Aufgabe antippen | | Grossansicht offen |
| 2 | Playwright | Fenster drehen | 844×390 | Lage von Bild und Knopf lesen |
| 3 | Grossansicht | „Schliessen“ antippen | | Dialog zu |

## Zurücksetzen

Browserkontext schliessen.
