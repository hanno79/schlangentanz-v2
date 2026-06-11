# R160 Release-Nachweis — Zugfortschritt als Live-Region kennzeichnen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R160 — der sichtbare `Zugfortschritt` im `Spielstatus` bleibt per sichtbarer lokaler Überschrift `Zugfortschritt` gelabelt und wird zusätzlich als höfliche Live-Region (`aria-live="polite"`) ausgezeichnet, damit Phasenwechsel assistiv angekündigt werden können.

## Resume-Befund

- Pflichtdiagnose am 11.06.2026 um 21:01 UTC: Worktree sauber, `HEAD` = `origin/main` = `bf28f8b`.
- Letzter Slice R159 war final dokumentiert, gepusht, deployed und live gesmoked.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse; nur LSP-/Code-Server-Prozesse waren sichtbar.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R160 begonnen.

## Scope

R160 ist ein enger Live-Region-Slice für den Zugfortschritt:

- Änderung: `src/components/Zugfortschritt.tsx` behält das bestehende `aria-labelledby` auf die sichtbare lokale Überschrift und erhält zusätzlich `aria-live="polite"`.
- Test: `src/App.r160_zugfortschritt_live_region.test.tsx` prüft `aria-live`, kein separates `aria-label`, Single-Token-`aria-labelledby`, dokumentweit eindeutiges Labelziel, Ziel innerhalb der Region, sichtbare Überschrift und den sichtbaren aktuellen Phasentext.
- Nicht-Ziele: keine Engine-/Regeländerung, keine Layout-Umstrukturierung, keine Änderung der sichtbaren Copy, keine Änderung an Aktionen, Spielerführung oder Drag-and-drop.

## RED → GREEN

RED:

- `npm test -- --run src/App.r160_zugfortschritt_live_region.test.tsx` fiel erwartungsgemäß fehl, weil die `Zugfortschritt`-Region noch kein `aria-live="polite"` hatte.

GREEN:

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R160 ein enger mechanischer A11y-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und objektiv getestet.

## `/simplify`

- Separate Claude-`/simplify`-Vorprüfung wurde versucht.
- Blocker: derselbe Claude-Auth-Fehler `401 Invalid authentication credentials`.
- Stattdessen wurden Diff, Zeilenbudget, fokussierte Tests, Typecheck und Lint vor dem Codex Review objektiv geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R160-Testdatei:

- `BLOCKERS: Keine`
- `NON-BLOCKERS: Keine`

## Gates

Fokussierte Gates nach GREEN und nach `/simplify`-Fallback:

- `npm test -- --run src/App.r160_zugfortschritt_live_region.test.tsx src/App.r115_zugfortschritt_label_idrefs.test.tsx src/App.f9_zugfortschritt.test.tsx src/App.f10_debuggruppen.test.tsx` → 4 Testdateien / 8 Tests bestanden.
- `npm run typecheck` → bestanden.
- `npm run lint` → bestanden.

Full Gates vor Release:

- `npm test -- --run` → 166 Testdateien / 654 Tests bestanden.
- `npm run typecheck` → bestanden.
- `npm run lint` → bestanden.
- `npm run build` → bestanden (`vite v8.0.14`, Bundle `dist/assets/index-DIuAgZ6O.js`, CSS `dist/assets/index-DOPCpYmG.css`).
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → bestanden.
- Zeilenbudget: `src/components/Zugfortschritt.tsx` 49 Zeilen, `src/App.r160_zugfortschritt_live_region.test.tsx` 34 Zeilen.

## Commit, Push, Deploy, Smoke

Feature-Commit:

- `fd56b24 R160: Zugfortschritt als Live-Region kennzeichnen`

Push:

- `main -> origin/main` erfolgreich (`bf28f8b..fd56b24`).

Feature-Deploy:

- `vercel deploy --prod --yes --token=…` → `https://schlangentanz-v2.vercel.app` aliasiert, `Ready in 16s`.

Production-Smoke:

- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` → `/game` und `/` HTTP 200; Kernbereiche `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar; Ergebnis `R107 Production-Smoke bestanden`.
- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node .tmp_r160_zugfortschritt_smoke.mjs` → `R160 Live-Smoke bestanden: Zugfortschritt aria-live=polite, aria-labelledby=_r_b_, Zieltext="Zugfortschritt".`

## Finaler Status

R160 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias allgemein sowie slice-spezifisch live gesmoked. Dieser Release-Nachweis vermeidet selbstreferenziellen Doku-Commit-Churn; der finale Chat-Bericht nennt den nach Doku-Sync, erneutem Deploy und erneutem Smoke verifizierten finalen `HEAD`.

## Nächster kleiner Schritt nach R160

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
