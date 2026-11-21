---
id: TF-TISCH-020
titel: Ist „Zug beenden“ gesperrt, steht daneben immer, warum, auch wenn gerade eine Karte gewählt ist.
art: manuell
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/O5-karten-spielen (PR #73)
---

## Worum es geht

DESIGN.md verlangt für jeden gesperrten Knopf, dass daneben steht, warum, und für „Zug beenden“ den Satz „Du musst immer mindestens eine Karte spielen.“. Seit O5 bleibt „Zug beenden“ auch stehen, während du eine Karte gewählt hast. Dann muss der Grund ebenfalls zu sehen sein, oder der Knopf darf in dieser Lage nicht gesperrt dastehen.

## Bestanden, wenn

In jeder Geräteklasse steht neben dem gesperrten „Zug beenden“ der Satz „Du musst immer mindestens eine Karte spielen.“, sowohl ohne gewählte Karte als auch nach dem Antippen von „Farbkarte Rot, 1 Punkt“ und nach einer vollständigen Auswahl mit Ansage.

## Fehlgeschlagen, wenn

„Zug beenden“ steht gesperrt da und kein Text daneben sagt, warum.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Playwright Chromium mit den fünf Geräteklassen und eingebauter Browser der Desktop-App, Stand ab Commit 27d85d3 |

## Testdaten

Adressen `/spiel?szenario=farbkarte-beim-gegner&tempo=sofort` und `/spiel?szenario=farbendieb&tempo=sofort`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | `farbkarte-beim-gegner` öffnen | | „Zug beenden“ gesperrt, daneben „Du musst immer mindestens eine Karte spielen.“ |
| 2 | Deine Hand | „Farbkarte Rot, 1 Punkt“ antippen | | „Zug beenden“ gesperrt: steht der Grund daneben? |
| 3 | Browser | `farbendieb` öffnen, Farbendieb, Gelb des Gegners und „Deine Schlange 1: hinter Karte 2“ antippen | | Ansage; „Zug beenden“ gesperrt: steht der Grund daneben? |

## Nicht abgedeckte Grenzfälle

Abwerfen: dort steht „Zug beenden“ nicht. Während eines Gegnerzugs: dort steht „Zug beenden“ nicht.
