# R113 Release-Nachweis — AktionenPanel-Sprungziel-IDs DOM-sicher

Status: abgeschlossen und live verifiziert.
Datum: 2026-06-07

## Ziel
R113 härtet die Spielerführung-zu-AktionenPanel-Sprungziele gegen doppelte DOM-IDs, wenn mehrere `App`-Instanzen gleichzeitig gerendert werden.

## Umgesetzt
- `src/App.tsx` erzeugt per React `useId()` komponentenlokale Ziel-IDs für:
  - `Empfohlene Aktion`,
  - `Phasenaktion`.
- `src/components/AktionenPanel.tsx` erhält diese IDs als Props und verwendet sie für die tatsächlichen Zielregionen.
- `src/components/Spielerfuehrung.tsx` verwendet die von `App` übergebene Ziel-ID für `href` und Hervorhebungs-Callback.
- Ohne echte Ziel-ID rendert `Spielerfuehrung` keinen Link auf ein nicht vorhandenes DOM-Ziel, sondern den bestehenden Kein-Springziel-Hinweis.
- Keine Engine-/Regeländerung.
- Neuer Regressionstest: `src/App.r113_aktionenpanel_idrefs.test.tsx`.
- Der Test rendert zwei `App`-Instanzen und prüft:
  - eindeutige Ziel-IDs für `Empfohlene Aktion` und `Phasenaktion`,
  - Spielerführungslinks zeigen auf die konkrete Zielregion der eigenen App-Instanz.

## RED/GREEN
- RED bestätigt: Der neue R113-Test fiel zuerst mit `expected 2 to be 4`, weil zwei `App`-Instanzen dieselben statischen AktionenPanel-Ziel-IDs nutzten.
- GREEN: statische `EMPFOHLENE_AKTION_ID`/`PHASENAKTION_ID` wurden durch per `useId()` erzeugte, über Props verdrahtete Ziel-IDs ersetzt.

## Review
- Claude Code `opusplan` GREEN-Pass wurde ausgeführt; der erste Pass erreichte das Turn-Limit, schrieb aber verwertbare Änderungen. Fehlende `useId()`-Initialisierung in `App.tsx` wurde klein korrigiert.
- Claude Code `/simplify` wurde ausgeführt; anschließend waren F18/F27/F19-Testverträge auf statische IDs anzupassen.
- Codex Review auf dem aktuellen uncommitted Worktree inklusive untracked R113-Test:
  - `BLOCKERS: keine`.
  - Ein Non-Blocker: Standalone-`Spielerfuehrung` ohne Ziel-ID erzeugte einen Link auf ein nicht vorhandenes Ziel.
- Non-Blocker wurde behoben und mit F17 erweitert.
- Codex Re-Review:
  - `BLOCKERS: keine`.
  - `NON-BLOCKERS: keine`.

## Verifikation
Ausgeführt:

```bash
npm test -- --run src/App.r113_aktionenpanel_idrefs.test.tsx src/App.f17_menschlicher_turn_checkliste.test.tsx src/App.f18_spielerfuehrung_aktionsbereich_verbindung.test.tsx src/App.f19_sprungziel_hervorhebung.test.tsx src/App.f27_sprungziel_fokus.test.tsx src/App.f29_no_target_hinweis.test.tsx
npm run typecheck
npm test -- --run
npm run typecheck
npm run lint
npm run build
git diff --check
```

Ergebnis:

- RED-Test vor Fix: 1 Testdatei / 1 Test fehlgeschlagen mit erwarteter doppelter-ID-Assertion.
- Fokussierte Tests nach Review-Fix grün: 6 Testdateien / 11 Tests.
- Full Suite grün: 121 Testdateien / 599 Tests.
- Typecheck grün.
- Lint grün.
- Build grün.
- `git diff --check` grün.
- Dateilängen:
  - `src/App.tsx`: 491 Zeilen.
  - `src/components/AktionenPanel.tsx`: 263 Zeilen.
  - `src/components/Spielerfuehrung.tsx`: 62 Zeilen.
  - `src/App.r113_aktionenpanel_idrefs.test.tsx`: 49 Zeilen.

## Geänderte Dateien
- `src/App.tsx`
- `src/components/AktionenPanel.tsx`
- `src/components/Spielerfuehrung.tsx`
- `src/App.r113_aktionenpanel_idrefs.test.tsx`
- `src/App.f17_menschlicher_turn_checkliste.test.tsx`
- `src/App.f18_spielerfuehrung_aktionsbereich_verbindung.test.tsx`
- `src/App.f19_sprungziel_hervorhebung.test.tsx`
- `src/App.f27_sprungziel_fokus.test.tsx`
- `docs/release_status_2026-06-07_r113.md`

## Release abgeschlossen
- Implementierungscommit: `882dcb7 R113: AktionenPanel-Sprungziele DOM-sicher machen`.
- Push: `main -> origin/main`.
- Production: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Feature-Deploy: `https://schlangentanz-v2-pkqaz0v4v-alfreds-projects-7e9df1b4.vercel.app`
- Vercel Inspect: `https://vercel.com/alfreds-projects-7e9df1b4/schlangentanz-v2/GXX4xiwRuFinSiE5SuUAh41eCgYo`
- Deploy-Status: READY und auf Production-Alias gesetzt.

## Live-Smoke
- `npm run smoke:production` grün:
  - `/game` HTTP 200
  - `/` HTTP 200
  - sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`
  - `R107 Production-Smoke bestanden`
- First-Turn-Browser-Smoke grün:
  - URL: `https://schlangentanz-v2.vercel.app/game`
  - erster Zug ausgeführt: `Neue Schlange starten mit Karte rot-13`
  - `Schlangenbereich` änderte sich sichtbar
  - `Zuletzt ausgeführt: Neue Schlange starten mit Karte rot-13`
  - `consoleErrors: []`
  - `pageErrors: []`

## Nächster kleiner Schritt nach Release
- Nach R113 Release erneut klein weiterarbeiten: entweder weitere DOM-IDREF-Audits oder ein regel-/engine-naher Regressionstest.
- Vor jeder späteren Regel-/Engine-Änderung weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
