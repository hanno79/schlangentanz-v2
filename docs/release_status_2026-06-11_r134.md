# R134 Release-Nachweis — aktuellen Spielschritt spielerfreundlich benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R134 — die Entwicklungsdaten-Zeile `Aktueller Spielschritt` zeigt ein spielerfreundliches Zugphasenlabel, während die interne Diagnosezeile weiterhin den rohen Zugphasenwert zeigt.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `65ce129`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer bounded Claude-/Codex-/Vercel-/Testprozess.
- R133 war final dokumentiert, gepusht, deployed und gesmoked.

Daher wurde der nächste kleine sichere UI-/Copy-/A11y-Slice begonnen.

## Scope

R134 ist ein enger UI-/Copy-/A11y-Härtungsslice:

- Bereich: `Spielstatus` → `Entwicklungsdaten: Spielphase`.
- Änderung: `Aktueller Spielschritt:` nutzt dieselben spielerfreundlichen Labels wie die sichtbare Zugfortschritt-Komponente:
  - `Karte ziehen`
  - `Karten ausspielen`
  - `Aufgaben prüfen`
  - `Zug abschließen`
  - `Spiel beendet`
- Erhalten: Die Diagnosezeile `Spielschritt im Zug: <interne Phase>` bleibt bewusst unverändert.
- Nicht-Ziele: keine Engine-/Regeländerungen, keine Layoutänderungen, kein neuer Interaktionsfluss.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r134_aktueller_spielschritt_copy.test.tsx` wurde zuerst geschrieben.
- `npm test -- --run src/App.r134_aktueller_spielschritt_copy.test.tsx` schlug erwartungsgemäß fehl, weil `Aktueller Spielschritt: Ausspielphase` statt `Aktueller Spielschritt: Karten ausspielen` gerendert wurde.

GREEN:

- `src/zugphaseLabels.ts` stellt die gemeinsame Anzeigeabbildung von internen `Zugphase`-Werten auf spielerfreundliche Labels bereit.
- `src/components/Zugfortschritt.tsx` nutzt den gemeinsamen Helper statt einer komponentenlokalen Duplikation.
- `src/App.tsx` nutzt den Helper nur für `Aktueller Spielschritt:`; `Spielschritt im Zug:` rendert weiterhin den internen Wert.
- Stale Broad-Tests wurden aktualisiert:
  - `src/App.r123_spielphase_copy.test.tsx`
  - `src/App.test.tsx`

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: Claude Code Auth antwortete weiterhin mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R134 ein enger mechanischer UI-Copy-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt.
- Eine echte Claude-`/simplify`-Vorprüfung wurde separat versucht und scheiterte am selben Auth-Blocker. Danach wurden Diff, fokussierte Tests, Codex-Review, Full Gates und Live-Smokes objektiv geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked Dateien:

1. Erstes Review:
   - Blocker: `src/App.r123_spielphase_copy.test.tsx` erwartete noch stale `Aktueller Spielschritt: Ausspielphase`.
   - Fix: R123-Test auf `Aktueller Spielschritt: Karten ausspielen` aktualisiert und stale Copy negativ abgesichert.
2. Re-Review:
   - `BLOCKERS: Keine.`
   - `NON-BLOCKERS: Keine.`
3. Zweiter Re-Review nach Full-Suite-Fund in `src/App.test.tsx`:
   - `BLOCKERS: Keine.`
   - `NON-BLOCKERS: Keine.`

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r134_aktueller_spielschritt_copy.test.tsx` → 1 Testdatei / 1 Test fehlgeschlagen wegen alter roher Copy.
- Nach Fix: `npm test -- --run src/App.r134_aktueller_spielschritt_copy.test.tsx src/App.f9_zugfortschritt.test.tsx src/App.r119_entwicklungsdaten_inhalte.test.tsx` → 3 Testdateien / 7 Tests grün.
- Nach Codex-Blockerfix: `npm test -- --run src/App.r134_aktueller_spielschritt_copy.test.tsx src/App.r123_spielphase_copy.test.tsx src/App.f9_zugfortschritt.test.tsx src/App.r119_entwicklungsdaten_inhalte.test.tsx` → 4 Testdateien / 8 Tests grün.
- Nach Broad-Test-Sweep: `npm test -- --run src/App.test.tsx src/App.r134_aktueller_spielschritt_copy.test.tsx src/App.r123_spielphase_copy.test.tsx src/App.f9_zugfortschritt.test.tsx` → 4 Testdateien / 33 Tests grün.

Full Gates:

- `npm test -- --run` → 140 Testdateien / 622 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-xDze8uqH.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget:
  - `src/App.tsx`: 485 Zeilen.
  - `src/App.test.tsx`: 492 Zeilen.
  - `src/components/Zugfortschritt.tsx`: 48 Zeilen.
  - `src/App.r134_aktueller_spielschritt_copy.test.tsx`: 27 Zeilen.
  - `src/App.r123_spielphase_copy.test.tsx`: 48 Zeilen.
  - `src/zugphaseLabels.ts`: 23 Zeilen.

## Git / GitHub

Feature-Commit:

- `bd184d5 R134: Aktuellen Spielschritt spielerfreundlich benennen`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY` / Alias gesetzt.
- Ephemere Deployment-URL wird bewusst nicht als dauerhafte Release-Referenz dokumentiert.

## Production-Smoke

R107 Production-Smoke:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- Kernregionen sichtbar:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
- Ergebnis: `R107 Production-Smoke bestanden`.

R134 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `/game`: HTTP 200.
- Sichtbar: `Spielstatus`, `Entwicklungsdaten: Spielphase`, `Zugfortschritt`.
- Live sichtbar: `Aktueller Spielschritt: Karten ausspielen`.
- Diagnose erhalten: `Spielschritt im Zug: Ausspielphase`.
- Negative Live-Prüfung: `Aktueller Spielschritt: Ausspielphase` ist nicht sichtbar.
- Zugfortschritt nutzt weiter `Aktuelle Phase: Karten ausspielen`.
- Keine Console-/Page-Errors.

## Finaler Status

R134 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R134

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
