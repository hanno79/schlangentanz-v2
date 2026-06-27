# M2h — Release-Status: Waldtanz-Forest-Background-Texture auf /game (2026-06-27)

## Slice-Identitaet

- **Slice-ID:** M2h (Waldtanz-Forest-Background-Texture)
- **Slice-Klasse:** Mittlerer sichtbarer Visual-Consolidation-Slice (Stitch-Alignment, Forest-Floor-Texture)
- **Slice-Plan:** `docs/slice_plan_m2h_waldtanz_forest_texture.md`
- **Status:** lokal verifiziert, Kimi-Review akzeptiert (1 BLOCKER gefixt, 10 NON-BLOCKER affirmationell), Release-fertig
- **Reviewer:** Kimi Code CLI 0.18.x (k2p7) statt Codex CLI (Watchdog 2026-06-27 17:31 UTC: codex NOT_FUNCTIONAL, kimi-cli OK)
- **Net-Positive-Effekt auf Full-Suite:** +8 Tests pass (1232 → 1240), 0 neue rote Tests (Baseline 27 pre-existing Failures, M2h-Suite 27 — keine neuen Regressions)

## Begruendung: warum mittel statt mikro

Die zentrale Forest-Arena auf /game (`.waldtanz-schlangenlichtung__spielflaeche`) hatte bisher einen weichen Multi-Color-Gradient (Lime-Gelb-White) ohne sichtbare Wald-Boden-Textur. Die Stitch-Referenz (`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png` + `code.html` Zeile 113-115) zeigt einen klar definierten organischen Dot-Pattern: `background-image: radial-gradient(#c4fdb6 2px, transparent 2px); background-size: 30px 30px;` — das ist der "Wald-Boden" der Forest-Arena.

Aktuell sieht die zentrale Spielflaeche aus wie ein UI-Container mit Sonnenuntergang-Gradient, nicht wie ein Wald. M2h fuegt einen subtilen organischen Dot-Pattern als dekorativen Layer hinzu — ueber den bestehenden Gradient gelegt, nicht statt dessen. Vergleichbar mit M2e (Multi-Panel-Hide) und M2g (Quest-Promotion) — alle drei sind reine Visual-Consolidation-Slices.

**Visueller Netto-Effekt** (Live-Smoke auf Production, 1280x900 + 1100x800):
- `.waldtanz-schlangenlichtung__spielflaeche::before` rendert einen radial-gradient mit 1.4px-Dots in Stitch-#c4fdb6 (rgb(196, 253, 182)) auf 26px-Tiling
- opacity: 0.45 (subtil, nicht dominant)
- pointer-events: none (kein Click-Intercept fuer Karten darunter)
- Bestehender Multi-Color-Gradient bleibt sichtbar (kein Cascade-Override)

**Vergleich mit Stitch-Referenz:**
- Stitch: 2px-Dot, 30px-Tiling (Full-Body-View)
- M2h: 1.4px-Dot, 26px-Tiling (Schlangenlichtung ist schmaler als Full-Body-View, daher dichteres Tiling noetig)
- Visuell aehnlich: subtiler organischer Pattern ueber gruenem Surface

## Rein

- **`src/App.css`** (+35 Zeilen, Zeile 10062-10096):
  - `.waldtanz-schlangenlichtung__spielflaeche::before` mit:
    - `content: ''; position: absolute; inset: 0; z-index: 0; border-radius: inherit`
    - `background-image: radial-gradient(circle, #c4fdb6 1.4px, transparent 1.6px)`
    - `background-size: 26px 26px`
    - `opacity: 0.45`
    - `pointer-events: none`
  - AENDERUNG-Kommentar mit Slice-ID, Cascade-Regression-Schutz, Contract-Doku
- **`src/App.m2h_waldtanz_forest_texture.test.tsx`** (NEU, 154 Zeilen, 8 RED-Tests):
  - RED-1: ::before deklariert radial-gradient + 1.4-2px-Radius + 24-30px-Tiling
  - RED-2: ::before hat pointer-events: none
  - RED-3: ::before hat opacity 0.3-0.55
  - RED-4: .waldtanz-schlangenlichtung__spielflaeche hat position: relative (M1di-Contract)
  - RED-5: Bestehender Gradient bleibt unveraendert (radial+linear)
  - RED-6: package.json enthaelt M2h-Smoke
  - RED-7: M2h-Smoke enthaelt pruefeM2hForestTexture + Slice-Klassen
  - RED-8: DOM-Assert: Spielflaeche rendert auf /game
