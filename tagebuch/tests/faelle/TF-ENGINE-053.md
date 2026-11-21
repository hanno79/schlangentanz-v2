---
id: TF-ENGINE-053
titel: Der Meta-Test der Regeltestdateien wird auch bei einer falsch benannten, einer schweigsamen und einer ausgelagerten Testdatei rot.
art: automatisch
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
skript: src/engine/__tests__/regeln_abdeckung.test.ts
aenderung: task/E11-abnahme-basis (PR #72)
grenzfall_von: TF-ENGINE-052
---

## Worum es geht

Der Meta-Test soll nicht nur eine fehlende Datei melden. Er soll auch melden, wenn unter `regeln/` eine Datei für einen Abschnitt liegt, den der Plan nicht nennt, wenn die Tests einer Datei ihren Abschnitt nicht im Namen tragen, und wenn ein Regeltest ausserhalb von `regeln/` liegt.

## Bestanden, wenn

Jede der drei Probedateien lässt `npx vitest run src/engine/__tests__/regeln_abdeckung.test.ts` mit Exit 1 enden, mit genau dem passenden roten Test. Nach dem Löschen der Probedatei ist der Lauf wieder grün (Exit 0).

## Fehlgeschlagen, wenn

Eine Probedatei bleibt unbemerkt, der Lauf endet also mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand, `git status` ohne Änderung |

## Testdaten

Drei Probedateien, je mit einem einzigen Test `it('…', () => {})`:

1. `src/engine/__tests__/regeln/A7.10_korb.test.ts` mit Testname „A7.10: Probe“
2. `src/engine/__tests__/regeln/A7.1_probe.test.ts` mit Testname „Probe ohne Abschnitt“
3. `src/engine/__tests__/probe_regel.test.ts` mit Testname „A5: Probe“

## Zurücksetzen

Probedatei löschen, `git status` zeigt danach keine unversionierte Datei.

## Technische Prüfung

| Probedatei | erwartet rot |
|---|---|
| 1 | „E11: jede Datei unter regeln/ heisst <Abschnitt>_<thema>.test.ts, mit einem Abschnitt des Plans“ |
| 2 | „U1: jede Regeltestdatei nennt ihren Abschnitt in mindestens einem Testnamen“ |
| 3 | „E11: neben regeln/ liegen unter __tests__ nur Tests der Engine selbst, keine Regeltests“ |
