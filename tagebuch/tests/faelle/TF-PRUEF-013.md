---
id: TF-PRUEF-013
titel: Kein Gate erfasst Dateien unter .claude/, auch nicht eine vollständige Repo-Kopie unter .claude/worktrees/.
art: beides
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
skript: tests/claude_ordner.test.ts
aenderung: task/P0.3b-pruefwerkzeuge-nachschaerfen (PR #28)
---

## Worum es geht

Im Hauptordner liegen unter `.claude/worktrees/` die Arbeitskopien der Agenten. Liest ein Gate sie mit, prüft es fremde Stände und meldet deren Fehler, als wären es die eigenen.

## Bestanden, wenn

Mit dem Probe-Ordner aus „Testdaten“ enden `npm test -- --run` (gleich viele Testdateien wie ohne Probe), `npx eslint .`, `npm run check:regeln`, `npm run check:test-lines`, `npm run check:css-asserts` und `python scripts/regelcheck.py` mit Exit 0, und keine Ausgabe nennt `.claude`.

## Fehlgeschlagen, wenn

Ein Gate endet ungleich 0 oder nennt eine Datei unter `.claude/`.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | eigener Worktree auf dem zu prüfenden Commit, nach `npm ci`; nie im Hauptordner anlegen |
| Ausgangslage prüfen | alle sechs Gates enden mit 0; Zahl der Testdateien in `npm test` notieren |

## Testdaten

Unter `.claude/worktrees/fake/`: `tests/rot.test.ts` (`expect(1).toBe(2)`), `src/rot2.test.ts` (`it.only` mit `any`), `src/engine/__tests__/alt.test.ts` (Test ohne Abschnitt), `src/engine/zufall.ts` (`Math.random() + Date.now()`), `src/eslint_boese.ts` (`const unbenutzt: any = 1` und `var x = 1`), `tests/lang.test.ts` (601 Zeilen), `tests/css.test.ts` (Variable `appCss`), `src/ui/Gross.tsx` (400 Zeilen), `notiz.md` mit Eszett, `scripts/check_regeln_ausnahmen.json` mit kaputtem JSON. Direkt unter `.claude/`: `direkt.test.ts` (`it.only`, rot) und `direkt_boese.ts` (`any`).

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash im eigenen Worktree | Probe-Dateien aus „Testdaten“ anlegen | | `git status --short` bleibt leer (ignoriert) |
| 2 | Git Bash | `npm test -- --run; echo $?` | | Exit 0, gleiche Zahl Testdateien wie vorher |
| 3 | Git Bash | `npx eslint .; echo $?` | | Exit 0 |
| 4 | Git Bash | `npm run check:regeln; echo $?` | | Exit 0, gleiche Zahl geprüfter Dateien |
| 5 | Git Bash | `npm run check:test-lines; echo $?` und `npm run check:css-asserts; echo $?` | | je Exit 0, „0 in 0 Dateien“ |
| 6 | Git Bash | `python scripts/regelcheck.py; echo $?` | | Exit 0, kein `.claude` in der Ausgabe |
| 7 | Git Bash | Probe löschen | `rm -rf .claude` | `ls -a` zeigt kein `.claude` mehr |

## Nicht abgedeckte Grenzfälle

Testdateien mit anderer Endung (`.spec.ts` ausserhalb von `tests/layout/`, `.test.js`, `.test.mjs`) sammelt Vitest seit P0.3b nicht mehr; heute gibt es keine (TF-PRUEF-014). Ein Klon ohne die Zeile `/.claude/` in `.git/info/exclude`: `.gitignore` deckt nur `.claude/worktrees/` ab, Dateien direkt unter `.claude/` wären dort für git sichtbar; `regelcheck.py` liest aber nur getrackte Dateien.
