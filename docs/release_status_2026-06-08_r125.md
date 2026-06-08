# R125 Release-Nachweis — Aktiver-Spieler-Punktestand-Copy spielerfreundlicher

Author: rahn
Datum: 08.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R125 — die aktive Spielerwertung im Entwicklungsdaten-Bereich „Aktiver Spieler“ wird als verständlicher Punktestand angezeigt.

## Scope

R125 setzt den nächsten kleinen sicheren UI-Copy-Slice nach R124 um:

- Bereich: `Entwicklungsdaten: Aktiver Spieler`.
- Änderung: `Aktuelle Wertung:` → `Aktueller Punktestand:`.
- Ziel: Spielerfreundlichere Punkte-Copy ohne technische Wertungsformulierung im aktiven Spielerbereich.
- Bewusst nicht geändert: Engine-Regeln, Scoring-Logik, Layout, CSS, Interaktionen, Aktionslabels, Punkteberechnung.

## TDD

RED:

- Neuer Test `src/App.r125_aktiver_spieler_punktestand_copy.test.tsx` schlug zunächst erwartungsgemäß fehl, weil im Zielbereich noch `Aktuelle Wertung:` sichtbar war und `Aktueller Punktestand:` fehlte.

GREEN:

- `src/App.tsx` zeigt im Entwicklungsdaten-Bereich `Aktiver Spieler` nun `Aktueller Punktestand: ...`.
- `src/App.r55.test.tsx` wurde auf die neue Copy aktualisiert und prüft weiterhin, dass der Punktestand des aktiven Spielers vor und nach einer Aktion aktualisiert wird.

## Review

Claude Code `/simplify`:

- Modell: `opusplan`.
- Ergebnis: eine kleine JSX-Vereinfachung empfohlen und übernommen.
- Keine Scope-Ausweitung.

Codex Review:

- Review-only auf aktuellem uncommitted Worktree inklusive neuer R125-Testdatei.
- Ergebnis:
  - `BLOCKERS: keine`
  - `NON-BLOCKERS: keine`

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r125_aktiver_spieler_punktestand_copy.test.tsx src/App.r55.test.tsx src/App.r119_entwicklungsdaten_inhalte.test.tsx src/App.f10_debuggruppen.test.tsx`
- Ergebnis: 4 Testdateien / 4 Tests grün.

Full Gates:

- `npm test -- --run`
  - 132 Testdateien grün.
  - 611 Tests grün.
- `npm run lint`
  - grün.
- `npm run build`
  - `tsc -b && vite build` grün.
- `npm run check:test-lines`
  - alle Testdateien unter 500 Zeilen.
- `git diff --check`
  - grün.

Dateigrößen:

- `src/App.tsx`: 485 Zeilen.
- `src/App.r55.test.tsx`: 66 Zeilen.
- `src/App.r125_aktiver_spieler_punktestand_copy.test.tsx`: 26 Zeilen.

## Git / GitHub

Feature-Commit:

- `8a1bcdd R125: Aktiver-Spieler-Punktestand-Copy verbessern`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: READY.

## Production-Smoke

R107 Production-Smoke:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- Kernregionen sichtbar:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
- Ergebnis: `R107 Production-Smoke bestanden`.

R125-spezifischer Browser-Smoke:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- `Entwicklungsdaten: Aktiver Spieler` sichtbar.
- `Aktueller Punktestand: 0 Punkte` sichtbar.
- Veraltetes Label `Aktuelle Wertung:` nicht sichtbar.
- `consoleErrors: []`.
- `pageErrors: []`.
- Ergebnis: `R125 Production-Smoke bestanden`.

## Finaler Status

R125 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und live verifiziert.

Dieser Release-Nachweis wird als Doku-Sync-Commit auf `main` übernommen. Danach wird der aktuelle `main` erneut nach Production deployed und final live gesmoked, damit GitHub, Doku und Production synchron sind.

## Nächster kleiner Schritt nach R125

Autonom mit dem nächsten kleinen sicheren UI-/Copy-Slice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
