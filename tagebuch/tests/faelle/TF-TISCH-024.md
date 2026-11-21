---
id: TF-TISCH-024
titel: Nach Spielende zeigt die Wertung je Spieler Gruppen je Schlange, die Farbe jedes Jokers, Kette, Vielfalt und Aufgaben, und jede Zahl ist die der Engine.
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

Nach Spielende soll jeder sehen, woher seine Punkte kommen: welche Farbgruppen in welcher Schlange zählen, als welche Farbe ein Joker gewertet wurde, wer die längste Kette hat und, mit Erweiterung, Vielfalt und Aufgaben. Die Seite darf dabei nichts selbst rechnen. Jede Zahl muss genau die der Endwertung der Engine sein.

## Bestanden, wenn

Im Szenario `wertung-beispiele` steht „KI-Gegner 2 gewinnt!“ und darunter „Mit 28 Punkten. Du bist auf Platz 3 mit 10 Punkten.“. KI-Gegner 2 zeigt 28 Punkte mit Farbgruppen 26, Vielfalt 2, Längste Kette 0, Aufgaben 0, „Schlange 1: 15 Punkte“ mit „Rot × 3: 3 Punkte“, „Violett × 3: 6 Punkte“, „Braun × 3: 6 Punkte“ und „Schlange 2: 11 Punkte“ mit „Regenbogenschlange als Rot“. Bei dir steht „Farbenfusion als Violett“ und „Farbenfusion als Blau“, bei KI-Gegner 1 „Längste Kette: 4 Karten“ und der Posten Längste Kette 5. Ohne Erweiterung fehlen die Posten Vielfalt und Aufgaben. Die Konsole meldet keinen Fehler, und die Seite ist nicht breiter als das Fenster.

## Fehlgeschlagen, wenn

Eine Zahl weicht von der Endwertung ab, ein Joker steht ohne Farbe da, die Posten fehlen oder stehen beim falschen Spieler, oder die Seite scrollt waagrecht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Testhook-Build (`npm run build:testhooks`, `npm run preview:testhooks`), Stand ab Commit 0b0d639 |
| Ausgangslage prüfen | Unter der Adresse steht die Wertung, nicht der Tisch |

## Testdaten

Adresse `/spiel?szenario=wertung-beispiele` (vier Spieler, mit Erweiterung), zum Vergleich ohne Erweiterung `/spiel?szenario=wertung-beispiele-kette`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Browser | Adresse öffnen | `/spiel?szenario=wertung-beispiele` | Titel „KI-Gegner 2 gewinnt!“, darunter „Mit 28 Punkten. Du bist auf Platz 3 mit 10 Punkten.“ |
| 2 | Wertung, Eintrag „1. KI-Gegner 2“ | Posten lesen | | 28 Punkte, Farbgruppen 26, Vielfalt 2, Längste Kette 0, Aufgaben 0, Abzeichen „Sieger“ |
| 3 | Wertung, Eintrag „1. KI-Gegner 2“ | Schlangen lesen | | „Schlange 1: 15 Punkte“ mit Rot × 3: 3, Violett × 3: 6, Braun × 3: 6, „Vielfalt: Rot, Violett, Braun“; „Schlange 2: 11 Punkte“ mit „Regenbogenschlange als Rot“ |
| 4 | Wertung | in der Rangliste nach unten scrollen | | „2. KI-Gegner 1“ 12 Punkte mit Längste Kette 5 und „Längste Kette: 4 Karten“; „3. Du“ 10 Punkte mit „Farbenfusion als Violett“ und „Farbenfusion als Blau“; „4. KI-Gegner 3“ 6 Punkte mit „Regenbogenschlange als Blau“ und „Regenbogenschlange als Braun“ |
| 5 | Browser | Adresse öffnen | `/spiel?szenario=wertung-beispiele-kette` | Kein Posten Vielfalt und kein Posten Aufgaben |

## Technische Prüfung

Für Endstände echter Partien: den Spielstand aus `localStorage["schlangentanz-v2:partie"]` mit `deserialisiere` laden und jede Zahl der Seite mit `berechneEndwertung` vergleichen: Gesamt, jeder Posten, Überschrift und Punkte jeder Schlange, jede Gruppe, jeder Joker, die Kette und die Vielfaltfarben.

## Nicht abgedeckte Grenzfälle

Erfüllte Aufgaben aus einer echten Partie: Die Engine prüft Aufgaben noch nicht (C1, X1 und X2), deshalb steht in echten Partien immer 0; geprüft nur mit einem gebauten Stand im Komponententest. Spieler ohne Schlange: in der echten Partie aus TF-TISCH-026 gesehen („Keine Schlange“). Drehen mit gescrollter Rangliste: TF-TISCH-029. Schmaler als jede Klasse mit langen Schlangen: TF-TISCH-030.
