---
id: TF-BRETT-004
titel: Eine in der Lobby angelegte Partie erscheint am Spieltisch mit so vielen Gegnern und der Erweiterung, wie gewählt.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: ja
aenderung: task/O4-spieltisch (PR #34)
---

## Worum es geht

Seit O4 steht unter `/spiel` der echte Tisch statt des Platzhalters. Was du in der Lobby wählst, muss dort ankommen: die Zahl der Gegner und ob die Erweiterung mitspielt.

## Bestanden, wenn

Für 1 Gegner ohne, 2 mit, 3 mit und 3 ohne Erweiterung zeigt der Tisch genau so viele Gegnerkästen; mit Erweiterung stehen 3 offene Aufgaben in der Tischmitte, ohne keine. Die Statuszeile sagt „Du bist dran“, deine Hand liegt am unteren Rand, `scrollWidth` gleich `clientWidth`, keine Konsolenfehler.

## Fehlgeschlagen, wenn

Die Zahl der Gegner oder die Erweiterung stimmt nicht, der Tisch erscheint nicht, oder die Seite scrollt waagrecht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Produktionsbuild, Geräteklassen aus `scripts/pruefung/geraeteklassen.mjs`, Touch ausser Desktop |
| Ausgangslage | Local Storage leer |

## Testdaten

Gegnerzahl 1, 2, 3; Schalter „Mit Erweiterung“ an oder aus.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Lobby | Gegnerzahl antippen | „1 Gegner“ … „3 Gegner“ | gewählt |
| 2 | Lobby | „Mit Erweiterung“ antippen, falls verlangt | | Schalter an |
| 3 | Lobby | „Neue Partie“ antippen | | `/spiel` mit Tisch |
| 4 | Tisch | Gegnerkästen und „Offene Aufgaben“ zählen | | wie gewählt |

## Zurücksetzen

Browserkontext schliessen oder `localStorage.clear()`.

## Nicht abgedeckte Grenzfälle

Weiterspielen nach neuem Laden ist durch die O2-Tests in `src/ui/lobby/Lobby.test.tsx` abgedeckt.
