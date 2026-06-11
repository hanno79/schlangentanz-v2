# R137 Release-Nachweis — Partiestatus spielerfreundlich benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R137 — die Entwicklungsdaten-Zeile `Partiestatus` zeigt spielerfreundliche Copy statt roher interner `spielphase`-Werte.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `718b81d`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer bounded Claude-/Codex-/Vercel-/Testprozess.
- R136 war final dokumentiert, gepusht, deployed und gesmoked.

Daher wurde der nächste kleine sichere UI-/Copy-Härtungsslice begonnen.

## Scope

R137 ist ein enger UI-/Copy-Slice:

- Bereich: `Spielstatus` → Entwicklungsdaten-Gruppe `Spielphase` → Zeile `Partiestatus`.
- Änderung: sichtbare interne Werte werden gemappt:
  - `Normal` → `Laufende Partie`
  - `Endspurt` → `Endrunde läuft`
  - `Beendet` → `Partie beendet`
- Erhalten: `Spielschritt im Zug`, Endrunden-Hinweise, Zugfortschritt, Engine-State, Regeln, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, kein Layout-Umbau, keine Änderung der Zugphasen-Copy.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r137_partiestatus_copy.test.tsx` wurde zuerst geschrieben.
- `npm test -- --run src/App.r137_partiestatus_copy.test.tsx` schlug erwartungsgemäß fehl: sichtbar waren noch `Partiestatus: Normal`, `Partiestatus: Endspurt` und `Partiestatus: Beendet`.

GREEN:

- `src/App.tsx` nutzt jetzt `spielphaseLabel(...)` für die sichtbare `Partiestatus`-Zeile.
- `src/App.r123_spielphase_copy.test.tsx` und `src/App.f22_spielende_status.test.tsx` wurden auf die neue Copy nachgezogen.
- Die Full Suite deckte zusätzlich stale positive Erwartungen im R32-Block von `src/App.test.tsx` auf; diese wurden in denselben Slice gefaltet und mit negativen raw-copy Assertions gehärtet.

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: Claude Code Auth antwortete weiterhin mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Eine separate Claude-`/simplify`-Vorprüfung wurde ebenfalls versucht und scheiterte am selben Auth-Blocker.
- Da R137 ein enger mechanischer UI-Copy-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R137-Testdatei:

1. Erstes Review:
   - `BLOCKERS: Keine`.
   - `NON-BLOCKERS`: redundante Pre-Render-Abwesenheitsprüfung im neuen R137-Test.
2. Nach Teststil-Korrektur:
   - Re-Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
3. Nach Full-Suite-Fund und `App.test.tsx`-Nachzug:
   - Finales Re-Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
   - Codex bestätigte: keine positive Erwartung auf `Partiestatus: Normal/Endspurt/Beendet` im Scope; gezielte 4-Dateien-Verifikation → 32 Tests bestanden.

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r137_partiestatus_copy.test.tsx` → 1 Testdatei / 3 Tests fehlgeschlagen wegen roher `Partiestatus`-Werte.
- Nach Fix: `npm test -- --run src/App.r137_partiestatus_copy.test.tsx src/App.r123_spielphase_copy.test.tsx src/App.f22_spielende_status.test.tsx src/App.f21_endspurt_status.test.tsx` → 4 Testdateien / 8 Tests grün.
- Nach Full-Suite-Fund: `npm test -- --run src/App.test.tsx src/App.r137_partiestatus_copy.test.tsx src/App.r123_spielphase_copy.test.tsx src/App.f22_spielende_status.test.tsx` → 4 Testdateien / 32 Tests grün.

Full Gates:

- `npm test -- --run` → 143 Testdateien / 627 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-CdNh8t0Q.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check` → grün.
- Zeilenbudget:
  - `src/App.tsx`: 497 Zeilen.
  - `src/App.test.tsx`: 499 Zeilen.
  - `src/App.r137_partiestatus_copy.test.tsx`: 67 Zeilen.

## Git / GitHub

Feature-Commit:

- `b871c91 R137: Partiestatus spielerfreundlich benennen`

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

R137 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- Sichtbar im `Spielstatus`: `Partiestatus: Laufende Partie`.
- Negative Live-Prüfung: keine sichtbare stale Copy `Partiestatus: Normal` im erreichten Startzustand.
- Keine Console-/Page-Errors.

## Finaler Status

R137 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R137

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
