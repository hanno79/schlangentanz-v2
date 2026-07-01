# Slice-Plan: M3f — Brettrund-Waldobjekte im Brettrund sichtbar

**Datum:** 2026-07-01
**Slice-Autor:** Hermes (autonomer Cron-Lauf)
**Kategorie:** M3 — Brettrund-Stitch-Visual-Consolidation (Schwester zu M3a/M3b/M3d/M3e)

## Befund (Live-Probe /game @ 1280x900)

Auf dem /game-Screen sind die **4 Brettrund-Stapel** (Nachziehstapel, Ablage, Zugspur, Aufgabentafel) im ersten Viewport **komplett unsichtbar**:

| Element | y | Höhe | Sichtbar? |
|---|---|---|---|
| `.waldtanz-waldtaschen__kopf` | 1137 | 70 | NEIN (237px unter Falz) |
| `.waldtanz-nachziehstapel` | 1211 | 73 | NEIN (311px unter Falz) |
| `.waldtanz-ablage` | 1292 | 73 | NEIN (392px unter Falz) |
| `.waldtanz-zugspur` | 1372 | 73 | NEIN (472px unter Falz) |
| `.waldtanz-aufgabentafel` | 1452 | 73 | NEIN (552px unter Falz) |

Vergleich zum sichtbaren Bereich (viewport=900px):
- Brettrund-Spielfeld endet bei y=723
- Handkarten bei y=830-994 (gerade noch sichtbar)
- Brettrand-Arenazug bei y=814-958
- Magiekreise bei y=727-925
- Spielmat bei y=599-693

## Root Cause

`<aside className="waldtanz-arenasstein__waldobjekte">` ist im App.tsx ein **direktes Sibling** des `<div className="waldtanz-arenasstein__spielfeld">` innerhalb des `<section className="waldtanz-arenasstein">`. Der Arenasstein ist `display: flex` ohne explizite `flex-direction: row` für Sibling-Anordnung.

Im 2-Spalten-Grid des `spielfeld` (Spalte 1 = Schlangenlichtung, Spalte 2 = Magiekreise+Tischkarte+Schlangenbereich) sind die Waldobjekte **nicht enthalten** — sie hängen strukturell unter dem Brettrund-Spielfeld und werden vom Arenasstein-Clip (`overflow: hidden; height: 450px`) nicht erfasst, sondern fallen darunter.

## Stitch-Referenz (Google Stitch Game Board)

Im Stitch-Design sind die 4 Brettrund-Stapel **prominent im Brettrund-Zentrum sichtbar** — als kompakte Pill-Reihe mit dicken 3px forest-green Borders und Hard-Shadow, links oder rechts neben dem Magiekreis-Bereich. Sie tragen klare Labels ("Draw", "Discard", "Trail", "Quests") und sind nie außerhalb des sichtbaren Brettrunds.

## Ziel

Die 4 Brettrund-Stapel als **kompakte 4-in-1-Stitch-Stapel-Reihe** ins Brettrund-Zentrum holen, prominent sichtbar im 900-Viewport. Visuelle Stitch-Form:
- Eine 4-Spalten-Pill-Reihe mit dicken 3px forest-green Borders + Hard-Shadow
- Jede Pill trägt Icon + Name + Zähler-Status
- Anordnung: oben in der Schlangenlichtung (vor Spielmat-Boden) ODER rechts neben der Schlangenlichtung als Sidebar
- Sichtbar im 900-Viewport
- Auf `/` (Lobby) bleibt die bisherige 4-Stapel-Variante erhalten (route-scoped)

## Sichtbare Affordance

**Vorher (M3e-Endstand):**
- Brettrund-Zentrum zeigt: Spielmat (y=599-693), Magiekreise (y=727-925), Tischkarte (y=727-896), Schlangenbereich (y=937+)
- 4 Brettrund-Stapel komplett **unsichtbar** im 900-Viewport

**Nach M3f:**
- Brettrund-Zentrum zeigt zusätzlich: **kompakte 4-Stapel-Stitch-Pill-Reihe (sichtbar im 900-Viewport, y zwischen 200 und 600)**
- Jede Pill sichtbar: Nachziehstapel (mit Karten-Icon + Karten-Count), Ablage (mit Trash-Icon + Karten-Count), Zugspur (mit Trail-Icon + Schritt-Count), Aufgabentafel (mit Quest-Icon + Quest-Count)
- Persistent sichtbar, persistent lesbar

