---
id: TF-ENGINE-059
titel: Ablehnungen, die einen Spieler nennen, tragen Art und Werte, ihr Text bleibt wie vor O6, und Kartennamen haben den richtigen Artikel.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-22
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A6_ablehnung_spieler.test.ts
aenderung: task/O6-gegnerzuege (PR #79)
---

## Worum es geht

Die Oberfläche spricht dich mit „du“ an. Damit sie dazu den Text der Engine nicht zerlegen muss, liefert die Engine bei Ablehnungen mit Spielernamen die Art und die Werte (Weg A). Engine, KI und Entwicklertisch lesen weiter den deutschen Grund (U12), der sich nicht ändern darf, ausser beim Artikel der Kartennamen.

## Bestanden, wenn

Alle Tests der Datei sind grün: jede der fünf Arten (`entscheidetNicht`, `nichtAmZug`, `kartenpflicht`, `nichtAufHand`, `abwerfenAnzahl`) mit Werten, Gründe ohne Spieler ohne Art, „Der Farbendieb schwebt noch“, „ist ein Farbendieb“ und „braucht einen Farbendieb“.

## Fehlgeschlagen, wenn

Ein Test ist rot, etwa weil ein Grund mit Spielernamen keine Art trägt oder ein Artikel falsch ist.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo mit `npm ci`, Stand ab Commit fde8e51 |

## Testdaten

Stellungen aus dem Baukasten der Engine im Test selbst, dazu 120 Zufallszustände und sechs gespielte Partien.

## Technische Prüfung

`npx vitest run src/engine/__tests__/regeln/A6_ablehnung_spieler.test.ts` endet mit 0. Zusätzlich hat der Prüfer von O6 die Engine von `origin/neuaufbau` gegen `fde8e51` über 716'363 Prüfungen verglichen: Erlaubnis, Aufzählung und Wirkung gleich, Text gleich ausser 5'436 Artikeländerungen.

## Nicht abgedeckte Grenzfälle

Ein Spieler mit leerem Namen kommt in der Engine nicht vor und ist nicht geprüft. Gründe aus den Kartenprüfungen nennen keine Spielernamen; das belegt die Stichprobe, ein eigener Test dafür fehlt.
