---
id: TF-ENGINE-071
titel: Die Engine führt Zusatzaktionen, Zugerweiterungen, Ziehen mitten im Zug und Entscheidungen eines Gegners nach A5, A7.7, A7.8, A8, A10, D46, D47, D50, D52, D55, D56 und D57.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-23
veraendert_daten: nein
skript: src/engine/__tests__/regeln/A5_zusatzaktionen.test.ts
aenderung: task/X3-zusatzaktionen (PR #108)
---

## Worum es geht

X3 baut den Rahmen, auf dem Comeback, Risiko-Karte und Schlangenkorb aufsetzen. Die Regeltests prüfen ihn mit Test-Zusatzaktionen und Test-Entscheidungen, weil die echten Karten erst mit X4 bis X6 kommen.

## Bestanden, wenn

Die sechs Dateien `regeln/A5_zusatzaktionen.test.ts`, `regeln/A7.8_zugerweiterung.test.ts`, `regeln/A10_ziehen_im_zug.test.ts`, `regeln/A5_ueberhand_ausserhalb.test.ts`, `entscheidung.test.ts` und `src/ki/sicht.test.ts` sind grün.

## Fehlgeschlagen, wenn

Ein Test dieser Dateien ist rot.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo ab Commit 686159e |

## Testdaten

Baukasten-Zustände der Tests; Test-Karte und Test-Entscheidungen aus `rahmen_hilfen.ts` und `testing/testentscheidung.ts`.

## Technische Prüfung

`npx vitest run` mit den sechs Dateien; erwartet Exit-Code 0.

## Nicht abgedeckte Grenzfälle

Die eigenen Grenzfälle des Prüfers stehen in TF-ENGINE-068 bis TF-ENGINE-070.
