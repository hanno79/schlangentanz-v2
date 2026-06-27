# M2e — Schlangenlichtung-Brettwald-Befreiung (2026-06-27)

## Slice-Identitaet

- **Slice-ID:** M2e
- **Slice-Klasse:** Route-scoped visual consolidation (CSS-only, kein Engine-Change, kein React-Tree-Change, keine neuen Komponenten)
- **Status:** lokal verifiziert, Kimi-Review akzeptiert (0 BLOCKERS, 6 NON-BLOCKERS affirmationell), Release-fertig
- **Reviewer:** Kimi Code CLI 0.18.x (k2p7) statt Codex CLI (Watchdog 2026-06-27 13:01 UTC: codex NOT_FUNCTIONAL, kimi-cli OK)
- **Net-Positive-Effekt auf Full-Suite:** +6 Tests pass (1218 → 1224), 0 neue rote Tests (Baseline 27 pre-existing Failures, M2e-Suite 27 — keine neuen Regressions)

## Begründung: warum mittel statt mikro

Der `/game`-Screen hatte 1258px Hoehe bei 900px Viewport (zwei Bildschirmseiten) und einen fragmentierten "Click-Simulator"-Collage-Look:

- Linke `.info-panel--spielstatus`-Sidebar mit 5 grossen `Waldtanz-Zugfortschritt`-Cards (1.Karte ziehen → 2.Karten ausspielen → 3.Aufgaben prüfen → 4.Zug abschliessen → 5.Spiel beendet)
- Untere `.waldtanz-hud`-Reihe mit **drei** full-width Panels (Wertung, MaterialUndAufgaben, Spieleruebersicht)

Alle 8 Panels sind redundant mit dem, was **bereits** prominent auf /game sichtbar ist:
- Phase: lebt im `.waldtanz-phasen-banner` am Brettrand
- Material-Status: lebt in der `.waldtanz-spielerplakette` (M1cx)
- Punkte: lebt in der `.waldtanz-spielerplakette` und `.waldtanz-gegnerplakette`
- Aufgaben-Information: lebt in der `.waldtanz-aufgabentafel` (Waldtaschen)
- Spielerübersicht: lebt in Spielerplakette + Gegnerplakette + Top-Kartenfächer

Die **M1d3-Konsolidierung** (Status-HUD-reconciliert) hat das auf der **Default-Lobby-Route** bereits weggeschnitten — auf `/game` waren die Panels aber immer noch da. M2e schliesst diese Luecke **route-scoped** (nur `/game`).

**Visueller Netto-Effekt** (Live-Smoke auf Production, 1280x900 + 1100x800):
- `statusPanel.display = none` ✓
- `hudPanel.display = none` ✓
- `brett.hoeheAnteil = 107% / 139%` der Viewport-Hoehe (vorher: 965px fest, jetzt: 1075x965 / 905x1112 — die Schlangenlichtung dehnt sich auf den freien Platz)
- `lichtung sichtbar = true` (974x370 / 809x329 — Schlangenlichtung als visuelle Buehne)
- `hand sichtbar = true` (560x110 / 464x110 — HandkartenPanel ungehindert darunter)

**Vergleich mit Stitch-Referenz** (`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`):
- Stitch zeigt eine grosse zentrale Waldarena (Snake + 2 Drop-Zones) + Handkarten-Reihe unten + Opponent-Plakette oben + Spielerplakette unten-links + End-Turn-Pille rechts
- M2e nähert sich genau dieser Komposition an: die redundanten 8 Sidebar-Panels, die im alten /game den Waldboden zubetoniert haben, sind weg

## Rein

- **`src/App.css`** (22 Zeilen angehaengt, Zeilen 10214-10235):
  - `.spielbereich--game-route [class~="info-panel--spielstatus"] { display: none !important }` (route-scoped, 0,2,0 specificity, `!important` als Cascade-Sicherung gegen künftige M1d3-Override-Restaurierungen)
  - `.spielbereich--game-route [class~="waldtanz-hud"] { display: none !important }` (gleicher Pattern, gleicher Schutz)
  - `.spielbereich--game-route [class~="spielbrett--waldtanz"] { flex: 1 1 auto; min-height: 0 }` (Brettschritt-Bereich dehnt sich auf freigewordene Hoehe aus, verhindert `min-content`-Kollaps)
