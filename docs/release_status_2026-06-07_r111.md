# R111 Release-Nachweis — Schlangenbereich eindeutige Label-IDREFs

Status: abgeschlossen und live verifiziert.
Datum: 2026-06-07

## Ziel
R111 härtet den wiederverwendbaren `Schlangenbereich` gegen doppelte DOM-IDs bei mehrfach gerenderten Komponenten.

## Umgesetzt
- `src/components/Schlangenbereich.tsx` nutzt die bereits vorhandene `useId()`-Instanz-ID jetzt auch für `aria-labelledby`.
- Die drei bisher statischen Label-Ziele sind komponentenlokal:
  - Hauptregion `Schlangenbereich`
  - Unterregion `Eigene Schlangen`
  - Unterregion `Gegnerische Schlangen`
- Sichtbare Labels bleiben unverändert.
- Keine Engine-/Regeländerung.
- Neuer Regressionstest: `src/App.r111_schlangenbereich_label_idrefs.test.tsx`.
- Der Test rendert zwei `Schlangenbereich`-Instanzen und prüft:
  - zwei Hauptregionen mit Name `Schlangenbereich`,
  - je Instanz die Unterregionen `Eigene Schlangen` und `Gegnerische Schlangen`,
  - eindeutige `aria-labelledby`-Werte,
  - jedes Label-Ziel existiert im DOM genau einmal.

## RED/GREEN
- RED bestätigt: Der neue R111-Test fand mit statischen IDs nur 3 eindeutige Label-IDREFs statt erwarteter 6.
- GREEN: `aria-labelledby`/`id` wurden auf `titelId`, `eigeneTitelId`, `gegnerTitelId` umgestellt.

## Review
- Claude Code `opusplan` GREEN-Pass hat den minimalen Fix gesetzt; eigene Tests wurden danach lokal ausgeführt.
- Claude Code `/simplify` lief bis `max_turns`, die daraus entstandene Vereinfachung wurde manuell inspiziert und akzeptiert: lokale ID-Konstanten statt Inline-Templates.
- Codex Review: `BLOCKERS: none`; ein Non-Blocker zur Testschärfe wurde übernommen.
- Codex Re-Review nach Testhärtung: `BLOCKERS: none`, `NON-BLOCKERS: none`.

## Verifikation
Ausgeführt:

```bash
npm test -- --run src/App.r111_schlangenbereich_label_idrefs.test.tsx src/App.r109_schlangenbereich_dom_sichere_idrefs.test.tsx src/App.f5_schlangenbereich.test.tsx
npm run typecheck
npm run lint
npm test -- --run
npm run check:test-lines
npm run build
git diff --check
wc -l src/components/Schlangenbereich.tsx src/App.r111_schlangenbereich_label_idrefs.test.tsx
```

Ergebnis:

- Fokussierte Tests grün: 3 Testdateien / 3 Tests.
- Full Suite grün: 119 Testdateien / 597 Tests.
- Typecheck grün.
- Lint grün.
- Test-Dateilängencheck grün: alle Testdateien unter 500 Zeilen.
- Build grün.
- `git diff --check` grün.
- Dateilängen: `Schlangenbereich.tsx` 369 Zeilen, R111-Test 64 Zeilen.

## Geänderte Dateien
- `src/components/Schlangenbereich.tsx`
- `src/App.r111_schlangenbereich_label_idrefs.test.tsx`
- `docs/release_status_2026-06-07_r111.md`

## Release abgeschlossen
- Implementierungscommit: `a9db006 R111: Schlangenbereich-Label-IDREFs DOM-sicher machen`.
- Push: `main -> origin/main`.
- Production: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Vercel Deployment: [https://schlangentanz-v2-nfs0cinbk-alfreds-projects-7e9df1b4.vercel.app](https://schlangentanz-v2-nfs0cinbk-alfreds-projects-7e9df1b4.vercel.app)
- Vercel Inspect: [8pTUH6igDX2BDUq6WpGv2oDM17Sy](https://vercel.com/alfreds-projects-7e9df1b4/schlangentanz-v2/8pTUH6igDX2BDUq6WpGv2oDM17Sy)

## Live-Smoke
- `npm run smoke:production` grün:
  - `/game` HTTP 200
  - `/` HTTP 200
  - sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`
  - `R107 Production-Smoke bestanden`
- First-Turn-Browser-Smoke grün:
  - URL: `https://schlangentanz-v2.vercel.app/game`
  - erster Zug ausgeführt: `Neue Schlange starten mit Karte grün-06`
  - `Zuletzt ausgeführt` sichtbar
  - `consoleErrors: []`
  - `pageErrors: []`

## Nachtrag
- Der erste First-Turn-Smoke-Versuch scheiterte am Smoke-Skript-Selektor, weil `Aktionen` ohne `exact: true` auch `Legale Aktionen` und `Weitere Aktionen` matchte. Der temporäre Smoke wurde auf exakten Regionsnamen korrigiert und danach erfolgreich ausgeführt; Produktionscode war davon nicht betroffen.
