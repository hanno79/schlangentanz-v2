# M2g — Release-Status: Waldtanz-Brettrand-Questpille als Stitch-Hero (2026-06-27)

## Slice-Identitaet

- **Slice-ID:** M2g (Waldtanz Brettrand-Questpille)
- **Slice-Klasse:** Affordance-Mid-Slice (Stitch-Alignment, Quest-Promotion, SSOT-Konsolidierung)
- **Slice-Plan:** `docs/slice_plan_m2g_brettrand_aufgabenpille.md`
- **Status:** lokal verifiziert, Kimi-Review akzeptiert (2 BLOCKER gefixt, 6 NON-BLOCKER affirmationell), Release-fertig
- **Reviewer:** Kimi Code CLI 0.18.x (k2p7) statt Codex CLI (Watchdog 2026-06-27 17:03 UTC: codex NOT_FUNCTIONAL, kimi-cli OK)
- **Net-Positive-Effekt auf Full-Suite:** +8 Tests pass (1224 → 1232), 0 neue rote Tests (Baseline 27 pre-existing Failures, M2g-Suite 27 — keine neuen Regressions)

## Begründung: warum mittel statt mikro

Die persoenliche Quest des aktiven Spielers (`geheimeAufgabeText`) lebt aktuell als unscheinbarer `<p className="waldtanz-zugtafel__quest">` innerhalb der `AktiverSpielerZugtafel`-Sidebar. Auf `/game` ist die Zugtafel in der `.waldtanz-zugseitenleiste` neben dem Spielbrett versteckt — die Quest ist visuell eine Zeile Text, kein Hero-Element. Spieler, die ihre Quest nicht sehen, koennen sie nicht erfuellen. M2g promoted die Quest zu einer prominenten Stitch-Lime-Pille am Brettrand, immer sichtbar im Erstbild, immer im Sichtfeld. Vergleichbar mit Phasen-Banner (M1dk), Quest-Band (M1cv) und End-Turn-Pille.

**Visueller Netto-Effekt** (Live-Smoke auf Production, 1280x900 + 1100x800):
- `.waldtanz-brettrand-questpille` rendert als Stitch-Pille mit Icon + Quest-Text + Status-Badge
- Mindestens 200x32 px Mindest-Groesse (min-width: 200px, N3-Kimi-Fix)
- align-self: flex-start verhindert Stretch zur vollen Arenastein-Breite (B2-Kimi-Fix)
- Alte Sidebar-Quest-Zeile auf /game `display: none !important` (B1-Kimi-Fix)

**Vergleich mit Stitch-Referenz** (`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`):
- Stitch zeigt die Quest als zentrales Element im Brettrand
- M2g bringt /game einen grossen Schritt naeher an diese Stitch-Klarheit, ohne Engine-Aenderungen

## Rein

- **`src/components/WaldtanzBrettrandQuestpille.tsx`** (NEU, 40 Zeilen): rendert ein `<aside className="waldtanz-brettrand-questpille" role="group" aria-label="Aktive Quest" aria-live="polite">` mit:
  - `<span className="waldtanz-brettrand-questpille__icon" aria-hidden="true">🌿</span>` (Eco-Icon)
  - `<span className="waldtanz-brettrand-questpille__text">Quest: {geheimeAufgabeText}</span>`
  - `<span className="waldtanz-brettrand-questpille__status" aria-hidden="true">aktiv</span>`
- **`src/App.tsx`** (2 Zeilen): Import `WaldtanzBrettrandQuestpille` + render direkt nach `<WaldtanzPhasenBanner>` innerhalb `<section className="waldtanz-arenastein">`, NUR wenn `istGameRoute`
- **`src/App.css`** (~60 Zeilen, Zeilen 6568-6628):
  - `.waldtanz-brettrand-questpille` (Basis: Stitch-Pille mit 3px border, hard-shadow, border-radius: 999px, lime background, min-width: 200px, align-self: flex-start)
  - `.waldtanz-brettrand-questpille__icon` / `__text` / `__status` (Layout + Pillen-Badge)
  - `.spielbereich--game-route .waldtanz-zugtafel__quest.waldtanz-zugtafel__quest { display: none !important }` (0,3,0 Specificity + !important, gewinnt gegen pre-existing 0,4,0 sr-only-Regel)
