# R170 Release-Nachweis — Punktetafel atomar ankündigen

Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R170 — die bestehende `Punktetafel`-Unterregion wird als höfliche, atomare Live-Region angekündigt.

## Resume-Befund

Die Initialdiagnose dieses Cron-Laufs ergab:

- Arbeitsverzeichnis: `/home/projects/schlangentanz-v2`
- Zeitpunkt: `2026-06-12T07:01:00+00:00`
- `main` war sauber und synchron mit `origin/main` auf `ecf66e8`.
- Keine uncommitted/untracked Slice-Dateien, keine Diff-Checks, keine plausiblen laufenden projektbezogenen bounded Agent-/Test-/Deploy-Prozesse.
- R169 war in `docs/PLAYABILITY_GATE.md` und `docs/release_status_2026-06-12_r169.md` als umgesetzt, getestet, reviewed, committed, gepusht, deployed und live gesmoked dokumentiert.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R170 begonnen.

## Scope

R170 ist ein enger Live-Region-Härtungsslice für die `Punktetafel`-Unterregion innerhalb `Wertung`:

- Änderung: Die bestehende `Punktetafel` behält ihr sichtbares lokales Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`, damit Punktetafeländerungen zusammenhängend angekündigt werden.
- Erhalten: sichtbare Überschrift `Punktetafel`, fehlendes separates `aria-label`, Listen-/Score-Copy, `Wertung`-Elternregion, Layout, Handler und Engine-/Regelverhalten.
- Nicht-Ziele: Keine sichtbare Copy-Änderung, keine Engine-/Regeländerung, keine Änderung an `Wertung`, `Punkteübersicht`, `Material und Aufgaben`, `Aufgabenkarten` oder anderen Nachbarregionen.

## RED

Neuer Test:

- `src/App.r170_punktetafel_live_region_atomic.test.tsx`

RED-Ergebnis:

- `npm test -- --run src/App.r170_punktetafel_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil die `Punktetafel`-Region noch kein `aria-live="polite"` hatte.

## GREEN / Claude-Code-Fallback

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R170 ein enger mechanischer A11y-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und objektiv getestet.
- Produktionsänderung: `src/App.tsx` ergänzt an der bestehenden `Punktetafel`-Region `aria-live="polite"` und `aria-atomic="true"`.

## `/simplify`

- Separate Claude-Code-`/simplify`-Vorprüfung wurde versucht.
- Blocker: derselbe `401 Invalid authentication credentials`.
- Der Diff wurde danach objektiv geprüft; es gab keine zusätzliche Vereinfachung ohne Verhaltensänderung. `src/App.tsx` bleibt exakt bei 500 Zeilen.

## Codex Review

- Review-only auf Worktree inklusive untracked R170-Test.
- Ergebnis: `BLOCKERS: Keine`.
- Codex bestätigte als Non-Blocker/Verifikation: Änderung ist eng auf die bestehende `Punktetafel` beschränkt, IDREF-Vertrag bleibt intakt, Test prüft Live-/Atomic-Vertrag, Labelziel-Eindeutigkeit und lokale Zielcontainment, keine Nachbarregion wurde geändert, `App.tsx` bleibt bei 500 Zeilen.
- Codex-Verifikation: `npm test -- --run src/App.r170_punktetafel_live_region_atomic.test.tsx` → 1 Testdatei / 1 Test bestanden.

## Gates

Fokussiert:

- `npm test -- --run src/App.r170_punktetafel_live_region_atomic.test.tsx src/App.r143_punktetafel_label.test.tsx src/App.r144_punktetafel_idref.test.tsx src/App.r169_wertung_live_region_atomic.test.tsx` → 4 Testdateien / 4 Tests bestanden.

Full Gates:

- `npm test -- --run` → 176 Testdateien / 664 Tests bestanden.
- `npm run typecheck` → bestanden.
- `npm run lint` → bestanden.
- `npm run build` → bestanden (`tsc -b && vite build`).
- `npm run check:test-lines` → bestanden; alle Testdateien unter 500 Zeilen.
- `git diff --check` → bestanden.
- Zeilenbudget: `src/App.tsx` exakt 500 Zeilen, `src/App.r170_punktetafel_live_region_atomic.test.tsx` 39 Zeilen.

## Commit / Push

Feature-Commit auf `origin/main`:

- `218ca46 R170: Punktetafel atomar ankündigen`

## Deploy / Smoke

Deploy:

- `vercel deploy --prod --yes --token=…` stellte den Production-Alias `https://schlangentanz-v2.vercel.app` bereit (`READY`).

Production-Smoke gegen den stabilen Alias:

- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` → `/` und `/game` HTTP 200; Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar; `R107 Production-Smoke bestanden`.
- R170-Browser-Probe gegen `/game` → `Punktetafel` innerhalb `Wertung` sichtbar; `aria-live="polite"`, `aria-atomic="true"`, kein `aria-label`, genau ein lokales `aria-labelledby`-Ziel mit Text `Punktetafel`, Ziel innerhalb der Region, 2 Listeneinträge, Score-Copy `Gesamt:`, `Farbgruppen:`, `Aufgaben:` vorhanden; keine Console-/Page-Errors.

## Finaler Status

R170 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias slice-spezifisch live gesmoked. Dieser Release-Nachweis vermeidet selbstreferenziellen Doku-Commit-Churn; der finale Cron-Bericht nennt den nach Doku-Sync, erneutem Deploy und erneutem Smoke verifizierten finalen `HEAD`.

## Nächster kleiner Schritt nach R170

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
