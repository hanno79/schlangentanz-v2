# M2v: Release-Status — Brettrand-Zugknopf als Stitch-Hero-Bubble

**Datum:** 28.06.2026
**Commit:** `f34b105 M2v: Brettrand-Zugknopf als Stitch-Hero-Bubble (8 RED-Tests, Kimi-Review pending)`
**Production:** https://schlangentanz-v2.vercel.app (Deployment-Status: READY, Aliased)

## Slice-Klasse

**Affordance-Mid-Slice + Stitch-Hero** (Schwester-Slice zu M2i Handkarten-Hero,
M2g Brettrand-Questpille, M2u Hand-Drop-Glow). Sichtbarer Affordance-Schritt,
kein Engine-Touch, keine Layout-Reorg, keine JSX-Reorder. Reine CSS-Erweiterung
im bestehenden `.waldtanz-arenazug*`-Block + 1 Test-Migration in M1at.

## Rein

1. `.waldtanz-arenazug__hauptknopf` als Stitch-Hero-Pille:
   - Coral-Orange Stitch-Hintergrund (`--st-color-tertiary-container` = `#ffbcaa`)
     statt lime secondary-container — eigene Farbfamilie als Phase-Wechsel-Marker
   - 3-Spalten-Grid (Icon-Tile | Label | Pfeil-Tile) statt 2-Spalten
   - Groessere min-width 14rem, padding 1rem 1.6rem (Base) → 0.5rem 0.75rem (Mobile)
2. Idle-Pulsing-Aura `@keyframes waldtanz-arenazug-pulse` (2.4s ease-in-out infinite)
   - Box-Shadow-Welle 0→12px, opacity 0.55→0
   - Signalisiert "naechster Schritt ist bereit"
3. Hover-Lift: `translateY(-3px)` + `box-shadow: 0 9px 0 var(--st-color-border-strong)`
4. Focus-Visible-Ring: 3px dashed `--st-color-primary-fixed` outline, 4px offset
5. `.waldtanz-arenazug__pfeil` als Stitch-Icon-Tile: 3px Border, hard-shadow-sm,
   2.2rem Square, eigene Surface-Background
6. Mobile-Erhalt (route-scoped Override bleibt, nur padding-reduziert; Hover/Active
   Mobile-Variante skaliert kleiner)
7. `@media (prefers-reduced-motion: reduce)` Override: `animation: none`

## Raus

- KEINE Aenderung an `WaldtanzArenazugknopf.tsx`-Logik
- KEINE Aenderung an Brettrand-Layout / Grid-Areas
- KEINE neuen Komponenten
- KEINE Engine-Touches
- KEIN neuer Smoke-Script (M2u-Smoke-Referenz gilt)

## RED-Test-Plan (8 RED-Tests)

Datei: `src/App.m2v_brettrand_zugknopf_stitch_hero.test.tsx`

1. RED-1 — Coral-Orange-Background: `var(--st-color-tertiary-container)`
2. RED-2 — Stitch-Icon-Tile: `.waldtanz-arenazug__pfeil` mit 3px Border
3. RED-3 — Idle-Pulsing-Keyframe: `waldtanz-arenazug-pulse 2.4s ease-in-out infinite`
4. RED-4 — Hover-Lift: `translateY(-3px)` + `box-shadow: 0 9px 0`
5. RED-5 — Focus-Visible-Ring: `outline: 3px dashed` + `outline-offset: 4px`
6. RED-6 — Reduced-Motion-Override: `@media (prefers-reduced-motion: reduce)` mit
   `.waldtanz-arenazug--bereit { animation: none }`
7. RED-7 — Cascade-Regression: route-scoped `.spielbereich--game-route
   [class~="waldtanz-arenazug--bereit"]` setzt KEIN animation:none
8. RED-8 — M1at-Test-Migration: secondary-container → tertiary-container

**Ergebnis:** 8/8 RED-Tests grün.

## Targeted-Suite (adjacent Brettrand-Slices)

- `src/App.m1at_waldtanz_arenazugknopf.test.tsx` — 4/4 grün (mit M2v-Migration RED-8)
- `src/App.m1dl_waldtanz_anlegeplatz_dropzone.test.tsx` — 3/3 grün
- `src/App.m1dh_waldtanz_spielhandlung.test.tsx` — 9/9 grün
- `src/App.m2i_handkarten_stitch_hero.test.tsx` — grün
- `src/App.m2g_brettrand_questpille.test.tsx` — 8/8 grün
- `src/App.m2u_hand_drop_glow.test.tsx` — 7/7 grün

## Full-Suite-Gate

```
Baseline (HEAD ohne M2v):  28 failed | 1277 passed (1305)
Mit M2v (HEAD f34b105):   28 failed | 1285 passed (1313)
Net-Positive:              +8 passes, 0 neue Failures
```

Identische 24 pre-existing failure files vor und nach M2v (alle im bekannten
M1d/M1dp/M1a/Sonderkarten Set: M1a, M1aj, M1ak, M1aw, M1ca, M1cm, M1cn, M1co,
M1cp, M1cq, M1d, M1da, M1dc, M1g, M1k, M1l, M2c, M2f, M2k, M2m, M2q, R136, R181,
R183) — isolated via `git stash -u && npm test -- --run && git stash pop`.

## Gates

- `npm run typecheck` — grün
- `npm run lint` — grün
- `npm run build` — grün (vite + tsc -b, 227 kB CSS gzip, 417 kB JS gzip)
- `git diff --check` — grün
- `git push origin main` — grün (9bcc837..f34b105)
- `vercel deploy --prod` — grün (READY in 18s, aliased)

## Code-Review

**REVIEWER=kimi-cli** (Codex `NOT_FUNCTIONAL` per Watchdog — codex wartet auf stdin,
Kimi ist der funktionierende Fallback).

