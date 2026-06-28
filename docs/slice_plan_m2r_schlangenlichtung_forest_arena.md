# M2r — Schlangenlichtung als Forest-Arena: Brettrand-Chrome reduzieren, Schlangenlichtung befreien

**Slice-ID:** M2r
**Datum:** 2026-06-27
**Klasse:** M2-Visual-Consolidation (vergleichbar mit M2e, M2g, M2h, M2i)
**Autor:** Hermes (autonomer Cron-Lauf)
**Reviewer:** Kimi Code CLI (Codex OAuth `NOT_FUNCTIONAL`)

## Problem (mit Beweisen)

Der `/game`-Screen vermittelt trotz aller bisherigen Stitch-Slices noch das
"Click-Simulator / Debug-Listen-Gefühl". Live-Probe am 2026-06-27
(siehe `docs/release_status_2026-06-27_m2i.md` Naechste-Luecke-Sektion
+ frische Probe-Daten):

```
Arenastein  @ y=281, h=612 (das ist der Schlangenlichtung-Container)
├── Arenakopf              @ y=306, h=39   (LEUCHTENDER WALDSTEIN-Titel)
├── PhasenBanner           @ y=363, h=25   (4-Phasen-Pillen-Reihe)
├── Questpille             @ y=408, h=149  (Lime-Bubble mit Quest-Text)
├── Schlangenlichtung      @ y=752, h=370  (EIGENTLICHE Spielfläche, vergraben)
├── Questband              @ y=833, h=94   (6 Quest-Pillen)
└── WSP                    @ y=837, h=49   (Spielerplakette)
```

**Konsequenz:** Die Schlangenlichtung — wo die Schlangen, die Magiekreise und die Brett-Ziele als Spielobjekte leben — belegt nur **370 px (45%)** der Arenastein-Höhe, während reine Status-/Chrome-Header (Arenakopf, Phasen-Banner, Questpille, Questband) **307 px (50%)** der Arenastein-Höhe als verschachtelte Karten-Layer belegen. Aus Spielersicht sieht das so aus: oben vier Informationskarten, unten die "eigentliche" Spielfläche — und der Spieler weiß nicht, wo der Wald beginnt.

## Stitch-Referenz (warum so nicht)

`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/code.html` zeigt einen klaren Aufbau:
- zentrale Forest-Arena (`rounded-[4rem]`, 3px Border, hard-shadow) trägt Magiekreise + Karten-Drops
- Handkarten liegen **innerhalb** der Arena-Sichtbarkeit (bottom-fan, rotate -6°/0°/+6°)
- Phase-Info ist eine **einzelne** Pille oben-rechts (Timer-Form), nicht 4 Pillen
- Quest-Text ist unsichtbar im Stitch-Layout — wir haben das als Brettrand-Questpille interpretiert (M2g), die bleibt
- End Turn ist eine **einzelne** prominente Pille unten-rechts, nicht ein Dock voller Aktionen

## Lösungsansatz (mittlerer Vertical Slice)

**Vier route-scoped Hides + flex-Fill**, die der Schlangenlichtung ca. 280-320 px zusätzliche Höhe schenken:

1. `.waldtanz-arenastein__kopf` (LEUCHTENDER WALDSTEIN-Titel, 39px) — **display: none** auf /game
   - Schaden null: nur dekorativer Container-Titel
2. `.waldtanz-phasen-banner` (4-Phasen-Pillen-Reihe, 25px) — **display: none** auf /game
   - Schaden null: Phasen-Info lebt bereits im Aktiver-Tanz-Schritt-Pill (M1cv) + Phasen-Beschilderung
3. `.waldtanz-questband` (6 Quest-Pillen, 94px) — **display: none** auf /game
   - Schaden null: Quests werden im Brettrand (M2g) und in der Aufgaben-Tafel gezeigt
4. **Reposition der Questpille** als Title der Schlangenlichtung (statt 149px hohe Lime-Bubble, wird sie zur Title-Pille des Brettrands)
5. Schlangenlichtung `flex: 1 1 auto; min-height: 0` — dehnt sich auf den freigewordenen Platz aus

