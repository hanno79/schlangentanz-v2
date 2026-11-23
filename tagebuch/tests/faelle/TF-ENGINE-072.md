---
id: TF-ENGINE-072
titel: Farbenpracht, Farbharmonie, Farbkombination, Gelber Schatz und Lila Riese gelten genau dann als erfüllt, wenn ihr Kartentext mit den Jokern als frei wählbarer Farbe zutrifft.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A9_aufgaben_farbmengen.test.ts
aenderung: task/X2a-aufgaben-farbmengen (PR #107)
---

## Worum es geht

Fünf Aufgaben zählen Karten einer Farbe: zwei je Farbe, eine Dreiergruppe je Farbe, fünf einer Farbe in einer Schlange, sechs gelbe nebeneinander, fünf violette in einer Reihe. Regenbogenschlange und Farbenfusion zählen dabei als die Farbe, mit der die Aufgabe erfüllt ist, bei jeder Aufgabe neu. Eine Blockade zählt nicht und unterbricht Reihen.

## Bestanden, wenn

Die drei Regeltestdateien `A9_aufgaben_farbmengen.test.ts`, `A9_aufgaben_reihen.test.ts` und `A9_aufgaben_joker_farbmengen.test.ts` sind grün. Lila Riese ist mit vier violetten Karten nicht erfüllt, mit fünf schon. Eine Regenbogenschlange zwischen fünf gelben und vier violetten Karten löst in einer Aktion Gelber Schatz und Lila Riese aus. Gelber Schatz bleibt bei Spieler 1, auch wenn die Regenbogenschlange in der Wertung als Violett zählt oder ein Gegner später eine Blockade in die Reihe legt.

## Fehlgeschlagen, wenn

Ein Test ist rot, etwa weil vier violette Karten schon Lila Riese erfüllen, die zwei Karten unter einer Fusion einzeln zählen oder eine erfüllte Aufgabe wieder auf den Tisch zurückgeht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo mit `npm ci`, Stand ab Commit e0e8098 |

## Testdaten

Stellungen aus dem Baukasten mit echten Karten (`farbmengen_hilfen.ts`), je Aufgabe 11 bis 13 Zeilen einer Entscheidungstabelle, dazu Abläufe mit Zug und Gegnerzug.

## Technische Prüfung

`npx vitest run src/engine/__tests__/regeln/A9_aufgaben_farbmengen.test.ts src/engine/__tests__/regeln/A9_aufgaben_reihen.test.ts src/engine/__tests__/regeln/A9_aufgaben_joker_farbmengen.test.ts` endet mit 0. Zwei Gegenproben machen Tests rot: Lila Riese mit 4 statt 5 (fünf Tests), Joker unterbrechen in Farbharmonie statt eine Farbe zu wählen (fünf Tests).

## Nicht abgedeckte Grenzfälle

Reine Jokerreihen (fünf Joker ohne violette Karte als Lila Riese, zwei Regenbogenschlangen statt beider grünen Karten bei Farbenpracht) zählt die Umsetzung mit; ob das gilt, ist eine offene Auslegungsfrage an den Autor und hat keinen dauerhaften Test. Der Zeitpunkt „am Ende des Zugs“ bei Farbenpracht ist ebenso offen. Eine Gegenprobe mit vollständiger Jokersuche über zufällige Schlangen lief nur als temporärer Test des Prüfers.
