---
id: TF-ENGINE-080
titel: Die Risiko-Belohnungs-Karten wirken in allen vier Aktionen mit Erfolg und Misserfolg so, wie A8.2 und D50 bis D55 es verlangen.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-24
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A8.2_risiko_aktionen.test.ts
aenderung: task/X5-risiko (PR #117)
---

## Worum es geht

Jeder Spieler hat mit Erweiterung zwei Risiko-Karten. Spielt er eine, wird die oberste Stapelkarte offen aufgedeckt: Eine Farbkarte bringt die Belohnung, eine Sonderkarte hilft einem Gegner seiner Wahl. Geprüft wird, wohin jede Karte danach kommt, wer wann entscheidet und dass es bei einer Karte je Runde bleibt.

## Bestanden, wenn

Die drei Regeltestdateien `A8.2_risiko_aktionen.test.ts` (20 Tests), `A8.2_risiko_rahmen.test.ts` (26 Tests) und `A8.2_risiko_comeback.test.ts` (3 Tests) sind grün, und `A8.2_risiko_dauerlauf.test.ts` meldet in 60 Partien jede der acht Kombinationen aus Aktion und Ausgang mindestens einmal.

## Fehlgeschlagen, wenn

Ein Test ist rot, etwa weil eine zweite Risiko-Karte in derselben Runde angeboten wird, eine gespielte Risiko-Karte auf einem Ablagestapel liegt oder bei Aktion 2 eine fremde Schlange als Ziel erscheint.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand von `task/X5-risiko`, `npm ci` gelaufen |

## Testdaten

Tische aus `src/engine/__tests__/risiko_hilfen.ts`: drei Spieler mit Erweiterung, Spieler 1 am Zug, die obersten Stapelkarten je Test fest vorgegeben.

## Technische Prüfung

`npx vitest run src/engine/__tests__/regeln/A8.2_risiko_aktionen.test.ts src/engine/__tests__/regeln/A8.2_risiko_rahmen.test.ts src/engine/__tests__/regeln/A8.2_risiko_comeback.test.ts src/engine/__tests__/regeln/A8.2_risiko_dauerlauf.test.ts` endet mit Exit-Code 0.

## Nicht abgedeckte Grenzfälle

Sechs Randlagen ohne eigene Regeltests stehen in TF-ENGINE-081. Der Schlangenkorb auf einem Ablagestapel ist nur über den Baukasten gelegt, weil X6 noch nicht gemergt ist. Ob der begünstigte Gegner die Sonderkarte aus Aktion 1 ablehnen darf („darf … nehmen“), ist nicht geprüft; die Engine gibt sie ihm immer.
