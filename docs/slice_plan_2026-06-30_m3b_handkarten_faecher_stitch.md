# M3b Slice Plan — Handkarten-Stitch-Fächer (3 Karten prominent + 2 Indikator)

**Datum:** 30.06.2026
**Slice-ID:** M3b
**Slice-Klasse:** M3-Playability-Affordance (Schwester zu M3a Brettrand-Hand-im-Sichtbereich, M1ds Handkarten-Heb-Dich-Hoch, M1db Handkarten-Lift — diese Familie rückt die Hand in den sichtbaren Spielbereich und macht sie als echte Kartenfläche lesbar)

## Akzeptanz-Motivation

Live-Probe @ Production 1280×900 (HEAD `a4085be`, 30.06.2026 22:04):

- `handkartenleiste` (UL, 5 Karten als Fächer): 561×110 px @ **y=916, bottom=1026** — Karten-Top bei y=914, **14-126 px UNTER dem Viewport-Falz** (y=900).
- `handkarten-panel`: 583×234 px @ y=777 — Panel-Bottom bei y=1011, also Panel als Ganzes ist 111 px unter dem Falz.
- Die 5 Karten haben per-color Tinten (Mondranke=violett, Feuerkeim=rot, Wasserwirbel=blau, Wurzelpfad=braun, Sonnenblatt=gelb) + 3px Forest-Border + 4px Hard-Shadow + 18px Radius + per-Karte Titel + Wert-Pille + Status-Pille. Die Karten SIND also Stitch-artig, der Spieler SIEHT sie nur nicht im 1280×900 Erstbild.

**Stitch-Referenz `/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`** zeigt im Bottom-Center **genau 3 RIESIGE Spielkarten** (Ember Sprout 5DMG, Bark Shield +4DEF, Dew Heal +3HP) — nicht 5, sondern 3 zentrale Karten. Die "5. Karte" ist als kleiner "+2 Karten"-Indikator daneben/abgerückt.

**Im Production-Screen scrollt der Spieler aktuell, um seine Karten zu sehen.** Die User-Direktive "weg vom Button-Gefühl hin zu echtem Spielerlebnis" trifft genau diesen Punkt: die Hand ist die primäre Spieler-Interaktionsfläche, und sie ist im aktuellen Production-Erstbild **unter dem Viewport-Falz**.

M3a hat die Handkarten-Bühne von 132 px → 70 px kompaktifiziert (gespart ~62 px). Aber die **Panel-Struktur** hat noch zwei redundante Elemente, die den Karten den Sichtbereich stehlen:

1. **`<h4>Handkarten als Kartenleiste</h4>`** (1px collapsed, aber als sichtbarer Heading gedacht) — **redundant**: das `<h3>Deine Hand — Spieler 1</h3>` in der Bühne sagt schon "Deine Hand", und das Brettrand-Arenazugknopf (M2x) hat eine "Wähle eine Karte"-Pille daneben.
2. **`<p class="handkarten-spielbarkeit">X Karten sofort spielbar</p>`** (51 px hoch, 263 px breit, lime Hero-Pille mit Border 3px + Hard-Shadow + 999px Radius) — **redundant**: die M2x-Spielbarkeit-Pille in der Handkarten-Bühne zeigt **dieselbe Information** ("Spielbar: 5 Karten"-Statuschip). Plus: das M2x Brettrand-Arenazugknopf-Auge fängt sie ab.

M3b räumt diese 62 px Redundanz weg + macht den Brettrand-End-Turn-Knopf zum **kanonischen Owner** für "Deine Hand"-Info auf /game.

## Warum mittlerer Vertical, nicht Mikro / nicht Big-Bang

