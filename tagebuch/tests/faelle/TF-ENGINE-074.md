---
id: TF-ENGINE-074
titel: Farbenpracht wird nur am Ende des eigenen Zuges eingelöst, offen wie geheim, nach einem Verdoppler am Ende jedes der beiden Züge und im letzten Zug vor dem Spielende.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A9_farbenpracht_zugende.test.ts
aenderung: task/X2a-aufgaben-farbmengen (PR #107)
---

## Worum es geht

Der Autor hat am 23.11.2026 entschieden, dass Farbenpracht („am Ende des Spiels oder Zugs“) nicht nach jeder Aktion geprüft wird, sondern nur am Ende des eigenen Zuges. Wer die Bedingung mitten im Zug schafft und im selben Zug wieder verliert, bekommt die Aufgabe nicht. Alle anderen Aufgaben bleiben bei der Prüfung nach jeder Aktion.

## Bestanden, wenn

`A9_farbenpracht_zugende.test.ts` ist grün (11 Tests). Nach dem zweiten Grün kommt kein Aufgabenereignis, nach „Zug beenden“ steht AufgabeErfuellt Farbenpracht vor ZugBegonnen des Nächsten. Mit eigener Fusion im selben Zug wieder zerstört: keine Aufgabe. Nach einem Verdoppler wird am Ende des ersten Zuges eingelöst, danach beginnt Teilzug 2. In der Schlussrunde steht AufgabeErfuellt vor PartieBeendet. Wer aussetzt, bekommt nichts. Ketten (D5) mischen beide Prüfzeitpunkte richtig.

## Fehlgeschlagen, wenn

Farbenpracht wird mitten im Zug oder zu Zugbeginn eingelöst, eine im Zug zerstörte Farbenpracht wird am Zugende trotzdem vergeben, oder sie fehlt nach dem letzten Zug der Partie.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo mit `npm ci`, Stand ab Commit 4dcd05d |

## Testdaten

Schlange mit je zwei Karten Blau bis Braun und einem Grün, Hand mit Grün, je nach Test Farbenfusion, Verdoppler oder einer Schlangengrube vor dem Gegner.

## Technische Prüfung

`npx vitest run src/engine/__tests__/regeln/A9_farbenpracht_zugende.test.ts` endet mit 0. Zwei Gegenproben machen Tests rot: ohne `pruefzeitpunkt: 'zugende'` in `farbenpracht.ts` 8 Tests dieser Datei und der Szenariotest, ohne den Aufruf `pruefeAufgabenAmZugende` in `schliesseZugAb` 7 Tests dieser Datei, der Szenariotest und der Dauerlauf der Aufgaben in `A9_aufgaben_ereignisse.test.ts`.

## Nicht abgedeckte Grenzfälle

Zugende nach dem Abwerfen überzähliger Karten, eine vom Gegner geschaffene und im eigenen Zug selbst zerstörte Farbenpracht und eine erst im zweiten Zug nach dem Verdoppler erfüllte Farbenpracht prüft TF-ENGINE-075. Zusatzaktionen aus Comeback-Karte und Schlangenkorb gibt es noch nicht (X4, X6); ihr Zugende läuft über dieselbe Stelle.
