# R142 Release-Nachweis — Spielbereich-Landmark spielerfreundlich benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R142 — der äußere Spielbereich-Landmark heißt für Screenreader `Spielbereich` statt technisch/falsch `Legale Aktionen`.

## Resume-Befund

Der Cron-Lauf fand einen bereits begonnenen, aber noch nicht releaseden R142-Slice vor:

- `src/App.tsx` war lokal auf `aria-label="Spielbereich"` geändert.
- `src/App.r142_spielbereich_landmark_copy.test.tsx` war als RED/GREEN-Test neu angelegt.
- Mehrere breite Tests waren noch uneinheitlich auf alte Landmark-Namen bzw. zu breite Aktionsbutton-Queries ausgerichtet.
- Claude Code war durch `Failed to authenticate. API Error: 401 Invalid authentication credentials` blockiert.

Der Lauf hat deshalb keinen neuen Slice begonnen, sondern R142 fertiggestellt.

## Scope

R142 ist ein enger A11y-/Copy-Slice:

- Änderung: Der äußere Kompositions-Landmark in `src/App.tsx` heißt `Spielbereich`.
- Erhalten: Das innere Aktionen-Panel bleibt `Aktionen`; Aktionsbuttons, Engine-Regeln, Layout, Drag&Drop und Spielverhalten bleiben unverändert.
- Nicht-Ziele: keine Regel-/Engine-Änderung, keine Umbenennung interner Engine-Helfer, kein neues Interaktionsmodell.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r142_spielbereich_landmark_copy.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r142_spielbereich_landmark_copy.test.tsx` schlug vor der Produktionsänderung erwartungsgemäß fehl, weil der äußere Bereich noch als `Legale Aktionen` benannt war.

GREEN:

- `src/App.tsx` rendert den äußeren Bereich jetzt als `<section className="spielbereich" aria-label="Spielbereich">`.
- Der R142-Test prüft `Spielbereich`, die darin enthaltenen Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Spielerübersicht` und negativ den alten Landmark `Legale Aktionen`.
- Stale Test-Queries wurden konsistent nachgezogen:
  - äußere Kompositions-/Status-/Material-/Spielerübersicht-Assertions auf `Spielbereich`,
  - Aktionsbutton-Assertions und Klicks auf das innere `Aktionen`-Panel.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Separate Claude-`/simplify`-Vorprüfung wurde wiederholt versucht.
- Blocker in beiden Fällen: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R142 ein enger mechanischer A11y-Copy-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell fertiggestellt und danach objektiv getestet/reviewed.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R142-Testdatei:

- Initiale Blocker: mehrere Tests waren fälschlich auf das innere `Aktionen`-Panel umgestellt, obwohl sie den äußeren Spielbereich prüfen; außerdem waren Aktionsbutton-Queries in `App.test.tsx` zu breit über `Spielbereich` gescoped.
- Zweiter Re-Review-Blocker: Action-Button-Queries in `App.r35/r36/r38/r43/r44/r45/r46/r47` waren weiterhin zu breit auf `Spielbereich` gescoped.
- Alle Blocker wurden im selben Slice korrigiert und fokussiert getestet.
- Finaler Codex Re-Review: `BLOCKERS: Keine.`

## Lokale Gates

Fokustests:

- Nach erster Test-Nachziehung: `npm test -- --run src/App.r142_spielbereich_landmark_copy.test.tsx src/App.f3_status_panels.test.tsx src/App.f20_endphase_hinweis.test.tsx src/App.r62.test.tsx src/App.test.tsx` → grün.
- Nach zusätzlicher stale-Test-Korrektur: `npm test -- --run src/App.r142_spielbereich_landmark_copy.test.tsx src/App.r35.test.tsx src/App.r36.test.tsx src/App.r38.test.tsx src/App.r39.test.tsx src/App.r40.test.tsx src/App.r43.test.tsx src/App.r44.test.tsx src/App.r45.test.tsx src/App.r46.test.tsx src/App.r47.test.tsx src/App.r48.test.tsx src/App.r69.test.tsx src/App.test.tsx src/App.f3_status_panels.test.tsx src/App.f20_endphase_hinweis.test.tsx src/App.r62.test.tsx` → 17 Testdateien / 48 Tests grün.
- Finaler Review-Testlauf durch Codex: 24 betroffene Testdateien / 57 Tests grün.
- Nach letztem TypeScript-Fix: `npm test -- --run src/App.test.tsx src/App.r142_spielbereich_landmark_copy.test.tsx` → 2 Testdateien / 27 Tests grün.

Full Gates:

- `npm test -- --run` → 148 Testdateien / 636 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-BhtlB5MJ.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`Line budget OK for changed script files: 25`).

## Git / GitHub

Feature-Commit:

- `8d6205e R142: Spielbereich-Landmark spielerfreundlich benennen`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY` / Alias gesetzt.
- Ephemere Deployment-URL wird bewusst nicht als dauerhafte Release-Referenz dokumentiert.

## Production-Smoke

R142 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `/` und `/game`: HTTP 200.
- Kernregionen sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`.
- Slice-spezifisch sichtbar im äußeren Landmark: `Spielbereich` enthält `Spielstatus`, `Aktiver Spieler`, `Aktionen` und `Spielerübersicht`.
- Negative Live-Prüfung: kein Landmark `Legale Aktionen`.
- Keine Console-/Page-Errors.

## Finaler Status

R142 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R142

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
