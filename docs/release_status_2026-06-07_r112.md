# R112 Release-Nachweis — App-Shell eindeutige Label-IDREFs

Status: abgeschlossen und live verifiziert.
Datum: 2026-06-07

## Ziel
R112 härtet die App-Shell gegen doppelte DOM-IDs, wenn mehrere `App`-Instanzen gleichzeitig gerendert werden.

## Umgesetzt
- `src/App.tsx` nutzt React `useId()` für die beiden App-Shell-Label-Ziele:
  - Hero-Region `Schlangentanz v2 Greenfield Rebuild`,
  - Spieltisch-Region `Spieltisch`.
- Die bisherigen statischen IDREF-Ziele `title` und `spieltisch-titel` wurden durch komponentenlokale IDs ersetzt.
- Sichtbare Labels und Texte bleiben unverändert.
- Keine Engine-/Regeländerung.
- Keine Änderung an den `AktionenPanel`-Sprungziel-Konstanten; diese bleiben bewusst ein möglicher Folgeslice.
- Neuer Regressionstest: `src/App.r112_app_shell_label_idrefs.test.tsx`.
- Der Test rendert zwei `App`-Instanzen und prüft:
  - zwei Hero-Regionen mit eigenem `aria-labelledby`,
  - zwei Spieltisch-Regionen mit eigenem `aria-labelledby`,
  - genau ein IDREF-Token pro Region,
  - jedes Label-Ziel existiert im DOM genau einmal.

## RED/GREEN
- RED bestätigt: Der neue R112-Test fiel zuerst mit `expected 1 to be 2`, weil beide `App`-Instanzen dieselben statischen Label-IDREFs nutzten.
- GREEN: `aria-labelledby`/`id` für Hero und Spieltisch wurden auf `heroTitelId` und `spieltischTitelId` per `useId()` umgestellt.

## Review
- Claude Code `opusplan` GREEN-Pass hat den minimalen Fix gesetzt.
- Claude Code `/simplify` wurde ausgeführt; der danach entfernte Testdatei-Header wurde wegen Projektregel wiederhergestellt.
- Codex Review auf dem aktuellen uncommitted Worktree inklusive untracked Testdatei:
  - `BLOCKERS: none`.
  - Non-Blocker nur als Folgeslice-Hinweise: `App.tsx` bleibt mit 487 Zeilen nahe an 500; weitere statische IDREFs außerhalb R112 separat auditieren.

## Verifikation
Ausgeführt:

```bash
npm test -- --run src/App.r112_app_shell_label_idrefs.test.tsx
npm test -- --run src/App.r112_app_shell_label_idrefs.test.tsx src/App.f18_spielerfuehrung_aktionsbereich_verbindung.test.tsx src/App.f19_sprungziel_hervorhebung.test.tsx src/App.f27_sprungziel_fokus.test.tsx
npm test -- --run
npm run typecheck
npm run lint
npm run check:test-lines
npm run build
git diff --check
wc -l src/App.tsx src/App.r112_app_shell_label_idrefs.test.tsx
```

Ergebnis:

- RED-Test vor Fix: 1 Testdatei / 1 Test fehlgeschlagen mit erwarteter doppelter-IDREF-Assertion.
- Fokussierte Tests nach Fix grün: 4 Testdateien / 7 Tests.
- Full Suite grün: 120 Testdateien / 598 Tests.
- Typecheck grün.
- Lint grün.
- Test-Dateilängencheck grün: alle Testdateien unter 500 Zeilen.
- Build grün.
- `git diff --check` grün.
- Dateilängen: `src/App.tsx` 487 Zeilen, `src/App.r112_app_shell_label_idrefs.test.tsx` 44 Zeilen.

## Geänderte Dateien
- `src/App.tsx`
- `src/App.r112_app_shell_label_idrefs.test.tsx`
- `docs/release_status_2026-06-07_r112.md`

## Release abgeschlossen
- Implementierungscommit: `d928cd4 R112: App-Shell-Label-IDREFs DOM-sicher machen`.
- Push: `main -> origin/main`.
- Production: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Erster Feature-Deploy: READY und auf Production-Alias gesetzt.
- Finaler Doku-Deploy nach Release-Nachweis-Commit: READY und auf Production-Alias gesetzt.

## Live-Smoke
- `npm run smoke:production` grün:
  - `/game` HTTP 200
  - `/` HTTP 200
  - sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`
  - `R107 Production-Smoke bestanden`
- First-Turn-Browser-Smoke grün:
  - URL: `https://schlangentanz-v2.vercel.app/game`
  - erster Zug ausgeführt: `Neue Schlange starten mit Karte gelb-09`
  - `Schlangenbereich` änderte sich sichtbar
  - `Zuletzt ausgeführt` sichtbar
  - `consoleErrors: []`
  - `pageErrors: []`

## Nächster kleiner Schritt
- Möglicher R113-Folgeslice: statische `AktionenPanel`-Sprungziel-IDs (`EMPFOHLENE_AKTION_ID`, `PHASENAKTION_ID`) DOM-sicher machen, falls mehrere App-/Panel-Instanzen gleichzeitig gerendert werden.
- Alternativ weiter kleine A11y-/UI-Härtung oder ein schmaler regel-/engine-naher Regressionstest.
- Vor jeder späteren Regel-/Engine-Änderung weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
