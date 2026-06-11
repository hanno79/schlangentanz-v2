# R144 Release-Nachweis — Punktetafel per Überschrift labeln

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R144 — die Punktetafel-Region im Wertungsbereich wird per sichtbarer Überschrift und `aria-labelledby` gelabelt.

## Resume-Befund

Der Cron-Lauf fand keinen halbfertigen Zustand vor:

- `HEAD` und `origin/main` standen zu Beginn beide auf `795cf13`.
- Der Worktree war sauber; `git diff --check` hatte keine Befunde.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse.
- R143 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R144 begonnen.

## Scope

R144 ist ein enger A11y-/IDREF-Slice:

- Änderung: Die `Punktetafel`-Region im Bereich `Wertung` nutzt `aria-labelledby` auf ihre sichtbare Überschrift `Punktetafel`.
- Erhalten: sichtbare Copy, CSS-Klassen `scoreboard-*`, Punktelisten, Wertungslogik, Reihenfolge und Layout bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine neue Interaktion, kein Layout-Refactor, keine weitere Copy-Umbenennung.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r144_punktetafel_idref.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r144_punktetafel_idref.test.tsx` schlug erwartungsgemäß fehl, weil die Punktetafel-Region noch ein separates `aria-label="Punktetafel"` trug.

GREEN:

- `src/App.tsx` erzeugt ein komponentenlokales `punktetafelTitelId` via `useId()`.
- Die Punktetafel rendert jetzt `<section className="scoreboard-bereich" aria-labelledby={punktetafelTitelId}>` und `<h3 id={punktetafelTitelId}>Punktetafel</h3>`.
- `src/App.r144_punktetafel_idref.test.tsx` prüft: kein separates `aria-label`, Single-Token-IDREF, genau ein IDREF-Ziel im Dokument, Ziel innerhalb der Region, Heading-Text `Punktetafel` und weiterhin zwei Listeneinträge.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Separate Claude-`/simplify`-Vorprüfung wurde versucht.
- Blocker in beiden Fällen: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R144 ein enger mechanischer A11y-IDREF-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R144-Testdatei:

- `BLOCKERS: Keine`
- `NON-BLOCKERS: Keine`
- Codex führte zusätzlich den fokussierten Testlauf aus; 4 betroffene Testdateien / 4 Tests bestanden.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r144_punktetafel_idref.test.tsx src/App.r143_punktetafel_label.test.tsx src/App.f8_scoreboard.test.tsx src/App.r128_scoreboard_copy.test.tsx` → 4 Testdateien / 4 Tests grün.

Full Gates:

- `npm test -- --run` → 150 Testdateien / 638 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-C-xfS4o5.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/App.tsx` 497 Zeilen; `src/App.r144_punktetafel_idref.test.tsx` 30 Zeilen).

## Git / GitHub

Feature-Commit:

- `5573dac R144: Punktetafel per Überschrift labeln`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY` / Alias gesetzt.
- Ephemere Deployment-URL wird bewusst nicht als dauerhafte Release-Referenz dokumentiert.

## Production-Smoke

R144 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `/` und `/game`: HTTP 200.
- Kernregionen sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`.
- Slice-spezifisch: `Wertung` enthält die `Punktetafel`-Region; `Punktetafel` hat `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region und kein separates `aria-label`.
- Negative Live-Prüfung: keine `Scoreboard`-Region, kein `Scoreboard`-Heading und keine sichtbare `Scoreboard`-Copy im `Wertung`-Bereich.
- Keine Console-/Page-Errors.

## Finaler Status

R144 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R144

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
