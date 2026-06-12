# R164 Release-Nachweis — Schlangenhäutung-Vorschauen live ankündigen

Author: rahn
Datum: 12.06.2026
Version: 1.0
Beschreibung: Release-Nachweis für R164 — die beiden bestehenden Schlangenhäutung-Vorschau-Statuszeilen bleiben sichtbar und erhalten zusätzlich explizit `aria-live="polite"` und `aria-atomic="true"`.

## Resume-Befund

Die Pflichtdiagnose zu Beginn dieses Cron-Laufs ergab:

- `pwd` → `/home/projects/schlangentanz-v2`.
- `date -Iseconds` → `2026-06-12T01:30:58+00:00`.
- `git status -sb` → `## main...origin/main`, sauber.
- Nach `git fetch origin main`: `HEAD 28a2080`, `origin/main 28a2080`.
- `git diff --stat`, `git diff --name-only`, `git diff --check`, `git status --short` → keine Änderungen.
- Relevante Prozesse: nur Code-Server/LSP/TypeScript-Server; keine projektspezifischen bounded Claude-/Codex-/Vercel-/Testprozesse.
- R163 war dokumentiert als umgesetzt, getestet, reviewed, committed, gepusht, deployed und live gesmoked.

Deshalb wurde ein neuer kleiner UI-/A11y-Härtungsslice R164 begonnen.

## Scope

R164 ist ein enger Live-Region-Slice in der Schlangenhäutung-Reihenfolge-Auswahl:

- Änderung: Die beiden bestehenden Vorschauzeilen `Neue Reihenfolge nach Karte ans Ende` und `Neue Reihenfolge nach Umkehr` bleiben `role="status"` und erhalten explizit `aria-live="polite"` sowie `aria-atomic="true"`.
- Erhalten: sichtbare Vorschau-Copy, `aria-label`s, `aria-describedby`-Verknüpfungen, Kartenauswahl-Verhalten, Umkehr-Vorschau, Button-/Select-Handling, Engine-/Regelverhalten und Layout.
- Bewusst ausgeschlossen: neue Spielinteraktionen, Engine-/Regeländerungen, weitere Label-/IDREF-Umstellungen und Debug-/Fixture-Routen.

## RED

- Neuer Test: `src/App.r164_schlangenhaeutung_vorschau_live_region.test.tsx`.
- RED-Ergebnis: `npm test -- --run src/App.r164_schlangenhaeutung_vorschau_live_region.test.tsx` fiel erwartungsgemäß fehl, weil die Vorschau-Statuszeilen noch kein `aria-live="polite"` hatten.

## GREEN / Claude-Code-Fallback

- Claude-Code-GREEN-Pass über das `claudeuser`-Pattern wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Da R164 ein enger mechanischer A11y-Slice mit eindeutigem RED-Test war, wurde gemäß Fallback-Regel der minimale Fix manuell umgesetzt und objektiv getestet.

## `/simplify`

- Separate Claude-`/simplify`-Vorprüfung wurde versucht.
- Blocker: `Failed to authenticate. API Error: 401 Invalid authentication credentials`.
- Nach Codex-Testhärtung wurde `/simplify` erneut versucht und durch denselben Auth-Blocker verhindert; der Diff blieb minimal und wurde mit Tests, Lint und Review abgesichert.

## Codex Review

- Initiales Review-only auf Worktree inklusive untracked R164-Test fand einen Blocker: Der Test sollte zusätzlich erhaltene `aria-describedby`-Verknüpfungen und Auswahlwechsel-Verhalten absichern.
- Test wurde entsprechend gehärtet.
- Re-Review final: `BLOCKERS: Keine`; `NON-BLOCKERS`: vorheriger Blocker gelöst, Komponente setzt beide Live-Region-Attribute.

## Gates

Fokussierte und angrenzende Tests:

- RED: `npm test -- --run src/App.r164_schlangenhaeutung_vorschau_live_region.test.tsx` → erwarteter Fehlschlag vor GREEN.
- GREEN/Regressionen: `npm test -- --run src/App.r164_schlangenhaeutung_vorschau_live_region.test.tsx src/App.r108_schlangenhaeutung_tastatur_a11y.test.tsx src/App.r114_schlangenhaeutung_umkehr_a11y.test.tsx` → 3 Testdateien / 4 Tests bestanden.

Full Gates vor Release:

- `npm test -- --run` → 170 Testdateien / 658 Tests bestanden.
- `npm run typecheck` → grün.
- `npm run lint` → grün.
- `npm run build` → grün; Vite-Build mit `dist/index.html`, `dist/assets/index-xN9AvX-Y.js`, `dist/assets/index-DOPCpYmG.css`.
- `npm run check:test-lines` → grün; alle Testdateien unter 500 Zeilen.
- `git diff --check` → grün.
- Geänderte Skriptdateien: `SchlangenhaeutungReihenfolgeAuswahl.tsx` 194 Zeilen, `App.r164_schlangenhaeutung_vorschau_live_region.test.tsx` 98 Zeilen.

## Commit / Push

Feature-Commit auf `origin/main`:

- `a750893 R164: Schlangenhäutung-Vorschauen live ankündigen`

## Deploy / Smoke

Feature-Deploy nach Code-Commit:

- `vercel deploy --prod --yes --token=…` → Production-Deployment `https://schlangentanz-v2-dr2i61ba7-alfreds-projects-7e9df1b4.vercel.app`, Production-Alias `https://schlangentanz-v2.vercel.app`, Status `READY`.

Production-Smoke gegen den stabilen Alias:

- `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` → `/` und `/game` HTTP 200; Kernregionen `Spielstatus`, `Aktiver Spieler`, `Aktionen`, `Schlangenbereich` sichtbar; `R107 Production-Smoke bestanden`.
- R164-Browser-Probe gegen `/game` → App gesund und keine Console-/Page-Errors; die bedingt gerenderte `Schlangenhäutung-Reihenfolge-Auswahl` war im aktuellen Produktionszustand nicht sichtbar. Der exakte R164-Vertrag ist deshalb lokal fixturiert per DOM-Regression geprüft und die Production-App separat gesund live gesmoked.

## Finaler Status

R164 ist umgesetzt, getestet, reviewed, committed, gepusht, deployed und gegen den stabilen Production-Alias allgemein live gesmoked. Der slice-spezifische Vertrag ist lokal gegen den notwendigen Schlangenhäutung-Fixture-Zustand abgesichert; der aktuelle Produktionszustand bot diese bedingte Region im bounded Smoke nicht an. Dieser Release-Nachweis vermeidet selbstreferenziellen Doku-Commit-Churn; der finale Cron-Bericht nennt den nach Doku-Sync, erneutem Deploy und erneutem Smoke verifizierten finalen `HEAD`.

## Nächster kleiner Schritt nach R164

Autonom mit dem nächsten kleinen sicheren UI-/Copy-/A11y-Härtungsslice fortfahren; vor Regel-/Engine-Änderungen weiterhin [https://schlangentanz.ch/rules](https://schlangentanz.ch/rules) prüfen.
