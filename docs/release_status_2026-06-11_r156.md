# R156 Release-Nachweis — Endphase per Überschrift labeln

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R156 — die bedingt gerenderte `Endphase`-Unterregion im `Aktionen`-Bereich wird per sichtbarer Überschrift und `aria-labelledby` gelabelt.

## Resume-Befund

Der Cron-Lauf fand keinen halbfertigen Zustand vor:

- `HEAD` und `origin/main` standen nach `git fetch origin main` beide auf `81d04ff`.
- Der Worktree war sauber; `git diff --check` hatte keine Befunde.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse; sichtbare Node-Prozesse waren LSP/code-server-Prozesse.
- R155 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R156 begonnen.

## Scope

R156 ist ein enger A11y-/IDREF-Slice:

- Änderung: Die bedingt gerenderte Unterregion `.aktionen-gruppe--endphase` im Bereich `Aktionen` nutzt `aria-labelledby` auf ihre sichtbare Überschrift `Endphase`.
- Erhalten: Endphase-Copy, No-Draw-Hinweis, Endspurt-Gating, Aktions-/Phasenlogik, `Empfohlene Aktion`, `Weitere Aktionen`, `Weitere verfügbare Aktionen`, `Phasenaktion`, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine neue Interaktion, keine Copy-Umbenennung, kein Layout-Refactor und keine weiteren Regionen.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r156_endphase_idref.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r156_endphase_idref.test.tsx` schlug erwartungsgemäß fehl, weil die Endphase-Unterregion noch ein separates `aria-label="Endphase"` hatte und kein `aria-labelledby`.

GREEN:

- `src/components/AktionenPanel.tsx` erzeugt ein komponentenlokales `endphaseTitelId` via `useId()`.
- Die Endphase-Unterregion rendert weiterhin `.aktionen-gruppe--endphase`, nutzt jetzt aber `aria-labelledby={endphaseTitelId}` und `<h3 id={endphaseTitelId}>Endphase</h3>`.
- `src/App.r156_endphase_idref.test.tsx` rendert zwei App-Instanzen im Endspurt-Zustand und prüft: kein separates `aria-label`, Single-Token-IDREF, dokumentweit eindeutige Label-IDs, genau ein IDREF-Ziel, Ziel innerhalb der Region, sichtbarer Heading-Text `Endphase`, Heading-Level 3 sowie erhaltene CSS-Klasse.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R156 ein enger mechanischer A11y-IDREF-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.
- Eine separate Claude-`/simplify`-Vorprüfung wurde ebenfalls versucht, war wegen desselben Claude-Auth-Blockers aber nicht verfügbar; stattdessen wurden Diff, Zeilenbudget und Tests vor Codex Review manuell geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R156-Testdatei:

- Initial: `BLOCKERS: Keine`; `NON-BLOCKERS`: Test sollte zwei App-Instanzen rendern, um hartcodierte nicht-komponentenlokale IDs zu erkennen.
- Nach Testhärtung: Codex Re-Review bestätigte `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.
- Codex verifizierte zusätzlich `npm test -- --run src/App.r156_endphase_idref.test.tsx` → 1 Testdatei / 1 Test grün.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r156_endphase_idref.test.tsx src/App.f20_endphase_hinweis.test.tsx src/App.r154_phasenaktion_idref.test.tsx src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx` → 4 Testdateien / 5 Tests grün.

Full Gates:

- `npm test -- --run` → 162 Testdateien / 650 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-DRw2Tkny.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/components/AktionenPanel.tsx` 275 Zeilen; `src/App.r156_endphase_idref.test.tsx` 61 Zeilen).
- Ergänzender Whole-Repo-Zeilenscan fand unveränderte Legacy-Engine-Dateien über 500 Zeilen (`src/engine/legalActions.ts`, `src/engine/serialization.ts`, `src/engine/turnState.ts`); diese wurden nicht vom UI-Slice berührt und bleiben bestehende Debt außerhalb von R156.

## Git / GitHub

Feature-Commit:

- `dabb562 R156: Endphase per Überschrift labeln`

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

- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production`.
- `/` und `/game`: HTTP 200.
- Kernregionen sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`.
- Ergebnis: `R107 Production-Smoke bestanden`.

R156 Slice-Smoke:

- Die R156-Zielregion ist ein bedingt gerenderter Endspurt-/Endphase-Zustand. In der aktuellen Produktionsdeck-Konfiguration ist dieser Zustand ohne injizierten Fixture-Zustand nicht zuverlässig live erreichbar.
- Deshalb wurde die Production-Verifikation ehrlich auf App-Gesundheit, `/game`-Ladefähigkeit, Kernregionen und Console-/Page-Error-Freiheit begrenzt; der exakte IDREF-Vertrag ist lokal per fokussierter DOM-Regression gegen den betroffenen Endspurt-Spielzustand abgesichert.

## Finaler Status

R156 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheitsgesmoked. Der slice-spezifische IDREF-Vertrag ist lokal gegen den relevanten Endspurt-Spielzustand abgesichert; ein natürlich erreichbarer Live-Zustand für die bedingte R156-Region war in diesem Lauf nicht verfügbar.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R156

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
