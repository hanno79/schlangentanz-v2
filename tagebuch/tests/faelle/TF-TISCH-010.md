---
id: TF-TISCH-010
titel: Ist dieselbe Partie in zwei Tabs offen, zeigen beide Tabs und der Speicher am Ende denselben Spielstand.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
aenderung: task/O3-partie-steuerung (PR #70)
grenzfall_von: TF-TISCH-006
---

## Worum es geht

Jeder Tab führt die Partie mit seiner eigenen Steuerung, beide schreiben aber in denselben Speicher. Der Plan sagt nicht, wie sich zwei offene Tabs verhalten sollen. Der Testfall hält fest, was dabei passiert, damit jemand entscheiden kann, ob es so bleiben darf.

## Bestanden, wenn

Nach acht Sekunden zeigen beide Tabs denselben Stand, und dieser steht auch im Speicher, sodass ein Neuladen in keinem Tab etwas anderes zeigt.

## Fehlgeschlagen, wenn

Die beiden Tabs spielen getrennte Partien weiter, und im Speicher steht nur die eines Tabs; der andere Tab zeigt dann einen Stand, den ein Neuladen nicht wiederherstellt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Desktop 1280 × 900, ohne „weniger Bewegung“, ein Browserkontext mit zwei Tabs, Stand ab Commit 249aebb |
| Ausgangslage prüfen | Leerer Local Storage |

## Testdaten

Szenario `schlussrunde-ohne-dich`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Tab A | Adresse öffnen | `/spiel?szenario=schlussrunde-ohne-dich` | „KI-Gegner 1 ist dran“ |
| 2 | Tab B | sofort danach Adresse öffnen | `/spiel` | derselbe Tisch |
| 3 | beide Tabs | acht Sekunden warten | | beide „Die Partie ist beendet.“ |
| 4 | beide Tabs | Schlangen der Spieler vergleichen | | gleich in A, B und nach Neuladen |

## Zurücksetzen

Local Storage leeren oder Kontext schliessen.
