---
id: TF-ENGINE-086
titel: Nach dem Merge von X1 bis X6 enden die volle Testsuite und der lange Dauerlauf auf neuaufbau grün.
art: automatisch
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-25
veraendert_daten: nein
skript: src/engine/__tests__/dauerlauf_lang.ts
aenderung: neuaufbau nach Merge #116 (X6)
eintrag: 2026-11-25-erweiterung-in-der-engine.md
---

## Worum es geht

Die Tasks X1 bis X6 wurden einzeln geprüft und nacheinander gemergt. Dieser Testfall hält fest, dass der zusammengeführte Stand als Ganzes grün ist, bevor die Schlussabnahme X7 beginnt.

## Bestanden, wenn

`npm test -- --run` endet mit 0 und `npm run test:dauerlauf` endet mit 0, beide auf demselben ausgecheckten Stand von `neuaufbau`.

## Fehlgeschlagen, wenn

Einer der beiden Befehle endet nicht mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo auf `neuaufbau` nach Merge #116, `npm ci` gelaufen |

## Testdaten

Die festen Saaten der Testsuite und des langen Dauerlaufs (`partienDesTeils` in `dauerlauf_lang.ts`).

## Technische Prüfung

`npm test -- --run` und danach `npm run test:dauerlauf`, nacheinander und ohne parallele Last; erwartet je Exit 0.

## Nicht abgedeckte Grenzfälle

Die eigene Zählung der Aktionen je Zustand aus TF-ENGINE-051 ist hier nicht enthalten; TF-ENGINE-051 nennt noch die Schranke 6'000, die X6 auf 20'000 angehoben hat, und wird mit X7 nachgeführt. Layout-Verträge und Browser gehören nicht zu diesem Testfall.