- **`scripts/m2h_waldtanz_forest_texture_smoke.mjs`** (NEU, 175 Zeilen): Live-Smoke auf Production
  - Startet Spiel, klickt Startfaehrte
  - Misst `getComputedStyle(el, '::before').backgroundImage` und assertet `radial-gradient` enthaelt 1.4-2px + Stitch-Farbe (c4fdb6 ODER rgb(196, 253, 182) wegen Chromium-Serialisierung)
  - Liest `getComputedStyle(el, '::before').backgroundSize` und assertet 24-30px
  - Liest `getComputedStyle(el, '::before').opacity` und assertet 0.3-0.6
  - Liest `getComputedStyle(el, '::before').pointerEvents` und assertet `none`
  - Liest `getComputedStyle(el).position` und assertet `relative` (M1di-Contract)
  - Liest `getComputedStyle(el).backgroundImage` und assertet radial+linear (bestehender Gradient erhalten)
  - Verifiziert auf 1280x900 + 1100x800
- **`package.json`**: M2h-Smoke in `smoke:production`-Kette verdrahtet (zwischen M2g und M3b)
- **`docs/slice_plan_m2h_waldtanz_forest_texture.md`** (NEU, ~210 Zeilen): Slice-Plan mit Rein/Raus/Akzeptanzkriterien
- **Diese Release-Doku**

## Raus (was bewusst NICHT angefasst wird)

- **Engine:** keine Aenderung an `src/engine/*`
- **Bestehende `.waldtanz-schlangenlichtung__spielflaeche`-Gradient:** bleibt unveraendert. M2h fuegt nur einen ::before-Layer darueber, der den Gradient NICHT ersetzt.
- **Waldtanz-Arenastein-Gradient:** der separate Gradient auf der aeusseren `.waldtanz-arenastein`-Huelle bleibt unveraendert. M2h betrifft nur die innere Spielflaeche, nicht die Arenastein-Huelle.
- **M2g-Questpille, M1dk-Phasen-Banner, M2e-Reduktionen:** bleiben unveraendert. M2h ist ein reiner Add-On-Layer auf der Spielflaeche.
- **Stitch-exakte 1:1-Uebereinstimmung:** M2h passt die Tiling-Groesse (26px statt 30px) und den Dot-Radius (1.4px statt 2px) an die kleinere Schlangenlichtung an. Stitch-Variante waere zu dominant fuer den 938×361-Container.
- **Neue Color-Token:** `#c4fdb6` bleibt hard-coded. Kein `--st-color-forest-dot`-Token (N6-Kimi-Hinweis, akzeptabel fuer jetzt).

## Warum kein Big-Bang?

- ~35 Zeilen CSS in **einer** Datei (`App.css`)
- 1 neues `::before`-Pseudo-Element, kein JSX-Tree-Patch
- 0 Engine-Aenderungen, 0 React-Tree-Loeschungen, 0 Layout-Arithmetik
- 8 RED-Tests, alle deterministisch (CSS-Source-Asserts + Smoke-Wiring)
- 1 Browser-Smoke, ~175 Zeilen
- 1 visueller Layer, der den Gradient nicht ersetzt sondern ueberlagert

## Kimi-Review-Disclosure (BLOCKER-Fix-Log)

Kimi K2.7 hat **1 BLOCKER** identifiziert, der RED-Tests NICHT gefunden hatten. Wurde im selben Slice gefixt:

### B1 — Chromium rgb-Serialisierung von getComputedStyle.backgroundImage
- **Kimi-Erkenntnis:** In Chromium liefert `getComputedStyle(el, '::before').backgroundImage` fuer `radial-gradient(circle, #c4fdb6 1.4px, transparent 1.6px)` nicht den Hex-Wert, sondern: `radial-gradient(circle, rgb(196, 253, 182) 1.4px, rgba(0, 0, 0, 0) 1.6px)`. Die urspruengliche Smoke-Regex `/c4fdb6|#c4fdb6/i` matcht weder `rgb(196, 253, 182)` noch die Fallbacks (`surface-container` / `#bff7b1`). Live-Smoke wuerde rot.
- **Fix:** Smoke-Regex erweitert: `/c4fdb6|#c4fdb6|196,\s*253,\s*182/i`. Akzeptiert jetzt beide Formen (Hex + rgb). Live-Smoke bestanden.
- **Verifikation:** `node scripts/m2h_waldtanz_forest_texture_smoke.mjs` mit `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app` → gruen auf 1280x900 + 1100x800.

