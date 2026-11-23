---
id: TF-ENGINE-073
titel: Joker über das Ende einer Schlange bilden keine Gruppe, und eine im Zug erfüllte Farbenpracht bleibt eingelöst, wenn eine eigene Fusion sie im selben Zug zerstört.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
aenderung: task/X2a-aufgaben-farbmengen (PR #107)
grenzfall_von: TF-ENGINE-072
---

## Worum es geht

Zwei Grenzfälle, die in der Entscheidungstabelle fehlen. Eine Regenbogenschlange am Ende der ersten Schlange darf nicht mit zwei violetten Karten am Anfang der zweiten eine Gruppe bilden. Und wer Farbenpracht mit einer Farbkarte erfüllt und gleich danach die beiden grünen Karten fusioniert, behält die Aufgabe, obwohl die Bedingung danach nicht mehr gilt.

## Bestanden, wenn

Farbharmonie ist mit der Regenbogenschlange am Ende von Schlange 1 nicht erfüllt und mit ihr am Anfang von Schlange 2 erfüllt. Nach Grün an schlange-1 hat Spieler 1 Farbenpracht; nach der Fusion über die beiden grünen Karten ist die Bedingung falsch, Farbenpracht steht weiter bei ihm, und die Fusion meldet kein Aufgabenereignis. Ohne Erweiterung meldet dieselbe fünfte blaue Karte kein Aufgabenereignis und es liegen keine Aufgaben aus.

## Fehlgeschlagen, wenn

Die Regenbogenschlange verbindet zwei Schlangen, Farbenpracht verschwindet nach der Fusion, oder ohne Erweiterung erscheint eine Aufgabe.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo mit `npm ci`, Stand ab Commit e0e8098 |

## Testdaten

Schlange 1 mit je drei Blau, Rot, Grün, Gelb, Braun und einer Regenbogenschlange, Schlange 2 Violett, Violett. Für Farbenpracht eine Schlange mit je zwei Karten von Blau bis Braun und einem Grün, Hand Grün und Farbenfusion.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Datei `src/engine/__tests__/tmp_grenzfaelle.test.ts` | anlegen, mit `stellung` aus `farbmengen_hilfen.ts` die zwei Farbharmonie-Stellungen bauen und `farbharmonie.istErfuellt(zustand, 0)` prüfen | Schlange 1 Blau×3, Rot×3, Grün×3, Gelb×3, Braun×3, Regenbogenschlange; Schlange 2 Violett, Violett; dann die Regenbogenschlange an den Anfang von Schlange 2 | erst `false`, dann `true` |
| 2 | dieselbe Datei | mit `tischMitHaenden(…, true)` und `legeAufgabenAus` (offen Farbenpracht, Gelber Schatz, Lila Riese) Grün mit `legeAn` legen, dann `FusionLegen` über die beiden letzten Karten ausführen | Schlange Blau, Blau, Rot, Rot, Gelb, Gelb, Violett, Violett, Braun, Braun, Grün; Hand Grün, Farbenfusion, Rot, Gelb, Blau | nach Grün: `erfuellteAufgaben` = Farbenpracht; nach der Fusion: `farbenpracht.istErfuellt` = `false`, Farbenpracht steht weiter bei Spieler 1, kein Aufgabenereignis |
| 3 | dieselbe Datei | ohne Erweiterung Blau an Blau×4 legen | Hand Blau, Rot, Gelb, Grün, Braun | kein Aufgabenereignis, `offeneAufgaben` leer |
| 4 | Kommandozeile | ausführen | `npx vitest run src/engine/__tests__/tmp_grenzfaelle.test.ts` | Exit 0; danach die Datei wieder löschen |

## Technische Prüfung

Ein temporärer Vitest-Test mit dem Baukasten (`stellung`, `tischMitHaenden`, `legeAn`, `fuehreAus`) prüft die vier Fälle; erwartet sind 4 bestandene Tests. Er liegt nicht im Repo.

## Nicht abgedeckte Grenzfälle

Ob Farbenpracht laut Kartentext erst am Zugende geprüft werden soll, entscheidet der Autor; dieser Testfall hält nur das heutige Verhalten fest.
