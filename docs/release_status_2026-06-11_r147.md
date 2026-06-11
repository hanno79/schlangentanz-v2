# R147 Release-Nachweis — Aktiven Spieler per Überschrift labeln

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R147 — der `Aktiver Spieler`-Bereich wird per sichtbarer Überschrift und `aria-labelledby` gelabelt.

## Resume-Befund

Der Cron-Lauf fand keinen halbfertigen Zustand vor:

- `HEAD` und `origin/main` standen zu Beginn beide auf `dccf4aa`.
- Der Worktree war sauber; `git diff --check` hatte keine Befunde.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse.
- R146 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R147 begonnen.

## Scope

R147 ist ein enger A11y-/IDREF-Slice:

- Änderung: Der `Aktiver Spieler`-Bereich nutzt `aria-labelledby` auf seine sichtbare Überschrift `Aktiver Spieler`.
- Erhalten: `aria-live="polite"`, sichtbare Copy, Spieltisch, Aktionenpanel, Spielerführung, Debuggruppen, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine neue Interaktion, kein Layout-Refactor, keine Copy-Umbenennung und keine weiteren Regionen.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r147_aktiver_spieler_idref.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r147_aktiver_spieler_idref.test.tsx` schlug erwartungsgemäß fehl, weil der Aktiver-Spieler-Bereich noch ein separates `aria-label="Aktiver Spieler"` trug.

GREEN:

- `src/App.tsx` erzeugt ein komponentenlokales `aktiverSpielerTitelId` via `useId()`.
- Der Aktiver-Spieler-Bereich rendert jetzt `<section className="info-panel" aria-labelledby={aktiverSpielerTitelId} aria-live="polite">` und `<h2 id={aktiverSpielerTitelId}>Aktiver Spieler</h2>`.
- `src/App.r147_aktiver_spieler_idref.test.tsx` prüft: kein separates `aria-label`, erhaltenes `aria-live="polite"`, Single-Token-IDREF, genau ein IDREF-Ziel im Dokument, Ziel innerhalb der Region, sichtbarer Heading-Text `Aktiver Spieler` und weiterhin ein eindeutiger Heading im Bereich.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Separate Claude-`/simplify`-Vorprüfung wurde versucht.
- Blocker in beiden Fällen: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R147 ein enger mechanischer A11y-IDREF-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R147-Testdatei:

- Initial: `BLOCKERS: Keine`; Non-Blocker: Test sollte `aria-live="polite"` explizit absichern.
- Nachzug: Test um `expect(aktiverSpielerBereich).toHaveAttribute('aria-live', 'polite')` erweitert.
- Re-Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r147_aktiver_spieler_idref.test.tsx src/App.r132_aktiver_spieler_profil_copy.test.tsx src/App.r140_empfohlene_aktion_copy.test.tsx src/App.f31_spieltisch_layout.test.tsx` → 4 Testdateien / 5 Tests grün.

Full Gates:

- `npm test -- --run` → 153 Testdateien / 641 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-MuYwujXO.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/App.tsx` 499 Zeilen; `src/App.r147_aktiver_spieler_idref.test.tsx` 31 Zeilen).

## Git / GitHub

Feature-Commit:

- `d950a90 R147: Aktiven Spieler per Überschrift labeln`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY` / Alias gesetzt.
- Ephemere Deployment-URL wird bewusst nicht als dauerhafte Release-Referenz dokumentiert.

## Production-Smoke

Allgemeiner Smoke:

- `npm run smoke:production` gegen [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app).
- `/` und `/game`: HTTP 200.
- Kernregionen sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`.
- Keine Console-/Page-Errors.

R147 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `/` und `/game`: HTTP 200.
- Slice-spezifisch: Der `Aktiver Spieler`-Bereich im `Spielbereich` hat `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region, `aria-live="polite"` und kein separates `aria-label`.
- Live-Ergebnis: `R147 Live-Smoke bestanden: Aktiver-Spieler aria-labelledby=_r_4_, aria-live=polite, kein aria-label, Zieltext="Aktiver Spieler"`.
- Keine Console-/Page-Errors.

## Finaler Status

R147 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R147

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
