---
id: TF-ENGINE-011
titel: Verfälscht man eine Regel des Zugablaufs in zugablauf.ts, pruefen.ts, enumerieren.ts, anwenden.ts oder farbkarte.ts, wird ein passender Test rot.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/E2-zugablauf (PR #36)
grenzfall_von: TF-ENGINE-010
---

## Worum es geht

Grüne Tests sagen nur etwas, wenn sie bei einer falschen Regel rot werden. Ein Skript des Prüfers ändert je Probe eine Stelle im Code, lässt die Tests laufen und stellt den Code wieder her: 18 Proben aus der PR-Tabelle und 13 eigene, etwa Auffüllen auf 4 statt 5 oder ein umgekehrter Uhrzeigersinn.

## Bestanden, wenn

Jede der 31 Proben macht mindestens einen Test rot, dessen Name zur geänderten Regel passt. Nach dem Lauf zeigt `git status` keine geänderte Quelldatei.

## Fehlgeschlagen, wenn

Eine Probe alle Tests grün lässt; dann hält kein Test diese Regel fest.

## Vorbedingungen

| Was | Wert |
|---|---|
| Ausgangslage | Worktree auf dem geprüften Stand von `task/E2-zugablauf`, `npm ci` gelaufen |

## Testdaten

Die 31 Proben (Datei, alte und neue Stelle) stehen im Prüfprotokoll `docs/abnahme/E2.md`, Abschnitt „Gegenprobe“; das Skript `gegenproben.py` des Prüfers setzt sie nacheinander um.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Konsole im Repo | je Probe die Stelle ändern, die drei Zugablauf-Dateien und `aktionen.test.ts` laufen lassen, Stelle zurücksetzen (oder `python -I gegenproben.py`) | `npx vitest run src/engine/__tests__/zugablauf_*.test.ts src/engine/__tests__/aktionen.test.ts` | je Probe eine Zeile mit `exit 1` und mindestens 1 rotem Test |
| 2 | Konsole im Repo | Stand prüfen | `git status --short` | keine geänderte Datei unter `src/` |
