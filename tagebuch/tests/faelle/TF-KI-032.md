---
id: TF-KI-032
titel: Die solide KI gewinnt in den sechs Turnieren des Stärkenachweises mit festen Saaten mindestens so oft wie festgeschrieben, und jede Partie endet ohne verletzte Invariante.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
skript: tests/staerke_k5.ts
aenderung: task/K5-staerkenachweis (PR #122)
---

## Worum es geht

K5 belegt, dass die solide KI klar stärker ist als die Zufalls-KI und als „erste erlaubte Aktion“. Sechs Turniere mit festen Saaten laufen in `npm run test:staerke`, drei ohne und drei mit Erweiterung. Jede KI kommt dabei aus einem frisch geladenen Modul.

## Bestanden, wenn

Alle sechs Tests sind grün. Die solide KI holt ohne Erweiterung 500 von 500 Siegen gegen die Zufalls-KI, 500 von 500 gegen „erste erlaubte Aktion“ und 300 von 300 zu viert, mit Erweiterung 500, 500 und 292. Festgeschrieben sind mindestens 495, 495, 297, 495, 495 und 289 Siege. Keine Partie endet an der Schrittgrenze oder an einer verletzten Invariante.

## Fehlgeschlagen, wenn

Ein Test ist rot: weniger Siege als festgeschrieben, eine Partie endet nicht oder verletzt eine Invariante, oder eine Fabrik kommt zweimal aus demselben Modul.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand, `npm ci` gelaufen |

## Testdaten

Saaten und KI-Saaten stehen in `MESSLAEUFE` und `MESSLAEUFE_ERWEITERUNG` in `tests/staerke_k5.ts`.

## Technische Prüfung

`npm run test:staerke`. Jeder Test schreibt eine Anmerkung mit Siegen, Anteil und Schwelle; der Reporter `verbose` zeigt sie auch, wenn der Test besteht. Laufzeit rund 21 Minuten, sechs Dateien parallel.

## Nicht abgedeckte Grenzfälle

Saaten ausserhalb des Tests prüft TF-KI-033. Dass die Auswertung eine schwächere KI, eine gesenkte Schwelle und geteilte Module erkennt, prüft TF-KI-034. Partien zu dritt misst K5 nicht, der Plan verlangt nur zwei und vier Spieler.
