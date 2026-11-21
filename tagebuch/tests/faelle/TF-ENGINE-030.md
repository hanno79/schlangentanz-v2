---
id: TF-ENGINE-030
titel: Welche Karten noch Platzhalter sind, ergibt sich aus dem Kartenregister, und geht diese Ableitung kaputt, wird ein Test rot.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
aenderung: task/E4b-versetzt (PR #63)
---

## Worum es geht

Seit E4b steht in `aktionen.test.ts` keine Liste der umgesetzten Karten mehr. Die Platzhalter erkennt `istPlatzhalter` am Registereintrag. Ein Kartentask, der seine Datei füllt, soll die Testdatei nicht anfassen müssen. Der Test „D13: … ist noch ein Platzhalter“ muss dabei für jeden echten Platzhalter weiterlaufen und darf nicht still verschwinden.

## Bestanden, wenn

- Heute laufen sieben Tests „D13: … ist noch ein Platzhalter“: Regenbogenschlange, Schlangenfrass, Schlangenblockade, Farbendieb, Farbenfusion, Schlangenhäutung, Schlangenkorb des Glücks.
- Wird `schlangenblockade.ts` durch eine Definition ohne `platzhalter()` ersetzt, laufen ohne Änderung an `aktionen.test.ts` nur noch sechs, ohne Schlangenblockade.
- Gibt `istPlatzhalter` immer `false` zurück, wird mindestens ein Test rot.

## Fehlgeschlagen, wenn

Die Liste sich nicht von selbst ändert oder die Suite grün bleibt, obwohl `istPlatzhalter` keinen Platzhalter mehr erkennt und damit alle D13-Tests wegfallen.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E4b-versetzt`, `npm ci` gelaufen |

## Testdaten

Ersatz für `src/engine/karten/schlangenblockade.ts`: ein Objekt vom Typ `KartenDefinition<BlockadeLegenAktion>` mit `art: 'Schlangenblockade'`, `aktionstyp: 'BlockadeLegen'`, `ziele: () => []`, `pruefe: () => 'Test-Definition'`, `betroffene: () => []`, `wirke: (zustand) => zustand`. Verfälschung in `src/engine/karten/platzhalter.ts`: `return false && PLATZHALTER.has(definition);`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | Platzhaltertests ausführen | `npx vitest run src/engine/__tests__/aktionen.test.ts -t Platzhalter --reporter=verbose` | sieben Zeilen „D13: … ist noch ein Platzhalter“ |
| 2 | Editor | `schlangenblockade.ts` durch den Ersatz aus „Testdaten“ ersetzen | Ersatz | `aktionen.test.ts` bleibt unverändert |
| 3 | Konsole im Repo | Schritt 1 wiederholen | wie Schritt 1 | sechs Zeilen, Schlangenblockade fehlt, Exit 0 |
| 4 | Konsole im Repo | Datei zurücksetzen | `git checkout -- src/engine/karten/schlangenblockade.ts` | `git status` zeigt nichts |
| 5 | Editor | `istPlatzhalter` verfälschen | Verfälschung aus „Testdaten“ | nur diese Zeile geändert |
| 6 | Konsole im Repo | ganze Suite ausführen | `npx vitest run src/ tests/` | mindestens ein Test rot |
| 7 | Konsole im Repo | Datei zurücksetzen | `git checkout -- src/engine/karten/platzhalter.ts` | `git status` zeigt nichts |

## Nicht abgedeckte Grenzfälle

Ein Register ganz ohne Platzhalter (nach X6) ist nicht abgedeckt; dann darf die Liste leer sein, und der Schutz aus Schritt 6 muss anders aussehen, etwa ein direkter Test von `istPlatzhalter(platzhalter(...))`.
