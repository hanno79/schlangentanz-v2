---
id: TF-BRETT-005
titel: Bei 320 px Breite scrollt der Spieltisch nicht waagrecht, und die fünf Handkarten passen nebeneinander.
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

320 px ist schmaler als jede Geräteklasse, kommt bei kleinen Handys aber vor. Der Tisch soll dort nicht breiter werden als das Fenster.

## Bestanden, wenn

Bei 320×640 mit Touch ist im Volltisch und im Mittelspiel `scrollWidth` gleich 320, alle fünf Handkarten sind gleich breit (mindestens 44 px) in einer Zeile, und die Hand endet am unteren Rand.

## Fehlgeschlagen, wenn

`scrollWidth` ist grösser als 320, oder eine Handkarte ist angeschnitten.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Playwright-Kontext `handy-hochkant` mit Fenster 320×640 |
| Ausgangslage | Spielstand `volltisch` oder `mittelspiel` im Local Storage |

## Testdaten

Fenster 320×640, Touch.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Spielstand legen, `/spiel` öffnen | | Tisch erscheint |
| 2 | Konsole | `scrollWidth`, Breiten der Handkarten lesen | | 320; fünfmal gleiche Breite |
| 3 | Tisch | Foto ansehen | | nichts ragt rechts hinaus |

## Zurücksetzen

Browserkontext schliessen.
