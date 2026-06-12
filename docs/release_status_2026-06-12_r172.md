# R172 Release-Nachweis — Spieltisch atomar ankündigen

Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R172 — die bestehende `Spieltisch`-Region wird als höfliche, atomare Live-Region angekündigt.

## Resume-Befund

- Pflichtdiagnose am 12.06.2026 um 09:31 UTC: `HEAD=4f30047`, `origin/main=4f30047`, Worktree clean, keine untracked Slice-Dateien.
- Keine laufenden projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse; nur langlebige TypeScript-LSP-Prozesse im Projekt.
- R171 war in `docs/PLAYABILITY_GATE.md` und `docs/release_status_2026-06-12_r171.md` als umgesetzt, getestet, reviewed, committed, gepusht, deployed und live gesmoked dokumentiert.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R172 begonnen.

## Scope

R172 ist ein enger Live-Region-Härtungsslice für die `Spieltisch`-Region innerhalb `Aktiver Spieler`:

- Änderung: Die bestehende `Spieltisch`-Region behält ihr sichtbares lokales Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`, damit Hand- und Schlangenänderungen zusammenhängend angekündigt werden.
- Nicht geändert: sichtbare Copy, `aria-label`-Abwesenheit, Handkarten-/Schlangenbereich-Unterregionen, Layout, Handler, Engine-/Regelverhalten und Nachbarregionen.

## RED / GREEN

- RED: `npm test -- --run src/App.r172_spieltisch_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R172 ein enger mechanischer A11y-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und objektiv getestet.
- Produktionsänderung: `src/App.tsx` ergänzt an der bestehenden `Spieltisch`-Region `aria-live="polite"` und `aria-atomic="true"`.

## `/simplify`

- Separate Claude-Code-`/simplify`-Vorprüfung wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Manuelle Simplify-Audit: Produktionsdiff ist ein einzelner Attribut-Change auf der bestehenden Region; keine weitere Vereinfachung ohne Scope-Ausweitung sinnvoll.

## Codex Review

- Review-only auf Worktree inklusive untracked R172-Test.
- Ergebnis: `BLOCKERS: Keine` und `NON-BLOCKERS: Keine`.
- Codex bestätigte als Verifikation: Änderung ist eng auf die bestehende `Spieltisch`-Region beschränkt, `aria-labelledby` bleibt erhalten, kein `aria-label`, keine Copy-/Layout-/Handler-/Engine-Änderung, `src/App.tsx` exakt 500 Zeilen.

## Gates

Targeted:

- `npm test -- --run src/App.r172_spieltisch_live_region_atomic.test.tsx src/App.r112_app_shell_label_idrefs.test.tsx src/App.f31_spieltisch_layout.test.tsx` → 3 Testdateien / 3 Tests bestanden.

Full:

- `npm test -- --run` → 178 Testdateien / 666 Tests bestanden.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün; Vite baute `dist/` erfolgreich.
- `npm run check:test-lines` → alle Testdateien unter 500 Zeilen.
- `git diff --check` → grün.
- Line-Budget: `src/App.tsx` exakt 500 Zeilen, `src/App.r172_spieltisch_live_region_atomic.test.tsx` 41 Zeilen.

## Commit / Push

Feature-Commit auf `origin/main`:

- `46cca3f R172: Spieltisch atomar ankündigen`

## Deploy / Smoke

Deploy auf den stabilen Production-Alias:

- `vercel deploy --prod --yes --token=…` → `https://schlangentanz-v2.vercel.app` aliasiert, `READY`.

Production-Smoke:

- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` → `/` und `/game` HTTP 200; Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar; `R107 Production-Smoke bestanden`.
- R172-Browser-Probe gegen `/game` → `Spieltisch` innerhalb `Aktiver Spieler` sichtbar; `aria-live="polite"`, `aria-atomic="true"`, kein `aria-label`, genau ein lokales `aria-labelledby`-Ziel mit Text `Spieltisch`, Ziel innerhalb der Region, je eine `Handkarten`- und `Schlangenbereich`-Unterregion; keine Console-/Page-Errors.

## Finaler Status

R172 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias slice-spezifisch live gesmoked. Dieser Release-Nachweis vermeidet selbstreferenziellen Doku-Commit-Churn; der finale Cron-Bericht nennt den nach Doku-Sync, erneutem Deploy und erneutem Smoke verifizierten finalen `HEAD`.

## Nächster kleiner Schritt nach R172

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
