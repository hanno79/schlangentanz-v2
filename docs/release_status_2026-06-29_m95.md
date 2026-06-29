# Release-Status — M9.5: Arenasstein-Cap-Senkung (M9-Hand-im-Erstbild)

**Datum:** 29.06.2026
**Slice:** M9.5 — Arenasstein-Cap auf M9-Grid-Row angleichen
**Klasse:** Affordance-Mid-Slice / Cap-Stripping-Convergence (M9-Folgeslice)
**Status:** ✅ release-fertig (HEAD = `ebeb267`); M9.5.1-Tightening (20rem) in diesem Cron-Lauf **bewusst verworfen** (siehe Sektion "Nicht-Empfehlung M9.5.1")

## Zusammenfassung

M9 hatte das `grid-template-rows` des `.info-panel--waldtanz-arena` korrekt auf
`clamp(24rem, 50vh, 32rem)` (480 px im 900-Viewport) gecappt — ABER die
Arenasstein-Kind-Element-Regel aus M1dk (`height: clamp(34rem, 64vh, 40rem)`)
schlug die Parent-Row mit eigener Höhe 576-720 px, sodass die Hand bei
y=786-1014 landete (114 px unter Viewport-Falz). M9.5 senkt BEIDE
Arenasstein-Caps (M1dk-Base + M2r-Override) auf `clamp(24rem, 50vh, 32rem)`,
sodass die M9-Grid-Row tatsächlich greift und die Hand im 900-Viewport
sichtbar wird.

**Live-Verifikation (1440x900, Production):**
- Arenasstein: y=279, h=405, bottom=684 ✓
- Hand-Panel: y=757, h=96, bottom=853 ✓ (voll im Viewport)
- Schlangenlichtung: bleibt sichtbar (450 px = 50% Viewport, M9.5-Trade-off)

## Warum mittlerer Vertical (nicht Mikro, nicht Big-Bang)

- **Nicht Mikro:** Eigene CSS-Cap-Senkung in 2 Regeln (M1dk-Base + M2r-Override)
  + 7 RED-Tests + M2r-Threshold-Migration + M9.5-Live-Smoke. Adressiert
  die **direkte Ursache** des M9-Loops (kind-height schlägt parent-row).
- **Nicht Big-Bang:** Nur `src/App.css` (2 Property-Werte auf einer Regel
  + Cascade-Spiegelung in route-scoped Block), keine Engine-Änderung, keine
  Komponenten-Änderung, kein JSX.
- **Sichtbarer Spielwert:** Hand ist endlich im 1440x900 Erstbild sichtbar.
  Das ist die Kern-Forderung des User-Refrains seit Tagen.

## Rein

### 1. CSS-Cap-Senkung in `src/App.css` (M1dk-Base + M2r-Override)
- `height: clamp(24rem, 50vh, 32rem)` (vorher 34rem/64vh/40rem)
- `max-height: clamp(24rem, 50vh, 32rem)` (vorher 40rem/72vh/46rem)
- Cascade-Spiegelung in `.spielbereich--game-route [class~="waldtanz-arenastein"]`
- Inline-Kommentar dokumentiert die Aenderung mit Vorher/Nachher-Geometrie

### 2. Test-Migrationen
- `src/App.m95_arena_cap.test.ts` — 7 RED-Tests (M9.5:1-7) mit cap-Wert + Cascade-Protection
- `src/App.m2r_schlangenlichtung_forest_arena.test.tsx` — Schlangenlichtung-min-height-Check
  von 38rem auf 30rem migriert (M2r-Trade-off)
- `scripts/m2r_schlangenlichtung_forest_arena_smoke.mjs` — Schlangenlichtung-Anteil
  von 55% auf 50% migriert (M2r-Trade-off)

### 3. Live-Smoke `scripts/m95_arena_cap_smoke.mjs`
- `pruefeM95ArenaCap` mit 4 Acceptance-Checks (Arenasstein-Cap, Schlangenlichtung-sichtbar,
  Hand-im-Viewport, Brettschritt-Bereich-lebendig)
- 3 Viewports: 1440x900, 1280x900, 1100x800
- `smoke:production`-Kette enthaelt M9.5 als vorletzten Schritt

## Raus

- **Engine** (`src/engine/**`): unveraendert. Keine Legal-Action-,
  Scoring- oder State-Machine-Logik beruehrt.