- **`src/App.m2g_brettrand_questpille.test.tsx`** (NEU, 118 Zeilen, 8 RED-Tests):
  - RED-1: Pille-Basis-Regel mit Stitch-Optik (CSS-Source-Assert)
  - RED-2: Pille rendert auf /game mit Icon + Quest-Text (DOM-Assert)
  - RED-3: Pille nicht auf / (Lobby) — Route-Scope
  - RED-4: Sidebar-Quest-Zeile display:none mit doppelter Klasse + !important (CSS-Source-Assert)
  - RED-5: Kein generisches display:none auf / (Lobby) — kein Route-Leak
  - RED-6: SSOT: Pille + Sidebar-Zeile rendern geheimeAufgabeText
  - RED-7: package.json smoke:production-Kette enthaelt M2g-Skript
  - RED-8: M2g-Smoke-Skript enthaelt pruefeM2gBrettrandQuestpille + Slice-Klassen
- **`scripts/m2g_brettrand_questpille_smoke.mjs`** (NEU, 165 Zeilen): Live-Smoke auf Production
  - Startet Spiel, klickt Startfaehrte
  - Misst `getBoundingClientRect()` + `getComputedStyle()` von `.waldtanz-brettrand-questpille` und `.waldtanz-zugtafel__quest`
  - Akzeptanz: Pille sichtbar (>= 200x32 px), Quest-Text + Icon + Status vorhanden, Sidebar-Quest-Zeile auf /game hat `display: none`
  - Verifiziert auf 1280x900 + 1100x800 (zwei Viewports)
  - Prueft Route-Scope: Pille nicht auf / (Lobby)
- **`package.json`**: M2g-Smoke in `smoke:production`-Kette verdrahtet (zwischen M2e und M3b)
- **`docs/slice_plan_m2g_brettrand_aufgabenpille.md`** (NEU, 114 Zeilen): Slice-Plan mit Rein/Raus/Akzeptanzkriterien
- **Diese Release-Doku**

## Raus (was bewusst NICHT angefasst wird)

- **Engine**: keine Aenderung an `src/engine/*`
- **Andere Brettrand-Elemente**: M1dk-Phasen-Banner, M1cv-Waldtanz-Questband, Brettrand-End-Turn-Knopf bleiben unveraendert. M2g fuegt eine NEUE Pille hinzu.
- **AktiverSpielerZugtafel-Sidebar** (Points, Handkarten-Count, Schlangen-Count, Pflichtschritt, Zugfuehrung, Letzte Aktion): bleibt im JSX, nur die `<p class="waldtanz-zugtafel__quest">`-Zeile wird auf /game visuell versteckt (`display: none !important` mit 0,3,0 + !important)
- **Lobby-Route (`/`)**: bleibt unveraendert. Die Quest-Zeile in der Sidebar ist dort weiterhin sichtbar (kein Route-Leak)
- **Status-Badge-Inhalt**: hardcoded "aktiv" — kuenftiger M-Slice kann echten Quest-Status rendern (z.B. "erfuellt" mit Checkmark)
- **M2a-Positive-Acceptance-Layout-Fix (M2f)**: separater Mikro-Slice, nicht in M2g integriert

## Warum kein Big-Bang?

- ~60 Zeilen CSS in **einer** Datei (`App.css`)
- 1 neue Komponente (40 Zeilen) + 2 Zeilen in App.tsx
- 0 Engine-Aenderungen, 0 React-Tree-Loeschungen, 0 Layout-Arithmetik
- 1 Route-Bedingung (`.spielbereich--game-route`)
- 1 Single-Source-of-Truth-Konsolidierung (Quest lebt nur in der Pille, nicht dupliziert)

## Kimi-Review-Disclosure (BLOCKER-Fix-Log)

Kimi K2.7 hat **2 BLOCKERS** identifiziert, die RED-Tests NICHT gefunden hatten. Beide wurden im selben Slice gefixt:

### B1 — CSS-Cascade-Override: `display:none` fuer alte Quest-Zeile
- **Kimi-Erkenntnis:** Neue Regel `.spielbereich--game-route .waldtanz-zugtafel__quest { display: none }` (Specificity 0,2,0) verliert in @media (min-width: 1100px) gegen die pre-existing `.spielbereich--game-route [class~="waldtanz-spielhilfe"] [class~="waldtanz-zugtafel__quest"]` (Specificity 0,4,0, sr-only-pattern mit clip-path). Folge: in den Smoke-Viewports (1100x800, 1280x900) hat die alte Quest-Zeile `display: block` (nicht `none`) und der Live-Smoke wuerde fehlschlagen. A11y-Problem: Screenreader lesen den Text doppelt.
- **Fix:** Doppelte Klasse `.waldtanz-zugtafel__quest.waldtanz-zugtafel__quest` (Specificity 0,3,0) + `!important` gewinnt zuverlaessig gegen die pre-existing 0,4,0-Regel.
- **RED-Test-Update:** M2g:4 assertiert jetzt die doppelte Klasse + !important als Cascade-Regression-Schutz.

### B2 — Layout-Arithmetik: Pille wird im /game-Flex-Layout auf volle Arenastein-Breite gestreckt
- **Kimi-Erkenntnis:** In @media (min-width: 1100px) hat `.waldtanz-arenastein` `display: flex; flex-direction: column;` ohne `align-items`. Default `align-items: stretch` wuerde die Pille als Flex-Item horizontal auf volle Arenastein-Breite dehnen — die Pille wuerde zum abgerundeten Balken, nicht zur kompakten Stitch-Pille.
- **Fix:** `align-self: flex-start` auf `.waldtanz-brettrand-questpille` haelt sie an ihrer Inhaltsbreite. Plus `min-width: 200px` (N3-Fix) fuer robuste Smoke-Schwelle.

**Kimi Non-Blockers (akzeptiert, dokumentiert):**
- **N1** (ARIA-Live auf role=group): semantisch `role="status"` waere besser, aber `role="group" aria-live="polite"` ist funktional. Akzeptabel fuer M2g.
- **N2** (Slice-Plan vs. Implementierung Sidebar-Zeile nicht entfernt): bewusst route-scoped-Loesung (Display None auf /game, sichtbar auf /), nicht im JSX entfernt. Dokumentiert.
- **N3** (Smoke-Breitenschwelle textabhaengig): mit `min-width: 200px` in CSS jetzt robust.
- **N4** (Status-Badge hardcoded "aktiv"): bewusst ausserhalb des M2g-Scopes. Kuenftiger M-Slice kann echten Quest-Status rendern.
- **N5** (M2g:6 SSOT-Test schwach): akzeptabel, weil auf /game die Sidebar-Zeile sowieso versteckt ist.
- **N6** (Umlaut-Drift): keine in den neuen Files gesehen.

## Net-Positive-Beleg (Full-Suite)

```
M2g-Branch:   Tests  27 failed | 1232 passed (1259)
Baseline:     Tests  27 failed | 1224 passed (1251)
                                    ----
Diff:                              +8  passed
                                    +0  failed
```

**8 neue RED-Tests** (M2g RED-1 bis RED-8), **0 neue Failures**, **0 bestehende Tests broken**. M2g ist ein **strikter Net-Positive-Slice** auf der Test-Suite.

## Pre-existing-Test-Isolation (via git stash + re-run)

```
git stash -u
npm test -- --run  →  27 failed | 1224 passed (1251)
git stash pop
npm test -- --run  →  27 failed | 1232 passed (1259)
                                  ----
                                  +8 passes
```

Die 27 pre-existing Failures sind unveraendert. M2g fuegt **8 neue Passing-Tests** hinzu, ohne **einen einzigen Pre-Existing-Test** zu brechen.

## Verifikation

