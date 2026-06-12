# R171 Release-Nachweis — Aufgabenkarten atomar ankündigen

Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R171 — die bestehende `Aufgabenkarten`-Unterregion wird als höfliche, atomare Live-Region angekündigt.

## Resume-Befund

- Pflichtdiagnose am 12.06.2026 um 07:31 UTC: `HEAD=fbd1b11`, `origin/main=fbd1b11`, Worktree clean, keine untracked Slice-Dateien.
- Keine laufenden projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse; nur langlebige TypeScript-LSP-Prozesse im Projekt.
- R170 war in `docs/PLAYABILITY_GATE.md` und `docs/release_status_2026-06-12_r170.md` als umgesetzt, getestet, reviewed, committed, gepusht, deployed und live gesmoked dokumentiert.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R171 begonnen.

## Scope

R171 ist ein enger Live-Region-Härtungsslice für die `Aufgabenkarten`-Unterregion innerhalb `Material und Aufgaben`:

- Änderung: Die bestehende `Aufgabenkarten`-Region behält ihr sichtbares lokales Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`, damit Änderungen an offenen Aufgaben zusammenhängend angekündigt werden.
- Nicht geändert: sichtbare Copy, Listenstruktur, Layout, Handler, Engine-/Regelverhalten, Elternregion `Material und Aufgaben` und Nachbarregionen.

## RED / GREEN

- RED: `npm test -- --run src/App.r171_aufgabenkarten_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil `aria-live="polite"` noch fehlte.
- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R171 ein enger mechanischer A11y-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und objektiv getestet.
- Produktionsänderung: `src/App.tsx` ergänzt an der bestehenden `Aufgabenkarten`-Region `aria-live="polite"` und `aria-atomic="true"`.

## `/simplify`

- Separate Claude-Code-`/simplify`-Vorprüfung wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Manuelle Simplify-Audit: Produktionsdiff ist ein einzelner Attribut-Change auf der bestehenden Region; keine weitere Vereinfachung ohne Scope-Ausweitung sinnvoll.

## Codex Review

- Review-only auf Worktree inklusive untracked R171-Test.
- Erster Review: `BLOCKERS`: Test suchte das `aria-labelledby`-Ziel nur im RTL-`container`, nicht dokumentweit.
- Fix: Test nutzt jetzt `document.querySelectorAll` für dokumentweite Labelziel-Eindeutigkeit.
- Re-Review: `BLOCKERS: Keine`.
- Codex bestätigte als Non-Blocker/Verifikation: Änderung ist eng auf die bestehende `Aufgabenkarten`-Region beschränkt, IDREF-/Live-Vertrag ist abgedeckt, `App.tsx` bleibt bei 500 Zeilen.

## Gates

Targeted:

- `npm test -- --run src/App.r171_aufgabenkarten_live_region_atomic.test.tsx src/App.r151_aufgabenkarten_idref.test.tsx src/App.r168_material_aufgaben_live_region_atomic.test.tsx src/App.f7_aufgabenkarten.test.tsx` → 4 Testdateien / 4 Tests bestanden.

Full:

- `npm test -- --run` → 177 Testdateien / 665 Tests bestanden.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün; Vite baute `dist/` erfolgreich.
- `npm run check:test-lines` → alle Testdateien unter 500 Zeilen.
- `git diff --check` → grün.
- Line-Budget: `src/App.tsx` exakt 500 Zeilen, `src/App.r171_aufgabenkarten_live_region_atomic.test.tsx` 43 Zeilen.

## Commit / Push

Feature-Commit auf `origin/main`:

- `e740188 R171: Aufgabenkarten atomar ankündigen`

## Deploy / Smoke

Deploy auf den stabilen Production-Alias:

- `vercel deploy --prod --yes --token=…` → `https://schlangentanz-v2.vercel.app` aliasiert, `READY`.

Production-Smoke:

- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` → `/` und `/game` HTTP 200; Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar; `R107 Production-Smoke bestanden`.
- R171-Browser-Probe gegen `/game` → `Aufgabenkarten` innerhalb `Material und Aufgaben` sichtbar; `aria-live="polite"`, `aria-atomic="true"`, kein `aria-label`, genau ein lokales `aria-labelledby`-Ziel mit Text `Aufgabenkarten`, Ziel innerhalb der Region, 3 Listeneinträge, Aufgabenkarten-Copy vorhanden; keine Console-/Page-Errors.

## Finaler Status

R171 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias slice-spezifisch live gesmoked. Dieser Release-Nachweis vermeidet selbstreferenziellen Doku-Commit-Churn; der finale Cron-Bericht nennt den nach Doku-Sync, erneutem Deploy und erneutem Smoke verifizierten finalen `HEAD`.

## Nächster kleiner Schritt nach R171

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
