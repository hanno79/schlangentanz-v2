---
id: TF-ENGINE-089
titel: Drei Verfälschungen, die X7 absichern soll, machen je mindestens einen Test rot.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
skript: src/engine/__tests__/golden_master.test.ts
aenderung: task/X7-abnahme-erweiterung (PR #120)
---

## Worum es geht

Die Abnahme der Erweiterung stützt sich auf den Golden Master, seinen Abgleich der geheimen Aufgaben mit der Endwertung und den Meta-Test der Satz-für-Satz-Tabelle. Je eine absichtliche Verfälschung zeigt, dass diese Prüfungen den Fehler bemerken. Nach jeder Verfälschung wird die Datei zurückgesetzt.

## Bestanden, wenn

Jede der drei Verfälschungen endet mit Exit 1 und mindestens einem roten Test, der zur Verfälschung passt: (1) Rückstand für die Comeback-Karte 6 statt 5 macht die drei Golden-Master-Partien mit Erweiterung und 15 Tests in `A8.1_comeback.test.ts` rot; (2) eine geheime Aufgabe, die immer zählt, macht die drei Protokolle und die Prüfung „so viele geheime Aufgaben erfüllt, wie die Endwertung zählt“ rot; (3) ein verfälschter Testname und ein gelöschter Satz in der Tabelle machen zwei Tests in `regeln_abdeckung.test.ts` rot. Danach zeigt `git status` keine Änderung.

## Fehlgeschlagen, wenn

Eine Verfälschung lässt alle Tests grün, oder nach dem Zurücksetzen bleibt eine Änderung im Arbeitsbaum.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand, `npm ci` gelaufen |

## Testdaten

`src/engine/erweiterung/comeback.ts` (`RUECKSTAND`), `src/engine/scoring.ts` (`aufgabenVon`), `docs/abnahme/X7_satz_fuer_satz.md`.

## Technische Prüfung

1. `RUECKSTAND = 5` durch `6` ersetzen, `npx vitest run src/engine/__tests__/golden_master.test.ts src/engine/__tests__/regeln/A8.1_comeback.test.ts`, erwartet Exit 1; `git checkout -- src/engine/erweiterung/comeback.ts`.
2. In `aufgabenVon` die Bedingung `&& spieler.geheimeAufgabeErfuellt` streichen, `npx vitest run src/engine/__tests__/golden_master.test.ts`, erwartet Exit 1 mit „D35: so viele geheime Aufgaben erfüllt, wie die Endwertung zählt“; `git checkout -- src/engine/scoring.ts`.
3. In der Tabelle „geht nicht“ zu „geht doch“ ändern und die Zeile „Es gelten auch Reihen.“ löschen, `npx vitest run src/engine/__tests__/regeln_abdeckung.test.ts`, erwartet Exit 1; `git checkout -- docs/abnahme/X7_satz_fuer_satz.md`.

## Nicht abgedeckte Grenzfälle

Verfälscht sind drei Stellen, nicht jede Regel der Erweiterung; die übrigen sichern die Regeltests und Prüfprotokolle von X1 bis X6.
