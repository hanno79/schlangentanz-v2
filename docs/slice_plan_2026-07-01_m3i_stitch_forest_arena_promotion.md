# Slice-Plan M3i — Stitch-Forest-Arena-Promotion (Spielerhand + Schlangenlichtung im 1280×900 Erstbild)

**Datum:** 2026-07-01
**Slice-Klasse:** M-Visual-Consolidation (M3d-Familie: Container-Border-Absorption + Pitfall-30 Additive-Override) + M-Container-Cap-Discipline (M9.5-Familie, Pitfall #13).
**Reviewer:** Codex CLI gpt-5.5 (Watchdog-Status OK).
**Ziel-Viewport:** 1280×900 (Standard-Smoke @ `https://schlangentanz-v2.vercel.app/game`).

## Problem (Production-Sicht)

Aktuelle Live-Geometrie auf `/game` @ 1280×900:

- `.handkarten-panel` y=777-993 (216px hoch, **93px unter 900-Falz**)
- `.handkartenleiste` (5 Karten) y=832-941 (110px hoch, **41px unter Falz**)
- Erste Handkarte-Button y=829-945 (116px, **45px unter Falz**)
- `.waldtanz-schlangenlichtung__spielflaeche` y=698-1257 (559px hoch, **357px unter Falz**)
- `body.scrollHeight` = 1061px (161px Scroll noetig, um Hand voll zu sehen)

**User-Erfahrung:** Spieler startet das Spiel auf `/game`, sieht die obere Haelfte (Spielerrahmen, Quest-Pille, Brettrund-Waldobjekte, Gegnerlichtung, Schlangenlichtung-Oberkante), aber **seine eigene Hand ist nur teilweise oder gar nicht sichtbar im 900-Viewport**. Er muss scrollen, um Handkarten zu sehen und zu spielen — das ist der zentrale Stitch-Spielwert-Schmerz (Stitch-Referenz hat die Hand IMMER am Viewport-Bottom mit voller Kartenhoehe von h-48=192px).

## Stitch-Referenz

`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/code.html` zeigt 3-Zonen-Layout:

1. **Oben (Opponent Hand):** Toad-King-Score-Plaque (links, schraeg) + 3 verdeckte Karten (Mitte) + Timer-Plaque (rechts)
2. **Mitte (Arena):** Grosser runder Spielstein mit 2 animierten Drop-Zones (add_circle + star), gespielte Karte in der Mitte
3. **Unten (Player Hand):** Spieler-Score-Plaque (links, schraeg) + 3-4 Handkarten (Mitte, hover-lift + selected-lift) + **End-Turn-Button (rechts, prominent)**

**Schluessel-Pattern:** End-Turn-Button sitzt IMMER rechts unten mit `position: absolute`, Handkarten-Mitte, Score-Plaque links. Die Hand ist **immer im 900-Viewport sichtbar** mit `pb-4` Padding.

## Rein

### 1) **Cap-Sum-Formel auf Papier (M3i Cap-Disziplin)**

Ziel: Hand (Leiste + Buehne) muss bottom < 900px, Schlangenlichtung muss top >= ~250px.

```
Sichtbarer Bereich: y=0 bis y=900
  y=0-15:    App-Body Padding
  y=15-90:   Spielerrahmen (~75px)
  y=90-150:  Quest-Pille + Brettrund-Waldobjekte (90-150)
  y=150-410: Gegnerlichtung + Schlangenlichtung-Kopf + Brettrand (~260px)
  y=410-540: Schlangenlichtung-Spielflaeche (130px sichtbar)
  y=540-680: Handkarten-Buehne (35-42px) + Leiste (110px) = ~145-150px
  y=680-900: BOTTOM RESERVE fuer Footer/Padding (~220px)
```

**Cap-Quellen die M3i anfassen muss:**

- **Cap-Quelle #1 — Arenasstein-Hoehe:** `clamp(24rem, 50vh, 32rem)` = 432-450px. Mit M3i-Reduktion auf `clamp(20rem, 42vh, 26rem)` = 360-378px → spart ~72px.
- **Cap-Quelle #2 — Schlangenlichtung-Spielflaeche-Mindest-Hoehe:** `clamp(14rem, 32vh, 20rem)` = 252-288px. Mit M3i-Reduktion auf `clamp(10rem, 22vh, 14rem)` = 180-198px → spart ~72px.
- **Cap-Quelle #3 — Handkartenleiste-Kartenhoehe:** `clamp(6rem, 11vh, 7rem)` = 99-105px. Mit M3i-Reduktion auf `clamp(5rem, 9vh, 6rem)` = 81-90px → spart ~15px.

**Cap-Sum nach M3i:** 432+72+15 = ~519 px Bottom-Row-Ersparnis. Bottom-Row (Hand + Buehne) = 220-260px → bleibt im 900-Viewport mit ~120px Bottom-Puffer.

### 2) **CSS-Aenderungen (alle im route-scoped `.spielbereich--game-route`-Block, Pitfall #30 Additive-Override)**

#### 2a) Arenasstein-Hoehe reduzieren
- Selektor: `.spielbereich--game-route [class~="waldtanz-arenastein"]`
- Aktuell: `height: clamp(24rem, 50vh, 32rem); max-height: clamp(24rem, 50vh, 32rem);`
- M3i: `height: clamp(20rem, 42vh, 26rem); max-height: clamp(20rem, 42vh, 26rem);`
- Cascade-Safe: Selektor ist identisch, nur der Wert aendert sich (existing route-scoped Block editieren, nicht neuen anhaengen).

#### 2b) Schlangenlichtung-Spielflaeche-Mindest-Hoehe reduzieren
- Selektor: `.spielbereich--game-route [class~="waldtanz-schlangenlichtung__spielflaeche"]` (falls existiert) ODER `.waldtanz-schlangenlichtung__spielflaeche` (base).
- Aktuell: `min-height: clamp(14rem, 32vh, 20rem); height: 100%;`
- M3i: `min-height: clamp(10rem, 22vh, 14rem); height: 100%;`
- Test-Safety: bestehender M1di-Test (M2r-Tradeoff) wird angepasst auf neuen Threshold.

#### 2c) Handkartenleiste-Karten-Hoehe reduzieren
- Selektor: `.spielbereich--game-route [class~="handkartenleiste--spielkartenfaecher"] [class~="handkarte__button--karte"]`
- Aktuell: `height: clamp(6rem, 11vh, 7rem); min-height: clamp(6rem, 11vh, 7rem);`
- M3i: `height: clamp(5rem, 9vh, 6rem); min-height: clamp(5rem, 9vh, 6rem);`
- Cascade-Safe: Selektor ist identisch, nur der Wert aendert sich.

### 3) **Pre-Existing-Test-Migrationen (Pitfall #11, #48)**

- **`M3a:1` (handkarten-buehne min-height):** bleibt unveraendert bei `clamp(2.2rem, 4.5vh, 2.6rem)`.
- **`M3a:4` (handkartenleiste margin-top):** bleibt unveraendert bei `-0.8rem`.
- **`M9` / `M9.5` Smoke-Threshold:** wird von `body.scrollHeight <= 1100` auf `<= 950` reduziert (passend zur Cap-Senkung).
- **`M1ao` (Waldobjekte-Overflow-Contract):** bleibt unveraendert (M3f-Pill-Layout, separate Route).
- **`M1dj` (Waldtanz-Brettlandschaft):** bleibt unveraendert.
- **Cap-Sum-Threshold fuer Production-Smoke:** Hand-Button-Bottom <= 895px (5px Puffer unter 900-Falz).

### 4) **Live-Smoke (Production) — M3i Stueck-Production-Beweis**

`scripts/m3i_stitch_forest_arena_promotion_smoke.mjs`:
- Setup: `chromium.launch() + setViewportSize(1280, 900) + page.goto('https://schlangentanz-v2.vercel.app/game')`
- Akzeptanz:
  - `ersteHandkarte.bottom <= 895` (5px Puffer unter Falz)
  - `schlangenlichtungSichtbar.top >= 250` UND `.bottom - .top >= 100` (mind. 100px Schlangen-Sichtbereich)
  - `body.scrollHeight <= 950` (kein Overflow noetig)
  - `arenaStein.bottom <= 700` (Arenasstein nicht mehr dominierend)
  - 0 page-errors, 0 console-errors

### 5) **No-Engine-Change-Discipline**

- KEINE Aenderung an `App.tsx` Render-Tree
- KEINE Aenderung an Engine-Code
- KEINE Aenderung an `useState`/`useEffect`
- KEINE Aenderung an Komponenten-Logik
- Nur CSS-Cap-Reduktion im route-scoped Block (Pitfall #30 Additive-Override: nur die geaenderten Properties anfassen, alle anderen unveraendert lassen)

## Raus

- KEINE Engine-Logik-Aenderungen
- KEINE Render-Tree-Aenderungen
- KEINE Komponenten-Props-Aenderungen
- KEINE neuen Komponenten
- KEINE Aenderung am Handkarten- oder Schlangen-Engine-Verhalten
- KEINE Aenderung an Stitch-Design (kein neues Pattern, nur Cap-Disziplin)
- KEINE Aenderung am Aktionen-Panel (M1dm Hide bleibt aktiv)
- KEINE Aenderung am Sonnenstand-HUD (M1do Hide bleibt aktiv)
- KEINE Aenderung am Kompass (M1dn Hide bleibt aktiv)

## Geometrie-Arithmetik (Vorher/Nachher)

| Element | Vorher | Nachher | Delta |
|---|---|---|---|
| `.waldtanz-arenastein` height | clamp(24rem, 50vh, 32rem) = 432-450 px | clamp(20rem, 42vh, 26rem) = 360-378 px | -72 px |
| `.waldtanz-schlangenlichtung__spielflaeche` min-height | clamp(14rem, 32vh, 20rem) = 252-288 px | clamp(10rem, 22vh, 14rem) = 180-198 px | -72 px |
| `.handkarte__button--karte` height | clamp(6rem, 11vh, 7rem) = 99-105 px | clamp(5rem, 9vh, 6rem) = 81-90 px | -18 px |
| `body.scrollHeight` | 1061 px | ~880 px | -181 px |
| Erste-Handkarte bottom | 945 px (45px unter Falz) | ~870 px (30px ueber Falz) | -75 px |
| Schlangenlichtung-Sichtbereich | ~200 px (clipped) | ~180 px (voll sichtbar) | -20 px (kontrollierter Verlust) |

**Akzeptanz-Threshold:** Erste-Handkarte-Bottom <= 895px (5px Puffer unter 900-Falz). Aktuelle Realitaet: 945px → -50px noetig. Mit M3i-Cap-Senkung: 945 - 75 = 870px. ✓

## Gates

| Gate | Status |
|---|---|
| `npm run typecheck` | ✓ grün erwartet (keine TS-Aenderung) |
| `npm run lint` | ✓ grün erwartet (keine neue Lint-Regel noetig) |
| `npm run build` | ✓ grün erwartet (nur CSS-Minor-Edit) |
| `npm run check:test-lines` | ✓ grün erwartet (neue Test-Datei voraussichtlich < 200 Zeilen) |
| `npx vitest run src/App.m3i_*.test.tsx` | ✓ 6-8 RED-Tests grün erwartet |
| Cascade-Adjazenz: `npx vitest run src/App.m3a_*.test.tsx src/App.m9_*.test.ts src/App.m95_*.test.ts` | ✓ grün (Pitfall #30 additive override) |
| `node scripts/m3i_stitch_forest_arena_promotion_smoke.mjs` (production) | ✓ 5/5 Asserts grün |
| `git diff --check` | ✓ grün |

## Klassen-Audit (Pitfall #45 Pflicht, M3f-Pattern)

Echte DOM-Klassen verifiziert via `rg -n "handkartenleiste--spielkartenfaecher" src/App.tsx`:
- `.handkartenleiste--spielkartenfaecher` (HandkartenPanel.tsx Z. 270)
- `.waldtanz-arenastein` (App.tsx Z. 327)
- `.waldtanz-schlangenlichtung__spielflaeche` (Komponenten-intern)

Keine Tippfehler.

## Commits (voraussichtlich 2-3)

1. `m3i: Cap-Senkung Arenasstein + Schlangenlichtung + Handkarten für 1280×900-Erstbild-Sichtbarkeit`
2. `m3i: M3a:1 + M3a:4 + M1ao Test-Contract-Migration auf neue Cap-Werte (Pitfall #48)`
3. `m3i: Release-Status-Doku + Playability-Gate-Evidence`

## Naechste Luecke (nach M3i)

Nach M3i ist die Hand im Erstbild sichtbar. Die naechste sichtbare Stitch-Luecke ist:
- **M3j: Brettrand-Stitch-Action-Bar** — der End-Turn-Button wird als prominente Stitch-Pille rechts-unten platziert (Stitch-Pattern: `position: absolute right-0 bottom-4`), und eine "Spieler-ist-dran"-Affordance macht den aktuellen Spieler noch sichtbarer.
- **M4: Spielfluss-Mehrzug-E2E** — Playwright-Test, der eine 3-Zug-Partie gegen die Spec durchspielt.
- **M5: Echte Multiplayer-Lobby + Spielfluss-Animation** — Karten gleiten animiert von der Hand zum Brett-Ziel.
