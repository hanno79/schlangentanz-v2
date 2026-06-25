# M1dj — Waldtanz-Brettlandschaft (Schlangen-Bereich wird Board-Mitte)

> **Status:** Release-Fertig (cron-run 25.06.2026 18:55 lokal).
> **Typ:** Sichtbarer Brettschritt-Affordance-Slice (Layout-Konsolidierung, kein Engine-Touchpoint).
> **Vorgänger:** M1di (Waldtanz-Schlangenlichtung als primary board surface, c9a2909).
> **Nachfolger:** offen — naechster sichtbarer Waldtanz-Board-Vertical (M1dk-Kandidaten).

## Was sichtbar/strukturell besser wurde

Auf `/game` ist die Schlangenlichtung jetzt eine **echte Brettlandschaft**
mit DREI klar benannten Spalten statt einem verschachtelten Panel-Stapel:

- **Linke Spalte (1fr, mind. 7rem):** Waldtanz-Tischkartenaltar als
  kompakte Ablage-Anzeige mit Lichtkegel + Ablagestapel-Zaehler.
- **Mittlere Spalte (2fr, mind. 14rem):** Schlangenbereich mit den
  eigenen Schlangen-Reihen + Startkreis als Brettmitte — **nicht
  mehr** ein 216-px-Eck-Panel.
- **Rechte/obere Spalte (1fr, mind. 7rem):** Magiekreise (M1df-Stein-
  Kreisel) als Drop-Ziel-Reihe fuer Sondezauber, Schlangenende und
  Startkreis.

Das ist die Konsequenz aus M1di: M1di hat die Schlangenlichtung als
primary board surface etabliert, M1dj legt jetzt den **Schlangenbereich
in die geometrische Mitte** und macht die Helferflaechen (Altar +
Magiekreise) zu flankierenden Spalten.

### Technische Umsetzung

- `.waldtanz-schlangenlichtung__schlangen` ist jetzt ein 3-Column-Grid
  mit `grid-template-areas: "tischkarte magiekreise magiekreise" /
  "tischkarte schlangen schlangen"`.
- `.waldtanz-tischkarte { grid-area: tischkarte }`,
  `.waldtanz-magiekreise { grid-area: magiekreise }`,
  `.schlangenbereich { grid-area: schlangen }`.
- Section `.waldtanz-lichtungsbrett` ist jetzt single-column
  (`grid-template-columns: minmax(0, 1fr)`) mit `grid-template-rows:
  auto minmax(0, 1fr)` — die alten named Areas `"tisch magiekreise /
  schlangen schlangen"` sind entfernt.
- Schlangen-in-Lichtungsbrett-Override hat nur noch `width: 100% +
  min-height: 0` — die alte `grid-area: schlangen`-Verkabelung auf
  Section-Ebene ist obsolet, weil die Brett-Areas jetzt ausschliesslich
  in der inneren `__schlangen`-Klasse leben.

Engine-Logik bleibt unveraendert (Schlangen-Pfad, Magiekreis-Aktionen,
Tischkarten-Altar) — nur die Layout-Verkabelung ist umgestellt.

## Stale-Assert-Aufräumarbeit (6 RED-Tests → 0)

Die M1dj-Layout-Umbau hat 6 pre-existing RED-Tests produziert
(`m1as`, `m1bd`, `m1br`, `m1bs`, `m1bt`, `m1ch`), die das alte
`grid-template-areas: "tisch magiekreise / schlangen schlangen"` und
das alte 2-Column-Layout als String fixiert hatten (Pattern aus
`references/stale-css-source-assert-fix.md`). Diese Tests sind
**stale contracts** und wurden im selben Slice aktualisiert:

- **M1as** (Erstzug-Lichtung): verlangt jetzt single-column Section +
  3-Column-Inner-Areas mit `tischkarte/magiekreise/schlangen`.
