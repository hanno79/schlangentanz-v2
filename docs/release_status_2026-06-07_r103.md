# R103 Release-Nachweis — Schlangenhäutung Redundanzreduktion

Author: rahn
Datum: 07.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R103 — Entfernung der doppelten Schlangenhäutung-Quick-Option „erste Karte ans Ende“.

## Scope

R103 reduziert gezielt Redundanz nach R102.

Umgesetzt:

- Die separate Quick-Option `erste Karte ans Ende` wurde aus den Schlangenhäutung-Quick-Optionen entfernt.
- Die R102-Auswahl `Schlangenhäutung-Reihenfolge-Auswahl` deckt dieselbe Aktion weiterhin ab.
- Die Umkehr-Quick-Option bleibt erhalten.
- Keine neue Drag&Drop-Mechanik.
- Keine neue Schlangenhäutung-Parallelmechanik.
- Keine Engine-Regeländerung.

## Relevante Dateien

- `src/ui/schlangenhaeutungUiAktionen.ts`
- `src/ui/schlangenhaeutungUiAktionen.test.ts`
- `src/App.r103_schlangenhaeutung_redundanz_reduzieren.test.tsx`
- Entfernt/ersetzt: `src/App.r101_schlangenhaeutung_erste_karte_ans_ende.test.tsx`

## Feature-Commit

- `95f96b5 R103: Schlangenhäutung-Redundanz reduzieren`

## Verifikation lokal

Ausgeführt:

```bash
npm test -- --run src/App.r103_schlangenhaeutung_redundanz_reduzieren.test.tsx src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx src/App.r100_schlangenhaeutung_umkehren.test.tsx src/App.r99_schlangenhaeutung_hinweis.test.tsx src/ui/schlangenhaeutungUiAktionen.test.ts
npm run typecheck
npm run lint
npm test -- --run
npm run build
npm run check:test-lines
git diff --check
```

Ergebnis:

- RED bestätigt: R103-Test scheiterte zuerst wegen vorhandener Quick-Option `erste Karte ans Ende`.
- Focused Tests grün.
- Full Tests grün: 114 Testdateien, 588 Tests.
- Typecheck grün.
- Lint grün.
- Build grün.
- Test-Dateilängencheck grün.
- `git diff --check` grün.

## Review

- Claude Code GREEN-Slice lief bis `max-turns`, änderte aber den erwarteten kleinen Scope.
- Claude Code `/simplify` erfolgreich; alle 588 Tests grün gemeldet.
- Codex Review: keine Blocker, keine Non-Blocker.

## Production-Deploy

- Production-Alias: https://schlangentanz-v2.vercel.app
- Deployment: https://schlangentanz-v2-hlfke3bnx-alfreds-projects-7e9df1b4.vercel.app
- Vercel Status: READY

## Smoke-Test Production

Ausgeführt:

```bash
curl -L https://schlangentanz-v2.vercel.app/
curl -L https://schlangentanz-v2.vercel.app/game
```

Ergebnis:

- `/` HTTP 200
- `/game` HTTP 200
- Bundle enthält weiterhin:
  - `Schlangenhäutung-Reihenfolge-Auswahl`
  - `gewählte Karte aus Schlange`
- Bundle enthält nicht mehr:
  - `erste Karte ans Ende`
- Playwright GUI-Smoke auf Production erfolgreich.
- Geprüfte Regionen:
  - `Spielstatus`
  - `Aktiver Spieler`
  - `Aktionen`
  - `Schlangenbereich`
- Keine Console Errors.
- Keine Page Errors.

## Bewusst nicht im Scope

- Keine freie Vollsortierung.
- Kein Drag&Drop-Reordering.
- Keine Permutations-Enumeration in `ermittleLegaleAktionen`.
- Keine neue Engine-Regelmechanik.
