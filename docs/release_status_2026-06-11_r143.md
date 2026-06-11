# R143 Release-Nachweis — Punktetafel deutsch benennen

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R143 — die sichtbare und semantische Wertungs-Kartenliste heißt für Spieler `Punktetafel` statt englisch `Scoreboard`.

## Resume-Befund

Der Cron-Lauf fand keinen halbfertigen Zustand vor:

- `HEAD` und `origin/main` standen zu Beginn beide auf `8693841`.
- Der Worktree war sauber; `git diff --check` hatte keine Befunde.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse.
- R142 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/Copy-/A11y-Slice R143 begonnen.

## Scope

R143 ist ein enger Copy-/A11y-Slice:

- Änderung: Im Bereich `Wertung` heißt die Wertungs-Kartenliste sichtbar und per `aria-label` `Punktetafel`.
- Erhalten: CSS-Klassen `scoreboard-*` bleiben technische Styling-Hooks; Punkteberechnung, Kartenliste, Reihenfolge und Layout bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine Wertungslogik, kein Layout-Refactor, keine neue Interaktion.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r143_punktetafel_label.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r143_punktetafel_label.test.tsx` schlug erwartungsgemäß fehl, weil im `Wertung`-Bereich noch `Scoreboard` als Region/Heading sichtbar war.

GREEN:

- `src/App.tsx` rendert die Wertungs-Kartenliste jetzt als `<section className="scoreboard-bereich" aria-label="Punktetafel">` mit Heading `Punktetafel`.
- `src/App.r143_punktetafel_label.test.tsx` prüft die neue Region/Heading, die vorhandenen Listeneinträge sowie negativ alte `Scoreboard`-Region, -Heading und sichtbare `scoreboard`-Copy im Wertungsbereich.
- Bestehende Tests wurden auf die neue Spieler-Copy nachgezogen:
  - `src/App.f8_scoreboard.test.tsx`
  - `src/App.f10_debuggruppen.test.tsx`
  - `src/App.r128_scoreboard_copy.test.tsx`

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Separate Claude-`/simplify`-Vorprüfung wurde versucht.
- Blocker in beiden Fällen: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R143 ein enger mechanischer UI-Copy-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R143-Testdatei:

- Initial: `BLOCKERS: Keine`; ein Non-Blocker empfahl eine stärkere negative Textprüfung gegen `Scoreboard` im `Wertung`-Bereich.
- Nachzug: `expect(wertung).not.toHaveTextContent(/scoreboard/i)` ergänzt.
- Re-Review: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r143_punktetafel_label.test.tsx src/App.f8_scoreboard.test.tsx src/App.f10_debuggruppen.test.tsx src/App.r128_scoreboard_copy.test.tsx` → 4 Testdateien / 4 Tests grün.

Full Gates:

- `npm test -- --run` → 149 Testdateien / 637 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-B-3QOAgz.js` / `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/App.tsx` 496 Zeilen; alle geänderten Tests unter 500 Zeilen).

## Git / GitHub

Feature-Commit:

- `3cd1288 R143: Punktetafel deutsch benennen`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY` / Alias gesetzt.
- Ephemere Deployment-URL wird bewusst nicht als dauerhafte Release-Referenz dokumentiert.

## Production-Smoke

R143 Slice-Smoke:

- Browser-Smoke gegen [https://schlangentanz-v2.vercel.app/game](https://schlangentanz-v2.vercel.app/game).
- `/` und `/game`: HTTP 200.
- Kernregionen sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`.
- Slice-spezifisch sichtbar im `Wertung`-Bereich: Region und Heading `Punktetafel`.
- Negative Live-Prüfung: keine `Scoreboard`-Region, kein `Scoreboard`-Heading und keine sichtbare `Scoreboard`-Copy im `Wertung`-Bereich.
- Keine Console-/Page-Errors.

## Finaler Status

R143 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheits- sowie slice-spezifisch gesmoked.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R143

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
