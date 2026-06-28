# M5a — Sieger-Party als Stitch-Waldlichtung-Stitch-Hero

**Datum:** 28.06.2026
**Autor:** Hermes (autonomer Cron-Lauf, Job-ID `0cca22d2b825`)
**Slice-Klasse:** Stitch-Hero-Vertical-Slice (Schwester zu M2i Handkarten-Hero, M2g Brettrand-Questpille, M2v Brettrand-Zugknopf, M2u Hand-Drop-Glow).

## Ziel

Die `<SiegerParty>`-Komponente auf `zugphase === 'Spielende'` zu einem
echten Stitch-Waldlichtung-Forest-Party-Screen transformieren: grosser
Kronen-Portrait der Gewinner-Schlange, sonniger Waldlichtung-Backdrop
mit Sunset-Gradient + Konfetti + Ballons, grosszuegige gelbe
"Finale Punktetafel"-Holzplakette mit Stat-Pills, und ein
primaerer "Nochmal spielen"-Knopf der visuell die Stitch-Hero-Form
trifft. Damit schliesst sich der sichtbare Spielfluss:
Lobby (`/`) → Spiel (`/game`) → Sieger-Party (zurueck auf `/`
nach Spielende oder auf `/game` fuer Neustart).

## Scope-Groesse

Mittlerer Vertical-Slice: ~5 Files, ~250-350 Zeilen Diff, 1 neue
Komponente-Hero-Sub-Tree, ~8-10 RED-Tests, 1 Live-Smoke.

**Warum kein Mikro-Slice (Affordance-Politur)?** Der User-Feedback ist
explizit "weg vom Click-Simulator hin zu echtem Spielerlebnis" — und
die Sieger-Party ist der emotionale Hoehepunkt einer jeden Partie. Ein
Mikro-Slice (z.B. "Pille gruener machen") liefert hier KEINEN
sichtbaren Spielfortschritt.

**Warum kein Big-Bang?** Die Sieger-Party ist self-contained: Sie wird
nur gerendert wenn `zustand.zugphase === 'Spielende'`, hat keine
Engine-Interaktion, keine Layout-Auswirkungen auf `/game`, keine
State-Mutation. Reine visuelle + leichte Markup-Umstrukturierung in
1 Komponente + 1 CSS-Block. Regression-Risiko niedrig.

## Stitch-Referenz

`/tmp/schlangentanz_stitch_design/stitch/die_sieger_party_results/`
- `code.html`: vollstaendige Stitch-Vorlage mit Custom-Animations
- `screen.png`: Forest-Sunset-Backdrop, grosser Kronen-Schlangen-
  Portrait, "Final Score"-Plaque mit Length/Moves-Pills, Play-Again-
  Knopf, Konfetti + Ballons

## Rein

1. **Sunset-Forest-Backdrop** auf `.sieger-party`:
   - `background: linear-gradient(180deg, #ffbcaa 0%, #fecb00 35%, #b1e8a4 100%)`
     (orange → gelb → lime-gruen, wie Stitch-Sunset-Sky)
   - Optional: subtiler radialer Vignette-Overlay mit `radial-gradient(ellipse, transparent 60%, rgba(6,57,7,0.18) 100%)`
