---
id: TF-PRUEF-012
titel: Der Architekturtest wird rot, wenn eine Datei unter src/engine Zufall oder Zeit über einen der sieben bekannten Umwege nutzt.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-13
veraendert_daten: nein
aenderung: task/P0.3b-pruefwerkzeuge-nachschaerfen (PR #28)
grenzfall_von: TF-PRUEF-003
---

## Worum es geht

Die Engine bekommt Zufall nur als Parameter und kennt keine Uhrzeit (U4). `Math.random()` direkt erkennt der Test seit P0.3. Hier geht es um die Schreibweisen, mit denen man dieselbe Funktion anders erreicht.

## Bestanden, wenn

Jede der sieben Zeilen aus „Testdaten“, allein in `src/engine/probe_u4.ts`, macht `npx vitest run tests/architektur.test.ts` rot (Exit 1). Die Meldung nennt `U4 src/engine/probe_u4.ts:1` und „Zufall kommt als Parameter“ oder „Zeit gehört nicht in die Engine“. Ohne die Datei ist der Test grün.

## Fehlgeschlagen, wenn

Eine der sieben Zeilen lässt den Test grün.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Arbeitskopie auf dem zu prüfenden Commit, nach `npm ci` |
| Ausgangslage prüfen | `npx vitest run tests/architektur.test.ts` endet mit 0 |

## Testdaten

1. `const { random } = Math` und `export const p = random()`
2. `export const p = Math['random']()`
3. `export const p = Math["random"]`
4. `export const p = globalThis.Math.random()`
5. `export const p = window.Math.random()`
6. `export const p = new Date`
7. `export const p = Date.now()`

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Editor | `src/engine/probe_u4.ts` mit Zeile 1 aus „Testdaten“ anlegen | | |
| 2 | Git Bash im Repo | Architekturtest ausführen | `npx vitest run tests/architektur.test.ts; echo $?` | Exit 1, Meldung mit `src/engine/probe_u4.ts:1` |
| 3 | Editor und Git Bash | Schritte 1 und 2 mit den Zeilen 2 bis 7 wiederholen | | je Exit 1 |
| 4 | Git Bash | Probe löschen und Test erneut | `rm src/engine/probe_u4.ts`, dann `npx vitest run tests/architektur.test.ts` | Exit 0 |
