# R169 Release-Nachweis — Wertung atomar ankündigen

Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R169 — die bestehende Region `Wertung` wird als höfliche, atomare Live-Region angekündigt.

## Resume-Befund

Die Initialdiagnose dieses Cron-Laufs ergab:

- Arbeitsverzeichnis: `/home/projects/schlangentanz-v2`
- Zeitpunkt: `2026-06-12T06:31:04+00:00`
- `main` war sauber und synchron mit `origin/main` auf `5b1d5be`.
- Keine uncommitted/untracked Slice-Dateien, keine Diff-Checks, keine plausiblen laufenden projektbezogenen bounded Agent-/Test-/Deploy-Prozesse.
- R168 war in `docs/PLAYABILITY_GATE.md` und `docs/release_status_2026-06-12_r168.md` als umgesetzt, getestet, reviewed, committed, gepusht, deployed und live gesmoked dokumentiert.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R169 begonnen.

## Scope

R169 ist ein enger Live-Region-Härtungsslice im Bereich `Wertung`:

- Änderung: Die bestehende Region `Wertung` behält ihr sichtbares lokales Überschriftenlabel via `aria-labelledby` und erhält zusätzlich `aria-live="polite"` sowie `aria-atomic="true"`, damit Punktestands-/Wertungsänderungen zusammenhängend angekündigt werden.
- Nicht-Ziele: Keine sichtbare Copy-Änderung, keine Engine-/Regeländerung, keine Änderung an `Punktetafel`, `Punkteübersicht`, Handlern, Layout oder Nachbarregionen.

## RED

Neuer Test:

- `src/App.r169_wertung_live_region_atomic.test.tsx`

RED-Ergebnis:

- `npm test -- --run src/App.r169_wertung_live_region_atomic.test.tsx` fiel erwartungsgemäß fehl, weil die Wertungsregion noch kein `aria-live="polite"` hatte.

## GREEN / Claude-Code-Fallback

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R169 ein enger mechanischer A11y-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und objektiv getestet.
- Produktionsänderung: `src/App.tsx` ergänzt an der bestehenden `Wertung`-Region `aria-live="polite"` und `aria-atomic="true"`.

## `/simplify`

- Separate Claude-Code-`/simplify`-Vorprüfung wurde versucht.
- Blocker: derselbe `401 Invalid authentication credentials`.
- Der Diff wurde danach objektiv geprüft; es gab keine zusätzliche Vereinfachung ohne Verhaltensänderung. `src/App.tsx` bleibt exakt bei 500 Zeilen.

## Codex Review

- Review-only auf Worktree inklusive untracked R169-Test.
- Ergebnis: `BLOCKERS: Keine`.
- Codex bestätigte als Non-Blocker/Verifikation: Änderung ist auf die bestehende Wertungsregion beschränkt, IDREF-Vertrag bleibt intakt, sichtbare Copy bleibt unverändert, `App.tsx` verletzt das 500-Zeilen-Budget nicht.
- Codex-Verifikation: `npm test -- --run src/App.r169_wertung_live_region_atomic.test.tsx` → 1 Testdatei / 1 Test bestanden.

## Gates

Fokussiert:

- `npm test -- --run src/App.r169_wertung_live_region_atomic.test.tsx src/App.r150_wertung_idref.test.tsx src/App.r143_punktetafel_label.test.tsx` → 3 Testdateien / 3 Tests bestanden.

Full Gates:

- `npm test -- --run` → 175 Testdateien / 663 Tests bestanden.
- `npm run typecheck` → bestanden.
- `npm run lint` → bestanden.
- `npm run build` → bestanden (`tsc -b && vite build`).
- `npm run check:test-lines` → bestanden; alle Testdateien unter 500 Zeilen.
- `git diff --check` → bestanden.
- Zeilenbudget: `src/App.tsx` exakt 500 Zeilen, `src/App.r169_wertung_live_region_atomic.test.tsx` 37 Zeilen.

## Commit / Push

Feature-Commit auf `origin/main`:

- `cb44356 R169: Wertung atomar ankündigen`

## Deploy / Smoke

Deploy:

- `vercel deploy --prod --yes --token=…` stellte den Production-Alias `https://schlangentanz-v2.vercel.app` bereit (`READY`).

Production-Smoke gegen den stabilen Alias:

- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` → `/` und `/game` HTTP 200; Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar; `R107 Production-Smoke bestanden`.
- R169-Browser-Probe gegen `/game` → Kernregionen inklusive `Wertung` sichtbar; `Wertung` hat `aria-live="polite"`, `aria-atomic="true"`, kein `aria-label`, genau ein lokales `aria-labelledby`-Ziel mit Text `Wertung`, sichtbare `Punktetafel`, `Punktestand von Spieler 1:` und `Gesamt:`; keine Console-/Page-Errors.

## Finaler Status

R169 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias slice-spezifisch live gesmoked. Dieser Release-Nachweis vermeidet selbstreferenziellen Doku-Commit-Churn; der finale Cron-Bericht nennt den nach Doku-Sync, erneutem Deploy und erneutem Smoke verifizierten finalen `HEAD`.

## Nächster kleiner Schritt nach R169

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
