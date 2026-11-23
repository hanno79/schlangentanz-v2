---
id: TF-ENGINE-061
titel: Mit Erweiterung erkennt die Engine Fusionsexperte, Schlangenbeschwörer, Schlangenmeister, Schlangenrepertoire und Schlangentanz nach A9, D36 und D37, und ohne Erweiterung bleibt jede Partie unverändert.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A9_aufgaben_schlangentanz.test.ts
aenderung: task/X2c-aufgaben-sonderkarten (PR #109)
---

## Worum es geht

Paket C von X2 setzt fünf Aufgaben um, die Sonderkarten in den Schlangen, ausgespielte Sonderkarten oder die Dreiergruppen einer Schlangenhäutung zählen. Dafür führt die Engine zwei Zähler im Spielzustand, aber nur mit Erweiterung. Geprüft wird, dass jede Aufgabe genau dann gilt, wenn ihr Kartentext erfüllt ist, und dass Partien ohne Erweiterung genau so ablaufen wie vorher.

## Bestanden, wenn

Die Regeltests in `A9_aufgaben_sonderkarten.test.ts`, `A9_aufgaben_ausgespielt.test.ts` und `A9_aufgaben_schlangentanz.test.ts` sowie `szenarienAufgabenC.test.ts` sind grün (69 Tests). Jede der drei Gegenproben macht mindestens einen passenden Test rot. Die volle Suche über alle Jokerfarben ergibt in 3'000 Zufallshäutungen dieselbe Zahl neuer Dreiergruppen wie `neueDreiergruppen`. Die Prüfsumme über 300 Zufallspartien ohne Erweiterung ist auf dem Task-Stand und auf der Basis gleich.

## Fehlgeschlagen, wenn

Ein Test ist rot, eine Gegenprobe bleibt grün, die volle Suche weicht in mindestens einem Fall ab, oder die Prüfsumme ohne Erweiterung unterscheidet sich zwischen Basis und Task-Stand.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo mit `npm ci`, Stand ab Commit b4942251 |

## Testdaten

Stellungen aus dem Baukasten mit zwei Spielern und Erweiterung, das Beispiel zu Schlangentanz aus A9 (Blau, Grün, Grün, Blau, Grün, Rot, Rot, Violett, Violett, Rot, Violett), Saaten 5001 bis 5300 für die Prüfsumme, Saat 4711 für die volle Suche.

## Technische Prüfung

`npx vitest run src/engine/__tests__/regeln/A9_aufgaben_sonderkarten.test.ts src/engine/__tests__/regeln/A9_aufgaben_ausgespielt.test.ts src/engine/__tests__/regeln/A9_aufgaben_schlangentanz.test.ts src/entwicklung/szenarienAufgabenC.test.ts` endet mit 0. Gegenproben: In `aufgaben/schlangentanz.ts` 2 durch 1 ersetzt und in `aufgaben/sonderkartenZaehler.ts` die Bedingung `spielerIndex !== besitzer` gestrichen macht vier Tests rot. Den Aufruf `merkeAusgespielteSonderkarte` in `reaktion.ts` zu entfernen macht drei Tests rot. Die volle Suche und die Prüfsumme liefen als temporäre Testdateien des Prüfers und stehen nicht im Repo.

## Nicht abgedeckte Grenzfälle

Dass der Schlangenkorb als ausgespielt zählt (D36), lässt sich erst mit X6 prüfen, weil er heute nicht spielbar ist. Dass derselbe Joker bei zwei Aufgaben verschiedene Farben hat, prüft Paket C nur gegen die Wertung, denn von den fünf Aufgaben liest nur Schlangentanz Jokerfarben. Eine gefressene Fusion und eine später aufgedeckte Schlangentanz-Karte prüft TF-ENGINE-062.