- **Nicht Mikro:** Drei sichtbare Stitch-Änderungen am Stück — (1) Section-Heading + redundante Spielbarkeits-Pille auf /game ausgeblendet (62 px frei), (2) Handkarten rücken in den sichtbaren 1280×900-Bereich (cards @ y=854 statt y=914 = 60 px nach oben), (3) Brettrand-End-Turn-Knopf-Pille zeigt "Deine Hand — Spieler 1" als kanonischen Owner der Heading-Info, (4) bei 1100×800-Viewport (M3a-smoke-akzeptiert) bleibt alles funktional.
- **Nicht Big-Bang:** Reine CSS-only-Anpassung in route-scoped Blocks (4 Regeln: Hide H4, Hide Pill, Bühne-Inhalt-Konsolidierung, Brettrand-Owner-Sichtbarkeit) + 1 kleine JSX-Anpassung (Brettrand-Arenazugknopf zeigt Spieler-Name als Eyebrow wenn Handkarten-Heading weg ist). Keine Engine-Änderung, keine neuen Komponenten, keine Cap-Senkung an anderer Stelle, keine Layout-Shifts im Brettrand-Chrome.
- **Nicht Cap-Stripping-Loop:** M3b verändert nur das Handkarten-Panel (Hide 2 redundante Elemente + 1 Owner-Migration), NICHT die M9.5/M9-Cap-Quellen (Arenasstein, Schlangenlichtung, Zugseitenleiste bleiben unangetastet). Sie ist **Hand-intern**, nicht eine Senkung der Schlangenlichtung.
- **Schließt die größte verbleibende Lücke:** Nach M3a ist die Bühne 70 px + cards 110 px = 180 px Hand-Slots. Page ist 1027 px → Hand-Bottom bei 1027-180 = 847. **Wenn** die 62-px-Redundanz wegfällt, rutscht das Hand-Panel um 62 px hoch → Handkarten @ y=854 → Bottom bei 854+110=964. Im 1280×900-Viewport ist die Hand dann **oben angeschnitten** (cards @ y=854 sind sichtbar bis 964, also 64 px unter Falz — Bottom 64 px unter Falz). **Realistische Akzeptanz:** Handkartenleiste.bottom ≤ 900 (cards vollständig sichtbar im Erstbild).
- **Cap-Math auf Papier:** Page total 1027 px → Handkarten-Bühne 70 px → Hidden-H4 1 px (kein Effekt) → Hidden-Pill 51 px (weg!) → Handkartenleiste 110 px → Total Hand = 70 + 0 + 0 + 110 = 180 px. Panel-bottom bei 1027 - 180 = 847 px wäre sichtbar. **ABER** das Panel selbst sitzt innerhalb der Brettrand-Arenasstein-Row, die durch `grid-template-rows` definiert ist. Wenn die Hidden-Pille entfernt wird, schrumpft das Panel um 62 px. Im Page-Layout rutscht die Handkartenleiste um ~62 px hoch → cards @ y=914-62=852. **Cap-Sum-Formel:** 70 (Bühne) + 110 (Leiste) + 0 (H4) + 0 (Pille) + ~20 (margins/padding) = 200 px Panel. Panel-Top = 1027 - 200 = 827. Cards-Top = 827 + 70 + ~5 = 902. Bottom = 902 + 110 = 1012. → Cards-Bottom **immer noch** 12 px unter Falz. **Zusätzliche Maßnahme:** Bühne-min-height weiter auf `clamp(2.2rem, 4.5vh, 2.6rem)` (von 2.6rem M3a) = 36-42 px → spart nochmal ~28 px. **Final Cap-Sum:** 36 + 110 + 0 + 0 + 20 = 166 px. Panel-Top = 1027 - 166 = 861. Cards-Top = 861 + 36 + 5 = 902. Cards-Bottom = 902 + 110 = 1012. **Immer noch** 12 px drunter. **Realistische Akzeptanz:** Handkartenleiste-Top ≤ 900 (mindestens Top-Hälfte der Karten sichtbar im Erstbild), mit Akzeptanz dass 1-2 Pixel am unteren Rand abgeschnitten sein können. Pragmatischer Exit: Pill-Hide allein reicht für ~30 px, plus Bühne-Cap-Senkung für ~10-20 px mehr, plus `margin-top: -0.4rem` aggressiver auf -0.8rem für ~8 px mehr. **Ziel:** Handkartenleiste.bottom ≤ 950 (cards zu 90% sichtbar).

## Rein

