# M2e — Schlangenlichtung-Brettwald-Befreiung (2026-06-27)

## Slice-Identitaet

- **Slice-ID:** M2e
- **Slice-Klasse:** Route-scoped visual consolidation (CSS-only, no engine change, no React-tree change, no new components)
- **Status:** RED-Phase gestartet
- **Reviewer:** Kimi Code CLI 0.18.x (k2p7) — Codex CLI `NOT_FUNCTIONAL` (Watchdog 2026-06-27 13:01 UTC)
- **Stitch-Bezug:** `/game` entwickelt sich vom fragmentierten "Click-Simulator"-Collage (Spielstatus-Sidebar mit 1.Karte ziehen / 2.Karten ausspielen / 3.Aufgaben prüfen / 4.Zug abschließen / 5.Spiel beendet + bottom-Wertung + bottom-Material + bottom-Entwicklungsdaten) zur klaren **Stitch-Waldarena** (zentrale Schlangenlichtung + HandkartenPanel + Spielerplakette + Brettrand-End-Turn + Gegnerlichtung + Phasen-Banner). Siehe `/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`.

## Begründung: warum mittel statt mikro

Der aktuelle `/game`-Screen hat 1258px Hoehe (bei 900px Viewport) und damit **zwei Bildschirmseiten** voller Information, bevor der Spieler ueberhaupt das Brett sieht. Die linke `.info-panel--spielstatus`-Sidebar rendert 5 grosse `Waldtanz-Zugfortschritt`-Cards (1.Karte ziehen → 2.Karten ausspielen → 3.Aufgaben pruefen → 4.Zug abschliessen → 5.Spiel beendet), die untere `.waldtanz-hud` rendert **drei** full-width Panels (Wertung, MaterialUndAufgaben, Spieleruebersicht). Beide sind redundant:

- Die Phase-Information lebt schon im `.waldtanz-phasen-banner` am Brettrand
- Der Material-Status lebt schon in der Spielerplakette (M1cx)
- Die Wertung lebt schon in der Spielerplakette (Punkte prominent) und in der Gegnerplakette
- Die Aufgaben-Information lebt schon in der `.waldtanz-aufgabentafel` (Waldtaschen)
- Die Spieleruebersicht lebt schon in der Spielerplakette + Gegnerplakette + Top-Kartenfaecher

Die **M1d3-Konsolidierung** (Status-HUD-reconciliert) hat das auf der **Default-Lobby-Route** bereits weggeschnitten — auf `/game` sind die Panels aber immer noch da. M2e schliesst diese Luecke **route-scoped** (nur `/game`).

Visueller Netto-Effekt: Schlangenlichtung wird von einer 3-Spalten-Konkurrenz (Tischkarte + Magiekreise + Questband + Brettschritt-Stempel) im 971px-Arena-Bereich zur **einzigen visuellen Buehne** auf /game. HandkartenPanel sitzt ungehindert darunter. End-Turn-Pille (M1at) und Spielerplakette (M1cx) bleiben prominent.

## Rein

- **`src/App.css`** (Route-scoped Hide-Regeln, ~30 Zeilen):
  - `.spielbereich--game-route .info-panel--spielstatus { display: none }` — die linke Zugfortschritt-Sidebar weg
  - `.spielbereich--game-route .waldtanz-hud { display: none }` — die untere Drei-Panel-Reihe weg
  - **Positiv-Gegenstueck**: `.spielbereich--game-route .spielbrett--waldtanz` bekommt `flex: 1 1 auto` und `min-height` Anpassung, damit der zentrale Brettschritt-Bereich auf die freigewordene Hoehe ausgedehnt wird
  - Reduzierter Bottom-Margin auf der Brettschritt-Section, damit HandkartenPanel nicht ueber den Fold rutscht
- **`src/App.m2e_schlangenlichtung_brettwald_befreiung.test.tsx`** (NEU, 6 RED-Tests):
  - RED-1: `.spielbereich--game-route .info-panel--spielstatus { display: none }` CSS-Source-Assert
  - RED-2: `.spielbereich--game-route .waldtanz-hud { display: none }` CSS-Source-Assert
  - RED-3: Auf `/` (Lobby-Default) bleibt die `.info-panel--spielstatus` Regel **nicht aktiv** (Route-Scoping verifiziert)
  - RED-4: Auf `/` (Lobby-Default) bleibt `.waldtanz-hud` **sichtbar** (Route-Scoping verifiziert)
  - RED-5: `.spielbrett--waldtanz` bekommt `flex: 1 1 auto` (damit der Brettschritt-Bereich die freie Hoehe einnimmt)
  - RED-6: Die Schlangenlichtung-Region bleibt auf /game gerendert (Konsolidierung loescht sie nicht versehentlich)
