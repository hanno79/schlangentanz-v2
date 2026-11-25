---
id: TF-ENGINE-091
titel: Ein Testname, den der Meta-Test der Satz-für-Satz-Tabelle nicht erkennt, macht die Tabelle rot und nie fälschlich grün.
art: automatisch
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
skript: src/engine/__tests__/regeln_abdeckung.test.ts
aenderung: task/X7-abnahme-erweiterung (PR #120)
---

## Worum es geht

Der Meta-Test liest die Testnamen mit einem regulären Ausdruck. Bei `it.each(...)` endet die Tabelle für ihn an der ersten schliessenden Klammer. Steht in der Tabelle selbst eine Klammer, etwa ein Funktionsaufruf oder ein regulärer Ausdruck mit Gruppe, erkennt er den Namen dieses Tests nicht. Geprüft wird, in welche Richtung das wirkt.

## Bestanden, wenn

Eine Zählung über `src/engine/__tests__/regeln/` findet, welche `.each`-Aufrufe der Ausdruck übersieht (am 25.11.2026: 3 von 45, in A5, A6 und A7.1, keiner in A7.10, A8 oder A9). Wird einer dieser Namen in der Tabelle genannt, endet `npx vitest run src/engine/__tests__/regeln_abdeckung.test.ts` mit Exit 1 und nennt ihn unter „genannte Tests, die es in der Datei nicht gibt“. Danach zeigt `git status` keine Änderung.

## Fehlgeschlagen, wenn

Der Meta-Test bleibt mit dem genannten, nicht erkannten Namen grün, oder die Tabelle nennt heute schon einen Test, den der Ausdruck übersieht.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand, `npm ci` gelaufen |

## Testdaten

`A7.1_farbendieb › A7.1: die Stelle %i gibt es in einer eigenen Schlange mit zwei Karten nicht; abgelehnt, mit Grund`, ein `it.each`, dessen Tabelle reguläre Ausdrücke mit Klammern enthält.

## Technische Prüfung

Zählskript über alle `describe|it|test.each(`-Aufrufe unter `regeln/` mit dem Ausdruck aus `testnamen()`; dann den Namen oben an die Zeile „Danach ist sie verbraucht.“ der Tabelle anhängen, Meta-Test ausführen, erwartet Exit 1; `git checkout -- docs/abnahme/X7_satz_fuer_satz.md`.

## Nicht abgedeckte Grenzfälle

Ein Testname, der über mehrere Zeilen geht oder einen Platzhalter `${…}` enthält, ist nicht eigens geprüft; er würde ebenfalls nicht erkannt und damit ebenfalls rot.
