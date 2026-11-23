---
id: TF-ENGINE-061
titel: Farbvielfalt, Vielfaltskönig, Farbwechsler, Schlangenbändiger und Symmetriemeister gelten genau dann als erfüllt, wenn ihre Entscheidungstabelle es verlangt, mit Jokern als passender Farbe.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A9_aufgaben_joker_folgen.test.ts
aenderung: task/X2b-aufgaben-muster (PR #106)
---

## Worum es geht

Paket B von X2 gibt fünf Aufgaben ihre echte Bedingung nach A9, A7.3, A7.7 und D38 bis D40. Regenbogenschlange und Farbenfusion zählen dabei bei jeder Aufgabe als die Farbe, mit der sie erfüllt ist, und eine eingelöste Aufgabe bleibt beim Spieler. Je Aufgabe hält eine Entscheidungstabelle fest, welche Stellung zählt und welche nicht.

## Bestanden, wenn

Die fünf Tabellentests, `A9_aufgaben_joker_folgen.test.ts` und `szenarienAufgabenB.test.ts` laufen grün durch, 106 Tests zusammen mit `solideKi_zugende.test.ts`. Jede Tabelle hat die sechs Pflichtstellungen: erfüllt, knapp nicht, Regenbogenschlange, Farbenfusion, Blockade dazwischen und zwei Schlangen.

## Fehlgeschlagen, wenn

Ein Test ist rot. Das passiert etwa, wenn Blau, Rot, Gelb, Rot, Grün als Farbwechsler zählt, eine Blockade als Achse den Symmetriemeister nicht verhindert oder eine einzige Schlange mit sechs Farben den Vielfaltskönig einlöst.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo mit `npm ci`, Stand ab Commit e028a82c |

## Testdaten

Stellungen aus dem Szenario-Baukasten: je Aufgabe 11 bis 16 Zeilen, dazu die Schlange Rot, Gelb, Braun, Violett, Blau, ?, Blau, Grün, Rot, Blau, Grün für den Joker in zwei Aufgaben und 20 Karten mit 4 und 8 Jokern für die Laufzeit.

## Technische Prüfung

`npx vitest run` über `src/engine/__tests__/regeln/A9_aufgabe_farbvielfalt.test.ts`, `A9_aufgabe_farbwechsler.test.ts`, `A9_aufgabe_schlangenbaendiger.test.ts`, `A9_aufgabe_symmetriemeister.test.ts`, `A9_aufgabe_vielfaltskoenig.test.ts`, `A9_aufgaben_joker_folgen.test.ts`, `src/entwicklung/szenarienAufgabenB.test.ts` und `src/ki/strategien/solideKi_zugende.test.ts` endet mit 0. Drei Gegenproben machen Tests rot: ohne den Zweig `davor === farbe` in `farbwechsler.ts` drei Zeilen, ohne die Sonderkarten-Sperre in `symmetriemeister.ts` die Zeile „Blockade als Achse“, mit einer statt zwei Schlangen in `vielfaltskoenig.ts` die Zeile D38.

## Nicht abgedeckte Grenzfälle

Ein Spieler ohne Schlange steht in TF-ENGINE-063. Den Vergleich mit allen Jokerbelegungen und 300 Zufallspartien zeigt TF-ENGINE-062. Ob Farbvielfalt sechs verschiedene Karten direkt hintereinander verlangt oder auch Wiederholungen in der Kette zulässt, sagt Teil A nicht eindeutig. Die Tabelle hält die Auslegung der Umsetzung fest, eine Antwort des Autors fehlt.