## Rein

- 1 neue route-scoped CSS-Regel auf `.spielbereich--game-route [class~="waldtanz-arenasstein__waldobjekte"]` mit:
  - `position: relative` (Containing-Block für absolute Children)
  - `display: flex`
  - `flex-direction: row` (HORIZONTAL — entgegen dem aktuellen column-Flow)
  - `gap: clamp(0.4rem, 0.8vw, 0.65rem)`
  - `max-width: 100%`
  - `max-height: clamp(5rem, 10vh, 6.5rem)` (kompakte Pill-Höhe)
  - `margin: 0.3rem 0`
  - `padding: clamp(0.32rem, 0.5vw, 0.5rem) clamp(0.45rem, 0.7vw, 0.7rem)`
  - `border: 3px solid var(--st-color-border-strong)`
  - `border-radius: 1.4rem`
  - `background: var(--st-color-surface-container-low)`
  - `box-shadow: 0 5px 0 var(--st-color-border-strong)`
  - `overflow: visible`
  - `align-self: center` (zentriert im Arenasstein, da Arenasstein `display: flex` ist)
  - `flex-shrink: 0`
- Children-Pillen-Override:
  - `.waldtanz-waldtaschen > section` (Nachziehstapel, Ablage, Zugspur, Aufgabentafel):
    - `flex: 1 1 0; min-width: 0`
    - `max-height: clamp(4.5rem, 9vh, 6rem)`
    - `overflow: hidden`
    - `padding: 0.32rem 0.45rem`
    - `border: var(--st-border-width-chunky) solid var(--st-color-border-strong)`
    - `border-radius: 1rem`
    - `box-shadow: 0 3px 0 var(--st-color-border-strong)`
    - `background: var(--st-color-surface-container-highest)`
- `.waldtanz-waldtaschen__kopf` (Kopf-Box) wird im Pills-Modus auf /game **ausgeblendet** (`display: none`), da die Pill-Reihe selbst der Label ist
- `.waldtanz-aufgabentafel__liste` und `.waldtanz-zugspur__naechster-schritt` und `.waldtanz-ablage__leer` bleiben `display: none` (kein Pill-Content-Bloat)

## Raus