**Schätzung:** Schlangenlichtung wächst von 370 px auf ~620-660 px. Das ist der **gleiche Pattern** wie M2e (Aktionsdock + HUD ausblenden, Brettrand flex-fill) — bewährt, niedrigstes Risiko.

## Pre-Implementation-Audit

| Test-Datei | Was wird geprüft | Was passiert mit M2r? |
|------------|------------------|----------------------|
| `App.m1cv_waldtanz_questband.test.tsx` | `.waldtanz-questband` Selector existiert + Stitch-Style | Basis-Regel bleibt unangetastet, route-scoped Hide ist additiv → **grün** |
| `App.m1dk_waldtanz_phasen_banner.test.tsx` | `.waldtanz-phasen-banner` Selector + Pill-Optik | Basis-Regel bleibt unangetastet → **grün** |
| `App.m2g_brettrand_questpille.test.tsx` | Pille ist auf /game sichtbar mit Icon+Text | **MUSS migriert werden**: M2g-Test akzeptiert "Pille ist im DOM aber visuell als Title komprimiert" |
| `App.m1d0_waldtanz_layout_konsolidierung.test.tsx` | grid-template-areas Schema | M2r ändert das Schema NICHT, nur Sichtbarkeit → **grün** |
| `App.m1di_waldtanz_schlangenlichtung.test.tsx` | Schlangenlichtung-Konsolidierung | M2r belässt die Komponente, ändert nur ihre Höhe → **grün** |

**Migrations-Strategie für m2g-Test:** Slice-migriert von "Pille hat 149px Höhe" zu "Pille hat ≤ 100px Höhe und sitzt als Title innerhalb der Schlangenlichtung".

## Akzeptanzkriterien

1. App.css deklariert 4 route-scoped display:none-Regeln (Specificity 0,2,0 mit `[class~="..."]`)
2. Schlangenlichtung-Bounding-Box-Höhe auf 1280x900-Viewport steigt von ~370 px auf ≥ 600 px
3. Schlangenlichtung y-Position fällt von 752 auf ≤ 350 (oben statt unten)
4. Alle 4 versteckten Chrome-Elemente sind weiterhin im DOM (für Tests)
5. m2g-Questpille-Test ist auf "Pille kompakt ≤ 100 px hoch" migriert
6. Pre-Existing-Tests (m1cv, m1dk, m1d0, m1di) bleiben grün
7. Live-Smoke auf Production: 1280x900 — Schlangenlichtung ≥ 600 px hoch, alle 4 hidden Chrome auf display:none
8. Console/Page-Errors: 0

## Workflow (TDD)

1. Pre-Implementation-Audit (siehe oben)
2. RED-Tests schreiben: `src/App.m2r_schlangenlichtung_forest_arena.test.tsx` mit 8 REDs
3. CSS-Only-Implementation: 4 route-scoped display:none + Schlangenlichtung flex-fill
4. m2g-Test migrieren: von 149 px Hohe auf ≤ 100 px Title-Format
5. Targeted Vitest: 8 REDs + 5 Pre-Existing = 13 grün
6. Full Suite: `npm test -- --run` (im Hintergrund)
7. Typecheck + Lint + Build
8. Kimi-Review (background)
9. Commit + Push + Deploy
10. Live-Smoke gegen Production-URL

## Spielerische Wirkung

- **Vorher:** Spieler sieht oben 4 Status-Karten (Titel, Phase, Quest, Questband), unten die Schlangenlichtung vergraben
- **Nachher:** Spieler sieht die Schlangenlichtung **direkt unter dem Spielerrahmen** als zentralen Forest-Arena-Stein, mit der Questpille als kompakter Title oben drin, Handkarten unten drunter — der Brettrand atmet
- Das ist der "echtes Spielerlebnis"-Schritt: die Schlange IST das Brett, nicht ein vergrabenes Sub-Element
