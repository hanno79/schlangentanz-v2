# M2v: Brettrand-Zugknopf als Stitch-Hero-Bubble

**Status:** Plan (RED-Phase steht aus)

**Klasse:** Affordance-Mid-Slice + Stitch-Hero (Schwester-Slice zu M2i Handkarten-Hero,
M2g Brettrand-Questpille, M2u Hand-Drop-Glow). Sichtbarer Affordance-Schritt, kein
Engine-Touch, keine Layout-Reorg, keine JSX-Reorder.

**Slice-Argument:** Die Vorgaenger-Slice-Doku (M2u) empfiehlt explizit M2v als
naechsten Affordance-Mid-Slice. Auf dem `/game`-Screen ist der End-Turn-Knopf der
einzige groessere Phasen-Wechsel — er muss visuell fuehlbar sein, sonst fuehlt
sich der Phasen-Wechsel wie ein unscheinbarer Listen-Klick an.

**Referenz:** `/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`
zeigt den End-Turn-Knopf rechts unten als orange Coral-Pille, eigenstaendig vom
Hand-Bereich, mit Pfeil nach rechts. Im aktuellen /game-Screen ist der Knopf
eine lime-gruene Pill mit gleicher Border/Familie wie die Hand-Bubbles — er
konkurriert mit den Handkarten um Aufmerksamkeit statt sich als "naechster
Schritt" zu praesentieren.

## Rein

1. **`.waldtanz-arenazug__hauptknopf` als Stitch-Hero-Pille:**
   - groesser (min-width ~14rem, padding 1rem 1.6rem statt 0.85rem 1.2rem),
   - coral-orange Hintergrund (`--st-color-tertiary-container` oder aehnlich)
     statt lime — eigene Farbfamilie als Phase-Wechsel-Marker,
   - Eyebrow-Text "End Turn" wird zur kleinen Status-Annotation UNTER dem
     Hauptlabel (z.B. ueber `:before` Pseudo-Element oder Kicker),
   - Pfeil `→` als Icon-Tile links (quadratisch, 3px border, hard-shadow-sm)
     statt als reiner Text.

2. **Idle-Pulsing-Aura** wenn der Knopf die einzige legal naechste Aktion ist
   (Status "wartet" = Pointer-Events aus, kein Pulsing):
   - `.waldtanz-arenazug--bereit` bekommt eine subtile Aura (Keyframe
     `waldtanz-arenazug-pulse` 2.4s ease-in-out infinite),
   - Box-Shadow-Wellen von 6px zu 12px, opacity 0.55 zu 0.0,
   - Reduced-Motion-Override `@media (prefers-reduced-motion: reduce)` setzt
     Animation auf `none`.

3. **Hover-Lift** als Stitch-konsistenter "Heb-Dich-Hoch"-Effekt:
   - `translateY(-3px)` + `box-shadow: 0 9px 0 var(--st-color-border-strong)`
     statt nur transform on :active,
   - Cursor bleibt `pointer`.

4. **Focus-Visible-Ring** fuer Keyboard-User:
   - `outline: 3px dashed var(--st-color-primary-fixed)`,
   - `outline-offset: 4px`,
   - `transition: outline-offset 120ms ease`.

5. **Mobile-Erhalt:** der bestehende route-scoped Override
   `.spielbereich--game-route [class~="waldtanz-arenazug__hauptknopf"]`
   (padding 0.5rem 0.75rem, box-shadow 0 4px 0) wird erweitert auf
   Mobile-Breakpoint — auf /game unter 1280 px Viewport bleibt der Knopf
   kompakt (die Stitch-Referenz zeigt den Knopf auf einem breiten Screen;
   auf Mobile gilt: lieber klein + lesbar als riesig + umbrechend).

## Raus

- KEINE Aenderung an `WaldtanzArenazugknopf.tsx`-Logik
  (`ermittleArenazugAktion`, `statusText` bleiben unveraendert),
- KEINE Aenderung an Brettrand-Layout / Grid-Areas,
- KEINE neuen Komponenten — nur CSS im bestehenden `.waldtanz-arenazug*`-Block,
- KEINE Engine-Touches,
- KEIN neuer Smoke-Script (Slice ist visueller Polish, kein messbarer neuer
  Vertrag; wir nehmen den M2u-Smoke wieder in Betrieb als Visuelle-Referenz).

## RED-Test-Plan (6 RED-Tests)

Datei: `src/App.m2v_brettrand_zugknopf_stitch_hero.test.tsx`

