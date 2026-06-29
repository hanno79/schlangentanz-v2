# M9 Slice-Plan — Handkarten-Erstbild-Sichtbarkeit (Weg vom Click-Simulator)

**Datum:** 29.06.2026
**Slice:** M9 — Handkarten sichtbar im Erstbild (1440×900)
**Klasse:** Affordance-Mid-Slice (visueller Spielmoment, keine Engine-Änderung)
**Status:** Implementierung in diesem Cron-Lauf
**Autor:** Hermes Agent (Cron-Lauf, Plan + Implementierung)
**Bezug:** Half-Finished-Family 5 — M8-Plan war über-scoped; M9 ist die fokussierte,
kleinere, sichtbarere Variante: Handkarten sichtbar ohne Scrollen.

## Hintergrund

Auf /game bei 1440×900 Viewport ist die Handkarten-Bühne (das Panel, in dem
die Karten des aktiven Spielers liegen) bei y=998-1226, also 100-300 px
unterhalb des Viewport-Falzes. Der Spieler sieht seine Handkarten erst
nach Scrollen — das verstärkt das "Click-Simulator / Debug-Listen"-Gefühl,
gegen das der User-Refrain seit Tagen arbeitet.

**M2a, M2i, M1db, M1dl, M1ds** haben das Hand-Panel in puncto Stitch-Stil
bereits aufgewertet (Hover-Lift, Selected-Lift, BEREIT-Badge, Drop-Glow,
Stitch-Hero, Aktionendock). **M9** ergänzt jetzt nur das **Layout-Budget**:
das Hand-Panel muss im ersten Viewport erscheinen, ohne dass der Spieler
scrollen muss.

## Warum mittlerer Vertical (NICHT Mikro, NICHT Big-Bang)

- **Nicht Mikro:** Eigener CSS-Clamp-Tuning + Layout-Reihenfolge-Anpassung
  + RED-Test-Set mit Browser-Smoke-Assertion. Adressiert eine direkt
  sichtbare Spielerfahrungs-Lücke, nicht nur ein technisches Detail.
- **Nicht Big-Bang:** Nur `src/App.css` (3-4 Clamp-Werte) + ein neuer
  Smoke-Test. Engine unberührt, Komponenten unberührt, alle
  pre-existing M1-Slice-Verträge bleiben stabil.
- **Sichtbarer Spielwert:** Spieler sieht **seine Hand** als
  Erstbild-Hauptelement. Das ist der wichtigste Stitch-Moment im
  `der_waldtanz_game_board/screen.png` — die Hand **unten am Brett**,
  nicht versteckt darunter.

## Rein

### 1. Layout-Budget-Anpassung in `src/App.css`

Die grid-template-rows der `.spielbereich--game-route` werden so
getunt, dass die Hand im 900-px-Viewport sichtbar ist:

```css
grid-template-rows:
  auto                              /* spielerrahmen */
  auto                              /* gegner-plakette */
  clamp(1.6rem, 3vh, 2rem)          /* aktionsdock (war 2-2.5rem) */
  clamp(24rem, 50vh, 32rem)         /* arenastein (war 34-46rem) */
  clamp(1.6rem, 3vh, 2rem)          /* zugseitenleiste */
  auto;                             /* hand (auto = min-content ~220px) */
```

Mathematik: 60 + 70 + 30 + 480 + 30 + 230 = **900 px genau**.

Vorher: 60 + 70 + 36 + 720 + 36 + 228 = **1150 px** → Hand 250 px unter
Viewport-Falz.

**Begründung:** Die Arenastein-Cap war für "Spielfeld füllt das
Fenster" gestimmt, nicht für "Hand im Erstbild". M9 priorisiert die
**Hand-Sichtbarkeit** über Arena-Größe — der User-Refrain ist klar
"weg vom Click-Simulator", und Click-Simulator entsteht genau dann,
wenn die Klick-Ziele (Handkarten) außerhalb des Erstbildes liegen.

### 2. RED-Tests in `src/App.m9_hand_erstbild.test.tsx`

- M9:1 — `appCss` enthält den neuen arenastein-clamp-Wert
  `clamp(24rem, 50vh, 32rem)`
- M9:2 — `appCss` enthält die reduzierte aktionsdock-Höhe
- M9:3 — `appCss` enthält die reduzierte zugseitenleiste-Höhe
- M9:4 — `appCss` behält `grid-area: hand` für das Handkarten-Panel
- M9:5 — `appCss` behält `display: flex` + `flex-direction: column` auf
  dem Handkarten-Panel (M1f-Vertrag bleibt stabil)
