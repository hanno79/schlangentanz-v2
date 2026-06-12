# R165 Release-Nachweis — Aktiven Spieler atomar ankündigen

Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R165 — die bestehende `Aktiver Spieler`-Region bleibt höfliche Live-Region und kündigt Zustandswechsel zusätzlich atomar an.

## Resume-Befund

Die Pflichtdiagnose zu Beginn dieses Cron-Laufs ergab:

- `pwd` → `/home/projects/schlangentanz-v2`.
- `date -Iseconds` → `2026-06-12T03:01:04+00:00`.
- `git status -sb` → `## main...origin/main`, sauber.
- Nach `git fetch origin main`: `HEAD 1d30e04`, `origin/main 1d30e04`.
- `git diff --stat`, `git diff --name-only`, `git diff --check`, `git status --short` → keine Änderungen.
- Relevante Prozesse: nur Code-Server/LSP/TypeScript-Server; keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse.
- R164 war dokumentiert als umgesetzt, getestet, reviewed, committed, gepusht, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R165 begonnen.

## Scope

R165 ist ein enger Live-Region-Härtungsslice im Bereich `Aktiver Spieler`:

- Änderung: Die bestehende Region `Aktiver Spieler` behält `aria-live="polite"` und erhält zusätzlich `aria-atomic="true"`, damit Wechsel der aktiven Spieler-/Zug-Information als zusammenhängende Statusänderung angekündigt werden.
- Erhalten: sichtbare Überschrift `Aktiver Spieler`, lokales `aria-labelledby`, fehlendes separates `aria-label`, innere Regionen `Spieltisch` und `Aktionen`, sichtbare Copy, Handler, Engine-/Regelverhalten und Layout.
- Bewusst ausgeschlossen: weitere Landmark-/IDREF-Umstellungen, Copy-Änderungen, Engine-/Regeländerungen und neue Spielinteraktionen.

## RED

- Neuer Test: `src/App.r165_aktiver_spieler_live_region_atomic.test.tsx`.
- RED-Ergebnis: `npm test -- --run src/App.r165_aktiver_spieler_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil die `Aktiver Spieler`-Region noch kein `aria-atomic="true"` hatte.

## GREEN / Claude-Code-Fallback

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R165 ein enger mechanischer A11y-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und objektiv getestet.

## `/simplify`

- Separate Claude-`/simplify`-Vorprüfung wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Der Diff blieb minimal und wurde mit fokussierten Tests, Lint, Full Gates und Codex Review abgesichert.

## Codex Review

- Initiales Review-only auf Worktree inklusive untracked R165-Test fand keine Blocker und einen günstigen Non-Blocker: eine slice-fremde `Spielerprofil`-Assertion im Test entfernen.
- Die Test-Assertion wurde entfernt, der fokussierte Regressionstest erneut ausgeführt.
- Re-Review final: `BLOCKERS: Keine`; `NON-BLOCKERS: Keine`; vorheriger Hinweis erledigt.

## Gates

Fokussierte und angrenzende Tests:

- RED: `npm test -- --run src/App.r165_aktiver_spieler_live_region_atomic.test.tsx` → erwarteter Fehlschlag vor GREEN.
- GREEN/Regressionen: `npm test -- --run src/App.r165_aktiver_spieler_live_region_atomic.test.tsx src/App.r147_aktiver_spieler_idref.test.tsx src/App.r112_app_shell_label_idrefs.test.tsx src/App.f10_debuggruppen.test.tsx` → 4 Testdateien / 4 Tests bestanden.

Full Gates vor Release:

- `npm test -- --run` → 171 Testdateien / 659 Tests bestanden.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün; Vite-Build mit `dist/index.html`, `dist/assets/index-ZH-Yexok.js`, `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → grün; alle Testdateien unter 500 Zeilen.
- `git diff --check` → grün.
- Geänderte Skriptdateien: `src/App.tsx` 500 Zeilen, `src/App.r165_aktiver_spieler_live_region_atomic.test.tsx` 40 Zeilen.

## Commit / Push

Feature-Commit auf `origin/main`:

- `94943c8 R165: Aktiven Spieler atomar ankündigen`

## Deploy / Smoke

Feature-Deploy nach Code-Commit:

- `vercel deploy --prod --yes --token=…` → Production-Deployment `https://schlangentanz-v2-21xqeqekr-alfreds-projects-7e9df1b4.vercel.app`, Production-Alias `https://schlangentanz-v2.vercel.app`, Status `READY`.

Production-Smoke gegen den stabilen Alias:

- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` → `/` und `/game` HTTP 200; Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar; `R107 Production-Smoke bestanden`.
- R165-Browser-Probe gegen `/game` → `Aktiver Spieler` sichtbar, `aria-live="polite"`, `aria-atomic="true"`, kein `aria-label`, ein eindeutiges lokales `aria-labelledby`-Ziel mit Text `Aktiver Spieler`, innere Regionen `Spieltisch` und `Aktionen` sichtbar, keine Console-/Page-Errors.

## Finaler Status

R165 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias slice-spezifisch live gesmoked. Dieser Release-Nachweis vermeidet selbstreferenziellen Doku-Commit-Churn; der finale Cron-Bericht nennt den nach Doku-Sync, erneutem Deploy und erneutem Smoke verifizierten finalen `HEAD`.

## Nächster kleiner Schritt nach R165

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
