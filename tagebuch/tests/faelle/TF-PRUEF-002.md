---
id: TF-PRUEF-002
titel: Ein zusätzlicher Verstoss in einer Datei, die schon eine Ausnahme hat, lässt check:regeln fehlschlagen.
art: manuell
regression: nein
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3-pruefwerkzeuge (PR #26)
grenzfall_von: TF-PRUEF-001
---

## Worum es geht

`scripts/check_regeln_ausnahmen.json` duldet den Altbestand mit einer Zahl je Datei. Ein neuer Verstoss in einer solchen Datei darf nicht im Altbestand verschwinden.

## Bestanden, wenn

Ein angehängter Test ohne Spec-Abschnitt in `src/engine/__tests__/engine.test.ts` (erlaubt 39) führt zu Exit 1 mit „40 statt höchstens 39“. Ein zweites `eslint-disable` ohne Grund oder ein `any` in `src/hooks/usePartie.ts` (erlaubt 1) führt zu Exit 1 mit „2 statt höchstens 1“.

## Fehlgeschlagen, wenn

Einer der drei Eingriffe endet mit Exit 0.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, `npm run check:regeln` endet mit 0 |

## Testdaten

An `engine.test.ts` angehängt: `describe('Pruefer', () => { it('neuer Test ohne Abschnitt', () => {}) })`. An `usePartie.ts` angehängt: `// eslint-disable-next-line no-console` mit `export const pruefer = 1`, bzw. `export const pruefer: any = 1`.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | Zeilen aus „Testdaten“ an `engine.test.ts` anhängen | | |
| 2 | Git Bash im Repo | Gate ausführen | `node scripts/check_regeln.mjs; echo $?` | Exit 1, „40 statt höchstens 39 Verstösse (Ausnahmeliste)“, neue Zeile genannt |
| 3 | dieselbe Konsole | Datei zurücksetzen | `git checkout -- src/engine/__tests__/engine.test.ts` | |
| 4 | Editor und Konsole | Schritte 1 bis 3 mit den beiden Varianten für `usePartie.ts` wiederholen | | je Exit 1, „2 statt höchstens 1“ |
