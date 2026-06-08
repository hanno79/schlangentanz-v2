# R120 Release-Nachweis — Entwicklungsdaten-Summary-Titel spielerfreundlicher

Status: abgeschlossen und live verifiziert.
Datum: 2026-06-08

## Ziel

R120 setzt den nächsten kleinen UI-Copy-Slice nach R119 um:

- Entwicklungsdaten bleiben als technische Nebenbereiche erhalten.
- Die einklappbaren Summary-Titel werden nach Spielbereichen benannt statt nach technischen Status-/Detailbegriffen.
- Keine Engine-, Regel-, CSS-, Layout- oder Interaktionsänderung.

## Umgesetzt

- `src/App.tsx`
  - `Phasenstatus` → `Spielphase`.
  - `Spielerzustände` → `Spielerstatus`.
  - `Materialstatus` → `Karten und Aufgaben`.
  - `Wertungsdetails` → `Punkteübersicht`.
  - `Aktiver Spieler` bleibt unverändert.
- `src/App.r120_entwicklungsdaten_summary_titel.test.tsx`
  - neuer R120-Regressionstest.
  - prüft alle neuen `Entwicklungsdaten: ...`-ARIA-Namen positiv.
  - prüft die alten technischen Summary-/ARIA-Titel negativ.
- Bestehende F10/F16/R118/R119-Regressionstests wurden nur konsistent an die neuen Summary-Titel angepasst; ihre Struktur- und Inhaltsverantwortung bleibt erhalten.

## RED/GREEN

- RED:
  - neuer Test `src/App.r120_entwicklungsdaten_summary_titel.test.tsx` geschrieben.
  - `npm test -- --run src/App.r120_entwicklungsdaten_summary_titel.test.tsx`
  - erwarteter Fehlschlag: alte Summary-Titel waren noch zugänglich/sichtbar.
- GREEN:
  - Claude Code `opusplan` setzte den Copy-Slice minimal um.
  - `/simplify` wurde danach ausgeführt.
  - Full Gate fand stale Erwartungen in F16/R118; diese wurden auf die neuen Titel aktualisiert.

## Review

- Codex Review-only auf aktuellem uncommitted Worktree:
  - `BLOCKERS: keine`.
  - `NON-BLOCKERS: keine`.
- Codex Recheck nach dem Full-Gate-Fix:
  - `BLOCKERS: keine`.
  - `NON-BLOCKERS: keine`.
  - Codex führte zusätzlich die betroffenen Tests und einen Full-Run aus.

## Lokale Verifikation

Ausgeführt:

```bash
npm test -- --run src/App.r120_entwicklungsdaten_summary_titel.test.tsx
npm test -- --run src/App.r120_entwicklungsdaten_summary_titel.test.tsx src/App.r119_entwicklungsdaten_inhalte.test.tsx src/App.r118_entwicklungsdaten_copy.test.tsx src/App.f16_entwicklungsdaten_debug.test.tsx src/App.f10_debuggruppen.test.tsx
npm run check:test-lines
npm run typecheck
npm run lint
npm test -- --run
npm run build
git diff --check
```

Ergebnis:

- RED-Failure wie erwartet verifiziert.
- R120/R119/R118/F16/F10-Fokustests grün: 5 Testdateien / 5 Tests.
- Testdateilängencheck grün: Alle Testdateien bleiben unter 500 Zeilen.
- Typecheck grün.
- Lint grün.
- Full Suite grün: 127 Testdateien / 606 Tests.
- Build grün.
- `git diff --check` grün.

## Geänderte Dateien

- `src/App.tsx`
- `src/App.r120_entwicklungsdaten_summary_titel.test.tsx`
- `src/App.f10_debuggruppen.test.tsx`
- `src/App.f16_entwicklungsdaten_debug.test.tsx`
- `src/App.r118_entwicklungsdaten_copy.test.tsx`
- `src/App.r119_entwicklungsdaten_inhalte.test.tsx`
- `docs/release_status_2026-06-08_r120.md`

## Release

Feature-Commit:

- `8515ec7 R120: Entwicklungsdaten-Summary-Titel spielerfreundlicher machen`

Push:

- `main -> origin/main` erfolgreich.

Vercel Production-Deploy:

- Production-Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Status: `READY` und auf den stabilen Production-Alias gesetzt.
- Dauerhaft dokumentiert wird bewusst nur der stabile Alias, keine ephemere Deployment-/Inspect-URL.

Production-Smoke:

```bash
npm run smoke:production
node .tmp_r120_live_smoke.mjs
```

Ergebnis:

- `/`: HTTP 200.
- `/game`: HTTP 200.
- Sichtbare Browser-Regionen:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
- R120-spezifischer Browser-Smoke:
  - `Entwicklungsdaten: Spielphase` sichtbar.
  - `Entwicklungsdaten: Aktiver Spieler` sichtbar.
  - `Entwicklungsdaten: Spielerstatus` sichtbar.
  - `Entwicklungsdaten: Karten und Aufgaben` sichtbar.
  - `Entwicklungsdaten: Punkteübersicht` sichtbar.
  - alte technische Titel `Phasenstatus`, `Spielerzustände`, `Materialstatus` und `Wertungsdetails` nicht mehr sichtbar/zugänglich.
  - First-turn E2E klickte eine echte Aktion und der `Schlangenbereich` änderte sich sichtbar.
  - `consoleErrors: []`.
  - `pageErrors: []`.
  - Im `src`-Code wurde keine Audio-/Analytics-Integration gefunden; Browser-Smoke zeigte keine Audio-/Analytics-Fehler.
- `R107 Production-Smoke bestanden`.
- `R120 Production-Smoke bestanden`.

## Finalisierung

- Release-Dokumentation nach Feature-Deploy und Smoke erstellt.
- Diese Dokumentation ist Teil des finalen Doku-Sync-Commits.
- Nach Doku-Synchronisierung wurde erneut gepusht, Production deployed und live gesmoked, damit `origin/main`, `HEAD` und Production denselben finalen Stand abbilden.

## Nächster kleiner Schritt nach R120

Weiterhin klein bleiben: nächster sinnvoller Slice ist ein weiterer player-facing UI-/Copy-Abgleich in einem klar begrenzten Bereich, ohne Engine-/Regeländerung. Vor jeder Regel-/Engine-Änderung weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
