# M2h — Stitch-Forest-Background-Texture auf /game

**Slice-ID:** M2h
**Slice-Klasse:** Mittlerer sichtbarer Visual-Consolidation-Slice (Stitch-Alignment, Forest-Floor-Texture)
**Datum:** 2026-06-27
**Autor:** Hermes (mit Kimi-Code-CLI-Review)
**Status:** GEPLANT (post-M2g, in der M2-Visual-Reihe)

## Scope

Die aktuelle /game-Seite hat im zentralen Forest-Arena-Bereich
(`.waldtanz-schlangenlichtung__spielflaeche`) einen weichen
Multi-Color-Gradient (Lime-Gelb-White), aber KEINE sichtbare
Wald-Boden-Textur. Die Stitch-Referenz
(`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`)
zeigt einen klar definierten organischen Dot-Pattern:
`background-image: radial-gradient(#c4fdb6 2px, transparent 2px); background-size: 30px 30px;`
auf einer `#ecffe3`-Surface — das ist der "Wald-Boden" der Forest-Arena.

Aktuell sieht die zentrale Spielflaeche aus wie ein UI-Container mit
einem Sonnenuntergang-Gradient. Das ist nicht das, was der User mit
"echtem Spielerlebnis" meint — der Brettschritt-Bereich soll sich
anfuehlen wie ein Waldboden, nicht wie ein Design-System-Container.

**M2h fuegt dem `.waldtanz-schlangenlichtung__spielflaeche` einen
Stitch-Dot-Pattern als dekorativen Layer hinzu**, ohne den
bestehenden Gradient zu ueberschreiben. Der Dot-Pattern wird ueber
ein `::before`-Pseudo-Element mit niedriger Opacity ueber den
Gradient gelegt — der Spieler sieht weiterhin den
Lime-Gelb-White-Gradient, ABER mit einem subtilen organischen
Wald-Boden-Muster darueber. Vergleichbar mit dem M2e-Pattern
(Multi-Panel-Hide) und M2g-Pattern (Quest-Promotion) — alle drei
sind reine Visual-Consolidation-Slices.

## Begruendung: warum mittel statt mikro

- **Visuelle Wirkung:** Der gesamte zentrale Brettschritt-Bereich
  transformiert sich von "flacher UI-Container mit Sonnenuntergang"
  zu "Wald-Boden mit Lichtungen". Das ist genau der Stitch-Look, der
  aktuell fehlt.
- **Stitch-Alignment:** Die Stitch-Referenz zeigt diesen Dot-Pattern
  explizit (im code.html Zeile 113: `background-image: radial-gradient(#c4fdb6 2px, transparent 2px); background-size: 30px 30px;`).
  M2h schliesst diese sichtbare Stitch-Luecke.
- **Nicht-Mikro:** ~30-50 Zeilen CSS in einer Datei (`App.css`)
  + 4-6 RED-Tests (CSS-Source-Asserts + DOM-Asserts + Smoke-Wiring)
  + 1 neuer Live-Smoke (~120 Zeilen). ~150 Zeilen Diff.
- **Nicht-Big-Bang:** 0 Engine-Aenderungen, 0 React-Tree-Aenderungen,
  0 Layout-Arithmetik. Reines CSS-Overlay.
- **Vergleichbar mit M2e und M2g:** alle drei sind reine
  Visual-Consolidation-Slices mit ~150-200 Zeilen Diff, klar
  testbar, kein Engine-Risiko.

## Rein (was M2h anfasst)

