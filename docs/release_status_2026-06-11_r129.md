# R129 Release-Nachweis — Gewinner-Copy spielerfreundlicher

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R129 — Gewinner- und Ergebniszeilen zeigen Spielernamen statt roher Spieler-IDs.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `48e8cda`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer Claude-/Codex-/Vercel-/Testprozess.
- Keine offene tentative Release-Doku; R128 war final synchronisiert.

Daher wurde der nächste kleine sichere UI-/Copy-Slice begonnen.

## Scope

R129 ist ein kleiner UI-/Copy-Slice:

- Bereich: Spielende-/Wertungsanzeige für Gewinner und Ergebnis.
- Änderung: sichtbare Gewinner-/Ergebniszeilen verwenden Spielernamen (`Spieler 1`, `Spieler 2`) statt roher `spieler-*`-IDs.
- Erhalten: Engine-Gewinnerermittlung, Scoring, Gleichstand-Reihenfolge, Spielende-Gating, Scoreboard, Punkteübersicht, Endrundenanzeige, Layout/CSS.

## TDD / Regressionen

RED:

- Neue Testdatei `src/App.r129_gewinner_copy.test.tsx` fiel zunächst erwartungsgemäß fehl:
  - `Ergebnis: Sieg für Spieler 1` wurde nicht gefunden.
  - Live gerendert wurde noch `Ergebnis: Sieg für spieler-1` und `Gewinner spieler-1`.

GREEN:

- `src/App.tsx` mappt Gewinner-`spielerId`s über `zustand.spieler[].name` mit ID-Fallback.
- `Gewinner: …`, `Ergebnis: …` und die Wertungs-Gewinnerliste nutzen jetzt Spielernamen.
- `src/App.test.tsx` aktualisiert die bestehenden R31-Gewinnerregressionen auf Spielernamen und behält Gewinneranzahl/-Reihenfolge bei.
- `src/App.r56.test.tsx` schützt weiterhin die Spielende-/Gewinnerübersicht mit Spielernamen.
- `src/App.r129_gewinner_copy.test.tsx` prüft zusätzlich negative stale-copy-Assertions gegen `Gewinner spieler-*`, `Sieg für spieler-*` und `Gewinner: spieler-*`.

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass und der separate `/simplify`-Pass wurden über das `claudeuser`-Pattern versucht.
- Blocker: Claude Code Auth antwortete jeweils mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R129 ein enger mechanischer UI-Copy-Slice war und der RED-Test eindeutig war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt.
- Nach dem fehlgeschlagenen `/simplify`-Versuch wurden fokussierte Tests und Lint erneut grün ausgeführt.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R129-Testdatei:

- `BLOCKERS: Keine gefunden.`
- `NON-BLOCKERS:` nur Verifikationsnotizen:
  - `src/App.tsx` mit 484 Zeilen unter dem 500-Zeilen-Limit.
  - Engine/Scoring/Layout unverändert.
  - R31 schützt Gewinner-Reihenfolge und Anzahl.
  - R56 schützt Gewinneranzahl und erste Gewinnerzeile.
  - R129-Test prüft neue Copy gegen rohe `spieler-*`-IDs.
- Codex führte selbst `npm test -- --run src/App.test.tsx src/App.r56.test.tsx src/App.r129_gewinner_copy.test.tsx` aus: 3 Dateien / 28 Tests bestanden.

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r129_gewinner_copy.test.tsx` → 1 Test fehlgeschlagen wegen `Sieg für spieler-1` / `Gewinner spieler-1`.
- Nach Fix: `npm test -- --run src/App.r129_gewinner_copy.test.tsx src/App.r56.test.tsx src/App.test.tsx` → 3 Testdateien / 28 Tests grün.
- Nach fehlgeschlagenem `/simplify`-Auth-Versuch erneut:
  - `npm test -- --run src/App.r129_gewinner_copy.test.tsx src/App.r56.test.tsx src/App.test.tsx` → 3 Testdateien / 28 Tests grün.
  - `npm run lint -- --max-warnings=0` → grün.

Full Gates:

- `npm test -- --run` → 136 Testdateien / 617 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-1Wfw0Wll.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check` → grün.
- Zeilenbudget:
  - `src/App.tsx`: 484 Zeilen.
  - `src/App.test.tsx`: 488 Zeilen.
  - `src/App.r56.test.tsx`: 43 Zeilen.
  - `src/App.r129_gewinner_copy.test.tsx`: 49 Zeilen.

## Git / GitHub

Feature-Commit:

- `96ce7c2 R129: Gewinner-Copy spielerfreundlicher machen`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY`.
- Ephemere Deployment-URL wird bewusst nicht als dauerhafte Release-Referenz dokumentiert.

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

R129 Browser-Smoke:

- Playwright lud den stabilen Production-Alias `/game` im echten Browser.
- Ein repräsentativer UI-Flow führte mehrere legale/Phasenaktionen aus und meldete keine `console`- oder `pageerror`-Fehler.
- Die Spielende-/Gewinneranzeige ist im aktuellen Browser-Smoke nicht innerhalb des kurzen repräsentativen Flows erreichbar; die slice-spezifische Copy ist deshalb durch DOM-Tests, Full Gates und den Produktionsbuild abgesichert, nicht durch eine sichtbare Spielende-Live-Endzustandsprüfung.
- Negative Smoke-Beobachtung: keine stale Gewinner-Copy `Gewinner spieler-*`, `Sieg für spieler-*` oder `Gewinner: spieler-*` war im erreichten Live-DOM sichtbar.

## Finaler Status

R129 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias grundlegend live verifiziert. Die sichtbare Spielende-Endzustands-Copy wurde lokal per DOM-Regression abgesichert; ein vollständiger Live-Endzustand wurde in diesem kleinen Cron-Lauf nicht erzwungen.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R129

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
