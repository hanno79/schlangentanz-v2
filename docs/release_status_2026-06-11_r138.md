# R138 Release-Nachweis — Zugdiagnose spielerfreundlich benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R138 — die Entwicklungsdaten-Zeile `Spielschritt im Zug` zeigt spielerfreundliche Zugphasen-Copy statt roher interner `zugphase`-Werte.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `468c721`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer bounded Claude-/Codex-/Vercel-/Testprozess.
- R137 war final dokumentiert, gepusht, deployed und gesmoked.

Daher wurde der nächste kleine sichere UI-/Copy-Härtungsslice begonnen.

## Scope

R138 ist ein enger UI-/Copy-Slice:

- Bereich: `Spielstatus` → Entwicklungsdaten-Gruppe `Spielphase` → Zeile `Spielschritt im Zug`.
- Änderung: sichtbare interne Zugphasenwerte werden über den bestehenden `zugphaseLabel(...)`-Mapper gerendert:
  - `Nachziehphase` → `Karte ziehen`
  - `Ausspielphase` → `Karten ausspielen`
  - `Aufgabenpruefung` → `Aufgaben prüfen`
  - `Zugabschluss` → `Zug abschließen`
  - `Spielende` → `Spiel beendet`
- Erhalten: `Aktueller Spielschritt`, `Zugfortschritt`, `Partiestatus`, Engine-State, Regeln, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, kein Layout-Umbau, kein neuer Interaktionsfluss.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r138_zugdiagnose_copy.test.tsx` wurde zuerst geschrieben.
- `npm test -- --run src/App.r138_zugdiagnose_copy.test.tsx` schlug erwartungsgemäß mit 5 Fehlschlägen fehl, weil noch `Spielschritt im Zug: Nachziehphase/Ausspielphase/Aufgabenpruefung/Zugabschluss/Spielende` sichtbar war.

GREEN:

- `src/App.tsx` nutzt jetzt `zugphaseLabel(zustand.zugphase)` auch für `Spielschritt im Zug`.
- Stale positive Erwartungen wurden auf spielerfreundliche Labels nachgezogen:
  - `src/App.f9_zugfortschritt.test.tsx`
  - `src/App.r123_spielphase_copy.test.tsx`
  - `src/App.r134_aktueller_spielschritt_copy.test.tsx`
  - `src/App.test.tsx`

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: Claude Code Auth antwortete weiterhin mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Eine separate Claude-`/simplify`-Vorprüfung wurde ebenfalls versucht und scheiterte am selben Auth-Blocker.
- Da R138 ein enger mechanischer UI-Copy-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R138-Testdatei:

1. Erstes Review:
   - `BLOCKERS: Keine`.
   - `NON-BLOCKERS`: nur Bestätigungen zum Scope und fokussierten Testlauf.
2. Nach Full-Suite-Fund und `App.test.tsx`-Nachzug:
   - Re-Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
   - Codex bestätigte: keine positive Erwartung auf rohe `Spielschritt im Zug: <interne Phase>`-Werte im Scope; gezielte 5-Dateien-Verifikation → 38 Tests bestanden.

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r138_zugdiagnose_copy.test.tsx` → 1 Testdatei / 5 Tests fehlgeschlagen wegen roher Zugphasenwerte.
- Nach Fix: `npm test -- --run src/App.r138_zugdiagnose_copy.test.tsx src/App.f9_zugfortschritt.test.tsx src/App.r134_aktueller_spielschritt_copy.test.tsx src/App.r123_spielphase_copy.test.tsx` → 4 Testdateien / 12 Tests grün.
- Nach Full-Suite-Fund: `npm test -- --run src/App.test.tsx src/App.r138_zugdiagnose_copy.test.tsx src/App.f9_zugfortschritt.test.tsx src/App.r134_aktueller_spielschritt_copy.test.tsx src/App.r123_spielphase_copy.test.tsx` → 5 Testdateien / 38 Tests grün.

Full Gates:

- `npm test -- --run` → 144 Testdateien / 632 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-DVg0-OXZ.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check` → grün.
- Zeilenbudget:
  - `src/App.tsx`: 496 Zeilen.
  - `src/App.test.tsx`: 498 Zeilen.
  - `src/App.r138_zugdiagnose_copy.test.tsx`: 45 Zeilen.

## Git / GitHub

Feature-Commit:

- `ee478c2 R138: Zugdiagnose spielerfreundlich benennen`

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

R138 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- Sichtbar im `Spielstatus`: `Aktueller Spielschritt: Karten ausspielen`.
- Sichtbar im `Spielstatus`: `Spielschritt im Zug: Karten ausspielen`.
- Sichtbar im `Spielstatus`: `Partiestatus: Laufende Partie`.
- Negative Live-Prüfung: keine sichtbare stale Copy `Aktueller Spielschritt: Ausspielphase`.
- Negative Live-Prüfung: keine sichtbare stale Copy `Spielschritt im Zug: Ausspielphase`.
- Keine Console-/Page-Errors.

## Finaler Status

R138 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R138

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
