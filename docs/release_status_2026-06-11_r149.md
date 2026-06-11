# R149 Release-Nachweis — Material und Aufgaben per Überschrift labeln

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R149 — die `Material und Aufgaben`-Region wird per sichtbarer Überschrift und `aria-labelledby` gelabelt.

## Resume-Befund

Der Cron-Lauf fand keinen halbfertigen Zustand vor:

- `HEAD` und `origin/main` standen zu Beginn beide auf `8e8baaa`.
- Der Worktree war sauber; `git diff --check` hatte keine Befunde.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse; sichtbare Node-Prozesse waren LSP/code-server-Prozesse.
- R148 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R149 begonnen.

## Scope

R149 ist ein enger A11y-/IDREF-Slice:

- Änderung: Die `Material und Aufgaben`-Region im `Spielbereich` nutzt `aria-labelledby` auf ihre sichtbare Überschrift `Material und Aufgaben`.
- Erhalten: sichtbare Copy, DebugGruppe `Karten und Aufgaben`, `Aufgabenkarten`-Unterregion, Material-/Aufgabenanzeigen, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine neue Interaktion, kein Layout-Refactor, keine Copy-Umbenennung und keine weiteren Regionen.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r149_material_aufgaben_idref.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r149_material_aufgaben_idref.test.tsx` schlug erwartungsgemäß fehl, weil `Material und Aufgaben` noch ein separates `aria-label="Material und Aufgaben"` trug.

GREEN:

- `src/App.tsx` erzeugt ein komponentenlokales `materialUndAufgabenTitelId` via `useId()`.
- Die `Material und Aufgaben`-Region rendert jetzt `<section className="info-panel" aria-labelledby={materialUndAufgabenTitelId}>` und `<h2 id={materialUndAufgabenTitelId}>Material und Aufgaben</h2>`.
- `src/App.r149_material_aufgaben_idref.test.tsx` prüft: kein separates `aria-label`, Single-Token-IDREF, genau ein IDREF-Ziel im Dokument, Ziel innerhalb der Region, sichtbarer Heading-Text `Material und Aufgaben` und weiterhin ein eindeutiger Heading im Bereich.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Ein Root-Print-Smoke bestätigte denselben 401-Auth-Blocker für Claude Code.
- Da R149 ein enger mechanischer A11y-IDREF-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.
- Eine separate Claude-`/simplify`-Vorprüfung war wegen des bestätigten Claude-Auth-Blockers nicht verfügbar; stattdessen wurden Diff, Zeilenbudget und Tests vor Codex Review manuell geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R149-Testdatei:

- Codex Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine review-relevanten Non-Blocker gefunden`.
- Codex bestätigte den IDREF-Vertrag, die dokumentweite Ziel-Eindeutigkeit, Ziel innerhalb der Region, kein separates `aria-label`, keine DOM-Roh-Fach-IDs und keine versehentliche Änderung an benachbarten Regionen.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r149_material_aufgaben_idref.test.tsx src/App.r148_spieleruebersicht_idref.test.tsx` → 2 Testdateien / 2 Tests grün.

Full Gates:

- `npm test -- --run` → 155 Testdateien / 643 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-BlbHCGbE.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/App.tsx` 500 Zeilen; `src/App.r149_material_aufgaben_idref.test.tsx` 30 Zeilen).

## Git / GitHub

Feature-Commit:

- `c447da9 R149: Material und Aufgaben per Überschrift labeln`

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

R149 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `/` und `/game`: HTTP 200.
- Slice-spezifisch: Die `Material und Aufgaben`-Region im `Spielbereich` hat `aria-labelledby` auf genau eine sichtbare Überschrift innerhalb der Region und kein separates `aria-label`.
- Live-Ergebnis: `R149 Live-Smoke bestanden: Material und Aufgaben aria-labelledby=_r_7_, kein aria-label, Zieltext="Material und Aufgaben"`.
- Keine Console-/Page-Errors.

## Finaler Status

R149 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R149

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
