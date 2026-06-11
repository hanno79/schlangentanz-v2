# R155 Release-Nachweis — Weitere verfügbare Aktionen per Überschrift labeln

Author: rahn
Datum: 11.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R155 — die bedingt gerenderte `Weitere verfügbare Aktionen`-Unterregion im `Aktionen`-Bereich wird per sichtbarer Überschrift und `aria-labelledby` gelabelt.

## Resume-Befund

Der Cron-Lauf fand keinen halbfertigen Zustand vor:

- `HEAD` und `origin/main` standen nach `git fetch origin main` beide auf `674b13d`.
- Der Worktree war sauber; `git diff --check` hatte keine Befunde.
- Es liefen keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse; sichtbare Node-Prozesse waren LSP/code-server-Prozesse.
- R154 war final dokumentiert, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R155 begonnen.

## Scope

R155 ist ein enger A11y-/IDREF-Slice:

- Änderung: Die bedingt gerenderte Unterregion `.aktionen-gruppe--hinweise` im Bereich `Aktionen` nutzt `aria-labelledby` auf ihre sichtbare Überschrift `Weitere verfügbare Aktionen`.
- Erhalten: Schlangenhäutung-Hinweis, Schlangenhäutung-Reihenfolge-Auswahl, sichtbare Copy, Button-Labels, Button-Handler, `Empfohlene Aktion`, `Weitere Aktionen`, `Phasenaktion`, Engine-/Regelverhalten, Layout und Interaktionen bleiben unverändert.
- Nicht-Ziele: keine Engine-/Regeländerung, keine neue Interaktion, keine Copy-Umbenennung, kein Layout-Refactor und keine weiteren Regionen.

## TDD / Regressionen

RED:

- Neuer Test `src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx` wurde zuerst erstellt.
- `npm test -- --run src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx` schlug erwartungsgemäß fehl, weil die Hinweis-Unterregion noch kein eindeutiges `aria-labelledby` hatte.

GREEN:

- `src/components/AktionenPanel.tsx` erzeugt ein komponentenlokales `weitereVerfuegbareAktionenTitelId` via `useId()`.
- Die Hinweise-Unterregion rendert weiterhin `.aktionen-gruppe--hinweise`, nutzt jetzt aber `aria-labelledby={weitereVerfuegbareAktionenTitelId}` und `<h3 id={weitereVerfuegbareAktionenTitelId}>Weitere verfügbare Aktionen</h3>`.
- `src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx` rendert zwei App-Instanzen mit Schlangenhäutung-Hinweiszustand und prüft: kein separates `aria-label`, Single-Token-IDREF, documentweit eindeutige Label-IDs, genau ein IDREF-Ziel, Ziel innerhalb der Region, sichtbarer Heading-Text `Weitere verfügbare Aktionen`, Heading-Level 3 sowie erhaltene Schlangenhäutung-Inhalte.

## Claude Code / Simplify

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R155 ein enger mechanischer A11y-IDREF-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und danach objektiv getestet/reviewed.
- Eine separate Claude-`/simplify`-Vorprüfung wurde ebenfalls versucht, war wegen desselben Claude-Auth-Blockers aber nicht verfügbar; stattdessen wurden Diff, Zeilenbudget und Tests vor Codex Review manuell geprüft.

## Codex Review

Review-only auf aktuellem Worktree inklusive untracked R155-Testdatei:

- `BLOCKERS: Keine`
- `NON-BLOCKERS: Keine`
- Codex verifizierte zusätzlich `npm test -- --run src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx` → 1 Testdatei / 1 Test grün.

## Lokale Gates

Fokustests:

- `npm test -- --run src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx src/App.r99_schlangenhaeutung_hinweis.test.tsx src/App.r100_schlangenhaeutung_umkehren.test.tsx src/App.r102_schlangenhaeutung_reihenfolge_auswahl.test.tsx src/App.r103_schlangenhaeutung_redundanz_reduzieren.test.tsx src/App.r104_schlangenhaeutung_umkehr_in_auswahl.test.tsx src/App.r105_schlangenhaeutung_reihenfolge_vorschau.test.tsx src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx src/App.r114_schlangenhaeutung_umkehr_a11y.test.tsx src/App.r153_weitere_aktionen_idref.test.tsx src/App.r154_phasenaktion_idref.test.tsx` → 11 Testdateien / 12 Tests grün.

Full Gates:

- `npm test -- --run` → 161 Testdateien / 649 Tests grün.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run check:test-lines` → `Alle Testdateien bleiben unter 500 Zeilen.`
- `npm run build` → `tsc -b && vite build` grün.
  - Bundle: `dist/assets/index-Dvt0wsUF.js` / `dist/assets/index-DOPCpYmG.css`.
- `git diff --check` → grün.
- Zeilenbudget der geänderten Skriptdateien: OK (`src/components/AktionenPanel.tsx` 273 Zeilen; `src/App.r155_weitere_verfuegbare_aktionen_idref.test.tsx` 74 Zeilen).

## Git / GitHub

Feature-Commit:

- `15c0e97 R155: Weitere verfügbare Aktionen per Überschrift labeln`

Push:

- `main -> origin/main` erfolgreich.

## Production-Deploy

Deploy nach Feature-Commit:

- Vercel Production-Deploy erfolgreich.
- Stable Production Alias: [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app)
- Deploy-Status: `READY` / Alias gesetzt.
- Ephemere Deployment-URL wird bewusst nicht als dauerhafte Release-Referenz dokumentiert.

## Production-Smoke

Allgemeiner Smoke:

- `npm run smoke:production` gegen [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app).
- `/` und `/game`: HTTP 200.
- Kernregionen sichtbar: `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich`.
- Ergebnis: `R107 Production-Smoke bestanden`.

R155 Slice-Smoke:

- Die R155-Zielregion ist ein bedingt gerenderter Schlangenhäutung-Hinweiszustand. In der aktuellen Produktionsdeck-Konfiguration ist dieser Zustand ohne injizierten Fixture-Zustand nicht zuverlässig live erreichbar.
- Deshalb wurde die Production-Verifikation ehrlich auf App-Gesundheit, `/game`-Ladefähigkeit, Kernregionen und Console-/Page-Error-Freiheit begrenzt; der exakte IDREF-Vertrag ist lokal per fokussierter DOM-Regression gegen den betroffenen Spielzustand abgesichert.

## Finaler Status

R155 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias gesundheitsgesmoked. Der slice-spezifische IDREF-Vertrag ist lokal gegen den relevanten Spielzustand abgesichert; ein natürlich erreichbarer Live-Zustand für die bedingte R155-Region war in diesem Lauf nicht verfügbar.

Der Release-Nachweis ist final synchronisiert. Die stabile Production-Alias [https://schlangentanz-v2.vercel.app](https://schlangentanz-v2.vercel.app) bleibt die belastbare Release-Referenz; der jeweilige Cron-Bericht nennt den final verifizierten `HEAD` nach Deploy und Smoke.

## Nächster kleiner Schritt nach R155

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