- **`src/App.m2e_schlangenlichtung_brettwald_befreiung.test.tsx`** (NEU, 75 Zeilen, 6 RED-Tests):
  - RED-1: `.info-panel--spielstatus` route-scoped `display:none` auf /game (CSS-Source-Assert via `appCss.match`)
  - RED-2: `.waldtanz-hud` route-scoped `display:none` auf /game
  - RED-3: Hide-Regel greift NUR auf /game, NICHT auf / (Lobby-Default); gleichzeitig KEIN generisches `.info-panel--spielstatus { display: none }` ohne Route-Scope
  - RED-4: Auf `/` (Lobby) bleibt `.info-panel--spielstatus` sichtbar — Route-Scoping-Verifikation
  - RED-5: `.spielbrett--waldtanz` bekommt auf /game `flex: 1 1 auto` (last-match auf Cascade-Override, M2e gewinnt gegen fruehere M1d0-Regel)
  - RED-6: Schlangenlichtung-Region bleibt auf /game erhalten (Konsolidierung loescht sie nicht versehentlich)
- **`scripts/m2e_schlangenlichtung_brettwald_befreiung_smoke.mjs`** (NEU, 153 Zeilen): Live-Smoke auf Production
  - Startet das Spiel, klickt Startfaehrte, misst `getBoundingClientRect()` von `.spielbrett--waldtanz`, `.info-panel--spielstatus`, `.waldtanz-hud`, `.handkartenleiste`
  - Akzeptanz: statusPanel + hudPanel haben `display === 'none'`, brett nimmt >= 55% Viewport, lichtung + hand sichtbar
  - Verifiziert auf 1280x900 + 1100x800 (zwei Viewports)
- **`package.json`**: M2e-Smoke in `smoke:production`-Kette verdrahtet (zwischen M2d und M3b)
- **`docs/slice_plan_m2e_schlangenlichtung_brettwald_befreiung.md`** (NEU): Slice-Plan mit Rein/Raus/Akzeptanzkriterien
- **Diese Release-Doku**

## Raus (was bewusst NICHT angefasst wird)

- **Engine**: keine Aenderung an `src/engine/*`
- **React-Tree**: keine Aenderung an `src/App.tsx` JSX-Struktur — die 8 Panels bleiben im JSX und sind auf `/` (Lobby-Default) weiterhin voll funktional
- **Komponenten**: keine Aenderung an SpielstatusPanel, WertungPanel, MaterialUndAufgabenPanel, SpieleruebersichtPanel — sie bleiben im JSX und auf `/` (Lobby) sichtbar
- **M2a-Positive-Acceptance-Layout-Fix**: der in M2d dokumentierte "M2a Positiv wartet auf Layout-Fix"-Punkt wird durch M2e jetzt **moeglich** (mehr Hoehe fuer die Schlangenlichtung = mehr Platz fuer Sonderkarten-Zielauswahl). Die Acceptance-Anpassung am M2a-Smoke ist **M2f** (separater Folgeslice).
- **Andere game-route-scoping-Rules**: die bestehenden ~80+ `.spielbereich--game-route [class~="..."]` Regeln (M1cj, M1dm, M1dn, M1do, M1dp, M1ds, M1dt, M1cz, M1cw, M1cv, M1ct, ...) bleiben unveraendert.

## Warum kein Big-Bang?

- ~30 Zeilen CSS in **einer** Datei (`App.css`)
- 6 RED-Tests, alle deterministisch (CSS-Source-Asserts + Route-Scoping-Verifikation)
- 1 Browser-Smoke, ~150 Zeilen
- 0 Engine-Aenderungen, 0 React-Tree-Aenderungen, 0 neue Komponenten, 0 Layout-Arithmetik
- 1 Route-Bedingung (`.spielbereich--game-route`)

## Spielerische Wirkung

**Vor M2e (production, Stand 58d36f3):**
- /game = 1258px Hoehe, ueber zwei Bildschirmseiten
- Linke Sidebar mit 5 gestapelten Cards (Zugfortschritt)
- Untere Drei-Panel-Reihe (Wertung, Material, Spieleruebersicht)
- Brettschritt sitzt zwischen 31-379px oben links, der Rest ist Zierrat
- "Click-Simulator"-Gefuehl: der Spieler sieht mehr Status-Listen als das Brett

