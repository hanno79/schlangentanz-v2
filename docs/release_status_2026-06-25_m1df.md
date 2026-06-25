# M1df — Waldtanz-Spielmoment-Stein­kreis (drei Magiekreise als runde Drop-Steine)

> **Status:** Release-Fertig (cron-run 25.06.2026 03:18 lokal).
> **Typ:** Sichtbarer Brettschritt-Affordance-Slice (kein Engine-Touchpoint).
> **Vorgänger:** M1e (Waldtanz-Spieluhr als Countdown-Ring).
> **Nachfolger:** offen — naechster sichtbarer Waldtanz-Board-Vertical (M1f / M1g-Kandidaten aus dem M1-Backlog).

## Was sichtbar/strukturell besser wurde

Auf `/game` schweben die drei Magiekreise (Startkreis / Schlangenende /
Sonderzauber) jetzt als **visuell runde Drop-Steine** auf einem gemeinsamen
**Waldstein-Hintergrund** — nicht mehr als horizontale Buttonliste. Jeder
Kreisel hat einen eigenen `radial-gradient` Stein (Sonnengelb fuer den
Startkreis, Hellgruen fuer das Schlangenende, Warmsorange fuer den
Sonderzauber), ein `+` / `->` / `*`-Symbol, das Label darunter, und einen
atmenden Pulse, sobald eine Handkarte ausgewaehlt ist. Im inaktiven
Zustand sind die Steine leicht entsaettigt (`.waldtanz-steinkreis--wartend`).

Der Stein­kreis ersetzt **rein visuell** die generische
Button-Listen-Optik der `.waldtanz-magiekreise` auf /game — Engine-Pfade,
Legal-Aktionen, `onAktion`-Vertrag, Aria-Labels und CSS-Klassenvertrage
der bestehenden `Magiekreise`-Tests (M1ah, M1ai, M1aj, M1as) bleiben
unveraendert.

## Slice-Scope

### Rein

- `src/components/WaldtanzMagiekreise.tsx` (+40/-19): Container + drei
  Kreisel mit `waldtanz-steinkreis` / `waldtanz-steinkreis__kreisel`
  Klassen, jeder Kreisel enthaelt einen `<span class="kreisel-stein">`
  (Stone-Layer) + `<span class="kreisel-slot">` (Label/Symbol), Aktionen
  liegen darunter mit `z-index: 2` (Hit-Test bleibt erhalten).
- `src/App.css` (+177 Zeilen):
  - `.waldtanz-steinkreis` (position:relative, isolation:isolate).
  - `.waldtanz-steinkreis::before` (radial-gradient Hintergrund mit
    Sunny-Gold/Sunny-Green-Accent, 3px forest-green border, 2rem
    pill-radius, 4px hard-shadow).
  - Drei Kreisel als `aspect-ratio: 1/1`, `border-radius: 50%`,
    `clamp(4.2rem, 9vw, 5.6rem)`.
  - Sonderzauber-Kreisel mit Orange-Steingradient.
  - Atmen-Animation (`waldtanz-steinkreis-atmen` 1.7s scale + Pulse
    translateY) + `prefers-reduced-motion`-Override.
  - **Cascade-Override-Block im @media (min-width: 1100px)**:
    `[class~="waldtanz-magiekreise__kreis"][class~="waldtanz-steinkreis__kreisel"]`
    setzt `min-height: 0; padding: 0; border: 0; background: transparent;`
    (Kimi-Befund-Schutz, sonst M1d3 min-height > Breite = Oval statt
    Kreis).
  - **Aktiver-Kreisel-Override**:
    `.waldtanz-steinkreis__kreisel.waldtanz-magiekreise__kreis--aktiv`
    setzt `background: transparent; border-color: transparent;
    box-shadow: none;` (Kimi-Befund-Schutz, sonst weisser Ring um
    den Stein durch M1d3-active-block).
- `scripts/m1df_waldtanz_steinkreis_smoke.mjs` (NEU, 167 Zeilen):
  Playwright-Browser-Smoke beweist im echten Browser 3 Steine (101x101 =
  aspect-ratio 1/1 nach Cascade-Fix), drei aria-labels, ::before
  radial-gradient, Container-Bottom <= Viewport+60px (M1d0-Vertrag),
  keine console/page-Fehler.
