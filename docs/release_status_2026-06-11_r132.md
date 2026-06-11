# R132 Release-Nachweis — Aktiven Spieler spielerfreundlich benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R132 — der Aktiver-Spieler-Entwicklungsdatenbereich zeigt Spielernamen und verständliche Zughinweise statt roher `spieler-*`-IDs oder technischer Steuerungswerte.

## Resume-Befund

Der Cron-Lauf startete auf einem sauberen `main`:

- `HEAD` = `origin/main` = `7a9e47f`.
- Keine uncommitted oder untracked Slice-Dateien.
- Kein laufender projektspezifischer bounded Claude-/Codex-/Vercel-/Testprozess.
- Keine offene tentative Release-Doku; R131 war final synchronisiert.

Daher wurde der nächste kleine sichere UI-/Copy-Slice begonnen.

## Scope

R132 ist ein enger UI-/Copy-/A11y-Härtungsslice:

- Bereich: `Aktiver Spieler` → Entwicklungsdaten-Gruppe `Aktiver Spieler`.
- Änderung: `Aktiver Spieler` und `Spielerprofil` zeigen `Spieler 1` / `Spieler 2` und den verständlichen Zughinweis (`Du bist am Zug.` / `KI ist am Zug.`) statt roher IDs wie `spieler-1` oder technischen Steuerungswerten wie `(Mensch)`.
- Erhalten: Engine-Regeln, Zugwechsel, KI-/Mensch-Logik, Layout, Schlangen-/Karten-IDs in anderen explizit technischen Aktions-/Brettbereichen.

## TDD / Regressionen

RED:

- Neue Testdatei `src/App.r132_aktiver_spieler_profil_copy.test.tsx` fiel zunächst erwartungsgemäß fehl:
  - Erwartet: `Aktiver Spieler: Spieler 1` und `Spielerprofil: Spieler 1 — Du bist am Zug.`.
  - Gerendert wurde noch `Aktiver Spieler: spieler-1` und `Spielerprofil: spieler-1 — Spieler 1 (Mensch)`.

GREEN:

- `src/App.tsx` rendert den Aktiver-Spieler-Entwicklungsdatenbereich über `aktiverSpieler.name` und den bestehenden `zugfuehrungLabel(...)`-Mapper.
- `src/App.r132_aktiver_spieler_profil_copy.test.tsx` prüft:
  - initialer Mensch-Zug im konkret benannten `complementary`-Bereich,
  - Zugwechsel zum KI-Spieler im selben Bereich,
  - negative Assertions gegen `spieler-*`, `(Mensch)` und `(KI)`.
- Bestehende stale positive Assertions wurden nachgezogen:
  - `src/App.r43.test.tsx`
  - `src/App.test.tsx`

## Claude Code / Simplify

- Der vorgeschriebene Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: Claude Code Auth antwortete mit `Failed to authenticate. API Error: 401 Invalid authentication credentials`; die Credential-Metadaten zeigten abgelaufene OAuth-Tokens.
- Da R132 ein enger mechanischer UI-Copy-Slice war und der RED-Test eindeutig war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt.
- Eine echte Claude-`/simplify`-Vorprüfung konnte in diesem Lauf wegen desselben Auth-Blockers nicht ausgeführt werden; stattdessen wurden Diff, Zeilenbudget, fokussierte Tests und Codex-Review/Re-Review objektiv geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R132-Testdatei:

- Initiale Codex-Non-Blocker:
  - negative `spieler-*`-Regex sollte mehrstellige IDs abdecken,
  - KI-Fall sollte ebenfalls im konkret benannten Aktiver-Spieler-`complementary`-Bereich geprüft werden.
- Beide Findings wurden im R132-Test nachgezogen.
- Full-Gate-Fund: `src/App.test.tsx` enthielt noch stale positive raw-ID-Erwartungen; diese Regressionen wurden auf spielerfreundliche Copy umgestellt.
- Finaler Codex-Review:
  - `BLOCKERS: Keine.`
  - `NON-BLOCKERS: Keine review-relevanten Hinweise im Scope.`
  - Codex-Verifikation: 3 betroffene App-Testdateien / 29 Tests bestanden.

## Lokale Gates

Fokustests:

- RED vor Fix: `npm test -- --run src/App.r132_aktiver_spieler_profil_copy.test.tsx` → 1 Test fehlgeschlagen wegen raw `spieler-*`-/`(Mensch)`-Copy.
- Nach Fix und Review-Nachzug: `npm test -- --run src/App.r132_aktiver_spieler_profil_copy.test.tsx src/App.r43.test.tsx src/App.f10_debuggruppen.test.tsx src/App.r119_entwicklungsdaten_inhalte.test.tsx` → 4 Testdateien / 5 Tests grün.
- Nach stale `App.test.tsx`-Nachzug: `npm test -- --run src/App.test.tsx src/App.r132_aktiver_spieler_profil_copy.test.tsx src/App.r43.test.tsx` → 3 Testdateien / 29 Tests grün.

Full Gates:

- `npm test -- --run` → 139 Testdateien / 621 Tests grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-oS8S7CZ3.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget:
  - `src/App.tsx`: 484 Zeilen.
  - `src/App.test.tsx`: 492 Zeilen.
  - `src/App.r43.test.tsx`: 40 Zeilen.
  - `src/App.r132_aktiver_spieler_profil_copy.test.tsx`: 60 Zeilen.

## Git / GitHub

Feature-Commit:

- `255615d R132: Aktiven Spieler spielerfreundlich benennen`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY` / Alias gesetzt.
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

R132 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `Entwicklungsdaten: Aktiver Spieler` ist sichtbar.
- Live sichtbar: `Aktiver Spieler: Spieler 1` und `Spielerprofil: Spieler 1 — Du bist am Zug.`
- Negative Live-Prüfung: keine rohe `spieler-*`-ID und kein `(Mensch)`/`(KI)` im Aktiver-Spieler-Entwicklungsdatenbereich.
- Keine Console-/Page-Errors.

## Finaler Status

R132 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R132

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
