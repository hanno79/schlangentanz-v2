---
id: TF-ENGINE-010
titel: Der Zugablauf hält jede Aussage aus A5, A6 (Auffüllen), A7.6 (Aussetzen), A10, D12, D13, D14, D18, D21 und D25 in einem benannten Test fest, und alle sind grün.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/engine/__tests__/zugablauf_ausspielen.test.ts
aenderung: task/E2-zugablauf (PR #36)
---

## Worum es geht

Ab E2 lässt sich eine Partie spielen: Karte legen, Zug beenden, auffüllen, überzählige Karten abwerfen, aussetzen, Schlussrunde. Jeder Satz der Regeln dazu braucht einen Test, der ihn im Namen nennt; sonst fällt ein späterer Bruch erst im Spiel auf.

## Bestanden, wenn

Die drei Dateien `zugablauf_ausspielen`, `zugablauf_nachziehen` und `zugablauf_schlussrunde` sowie `aktionen.test.ts` laufen mit Exit 0. Die Liste im Prüfprotokoll `docs/abnahme/E2.md` nennt für jede E2-Aussage einen Test. Aussagen, die zu E3, E4 oder E5 bis E9 gehören, sind dort mit dem Task vermerkt.

## Fehlgeschlagen, wenn

Ein Test rot ist oder eine E2-Aussage ohne Test bleibt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E2-zugablauf`, `npm ci` gelaufen |

## Testdaten

Die Zustände baut der Szenario-Baukasten der Engine aus echtem Material (feste Hände, Stapel, Gruben).

## Technische Prüfung

`npx vitest run src/engine/__tests__/zugablauf_ausspielen.test.ts src/engine/__tests__/zugablauf_nachziehen.test.ts src/engine/__tests__/zugablauf_schlussrunde.test.ts src/engine/__tests__/aktionen.test.ts` endet mit Exit 0.

## Nicht abgedeckte Grenzfälle

Ausspielen ausserhalb des eigenen Zuges (Farbenschutz als Abwehr) gibt es erst mit E4; bis dahin stellen die Tests es mit einer kürzeren Hand nach. Der Verdoppler (zweiter Teilzug) kommt mit E3.
