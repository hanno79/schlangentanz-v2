# R167 Release-Nachweis — Spielerübersicht atomar ankündigen

Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R167 — die bestehende `Spielerübersicht`-Region wird als höfliche, atomare Live-Region angekündigt.

## Resume-Befund

Die Pflichtdiagnose zu Beginn dieses Cron-Laufs ergab:

- `pwd` → `/home/projects/schlangentanz-v2`.
- `date -Iseconds` → `2026-06-12T05:00:57+00:00`.
- `git status -sb` → `## main...origin/main`, sauber.
- Nach `git fetch origin main`: `HEAD e93681a`, `origin/main e93681a`.
- `git diff --stat`, `git diff --name-only`, `git diff --check`, `git status --short` → keine Änderungen.
- Relevante Prozesse: nur Code-Server/LSP/TypeScript-Server; keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse.
- R166 war dokumentiert als umgesetzt, getestet, reviewed, committed, gepusht, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R167 begonnen.

## Scope

R167 ist ein enger Live-Region-Härtungsslice im Bereich `Spielerübersicht`:

- Änderung: Die bestehende Region `Spielerübersicht` behält ihr sichtbares lokales Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`, damit Spielerstatus-Änderungen zusammenhängend angekündigt werden.
- Erhalten: sichtbare Überschrift `Spielerübersicht`, lokales eindeutiges `aria-labelledby`, fehlendes separates `aria-label`, Spielerstatus-Copy, Summenzeilen, Layout, Handler und Engine-/Regelverhalten.
- Bewusst ausgeschlossen: weitere Landmark-/IDREF-Umstellungen, Copy-Änderungen, Engine-/Regeländerungen und neue Spielinteraktionen.

## RED

- Neuer Test: `src/App.r167_spieleruebersicht_live_region_atomic.test.tsx`.
- RED-Ergebnis: `npm test -- --run src/App.r167_spieleruebersicht_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil die `Spielerübersicht`-Region noch kein `aria-live="polite"` hatte.

## GREEN / Claude-Code-Fallback

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R167 ein enger mechanischer A11y-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und objektiv getestet.

## `/simplify`

- Separate Claude-`/simplify`-Vorprüfung wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Der Diff blieb minimal und wurde mit fokussierten Tests, Lint, Full Gates und Codex Review abgesichert.

## Codex Review

- Review-only auf Worktree inklusive untracked R167-Test.
- Ergebnis: `BLOCKERS: Keine`; `NON-BLOCKERS: Keine Findings`.
- Codex-Verifikation: `npm test -- src/App.r167_spieleruebersicht_live_region_atomic.test.tsx --run` → 1 Testdatei / 1 Test bestanden.

## Gates

Fokussierte und angrenzende Tests:

- RED: `npm test -- --run src/App.r167_spieleruebersicht_live_region_atomic.test.tsx` → erwarteter Fehlschlag vor GREEN (`aria-live` fehlte).
- GREEN/Regressionen: `npm test -- --run src/App.r167_spieleruebersicht_live_region_atomic.test.tsx src/App.r148_spieleruebersicht_idref.test.tsx src/App.r165_aktiver_spieler_live_region_atomic.test.tsx` → 3 Testdateien / 3 Tests bestanden.

Full Gates vor Release:

- `npm test -- --run` → 173 Testdateien / 661 Tests bestanden.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün; Vite-Build mit `dist/index.html`, `dist/assets/index-CxCDBtiE.js`, `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → grün; alle Testdateien unter 500 Zeilen.
- `git diff --check` → grün.
- Geänderte Skriptdateien: `src/App.tsx` exakt 500 Zeilen, `src/App.r167_spieleruebersicht_live_region_atomic.test.tsx` 42 Zeilen.

## Commit / Push

Feature-Commit auf `origin/main`:

- `a07cf83 R167: Spielerübersicht atomar ankündigen`

## Deploy / Smoke

Feature-Deploy nach Code-Commit:

- `vercel deploy --prod --yes --token=…` → Production-Deployment `https://schlangentanz-v2-3p7lqc0e9-alfreds-projects-7e9df1b4.vercel.app`, Production-Alias `https://schlangentanz-v2.vercel.app`, Status `READY`.

Production-Smoke gegen den stabilen Alias:

- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` → `/` und `/game` HTTP 200; Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar; `R107 Production-Smoke bestanden`.
- R167-Browser-Probe gegen `/game` → `Spielerübersicht` sichtbar, `aria-live="polite"`, `aria-atomic="true"`, kein `aria-label`, ein eindeutiges lokales `aria-labelledby`-Ziel mit Text `Spielerübersicht`, Labelziel innerhalb der Region, Spielerstatus-Copy vorhanden, `Schlangen insgesamt: 0` vorhanden, keine Console-/Page-Errors.

## Finaler Status

R167 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias slice-spezifisch live gesmoked. Dieser Release-Nachweis vermeidet selbstreferenziellen Doku-Commit-Churn; der finale Cron-Bericht nennt den nach Doku-Sync, erneutem Deploy und erneutem Smoke verifizierten finalen `HEAD`.

## Nächster kleiner Schritt nach R167

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