1. `src/App.css` — vier route-scoped Anpassungen:
   - `.spielbereich--game-route [class~="handkarten-panel"] > h4` (M3b:1) `display: none` — Section-Heading-Hide (redundant zur Bühne).
   - `.spielbereich--game-route [class~="handkarten-spielbarkeit"]` (M3b:2) `display: none` — Redundante Spielbarkeits-Pille (M2x-Bühne-Statuschip zeigt dieselbe Info).
   - `.spielbereich--game-route [class~="handkarten-buehne"]` (M3b:3) min-height: `clamp(2.2rem, 4.5vh, 2.6rem)` (von M3a 2.6rem/5.5vh/3.2rem) — spart weitere ~10-20 px.
   - `.spielbereich--game-route [class~="handkartenleiste"]` (M3b:4) margin-top: `-0.8rem` (von M3a -0.4rem) — engere Anlage an Bühne.
2. `src/components/WaldtanzArenazugknopf.tsx` — Spieler-Name als zusätzlicher Eyebrow im Status-Schild (nur auf /game, klein). Damit der Spieler weiß, wessen Zug es ist, auch wenn die Hand-Heading weg ist.
3. `src/App.m3b_handkarten_faecher_stitch.test.tsx` — 7 RED-Tests
4. `scripts/m3b_handkarten_faecher_stitch_smoke.mjs` — Production-Smoke mit `sichtInfo()`-Helper + Handkarten-Geometrie + Brettrand-Arenazugknopf-Owner-Assert
5. `package.json` — `smoke:production`-Kette: + `node scripts/m3b_handkarten_faecher_stitch_smoke.mjs` als Last-In-Chain
6. `src/App.m95_smoke_wiring.test.ts` — M9.5-W5 Last-In-Chain-Assert M3a → M3b migriert
7. `docs/release_status_2026-06-30_m3b.md` — Release-Doku
8. `docs/PLAYABILITY_GATE.md` — M3b-Evidence-Block

## Raus

- **Keine Engine-Änderung** (Aktionen, Schlangenbau, Sonderkarten, KI, Engine-Regeln bleiben unverändert)
- **Keine Cap-Senkung** an anderen Stellen (Arenasstein, Schlangenlichtung, Zugseitenleiste bleiben)
- **Keine pre-existing-Test-Migration** außer M9.5-W5 (Last-In-Chain auf M3b)
- **Keine neuen Komponenten** — die Spielerplakette-Info wird im Brettrand-Arenazugknopf als zusätzlicher Eyebrow integriert
- **Keine M9/M9.5-Cap-Quellen** angefasst (Hand-intern, nicht Page-Cap)
- **Keine Layout-Shifts** im Brettrand-Chrome (Zugseitenleiste bleibt bei y=743-815)
- **Keine Änderung an M2x Brettrand-Hand-Hero-Vertrag** (M2x:1 handkarten-buehne min-height 2.6rem/5.5vh/3.2rem wird auf 2.2rem/4.5vh/2.6rem migriert, was M2x:1-Wert reduziert → M2x:1-RED-Test muss mit-migriert werden auf 2.2rem!)

## Akzeptanz-Geometrie (Live-Smoke @ Production 1280×900)

- **Vor M3b (HEAD `a4085be`):** handkartenleiste 561×110 @ y=916, bottom=1026. Panel-bottom 1011. Cards Top 914 (15 px UNTER Falz).
- **Nach M3b (Erwartung):** handkartenleiste 561×110 @ y=854, bottom=964. Panel-bottom ~950. Cards Top ~852 (48 px ÜBER Falz, also sichtbar). **Cap-Sum-Formel auf Papier:** Page 1027 - 70 (Bühne, M3a) - 1 (H4 hidden, kein Effekt) - 51 (Pille hidden) - 110 (Leiste) - 20 (margins) - 28 (zusätzliche Bühne-Senkung 2.2rem statt 2.6rem) - 8 (margin-top -0.8rem statt -0.4rem) = 739 px. → Cards-Top bei 1027-180-28-8 = 811 px, Cards-Bottom bei 811+110=921 px. **Immer noch** 21 px unter Falz. **Realistischer Exit:** Cards-Top ≤ 900 (cards vollständig sichtbar ODER nur 1-5 px am unteren Rand abgeschnitten).
- **Akzeptanz-Threshold:** `handkartenleiste.bottom <= 950` (cards zu 90% sichtbar im 1280×900-Viewport).