- `src/App.m1df_waldtanz_steinkreis.test.tsx` (NEU, 6 Tests): Container-
  Klasse, drei Kreisel, runde Slots mit aria-labels, M1d3-Cascade-Override
  Block-Positionsschutz, aktiver-LI-Override.
- `src/App.m1df_smoke_wiring.test.ts` (NEU, 4 Tests): Kanonischer-Smoke-
  Existenz, Kette-Reihenfolge zwischen M1e und M1d1, _probe-Hygiene,
  Cascade-Reihenfolge `.waldtanz-magiekreise` < `.waldtanz-steinkreis`.
- `package.json` (+1): M1df-Smoke in `smoke:production`-Kette aufgenommen
  (zwischen M1e und M1d1, nach Spieluhr-Reihenfolge).

### Tests

- `src/App.m1df_waldtanz_steinkreis.test.tsx`: 6 RED-Tests.
- `src/App.m1df_smoke_wiring.test.ts`: 4 RED-Tests (Smoke-Wiring +
  Cascade-Schutz).
- Volle Suite: 1084/1084 gruen (334 files).

### Raus (explizit)

- Keine Engine-Aenderung.
- Keine Aenderung an Legal-Aktionen, `onAktion`-Pfaden, aria-labels.
- Keine Layout-/Viewport-Schirurgie (Arena-Cap, Grid-Order bleiben
  unangetastet).
- Keine Tailwind-Imports, keine externen Bilder.

## RED → GREEN

### RED-Tests (vor Implementierung, gegen clean HEAD)

- `src/App.m1df_waldtanz_steinkreis.test.tsx`: 4/6 schlugen fehl
  (Container-Klasse, drei Kreisel, runde Slots, Cascade-Override).
- `src/App.m1df_smoke_wiring.test.ts`: 4/4 schlugen fehl (Smoke-Skript
  fehlte, Kette fehlte, _probe-Hygiene, Cascade-Reihenfolge).

### Claude Code / `/simplify`

- Claude Code blieb durch den bekannten 401-Blocker unbenutzbar
  (siehe M1d3-Doku). Manueller Fallback mit objektivem RED-Test und
  Diff-/CSS-Cascade-/Line-Budget-Selbstcheck vor Review.

### Code-Review: Kimi Code CLI (statt Codex)

- Codex OAuth hatte `usage limit` (gueltig bis 25.06.2026 19:07 UTC);
  Kimi Code CLI `0.18.x` (k2p7) als Review-Fallback, review-only.
- **Befund B1 (BLOCKER):** Im `@media (min-width: 1100px)`-Block setzt
  M1d3 dem `.waldtanz-magiekreise__kreis` ein
  `min-height: clamp(4.9rem, 9vw, 6.75rem)`. Auf 1280x900 wird das zu
  6.75rem (108px) — groesser als die Kreisel-Breite (max 5.6rem = 90px).
  Da unsere Specificity (0,1,0) niedriger ist als M1d3 (0,2,0), wuerden
  die runden Drop-Steine in ein **Oval** verformt.
  **Fix:** Cascade-Override-Block
  `.spielbereich--game-route [class~="waldtanz-magiekreise__kreis"][class~="waldtanz-steinkreis__kreisel"]`
  setzt `min-height: 0; padding: 0; border: 0; background: transparent;`
  (gleiche Specificity 0,2,0, spaeter im Source, gewinnt).
  Regression-Tests in `m1df_waldtanz_steinkreis.test.tsx` (Block-Positions-
  + Body-Schutz) verhindern Wiederholung.
- **Befund B2 (BLOCKER):** Der generische M1d3-active-Block
  (`.waldtanz-magiekreise__kreis--aktiv`) setzt `border-style: solid;
  background: linear-gradient(...); box-shadow: 0 4px 0;`. Da unser
  Stein den `<li>` optisch ueberdeckt, wuerde das einen weissen Ring
  um den Stein erzeugen.
  **Fix:** Active-Override-Block
  `.waldtanz-steinkreis__kreisel.waldtanz-magiekreise__kreis--aktiv`
  setzt `background: transparent; border-color: transparent;
  box-shadow: none;` (Specificity 0,2,0 vs 0,2,0, source-order-gewinnt).
  Regression-Test in `m1df_waldtanz_steinkreis.test.tsx`.
