---
id: TF-BUILD-001
titel: Unter Windows laufen npm ci und alle Gates aus Plan 3.5 jeweils mit Exit-Code 0.
art: manuell
regression: ja
prioritaet: hoch
herkunft: aenderung
angelegt: 2026-11-12
veraendert_daten: nein
aenderung: task/P0.2-lokale-umgebung (PR #24)
---

## Worum es geht

Die Arbeit am Neuaufbau läuft auf einem Windows-Rechner. Jeder Task muss dort seine Gates selbst ausführen können. Geprüft wird, dass Installation, Tests, Typprüfung, beide Builds, Zeilen- und CSS-Prüfung, eslint, Regelcheck und die Layout-Verträge ohne Fehler durchlaufen.

## Bestanden, wenn

Jeder der elf Befehle unter „Schritte“ endet einzeln mit Exit-Code 0. `npm test -- --run` meldet keinen fehlgeschlagenen Test, `npm run test:layout` meldet 0 failed.

## Fehlgeschlagen, wenn

Ein Befehl endet mit einem anderen Exit-Code als 0, etwa `npm run build:testhooks` mit 1 und der cmd-Meldung, der Befehl „VITE_TEST_HOOKS“ sei falsch geschrieben, oder `npm test` mit „window.localStorage.setItem is not a function“.

## Vorbedingungen

| Was | Wert |
|---|---|
| Anwendung | Repo-Arbeitskopie auf dem zu prüfenden Commit, Windows 11 |
| Ausgangslage prüfen | `node --version` zeigt mindestens 22.13; `git ls-files --eol` zeigt keine Zeile mit `w/crlf`; `netstat -ano` zeigt nichts auf den Ports 4173 und 4174 |

## Testdaten

Keine Eingabedaten. Der Testlauf nutzt den Stand des ausgecheckten Commits.

## Schritte

| # | Wo | Tun | Eingabe | Worauf achten |
|---|---|---|---|---|
| 1 | Git Bash oder PowerShell im Repo | Befehl ausführen, danach Exit-Code lesen | `npm ci` | Exit-Code 0, „added … packages“ |
| 2 | dieselbe Konsole | Befehl ausführen | `npm test -- --run` | Exit-Code 0, „Tests … passed“ ohne „failed“ |
| 3 | dieselbe Konsole | Befehl ausführen | `npm run typecheck` | Exit-Code 0, keine Ausgabe von tsc |
| 4 | dieselbe Konsole | Befehl ausführen | `npm run build` | Exit-Code 0, „built in …“ |
| 5 | dieselbe Konsole | Befehl ausführen | `npm run build:testhooks` | Exit-Code 0, Ausgabe nach `dist-testhooks/` |
| 6 | dieselbe Konsole | Befehl ausführen | `npm run check:test-lines` | Exit-Code 0, „Alle Testdateien bleiben unter 500 Zeilen.“ |
| 7 | dieselbe Konsole | Befehl ausführen | `npm run check:css-asserts` | Exit-Code 0, „Baseline gehalten“ |
| 8 | dieselbe Konsole | Befehl ausführen | `npx eslint .` | Exit-Code 0, keine Ausgabe |
| 9 | dieselbe Konsole | Befehl ausführen | `python scripts/regelcheck.py` | Exit-Code 0, „keine Fehler“ |
| 10 | dieselbe Konsole | Befehl ausführen | `npx playwright install chromium` | Exit-Code 0 |
| 11 | dieselbe Konsole | Befehl ausführen | `npm run test:layout` | Exit-Code 0, „0 failed“ bzw. nur „passed“ und „skipped“ |

## Nicht abgedeckte Grenzfälle

- `npm run check:regeln` fehlt noch; das Skript kommt erst mit Task P0.3 und wird dann als eigener Schritt ergänzt.
- Node genau 22.13.0 ist nicht geprüft, weil auf dem Prüfrechner nur Node 25 installiert ist; die Untergrenze hält `tests/lokale_umgebung.test.ts` fest.
- Belegte Ports 4173/4174 sind kein eigener Testfall: Playwright bricht dann mit `reuseExistingServer: false` ab, das ist gewolltes Verhalten.
