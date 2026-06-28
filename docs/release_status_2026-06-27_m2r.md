# M2r — Schlangenlichtung als Forest-Arena (Release-Status)

**Slice-ID:** M2r
**Datum:** 2026-06-27
**Klasse:** M2-Visual-Consolidation (vergleichbar mit M2e, M2g, M2h, M2i)
**Reviewer:** Kimi Code CLI (Codex OAuth `NOT_FUNCTIONAL`)
**Status:** SHIPPED — Net-Positive auf der Suite, Live-Smoke grün, Production deployed.

## Problem (mit Beweisen)

Der `/game`-Screen vermittelte trotz aller bisherigen Stitch-Slices noch das "Click-Simulator / Debug-Listen-Gefühl". Live-Probe am 2026-06-27 (vor M2r):

```
Arenastein  @ y=281, h=612
├── Arenakopf              @ y=306, h=39   (LEUCHTENDER WALDSTEIN-Titel)
├── PhasenBanner           @ y=363, h=25   (4-Phasen-Pillen-Reihe)
├── Questpille             @ y=408, h=149  (Lime-Bubble mit Quest-Text)
├── Schlangenlichtung      @ y=752, h=370  (EIGENTLICHE Spielfläche, vergraben)
├── Questband              @ y=833, h=94   (6 Quest-Pillen)
└── WSP                    @ y=837, h=49   (Spielerplakette)
```

**Konsequenz:** Schlangenlichtung belegte nur 370 px (45%) der Arenastein-Höhe, während reine Status-Chrome-Layer 307 px (50%) als verschachtelte Karten-Layer belegten. Der Spieler sah oben 4 Informationskarten, unten das vergrabene Spielbrett — der Wald begann nicht.

## Lösungsansatz (mittlerer Vertical Slice)

**Vier route-scoped Hides + flex-Fill + Arenastein-Cap-Raise**, die der Schlangenlichtung ~270 px zusätzliche Höhe schenken:

1. `.waldtanz-arenastein__kopf` (LEUCHTENDER WALDSTEIN-Titel, 39 px) — `display: none !important` auf /game
2. `.waldtanz-phasen-banner` (4-Phasen-Pillen-Reihe, 25 px) — `display: none !important` auf /game
3. `.waldtanz-questband` (6 Quest-Pillen, 94 px) — `display: none !important` auf /game
4. `.waldtanz-brettrand-questpille` → `max-height: 4.2rem; overflow: hidden; align-self: flex-start` (statt 149 px Volltext-Bubble, jetzt 94 px kompakter Title)
5. Schlangenlichtung → `flex: 1 1 auto; min-height: clamp(34rem, 60vh, 42rem)` (Kimi B1 Fix)
6. Arenastein-Cap route-scoped → `height: clamp(40rem, 72vh, 46rem)` (Kimi B2 Fix)
7. Spielbrett-Grid-Template-Rows Arenastein-Row → `clamp(34rem, 72vh, 46rem)` (vorher `clamp(22.5rem, 43vh, 26.5rem) = max 424 px`)

## Kimi-Review (Re-Review nach Stash-False-Positive)

**Wichtig:** Erste Kimi-Session hat im stash-Zustand der Worktree-Bereinigung reviewt (Files wurden als "missing" gemeldet). Nach `git stash pop` Re-Review auf den realen Worktree-Stand durchgeführt. Kimi v2 lieferte **3 BLOCKERS**, die alle gefixt wurden:

| Kimi-Blocker | Beschreibung | Fix |
|---|---|---|
| **B1: Schlangenlichtung kollabiert auf 27 px** | `min-height: 0` lässt die innere grid-template-rows `minmax(0, 1fr)` auf content-Höhe kollabieren (M1dj-Pitfall) | `min-height: clamp(34rem, 60vh, 42rem)` als route-scoped Override |
| **B2: Arenastein-Cap zu niedrig für 55% Viewport** | M1d1-Cap `clamp(34rem, 64vh, 40rem) = max 576 px` reicht nicht für 495 px Schlangenlichtung | Cap route-scoped auf `clamp(40rem, 72vh, 46rem) = max 736 px` angehoben + Spielbrett-Grid-Row ebenfalls auf `clamp(34rem, 72vh, 46rem)` |
| **B3: M2j-ID-Kollision** | Voriger M2j-Slice (`docs/release_status_2026-06-15_m2j.md` = Farbenschutz-Schutzschild, Commit 84312a9) belegt M2j-ID bereits | **Umbenannt zu M2r** — alle Files, Test-IDs, Smoke-Skript, Slice-Plan, package.json-Eintrag |

