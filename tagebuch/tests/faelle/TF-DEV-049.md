---
id: TF-DEV-049
titel: Eine Zufallspartie ohne und eine mit Erweiterung laufen am Entwicklertisch mit Klicks bis „PartieBeendet“, ohne verletzte Invariante und ohne Konsolenfehler.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

X3 baut den Zugablauf um: Grenzen des Zuges, Prüfung der Schlussrunde nach jeder Aktion, neue Zustandsfelder. Eine ganze Partie am Entwicklertisch zeigt, dass das gewöhnliche Spiel davon nichts merkt, mit und ohne Erweiterung.

## Bestanden, wenn

Beide Partien erreichen „Partiephase: Beendet“ mit „Aktionen der Engine (0)“. Nach jedem Schritt steht „Invarianten (alle erfüllt)“, die Konsole hat keinen Fehler, und `scrollWidth` ist gleich `clientWidth`.

## Fehlgeschlagen, wenn

Eine Partie bleibt stehen, eine Invariante ist verletzt, oder die Konsole meldet einen Fehler.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Desktop 1280×900, Stand ab Commit 686159e |

## Testdaten

Partie 1: Saat 4242, 3 Spieler, Erweiterung 0. Partie 2: Saat 777, 4 Spieler, Erweiterung 1.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | `/dev` | Saat und Spieler eintragen, Erweiterung wählen, „Partie starten“ | 4242, 3, 0 | Titel „Partie aus Saat 4242, 3 Spieler, ohne Erweiterung“ |
| 2 | Kopf und Aktionen | entscheidet eine KI, „KI-Schritt (solide)“ klicken, sonst den ersten Knopf unter „Aktionen der Engine“ | | nach jedem Klick „Invarianten (alle erfüllt)“ |
| 3 | Lage | Schritt 2 wiederholen, bis „Partiephase: Beendet“ | | Ereignis „PartieBeendet“, „Aktionen der Engine (0)“ |
| 4 | `/dev` | Schritte 1 bis 3 mit Partie 2 | 777, 4, 1 | Titel „… 4 Spieler, mit Erweiterung“, endet ebenso |

## Nicht abgedeckte Grenzfälle

Zusatzaktionen und Entscheidungen kommen in Zufallspartien noch nicht vor, weil keine Karte sie auslöst (X4 bis X6); sie prüfen TF-DEV-046 bis TF-DEV-048.