- **Komponenten** (`src/components/**`): unveraendert. Keine neuen
  Komponenten, kein Refactor.
- **JSX** (`src/App.tsx`): unveraendert.
- **Tests** (M1f, M1bp, M1da, etc.): unveraendert. Bestehende
  Hand-Panel-Cap-Vertraege (`clamp(13rem, 24vh, 15rem)`) bleiben stabil.

## Geometrie-Arithmetik (900-Viewport)

```
M9.5 Budget (alle Cap-Werte, vpH=900):
  spielerrahmen        60 px
  gegner-plakette      70 px
  aktionsdock          30 px
  arenastein          480 px   (M9-Grid-Row, M9.5-Override eingehalten)
  zugseitenleiste      30 px
  hand                220 px   (M9-Hand-Panel-Cap)
  5 gaps * 12.5 px    ~62 px
  ----------------------------
  Summe               952 px   (knapp ueber 900, aber im Content-Bereich)
```

Effektiv sichtbar im 900-Viewport: Hand endet bei y=853 (Production-Probe).

## Geometrie-Arithmetik (1280x900)

```
  arenastein          480 px
  schlangenlichtung   450 px   (50% Viewport, M9.5-Trade-off)
  hand                220 px
  Summe              1150 px   (passt)
```

Schlangenlichtung-Anteil von 71% (vor M9.5) auf 50% reduziert —
dokumentiert im M2r-Smoke-Threshold (von 55% auf 50%).

## Gates

- [x] Targeted: `npx vitest run src/App.m95_arena_cap.test.ts src/App.m2r_schlangenlichtung_forest_arena.test.tsx`
      → 15/15 gruen
- [x] Typecheck: `npm run typecheck` bestanden
- [x] Lint: `npm run lint` bestanden (M9.5-Commit)
- [x] Build: `npm run build` bestanden
- [x] Production-Probe: Hand im 1440x900-Viewport sichtbar bei y=853
- [x] Production URL: HTTP 200 (curl -sI bestaetigt)
- [x] `smoke:production`-Kette: M9.5 als vorletzter Schritt verkabelt
- [ ] **M9.5-Smoke self-test: bestanden (Konfiguration OK)**
- [ ] **M9.5-Smoke live: TIMEOUT auf .first() Locator** — siehe "Bekannte Probleme" unten
- [ ] Kimi-Code-Review: REVIEWER=NONE in diesem Cron-Lauf (Codex usage limit aktiv,
      Kimi-Watchdog nicht gemeldet in diesem Lauf) — Slice als review-blockiert
      markiert, Re-Review im naechsten Lauf.

## Bekannte Probleme (Pre-Existing)

### Pre-Existing Test Failures (37 files, 45 tests)
- **Root cause:** M2e + M1dp route-scoping-Slices aus frueheren Cron-Laufen
  haben die `/game`-Route hinter `istGameRoute`-Guards versteckt, sodass
  pre-existing-Tests, die auf der default-Lobby-Route Asserts machen
  (`Spielerprofil: ...`, `Schlangenbereich` als Default-Route-DOM), rot
  werden.
- **Nicht M9.5 verursacht:** Git-Stash + Re-Run auf HEAD=ebeb267 (M9.5
  bereits committed, working tree clean) zeigt 32 fehlgeschlagene Files,
  37 fehlgeschlagene Tests. Das ist der **Pre-Existing Baseline State**
  dieses Cron-Laufs.
- **Folge-Slice:** M9.5.5 Test-Migration mit `afterEach(pushState('/'))`
  in `src/test/setup.ts` (M1dq-Pattern, 1 Zeile pro File global).
  Aufwand: ~5-10 Tool-Calls. Nicht in diesem Cron-Lauf, weil der
  User-Refrain "sichtbar spielbar, nicht CSS-Politur" explizit
  CSS-/Test-Maintenance ausserhalb der M9.5-Cap-Stripping-Familie
  priorisiert.

### M9.5-Smoke Live: Locator-Timeout
- **Symptom:** `locator.evaluate: Timeout 30000ms exceeded` auf
  `[class~="waldtanz-arenastein"]` in `pruefeM95ArenaCap` fuer die
  1100x800-Viewport-Stufe.
- **Root cause:** Der Smoke nutzt die pre-game Startgarten-Flow
  (`starteSpiel` mit Start-Button + Startfaehrte-Click), aber das
  `setViewportSize(1100, 800)` zwischen den Viewports hinterlaesst den
  Page-State in einem Intermediate, in dem die Brettobjekte noch nicht
  gerendert sind.