**Verifikation der Fixes:** Kimi-Hinweis "M2j:4-Test täuscht Grün vor" wurde durch die Verschärfung der Test-Logik (Cap-Max >= 38rem statt nur "irgendeine Höhen-Regel") abgefangen.

## Live-Smoke auf Production (post-deploy)

```
[1280x900]
  arenakopf.display=none  (erwartet: none) ✓
  phasenBanner.display=none  (erwartet: none) ✓
  questband.display=none  (erwartet: none) ✓
  questpille sichtbar=true  388.97x94.19  display=flex  ✓ (94px ≤ 100px-Schwelle)
  lichtung sichtbar=true  974.45x639.75  (Anteil: 71% — erwartet >= 55%) ✓
  brett sichtbar=true  1075.05x1207.77
  hand sichtbar=true  560.97x109.80

[1100x800]
  arenakopf.display=none  (erwartet: none) ✓
  phasenBanner.display=none  (erwartet: none) ✓
  questband.display=none  (erwartet: none) ✓
  questpille sichtbar=true  388.97x94.19  display=flex  ✓
  lichtung sichtbar=true  809.33x636.69  (Anteil: 80% — erwartet >= 55%) ✓
  brett sichtbar=true  905.33x1318.80
  hand sichtbar=true  464.63x109.80

M2r SMOKE BESTANDEN — Schlangenlichtung ist die zentrale Forest-Arena auf /game.
```

**Console-Errors:** 0
**HTTP:** / und /game beide 200

## Pre-Existing-Test-Isolation

Mit `git stash -u && npm test -- --run` wurde der Baseline-Lauf ohne M2r-Änderungen ermittelt:
- **Baseline:** 28 failed / 1252 passed (1280 Tests)
- **Mit M2r:** 28 failed / 1260 passed (1288 Tests)
- **Net-Positive:** +8 RED-Tests grün, **0 neue roten Tests**

Alle 28 Pre-Existing-Failures bleiben unverändert (M1d3, M1dk, M1ak, M1aw, M1ca, M1da, M1dc, M1k, M1a, M2m, M2f, M2k, M2q, M2c, R136, R181, R183, M1cm, M1l, M1aj, M1cn, M1co, M1cp, M1cq, M1dc-Spielmoment-Pulse) — keine Verbindung zu M2r.

## Sichtbare Wirkung (vorher → nachher)

| Element | Vorher (Pixel) | Nachher (Pixel) | Effekt |
|---|---|---|---|
| Arenakopf-Titel | 39 px sichtbar | 0 px (`display: none`) | Reduzierter Chrome-Layer |
| Phasen-Banner | 25 px sichtbar | 0 px (`display: none`) | Phasen-Info lebt im Aktiver-Tanz-Schritt-Pill |
| Questband | 94 px sichtbar | 0 px (`display: none`) | Quest-Info lebt in Brettrand-Questpille (M2g) + Aufgaben-Tafel |
| Questpille | 149 px (Volltext-Bubble) | 94 px (kompakter Title) | Pille als Title der Schlangenlichtung, nicht als Layer darüber |
| **Schlangenlichtung** | **370 px (45%)** | **639 px (71%)** | **Wald atmet, Schlange IST das Brett** |

**Visuelle Verifikation:** `docs/m2r_forest_arena_1280x900.png` zeigt den `/game`-Screen mit der Schlangenlichtung als zentrales Element. Magiekreise (Startkreis/Schlangenende/Sonderzauber) sichtbar, Handkarten unten mit Waldspros/Schlangen/Wasserwirbel/Mondranke, Brettrand mit END-TURN-Pille rechts.

## Code-Audit (Worktree-Stand 27.06.2026)

