---
id: TF-ENGINE-007
titel: Die Wertung rechnet jedes Beispiel aus A11, A7.3 und A7.7 richtig, mit Jokern, Vielfaltbonus, Kette ab 3 und geteiltem Sieg.
art: automatisch
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: src/engine/__tests__/wertung_farbgruppen.test.ts
aenderung: task/E10-wertung (PR #33)
---

## Worum es geht

Am Ende einer Partie entscheidet die Wertung, wer gewinnt. Sie muss jedes Rechenbeispiel der Website treffen: Farbgruppen, Joker als die beste Farbe, Vielfaltbonus mit Erweiterung, Kettenbonus erst ab 3 Farbkarten (D24) und geteilter Sieg bei Gleichstand (D22).

## Bestanden, wenn

`npx vitest run src/engine/__tests__/wertung_ src/entwicklung/szenarienWertung.test.tsx` endet mit Exit 0, alle Tests grün. Dabei ergeben unter anderem: A11 Beispiel 1 7 Punkte, A11 Beispiel 2 6 Punkte (Fusion als Violett), Rot-Rot-Rot-Blau-Rot-Rot-Rot-Rot 3 + 4 = 7, beide Vielfalt-Beispiele je 2 Bonuspunkte, Rot-Rot-Rot-Regenbogenschlange-Rot-Rot-Rot-Rot Kette 4 und 7 Punkte, A7.3 Beispiel 1 2 Punkte und Beispiel 3 4 Punkte.

## Fehlgeschlagen, wenn

Ein Test rot ist, etwa weil ein Beispiel eine andere Punktzahl ergibt oder Rot-Rot schon den Kettenbonus bekommt.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E10-wertung`, `npm ci` gelaufen |

## Testdaten

Die Schlangen in den Testdateien `src/engine/__tests__/wertung_*.test.ts` und die drei Wertungsszenarien in `src/entwicklung/szenarienWertung.ts`.

## Technische Prüfung

`npx vitest run src/engine/__tests__/wertung_ src/entwicklung/szenarienWertung.test.tsx`, erwartet Exit 0. Zusätzlich die Gesamtsuite `npm test -- --run`.

## Nicht abgedeckte Grenzfälle

Eine Gruppe nur aus Jokern (Regelfrage G9) ist umgesetzt, aber nicht eigens getestet, solange der Autor nicht geantwortet hat. Gegenproben und die eigene Jokerprüfung des Prüfers haben eigene Testfälle (TF-ENGINE-008, TF-ENGINE-009).
