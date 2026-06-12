# R166 Release-Nachweis — Spielstatus atomar ankündigen

Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R166 — die bestehende `Spielstatus`-Region wird als höfliche, atomare Live-Region angekündigt.

## Resume-Befund

Die Pflichtdiagnose zu Beginn dieses Cron-Laufs ergab:

- `pwd` → `/home/projects/schlangentanz-v2`.
- `date -Iseconds` → `2026-06-12T04:31:07+00:00`.
- `git status -sb` → `## main...origin/main`, sauber.
- Nach `git fetch origin main`: `HEAD af2d3f2`, `origin/main af2d3f2`.
- `git diff --stat`, `git diff --name-only`, `git diff --check`, `git status --short` → keine Änderungen.
- Relevante Prozesse: nur Code-Server/LSP/TypeScript-Server; keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse.
- R165 war dokumentiert als umgesetzt, getestet, reviewed, committed, gepusht, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R166 begonnen.

## Scope

R166 ist ein enger Live-Region-Härtungsslice im Bereich `Spielstatus`:

- Änderung: Die bestehende Region `Spielstatus` behält ihr sichtbares lokales Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`, damit Phasen-/Statuswechsel als zusammenhängende Statusänderung angekündigt werden.
- Erhalten: sichtbare Überschrift `Spielstatus`, lokales eindeutiges `aria-labelledby`, fehlendes separates `aria-label`, innerer `Zugfortschritt`, sichtbare Copy, Handler, Engine-/Regelverhalten und Layout.
- Bewusst ausgeschlossen: weitere Landmark-/IDREF-Umstellungen, Copy-Änderungen, Engine-/Regeländerungen und neue Spielinteraktionen.

## RED

- Neuer Test: `src/App.r166_spielstatus_live_region_atomic.test.tsx`.
- RED-Ergebnis: `npm test -- --run src/App.r166_spielstatus_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil die `Spielstatus`-Region noch kein `aria-live="polite"` hatte.

## GREEN / Claude-Code-Fallback

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Erster Versuch traf zusätzlich eine lokale Prompt-Datei-Berechtigung (`cat: /tmp/schlangentanz_r166_green_prompt.md: Permission denied`), danach wurde die Prompt-Datei lesbar gesetzt.
- Blocker danach: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R166 ein enger mechanischer A11y-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und objektiv getestet.

## `/simplify`

- Separate Claude-`/simplify`-Vorprüfung wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Der Diff blieb minimal und wurde mit fokussierten Tests, Lint, Full Gates und Codex Review abgesichert.

## Codex Review

- Review-only auf Worktree inklusive untracked R166-Test.
- Ergebnis: `BLOCKERS: Keine`; `NON-BLOCKERS: Keine`.

## Gates

Fokussierte und angrenzende Tests:

- RED: `npm test -- --run src/App.r166_spielstatus_live_region_atomic.test.tsx` → erwarteter Fehlschlag vor GREEN (`aria-live` fehlte).
- GREEN/Regressionen: `npm test -- --run src/App.r166_spielstatus_live_region_atomic.test.tsx src/App.r146_spielstatus_idref.test.tsx src/App.r165_aktiver_spieler_live_region_atomic.test.tsx` → 3 Testdateien / 3 Tests bestanden.
- Codex führte denselben fokussierten Satz im Review nochmals aus → 3 Testdateien / 3 Tests bestanden.

Full Gates vor Release:

- `npm test -- --run` → 172 Testdateien / 660 Tests bestanden.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün; Vite-Build mit `dist/index.html`, `dist/assets/index-CB-Ult4L.js`, `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → grün; alle Testdateien unter 500 Zeilen.
- `git diff --check` → grün.
- Geänderte Skriptdateien: `src/App.tsx` exakt 500 Zeilen, `src/App.r166_spielstatus_live_region_atomic.test.tsx` 41 Zeilen.

## Commit / Push

Feature-Commit auf `origin/main`:

- `e6715cd R166: Spielstatus atomar ankündigen`

## Deploy / Smoke

Feature-Deploy nach Code-Commit:

- `vercel deploy --prod --yes --token=…` → Production-Deployment `https://schlangentanz-v2-n8lad8o49-alfreds-projects-7e9df1b4.vercel.app`, Production-Alias `https://schlangentanz-v2.vercel.app`, Status `READY`.

Production-Smoke gegen den stabilen Alias:

- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` → `/` und `/game` HTTP 200; Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar; `R107 Production-Smoke bestanden`.
- R166-Browser-Probe gegen `/game` → `Spielstatus` sichtbar, `aria-live="polite"`, `aria-atomic="true"`, kein `aria-label`, ein eindeutiges lokales `aria-labelledby`-Ziel mit Text `Spielstatus`, Labelziel innerhalb der Region, erwarteter Text `Aktueller Spielschritt: Karten ausspielen`, `Zugfortschritt` sichtbar, keine Console-/Page-Errors.

## Finaler Status

R166 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias slice-spezifisch live gesmoked. Dieser Release-Nachweis vermeidet selbstreferenziellen Doku-Commit-Churn; der finale Cron-Bericht nennt den nach Doku-Sync, erneutem Deploy und erneutem Smoke verifizierten finalen `HEAD`.

## Nächster kleiner Schritt nach R166

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
