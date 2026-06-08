# R118 Release-Nachweis — Entwicklungsdaten-Copy ohne Debug-Präfix

Status: abgeschlossen und live verifiziert.
Datum: 2026-06-08

## Ziel

R118 setzt den nächsten kleinen UI-Copy-/A11y-Schritt nach R117 um:

- Entwicklungsdaten-/Debuggruppen bleiben als technische Nebenbereiche erhalten.
- Badge `Entwicklungsdaten`, `aside`/`complementary`, offene `details.debug-gruppe` und Detailinhalte bleiben sichtbar.
- Sichtbare Summary-Copy und zugängliche Landmark-Namen enthalten kein `Debug:`-Präfix mehr.
- Keine Engine-, Regel-, CSS- oder Interaktionsänderung.

## Umgesetzt

- `src/App.tsx`
  - fünf `DebugGruppe`-Titel von `Debug: …` auf spielerfreundlichere Titel ohne Präfix umgestellt:
    - `Phasenstatus`
    - `Aktiver Spieler`
    - `Spielerzustände`
    - `Materialstatus`
    - `Wertungsdetails`
  - Änderungskommentar für R118 ergänzt.
  - `App.tsx` bleibt unter der 500-Zeilen-Grenze.
- `src/App.r118_entwicklungsdaten_copy.test.tsx`
  - neuer R118-Regressionstest.
  - prüft fünf `complementary`-Landmarks mit exakten Accessible Names `Entwicklungsdaten: …`.
  - prüft sichtbares Badge `Entwicklungsdaten`.
  - prüft sichtbare `summary`-Titel ohne `Debug:`.
  - prüft, dass sichtbare `Debug:`-Texte und `Debug:` in Entwicklungsdaten-`aria-label`s fehlen.
- `src/App.f10_debuggruppen.test.tsx`
  - alter Summary-Vertrag auf die neuen Titel ohne `Debug:` aktualisiert.
  - `summary`-Query mit `selector: 'summary'` gehärtet.
  - Detailinhalte und offene `details.debug-gruppe` bleiben geprüft.
- `src/App.f11_debuggruppen_polish.test.tsx`
  - Negativ-Assertion für sichtbare `Debug:`-Summary-Copy aktualisiert.
  - bestehende CSS-/Sichtbarkeitsverträge bleiben unverändert.
- `src/App.f16_entwicklungsdaten_debug.test.tsx`
  - `complementary`-/Badge-/Klassenvertrag auf die neuen Accessible Names ohne `Debug:` aktualisiert.

## RED/GREEN

- RED:
  - neuer Test `src/App.r118_entwicklungsdaten_copy.test.tsx` geschrieben.
  - `npm test -- --run src/App.r118_entwicklungsdaten_copy.test.tsx`
  - Erwarteter Fehlschlag: erster Entwicklungsdaten-Bereich hatte noch Accessible Name `Entwicklungsdaten: Debug: Phasenstatus`.
- GREEN:
  - Claude Code `opusplan` hat den UI-Copy-Slice minimal umgesetzt.
  - angrenzende F10/F11/F16-Tests wurden auf den neuen Copy-Vertrag angepasst.
  - Hermes fixte danach eine verbliebene F16-Altassertion.

## Claude/Simplify

- Claude Code `opusplan` GREEN-Pass wurde ausgeführt.
- Claude-Lauf endete mit `Reached max turns (20)`, hatte die relevanten Dateien aber bereits bearbeitet.
- Hermes prüfte den Worktree, korrigierte die noch rote F16-Assertion minimal und führte die fokussierten Tests grün aus.
- `/simplify` wurde nach dem GREEN-Pass ausgeführt.
- `/simplify` Ergebnis: `4/4 tests pass. No changes applied.`

## Review

- Codex Review-only auf aktuellem uncommitted Worktree inklusive untracked R118-Test:
  - Ergebnis: `BLOCKERS: Keine`.
  - Non-Blocker: eine Array-Negativ-Assertion im R118-Test war zu schwach formuliert.
- Non-Blocker umgesetzt:
  - `not.toContain(expect.stringMatching(...))` ersetzt durch `not.toEqual(expect.arrayContaining([expect.stringMatching(...)]))`.