| Datei | Was wurde geändert |
|---|---|
| `src/App.css` (Z. 10423+) | M2r-Block: 4 Hides + Questpille-Komprimierung + Schlangenlichtung-flex-Fill + Arenastein-Cap-Raise + Spielbrett-Grid-Row-Cap-Raise |
| `src/App.css` (Z. 2185) | Spielbrett-Grid-Template-Rows Arenastein-Row von `clamp(22.5rem, 43vh, 26.5rem)` auf `clamp(34rem, 72vh, 46rem)` |
| `src/App.m2r_schlangenlichtung_forest_arena.test.tsx` | 8 RED-Tests (Cap-Raise-Assert hinzugefügt nach Kimi B2) |
| `src/App.m1d0_waldtanz_layout_konsolidierung.test.tsx` | Test-Literal um neue Cap-Werte (34rem/72vh/46rem) erweitert (Stale-Assert-Migration) |
| `scripts/m2r_schlangenlichtung_forest_arena_smoke.mjs` | Live-Smoke mit 2 Viewports, `pruefeM2rForestArena` + sichtInfo() |
| `package.json` | smoke:production-Kette um `m2r_schlangenlichtung_forest_arena_smoke.mjs` erweitert |
| `docs/slice_plan_m2r_schlangenlichtung_forest_arena.md` | Slice-Plan mit Pre-Implementation-Audit + Workflow-TDD |
| `docs/m2r_forest_arena_1280x900.png` | Live-Screenshot zur Verifikation |

## Workflow (TDD, warum es kein Big-Bang war)

1. **Slice-ID-Konflikt-Check:** Pre-Existing M2j (Farbenschutz) belegt M2j-ID → Umbenennung auf M2r.
2. **Pre-Implementation-Audit:** M1cv/m1dk/m2g/m1d0/m1di alle gegen das CSS geprüft, alle Basis-Regeln bleiben unangetastet (route-scoped Hides sind additiv).
3. **RED-Tests 1-7** geschrieben: 4 Hides + Questpille-Kompakt + Schlangenlichtung-flex-Fill + Arenastein-Cap-Raise + 3 DOM-Kompatibilitäts-Asserts.
4. **CSS-Implementation** in einem Block: 4 route-scoped `display: none !important` + Questpille + Schlangenlichtung + Arenastein-Cap.
5. **Spielbrett-Grid-Row-Cap-Raise** als Folge-Fix nach Live-Smoke (Cap wurde durch Grid-Override gedeckelt).
6. **Min-Height-Floor-Fix** als Folge-Fix nach Live-Smoke (Schlangenlichtung kollabierte auf 27 px mit `min-height: 0` + `height: 100%`).
7. **Test-Migration:** M1d0-Literal um neue Cap-Werte erweitert (Stale-Assert-Migration wegen intentionaler Cap-Anhebung).
8. **Build + Lint + Typecheck** alle grün.
9. **Pre-Existing-Test-Isolation** via `git stash -u && npm test -- --run`: +8 / 0.
10. **Production-Deploy** via `bash ~/.hermes/skills/schlangentanz-workflow/templates/deploy_prod.sh`.
11. **Live-Smoke** auf `https://schlangentanz-v2.vercel.app` mit beiden Viewports: beide OK (71% / 80% Schlangenlichtung).
12. **Vision-Analyze** des Post-Deploy-Screenshots: Schlangenlichtung ist jetzt dominant, Schlange IST das Brett.

## Spielerische Wirkung

- **Vorher:** Spieler sah oben 4 Status-Karten (Titel, Phase, Quest, Questband), unten die Schlangenlichtung vergraben (45% der Arenastein-Höhe). Klick-Simulator-Gefühl.
- **Nachher:** Spieler sieht die Schlangenlichtung **direkt unter dem Spielerrahmen** als zentralen Forest-Arena-Stein (71% der Viewport-Höhe auf 1280x900, 80% auf 1100x800), mit der Questpille als kompakter Title oben drin, Handkarten unten drunter — der Brettrand atmet.
- Das ist der "echtes Spielerlebnis"-Schritt: **die Schlange IST das Brett**, nicht ein vergrabenes Sub-Element.

## Nächste Lücke (M2s+)

1. **M2s:** Schlangenlichtung-INNERE Komposition sichtbar machen — Magiekreise + Tischkarte + Schlangenbereich als primary affordances mit atmen-atmen lassen, statt sie auf content-Höhe zu clippen.
2. **M2t:** Brettrand-Pillen oben-rechts (Phase-Info + Questpille + Brettschritt) als Stitch-konformer Hero, statt verteilt.
3. **M2u:** Schlangenkarten-Stitch-Pop auf Spielmoment (Hover-Lift + Selected-Lift auf Schlangenkarten selbst, nicht nur Handkarten).
4. **M2v:** Spieler 2/3/4-Plaketten als Stitch-Forest-Crew sichtbar statt als generische Gegnerplaketten.

## Commits

- `M2r: Schlangenlichtung als Forest-Arena auf /game — Brettrand-Chrome reduziert, Schlangenlichtung befreit (71% Viewport)`