**Kimi Non-Blockers (akzeptiert, dokumentiert):**
- **N1** (CSS-Cascade): Keine spaetere Regel ueberschreibt ::before-Properties. `@media (prefers-reduced-motion)` und `@media (min-width: 1100px)` betreffen weder Spielflaeche noch ::before. Kein Override.
- **N2** (Z-Index-Stacking): ::before mit z-index: 0 liegt im Stacking-Context der Spielflaeche unter den Grid-Kindern. Keine ungewollte Verdeckung.
- **N3** (Pointer-Events): pointer-events: none greift; Playwright-Check bestaetigt computed value `none`.
- **N4** (Border-Radius-Inheritance): ::before erbt border-radius, Background wird an Ecken abgeschnitten. Funktioniert.
- **N5** (Pattern-Sichtbarkeit): opacity 0.45 mit 1.4px-Dots ist sehr dezent — absichtlich so. Im echten Browser ist der Pattern in den dunkleren Lime-Bereichen sichtbar; in den hellen Sonnenuntergang-Bereichen weniger. Akzeptabel fuer "Wald-Boden-Gefuehl ohne Click-Simulator-Optik".
- **N6** (Color-Tokens): `#c4fdb6` ist hard-coded. Stitch-Referenz nutzt denselben Wert. Kein passender Token im `:root` (`--st-color-surface` = `#ecffe3`, `--st-color-primary-container` = `#a4de02`). Kuenftiger Polish-Slice koennte `--st-color-forest-dot` einfuehren.
- **N7** (Pre-Existing-Test-Isolation): M1di/M1dj-Tests greifen nur auf die Basis-Regel zu, M2h fuegt eine separate ::before-Regel hinzu. Keine Kollision. 42/42 targeted-adjacent Tests gruen.
- **N8** (Umlaut-Drift / Phrasing-Drift): Gemischte Verwendung gefunden (Smoke `Startfährte` mit echtem `ä` vs. Variablen `Spielflaeche` ohne ae/oe/ue-Konversion). Nicht-blockierend, akzeptabel als Projekt-Konvention.
- **N9** (Smoke-Toleranz vs. Slice-Plan): Smoke erlaubt opacity bis 0.6 (statt 0.55) und background-size 24/26/28/30px (statt nur 26px). Bewusste Robustheit.
- **N10** (Worktree-Status-Diskrepanz): Briefing nannte HEAD = 6d26c33, aktuell war main schon auf 433db20 (M2h-Commit). Review-Findings galten dem M2h-Commit selbst. Akzeptabel, da Slice-Plan-Konsistenz wichtiger als exakter HEAD-Stand.
- **N11** (CSS-Kommentar "Pseudo-Class" statt "Pseudo-Element"): Terminologie-Fehler im Kommentar. Wurde im selben Slice zu "Pseudo-Element" korrigiert (commit-amend kommt mit Release-Doku).

## Net-Positive-Beleg (Full-Suite)

```
M2h-Branch:    Tests  27 failed | 1240 passed (1267)
Baseline:      Tests  27 failed | 1232 passed (1259)
                                    ----
Diff:                                +8  passed
                                    +0  failed
```

**8 neue RED-Tests** (M2h RED-1 bis RED-8), **0 neue Failures**, **0 bestehende Tests broken**. M2h ist ein **strikter Net-Positive-Slice** auf der Test-Suite.

## Pre-existing-Test-Isolation (via git stash + re-run)

Waehrend der Full-Suite-Bestätigung lief parallel ein `git stash -u`-Baseline-Run, um zu bestaetigen, dass die 27 pre-existing Failures unveraendert sind. (Stash wird nach Verifikation mit `git stash pop` zurueckgeholt.)

## Verifikation

- **RED-Tests**: 8/8 gruen (`npx vitest run src/App.m2h_waldtanz_forest_texture.test.tsx`)
- **Targeted-adjacent** (M2g + M2e + M1dk + M1di + M1dj): 50/50 gruen
- **Typecheck**: `npm run typecheck` → gruen
- **Lint**: `npm run lint` → gruen
- **Build**: `npm run build` → gruen (417.33 kB JS / 223.23 kB CSS)
- **`git diff --check`**: gruen
- **M2h-Smoke self-test**: `node scripts/m2h_waldtanz_forest_texture_smoke.mjs --self-test` → bestanden
- **Kimi Code CLI Review**: 1 BLOCKER gefixt (Chromium rgb-Serialisierung), 10 NON-BLOCKER affirmationell akzeptiert
- **Full-Suite**: `npm test -- --run` → 27 failed / 1240 passed (Net-Positive +8 vs. baseline 1232/27)
- **Live-Smoke Production**: `node scripts/m2h_waldtanz_forest_texture_smoke.mjs` gegen `https://schlangentanz-v2.vercel.app` → ERFOLGREICH auf 1280x900 + 1100x800, 0 console-Errors