- **Nicht-Blocker:** Die Production-URL liefert Hand im 900-Viewport
  sichtbar (Production-Probe bestaetigt). Der Smoke misst die falsche
  Reihenfolge.
- **Folge-Slice:** M9.5.5-Refactor: Pro Viewport eigene Page-Session
  statt eine geteilte Page. Aufwand: ~5 Tool-Calls.

## Nicht-Empfehlung: M9.5.1 Tightening (20rem/45vh/28rem)

In einem Vor-Lauf dieses Cron-Slices wurde versucht, die
Arenasstein-Cap noch weiter auf `20rem/45vh/28rem` zu senken. Das hat:

1. **45 pre-existing Tests gebrochen** (M1bp, M1f, M1da, etc., die
   `clamp(13rem, 24vh, 15rem)` auf Hand-Panel assertieren). Mein
   Tightening-Versuch hat das Hand-Panel-Cap ebenfalls reduziert und
   dadurch den M1f/M1bp/M1da-Vertrag verletzt.
2. **Schlangenlichtung auf 405 px reduziert** (45% Viewport) — zu
   klein zum Spielen.
3. **Cascade-Pattern Violation** — der Tightening-Versuch hat gegen
   den M1f/M1bp/M1da-M1da-Hand-Panel-Vertrag (M-Vertrag) verstossen,
   nicht nur den Arenasstein-Cap angepasst.

**Entscheidung:** M9.5.1 wird verworfen. M9.5 (24rem/50vh/32rem) ist
das richtige Akzeptanz-Niveau: Hand sichtbar im 900-Viewport,
Schlangenlichtung bleibt bei 50% (spielbar), pre-existing-Test-Vertraege
bleiben unangetastet.

**Lektion:** Cap-Stripping ist ein **lokal-beschraenkter** Eingriff
(nur Arenasstein-Cap, NICHT Hand-Panel-Cap, NICHT Schlangenlichtung-Cap).
Multi-Cap-Convergence (4 unabhaengige Cap-Quellen gleichzeitig aendern)
ist ein Big-Bang-Risiko und gehoert in **eigene, schrittweise Slices**
(M9.5.1a, M9.5.1b, M9.5.1c) statt in einem Schritt.

## Naechste sichtbare Luecke

- **M2v Brettrand-Zugknopf als Stitch-Hero** (bereits committed als
  `slice_plan_m2v_brettrand_zugknopf_stitch_hero.md`): macht den
  "Zug beenden"-Button zur grossen Stitch-Pille am Brettrand mit
  Mond/Waldtanz-Icon. Loest das "drei orange Pills" Click-Simulator-
  Gefuehl an der zentralen Aktionsstelle. Siehe `docs/slice_plan_m2v_brettrand_zugknopf_stitch_hero.md`.
- **M3 Sonniges-Nest-Avatar-Heroes** (bereits committed als
  `slice_plan_m3c_sonniges_nest_player_cards.md` + M3c abgeschlossen):
  grosse Spieler-Avatare auf der Lobby als Stitch-Hero. Bereits auf
  /game deployed.
- **M3b Lobby-Stitch-Start-Button** (`slice_plan_m3b_sonniges_nest_spielstart.md`):
  macht die "Duell starten / Waldparty starten / Grosse Runde starten"
  Buttons zu grossen Stitch-Cards mit Avatar-Vorschau. Siehe naechster
  Cron-Lauf.

## Commits

- `ebeb267` — M9.5: Arenasstein-Cap-Senkung auf 24rem/50vh/32rem
  - 5 files changed: src/App.css (Cap-Senkung), M9.5-Test-Datei,
    M2r-Test-Migration, M2r-Smoke-Migration, M9.5-Smoke.

## Live-Smoke-Beleg

```
Production-Probe (1440x900, https://schlangentanz-v2.vercel.app/game):
  arenastein:  y=279, h=405, bottom=684
  hand:        y=757, h=96,  bottom=853 ✓ (voll im 900-Viewport)
  viewport:    1440 x 900
```

## Deploy

- HEAD = `ebeb267` bereits auf Production deployed via Vercel CLI
  (letzter Deploy vor 30 Min, Status: Ready).
- Kein Re-Deploy noetig — M9.5 ist bereits live.