2. **Titel "Schlangentanz!"** wird zur Stitch-Hero-Headline:
   - `font-family: var(--st-font-headline)` (Rubik), `font-size: clamp(3.5rem, 8vw, 6rem)`
   - `color: var(--st-color-secondary-container)` (#fecb00)
   - `-webkit-text-stroke: 3px var(--st-color-border-strong)` (#063907)
   - `text-shadow: 0 6px 0 var(--st-color-border-strong)` (Hard-Drop-Shadow)
   - `animation: party-wiggle 2s ease-in-out infinite` (Stitch-wiggle)
3. **Gewinner-Portrait groesser** (mind. 256px → bis 320px auf Desktop):
   - `.sieger-party__portrait` aspect-ratio 1/1, `width: clamp(13rem, 28vw, 20rem)`
   - Korona-Glow ring (secondary-container radial-gradient + blur, pulse)
   - Krone oben links, Pokal unten rechts (Stitch-Position)
   - Schlange mittig (kann Emoji bleiben, oder Portraet-Block)
4. **Leaderboard-Badge** als Stitch-Hero-Floating-Element:
   - Neues Element `.sieger-party__leaderboard-badge`
   - `position: absolute; bottom: -0.8rem; right: -0.8rem`
   - 3.2rem × 3.2rem, `border-radius: 999px`, `background: var(--st-color-tertiary-container)` (#ffbcaa coral)
   - `border: var(--st-border-width-chunky) solid var(--st-color-border-strong)` (3px)
   - `box-shadow: 0 4px 0 var(--st-color-border-strong)` (hard-shadow-sm)
   - `transform: rotate(12deg)`, animation wiggle
   - Inhalt: `social_leaderboard` Icon oder 🏆 (emoji), aria-hidden
5. **Finale-Punktetafel als Stitch-Holzplakette** (`.sieger-party__scorekarte`):
   - `background: var(--st-color-secondary-container)` (#fecb00)
   - `border: var(--st-border-width-chunky) solid var(--st-color-border-strong)` (3px)
   - `border-radius: 1.75rem`
   - `box-shadow: 0 8px 0 var(--st-color-border-strong)` (groesserer hard-shadow)
   - `transform: rotate(-2deg)` (Stitch-tilt), hover: rotate(0deg) transition
   - 4 dekorative "Naegel" an den Ecken (kleine inverse-surface Dots)
   - Heading "Finale Punktetafel" zentriert mit text-shadow
6. **Stat-Pills** (Laenge/Bewegungen/Farbgruppen/Aufgaben) als Stitch-Pillen:
   - Hintergrund: `rgba(236, 255, 227, 0.95)` (surface-hell)
   - `border: var(--st-border-width-chunky) solid var(--st-color-border-strong)` (3px)
   - `border-radius: 999px`
   - `box-shadow: 3px 3px 0 var(--st-color-border-strong)`
   - Wert rechts: `border-radius: 999px`, `background: var(--st-color-primary-container)` (#a4de02 lime)
     - `font-family: var(--st-font-headline)`, `font-size: clamp(1.1rem, 1.6vw, 1.6rem)`
     - `font-weight: 900`, `padding: 0.15rem 0.85rem`
7. **"Nochmal spielen"-Knopf als Stitch-Hero-Button**:
   - `background: var(--st-color-primary-container)` (#a4de02 lime)
   - `border: var(--st-border-width-chunky) solid var(--st-color-border-strong)` (3px)
   - `box-shadow: 0 8px 0 var(--st-color-border-strong)` (groesser)
   - `border-radius: 999px`, `padding: 0.85rem 2.5rem`
   - `font-family: var(--st-font-headline)`, `font-size: clamp(1.2rem, 1.8vw, 1.6rem)`
   - Hover: `transform: scale(1.05)` mit `box-shadow: 0 10px 0`
   - Active: `transform: translateY(8px); box-shadow: 0 0 0` (Stitch-press)
   - Replay-Icon (`replay` Material-Symbol oder 🔄 Emoji) als Prefix
8. **Konfetti + Ballons JS-Generation** (analog zu Stitch-Code):
   - `useEffect` in `SiegerParty` der nach Mount 30 Konfetti-Span-
     Elemente + 8 Ballon-Span-Elemente mit randomisierten Positionen
     und Animation-Delays an `.sieger-party__konfetti` und
     `.sieger-party__ballons` anhaengt.
   - Konfetti-Animation: `fall ${dur}s linear ${delay}s infinite`
   - Ballon-Animation: `float-up ${dur}s ease-in-out ${delay}s infinite`
   - **Cleanup-Pflicht:** `useEffect`-Cleanup entfernt die generierten
     Elemente bei Unmount, damit React-StrictMode-Doppel-Mount kein
     Leak verursacht.
9. **Reduced-Motion Override** (`@media (prefers-reduced-motion: reduce)`):
   - Alle Animationen (party-wiggle, party-float, party-pulse, fall,
     float-up) → `animation: none`
   - Statische Werte bleiben sichtbar (Wiggle bleibt in Endposition
     via transform-Override)

## Raus

- KEINE Aenderung an `App.tsx` (SiegerParty-Integration bleibt)
- KEINE Aenderung am Engine-Scoring (nur Visualisierung)
- KEINE Aenderung an Lobby (`/`) oder Game-Chrome (`/game`)
- KEINE neuen Komponenten-Dateien (alles in `SiegerParty.tsx` +
  `App.css`)
- KEIN neuer Route-Handler
- KEINE Engine- oder Persistence-Aenderung
- KEIN neuer Zustand-State
- KEINE JSX-Reorder, die andere Tests bricht

## RED-Tests (8 Tests)

Datei: `src/App.m5a_sieger_party_stitch_forest_hero.test.tsx`

1. RED-1: Sunset-Backdrop. `expect(cssBlock('.sieger-party')).toMatch(/linear-gradient.*ffbcaa/)` (orange → gelb → lime Hex-Trippel oder `var(--st-color-tertiary-container)` + `var(--st-color-secondary-container)` + `var(--st-color-surface-dim)`)
2. RED-2: Hero-Headline-Title. `expect(screen.getByRole('heading', { level: 2, name: 'Schlangentanz!' })).toHaveClass('sieger-party__kopf')` und Heading computed font-size >= 3.5rem (skip in jsdom — font-size returns NaN; use presence check on class instead)
3. RED-3: Wiggle-Animation. `expect(cssBlock('.sieger-party__kopf h2')).toMatch(/animation.*party-wiggle/)`
4. RED-4: Gewinner-Portrait-Groesse. `expect(cssBlock('.sieger-party__portrait')).toMatch(/width:\s*clamp\(13rem/)` (size assertion, nicht pixel-perfect)
5. RED-5: Leaderboard-Badge. `expect(party.querySelector('.sieger-party__leaderboard-badge')).not.toBeNull()` und `expect(cssBlock('.sieger-party__leaderboard-badge')).toMatch(/var\(--st-color-tertiary-container\)/)`
6. RED-6: Holzplakette-Scorekarte. `expect(cssBlock('.sieger-party__scorekarte')).toMatch(/var\(--st-color-secondary-container\)/)` + `box-shadow:\s*0 8px 0`
7. RED-7: Stat-Pills mit Stitch-Hero-Styling. `expect(cssBlock('.sieger-party__stats div')).toMatch(/border:\s*3px solid/)` + `border-radius:\s*999px` + die Wert-Pille `.sieger-party__scorewert` mit `var(--st-color-primary-container)`
8. RED-8: Nochmal-spielen-Button als Stitch-Hero. `expect(button).toHaveClass('sieger-party__neustart')` und `expect(cssBlock('.sieger-party__neustart')).toMatch(/var\(--st-color-primary-container\)/)` + `box-shadow:\s*0 8px 0` + Hover mit `scale(1.05)` + Active mit `translateY\(8px\)`
9. RED-9: Reduced-Motion Override (9. Test als Bonus). `appCss.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.sieger-party__kopf h2[\s\S]*animation:\s*none/)` — beweist dass alle Animations sauber abgeschaltet werden
10. RED-10: Konfetti/Ballons-Lifecycle. Mit `mount + unmount + remount` zeigt die zweite Instance keine doppelten Konfetti-Span-Kinder (Cleanup-Pflicht für useEffect)

## Test-Strategie

- jsdom rendert keine computed CSS values, also alle Stil-Asserts
  gehen via `cssBlock(sel)`-Helper (siehe M1cx Pattern + M1dt Pitfall
  #8 — keine `\.klasse { property: value }`-Literal-Form in
  Cascade-Kommentaren).
- DOM-Asserts: Test rendert `<App initialZustand={spielendeZustand()} />`
  mit einem deterministischen End-State (Hero mit `finalePunktzahl` =
  42, Laenge = 7, Sieger = "Du"), prueft Vorhandensein der
  neuen Klassen + Korrektheit der Inhalte.
- Konfetti-Animation-Tests NICHT in jsdom (kein Animations-Layer).
  Nur DOM-Anzahl + Cleanup.

## Smoke

Datei: `scripts/m5a_sieger_party_stitch_forest_hero_smoke.mjs`

Akzeptanz:
- `BASE_URL` = production
- Konstruiere `?fixture=spielende&sieger=Du&punkte=42` oder
  injiziere `__schlangentanzFixture` (M2d-Pattern)
- Akzeptanz-Kriterien:
  1. `.sieger-party` sichtbar (display != none, boundingBox > 100x100)
  2. `.sieger-party` Background-Image ist Gradient mit mindestens
     2 Color-Stops (`getComputedStyle().backgroundImage` matched
     `/linear-gradient\(/)
  3. `.sieger-party__portrait` hat width >= 200px und aspect-ratio 1/1
  4. `.sieger-party__leaderboard-badge` sichtbar (position absolute,
     bottom < 0 ODER right < 0 = floating outside portrait)
  5. `.sieger-party__scorekarte` hat `transform: matrix(...)` mit
     rotate(-2deg) (negativer X-Wert der matrix obere-linke Ecke)
  6. `.sieger-party__neustart` sichtbar, `box-shadow` startet mit
     `rgb(6, 57, 7)` (hard-shadow-sm)
  7. `.sieger-party__konfetti` enthaelt mindestens 20 generierte
     `.sieger-party__konfetti-stueck`-Elemente (JS-Generation
     wirksam)
  8. `consoleErrors.length == 0`, `pageErrors.length == 0`

## Pre-Implementation-Audit (M2i-Pattern)

VOR dem ersten CSS-Edit:
- `grep -n "sieger-party" src/App.css | wc -l` → zaehlen wie viele
  existierende Regeln; meine Aenderungen koennen als ADDITIVE
  (Eigenschaften ergaenzen) oder OVERRIDE (Werte ersetzen) erfolgen.
- `grep -n "var(--st-color-primary-fixed\|var(--st-color-surface-container-high\|var(--st-color-surface-container-lowest" src/App.css` → sicherstellen dass kein M1k-Verbot-Token
  versehentlich verwendet wird.
- `rg "sieger-party" src/App.*.test.tsx` → alle Pre-Existing-Tests
  listen, die `sieger-party`-Klassen oder Inhalte assertieren.
  Diese Tests muessen weiterhin gruen bleiben.

## RED-Test-Plan (8 RED-Tests + 1 Bonus)

| RED | Scope | Beweist |
|-----|-------|---------|
| 1   | Sunset-Backdrop | linear-gradient orange-gelb-lime |
| 2   | Hero-Headline | role=heading + className |
| 3   | Wiggle-Animation | `animation: party-wiggle ...` |
| 4   | Portrait-Groesse | `width: clamp(13rem...)` |
| 5   | Leaderboard-Badge | DOM + tertiary-container Background |
| 6   | Holzplakette | secondary-container + 8px shadow |
| 7   | Stat-Pills + Wert-Pille | 999px Border-Radius + primary-container |
| 8   | Nochmal-Button | primary-container + 8px shadow + hover scale + active translateY |
| 9   | Reduced-Motion | @media-Block mit animation:none |
| 10  | Konfetti-Cleanup | Unmount entfernt generierte Kinder |

## Adjacent-Slice-Audit

Vor Commit das volle Audit-Skript laufen:
```bash
grep -rn "sieger-party\|Spielende\|finalePunktzahl\|gewinnerErgebnis" src/ | grep -v "node_modules" | grep -v ".test."
```
Plus:
```bash
ls src/App.*sieger*.test.tsx src/App.*spielende*.test.tsx 2>/dev/null
```
Plus:
```bash
ls src/App.m*.test.tsx | tail -20   # adjacent Brettrand/Slice-Tests
```

## Reihenfolge

1. RED-Tests in `src/App.m5a_sieger_party_stitch_forest_hero.test.tsx`
   schreiben (8 RED + 2 Bonus, alle rot)
2. CSS-Block in `App.css` (additive Properties auf bestehende
   Selektoren + neue Sub-Klassen)
3. JSX-Erweiterung in `SiegerParty.tsx` (Leaderboard-Badge +
   Konfetti/Ballons-Generation via useEffect mit Cleanup)
4. Targeted-Run auf M5a + Adjacent-Slice-Tests
5. Typecheck + Lint + Build
6. Full-Suite-Test (Background, da >350 Files)
7. Kimi-Review (Background, non-blocking)
8. Commit + Push + Deploy via `bash ~/.hermes/skills/schlangentanz-workflow/templates/deploy_prod.sh`
9. Post-Deploy Live-Smoke gegen production URL
10. Release-Status-Doku `docs/release_status_2026-06-28_m5a.md`

## Budget-Schaetzung

| Schritt | Tool-Calls |
|---------|-----------|
| RED-Tests schreiben | 1 |
| CSS-Block + JSX | 2-3 |
| Targeted-Run | 1 |
| Typecheck + Lint + Build | 3 |
| Full-Suite (background) | 1 (launch) + 1 (wait+read) |
| Kimi-Review (background) | 1 (launch) + 1 (poll) |
| Commit + Push + Deploy + Smoke | 4 |
| Release-Status MD | 1 |
| **Total** | **~16 Tool-Calls** |

Vergleich: M2v hat ~18 Calls verbraucht, M2u ~22, M2r ~30.
M5a ist mit ~16 unter Budget, gute Reserve fuer Iterationen.

## Kimi-Brief-Template (Reviewer)

```
/review M5a Sieger-Party Stitch-Hero auf Spielende

Scope: src/components/SiegerParty.tsx, src/App.css (Sieger-Party-
Block, neu + additiv), src/App.m5a_sieger_party_stitch_forest_hero.test.tsx
(8+2 RED-Tests)

Authority: /tmp/schlangentanz_stitch_design/stitch/die_sieger_party_results/code.html

Untracked Files:
- src/App.m5a_sieger_party_stitch_forest_hero.test.tsx
- scripts/m5a_sieger_party_stitch_forest_hero_smoke.mjs (geplant)

Ziele:
- Sunset-Forest-Backdrop statt nackter Hintergrund
- Stitch-Hero-Headline mit wiggle + hard-shadow
- Groesseres Gewinner-Portrait mit Kronen-Glow
- Leaderboard-Badge als floating Stitch-Hero
- Holzplakette-Scorekarte mit Stat-Pills
- Nochmal-spielen als Stitch-Hero-Button
- Konfetti/Ballons als useEffect-Lifecycle mit Cleanup
- Reduced-Motion Override

Do not edit files. Nur BLOCKERS und NON-BLOCKERS.

Wichtig: Pre-Existing-Tests duerfen NICHT rot werden. Liste
explizit welche adjacent Tests du erwartest dass sie brechen
koennten und ob sie es tun.
```

## Disclosure-Plan

In `docs/release_status_2026-06-28_m5a.md`:
- `REVIEWER=kimi-cli` (Codex NOT_FUNCTIONAL, Kimi OK per Watchdog)
- Kimi-Blockers als Tabelle mit Hermes-Resolution
- Live-Smoke-Resultate (BBox, computed-style, Konfetti-Count)
- Spielerische Wirkung: "Das Ende einer Partie fuehlt sich jetzt an
  wie ein echter Waldlichtung-Sieg mit Feuerwerk, nicht wie eine
  Debug-Liste mit Punktzahlen."
- Naechste Luecke: M5b (Mehrzug-E2E-Playthrough-Smoke gegen
  Production) — Production-Playwright der 5-10 echte Turns
  durchspielt und die spec-Playability-Gate beweist.

## Pitfall-Anker (relevant fuer M5a)

- **M1dt #8 — `\.klasse { property: value }`-Literal in CSS-Kommentaren
  bricht `cssBlock`-Helper.** Vor jedem Cascade-erklaerenden Kommentar
  pruefen, dass keine literal-Form `.sieger-party__foo { ... }`
  vorkommt. Statt "die spaetere `.sieger-party__neustart { ... }`-Regel"
  lieber "die spaetere neustart-Regel mit hover scale(1.05)".
- **M1dt #6 — Cascade-Override durch spaetere single-class rule.** Wenn
  ein Property-Drift riskiert (z.B. `box-shadow` 0 7px → 0 8px),
  doubled-class Bump einsetzen: `.sieger-party__scorekarte.sieger-party__scorekarte { ... }`
  fuer guaranteed specificity 0,2,0. RED-Test muss den SELCTOR
  assertieren, nicht nur den Body (Pflicht-RED-6/7/8 Pattern).
- **M1cv — Reduced-motion Override Pflicht.** Ohne den
  `@media (prefers-reduced-motion: reduce)`-Block flippen Accessibility-
  Audits rot.
- **M2d — useEffect-Cleanup Pflicht fuer generierte DOM-Kinder.**
  Konfetti-Span-Elemente muessen bei Unmount entfernt werden, sonst
  React-StrictMode-Doppel-Mount erzeugt 60 statt 30 Konfetti.
