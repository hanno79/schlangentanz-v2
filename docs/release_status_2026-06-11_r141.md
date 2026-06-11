# R141 Release-Nachweis — Aktionen spielerfreundlich benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R141 — der Aktionenbereich und die Spielerführung verwenden sichtbare `spielbar`-Copy statt technischem Legalitätsjargon.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `8b47360`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer bounded Claude-/Codex-/Vercel-/Testprozess.
- R140 war final dokumentiert, gepusht, deployed und gesmoked.

Daher wurde der nächste kleine sichere UI-/Copy-Härtungsslice begonnen.

## Scope

R141 ist ein enger UI-/Copy-Slice:

- Bereich: sichtbare Copy im `Aktionen`-Panel und in der daraus gespeisten Spielerführung.
- Änderung: `Legale Aktionen`, `Weitere legale Aktionen`, `Legale Aktionen dieser Phase`, `Eine legale Aktion auswählen` und `Derzeit keine legale Aktion verfügbar` werden in sichtbarer UI-Copy zu spielerfreundlicher `spielbar`-Sprache.
- Erhalten: Engine-State, Regelprüfung, Aktionslabels, Layout, Drag&Drop, Phasenlogik und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine Umbenennung interner Engine-Helfer oder des bestehenden äußeren technischen `aria-label="Legale Aktionen"`.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r141_aktionen_copy.test.tsx` wurde zuerst geschrieben.
- `npm test -- --run src/App.r141_aktionen_copy.test.tsx` schlug erwartungsgemäß fehl, weil im Aktionenbereich noch `Legale Aktionen: 5`, `Weitere legale Aktionen` und `Legale Aktionen dieser Phase` sichtbar waren.

GREEN:

- `src/components/AktionenPanel.tsx` rendert die sichtbare Copy jetzt als `Spielbare Aktionen`, `Weitere Aktionen`, `Keine weiteren Aktionen`, `Spielbare Aktionen in dieser Phase` und `Aktuell keine spielbaren Aktionen in dieser Phase`.
- `src/App.tsx` liefert für den Pflichtschritt `Eine spielbare Aktion auswählen.` bzw. `Derzeit keine spielbare Aktion verfügbar...`.
- Stale positive Erwartungen in fokussierten und breiten UI-Tests wurden nachgezogen; der neue R141-Test sichert alte sichtbare Copy negativ ab.

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: Claude Code Auth antwortete weiterhin mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Separate Claude-`/simplify`-Vorprüfungen vor und nach Review-Fixes wurden versucht und scheiterten am selben Auth-Blocker.
- Da R141 ein enger mechanischer UI-Copy-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R141-Testdatei:

- Initiale `BLOCKERS`: Rest-Copy in `src/App.tsx` (`Eine legale Aktion auswählen`, `Derzeit keine legale Aktion verfügbar`) und stale positive Erwartungen in `src/App.test.tsx`.
- Zweiter Re-Review-Blocker: `src/App.r59.test.tsx` erwartete weiter `Nächster Pflichtschritt: Eine legale Aktion auswählen`.
- Alle Blocker wurden reproduziert bzw. durch Tests belegt, im selben Slice korrigiert und erneut fokussiert getestet.
- Finaler Codex Re-Review: `BLOCKERS: Keine.` / `NON-BLOCKERS: Keine.`

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r141_aktionen_copy.test.tsx` → 1 Testdatei / 1 Test fehlgeschlagen wegen alter Aktionen-Copy.
- Review-RED: `npm test -- --run src/App.r141_aktionen_copy.test.tsx` → 1 Testdatei / 1 Test fehlgeschlagen wegen alter Pflichtschritt-Copy.
- Review-RED: Codex-Re-Review führte `npm test -- --run src/App.r59.test.tsx src/App.r141_aktionen_copy.test.tsx` aus → `src/App.r59.test.tsx` fehlgeschlagen wegen stale Pflichtschritt-Erwartung.
- Nach Fixes: `npm test -- --run src/App.r59.test.tsx src/App.r141_aktionen_copy.test.tsx src/App.f14_spielerfuehrung.test.tsx src/App.f28_no_action_hinweis.test.tsx src/App.test.tsx` → 5 Testdateien / 32 Tests grün.
- Finaler Review-Testlauf: `npm test -- --run src/App.r141_aktionen_copy.test.tsx src/App.r59.test.tsx src/App.test.tsx src/App.f14_spielerfuehrung.test.tsx src/App.f28_no_action_hinweis.test.tsx src/App.r41.test.tsx src/App.r64.test.tsx` → 7 Testdateien / 34 Tests grün.

Full Gates:

- `npm test -- --run` → 147 Testdateien / 635 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-CtwzdNyJ.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`Line budget OK for changed script files: 15`).

## Git / GitHub

Feature-Commit:

- `b0cd08b R141: Aktionen spielerfreundlich benennen`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY` / Alias gesetzt.
- Ephemere Deployment-URL wird bewusst nicht als dauerhafte Release-Referenz dokumentiert.

## Production-Smoke

R141 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `/` und `/game`: HTTP 200.
- Kernregionen sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`.
- Slice-spezifisch sichtbar im Bereich `Aktionen`: `Spielbare Aktionen: <Zahl>`, `Nächster Pflichtschritt: Eine spielbare Aktion auswählen.`, `Weitere Aktionen`, `Spielbare Aktionen in dieser Phase`.
- Negative Live-Prüfung: keine sichtbare stale Copy `Legale Aktionen:`, `Weitere legale Aktionen`, `Legale Aktionen dieser Phase` oder `Eine legale Aktion auswählen` im Bereich `Aktionen`.
- Keine Console-/Page-Errors.
- Ein erster zu enger Smoke auf `Spielbare Aktionen: 5` wurde nach DOM-Inspektion korrigiert, weil die Production-Startkarten zufällig variieren; der finale Smoke prüft deshalb `Spielbare Aktionen: <Zahl>`.

## Finaler Status

R141 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R141

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