- **`src/App.css`** (~30-50 Zeilen):
  - `.waldtanz-schlangenlichtung__spielflaeche::before` — neues
    Pseudo-Element mit Stitch-Dot-Pattern:
    - `content: ''`
    - `position: absolute`
    - `inset: 0` (flaechendeckend innerhalb der Spielflaeche)
    - `background-image: radial-gradient(circle, var(--st-color-surface-container, #c4fdb6) 1.4px, transparent 1.6px)`
    - `background-size: 26px 26px` (Stitch nutzt 30px; 26px ist etwas
      dichter, da der Container kleiner als der Stitch-Body ist)
    - `opacity: 0.45` (subtil, nicht dominant)
    - `pointer-events: none` (kein Click-Intercept)
    - `border-radius: inherit` (folgt der Spielflaeche-Rundung)
    - `z-index: 0` (unter den Karten/Schlangen, ueber dem Gradient)
  - Optional: `.waldtanz-schlangenlichtung__spielflaeche` bekommt
    `position: relative` (sicherzustellen, dass ::before sich am
    Spielflaeche-Container ausrichtet, nicht am naechsten positioned
    ancestor). Bereits gesetzt in M1di (Position: relative, siehe
    Zeile 10043) — also kein neuer Patch noetig, nur im RED-Test
    verifizieren.
  - RED-Tests pruefen, dass keine andere Klasse den Dot-Pattern
    versehentlich ueberschreibt.
- **`src/App.m2h_waldtanz_forest_texture.test.tsx`** (NEU, ~120 Zeilen, 6 RED-Tests):
  - RED-1: `::before` auf `.waldtanz-schlangenlichtung__spielflaeche`
    deklariert `radial-gradient`-background mit Stitch-Farbe
    `#c4fdb6` und 30px-tiling (CSS-Source-Assert)
  - RED-2: `::before` hat `pointer-events: none` (kein
    Click-Intercept fuer Karten darunter)
  - RED-3: `::before` hat `opacity: 0.3-0.55` (subtil, nicht
    dominant; Stitch-Optik soll dezent sein)
  - RED-4: `.waldtanz-schlangenlichtung__spielflaeche` hat
    `position: relative` (M1di-Contract, damit ::before richtig
    contained ist)
  - RED-5: Bestehende `.waldtanz-schlangenlichtung__spielflaeche`
    Gradient-Definitionen bleiben unveraendert (kein
    Cascade-Override durch neue ::before-Regel)
  - RED-6: package.json smoke:production-Kette enthaelt M2h-Skript
  - RED-7: M2h-Smoke-Skript enthaelt pruefeM2hForestTexture +
    Slice-Klassen + Schwellen
- **`scripts/m2h_waldtanz_forest_texture_smoke.mjs`** (NEU, ~130 Zeilen):
  - Startet Spiel, klickt Startfaehrte
  - Misst `getBoundingClientRect()` der
    `.waldtanz-schlangenlichtung__spielflaeche`
  - Liest `getComputedStyle(el, '::before').backgroundImage` und
    assertet `radial-gradient` enthaelt `1.4px` oder `2px` (Stitch-Dot)
  - Liest `getComputedStyle(el, '::before').backgroundSize` und
    assertet `26px 26px` (Stitch-30px-tiling, angepasst)
  - Liest `getComputedStyle(el, '::before').opacity` und assertet
    zwischen 0.3 und 0.6
  - Liest `getComputedStyle(el, '::before').pointerEvents` und
    assertet `none` (kein Click-Intercept)
  - Verifiziert auf 1280x900 + 1100x800
- **`package.json`**: M2h-Smoke in `smoke:production`-Kette verdrahtet
  (zwischen M2g und M3b)
- **`docs/slice_plan_m2h_waldtanz_forest_texture.md`** (diese Datei)
- **`docs/release_status_2026-06-27_m2h.md`** (am Ende)

## Raus (was bewusst NICHT angefasst wird)

- **Engine:** keine Aenderung an `src/engine/*`
- **Andere Brettrand-Elemente:** M1dk-Phasen-Banner, M1cv-Questband,
  M2g-Brettrand-Questpille bleiben unveraendert. M2h ist reines
  Forest-Arena-Hintergrund-Pattern, kein neues UI-Element.
- **Bestehender `.waldtanz-schlangenlichtung__spielflaeche`-Gradient:**
  bleibt unveraendert. M2h fuegt nur einen ::before-Layer darueber,
  der den Gradient NICHT ersetzt.
- **Waldtanz-Arenastein-Gradient:** der separate Gradient auf der
  aeusseren `.waldtanz-arenastein`-Huelle bleibt unveraendert. M2h
  betrifft nur die innere Spielflaeche, nicht die Arenastein-Huelle.
- **Bestehende M2g-Questpille, M1dk-Phasen-Banner, M2e-Reduktionen:**
  bleiben unveraendert. M2h ist ein reiner Add-On-Layer.

