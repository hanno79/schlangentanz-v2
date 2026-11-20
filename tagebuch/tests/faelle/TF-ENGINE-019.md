---
id: TF-ENGINE-019
titel: Drei Regenbogenschlangen allein in der zweiten Schlange heben den Vielfaltbonus der ersten Schlange nicht.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: src/engine/__tests__/wertung_joker_kombinatorik.test.ts
aenderung: task/E10b-vielfalt-regenbogen (PR #52)
grenzfall_von: TF-ENGINE-017
---

## Worum es geht

Der Vielfaltbonus wird je Schlange berechnet, und der höchste zählt (A11). Eine Schlange, die nur aus drei Regenbogenschlangen besteht, hat nach D32 keine Farbe; sie darf weder selbst einen Bonus bringen noch den der anderen Schlange ändern.

## Bestanden, wenn

Erste Schlange Blau, Blau, Blau, zweite Schlange Regenbogenschlange ×3, mit Erweiterung: Gruppenpunkte 3, Farben für den Vielfaltbonus `['Blau']` und `[]`, Vielfaltbonus 0, Summe ohne Kette 3.

## Fehlgeschlagen, wenn

Der Vielfaltbonus ist 1 oder die zweite Schlange nennt eine Farbe für den Vielfaltbonus.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie des Branches ab Commit 4c83fb0, `npm ci` gelaufen |

## Testdaten

Schlange 1: Blau ×3. Schlange 2: Regenbogenschlange ×3. Beide gehören demselben Spieler.

## Technische Prüfung

`werteSchlangen([schlange1, schlange2], true)` liefert `gruppenPunkte` 3, `vielfaltBonus` 0 und für Schlange 2 die Gruppe `Blau×3=0` mit leeren `vielfaltFarben`. Im Repo deckt der Kombinatoriktest „D32: 400 Auslagen mit vielen Regenbogenschlangen“ solche Auslagen mit zwei Schlangen gegen das Durchprobieren ab; den Einzelfall prüfte der Prüfer E10b mit eigenem Code.

## Nicht abgedeckte Grenzfälle

Dieselbe Lage mit einer Farbenfusion statt einer der Regenbogenschlangen ist offen (Rückfrage an den Autor) und deshalb nicht geprüft.
