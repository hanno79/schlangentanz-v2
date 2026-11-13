---
id: TF-SPEC-004
titel: Der Stand von P0.5 bleibt nach einem Merge mit dem aktuellen neuaufbau konfliktfrei, und Tests, Typecheck, check:regeln und eslint enden mit 0.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.5-regelfragen (PR #25)
grenzfall_von: TF-SPEC-001
---

## Worum es geht

Der Task-Branch zweigt von einem älteren `neuaufbau` ab; seither sind P0.4 (Abriss der alten Oberfläche) und P0.3b (schärferes `check:regeln`) gemergt. Die Zwischenabnahme soll auch auf dem Stand nach dem Merge halten.

## Bestanden, wenn

`git merge origin/neuaufbau` auf einem losgelösten HEAD meldet keinen Konflikt, und `npm test -- --run`, `npm run typecheck`, `npm run check:regeln`, `npx eslint .` enden je mit 0.

## Fehlgeschlagen, wenn

Der Merge meldet einen Konflikt oder ein Befehl endet nicht mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `git fetch origin` gelaufen |

## Testdaten

Prüfstand des Task-Branchs und der jeweils aktuelle `origin/neuaufbau` (bei dieser Prüfung `6ab9ce8`).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im Repo | auf losgelösten HEAD wechseln und mergen | `git switch --detach HEAD` und `git merge --no-edit origin/neuaufbau` | „Merge made“, kein Konflikt |
| 2 | dieselbe Konsole | Gates einzeln ausführen | `npm test -- --run`, `npm run typecheck`, `npm run check:regeln`, `npx eslint .` | je Exit 0 |
| 3 | dieselbe Konsole | zurück auf den Prüfbranch | `git switch <prüfbranch>` | Merge-Commit verworfen |
