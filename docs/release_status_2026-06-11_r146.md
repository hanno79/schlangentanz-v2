# R146 Release-Nachweis — Spielstatus per Überschrift labeln

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R146 — der `Spielstatus`-Bereich wird per sichtbarer Überschrift und `aria-labelledby` gelabelt.

## Resume-Befund

Der Cron-Lauf fand keinen halbfertigen Zustand vor:

- `HEAD` und `origin/main` standen zu Beginn beide auf `7bc64f7`.
- Der Worktree war sauber; `git diff --check` hatte keine Befunde.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse.
- R145 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R146 begonnen.

## Scope

R146 ist ein enger A11y-/IDREF-Slice:

- Änderung: Der `Spielstatus`-Bereich nutzt `aria-labelledby` auf seine sichtbare Überschrift `Spielstatus`.
- Erhalten: sichtbare Copy, Debuggruppen, `Zugfortschritt`, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine neue Interaktion, kein Layout-Refactor, keine weitere Copy-Umbenennung und keine weiteren Regionen.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r146_spielstatus_idref.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r146_spielstatus_idref.test.tsx` schlug erwartungsgemäß fehl, weil der Spielstatusbereich noch ein separates `aria-label="Spielstatus"` trug.

GREEN:

- `src/App.tsx` erzeugt ein komponentenlokales `spielstatusTitelId` via `useId()`.
- Der Spielstatusbereich rendert jetzt `<section className="info-panel" aria-labelledby={spielstatusTitelId}>` und `<h2 id={spielstatusTitelId}>Spielstatus</h2>`.
- `src/App.r146_spielstatus_idref.test.tsx` prüft: kein separates `aria-label`, Single-Token-IDREF, genau ein IDREF-Ziel im Dokument, Ziel innerhalb der Region, sichtbarer Heading-Text `Spielstatus` und weiterhin ein eindeutiger Heading im Bereich.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Separate Claude-`/simplify`-Vorprüfung wurde versucht.
- Blocker in beiden Fällen: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R146 ein enger mechanischer A11y-IDREF-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R146-Testdatei:

- `BLOCKERS: Keine`.
- `NON-BLOCKERS: Keine fachlichen Einwände`; Codex bestätigte die IDREF-Vertragsprüfung und verifizierte den neuen Test direkt grün.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r146_spielstatus_idref.test.tsx src/App.f3_status_panels.test.tsx src/App.f22_spielende_status.test.tsx src/App.r123_spielphase_copy.test.tsx src/App.r137_partiestatus_copy.test.tsx src/App.r138_zugdiagnose_copy.test.tsx` → 6 Testdateien / 13 Tests grün.

Full Gates:

- `npm test -- --run` → 152 Testdateien / 640 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-CHnRcsaJ.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/App.tsx` 498 Zeilen; `src/App.r146_spielstatus_idref.test.tsx` 30 Zeilen).

## Git / GitHub

Feature-Commit:

- `eecb8cf R146: Spielstatus per Überschrift labeln`

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

R146 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `/` und `/game`: HTTP 200.
- Slice-spezifisch: Der `Spielstatus`-Bereich im `Spielbereich` hat `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region und kein separates `aria-label`.
- Live-Ergebnis: `R146 Live-Smoke bestanden: Spielstatus aria-labelledby=_r_3_, kein aria-label, Zieltext="Spielstatus"`.
- Keine Console-/Page-Errors.

## Finaler Status

R146 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R146

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
