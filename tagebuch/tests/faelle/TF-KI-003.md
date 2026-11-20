---
id: TF-KI-003
titel: 200 Partien Zufalls-KI gegen Zufalls-KI mit 2, 3 und 4 Spielern, mit und ohne Erweiterung, enden alle ohne verletzte Invariante.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: src/ki/turnier.test.ts
aenderung: task/K1-ki-schnittstelle
---

## Worum es geht

Das Turnier ist der Prüfstand für alle späteren KIs (K5). Es muss jede Partie bis zum Ende spielen, vor jedem Schritt die Invarianten prüfen und Sieger und Punkte richtig zuordnen, auch wenn der Sitz von Partie zu Partie wechselt.

## Bestanden, wenn

Die 200 Partien des Umsetzers (70 zu zweit ohne, 70 zu zweit mit Erweiterung, 30 zu dritt, 30 zu viert) enden alle mit Ausgang „beendet“. Die 200 eigenen Partien des Prüfers (je 35 oder 30 mit 2, 3 und 4 Spielern, je mit und ohne Erweiterung, Saaten ab 5000) enden ebenfalls alle, jede mit mehr als 40 Schritten.

## Fehlgeschlagen, wenn

Eine Partie mit „invariante“ oder „schrittgrenze“ endet oder das Turnier mit einem Fehler abbricht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K1-ki-schnittstelle`, `npm ci` gelaufen |

## Testdaten

Saaten 1 bis 70, 101 bis 170, 201 bis 230, 301 bis 330 (Umsetzer); 5000 bis 5034, 5100 bis 5134, 5200 bis 5229, 5300 bis 5329, 5400 bis 5434, 5500 bis 5534 (Prüfer).

## Technische Prüfung

`npx vitest run src/ki/turnier.test.ts` endet mit Exit 0. Die eigenen 200 Partien laufen in der Probe aus TF-KI-002 („Prüfer: 200 Partien …“) und geben eine Zeile `PRUEFER K2: 200 Partien, nicht beendet 0, …` aus.

## Nicht abgedeckte Grenzfälle

Partien mit Abwehr und mit gezielten Sonderkarten kommen erst mit E3 bis E9; heute sind diese Karten Platzhalter ohne Ziel. Der Dauerlauf muss mit diesen Tasks neu laufen.