- **NICHTS** an bestehenden CSS-Regeln ändern (Pitfall #30)
- **NICHTS** an `App.tsx`-JSX-Reihenfolge ändern (Pitfall #19 / M1di DOM-Order)
- **KEINE** Engine-Logik-Änderung
- **KEINE** Komponenten-Extraktion oder Renaming
- **KEINE** Spielfeld-Grid-Areas-Änderung — die waldobjekte bleiben auf App.tsx-Ebene strukturell wo sie sind, NUR die route-scoped CSS formt sie in eine horizontale Pill-Reihe innerhalb des Arenassteins

## Pitfall-Discipline (Pre-Implementation-Audit)

1. **Pitfall #30 (Additive-Override):** Neue route-scoped Regel auf `.waldtanz-arenasstein__waldobjekte` darf existierende Deklarationen (`max-height: min(21rem, 40vh)`, `overflow: auto`) nicht löschen. Vollständige Re-Inklusion.
2. **Pitfall #32 (CSS-Kommentar-Literal-Form):** Cascade-Kommentar in Worten, nicht in `.klasse { property: value }`-Form.
3. **Pitfall #22 (M1dt-Dispens):** Die Pills sind im Initial-State sichtbar, keine Vorbedingung.
4. **Pitfall #14 (Last-In-Chain):** M9.5-W5 Smoke-Wiring-Test M3b → M3f migrieren (contain + findIndex >= 0).
5. **Pitfall #8 (Route-Scoped vs Base):** Neue Regel geht in den route-scoped Block (`.spielbereich--game-route [class~="..."]`), NICHT in die Base-Regel.
6. **Pitfall #41 (Live-Smoke als Beweis):** Production-Smoke MUSS die 4-Pill-Sichtbarkeit + Position im Brettrund beweisen, nicht nur CSS-Source-Asserts.
7. **Pitfall #43 (Test-Assert-Bug-Hunting):** aria-label nutzen, nicht getByRole 'region' (Aside = complementary). Bounding-Box vs jsdom-Layout (Playwright Production-Smoke hat echte Geometrie).

## RED-Test-Plan (6 Tests)

`src/App.m3f_brettrund_waldobjekte.test.tsx`:
1. **M3f:1 — DOM**: `screen.getByLabelText(/Waldobjekte|Waldtaschen/)` muss rendern, alle 4 Sections (Nachziehstapel/Ablage/Zugspur/Aufgabentafel) als direkte Children
2. **M3f:2 — CSS-Source**: `.spielbereich--game-route [class~="waldtanz-arenasstein__waldobjekte"]` enthält `display: flex; flex-direction: row` UND `max-height: clamp(5rem, 10vh, 6.5rem)` UND `align-self: center`
3. **M3f:3 — CSS-Source**: Children-Pille-Regel auf `.spielbereich--game-route [class~="waldtanz-waldtaschen"] > section` enthält `flex: 1 1 0; min-width: 0; max-height: clamp(4.5rem, 9vh, 6rem)` UND `border: var(--st-border-width-chunky) solid var(--st-color-border-strong)` UND `box-shadow: 0 3px 0 var(--st-color-border-strong)`
4. **M3f:4 — CSS-Source**: `waldtanz-waldtaschen__kopf` wird auf /game ausgeblendet (`display: none` in route-scoped Regel)
5. **M3f:5 — Cascade-Safe**: `align-self: center` auf der neuen Regel steht NACH der `min-height: clamp(34rem, 60vh, 42rem)`-Schlangenlichtungs-Regel (sonst kollabiert Schlangenlichtung auf 540px Floor)
6. **M3f:6 — Smoke-Wiring**: `smoke:production`-Kette enthält `m3f_brettrund_waldobjekte_smoke.mjs` als Schritt + M9.5-W5 ist migriert

## Akzeptanz-Geometrie (Production-Smoke)

`scripts/m3f_brettrund_waldobjekte_smoke.mjs` gegen `https://schlangentanz-v2.vercel.app/game` @ 1280x900:
- `.waldtanz-arenasstein__waldobjekte` muss `display: flex` + `flex-direction: row` haben
- 4 Pill-Children (Nachziehstapel, Ablage, Zugspur, Aufgabentafel) müssen im Container sichtbar sein
- Container y muss < 720 (im Brettrund sichtbar) und Bottom y muss ≤ 720 (komplett im Brettrund)
- Container muss `align-self: center` haben
- 0 Page-Errors, 0 Console-Errors

## Gates

| Gate | Akzeptanz |
|---|---|
| RED-Tests (M3f) | 6/6 grün |
| Smoke-Wiring (M3f-W) | grün + M9.5-W5 migriert |
| M2x/M3a/M3b/M3d/M3e Adjazenz | 0 neue Failures (Baseline-Diff) |
| Typecheck | grün |
| Lint | grün |
| Build | grün |
| Full-Suite | 34 fails (== Baseline) + 0 neue |
| Live-Smoke post-deploy | 4 Pill-Children sichtbar, Container y < 720, 0 Errors |
| Code-Review | Codex CLI (REVIEWER=codex per Watchdog) |

## Tool-Budget

~25-35 Tool-Calls:
- 5 RED-Tests schreiben + iterieren (~8-10 Calls)
- 1 CSS-Patch (route-scoped Block erweitern) (~2 Calls)
- 1 Smoke-Script schreiben (~3 Calls)
- 1 Smoke-Wiring-Test (~2 Calls)
- Targeted-Runs + Gates (~5 Calls)
- Codex-Review + Fixes (~3-5 Calls)
- Commit + Push + Deploy + Live-Smoke + Release-Doc + Playability-Gate (~8-10 Calls)

## Bekannte Risiken

- **Pitfall #30:** Wenn die neue Regel display/width/height/max-height setzt, aber die existierende pre-route-scoped Regel `min-height: 0` auf `.waldtanz-arenasstein__spielfeld` lässt, könnte das Spielfeld kollabieren. **Mitigation:** Spielfeld und Waldobjekte sind **verschiedene Siblings**, kein Cascade-Konflikt.
- **Pitfall #36 (Inter-Slice Contract-Shift):** Falls eine zukünftige Slice die `waldtanz-arenasstein__waldobjekte` Cap anfasst, muss sie die M3f-Regel respektieren. **Mitigation:** Cascade-Kommentar im CSS dokumentiert die Slice-ID.
- **Pitfall #41 (Live-Smoke Catch):** Falls die Pill-Reihe in Production unter dem Falz landet, ist die cap-Formel falsch. **Mitigation:** Smoke-Assert y < 720 + bottom ≤ 720.