## Akzeptanzkriterien

- [ ] `.waldtanz-schlangenlichtung__spielflaeche::before` rendert
  Stitch-Dot-Pattern (radial-gradient mit kleinem Radius + 26px-Tiling)
- [ ] Pattern ist subtil (opacity 0.3-0.55), nicht dominant
- [ ] Pattern hat `pointer-events: none` (kein Click-Intercept)
- [ ] Bestehender Gradient bleibt sichtbar (kein Cascade-Override)
- [ ] 6-7 RED-Tests gruen
- [ ] Full-Suite: Net-Positive (kein neuer Test wird rot)
- [ ] Production-Smoke auf 1280x900 + 1100x800 gruen
- [ ] Kimi-Code-CLI-Review akzeptiert (kein BLOCKER)

## Warum kein Big-Bang

- ~30-50 Zeilen CSS in **einer** Datei (`App.css`)
- 1 neues `::before`-Pseudo-Element, kein JSX-Tree-Patch
- 0 Engine-Aenderungen, 0 React-Tree-Loeschungen, 0 Layout-Arithmetik
- 6-7 RED-Tests, alle deterministisch (CSS-Source-Asserts + Smoke-Wiring)
- 1 Browser-Smoke, ~130 Zeilen
- 1 visueller Layer, der den Gradient nicht ersetzt sondern ueberlagert

## Spielerische Wirkung

**Vor M2h (production, Stand 6d26c33):**
- /game Forest-Arena hat einen weichen Multi-Color-Gradient
  (Lime-Gelb-White) — sieht aus wie ein UI-Container
- Kein sichtbares "Wald-Boden"-Gefuehl; der Spieler spielt auf
  einer flachen Design-System-Flaeche
- Visuell nicht klar von einem Dashboard oder Settings-Panel
  abgesetzt

**Nach M2h:**
- /game Forest-Arena zeigt einen subtilen organischen Dot-Pattern
  ueber dem Gradient — der Bereich liest sich als "Wald-Boden mit
  Lichtungen"
- Vergleichbar mit dem Material-3-Forest-Token: organisch, freundlich,
  Samstag-Morgen-Cartoon-Stil (genau die Stitch-Atmosphaere)
- Der Gradient bleibt sichtbar (Sonne/Lichtung), aber die Textur
  verleiht dem Ganzen eine natuerliche Wald-Boden-Identitaet
- Vergleichbar mit dem Brettrand-Pillen-Stil: M1dk-Phasen-Banner,
  M2g-Questpille, M2h-Forest-Texture — alle drei tragen den
  "echtes Spiel"-Look auf einer eigenen sichtbaren Ebene

**Vergleich mit Stitch-Referenz:** Stitch nutzt den Dot-Pattern auf
dem Body. M2h bringt denselben Pattern auf die Forest-Arena —
gleich visuell, aber auf das tatsaechliche Spiel-Arena-Surface
skaliert (26px-Tiling statt 30px-Tiling, da der Container schmaler
ist als der Full-Body-View).

## Naechste Luecke nach M2h

- **M2i — Brettrand-Player-Avatar-Pille (Stitch-Stil)**. Die
  aktive Spieler-Plakette ist eine Stitch-Pille mit
  "Du 18 + Avatar"; M2i koennte sie auf den Brettrand-Bereich
  (links neben dem Phasen-Banner) verlegen, wie in der Stitch-Referenz
  sichtbar. Das schafft mehr vertikale Atempause im Schlangenlichtung-
  Bereich.
- **M1a — Handkarten-Panel-Stil (Stitch-Stil)**. Die Handkarten
  sind aktuell als kleine kompakte Pills in einer Reihe gerendert.
  Stitch zeigt sie als grosse Einzelkarten mit Name + Effekt-Pille
  (z.B. "Bark Shield +4 DEF") direkt im Brettrand-Bereich. M1a
  wuerde das Handkarten-Panel-Layout transformieren.
- **M2f — M2a-Positive-Acceptance-Layout-Fix (Mikro-Slice)**, falls
  die M2a-Positive-Acceptance im Live-Smoke noch nicht zuverlaessig
  gruen ist. Separater Folgeslice.