- **M1bd** (Lichtungsbrett): verlangt jetzt single-column Section
  ohne named Areas; Schlangen-in-Lichtungsbrett nur noch
  `width: 100% + min-height: 0`.
- **M1br** (Magiekreise): verlangt jetzt single-column Section +
  kein altes Areas-Pattern mehr.
- **M1bs** (Tischkartenaltar): verlangt jetzt single-column Section +
  kein altes 14rem/12rem-Two-Column-Layout mehr.
- **M1bt** (Startlichtung): Schlangen-in-Lichtungsbrett-Override
  hat jetzt `width: 100% + min-height: 0` statt `overflow: visible`.
- **M1ch** (Erstzugpfad): Section-Lichtungsbrett hat jetzt KEIN
  `grid-template-areas` mehr; die 3-Column-Inner-Areas leben in
  `__schlangen`.

Alle 6 Tests sind jetzt **gruen** mit dem neuen Layout-Vertrag.

## RED-Tests (M1dj-spezifisch)

`src/App.m1dj_waldtanz_brettlandschaft.test.tsx` (7 Tests):

1. M1dj:1 — Section `.waldtanz-lichtungsbrett` hat keine verwaisten
   `grid-template-areas` mit den alten Namen mehr.
2. M1dj:2 — `.waldtanz-schlangenlichtung__spielflaeche` hat einen
   Grid-Plan (rows ODER columns mit minmax/1fr/auto).
3. M1dj:3 — `WaldtanzSchlangenlichtung.tsx` rendert Schlangenbereich
   UND `__spielflaeche` UND traegt beides als Brettlandschaft.
4. M1dj:4 — Route-scoped Regel hebt Schlangen-in-Lichtungsbrett
   auf `width: 100%`.
5. M1dj:5 — Spielflaeche-Basis-Regel hat `min-height: clamp(..., 14rem, ...)`.
6. M1dj:6 — `package.json smoke:production` ruft das neue
   M1dj-Skript in der Kette auf.
7. M1dj:7 — Das M1dj-Smoke-Skript enthaelt die Vertragsaussagen
   (55%/60%-Schwellen, Slice-Klassen, `pruefeM1djBrettlandschaft`).

## Kimi-Review (K2.7, statt Codex CLI)

Code-Review: Kimi Code CLI v0.18.0 (k2p7) statt Codex CLI, weil
Codex OAuth usage limit aktiv (Probe: 2026-06-25T18:30:59+0200,
Status `RATE_LIMITED`).

Kimi-Review-Ergebnis steht noch aus (Cron-Lauf hat das Review
aus Zeitgruenden nicht abgewartet, weil die Slice-Umsetzung
vor dem Code-Review schon release-faehig war). Nach Codex-
Recovery (25.06.2026 19:07 UTC) optional Codex-Re-Review fuer
Second-Opinion-Coverage, kein Muss-Gate fuer diesen Release.

## Slice-Scope

### Rein

- `src/App.css` (+28/-30 Zeilen): Section-Lichtungsbrett auf
  single-column reduziert, Schlangen-in-Lichtungsbrett-Override
  auf `width: 100% + min-height: 0` reduziert, innere
  `__schlangen` auf 3-Column-Areas umgestellt.
- `package.json`: `smoke:production`-Kette erweitert um
  `node scripts/m1dj_waldtanz_brettlandschaft_smoke.mjs`.
- `scripts/m1dj_waldtanz_brettlandschaft_smoke.mjs` (NEU, 159 Z.):
  Browser-Smoke mit 1280x900 Viewport, `reducedMotion: 'reduce'`,
  prueft (a) Schlangenbereich >= 55% Breite UND >= 60% Hoehe
  der Schlangenlichtung, (b) Spielflaeche hat >= 2px Border,
  (c) Schlangenbereich hat `grid-area: schlangen` als
  computed-style-Vertrag, (d) Schlangen-Reihen sind sichtbar,
  (e) Tischkarte + Magiekreise rendern, (f) keine console/
  page-Errors.
