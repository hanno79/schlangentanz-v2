# M3a Slice Plan — Handkarten im Sichtbereich / Brettrand-Hand-Stitch-Hero

**Datum:** 30.06.2026
**Slice-ID:** M3a
**Slice-Klasse:** M3-Playability-Affordance (Schwester zu M1ds Handkarten-Heb-Dich-Hoch, M2i Handkarten-Hero, M2x Brettrand-Hand-Hero — diese Familie rückt die Hand ins Zentrum des Spielerlebnisses)

## Akzeptanz-Motivation

Live-Probe @ Production 1280x900 (HEAD `b09d346`, 30.06.2026 18:32):

- `handkartenleiste` (5 Handkarten): **561×110 px @ y=985** — **85 px UNTER dem Viewport-Falz** (y=900). Spieler scrollt, um die Karten zu sehen.
- `handkarten-buehne` (Status-Reihe der Hand): 561×132 px @ y=784 — sichtbar, aber unnötig hoch (3 Status-Chips + Spielerplakette + Handsteg + Aktions-Buttons).
- `waldtanz-arenazug` (End-Turn-Knopf): 211×144 px @ y=822 — sichtbar, prominent.
- `waldtanz-schlangenlichtung`: 974×640 px @ y=477 — großes Spielbrett, gut.
- `spielbereich--game-route` Seite: **1218×1027 px** — 127 px höher als der Viewport, daher scrollt der Spieler.

Im Production-Screenshot (1600x1280) sind die Handkarten als kleine Text-Labels am unteren Rand sichtbar: "Mondranke, Feuerk..., Wasserwirbel, Sonnenblatt, ...ranke" — nicht als echte Spielkarten mit Farbflächen, Symbolen und Werte-Plaketten, sondern als microtypische Liste.

**Stitch-Referenz `/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`** zeigt im Bottom-Center 3 RIESIGE Spielkarten (Ember Sprout 5DMG, Bark Shield +4DEF, Dew Heal +3HP) mit:
- Großen farbigen Flächen (rot, lime-grün, gold)
- Großem Symbol (🔥, 🛡, 💧)
- Großem Karten-Titel
- Werte-Plakette als coral/orange Pille unten in der Karte

**Die User-Direktive "weg vom Button-geklickt-/Debuglisten-Gefühl hin zu echtem Spielerlebnis"** trifft genau diesen Punkt: die Hand ist die primäre Spieler-Interaktionsfläche, und sie ist im aktuellen Production-Screen eine 5-zeilige Text-Liste am unteren Rand. Ein Spieler, der /game zum ersten Mal öffnet, sieht seine Handkarten nicht.

## Warum mittlerer Vertical, nicht Mikro / nicht Big-Bang

- **Nicht Mikro:** Drei sichtbare Stitch-Änderungen am Stück — (1) Handkarten-Bühne wird kompakter (132 px → ~50-60 px), (2) Spielerplakette auf /game wird in den Brettrand-End-Turn-Knopf integriert (kein doppelter Owner), (3) Handkarten-Kartenleiste rückt um ~85 px nach oben in den sichtbaren Viewport, (4) Handkarten-Karten werden in 1280×900 voll sichtbar, (5) bei <1280 px Viewport bleibt der bestehende Fallback (Scroll).
- **Nicht Big-Bang:** Reine CSS-only-Anpassung in route-scoped Blocks + 1 kleine JSX-Anpassung (Spielerplakette-Span in Brettrand-Arenazugknopf), keine Engine-Änderung, keine neuen Komponenten, keine Cap-Senkung an anderer Stelle.
- **Nicht Cap-Stripping-Loop:** Diese Slice verändert nur die Hand-Eigenen Höhen-Budgets, NICHT die M9.5/M9-Cap-Quellen (Arenasstein, Schlangenlichtung, Zugseitenleiste bleiben unangetastet). Sie ist **Hand-intern**, nicht eine Senkung der Schlangenlichtung.
- **Schließt die größte sichtbare Lücke:** Im aktuellen 1280×900-Screenshot ist die Hand nicht sichtbar. Diese Slice löst genau das.

## Rein

1. `src/App.css` — drei route-scoped Anpassungen am `.handkarten-buehne`-Block:
   - `.handkarten-buehne` (M3a:1) min-height: `clamp(2.6rem, 5.5vh, 3.2rem)` (vorher `clamp(4.5rem, 9vh, 5.5rem)`) — spart ~24 px bei 900 vh.
   - `.handkarten-buehne__spielerplakette` (M3a:2) padding: `0.18rem 0.55rem` (vorher `0.35rem 0.65rem`) + bottom: `0rem` (vorher `0.1rem`) + font-size bleibt.
   - `.handkarten-buehne__statuschip--spielbar` (M3a:3) top: `0.25rem` + right: `0.55rem` + font-size 0.7rem.
   - `.handkartenleiste` (M3a:4) margin-top: `-0.4rem` (eng an Bühne anlegen) + max-height bleibt auto.