- **`scripts/m2e_schlangenlichtung_brettwald_befreiung_smoke.mjs`** (NEU, ~80 Zeilen): Live-Smoke
  - Startet das Spiel, klickt Startfaehrte
  - Misst `getBoundingClientRect()` von `.spielbrett--waldtanz`, `.info-panel--spielstatus`, `.waldtanz-hud`, `.handkartenleiste`
  - Akzeptanz: `.info-panel--spielstatus` und `.waldtanz-hud` haben `height === 0` ODER `display === none`; `.spielbrett--waldtanz.height / viewport.height >= 0.55` (Brettschritt nimmt den freigewordenen Platz)
- **`package.json`**: M2e-Smoke in `smoke:production`-Kette verdrahtet (zwischen M2d und M3b)
- **`docs/release_status_2026-06-27_m2e.md`** (NEU)

## Raus (was bewusst NICHT angefasst wird)

- **Engine**: keine Aenderung an `src/engine/*`
- **React-Tree**: keine Aenderung an `src/App.tsx` JSX-Struktur
- **Komponenten**: keine Aenderung an SpielstatusPanel, WertungPanel, MaterialUndAufgabenPanel, SpieleruebersichtPanel — sie bleiben im JSX und auf `/` (Lobby-Default) voll funktional
- **M2a-Positive-Acceptance-Layout-Fix**: der in M2d dokumentierte "M2a Positiv wartet auf Layout-Fix"-Punkt bleibt unveraendert. M2e ist die Voraussetzung dafuer (mehr Hoehe fuer die Schlangenlichtung = mehr Platz fuer Sonderkarten-Zielauswahl), aber die Acceptance-Anpassung am M2a-Smoke ist ein **separater M2f-Slice**.
- **Andere game-route-scoping-Rules**: die bestehenden ~80+ `.spielbereich--game-route [class~="..."]` Regeln (M1cj, M1dm, M1dn, M1do, M1dp, M1ds, M1dt, M1cz, M1cw, M1cv, M1ct, ...) bleiben unveraendert.

## Warum kein Big-Bang?

- ~30 Zeilen CSS in **einer** Datei (`App.css`)
- 6 RED-Tests, alle deterministisch, alle CSS-Source- oder DOM-Asserts
- 1 Browser-Smoke, ~80 Zeilen
- 0 Engine-Aenderungen, 0 React-Tree-Aenderungen, 0 neue Komponenten, 0 Layout-Arithmetik (kein Move von Elementen, nur Display-Display-Display)
- 1 Route-Bedingung (`istGameRoute` = `.spielbereich--game-route`)

## Akzeptanzkriterien

1. RED-Tests 6/6 gruen
2. `npm test -- --run` full-suite: 0 neue roten Tests (vorherige 27 pre-existing failures bleiben +0)
3. `npm run typecheck` gruen
4. `npm run lint` gruen
5. `npm run build` gruen
6. Kimi-Review akzeptiert (keine neuen BLOCKERS)
7. Live-Smoke: Brettschritt-Bereich sichtbar mit Hoehe >= 55% Viewport auf /game; `.info-panel--spielstatus` und `.waldtanz-hud` haben `display: none`
8. Vercel-Production-Deploy, Live-Smoke auf `https://schlangentanz-v2.vercel.app/game`

## Kimi-Blocker-Disclosure (geplant)

M2e ist ein reiner CSS-Consolidation-Slice. Erwartbare Kimi-Findings:
- Cascade-Override: bestehende `.info-panel--spielstatus { grid-area: status }` Regel koennte mit `display: none` in Konflikt stehen. Fix: Display-Override mit specificity-Bump (`.spielbereich--game-route .info-panel--spielstatus` = 0,2,0 > 0,1,0).
- Clip-Cascade: hidden sidebar mit `position:absolute` koennte Sibling-Tests brechen. Fix: nur `display: none`, kein `visibility: hidden`.
- Stale-Assert: Bestehende M1d3-Tests koennten die Sichtbarkeit der Status-Panels auf /game assertieren. Fix: Pre-Implementation-Audit, dann test-by-test Migrations im selben Slice.