**Nach M2e (production, Stand 9e0ab2e):**
- /game = Brettschritt ist die visuelle Buehne (1075x965 im 1280x900, 905x1112 im 1100x800)
- Schlangenlichtung als zentrale Waldarena (974x370, 809x329)
- HandkartenPanel ungehindert darunter (560x110, 464x110)
- 8 redundante Panels weg — der Waldboden kann atmen
- Phasen-Banner (oben), Spielerplakette (unten links), Brettrand-End-Turn (rechts), Gegnerplakette (oben) bleiben sichtbar und prominent
- "Echtes Spielerlebnis"-Gefuehl: der Spieler sieht das Brett, seine Schlange und die Hand — der Rest ist nicht mehr da, um abzulenken

## Kimi-Review-Disclosure

Kimi K2.7 hat **0 BLOCKERS** identifiziert und **6 NON-BLOCKERS**, die alle affirmativ sind (Kimi bestaetigt, dass die M2e-Aenderung korrekt ist):

- **N1** (CSS-Cascade-Override `.info-panel--spielstatus`): `.info-panel--spielstatus { grid-area: status }` (Zeile 1825) setzt kein `display`, daher kein Konflikt mit der M2e `display: none !important`-Regel. Keine `:hover`/`:focus-visible`-Override-Regeln gefunden. ✓
- **N2** (CSS-Cascade-Override `.waldtanz-hud`): `.waldtanz-hud` (Zeile 4630) definiert nur `max-height`, `overflow`, `border-radius`, `background`, `scrollbar-color`. Kein `display`, keine spaeteren Override-Regeln. M2e gewinnt mit `!important`. ✓
- **N3** (CSS-Cascade-Override `.spielbrett--waldtanz`): M2e ist die letzte Regel mit Selektor `.spielbereich--game-route [class~="spielbrett--waldtanz"]` (Spezifitaet 0,2,0, gewinnt gegen 2149 und 6281). ✓
- **N4** (Route-Scope-Verifikation): `rg` liefert je genau einen Match fuer die Hide-Regeln auf `.info-panel--spielstatus` und `.waldtanz-hud`. Beide innerhalb des route-scoped Selektors. ✓
- **N5** (Live-Smoke-Realismus): Stille `count() > 0`-Skip-Logik im Smoke ist akzeptabel, weil die nachgelagerte Akzeptanzpruefung (Brett-Hoehe, `display:none`, Lichtung/Hand sichtbar) dann trotzdem FAIL produziert. Verbesserung: expliziter Error bei fehlenden Start-UI-Elementen waere sauberer. NON-BLOCKER.
- **N6** (Full-Suite-Impact): Die gelieferte Metrik (baseline 1218/27, mit M2e 1224/27 = +6 passes, +0 failures) zeigt keine M2e-Regression. Die 27 pre-existing Failures (M1d3, M1dk, M1ak, M1aw, M1ca, M1da, M1dc, M1k, M1a) sind als bekannt markiert. ✓

**Action auf N5:** Belassen für M2e (Stille Skip ist akzeptabel im aktuellen Smoke). Falls eine künftige M2e-Erweiterung die Skip-Logik entfernt, sollte sie explizit werfen statt still überspringen.

## Net-Positive-Beleg (Full-Suite)

```
M2e-Branch:   Tests  27 failed | 1224 passed (1251)
Baseline:     Tests  27 failed | 1218 passed (1245)
                                    ----
Diff:                              +6  passed
                                    +0  failed
```

**6 neue RED-Tests** (M2e RED-1 bis RED-6), **0 neue Failures**, **0 bestehende Tests broken**. M2e ist ein **strikter Net-Positive-Slice** auf der Test-Suite.

## Pre-existing-Test-Isolation (via git stash + re-run)

```
git stash -u
npm test -- --run  →  27 failed | 1218 passed
git stash pop
npm test -- --run  →  27 failed | 1224 passed
                                  ----
                                  +6 passes
```

Die 27 pre-existing Failures sind unveraendert (gleicher Hash, gleiche Files: M1d3, M1dk, M1ak, M1aw, M1ca, M1da, M1dc, M1k, M1a, ...). M2e fuegt **6 neue Passing-Tests** hinzu, ohne **einen einzigen Pre-Existing-Test** zu brechen.

