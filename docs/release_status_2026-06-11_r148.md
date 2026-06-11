# R148 Release-Nachweis — Spielerübersicht per Überschrift labeln

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R148 — die `Spielerübersicht`-Region wird per sichtbarer Überschrift und `aria-labelledby` gelabelt.

## Resume-Befund

Der Cron-Lauf fand keinen halbfertigen Zustand vor:

- `HEAD` und `origin/main` standen zu Beginn beide auf `d3edafd`.
- Der Worktree war sauber; `git diff --check` hatte keine Befunde.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse.
- R147 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R148 begonnen.

## Scope

R148 ist ein enger A11y-/IDREF-Slice:

- Änderung: Die `Spielerübersicht`-Region im `Spielbereich` nutzt `aria-labelledby` auf ihre sichtbare Überschrift `Spielerübersicht`.
- Erhalten: sichtbare Copy, DebugGruppe `Spielerstatus`, `aria-current` für den aktiven Spieler, Spieler-/Schlangen-/Aufgabenübersicht, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine neue Interaktion, kein Layout-Refactor, keine Copy-Umbenennung und keine weiteren Regionen.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r148_spieleruebersicht_idref.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r148_spieleruebersicht_idref.test.tsx` schlug erwartungsgemäß fehl, weil die Spielerübersicht noch ein separates `aria-label="Spielerübersicht"` trug.

GREEN:

- `src/App.tsx` erzeugt ein komponentenlokales `spieleruebersichtTitelId` via `useId()`.
- Die Spielerübersicht rendert jetzt `<section className="info-panel" aria-labelledby={spieleruebersichtTitelId}>` und `<h2 id={spieleruebersichtTitelId}>Spielerübersicht</h2>`.
- `src/App.r148_spieleruebersicht_idref.test.tsx` prüft: kein separates `aria-label`, Single-Token-IDREF, genau ein IDREF-Ziel im Dokument, Ziel innerhalb der Region, sichtbarer Heading-Text `Spielerübersicht` und weiterhin ein eindeutiger Heading im Bereich.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Separate Claude-`/simplify`-Vorprüfung wurde versucht.
- Blocker in beiden Fällen: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R148 ein enger mechanischer A11y-IDREF-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R148-Testdatei:

- Codex Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- Hinweis: Ein erster Codex-Testlauf nutzte versehentlich die Jest-Option `--runInBand` und scheiterte daran; Codex wiederholte korrekt mit `npm test -- --run src/App.r148_spieleruebersicht_idref.test.tsx`, der Test war grün.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r148_spieleruebersicht_idref.test.tsx src/App.r147_aktiver_spieler_idref.test.tsx src/App.r146_spielstatus_idref.test.tsx src/App.r144_punktetafel_idref.test.tsx` → 4 Testdateien / 4 Tests grün.

Full Gates:

- `npm test -- --run` → 154 Testdateien / 642 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-2LpWa3R3.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/App.tsx` 500 Zeilen; `src/App.r148_spieleruebersicht_idref.test.tsx` 30 Zeilen).

## Git / GitHub

Feature-Commit:

- `90b92aa R148: Spielerübersicht per Überschrift labeln`

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

R148 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `/` und `/game`: HTTP 200.
- Slice-spezifisch: Die `Spielerübersicht`-Region im `Spielbereich` hat `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region und kein separates `aria-label`.
- Live-Ergebnis: `R148 Live-Smoke bestanden: Spielerübersicht aria-labelledby=_r_6_, kein aria-label, Zieltext="Spielerübersicht"`.
- Keine Console-/Page-Errors.

## Finaler Status

R148 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R148

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
