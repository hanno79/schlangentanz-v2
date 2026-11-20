---
id: TF-KI-006
titel: Der Architekturtest wird rot, wenn eine KI-Datei ausser sicht.ts den vollen Zustand liest oder die Engine an src/engine/index.ts vorbei importiert.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-20
veraendert_daten: nein
skript: tests/architektur.test.ts
aenderung: task/K1-ki-schnittstelle
---

## Worum es geht

U3 und U5 liefen bis K1 leer, weil es unter `src/ki` keine Datei gab. Jetzt gibt es vier. Der Testfall zeigt, dass die Prüfung die echten Dateien erfasst und bei einem Verstoss in ihnen anschlägt, und hält fest, wo sie nicht hinsieht.

## Bestanden, wenn

`tests/architektur.test.ts` ist grün und meldet 4 Dateien unter `src/ki`. Liest `src/ki/schritt.ts` `zustand.nachziehstapel`, meldet U5 „src/ki/schritt.ts:49 liest Spielzustand: zustand.nachziehstapel“; importiert sie `../engine/aktionen/anwenden`, meldet U3 Zeile 2.

## Fehlgeschlagen, wenn

Einer der beiden Verstösse bleibt grün oder die vier KI-Dateien fehlen in der Prüfung.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K1-ki-schnittstelle`, `npm ci` gelaufen |

## Testdaten

Zwei eingefügte Zeilen in `src/ki/schritt.ts`, nach der Probe mit `git checkout -- src/ki/schritt.ts` zurückgesetzt.

## Technische Prüfung

`npx vitest run tests/architektur.test.ts` endet mit Exit 0, danach mit den beiden Verstössen mit Exit 1 und genau diesen zwei Meldungen.

## Nicht abgedeckte Grenzfälle

`Object.values(zustand)` und `JSON.parse(JSON.stringify(zustand))` in `src/ki/schritt.ts` erkennt die Prüfung nicht (Lauf mit diesen Zeilen: 44 Tests grün). Das ist eine Grenze des Werkzeugs aus P0.3, kein Verstoss im Code von K1; im Prüfprotokoll K1 als Hinweis vermerkt.
