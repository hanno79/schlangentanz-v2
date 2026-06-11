# R150 Release-Nachweis — Wertung per Überschrift labeln

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R150 — die `Wertung`-Region wird per sichtbarer Überschrift und `aria-labelledby` gelabelt.

## Resume-Befund

Der Cron-Lauf fand keinen halbfertigen Zustand vor:

- `HEAD` und `origin/main` standen zu Beginn beide auf `dd7e52e`.
- Der Worktree war sauber; `git diff --check` hatte keine Befunde.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse; sichtbare Node-Prozesse waren LSP/code-server-Prozesse.
- R149 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R150 begonnen.

## Scope

R150 ist ein enger A11y-/IDREF-Slice:

- Änderung: Die `Wertung`-Region im `Spielbereich` nutzt `aria-labelledby` auf ihre sichtbare Überschrift `Wertung`.
- Erhalten: sichtbare Copy, Spielende-/Ergebnis-Hinweis, DebugGruppe `Punkteübersicht`, `Punktetafel`-Unterregion, Wertungslogik, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine neue Interaktion, kein Layout-Refactor, keine Copy-Umbenennung und keine weiteren Regionen.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r150_wertung_idref.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r150_wertung_idref.test.tsx` schlug erwartungsgemäß fehl, weil `Wertung` noch ein separates `aria-label="Wertung"` trug.

GREEN:

- `src/App.tsx` erzeugt ein komponentenlokales `wertungTitelId` via `useId()`.
- Die `Wertung`-Region rendert jetzt `<section className="info-panel" aria-labelledby={wertungTitelId}>` und `<h2 id={wertungTitelId}>Wertung</h2>`.
- `src/App.r150_wertung_idref.test.tsx` prüft: kein separates `aria-label`, Single-Token-IDREF, genau ein IDREF-Ziel im Dokument, Ziel innerhalb der Region, sichtbarer Heading-Text `Wertung` und weiterhin ein eindeutiger Heading im Bereich.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Ein Root-Print-Smoke bestätigte denselben 401-Auth-Blocker für Claude Code.
- Da R150 ein enger mechanischer A11y-IDREF-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.
- Eine separate Claude-`/simplify`-Vorprüfung war wegen des bestätigten Claude-Auth-Blockers nicht verfügbar; stattdessen wurden Diff, Zeilenbudget und Tests vor Codex Review manuell geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R150-Testdatei:

- Codex Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- Codex bestätigte den IDREF-Vertrag, die dokumentweite Ziel-Eindeutigkeit, Ziel innerhalb der Region, kein separates `aria-label`, keine versehentliche Änderung an benachbarten Regionen und `src/App.tsx` bei 500 Zeilen.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r150_wertung_idref.test.tsx src/App.r146_spielstatus_idref.test.tsx src/App.r147_aktiver_spieler_idref.test.tsx src/App.r148_spieleruebersicht_idref.test.tsx src/App.r149_material_aufgaben_idref.test.tsx` → 5 Testdateien / 5 Tests grün.

Full Gates:

- `npm test -- --run` → 156 Testdateien / 644 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-BcBdVsaB.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/App.tsx` 500 Zeilen; `src/App.r150_wertung_idref.test.tsx` 30 Zeilen).
- Supplementaler Ganz-Repo-Zeilenscan fand unveränderte Legacy-Dateien über 500 Zeilen (`src/engine/legalActions.ts`, `src/engine/serialization.ts`, `src/engine/turnState.ts`). Diese Dateien wurden in R150 nicht berührt und blockieren gemäß projektspezifischer Line-Budget-Scope-Regel nicht den engen UI-Slice.

## Git / GitHub

Feature-Commit:

- `a968e87 R150: Wertung per Überschrift labeln`

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

R150 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- Slice-spezifisch: Die `Wertung`-Region im `Spielbereich` hat `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region und kein separates `aria-label`.
- Live-Ergebnis: `R150 Live-Smoke bestanden: Wertung aria-labelledby=_r_8_, kein aria-label, Zieltext="Wertung"`.
- Keine Console-/Page-Errors.

## Finaler Status

R150 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R150

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
