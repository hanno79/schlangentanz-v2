# M9.5 Slice-Plan — Arenasstein-Cap-Senkung (M9-Arena-Wirkung)

**Datum:** 29.06.2026
**Slice:** M9.5 — Mittel-Vertical, fokussierter Layout-Fix
**Klasse:** Affordance-Mid-Slice (visueller Spielmoment, keine Engine-Änderung)
**Status:** Implementierung in diesem Cron-Lauf
**Autor:** Hermes Agent (Cron-Lauf)
**Bezug:** Half-Finished-Family 5 — M9 hat die
`.info-panel--waldtanz-arena` grid-template-rows-Cap korrekt gesetzt
(`clamp(24rem, 50vh, 32rem)` = 480 px im 900-Viewport), ABER die
Arenasstein-Kind-Element hat seine eigene M1dk-Cap
`height: clamp(34rem, 64vh, 40rem)` = 576-720 px. Diese kind-height
schlägt die parent-row-height, weil `height` + `overflow:hidden` das
Element auf seiner eigenen Höhe hält und die grid-row nur den
bereitgestellten Platz liefert. Resultat: Arenasstein wächst auf
720-982 px, Hand bei y=760-988 (88 px unter Viewport-Falz). M9.5 senkt
den Arenasstein-Cap, sodass die M9-Grid-Row tatsächlich greift.

## Diagnose (vom Production-Probe bei 1440x900 und 1280x900)

```
=== 1440x900 (M9-Hauptakzeptanz) ===
arenastein (parent):  y=32,  h=982, bottom=1013   (live, nach M9-deploy)
.waldtanz-arenasstein: y=248, h=720, bottom=968   (kind, off-screen)
hand:                  y=760, h=228, bottom=988    (88 px unter Falz!)

=== 1280x900 (M2r-Akzeptanz) ===
.waldtanz-arenasstein: y=248, h=720, bottom=968   (kind, off-screen)
lichtung (sichtbar):   640 px (71% Viewport) ✓ M2r smoke
hand:                  y=752, h=228, bottom=980   (knapp sichtbar)
```

## Geometrie bei 900vh (Faktenlage)

Bei 900vh-Viewport müssen gleichzeitig passen:
- spielerrahmen: 60 px
- gegnerplakette: 70 px
- aktionsdock: 30 px
- arenastein: 450 px (M9-Grid-Row, kopf ist display:none per M2r)
- zugseitenleiste: 30 px
- hand: 220 px
- gaps + padding: 30 px
- Summe: 60+70+30+450+30+220+30 = 890 px ≤ 900 px ✓

Schlangenlichtung = arenastein - kopf(0) = 450 px = 50% Viewport.

**50% ist die physikalische Obergrenze für die Schlangenlichtung bei
900vh Viewport mit sichtbarer Hand.** Die M2r-Schwelle von 55% (495 px)
ist bei 900vh nicht erreichbar ohne die Hand aus dem Viewport zu
drücken — die Wahl ist explizit: Hand > Schlangenlichtung-Größe.

## Warum mittlerer Vertical (NICHT Mikro, NICHT Big-Bang)

- **Nicht Mikro:** Eigener CSS-Cap-Tuning + RED-Test-Set + M2r-Test-Migration
  + M2r-Smoke-Schwellen-Migration + Production-Probe-Verify. Adressiert
  die **direkte Ursache** des M9-Loops (kind-height schlägt parent-row),
  nicht nur ein Symptom.
- **Nicht Big-Bang:** Nur `src/App.css` (2 Property-Werte auf einer Regel),
  keine Engine-Änderung, keine Komponenten-Änderung, kein JSX.
- **Sichtbarer Spielwert:** Hand ist endlich im 1440x900 Erstbild sichtbar.
  Das ist die Kern-Forderung des User-Refrains seit Tagen.

## Rein

### 1. CSS-Cap-Senkung in `src/App.css` (Zeile ~2431)

```css
.spielbereich--game-route [class~="waldtanz-arenastein"] {
  ...
  /* AENDERUNG 29.06.2026 (M9.5): Arenasstein-Cap an M9-Grid-Row angepasst.
     Vorher: clamp(34rem, 64vh, 40rem) = 576-720 px → schlug die M9-Grid-Row
     (480 px) und liess Arenasstein auf 982 px wachsen.
     Nachher: clamp(24rem, 50vh, 32rem) = 450-512 px → passt in M9-Grid-Row
     (480 px). Hand im 900-Viewport bei y=760-988 (war 988, jetzt <=900).
     Schlangenlichtung = 450-512 px = 50-57% Viewport (war 71% mit Cap 720).
     Trade-off: M2r-Schlangenlichtung-Anteil sinkt von 71% auf 50% bei 1280x900;
     dokumentiert und im M2r-Smoke-Threshold angepasst. */
  height: clamp(24rem, 50vh, 32rem);
  max-height: clamp(24rem, 50vh, 32rem);
  ...
}
```

### 2. RED-Tests in `src/App.m95_arena_cap.test.ts`

