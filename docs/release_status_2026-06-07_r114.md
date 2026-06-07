# R114 Release-Nachweis — Schlangenhäutung-Umkehrbutton semantisch beschrieben

Status: lokal fertig und releasebereit; Commit/Push/Deploy/Smoke warten auf explizite Freigabe.
Datum: 2026-06-07

## Ziel
R114 härtet die A11y-Beschreibung des Schlangenhäutung-Umkehrbuttons: Der Button `Schlange umkehren` soll wie die Karte-ans-Ende-Steuerung DOM-sicher mit Tastaturhilfe und passender Vorschau verknüpft sein.

## Umgesetzt
- `src/components/SchlangenhaeutungReihenfolgeAuswahl.tsx` erzeugt zusätzlich eine komponentenlokale `umkehrVorschauId` per `useId()` + lokalem Schlangenindex.
- Die Umkehr-Vorschau erhält eine echte `id`, `role="status"` und ein sprechendes `aria-label`.
- Der Button `Schlange umkehren` erhält `aria-describedby` mit genau zwei Zielen:
  - Tastaturhilfe derselben Schlangen-Gruppe,
  - Umkehr-Vorschau derselben Schlangen-Gruppe.
- Keine rohen fachlichen Schlangen-IDs werden in DOM-ID-Werten verwendet.
- Keine Engine-/Regeländerung.
- Neuer Regressionstest: `src/App.r114_schlangenhaeutung_umkehr_a11y.test.tsx`.

## RED/GREEN
- RED bestätigt: Der neue R114-Test fiel zuerst, weil der Umkehrbutton kein `aria-describedby` hatte (`expected [] to have a length of 2`).
- GREEN: Umkehr-Vorschau und Umkehrbutton wurden DOM-sicher verbunden.
- Claude Code `opusplan` und `/simplify` waren wegen `401 Invalid authentication credentials` blockiert; der Fix wurde deshalb manuell klein umgesetzt und anschließend manuell auf Simplify geprüft.

## Review
- Codex Review auf dem aktuellen uncommitted Worktree inklusive untracked R114-Test:
  - `BLOCKERS: keine`.
  - Günstiger Non-Blocker: zusätzlich prüfen, dass jedes beschriebene Ziel nur einmal im Dokument vorkommt.
- Non-Blocker wurde in `src/App.r114_schlangenhaeutung_umkehr_a11y.test.tsx` ergänzt (`CSS.escape` + `querySelectorAll`).
- Codex Re-Review:
  - `BLOCKERS: keine`.
  - Bestätigt: IDREFs sind DOM-sicher, Test ist sinnvoll gehärtet, keine blockerwürdige `role="status"`-Nebenwirkung.

## Verifikation
Ausgeführt:

```bash
npm test -- --run src/App.r114_schlangenhaeutung_umkehr_a11y.test.tsx
npm test -- --run src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx
npm test -- --run src/App.r114_schlangenhaeutung_umkehr_a11y.test.tsx src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx src/App.r105_schlangenhaeutung_reihenfolge_vorschau.test.tsx src/App.r104_schlangenhaeutung_umkehr_in_auswahl.test.tsx src/App.r100_schlangenhaeutung_umkehren.test.tsx
npm run check:test-lines
npm run typecheck
npm run lint
npm run build
npm test -- --run
git diff --check
```

Ergebnis:

- RED-Test vor Fix: 1 Testdatei / 1 Test fehlgeschlagen mit erwarteter fehlender `aria-describedby`-Assertion.
- Fokussierte Regressionen grün: 5 Testdateien / 6 Tests.
- Full Suite grün: 122 Testdateien / 600 Tests.
- Typecheck grün.
- Lint grün.
- Build grün.
- `git diff --check` grün.
- Testdateilängencheck grün: Alle Testdateien bleiben unter 500 Zeilen.
- Dateilängen:
  - `src/App.r114_schlangenhaeutung_umkehr_a11y.test.tsx`: 72 Zeilen.
  - `src/components/SchlangenhaeutungReihenfolgeAuswahl.tsx`: 190 Zeilen.

## Geänderte Dateien
- `src/components/SchlangenhaeutungReihenfolgeAuswahl.tsx`
- `src/App.r114_schlangenhaeutung_umkehr_a11y.test.tsx`
- `docs/release_status_2026-06-07_r114.md`

## Noch nicht released
- Noch kein Implementierungscommit.
- Noch kein Push.
- Noch kein Vercel-Deploy.
- Noch kein Production-Smoke.

## Nächster Schritt
Nach Freigabe:
1. Commit mit deutscher Nachricht.
2. Push nach `origin/main`.
3. Vercel Production-Deploy auf den stabilen Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app).
4. Production-Smoke und First-Turn-Browser-Smoke.
5. Release-Nachweis und Dart-Status auf final released aktualisieren.
