---
id: TF-ENGINE-054
titel: Der Golden Master bleibt gleich, wenn die Engine ihre Aktionen in anderer Reihenfolge aufzählt.
art: automatisch
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: ja
skript: src/engine/__tests__/golden_master.test.ts
aenderung: task/E11-abnahme-basis (PR #72)
grenzfall_von: TF-ENGINE-050
---

## Worum es geht

Das Protokoll wählt gleichverteilt unter den Aktionen, nachdem es sie nach ihrer JSON-Form sortiert hat. Eine neue Reihenfolge der Aufzählung darf den eingefrorenen Verlauf deshalb nicht ändern; sonst bräche jede harmlose Umstellung der Engine den Golden Master, und eine echte Regeländerung fiele darin kaum noch auf.

## Bestanden, wenn

Mit umgekehrter Reihenfolge in `ermittleAktionen` endet `npx vitest run src/engine/__tests__/golden_master.test.ts` mit 0, alle 7 Tests grün.

## Fehlgeschlagen, wenn

Der Golden Master meldet mit umgekehrter Reihenfolge einen abweichenden Verlauf.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf dem geprüften Stand, `git status` ohne Änderung |

## Testdaten

`src/engine/aktionen/enumerieren.ts`: die Liste, die `ermittleAktionen` zurückgibt, mit `.reverse()` umkehren.

## Zurücksetzen

`git checkout -- src/engine/aktionen/enumerieren.ts`, danach zeigt `git status` keine Änderung.

## Technische Prüfung

`npx vitest run src/engine/__tests__/golden_master.test.ts` mit der umgekehrten Liste; erwartet Exit 0.