- M9.5:1 — `appCss` enthält den neuen Arenasstein-height-Wert
  `clamp(24rem, 50vh, 32rem)` in der route-scoped Regel
- M9.5:2 — `appCss` enthält den entsprechenden max-height-Wert
- M9.5:3 — Die alten Werte `clamp(34rem, 64vh, 40rem)` tauchen NICHT
  mehr in der Arenasstein-Regel auf (Regression-Schutz)
- M9.5:4 — Schlangenlichtung-min-height bleibt stabil auf
  `clamp(16rem, 38vh, 22rem)` (M1di-Vertrag)
- M9.5:5 — M9 grid-template-rows-Cap bleibt stabil auf
  `clamp(24rem, 50vh, 32rem)` (M9-Vertrag)

### 3. Cascade-Order RED-Test

- M9.5:6 — Die geänderte Arenasstein-Regel (specificity 0,2,0) existiert
  noch (kein versehentliches Löschen)

### 4. Pre-Existing-Test-Migrationen

- **M2r:4** (`src/App.m2r_schlangenlichtung_forest_arena.test.tsx`):
  Threshold-Anpassung von `remValue >= 38` auf `remValue >= 30`,
  weil M9.5 die Cap-Max von 40rem auf 32rem senkt. Kommentar mit
  Trade-off-Erklärung ergänzen.
- **M2r-Smoke** (`scripts/m2r_schlangenlichtung_forest_arena_smoke.mjs`):
  Threshold-Anpassung von `>= 55%` auf `>= 50%` (physikalische
  Obergrenze bei 900vh mit sichtbarer Hand).

### 5. Live-Smoke in `scripts/m95_arena_cap_smoke.mjs`

- `pruefeM95ArenaCap` mit Acceptance:
  1. `getBoundingClientRect()` der Arenasstein-Region: `bottom <= 900`
     UND `top >= 0` (Region im 1440x900 Erstbild)
  2. `height <= 540` (Cap ist eingehalten, kein Overflow)
  3. Schlangenlichtung bleibt sichtbar: `bottom > 0` UND `height >= 400`
  4. Hand-Bühne: `bottom <= 900` (Erstbild-Ziel)
- Viewport: 1440x900 (Hauptakzeptanz)

### 6. `package.json` smoke:production-Kette

`scripts/m95_arena_cap_smoke.mjs` an die Kette anhängen, am Ende.

## Raus

- **Engine** (`src/engine/**`): unberührt.
- **Komponenten** (`src/components/**`): unberührt.
- **Phasen-Banner / Brettrand**: nicht betroffen, separate Region.
- **Lobby-Sonniges-Nest** (M3a/M3b/M3c): nicht betroffen.
- **Schlangenlichtung-cap**: NICHT gesenkt (User-Hinweis wäre Plan B).

## Akzeptanzkriterien (gate-pflichtig)

- [ ] Targeted RED-Tests grün (`npx vitest run src/App.m95_arena_cap.test.ts`)
- [ ] Pre-existing M2r:4 Test migriert und grün
- [ ] Targeted Smoke-Wiring RED-Tests grün
- [ ] `npm test -- --run` ohne neue Failures
- [ ] `npm run typecheck` grün
- [ ] `npm run lint` grün
- [ ] `npm run build` grün
- [ ] Production-Deploy via `vercel deploy --prod`
- [ ] Live-Smoke grün: M2r (≥50% lichter Anteil), M9 (Hand ≤900), M9.5 (Arena ≤540)
- [ ] Probe-Re-Run zeigt: Arenasstein `≤ 540 px`, Hand `bottom ≤ 900 px`

## Pitfall-Anti-Patterns

- **CSS-Kommentar-Text mit `.klasse { property: value }`-Literal:** Kommentar
  MUSS die geänderten Werte erwähnen, ABER NICHT in der Form
  `.klasse { height: clamp(24rem, 50vh, 32rem) }`, weil das den
  `cssBlock`-Helper bricht. Stattdessen "Cap auf 450-512 px" o.ä.
- **Cascade-collapse:** Prüfen, dass die neue Cap nicht durch eine spätere
  single-class-Regel auf `.waldtanz-arenasstein` (z.B. `:has(...)`-Override)
  überschrieben wird. Audit: `rg "waldtanz-arenasstein" src/App.css` zeigt
  alle Treffer. Die base-Regel (Zeile 6662) hat kein height, kein
  Konflikt zu erwarten.
- **JSX-Regression:** KEINE JSX-Änderung. M9.5 ist reiner CSS-Cap-Tuning.
- **Smoke-Regex mit integer-only scale factors:** Produktion (Chromium)
  serialisiert `transform: ...` mit Dezimalstellen — die Live-Smoke-Regex
  muss `1\\.?\\d*` als scale-factor-Pattern haben.
- **M2r-Test-Migration:** Bei der M2r-Schwellen-Anpassung unbedingt
  einen Kommentar mit dem M9.5-Trade-off hinzufügen, damit
  künftige Reviewer den Schwellen-Wert nicht reflexiv auf 55%
  zurücksetzen.
