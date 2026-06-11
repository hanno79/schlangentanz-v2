# R157 Release-Nachweis — Phasenregeln per Überschrift labeln

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R157 — die dauerhaft sichtbare `Phasenregeln`-Unterregion im `Aktionen`-Bereich wird per sichtbarer Überschrift und `aria-labelledby` gelabelt.

## Resume-Befund

Der Arbeitsstand war nach R156 sauber:

- `HEAD` und `origin/main` standen beide auf `3559307`.
- Der Worktree war sauber; keine halbfertigen R157-Dateien lagen vor.
- R156 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R157 begonnen.

## Scope

R157 ist ein enger A11y-/IDREF-Slice:

- Änderung: Die dauerhaft sichtbare Unterregion `Phasenregeln` im Bereich `Aktionen` nutzt `aria-labelledby` auf ihre sichtbare Überschrift `Phasenregeln`.
- Erhalten: Phasenregeln-Copy, Liste `Spielbare Aktionen in dieser Phase`, `Empfohlene Aktion`, `Weitere Aktionen`, `Weitere verfügbare Aktionen`, `Phasenaktion`, `Endphase`, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine neue Interaktion, keine Copy-Umbenennung, kein Layout-Refactor und keine weiteren Regionen.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r157_phasenregeln_idref.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r157_phasenregeln_idref.test.tsx` schlug erwartungsgemäß fehl, weil die Phasenregeln-Region noch ein separates `aria-label="Phasenregeln"` hatte und kein komponentenlokales `aria-labelledby`.

GREEN:

- `src/components/AktionenPanel.tsx` erzeugt ein komponentenlokales `phasenregelnTitelId` via `useId()`.
- Die Phasenregeln-Region nutzt jetzt `aria-labelledby={phasenregelnTitelId}` und `<h3 id={phasenregelnTitelId}>Phasenregeln</h3>`.
- `src/App.r157_phasenregeln_idref.test.tsx` rendert zwei App-Instanzen und prüft: kein separates `aria-label`, Single-Token-IDREF, dokumentweit eindeutige Label-IDs, genau ein IDREF-Ziel, Ziel innerhalb der Region, sichtbarer Heading-Text `Phasenregeln`, Heading-Level 3 sowie erhaltene `h4` `Spielbare Aktionen in dieser Phase`.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R157 ein enger mechanischer A11y-IDREF-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.
- Eine separate Claude-`/simplify`-Vorprüfung wurde ebenfalls versucht, war wegen desselben Claude-Auth-Blockers aber nicht verfügbar; stattdessen wurden Diff, Zeilenbudget und Tests vor Codex Review manuell geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R157-Testdatei:

- `BLOCKERS: Keine`
- `NON-BLOCKERS: Keine`
- Codex verifizierte zusätzlich `npm test -- --run src/App.r157_phasenregeln_idref.test.tsx` → 1 Testdatei / 1 Test grün.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r157_phasenregeln_idref.test.tsx` → 1 Testdatei / 1 Test grün.
- `npm test -- --run src/App.r145_aktionen_idref.test.tsx src/App.r153_weitere_aktionen_idref.test.tsx src/App.r154_phasenaktion_idref.test.tsx src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx src/App.r156_endphase_idref.test.tsx` → 5 Testdateien / 5 Tests grün.

Full Gates:

- `npm test -- --run` → 163 Testdateien / 651 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-DrFwjmIR.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/components/AktionenPanel.tsx` 277 Zeilen; `src/App.r157_phasenregeln_idref.test.tsx` 45 Zeilen).

## Git / GitHub

Feature-Commit:

- `8d42300 R157: Phasenregeln per Überschrift labeln`

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

R157 Slice-Smoke:

- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node .tmp_r157_phasenregeln_smoke.mjs`.
- `/game`: Die `Phasenregeln`-Region innerhalb `Aktionen` ist sichtbar, hat kein separates `aria-label`, hat ein Single-Token-`aria-labelledby`, genau ein Labelziel innerhalb der Region, Labelziel-/`h3`-Text `Phasenregeln`, erhaltene sichtbare `h4` `Spielbare Aktionen in dieser Phase` und keine Console-/Page-Errors.

## Finaler Status

R157 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias allgemein sowie slice-spezifisch live gesmoked. Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der finale Chat-Bericht nennt den final verifizierten `HEAD` nach Dokumentations-Sync, Deploy und Smoke.

## Nächster kleiner Schritt nach R157

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
