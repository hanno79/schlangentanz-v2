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

DESIGN.md verlangt für jeden gesperrten Knopf, dass daneben steht, warum. Seit O5 bleibt „Zug beenden“ auch stehen, während du eine Karte gewählt hast; dann muss der Grund ebenfalls zu sehen sein. Den Grund liefert seit O5 Iteration 2 die Engine (`zugBeendenGesperrt`). Vor der ersten Karte lautet er heute „Spieler 1 muss erst mindestens eine Karte spielen; beenden ohne Karte geht nur mit leerer Hand (A5, D12).“

## Bestanden, wenn

In jeder Geräteklasse steht neben dem gesperrten „Zug beenden“ der Grund der Engine, ganz im Bild und höchstens 16 px vom Knopf entfernt, und der Knopf verweist mit `aria-describedby` auf ihn. Das gilt ohne gewählte Karte, nach dem Antippen von „Farbkarte Rot, 1 Punkt“ und nach einer vollständigen Auswahl mit Ansage.

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
| 1 | Browser | `farbkarte-beim-gegner` öffnen | | „Zug beenden“ gesperrt, daneben „Spieler 1 muss erst mindestens eine Karte spielen; …“ |
| 2 | Deine Hand | „Farbkarte Rot, 1 Punkt“ antippen | | „Zug beenden“ gesperrt: steht der Grund daneben? |
| 3 | Browser | `farbendieb` öffnen, Farbendieb, Gelb des Gegners und „Deine Schlange 1: hinter Karte 2“ antippen | | Ansage; „Zug beenden“ gesperrt: steht der Grund daneben? |

## Nicht abgedeckte Grenzfälle

Abwerfen: dort steht „Zug beenden“ nicht. Während eines Gegnerzugs: dort steht „Zug beenden“ nicht.
