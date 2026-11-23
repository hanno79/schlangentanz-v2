---
id: TF-ENGINE-063
titel: Ein Spieler ohne Schlange erfüllt keine der fünf Aufgaben aus Paket B, und eine Blockade zählt beim Vielfaltskönig weder als Farbe noch stört sie.
art: manuell
regression: nein
prioritaet: niedrig
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X2b-aufgaben-muster (PR #106)
grenzfall_von: TF-ENGINE-061
---

## Worum es geht

Zwei Ränder, die keine Entscheidungstabelle enthält: ein Spieler ganz ohne Schlange, also die leere Menge, und beim Vielfaltskönig eine Schlange mit genau drei Farbkarten, einer Blockade und einer Regenbogenschlange. Ohne Schlange darf keine Aufgabe als erfüllt gelten, und die Blockade darf beim Vielfaltskönig weder als vierte Farbe zählen noch etwas unterbrechen.

## Bestanden, wenn

Ohne Schlange melden alle fünf Bedingungen `false`. Blau, Rot, Blockade, Gelb, Regenbogenschlange zusammen mit Braun, Violett, Grün, Grün, Braun ergibt beim Vielfaltskönig `false`, weil die zweite Schlange nur drei Farben hat. Mit Braun, Violett, Grün, Blau als zweiter Schlange ergibt es `true`, weil die erste Schlange mit der Regenbogenschlange vier Farben hat.

## Fehlgeschlagen, wenn

Eine der fünf Bedingungen ohne Schlange `true` meldet oder der Vielfaltskönig in einem der beiden Fälle anders urteilt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree mit `npm ci`, Stand e028a82c ausgecheckt |

## Testdaten

Prüfskript `zz_pruefer_x2b_partien.test.ts` aus dem Beleg, Tests G1 und G2; die Stellungen baut `tisch` aus `wertung_hilfe.ts`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Prüfskript aus dem Beleg als `src/engine/__tests__/zz_pruefer_x2b_partien.test.ts` anlegen | Inhalt des Belegs | Datei ist nicht versioniert |
| 2 | Konsole im Repo | ausführen | `npx vitest run src/engine/__tests__/zz_pruefer_x2b_partien.test.ts --reporter=verbose` | G1 grün; G2 schreibt für „3 Farben“ in der zweiten Schlange false, für „4 Farben“ true |
| 3 | Konsole im Repo | Prüfskript löschen | | `git status` zeigt nichts |