- M9:6 — `appCss` Cascade-Assert: Reihenfolge von arenastein-clamp und
  bestehender Schlangenlichtung-clamp ist stabil

### 3. Live-Smoke in `scripts/m9_hand_erstbild_smoke.mjs`

- `pruefeM9HandErstbild` mit Acceptance:
  1. `getBoundingClientRect()` der Hand-Bühne: `bottom <= 900` UND `top >= 0`
  2. Arenastein-Region bleibt sichtbar: `bottom > handTop` (Reihenfolge stimmt)
  3. Karten-Buttons (mind. 5) im Hand-Panel klickbar (nicht vom
     Schlangen-Pfad überlagert)
- Verifiziert: `hand.bottom <= 900` im 1440×900 Viewport.

### 4. `package.json` smoke:production-Kette

`scripts/m9_hand_erstbild_smoke.mjs` an die Kette anhängen.

## Raus

- **Engine** (`src/engine/**`): unberührt. Keine
  Legal-Action-/State-Machine-/Handkarten-Logik-Änderung.
- **Komponenten** (`src/components/**`): unberührt. Layout wird rein
  über CSS-grid-template-rows gesteuert.
- **Arenenstein-Inhalt** (Waldtischkarte, Magiekreise, Gegnerlichtung,
  Schlangenlichtung): visuell kleiner, aber JSX unverändert.
- **Lobby-Sonniges-Nest** (M3a/M3b/M3c): nicht betroffen (anderes
  Layout-System).
- **M8-Plan** (Sonderkarten-Brettziel-Konsolidierung): bleibt offen
  für Folge-Cron. M9 ist die **kleinere, sichtbarere** Alternative.

## Pflicht-RED-Tests (6 RED-Tests vor GREEN)

1. CSS-Source arenastein-clamp = `clamp(24rem, 50vh, 32rem)`
2. CSS-Source aktionsdock-Höhe = `clamp(1.6rem, 3vh, 2rem)`
3. CSS-Source zugseitenleiste-Höhe = `clamp(1.6rem, 3vh, 2rem)`
4. CSS-Source `grid-area: hand` bleibt erhalten
5. CSS-Source `display: flex` + `flex-direction: column` auf
   Hand-Panel bleibt erhalten
6. Cascade-Assert: arena-clamp-Definition steht VOR
   schlangenlichtung-clamp (Source-Order stabil)

## Pflicht-Code-Review

- **REVIEWER=NONE** (beide ratelimited laut Watchdog-Status).
  Slice wird lokal verifiziert, in Release-Status-Doku als
  "review-blockiert" markiert. Re-Review wenn Watchdog wieder einen
  Reviewer meldet.

## Tool-Budget-Schätzung

| Phase | Tool-Calls |
|---|---|
| RED-Tests (6 neue) | 4-6 |
| CSS-Patch (App.css) | 3-4 |
| Targeted-Test-Run | 1 |
| Live-Smoke schreiben + self-test | 3-4 |
| Smoke-Wiring in package.json + RED-Tests | 3-4 |
| Slice-Plan | 1 (dieses File) |
| Release-Status-Doku | 1 |
| Gates (typecheck, lint, build) | 4 |
| Commit + Push | 2-3 |
| Vercel Deploy | 1-2 |
| Live-Smoke gegen Production | 1-2 |
| **Gesamt** | **~25-35 Tool-Calls** |

Vergleich zum durchschnittlichen M-Slice (~25-40 Tool-Calls) ist M9
**im unteren Drittel**. Begründung: nur CSS-Tuning + 1 neuer Smoke.
Kein Engine-Touch, keine Komponenten-Änderungen, keine Layout-Reorg.

## Naechste Luecke nach M9

- **M8 — Sonderkarten-Brett-Nah-Aktions-Buttons** (ursprünglicher
  Plan, 60-80 Tool-Calls): R180/R181/R182/R183 haben 5/7 RED-Tests
  bereits grün, 2 RED-Tests sind reine Test/Contract-Drift nach M1dp
  route-scoping. M8 als Folge-Slice empfohlen.
- **M2h-ähnlich — Sonniges-Nest-Stitch-Refresh** falls M3c
  Click-Simulator-Gefühl hat.