- Codex Re-Review:
  - Ergebnis: `BLOCKERS: Keine`, `NON-BLOCKERS: Keine`.

## Lokale Verifikation

Ausgeführt:

```bash
npm test -- --run src/App.r118_entwicklungsdaten_copy.test.tsx src/App.f10_debuggruppen.test.tsx src/App.f11_debuggruppen_polish.test.tsx src/App.f16_entwicklungsdaten_debug.test.tsx
npm test -- --run
npm run typecheck
npm run build
npm run lint
npm run check:test-lines
git diff --check
```

Ergebnis:

- RED-Failure wie erwartet verifiziert.
- R118/F10/F11/F16-Fokustests grün: 4 Testdateien / 4 Tests.
- Full Suite grün: 125 Testdateien / 604 Tests.
- Typecheck grün.
- Build grün.
- Lint grün.
- Testdateilängencheck grün: Alle Testdateien unter 500 Zeilen.
- `git diff --check` grün.
- Dateilängen im Review-Scope:
  - `src/App.tsx`: 487 Zeilen.
  - `src/App.r118_entwicklungsdaten_copy.test.tsx`: 43 Zeilen.
  - `src/App.f10_debuggruppen.test.tsx`: 78 Zeilen.
  - `src/App.f11_debuggruppen_polish.test.tsx`: 72 Zeilen.
  - `src/App.f16_entwicklungsdaten_debug.test.tsx`: 41 Zeilen.

## Geänderte Dateien

- `src/App.tsx`
- `src/App.f10_debuggruppen.test.tsx`
- `src/App.f11_debuggruppen_polish.test.tsx`
- `src/App.f16_entwicklungsdaten_debug.test.tsx`
- `src/App.r118_entwicklungsdaten_copy.test.tsx`
- `docs/release_status_2026-06-08_r118.md`

## Release

Feature-Commit:

- `3fa247d R118: Entwicklungsdaten-Copy spielerfreundlicher machen`

Push:

- `main -> origin/main` erfolgreich.

Vercel Production-Deploy:

- Production-Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Status: `READY` und auf den stabilen Production-Alias gesetzt.
- Dauerhaft dokumentiert wird bewusst nur der stabile Alias, keine ephemere Deployment-/Inspect-URL.

Production-Smoke:

```bash
npm run smoke:production
node .tmp_r118_live_smoke.mjs
```

Ergebnis:

- `HTTP 200  https://schlangentanz-v2.vercel.app/game`
- `HTTP 200  https://schlangentanz-v2.vercel.app/`
- Sichtbare Browser-Regionen:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
- R118-spezifischer Browser-Smoke:
  - `Entwicklungsdaten: Phasenstatus` sichtbar.
  - `Entwicklungsdaten: Aktiver Spieler` sichtbar.
  - `Entwicklungsdaten: Spielerzustände` sichtbar.
  - `Entwicklungsdaten: Materialstatus` sichtbar.
  - `Entwicklungsdaten: Wertungsdetails` sichtbar.
  - keine sichtbare `Debug:`-Copy.
  - keine `Debug:`-Copy in Entwicklungsdaten-`aria-label`s.
- `R107 Production-Smoke bestanden`.
- `R118 Production-Smoke bestanden`.

Finalisierung:

- Finale Doku-Synchronisierung nach dem Feature-Commit wurde gepusht.
- Finaler Production-Deploy nach Doku-Synchronisierung erfolgreich und auf den stabilen Alias gesetzt.
- Erneuter Production-Smoke nach finalem Doku-Deploy erfolgreich, damit `origin/main`, `HEAD` und Production-Alias denselben finalen Stand abbilden.

## Nächster kleiner Schritt nach R118

Nach R118 weiterhin klein bleiben: nächster sinnvoller UI-Slice ist ein weiterer spieler-facing Copy-/A11y-Abgleich in den Entwicklungsdaten-Inhalten selbst, z. B. erste interne Zeilen wie `Engine-Demo`/`Details` in eine klarere Spieler-/Statussprache überführen, ohne Debugbereich, Engine oder Regeln zu entfernen. Vor jeder Regel-/Engine-Änderung weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