2. `src/components/WaldtanzArenazugknopf.tsx` — Spieler-Name als zusätzlicher Eyebrow im Status-Schild (nur auf /game, klein). Damit der Spieler weiß, wessen Zug es ist, auch wenn die Handkarten-Bühne-Spielerplakette kompakter wird.
3. `src/App.m3a_brettrand_hand_im_sichtbereich.test.tsx` — 7 RED-Tests
4. `scripts/m3a_brettrand_hand_im_sichtbereich_smoke.mjs` — Production-Smoke mit `sichtInfo()`-Helper + Handkarten-Geometrie
5. `package.json` — `smoke:production`-Kette: + `node scripts/m3a_brettrand_hand_im_sichtbereich_smoke.mjs` als Last-In-Chain
6. `src/App.m95_smoke_wiring.test.ts` — M9.5-W5 Last-In-Chain-Assert M2z → M3a migriert
7. `docs/release_status_2026-06-30_m3a.md` — Release-Doku
8. `docs/PLAYABILITY_GATE.md` — M3a-Evidence-Block

## Raus

- **Keine Engine-Änderung** (Aktionen, Schlangenbau, Sonderkarten, KI, Engine-Regeln bleiben unverändert)
- **Keine Cap-Senkung** an anderen Stellen (Arenasstein, Schlangenlichtung, Handkarten-Kartenleiste bleiben)
- **Keine pre-existing-Test-Migration** außer M9.5-W5 (Last-In-Chain auf M3a)
- **Keine neuen Komponenten** — die Spielerplakette-Info wird im Brettrand-Arenazugknopf als zusätzlicher Eyebrow integriert (oder ganz weggelassen, wenn die Spielerplakette links noch sichtbar ist)
- **Keine M9/M9.5-Cap-Quellen** angefasst (Hand-intern, nicht Page-Cap)

## Akzeptanz-Geometrie (Live-Smoke @ Production 1280x900)

- **Vor M3a:** `handkartenleiste` 561×110 @ y=985 (85 px UNTER Viewport-Falz).
- **Nach M3a:** `handkartenleiste` ~561×110 @ y=873-885 (10-25 px ÜBER dem Falz oder knapp darunter, je nach Bühne-Kompaktierung). Sichtbar im 1280×900-Viewport.
- **Cap-Math:** Page total 1027 px → 1027 - 24 (Bühne-min-height) - 4 (Padding) - 8 (Status-Chip-Reposition) = 991 px → Handkartenleiste rückt 85 px hoch → @ y=900 ist die Handkartenleiste sichtbar.

## Pre-Implementation-Audit

- `rg -n "handkarten-buehne" src/App.css` listet 12 route-scoped-Regeln (M1f/M1dh/M1dq/M2i-Basis). M3a modifiziert nur die 3 oben genannten. **Specificity-Hierarchie:** alle M3a-Regeln sind 0,3,0 (`.spielbereich--game-route [class~="handkarten-buehne"]`), später im File als die existierenden = later-source-wins.
- `rg -n "handkartenleiste" src/App.css` listet ~15 Regeln für `.handkartenleiste` (M1ds/M2i/Tiefenfächer). M3a:4 ergänzt nur `margin-top`, nicht `max-height` oder `transform` — der M1ds-Lift bleibt unverändert.

## Gates (alle müssen grün sein)

| Gate | Kommando | Erwartung |
|------|----------|-----------|
| Targeted RED | `npx vitest run src/App.m3a_brettrand_hand_im_sichtbereich.test.tsx` | 7/7 grün |
| Smoke-Wiring | `npx vitest run src/App.m95_smoke_wiring.test.ts` | 5/5 grün (M2z → M3a Last-In-Chain OK) |
| Cascade-Adjazenz | `npx vitest run src/App.m1f_waldtanz_handbuehne.test.tsx src/App.m1ds_waldtanz_spielkarten_hebdichhoch.test.tsx` | alle grün |
| Typecheck | `npm run typecheck` | grün |
| Lint | `npm run lint` | grün |
| Build | `npm run build` | grün |
| Live-Smoke | `node scripts/m3a_brettrand_hand_im_sichtbereich_smoke.mjs` | 1280×900: handkartenleiste.bottom ≤ 900 |

## Code-Review-Status

`REVIEWER=NONE` (Watchdog vom 30.06.2026 18:30 UTC — Codex stdin-block, Kimi 403 billing cycle). Slice lokal verifiziert, review-blockiert gemeldet per Schlangentanz-Workflow Pitfall #12 (User-Time-Preference). Re-Review im nächsten Cron-Lauf sobald Watchdog wieder einen verfügbaren Reviewer meldet.

## Commits

- `M3a: Handkarten im Sichtbereich — Hand-Bühne kompakt, Handkarten-Kartenleiste in 1280x900 sichtbar (7 RED-Tests, lokal verifiziert, review-blockiert)`
- `docs: M3a Release-Status-Doku + Playability-Gate-Evidence`

## Nächste mittlere Lücke (M3b+)

- **M3b (Brettrand-Stitch-Spielkarten-Fächer):** Die 5 Handkarten werden in einen prominenten 3-Karten-Fächer verwandelt (Stitch-Ref-Stil) — 3 große Karten zentral, 2 zusätzliche als kleiner "+2 Karten"-Indikator. Cost: ~30-40 Tool-Calls.
- **M3c (Spielwelt-Boden-Stitch-Muster):** Die Schlangenlichtung bekommt ein sichtbares Spielmat-Muster (Holz-Tisch-Look, sichtbare Spielkarten-Reihen). Cost: ~25-35 Tool-Calls.
- **M4 (Schlangenbuch/Regeln-Ansicht):** Vollständige Stitch-Referenz `das_schlangenbuch_rules/screen.png` umsetzen. Cost: ~40-60 Tool-Calls.