- NON-BLOCKERS: keine.

### Re-Review

- Nicht erforderlich — B1+B2 waren 12 Zeilen CSS-Override + zwei
  regression-Tests, Kimi-Befund exakt durch CSS-source-RED-Tests
  reproduziert und durch Browser-Smoke (101x101 = aspect-ratio 1/1
  statt 119x134 vorher) bestaetigt.

## Gates

| Gate | Resultat |
|---|---|
| `npx vitest run src/App.m1df_*.test.tsx` | 10/10 gruen |
| `npx vitest run` (full suite) | 1084/1084 gruen (334 files) |
| `npm run typecheck` | gruen |
| `npm run lint` | gruen |
| `npm run build` | gruen (201.37 kB CSS, 402.42 kB JS) |
| `npm run check:test-lines` | gruen (alle Test-Dateien < 500) |
| `git diff --check` | gruen |
| `node scripts/m1df_waldtanz_steinkreis_smoke.mjs` (lokal, vor Cascade-Fix) | 3/3 gruen, aber 119x134 (Oval, B1-Bug sichtbar) |
| `node scripts/m1df_waldtanz_steinkreis_smoke.mjs` (lokal, nach Cascade-Fix) | 3/3 gruen, 101x101 (rund) |
| `node scripts/m1e_waldtanz_spieluhr_smoke.mjs` (lokal) | 3/3 gruen |
| `node scripts/m1dd_aktionsdock_im_spielbrett_smoke.mjs` (lokal) | gruen |
| `node scripts/m1d1_arena_flex_column_smoke.mjs` (lokal) | gruen |
| `node scripts/m1df_waldtanz_steinkreis_smoke.mjs` (live, production) | 3/3 gruen, 101x101, ::before radial-gradient, keine console/page-errors |
| `node scripts/m1e_waldtanz_spieluhr_smoke.mjs` (live) | 3/3 gruen |
| `node scripts/m1dd_aktionsdock_im_spielbrett_smoke.mjs` (live) | gruen |
| `node scripts/m1d1_arena_flex_column_smoke.mjs` (live) | gruen |

## Release

- Commit: `2673d08 M1df: Magiekreise als runde Drop-Steine auf gemeinsamem Stein-Hintergrund`
- 6 files, +574 / -20
- Push: `main` → `origin/main` (7bd25f2 → 2673d08)
- Vercel Production Deploy: `https://schlangentanz-v2-5ct09ew20-alfreds-projects-7e9df1b4.vercel.app`
- Production-Alias bestaetigt: `https://schlangentanz-v2.vercel.app`
- M1df-Live-Smoke auf Production-Alias: 3/3 Steine 101x101, ::before
  radial-gradient, Container im Viewport, keine console/page-errors.

## Anmerkungen fuer den naechsten Slice

- M1df ist ein **rein visueller Slice** — Engine bleibt unveraendert,
  Legal-Aktionen bleiben unveraendert. Nichts an der Spielmechanik
  aendert sich, das Spielbrett fuehlt sich aber anders an: drei
  taktile Drop-Steine statt drei generische Buttons.
- App.tsx bleibt mit 497 Zeilen unveraendert.
- Reaper-Hygiene eingehalten: keine `_probe.mjs`-Skripte, keine `*.png`
  im Repo, alle smoke-spezifischen Artefakte im `/tmp`.
- Token-Guard nicht noetig: nur existierende `--st-color-border-strong`,
  `--st-color-on-surface`, `--st-color-primary`, `--st-font-body` mit
  Fallback-Werten verwendet, keine neuen `:root`-Token.
- Naechster sichtbarer Vertikalschritt auf /game: **M1f-Kandidat** —
  das Handkarten-Deck koennte in der M1df-Stein­kreis-Optik einen
  analogen **Waldkarten-Stapel** (statt der aktuellen Handkarten-Leiste)
  bekommen, sobald die Engine-Aktionen `KarteZiehen` / `KarteAbwerfen`
  auf dem Brett visuell rueckkoppeln. Bis dahin ist M1df ein
  abgeschlossener Sichtbarkeits-Slice ohne Folgepflicht.