## Verifikation

- **RED-Tests**: 6/6 gruen (`npx vitest run src/App.m2e_schlangenlichtung_brettwald_befreiung.test.tsx`)
- **Typecheck**: `npm run typecheck` → gruen
- **Lint**: `npm run lint` → gruen
- **Build**: `npm run build` → gruen
- **Full-Suite**: `npm test -- --run` → 27 failed / 1224 passed (Net-Positive +6 vs. baseline 1218/27)
- **Self-Test Smoke**: `node scripts/m2e_schlangenlichtung_brettwald_befreiung_smoke.mjs --self-test` → bestanden
- **Live-Smoke Production**: `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m2e_schlangenlichtung_brettwald_befreiung_smoke.mjs` → BESTANDEN (statusPanel.display=none, hudPanel.display=none, brett.hoeheAnteil=107%/139%, lichtung sichtbar, hand sichtbar, 0 console-Errors)

## Commits

- `9e0ab2e` — M2e: Schlangenlichtung-Brettwald-Befreiung — route-scoped display:none fuer redundante Sidebar-Panels auf /game
  - 5 files changed, 359 insertions(+), 2 deletions(-)
  - docs/slice_plan_m2e_schlangenlichtung_brettwald_befreiung.md (NEU, 156 Zeilen)
  - scripts/m2e_schlangenlichtung_brettwald_befreiung_smoke.mjs (NEU, 153 Zeilen)
  - src/App.m2e_schlangenlichtung_brettwald_befreiung.test.tsx (NEU, 75 Zeilen)
  - src/App.css (+22 Zeilen)
  - package.json (+1 Token in smoke:production)

## Deploy

- Vercel-Production-Deploy: `9e0ab2e` → `https://schlangentanz-v2.vercel.app` (canonical alias)
- Build-Zeit: 19s
- Self-Test + Live-Smoke: bestanden

## Nächste mittlere Lücke Richtung echtes Spiel

**M2f — M2a-Positive-Acceptance-Layout-Fix fuer Sonderkarten-Zielauswahl.**
Die M2a-Slice (Waldtanz-Sonderkarten-Brettziel-Auto-Highlight fuer Bissspur/Schild/Paarziel) hatte in M2d einen Positiv-Acceptance-Smoke, der auf den Layout-Fix wartete. M2e hat den Layout-Platz freigemacht (Brettschritt ist jetzt 107% / 139% der Viewport-Hoehe statt 965px fest). M2f kann jetzt:
1. Den M2a-Smoke-Update von "negative-Acceptance" auf "positive-Acceptance" anpassen (Sonderkarte selektiert → Brett-Ziel leuchtet → mit dem neuen Hoehen-Spielraum sichtbar)
2. Eine RED-Test-Hardening-Pille hinzufuegen, die die Sichtbarkeit des Sonderkarten-Ziels nach M2e verifiziert
3. Den M2d-Fixture-Helper (`window.__schlangentanzFixture`) auf das neue Layout abstimmen

**M2g — Brettrand-Aufgaben-Pille als sichtbarer Stitch-Hero fuer die persoenliche Quest des Spielers.** Die persoenliche Quest (`geheimeAufgabeText`) lebt aktuell nur als `<p>` in der `AktiverSpielerZugtafel`-Sidebar. Stitch zeigt sie prominent. M2g promoted sie zu einer **prominenten Lime-Pille am Brettrand** neben dem Phasen-Banner.

**M2h — Stitch-Forest-Background-Texture auf /game.** Die aktuelle /game-Background ist ein flacher Lime-Gruen. Stitch zeigt einen "wavy organic background pattern" mit `radial-gradient(#c4fdb6 2px, transparent 2px)`-Dot-Pattern auf `#ecffe3`-Surface. M2h bringt diese Stitch-Background-Texture auf den Brettschritt-Bereich, damit der "Waldboden" tatsaechlich wie ein Wald aussieht statt wie ein flacher UI-Container.

M2g und M2h sind beide reine CSS-Visuelle-Verbesserungen, die direkt auf M2e aufbauen und das "echtes Spielerlebnis"-Gefuehl weiter staerken.