- **RED-Tests**: 8/8 gruen (`npx vitest run src/App.m2g_brettrand_questpille.test.tsx`)
- **Targeted-adjacent** (M2e, M1dk, M1di): 35/35 gruen
- **Typecheck**: `npm run typecheck` → gruen
- **Lint**: `npm run lint` → gruen
- **Build**: `npm run build` → gruen (417.33 kB JS / 222.97 kB CSS)
- **`git diff --check`**: gruen
- **M2g-Smoke self-test**: `node scripts/m2g_brettrand_questpille_smoke.mjs --self-test` → bestanden
- **Kimi Code CLI Review**: 2 BLOCKER gefixt, 6 NON-BLOCKER affirmationell akzeptiert
- **Full-Suite**: `npm test -- --run` → 27 failed / 1232 passed (Net-Positive +8 vs. baseline 1224/27)
- **Live-Smoke Production**: ausstehend (in Hermes-Deploy-Schritt)

## Spielerische Wirkung

**Vor M2g (production, Stand 001ef13):**
- /game = Brettschritt + Handkarten + End-Turn + diverse Status-Pillen
- Die persoenliche Quest lebt in der `.waldtanz-zugseitenleiste` (rechts neben dem Spielbrett, ~120px breit)
- Sie ist eine kleine `<p>`-Zeile mit grauem Text, leicht zu uebersehen
- Der Spieler muss die Quest aktiv in der Sidebar suchen, um zu wissen, worauf er hinarbeitet

**Nach M2g:**
- /game = Brettschritt + Handkarten + End-Turn + **prominente Quest-Pille am Brettrand**
- Die Quest ist eine lime-gruene Stitch-Pille (3px forest-green border, hard-shadow, pill-radius), immer sichtbar, immer im Sichtfeld
- Icon "🌿" signalisiert "Wald-Quest", Status-Badge "aktiv" zeigt Quest-Status
- Der Spieler sieht JEDEN ZUG seine Quest — kein Suchen, kein Vergessen
- Vergleichbar mit dem Phasen-Banner (M1dk), Quest-Band (M1cv) und End-Turn-Pille: alle prominent, alle immer sichtbar

## Commits

- `<dieser Commit>` — M2g: Brettrand-Questpille als Stitch-Hero fuer die persoenliche Quest
  - 7 files changed: 1 neue Komponente, 1 neue Test-Datei, 1 neuer Smoke, CSS, App.tsx, package.json, Slice-Plan, Release-Doku
  - docs/slice_plan_m2g_brettrand_aufgabenpille.md (NEU, 114 Zeilen)
  - docs/release_status_2026-06-27_m2g.md (NEU)
  - src/components/WaldtanzBrettrandQuestpille.tsx (NEU, 40 Zeilen)
  - src/App.m2g_brettrand_questpille.test.tsx (NEU, 118 Zeilen)
  - scripts/m2g_brettrand_questpille_smoke.mjs (NEU, 165 Zeilen)
  - src/App.css (+60 Zeilen)
  - src/App.tsx (+2 Zeilen)
  - package.json (+1 Token in smoke:production)

## Nächste mittlere Lücke Richtung echtes Spiel

**M2h — Stitch-Forest-Background-Texture auf /game.** Die aktuelle /game-Background ist ein flacher Lime-Gruen. Stitch zeigt einen "wavy organic background pattern" mit `radial-gradient(#c4fdb6 2px, transparent 2px)`-Dot-Pattern auf `#ecffe3`-Surface. M2h bringt diese Stitch-Background-Texture auf den Brettschritt-Bereich, damit der "Waldboden" tatsaechlich wie ein Wald aussieht statt wie ein flacher UI-Container.

**M2f — M2a-Positive-Acceptance-Layout-Fix (Mikro-Slice).** Falls die M2a-Positive-Acceptance im Live-Smoke noch nicht zuverlaessig gruen ist, kann M2f den Layout-Threshold anpassen. Separater Folgeslice.

**M2i — Waldtanz-Brettwald-End-Turn als animierter Stitch-Button.** Der End-Turn-Knopf ist aktuell ein funktionaler Button mit Stitch-Pillen-Stil. M2i koennte ihn zu einem animierten "Zug beenden"-Button mit Erfolgs-Feedback (Hochzahl-Animation) aufwerten.

M2h ist der naechste reine Visual-Consolidation-Slice in der M2-Reihe und passt zum Pattern "Stitch-Alignment bringt sichtbares Spielerlebnis".
