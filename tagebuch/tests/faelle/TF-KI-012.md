---
id: TF-KI-012
titel: Auch in späten Stellungen mit tausenden Aktionen bewertet die solide KI je Schritt höchstens 64 Stellungen und braucht deutlich unter einer Sekunde.
art: automatisch
regression: ja
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-21
veraendert_daten: nein
skript: src/ki/strategien/zugsuche.test.ts
aenderung: task/K2-solide-ki (PR #71)
---

## Worum es geht

Kriterium 8 von K2: Farbendieb, Schlangenfrass und Schlangenhäutung bieten in langen Schlangen tausende Ziele an. Die Zugsuche darf dann weder die Grenze der Bewertungen überschreiten noch spürbar lange rechnen, und jede gewählte Aktion muss die Prüfung der Engine bestehen.

## Bestanden, wenn

Jeder Schritt bleibt bei höchstens 64 Bewertungen und unter 1'000 ms, und `pruefeAktion` meldet für jede gewählte Aktion „erlaubt“.

## Fehlgeschlagen, wenn

Ein Schritt mehr als 64 Bewertungen braucht, 1'000 ms oder länger dauert oder eine unerlaubte Aktion wählt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/K2-solide-ki`, `npm ci` gelaufen |

## Testdaten

Baukasten zu viert mit Erweiterung, Saaten 4000 bis 4002, je Spieler zwei Schlangen aus 8 und 5 Farbkarten in Paaren; drei Hände für KI-Gegner 1 (unter anderem Farbendieb, Schlangenfrass, Schlangenhäutung), je laufend und in der Schlussrunde. Dazu alle Schritte der 38 Partien aus TF-KI-009 und der Erweiterungsprobe.

## Technische Prüfung

`npx vitest run src/ki/strategien/zugsuche.test.ts` endet mit Exit 0. Probe `pruefer_k2.test.ts` aus dem Beleg, Test „Zeit in späten Stellungen“.

## Nicht abgedeckte Grenzfälle

Die Zeit hängt vom Rechner ab; gemessen wurde auf dem Prüfrechner unter Windows 11 mit Node 25.