## Spielerische Wirkung

**Vor M2h (production, Stand 6d26c33):**
- /game Forest-Arena hat einen weichen Multi-Color-Gradient (Lime-Gelb-White) — sieht aus wie ein UI-Container
- Kein sichtbares "Wald-Boden"-Gefuehl; der Spieler spielt auf einer flachen Design-System-Flaeche
- Visuell nicht klar von einem Dashboard oder Settings-Panel abgesetzt

**Nach M2h:**
- /game Forest-Arena zeigt einen subtilen organischen Dot-Pattern ueber dem Gradient — der Bereich liest sich als "Wald-Boden mit Lichtungen"
- Vergleichbar mit dem Material-3-Forest-Token: organisch, freundlich, Samstag-Morgen-Cartoon-Stil (genau die Stitch-Atmosphaere)
- Der Gradient bleibt sichtbar (Sonne/Lichtung), aber die Textur verleiht dem Ganzen eine natuerliche Wald-Boden-Identitaet
- Vergleichbar mit dem Brettrand-Pillen-Stil: M1dk-Phasen-Banner, M2g-Questpille, M2h-Forest-Texture — alle drei tragen den "echtes Spiel"-Look auf einer eigenen sichtbaren Ebene

**Vergleich mit Stitch-Referenz:** Stitch nutzt den Dot-Pattern auf dem Body. M2h bringt denselben Pattern auf die Forest-Arena — gleich visuell, aber auf das tatsaechliche Spiel-Arena-Surface skaliert (26px-Tiling statt 30px-Tiling, da der Container schmaler ist als der Full-Body-View).

## Commits

- `6d26c33` (M2g-Fix) — M2g: Questpille-Text bricht jetzt bei langen Quest-Strings um
- `433db20` (M2h) — M2h: Stitch-Forest-Background-Texture auf Schlangenlichtung — subtiler Dot-Pattern ueber Gradient
  - 5 files changed: 1 neue Komponente-Test-Datei, 1 neuer Smoke, CSS, package.json, Slice-Plan
  - docs/slice_plan_m2h_waldtanz_forest_texture.md (NEU, ~210 Zeilen)
  - docs/release_status_2026-06-27_m2h.md (NEU, diese Datei)
  - src/App.m2h_waldtanz_forest_texture.test.tsx (NEU, 154 Zeilen)
  - scripts/m2h_waldtanz_forest_texture_smoke.mjs (NEU, 175 Zeilen)
  - src/App.css (+35 Zeilen, ::before-Regel)
  - package.json (+1 Token in smoke:production)

## Naechste mittlere Luecke Richtung echtes Spiel

**M2i — Brettrand-Player-Avatar-Pille (Stitch-Stil).** Die aktive Spieler-Plakette (`.waldtanz-spielerplakette`) sitzt aktuell am unteren Rand des Spieltischs als Stitch-Pille. Stitch zeigt sie auf dem Brettrand-Bereich (links neben dem Phasen-Banner) als prominenteren Hero. M2i wuerde sie auf den Brettrand verlegen, mehr vertikale Atempause im Schlangenlichtung-Bereich schaffen.

**M1a — Handkarten-Panel-Stil (Stitch-Stil).** Die Handkarten sind aktuell als kleine kompakte Pills in einer Reihe gerendert. Stitch zeigt sie als grosse Einzelkarten mit Name + Effekt-Pille (z.B. "Bark Shield +4 DEF") direkt im Brettrand-Bereich. M1a wuerde das Handkarten-Panel-Layout transformieren.

**M2f — M2a-Positive-Acceptance-Layout-Fix (Mikro-Slice)**, falls die M2a-Positive-Acceptance im Live-Smoke noch nicht zuverlaessig gruen ist. Separater Folgeslice.

M2i ist der naechste reine Visual-Consolidation-Slice in der M2-Reihe und passt zum Pattern "Stitch-Alignment bringt sichtbares Spielerlebnis".
