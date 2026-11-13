---
id: TF-PRUEF-014
titel: Das neue include in vite.config.ts erfasst genau die Testdateien, die Vitest vorher mit seinem Standardmuster gefunden hat.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3b-pruefwerkzeuge-nachschaerfen (PR #28)
grenzfall_von: TF-PRUEF-013
---

## Worum es geht

P0.3b beschränkt Vitest auf `src/**/*.test.{ts,tsx}` und `tests/**/*.test.{ts,tsx}`, damit die Kopien unter `.claude/` nicht mitlaufen. Dabei darf keine bisherige Testdatei still herausfallen.

## Bestanden, wenn

Die Menge der getrackten Dateien, die das alte Standardmuster (`**/*.{test,spec}.?(c|m)[jt]s?(x)` ohne `node_modules`, `dist`, `tests/layout`) trifft, ist auf `origin/neuaufbau` und auf dem geprüften Commit gleich der Menge, die das neue include trifft. Heute: 68 auf `origin/neuaufbau`, 70 auf dem Commit, Differenz zwischen den Mustern je 0. `npm test` meldet 70 Testdateien.

## Fehlgeschlagen, wenn

Eine Datei trifft nur das alte Muster, oder `npm test` meldet weniger Testdateien, als das neue include trifft.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `origin/neuaufbau` geholt |

## Testdaten

Dateilisten aus `git ls-tree -r --name-only origin/neuaufbau` und `git ls-files`, je in eine Textdatei im eigenen Scratchpad-Ordner geschrieben.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | beide Listen schreiben | `git ls-tree -r --name-only origin/neuaufbau > <scratchpad>/dateien-neuaufbau.txt`, dann `git ls-files > <scratchpad>/dateien-head.txt` | |
| 2 | Python | beide Muster auf beide Listen anwenden und vergleichen | Regex alt `\.(test|spec)\.(c|m)?[jt]sx?$` ohne `node_modules/`, `dist/`, `tests/layout/`; neu `^(src|tests)/.*\.test\.(ts|tsx)$` | Differenzen leer, Zahlen 68 und 70 |
| 3 | Git Bash | `npm test -- --run` | | „Test Files 70 passed (70)“ |
