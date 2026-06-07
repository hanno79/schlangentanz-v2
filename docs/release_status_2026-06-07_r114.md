# R114 Release-Nachweis — Schlangenhäutung-Umkehrbutton semantisch beschrieben

Status: abgeschlossen und live verifiziert.
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

## Release abgeschlossen
- Implementierungscommit: `12da596 R114: Schlangenhaeutung-Umkehrbutton semantisch beschreiben`.
- Push: `main -> origin/main`.
- Production: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Vercel Production-Deploy: READY und auf den stabilen Production-Alias gesetzt.
- Ephemere Deployment-/Inspect-URLs werden hier bewusst nicht festgeschrieben, damit der Release-Nachweis nach Doku-only-Commits nicht wieder veraltet.

## Live-Smoke
- `npm run smoke:production` grün:
  - `/game` HTTP 200
  - `/` HTTP 200
  - sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`
  - `R107 Production-Smoke bestanden`
- First-Turn-Browser-Smoke grün:
  - URL: `https://schlangentanz-v2.vercel.app/game`
  - ein erster Zug über `Neue Schlange starten mit Karte ...` wurde ausgeführt.
  - `Schlangenbereich` änderte sich sichtbar.
  - `Zuletzt ausgeführt` war sichtbar.
  - `consoleErrors: []`
  - `pageErrors: []`

## Nächster kleiner Schritt nach Release
- Nach R114 Release erneut klein weiterarbeiten: entweder weitere DOM-IDREF-Audits oder ein regel-/engine-naher Regressionstest.
- Vor jeder späteren Regel-/Engine-Änderung weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