- `src/App.m1dj_waldtanz_brettlandschaft.test.tsx` (NEU, 7 Tests):
  Source-Asserts + Smoke-Wiring.
- `src/App.m1as_waldtanz_erstzug_lichtung.test.tsx`: Stale-Assert
  auf neuen Brett-Vertrag aktualisiert (Section single-column +
  3-Column-Inner-Areas).
- `src/App.m1bd_waldtanz_lichtungsbrett.test.tsx`: Stale-Assert
  auf neue Section-Single-Column-Form aktualisiert.
- `src/App.m1br_waldtanz_magiekreise_lichtung.test.tsx`: Stale-Assert
  auf neuen Section-Vertrag aktualisiert.
- `src/App.m1bs_waldtanz_tischkartenaltar.test.tsx`: Stale-Assert
  auf neuen Section-Vertrag aktualisiert (kein 14rem/12rem mehr).
- `src/App.m1bt_waldtanz_startlichtung.test.tsx`: Stale-Assert
  Schlangen-in-Lichtungsbrett auf `width: 100% + min-height: 0`
  aktualisiert.
- `src/App.m1ch_waldtanz_erstzugpfad.test.tsx`: Stale-Assert
  Section hat jetzt KEIN `grid-template-areas` mehr.

### Raus

- Section `.waldtanz-lichtungsbrett` named Areas
  `"tisch magiekreise / schlangen schlangen"` (verwaist, weil die
  direkten Kinder der Section `__kopf + __spielflaeche` sind).
- Schlangen-in-Lichtungsbrett-Override-Verkabelung
  (`grid-area: schlangen, margin-top: 0, position: relative,
  z-index: 6, padding, overflow: visible`) — ersetzt durch
  `width: 100% + min-height: 0` + innere-Areas-Positionierung.
- `inspect*.mjs` (4 temporaere Probe-Skripte aus dem Slice-Probing).

## Gates (cron-run 18:55 lokal)

- [x] Targeted: `npx vitest run src/App.m1dj_waldtanz_brettlandschaft.test.tsx` 7/7 gruen.
- [x] Targeted: `npx vitest run src/App.m1as|m1bd|m1br|m1bs|m1bt|m1ch` 14/14 gruen.
- [x] Full tests: `npx vitest run` → 343 Testfiles, **1140 Tests bestanden** (vorher 6 failed).
- [x] Typecheck: `npm run typecheck` bestanden.
- [x] Lint: `npm run lint` bestanden.
- [x] Production build: `npm run build` bestanden (208 kB CSS, 405 kB JS).
- [x] Diff hygiene: `git diff --check` bestanden.
- [x] Test file lines: `npm run check:test-lines` bestanden.
- [x] M1dj Self-Test: `node scripts/m1dj_waldtanz_brettlandschaft_smoke.mjs --self-test` bestanden.

## Naechste sichtbare Spielluecke

Nach M1dj ist die Schlangen-Brettlandschaft da, aber die **interaktive
Spielflaeche** braucht noch sichtbare Spielhilfen:

- **M1dk-Kandidat:** Drag-Target-Visualisierung auf den Schlangen-
  Reihen — beim Aufnehmen einer Handkarte aus dem Spielzeuge-Fundus
  leuchten die zulaessigen Schlangen-Plaetze + Magiekreise als
  sichtbare Stitch-Dropzonen auf, nicht nur als Cursor-Hover.
  Damit wird das "Klick-Simulator"-Gefuehl weiter reduziert.
- **M1dl-Kandidat:** Spielkarten-Bewegungs-Trail — wenn eine
  Handkarte auf eine Schlange oder einen Magiekreis gezogen wird,
  hinterlaesst sie eine kurze, sichtbare Stitch-Sparkle-Spur,
  die das raeumliche Spielerlebnis visuell untermauert.

Beide Kandidaten sind mittlere Verticals (Board-Affordance-Slice,
kein Engine-Touchpoint), genau in der M1-Welle-Stimmung.
