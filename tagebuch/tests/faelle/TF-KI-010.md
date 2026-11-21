---
id: TF-KI-010
titel: Im letzten Zug mit Schlangengrube und Farbenschutz spielt die solide KI die Grube nicht, und ein Test der Suite hält diese Regel fest.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ki/strategien/solideKi.test.ts
aenderung: task/K2-solide-ki (PR #71)
grenzfall_von: TF-KI-009
---

## Worum es geht

Nach der Vorgabe des Autors spielt die KI eine Schlangengrube auf einen Spieler ohne Zug nur, wenn es keinen anderen erlaubten Zug gibt (D29). Hier gibt es einen: den Farbenschutz wirkungslos ablegen. Geprüft wird das Verhalten und ob die Suite merkt, wenn die Regel fehlt.

## Bestanden, wenn

Die KI legt den Farbenschutz ab und beendet den Zug. Wird in `src/ki/strategien/zugsuche.ts` die Zeile `const grubeOhneZug = …` auf `false` gesetzt, wird mindestens ein Test in `solideKi.test.ts` rot.

## Fehlgeschlagen, wenn

Die KI die Grube spielt oder die Suite mit entfernter Regel grün bleibt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K2-solide-ki`, `npm ci` gelaufen |

## Testdaten

Baukasten zu zweit ohne Erweiterung, Saat 211; KI-Gegner 1 mit Schlange Blau und Hand Schlangengrube, Farbenschutz; Schlussrunde von Spieler 1 ausgelöst; KI-Gegner 1 am Zug. KI-Zufall Saat 1.

## Technische Prüfung

Die Probe `pruefer_k2_grube.test.ts` aus dem Beleg vorübergehend unter `tests/` ablegen, mit `PRUEFER_LOG=<datei> npx vitest run tests/pruefer_k2_grube.test.ts` ausführen; erwartet „GESPIELT SonderkarteWirkungslosAblegen:farbenschutz-02 > ZugBeenden“. Dann die Regel wie oben entfernen und `npx vitest run src/ki/strategien/solideKi.test.ts` ausführen; erwartet Exit ungleich 0.
