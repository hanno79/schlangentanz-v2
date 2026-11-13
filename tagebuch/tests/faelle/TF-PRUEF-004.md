---
id: TF-PRUEF-004
titel: Ein weiterer Math.random-Aufruf in src/engine/state.ts, das zwei geduldete Aufrufe hat, lässt den Architekturtest fehlschlagen.
art: manuell
regression: nein
prioritaet: mittel
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3-pruefwerkzeuge (PR #26)
grenzfall_von: TF-PRUEF-003
---

## Worum es geht

`src/engine/state.ts` darf bis E1 zweimal `Math.random` als Standardwert nutzen (Eintrag `U4` in `scripts/check_regeln_ausnahmen.json`). Ein dritter Aufruf darf nicht im Altbestand verschwinden.

## Bestanden, wenn

Nach der Änderung von Zeile 24 zu `rng: () => number = () => Math.random() * Math.random(),` endet `npx vitest run tests/architektur.test.ts` mit Exit 1 und nennt drei Verstösse in `state.ts` (zweimal Zeile 24, einmal Zeile 50).

## Fehlgeschlagen, wenn

Der Lauf endet mit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, Architekturtest grün |

## Testdaten

Zeile 24 von `src/engine/state.ts` wie unter „Bestanden, wenn“.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Zeile 24 ändern | siehe „Testdaten“ | |
| 2 | Git Bash im Repo | Test ausführen | `npx vitest run tests/architektur.test.ts; echo $?` | Exit 1, drei Zeilen `U4 src/engine/state.ts:…` |
| 3 | dieselbe Konsole | zurücksetzen | `git checkout -- src/engine/state.ts` | `git status --short` leer |
