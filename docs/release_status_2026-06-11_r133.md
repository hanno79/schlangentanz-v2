# R133 Release-Nachweis — Zugfortschritt spielerfreundlich benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R133 — die sichtbare Zugfortschritt-Schrittleiste zeigt spielerfreundliche Phasenlabels statt roher interner Zugphasenwerte.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `ba3ed06`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer bounded Claude-/Codex-/Vercel-/Testprozess.
- Keine offene tentative Release-Doku; R132 war final synchronisiert.

Daher wurde der nächste kleine sichere UI-/Copy-/A11y-Slice begonnen.

## Scope

R133 ist ein enger UI-/Copy-/A11y-Härtungsslice:

- Bereich: `Spielstatus` → sichtbare Region `Zugfortschritt`.
- Änderung: Die Schrittleiste zeigt verständliche Spielschritte:
  - `Karte ziehen`
  - `Karten ausspielen`
  - `Aufgaben prüfen`
  - `Zug abschließen`
  - `Spiel beendet`
- Erhalten: Engine-Regeln, Zugphasenwerte, Debug-/Entwicklungsdatenzeile `Spielschritt im Zug: <interne Phase>`, Aktionsbuttons, Layout und IDREF-/Landmark-Struktur.

## TDD / Regressionen

RED:

- `src/App.f9_zugfortschritt.test.tsx` wurde zuerst auf die neuen spielerfreundlichen Labels verschärft.
- Der fokussierte RED-Lauf `npm test -- --run src/App.f9_zugfortschritt.test.tsx` schlug erwartungsgemäß mit 5 fehlgeschlagenen Tests fehl, weil die Schrittleiste noch `Nachziehphase`, `Ausspielphase`, `Aufgabenprüfung`, `Zugabschluss` und `Spielende` renderte.

GREEN:

- `src/components/Zugfortschritt.tsx` mappt die fünf internen `Zugphase`-Werte lokal auf spielerfreundliche Labels.
- `src/App.f9_zugfortschritt.test.tsx` prüft alle fünf Schritte, genau einen aktiven `aria-current="step"`-Eintrag und stellt sicher, dass die Zugfortschritt-Region die rohen internen Phasenwerte nicht enthält.
- Die bestehende Debug-/Entwicklungsdaten-Assertion bleibt bewusst erhalten, damit der Slice nicht heimlich die Diagnosefläche verändert.

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: Claude Code Auth antwortete weiterhin mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R133 ein enger mechanischer UI-Copy-Slice war und der RED-Test eindeutig war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt.
- Eine echte Claude-`/simplify`-Vorprüfung wurde separat versucht, scheiterte aber am selben Auth-Blocker. Danach wurden Diff, fokussierte Tests, Codex-Review, Full Gates und Live-Smokes objektiv geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked Dateien:

- Scope: `src/components/Zugfortschritt.tsx` und `src/App.f9_zugfortschritt.test.tsx`.
- Codex-Ergebnis:
  - `BLOCKERS: Keine.`
  - `NON-BLOCKERS: Keine fachlichen oder A11y-/semantischen Regressionen gefunden.`
- Codex-Verifikation: `npm test -- src/App.f9_zugfortschritt.test.tsx src/App.r115_zugfortschritt_label_idrefs.test.tsx` → 2 Testdateien / 6 Tests grün.

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.f9_zugfortschritt.test.tsx` → 1 Testdatei / 5 Tests fehlgeschlagen wegen alter roher Phasenlabels in der Schrittleiste.
- Nach Fix: `npm test -- --run src/App.f9_zugfortschritt.test.tsx src/App.r115_zugfortschritt_label_idrefs.test.tsx` → 2 Testdateien / 6 Tests grün.

Full Gates:

- `npm test -- --run` → 139 Testdateien / 621 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-DpCR7kH3.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget:
  - `src/components/Zugfortschritt.tsx`: 62 Zeilen.
  - `src/App.f9_zugfortschritt.test.tsx`: 51 Zeilen.
  - `src/App.tsx`: 484 Zeilen.
  - `src/App.test.tsx`: 492 Zeilen.

## Git / GitHub

Feature-Commit:

- `b7d5ac5 R133: Zugfortschritt spielerfreundlich benennen`

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

R133 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `Spielstatus` und `Zugfortschritt` sind sichtbar.
- Live sichtbar: `Karte ziehen`, `Karten ausspielen`, `Aufgaben prüfen`, `Zug abschließen`, `Spiel beendet`.
- Negative Live-Prüfung: keine rohen Zugphasen `Nachziehphase`, `Ausspielphase`, `Aufgabenpruefung`, `Zugabschluss`, `Spielende` in der Zugfortschritt-Region.
- Genau ein aktiver Schritt mit `aria-current="step"`.
- Keine Console-/Page-Errors.

## Finaler Status

R133 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist als finaler Doku-Sync-Stand auf `main` übernommen. Der stabile Production-Alias wurde nach dem Doku-Sync erneut deployed und live gesmoked, damit `origin/main`, Dokumentation und Production denselben Stand abbilden.

## Nächster kleiner Schritt nach R133

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
