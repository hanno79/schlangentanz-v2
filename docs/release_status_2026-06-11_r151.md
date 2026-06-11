# R151 Release-Nachweis — Aufgabenkarten per Überschrift labeln

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R151 — die `Aufgabenkarten`-Unterregion in `Material und Aufgaben` wird per sichtbarer Überschrift und `aria-labelledby` gelabelt.

## Resume-Befund

Der Cron-Lauf fand keinen halbfertigen Zustand vor:

- `HEAD` und `origin/main` standen zu Beginn beide auf `7253de5`.
- Der Worktree war sauber; `git diff --check` hatte keine Befunde.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse; sichtbare Node-Prozesse waren LSP/code-server-Prozesse.
- R150 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R151 begonnen.

## Scope

R151 ist ein enger A11y-/IDREF-Slice:

- Änderung: Die `Aufgabenkarten`-Unterregion im Bereich `Material und Aufgaben` nutzt `aria-labelledby` auf ihre sichtbare Überschrift `Aufgabenkarten`.
- Erhalten: sichtbare Copy, Karten-/Aufgabenanzeige, DebugGruppe `Karten und Aufgaben`, Material-Region, Wertungsbereiche, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine neue Interaktion, kein Layout-Refactor, keine Copy-Umbenennung und keine weiteren Regionen.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r151_aufgabenkarten_idref.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r151_aufgabenkarten_idref.test.tsx` schlug erwartungsgemäß fehl, weil `Aufgabenkarten` noch ein separates `aria-label="Aufgabenkarten"` trug.

GREEN:

- `src/App.tsx` erzeugt ein komponentenlokales `aufgabenkartenTitelId` via `useId()`.
- Die `Aufgabenkarten`-Unterregion rendert jetzt `<section className="aufgabenkarten-bereich" aria-labelledby={aufgabenkartenTitelId}>` und `<h3 id={aufgabenkartenTitelId}>Aufgabenkarten</h3>`.
- `src/App.r151_aufgabenkarten_idref.test.tsx` prüft: kein separates `aria-label`, Single-Token-IDREF, genau ein IDREF-Ziel im Dokument, Ziel innerhalb der Region, sichtbarer Heading-Text `Aufgabenkarten` und weiterhin ein eindeutiger Heading im Bereich.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R151 ein enger mechanischer A11y-IDREF-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.
- Eine separate Claude-`/simplify`-Vorprüfung wurde ebenfalls versucht, war wegen desselben Claude-Auth-Blockers aber nicht verfügbar; stattdessen wurden Diff, Zeilenbudget und Tests vor Codex Review manuell geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R151-Testdatei:

- Codex Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- Codex bestätigte den IDREF-Vertrag, die dokumentweite Ziel-Eindeutigkeit, Ziel innerhalb der Region, kein separates `aria-label`, keine stale `aria-label`-Spur, saubere Nachbarregionen und `src/App.tsx` bei 500 Zeilen.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r151_aufgabenkarten_idref.test.tsx src/App.f7_aufgabenkarten.test.tsx src/App.r149_material_aufgaben_idref.test.tsx src/App.r150_wertung_idref.test.tsx` → 4 Testdateien / 4 Tests grün.

Full Gates:

- `npm test -- --run` → 157 Testdateien / 645 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-DiRCxujm.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/App.tsx` 500 Zeilen; `src/App.r151_aufgabenkarten_idref.test.tsx` 31 Zeilen).

## Git / GitHub

Feature-Commit:

- `78573a4 R151: Aufgabenkarten per Überschrift labeln`

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

R151 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- Slice-spezifisch: Die `Aufgabenkarten`-Unterregion im Bereich `Material und Aufgaben` hat `aria-labelledby` auf genau eine sichtbare `h3` innerhalb der Region und kein separates `aria-label`.
- Live-Ergebnis: `R151 Live-Smoke bestanden: Aufgabenkarten aria-labelledby=_r_8_, kein aria-label, Zieltext="Aufgabenkarten"`.
- Keine Console-/Page-Errors.

## Finaler Status

R151 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R151

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