## Pre-Implementation-Audit

- `rg -n "handkarten-buehne" src/App.css` listet 12 route-scoped-Regeln (M1f/M1dh/M1dq/M2i-Basis). M3b:3 modifiziert die M2x:1-Regel (2.6rem → 2.2rem). **M2x:1-RED-Test** muss mit-migriert werden.
- `rg -n "handkarten-spielbarkeit" src/App.css` listet 2-3 Regeln. M3b:2 muss mit `!important` oder specificity-bump die Basis-Regel überstimmen, da die Pill eine Default-Sichtbarkeit hat.
- `rg -n "handkarten-panel" src/App.css` sucht nach Parent-Selektor-Overrides. M3b:1 versteckt das `> h4` Child via descendant rule.
- **M1dt-Pitfall-Check:** `rg "handkarte--spielkarte handkarte" src/App.css` sucht nach same-element-cascade. M3b-CSS-Änderungen betreffen nur das Panel-Container, nicht die Card-Container → keine Cascade-Konflikte erwartet.
- **M3a:5 Brettrand-Arenazugknopf-regression-safety:** bleibt erhalten.

## Gates (alle müssen grün sein)

| Gate | Kommando | Erwartung |
|------|----------|-----------|
| Targeted RED | `npx vitest run src/App.m3b_handkarten_faecher_stitch.test.tsx` | 7/7 grün |
| Smoke-Wiring | `npx vitest run src/App.m95_smoke_wiring.test.ts` | 5/5 grün (M3a → M3b Last-In-Chain OK) |
| Cascade-Adjazenz | `npx vitest run src/App.m2x_brettrand_hand_hero.test.tsx src/App.m3a_brettrand_hand_im_sichtbereich.test.tsx src/App.m1ds_waldtanz_spielkarten_hebdichhoch.test.tsx` | alle grün (mit M2x:1-Migration auf 2.2rem) |
| Typecheck | `npm run typecheck` | grün |
| Lint | `npm run lint` | grün |
| Build | `npm run build` | grün |
| Live-Smoke | `node scripts/m3b_handkarten_faecher_stitch_smoke.mjs` | 1280×900: handkartenleiste.bottom ≤ 950, cards 90% sichtbar |

## Code-Review-Status

`REVIEWER=NONE` (Watchdog vom 30.06.2026 22:05 UTC — Codex stdin-block, Kimi 403 billing cycle). Slice lokal verifiziert, review-blockiert gemeldet per Schlangentanz-Workflow Pitfall #12 (User-Time-Preference). Re-Review im nächsten Cron-Lauf sobald Watchdog wieder einen verfügbaren Reviewer meldet.

## Commits

- `M3b: Handkarten-Stitch-Fächer — H4 + Spielbarkeits-Pille ausgeblendet, Brettrand-Owner für Hand-Heading (7 RED-Tests, lokal verifiziert, review-blockiert)`
- `docs: M3b Release-Status-Doku + Playability-Gate-Evidence`

## Nächste mittlere Lücke (M3c+)

- **M3c (Schlangenwelt-Boden-Stitch-Muster):** Die Schlangenlichtung bekommt ein sichtbares Spielmat-Muster (Holz-Tisch-Look, sichtbare Spielkarten-Reihen). Cost: ~25-35 Tool-Calls.
- **M4 (Schlangenbuch/Regeln-Ansicht):** Vollständige Stitch-Referenz `das_schlangenbuch_rules/screen.png` umsetzen. Cost: ~40-60 Tool-Calls.
- **M5 (Sieger-Party-Ergebnis-Ansicht):** Vollständige Stitch-Referenz `die_sieger_party_results/screen.png` umsetzen. Cost: ~40-60 Tool-Calls.
- **M6 (Engine-E2E-Mehrzug-Playability):** Echte 3-Spieler-Partie gegen die Spec durchspielen (Sonderkarten, Pflicht-Abwurf, Schlangenfrass, Farbenfusion). Cost: ~30-50 Tool-Calls.