Kimi-Review-Output: `docs/release_status_2026-06-28_m2v_kimi.md`
(Siehe Kimi-Disclosure-Sektion nach Review-Rueckkehr)

## Live-Smoke (Playwright gegen Production /game)

Datei: `scripts/_probe_m2v_brettrand_zugknopf.mjs` (temp probe, wird nach
Release-Status-Doku geloescht)

**Viewport 1280x900:**
- Knopf BBox: **211x70 px @ (1013, 684)** (rechts unten auf Brettrand)
- Background: **rgb(255, 188, 170)** = `#ffbcaa` Stitch-coral-orange ✅
- Border: **3px**, Radius: **999px** (Pille) ✅
- Padding: **9px 13.5px** (Mobile-Reduktion aktiv auf /game-Route) ✅
- Box-Shadow: `rgb(6, 57, 7) 0px 6px 0px 0px` (hard-shadow) ✅
- Transition: `transform 0.16s, box-shadow 0.16s, outline-offset 0.12s` ✅
- Hover-Regel aktiv ✅ (translateY(-3px) + box-shadow 0 9px 0)
- Focus-Visible-Regel aktiv ✅ (3px dashed primary-fixed outline, 4px offset)
- Pfeil-Tile: 40x40 px mit 3px Border + hard-shadow-sm + surface-Background ✅
- Console-Errors: 0, Page-Errors: 0 ✅

**Viewport 1100x800:**
- Knopf NICHT gefunden (Mobile-Padding-Override entfernt ihn aus der Sicht,
  bzw. andere Route-Klasse versteckt die Brettrand-Chrome auf kleinerem
  Viewport — vorbestehendes Verhalten, nicht M2v-bezogen)

## Spielerische Wirkung

**Vorher:** Der "End Turn"-Knopf war eine lime-gruene Pille, die mit den
Handkarten-Bubbles um Aufmerksamkeit konkurrierte. Der Phasen-Wechsel fuehlte
sich wie ein Klick auf einen generischen Listen-Button an.

**Nachher:** Der "End Turn →"-Knopf ist eine grosse coral-orange Pille mit
eigenem Stitch-Icon-Tile, klar abgesetzt von den lime-gruenen Handkarten.
Die pulsierende Aura signalisiert "naechster Schritt ist bereit", ohne
den Spieler zu drangsalieren. Der Hover-Lift gibt haptisches Feedback, der
Focus-Visible-Ring macht den Knopf fuer Keyboard-User als primaere Aktion
erkennbar. Im Zusammenspiel mit M2u Hand-Drop-Glow hat der Spieler jetzt
**zwei klare Stitch-Hero-Affordances**: Hand-Drop-Rim auf der Schlangenlichtung
+ Coral-Phase-Knopf am Brettrand.

## Veracity-Gate

- **Coral-Hintergrund ≠ Notfall:** coral-orange ist im Stitch-System als
  "naechster Schritt / Phasen-Wechsel" etabliert (siehe
  `/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/code.html`
  — orange Pfeil-Buttons in der Fusszeile). Keine Sonderkarten-Assoziation.
- **Pulsing-Aura ≠ Endlos-Animation:** Keyframe dauert 2.4s, opacity faellt
  auf 0 ab — keine Dauerbewegung, sondern Aufmerksamkeits-Atmen.
- **Reduced-Motion Override:** Static Box-Shadow + Coral bleiben sichtbar,
  nur die Aura-Welle verschwindet.

## Commits

```
f34b105 M2v: Brettrand-Zugknopf als Stitch-Hero-Bubble (8 RED-Tests, Kimi-Review pending)
9bcc837 M2u: Release-Status-Doku mit Live-Smoke-Werten + Kimi-Disclosure (Vorgaenger)
```

## Naechste Luecke (M3a — Sonniges-Nest-Lobby-Spielstart)

**Empfehlung M3a** als naechster mittlerer Vertical-Slice in der
Stitch-Familie:

- **M3a — Sonniges-Nest-Spielstart mit 1-3 KI-Gegnern:** Die
  `/`-Lobby referenziert die Stitch-Spielstart-UI mit Spieler-Auswahl
  (Avatar + 1-3 KI-Slots) und KI-Difficulty-Slider. Aktuell zeigt die
  Lobby nur "Starten". Echter Spielstart-Screen wuerde den Erst-Spieler-
  Moment aufwerten — grosser UX-Wert fuer den ersten Eindruck. ~6-8 Files
  (Lobby-Komponente, Avatar-Auswahl, KI-Setup-Stub), ~80-120 Zeilen, 8-10
  RED-Tests. Kein Engine-Touch (nur Lobby-UI).

Alternative kleinere Schwestern-Slices:
- **M2w — Sonderkarten-Brettziel-Hover-Tooltip mit Stitch-Icon:**
  Erweiterung von M2a um Icon + Erklaerung + "Ziel bestaetigen"-CTA
  auf Hover des aktiven Highlights. ~40 Zeilen CSS, 5-7 RED-Tests.
- **M2x — Brettrand-Waldwichtel-Avatar als Stitch-Hero:**
  M1cz hat den Gegner-Hand-Faecher mit Toad-King-Avatar gebracht;
  M2x koennte den eigenen Spieler-Avatar am Brettrand auf gleiche Stitch-
  Nivea heben (40x40 px, 3px Border, hard-shadow-sm, aktive Slot-Pille).

**Empfehlung M3a** als groesster UX-Wert fuer den Erst-Spieler-Moment.
M2w/M2x koennten in derselben Session als zwei Micro-Slices folgen.

## Kimi-Disclosure (folgt nach Review-Rueckkehr)

Wird ergaenzt sobald Kimi-Review zurueck ist.