1. **RED-1 — Coral-Orange-Background:** die Hero-Hauptknopf-Regel enthaelt
   `background: var(--st-color-tertiary-container)` (Stitch-coral-orange).
2. **RED-2 — Stitch-Icon-Tile:** `.waldtanz-arenazug__pfeil` hat einen
   3px-Border (`border: 3px solid var(--st-color-border-strong)`).
3. **RED-3 — Idle-Pulsing-Keyframe:** `.waldtanz-arenazug--bereit`
   enthaelt `animation: waldtanz-arenazug-pulse 2.4s ease-in-out infinite`.
4. **RED-4 — Hover-Lift:** `.waldtanz-arenazug__hauptknopf:hover` enthaelt
   `translateY(-3px)` und `box-shadow: 0 9px 0 var(--st-color-border-strong)`.
5. **RED-5 — Focus-Visible-Ring:** `.waldtanz-arenazug__hauptknopf:focus-visible`
   enthaelt `outline: 3px dashed var(--st-color-primary-fixed)` und
   `outline-offset: 4px`.
6. **RED-6 — Reduced-Motion-Override:** `@media (prefers-reduced-motion: reduce)`
   Block enthaelt `.waldtanz-arenazug--bereit { animation: none }`.

Zusaetzlich: keine Stale-Assert-Konflikte mit M1k-Token-Constraint
(`var(--st-color-primary-fixed)` ist im M2i-Style erlaubt fuer Outline/Focus,
nicht fuer Background — gehoert also zur safe-Token-Familie).

## Verifikation

1. `npx vitest run src/App.m2v_brettrand_zugknopf_stitch_hero.test.tsx` (6 RED-Tests gruen)
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build`
5. Targeted-Run auf benachbarte Brettrand-Slices (M1dl, M1dh, M2i, M2g, M2u)
6. Optional: M2u-Smoke als Visuelle-Referenz, falls der Arenazugknopf im
   M2u-Smoke-Pfad auftaucht (er sitzt in `aktionsdock`-Row).

## Risiken

- **Cascade-Override (M1dt-Pattern):** ein spaeteres `spielbereich--game-route
  [class~="waldtanz-arenazug__hauptknopf"]` ueberschreibt moeglicherweise den
  neuen coral-Background, Hover-Lift, Focus-Ring. Fix: route-scoped Block
  erweitert BEHALTEN, nur die Basis-Regel anpassen. RED-Test-3 prueft die
  Basis-Regel, RED-Test-7 (siehe unten) prueft den route-scoped-Override.
- **Pulse-Animation als visueller Reiz:** bei Phase-Wechsel muss der
  Waldtanz-Zugkompass-Status (`aktion-gruppe--phasenaktion`) sichtbar bleiben
  — Animation darf ihn nicht ueberlagern. Wir setzen `z-index: 14` schon
  (route-scoped), bleiben dabei.
- **Mobile-Erhalt:** die Mobile-Override-Regel darf den coral-Background NICHT
  entfernen — sie darf nur padding + box-shadow anpassen. Pruefen mit
  RED-Test-7.

## Bonus-RED-Tests (falls Budget reicht)

- **RED-7 — Cascade-Regression:** `.spielbereich--game-route
  [class~="waldtanz-arenazug--bereit"]` (oder naechstes Element mit dem Namen)
  darf die Animation NICHT entfernen — wir wollen den Pulse auch auf /game.
- **RED-8 — Mobile-Padding-Erhalt:** route-scoped Padding-Override enthaelt
  immer noch `padding: 0.5rem 0.75rem` UND der coral-Background bleibt
  erhalten (`background: var(--st-color-tertiary-container)` wird nicht durch
  eine spaetere Mobile-Regel ueberschrieben).

## Aufwand-Schaetzung

- 1 RED-Test-File (~80 Zeilen)
- 1 CSS-Patch (~50-70 Zeilen in `.waldtanz-arenazug*`-Block + route-scoped)
- Keine Komponenten-Aenderung
- Kein neuer Smoke (M2u-Smoke wiederverwendet)
- Typecheck + Lint + Build: 3 Tool-Calls
- Targeted-Run + Adjacent-Run: 2 Tool-Calls
- Kimi-Review background: 1-3 Min
- Commit + Deploy + Live-Smoke: ~10 Tool-Calls
- **Gesamt: ~25-30 Tool-Calls**, im Budget-Rahmen eines Cron-Laufs.