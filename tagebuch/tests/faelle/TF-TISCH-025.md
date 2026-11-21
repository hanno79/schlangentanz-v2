---
id: TF-TISCH-025
titel: Bei Gleichstand nennt die Wertung alle Sieger im Titel, und jeder von ihnen trägt das Abzeichen „Sieger“.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ui/ergebnis/Ergebnis.test.tsx
aenderung: task/O8-spielende (PR #77)
---

## Worum es geht

Haben mehrere Spieler die höchste Punktzahl, gewinnen alle (D22). Die Wertung darf dann keinen von ihnen unterschlagen, weder im Titel noch in der Rangliste.

## Bestanden, wenn

Im Szenario `wertung-beispiele-kette` lautet der Titel „Gleichstand: Du und KI-Gegner 1 gewinnen!“, darunter „Mit 12 Punkten.“. „Du“ und „KI-Gegner 1“ stehen beide auf Platz 1 mit 12 Punkten und dem Abzeichen „Sieger“; KI-Gegner 2 steht auf Platz 3 mit 4 Punkten und ohne Abzeichen. Beide Sieger haben Längste Kette 5, weil ihre Ketten gleich lang sind (4 Karten).

## Fehlgeschlagen, wenn

Der Titel nennt nur einen Sieger, ein Sieger hat kein Abzeichen, KI-Gegner 2 trägt eines, oder die Plätze lauten 1, 2, 3.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build, Stand ab Commit 0b0d639 |

## Testdaten

Adresse `/spiel?szenario=wertung-beispiele-kette` (drei Spieler, ohne Erweiterung).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=wertung-beispiele-kette` | Titel „Gleichstand: Du und KI-Gegner 1 gewinnen!“, darunter „Mit 12 Punkten.“ |
| 2 | Wertung | Einträge lesen | | „1. Du“ 12 Punkte mit „Sieger“, „1. KI-Gegner 1“ 12 Punkte mit „Sieger“ |
| 3 | Wertung | nach unten scrollen | | „3. KI-Gegner 2“ 4 Punkte, kein Abzeichen |

## Nicht abgedeckte Grenzfälle

Alle Spieler punktgleich, auch mit 0 Punkten: in der echten Partie aus TF-TISCH-026 gesehen („Gleichstand: Du und KI-Gegner 1 gewinnen!“ mit 0 Punkten), ohne eigenen Testfall. Gleichstand zwischen drei oder vier Spielern: nur über die 50 Endstände im Komponententest, nicht als eigener Browserfall.
