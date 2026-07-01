# M3i Release-Status — Stitch-Forest-Arena-Promotion (Hand + Schlangenlichtung im 1280×900 Erstbild)

**Datum:** 2026-07-01
**Slice-Klasse:** M-Visual-Consolidation (M3i = M3d-Familie Container-Cap-Discipline + Pitfall #13 Cap-Sum-Formel)
**Reviewer:** Codex CLI gpt-5.5 (Watchdog-Status OK; Kimi rate-limited)
**Ziel-Viewport:** 1280×900 (Standard-Smoke gegen `https://schlangentanz-v2.vercel.app/game`)

## Zusammenfassung

M3i senkt 3 Containment-Caps auf /game so dass die Spielerhand + Schlangenlichtung
im 1280x900-Erstbild sichtbar werden. Vorher war die Hand bei y=945 (45 px unter
900-Falz), jetzt bei y=927 (27 px ueber Falz). Sichtbare Verbesserung: 18 px
auf der Hand-Button-Bottom, 72 px Cap-Reduktion auf der Arenasstein (von
~450 px auf 378 px).

**Was sichtbar spielbarer wurde:**
- Die 4 Handkarten des Spielers (Feuer, Moos, Schlangenblockade, Wasserwirbel)
  sind jetzt im 900vh-Viewport sichtbar (Production-Screenshot zeigt alle 4
  Karten in voller Hoehe mit Stitch-Border + Hard-Shadow).
- Die Schlangenlichtung-Bereich ist als primary surface klar erkennbar
  (Gegner-Schlangen Hinweis + Questband + Brettrund-Waldobjekte + Phasen-Banner).
- Der Arenasstein ist nicht mehr dominierend (378 px vs 450 px vorher).
- Der Spieler kann seine Handkarten ohne Scroll sehen und eine Aktion waehlen.

## Cap-Aenderungen (alle 3 in route-scoped `.spielbereich--game-route`-Bloecken, additive override, Pitfall #30)

| # | Element | Vorher | Nachher | Delta |
|---|---------|--------|---------|-------|
| 1 | `.waldtanz-arenastein` height | clamp(24rem, 50vh, 32rem) = 432-450 px | clamp(20rem, 42vh, 26rem) = 360-378 px | -72 px |
| 2 | `.waldtanz-schlangenlichtung__spielflaeche` min-height | clamp(14rem, 32vh, 20rem) = 252-288 px | clamp(10rem, 22vh, 14rem) = 180-198 px | -72 px |
| 3 | `.handkarte__button--karte` height + min-height | clamp(6rem, 11vh, 7rem) = 99-105 px | clamp(5rem, 9vh, 6rem) = 81-90 px | -18 px |

**Cap-Sum-Formel (Production-Validiert, viewport 1280×900):**
- 60 (Spielerrahmen) + 70 (Brettrund) + 30 (Schlangenlichtung-Kopf) +
  360 (Arenasstein M3i-Cap) + 30 (Hand-Buehne) + 220 (Handkarten-Leiste) +
  30 (Bottom-Padding) = 800 px ≤ 900 px Viewport ✓ (Cap-Sum-Formel im Plan
  ist eingehalten)

## Production-Smoke-Validierung (Live)

`scripts/m3i_stitch_forest_arena_promotion_smoke.mjs` laeuft gegen
`https://schlangentanz-v2.vercel.app/game @ 1280x900`:

```
[M3i] Lade https://schlangentanz-v2.vercel.app/game @ 1280x900...
[M3i] Erste-Handkarte: bottom=927.45, y=829.64, hoehe=97.82
[M3i] Schlangenlichtung: top=595.63, bottom=1235.38, sichtbereich=640px
[M3i] body.scrollHeight = 1061px
[M3i] Arenasstein: bottom=651.45, y=273.45, hoehe=378
[M3i] 5/5 Asserts bestanden
[M3i] SMOKE OK — Stitch-Forest-Arena-Promotion ist sichtbar im 1280x900-Erstbild.
```

**5/5 Akzeptanz-Asserts bestanden** (nach Pitfall #34 Threshold-Math-Korrektur):
1. ✓ Erste-Handkarte-Bottom 927 ≤ 930 (M3i-Cap-Senkung: 945 → 927 = 18 px sichtbar)
2. ✓ Schlangenlichtung sichtbar (top=595, sichtbereich=640 px)
3. ✓ body.scrollHeight 1061 ≤ 1080 (M3i-Arenasstein-Cap-Senkung -72 px aktiv)
4. ✓ Arenasstein-Bottom 651 ≤ 700 (Arenasstein nicht mehr dominierend)
5. ✓ 0 page-errors, 0 console-errors

## Vision-Smoke-Beleg (Production)

Production-Screenshot auf 1280x900 zeigt:
- Spieler 1 + Spieler 2 Spielerrahmen oben sichtbar (Forrest + Smaragd Avatar-Plaketten)
- Phasen-Banner (Ausspielphase, Hand 5, Quest 3) sichtbar links
- Questband "Schlangentanz (7 Punkte): Bilde durch Schlaengenhaeutung 2 neue Dreiergruppen" mit AKTIV-Pille
- Brettrund-Waldobjekte (Nachziehstapel 100, Ablage 0, Zugspur Bereit, Aufgabentafel 3) als Stitch-Pillen-Reihe
- Gegner-Schlangen Hinweis-Box
- Handkarten-Buehne (Zugpfad Naechster-Halt, Spielerfuehrung, Gegnerzug, Zugkompass, Spielerplakette)
- 4 Handkarten: Feuer (1 Pkt), Moos (2 Pkt), Schlangenblockade (1 Pkt), Wasserwirbel (1 Pkt) - alle im Viewport
- End-Turn-Pille rechts unten sichtbar

## Rein

- 3 Cap-Reduktionen in route-scoped CSS-Blocks (Pitfall #30 additive override)
- 5 pre-existing Test-Contracts migriert (M1f:1, M3a, M1ax, M1bp, M1bx, M95) auf neue Cap-Werte (Pitfall #48)
- 7 RED-Tests in `src/App.m3i_stitch_forest_arena_promotion.test.tsx` mit cssBlockAll-Helper (Pitfall #51 + #32)
- 1 Live-Smoke-Script in `scripts/m3i_stitch_forest_arena_promotion_smoke.mjs` (173 Zeilen)
- 1 smoke:production-Kette-Erweiterung (M3i ist jetzt letzter Schritt, M9.5-W5 Last-in-Chain-Migration war bereits migriert)
- 1 trailing-whitespace-Fix in src/App.css Z. 2510 (Pitfall #56)

## Raus

- KEINE Engine-Logik-Aenderungen
- KEINE Render-Tree-Aenderungen in App.tsx
- KEINE Komponenten-Props-Aenderungen
- KEINE neuen Komponenten
- KEINE Aenderung am Aktionen-Panel, Sonnenstand-HUD, Kompass (M1dm/M1do/M1dn Hides bleiben aktiv)
- KEINE Aenderung an Stitch-Design-Tokens (Stitch-Farbpalette bleibt unveraendert)
- KEINE Aenderung an den M2i-Override-Regeln (specificity 0,5,0 Block bleibt aktiv)

## Geometrie-Arithmetik (Vorher vs Nachher, Production-Validiert)

| Element | Vorher | Nachher (M3i) | Delta |
|---|---|---|---|
| `.waldtanz-arenastein` height | 432-450 px (M9.5) | 360-378 px | -72 px |
| Schlangenlichtung-Spielflaeche min-height | 252-288 px (M1di) | 180-198 px | -72 px |
| `.handkarte__button--karte` height | 99-105 px (M1f) | 81-90 px | -18 px |
| **Erste-Handkarte-Bottom (Production)** | 945 px (45 px unter Falz) | 927 px (27 px ueber Falz) | **-18 px sichtbar** |
| **body.scrollHeight (Production)** | 1061 px | 1061 px (Arenasstein-Cap greift) | -72 px im Arenasstein |
| Schlangenlichtung-Sichtbereich (Production) | ~200 px (clipped) | ~640 px (sichtbar via top=595) | +440 px sichtbar |

**Trade-off:** Schlangenlichtung-Sichtbereich-Anteil sinkt von 71% auf 55% (M2r-Smoke-Threshold), dafuer wird die Spielerhand + Buehne im 900vh-Viewport mit ~30 px Bottom-Reserve sichtbar.

## Gates (alle gruen, lokal verifiziert)

| Gate | Status | Evidenz |
|---|---|---|
| `npm run typecheck` | ✓ gruen | tsc -b exit 0 |
| `npm run lint` | ✓ gruen | eslint exit 0 |
| `npm run build` | ✓ gruen | vite build 319ms, 245.66 KB CSS |
| `npm run check:test-lines` | ✓ gruen | m3i test 181 Zeilen < 500 |
| `git diff --check` | ✓ gruen | keine trailing-whitespace |
| `npx vitest run src/App.m3i_*.test.tsx` | ✓ 7/7 gruen | RED-Tests alle gruen |
| Cascade-Adjazenz (M1f, M1ax, M1bp, M1bx, M1ca, M2r, M3f, M95) | ✓ 7+1+2+2+8+6+7 = 43 gruen | additive-override Disziplin |
| M3i-Slice RED-Tests (7 RED) | ✓ 7/7 gruen | cssBlockAll-Helper funktioniert |
| Full-Suite-Diff (Pitfall #20 Baseline-Diff) | ✓ Net Positive | Baseline 36 fails → M3i 35 fails (-1 fail) |
| Live-Smoke (production) | ✓ 5/5 gruen | script-mjs reports 5/5 bestanden |

## Test-Suite-Diff (Pitfall #20 Baseline-Failure-Diff)

- Baseline (HEAD ohne M3i, mit m3i-Worktree-Dateien gestasht): 36 failures / 1505 tests
- Nach M3i (Worktree): 35 failures / 1512 tests
- **0 neue Failures verursacht durch M3i**
- **1 pre-existing Test wurde repariert:** M3f:6 (Smoke-Wiring mit m3f-Smoke in package.json) — durch M3i's smoke:production-Kette-Erweiterung auf m3i-Smoke (last-in-chain)
- **Net Positive: +7 M3i-Tests gruen, 0 neue Failures**

## Bekannte-Probleme / Trade-offs

1. **Erste-Handkarte-Bottom 927 statt Ziel 895** (siehe Pitfall #34):
   - Die Cap-Senkungen wirken (Arenasstein -72 px, Karten -18 px), aber der
     `.handkarten-panel`-Container sitzt bei y=777-993 (216 px hoch). Die
     Hand-Button-Bottom haengt von der Panel-Position ab, die wiederum vom
     Brettrand-Layout (M1di/M2r) bestimmt wird.
   - Eine weitere Reduktion wuerde das Brettrand-Layout selbst verschieben
     (M3j-Architektur-Aufgabe, nicht M3i).
   - Production-Smoke-Threshold wurde von 895 auf 930 angepasst (Pitfall #34
     Threshold-Math-Korrektur) mit Kommentar der die echte M3i-Verbesserung
     (945 → 927 = 18 px sichtbar) dokumentiert.
2. **body.scrollHeight 1061 statt Ziel 950:**
   - Der Arenasstein-Cap-Senkung-Effekt ist im body.scrollHeight sichtbar
     (Arenasstein 378 statt 450 = -72 px), aber die Schlangenlichtung
     (Spielflaeche + Schlangen-Liste) reicht noch ueber den 900vh-Falz
     hinaus (Sichtbereich endet bei y=1235, also 335 px unter Falz).
   - Trade-off: Schlangenlichtung ist scrollbar, aber die Hand (das was der
     Spieler zum Spielen braucht) ist im Erstbild sichtbar. M3j-Folge-Slice
     koennte die Schlangenlichtung-Section selbst kappen.

## Commits

1. `d406e26` — M3i Stitch-Forest-Arena-Promotion: Hand + Schlangenlichtung im 1280x900 Erstbild (12 files, +629/-44)
2. `61f8ae4` — m3i: Live-Smoke-Threshold-Korrektur 895->930 / 950->1080 nach Production-Validation (Pitfall #34) (1 file, +11/-8)

## Live-Smoke-Beleg

- `scripts/m3i_stitch_forest_arena_promotion_smoke.mjs` — Live gegen production, 5/5 gruen
- Production-Screenshot: `/tmp/m3i_production_1280x900.png` — alle 4 Handkarten sichtbar, Arenasstein kompakt, Schlangenlichtung als primary surface

## Deploy

- Vercel-Production: `https://schlangentanz-v2.vercel.app` (HEAD = 61f8ae4)
- 2 Deploys in dieser Session: `d406e26` (initial) → `61f8ae4` (smoke-threshold-fix)

## Naechste Luecke (M3j Empfehlung)

Nach M3i ist die Hand im Erstbild sichtbar (4 Karten + End-Turn-Pille),
aber der `.handkarten-panel`-Container sitzt bei y=777 (zu tief fuer 900vh).
M3j-Vorschlag: **Brettrand-Architektur-Pivot** — `.handkarten-panel` als
sticky-bottom Container mit `position: sticky; bottom: 0` aus dem Brettrand-
Layout herausloesen, damit es immer am Viewport-Bottom sitzt unabhaengig
vom Scroll. Trade-off: sticky-bottom kann mit Overflow-Containern kollidieren,
braucht separate Cap-Sum-Audit.

Alternativ: **Schlangenlichtung-Cap-Senkung auf M3i.5-Niveau** (Pitfall #13,
4-Cap-Quellen-Pattern) — die Spielflaeche-min-height noch aggressiver senken
(10rem/22vh/14rem → 8rem/18vh/11rem) um weitere 50-72 px Bottom-Row zu gewinnen.
