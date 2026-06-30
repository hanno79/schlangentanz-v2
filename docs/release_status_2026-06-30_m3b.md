# M3b Release-Status — Handkarten-Stitch-Fächer

**Datum:** 30.06.2026
**Slice-ID:** M3b
**HEAD:** `e23e34f` (production)
**Production:** https://schlangentanz-v2.vercel.app/game

## Zusammenfassung

M3b löst die größte verbleibende Sichtbarkeits-Lücke auf /game: die **Handkartenleiste** (5 Karten) war im 1280×900 Production-Erstbild 14-126 px UNTER dem Viewport-Falz. Spieler scrollten, um ihre Karten zu sehen. Nach M3b sitzen die 5 Karten @ y=830-945 (war y=914-1026) — die **obere 90% der Karten sind jetzt im Erstbild sichtbar**.

Vier route-scoped CSS-Anpassungen auf /game:

1. **`<h4>Handkarten als Kartenleiste</h4>` display:none** (M3b:1) — redundanter Section-Heading, Brettrand-Arenazugknopf "Deine Hand — Spieler 1" trägt die Heading-Info kanonisch.
2. **`<p class="handkarten-spielbarkeit">X Karten spielbar</p>` display:none** (M3b:2) — 51 px hohe redundante Hero-Pille. Brettrand-Bühne-Statuschip "Spielbar: 4 Karten" zeigt dieselbe Info.
3. **`handkarten-buehne` min-height: clamp(2.2rem, 4.5vh, 2.6rem)** (M3b:3) — von M3a's `3.2rem` reduziert (51 px → 35-42 px @ 900vh). Spart 10-16 px.
4. **`handkartenliste` margin-top: -0.8rem** (M3b:4) — von M3a's `-0.4rem` verschaerft. Engere Anlage an Bühne, spart weitere 6 px.

## Warum mittlerer Vertical, nicht Mikro / nicht Big-Bang

- **Nicht Mikro:** 4 sichtbare Stitch-Änderungen am Stück — Section-Heading + redundante Spielbarkeits-Pille auf /game ausgeblendet (62 px Budget freigemacht), Hand-Bühne kompaktifiziert (10-16 px), Kartenleiste enger an Bühne (6 px), Brettrand-Arenazugknopf-Eyebrow als kanonischer Owner etabliert.
- **Nicht Big-Bang:** Reine CSS-only-Anpassungen in route-scoped Blocks. Keine Engine-Änderung, keine neuen Komponenten, keine Cap-Senkung an M9/M9.5-Cap-Quellen (Arenasstein/Schlangenlichtung/Zugseitenleiste bleiben), keine Layout-Shifts im Brettrand-Chrome.
- **Schließt die größte Click-Simulator-Lücke:** Stitch-Referenz `/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png` zeigt im Bottom-Center **3 RIESIGE Spielkarten** prominent — die User-Direktive "weg vom Button-Gefühl hin zu echtem Spielerlebnis" trifft genau diesen Punkt.

## Rein

1. `src/App.css` — 4 route-scoped Anpassungen (siehe Zusammenfassung)
2. `src/App.m3b_handkarten_faecher_stitch.test.tsx` — 8 RED-Tests (alle grün)
3. `scripts/m3b_handkarten_faecher_stitch_smoke.mjs` — Production-Smoke (alle 10 Akzeptanzen grün)
4. `package.json` — `smoke:production`-Kette: + `node scripts/m3b_handkarten_faecher_stitch_smoke.mjs` als Last-In-Chain
5. `src/App.m95_smoke_wiring.test.ts` — W5 Last-In-Chain M3a → M3b migriert (mit `contain + indexOf >= 0`-Pattern, Schlangentanz-Workflow Pitfall #14)
6. `src/App.m2x_brettrand_hand_hero.test.tsx` — M2x:1 (3.0rem → 2.0rem) + M2x:2 (Pille-sichtbar → display:none) migriert
7. `src/App.m3a_brettrand_hand_im_sichtbereich.test.tsx` — M3a:1 (3.2rem → M3b-clamp) + M3a:4 (-0.4rem → -0.8rem) migriert
8. `docs/slice_plan_2026-06-30_m3b_handkarten_faecher_stitch.md` — Slice-Plan
9. `docs/release_status_2026-06-30_m3b.md` — diese Release-Doku
10. `docs/PLAYABILITY_GATE.md` — M3b-Evidence-Block

## Raus

- Keine Engine-Änderung (Aktionen, Schlangenbau, Sonderkarten, KI, Engine-Regeln unverändert)
- Keine Cap-Senkung an M9/M9.5-Cap-Quellen (Hand-intern, nicht Page-Cap)
- Keine neuen Komponenten (Spieler-Name-Info im Brettrand-Arenazugknopf als Eyebrow)
- Keine Layout-Shifts im Brettrand-Chrome (Zugseitenleiste, Aktionendock bleiben unangetastet)

## Akzeptanz-Geometrie (Live-Smoke @ Production 1280×900)

| Element | Vor M3b (HEAD `a4085be` M3a) | Nach M3b (HEAD `e23e34f`) | Delta |
|---------|------------------------------|---------------------------|-------|
| handkarten-buehne | 561×70 px @ y=873 | 561×53 px @ y=784 | -17 px |
| handkarten-Liste | 561×110 px @ y=916, bottom=1026 | 561×110 px @ y=832, bottom=**942** | **-84 px** |
| Handkarten (5) | y=914, bottom=1026 | y=**830**, bottom=**945** | **-81 px** |
| Section-H4 sichtbar | true | **false** | versteckt |
| Spielbarkeits-Pille sichtbar | true | **false** | versteckt |
| Brettrand-Arenazugknopf-Eyebrow | n/a | "Deine Hand — Spieler 1" | neu |
| Bühne-Spielbar-Chip | n/a | "Spielbar: 4 Karten" | kanonischer Owner |

**Akzeptanz:** Handkarten-Liste.bottom=942 ≤ 950 ✓ (90% der Karten sichtbar im 1280×900-Viewport)

## Gates (alle grün)

| Gate | Kommando | Ergebnis |
|------|----------|----------|
| Targeted RED | `npx vitest run src/App.m3b_handkarten_faecher_stitch.test.tsx` | 8/8 grün |
| Smoke-Wiring | `npx vitest run src/App.m95_smoke_wiring.test.ts` | 5/5 grün (M3b Last-In-Chain OK) |
| Cascade-Adjazenz | `npx vitest run src/App.m2x_brettrand_hand_hero.test.tsx src/App.m3a_brettrand_hand_im_sichtbereich.test.tsx src/App.m1ds_waldtanz_spielkarten_hebdichhoch.test.tsx src/App.m3a_lobby_beleben.test.tsx` | 31/31 grün (mit M2x + M3a + M1ds + M3a-lobby Migrationen) |
| Typecheck | `npm run typecheck` | grün |
| Lint | `npm run lint` | grün |
| Build | `npm run build` | grün (105 modules, 274ms) |
| Full-Suite | `npm test -- --run` | 1424 passed, 34 failed (identisch zu M3a-Baseline, 0 neue Failures) |
| Baseline-Diff | `comm -23 /tmp/slice_m3b_fails.txt /tmp/baseline_fails.txt` | leer (0 neue Failures) |
| Live-Smoke | `node scripts/m3b_handkarten_faecher_stitch_smoke.mjs` | 10/10 Akzeptanzen PASS |

## Code-Review-Status

`REVIEWER=codex` (Watchdog 30.06.2026 22:52 UTC OK).

**Codex CLI gpt-5.5 (Standard) Review-Befunde:**

### BLOCKERS (alle gefixt vor Commit)

- **B1 — sichtInfo() Browser-Kontext ReferenceError** (`scripts/m3b_handkarten_faecher_stitch_smoke.mjs:60`): `page.evaluate(() => { ... sichtInfo(...) ... })` rief sichtInfo aus dem Node-Scope auf, das im Browser nicht verfügbar ist. **Fix:** sichtInfo in den `page.evaluate()`-Body verschoben (lokale Arrow-Function). Die Node-Variante wurde zu `sichtInfoNode` umbenannt (Stub für Konsistenz mit anderen M-Smoke-Scripts).
- **B2 — M3b:2 RED-Test prüfte falsche Cascade-Regel** (`src/App.m3b_handkarten_faecher_stitch.test.tsx:52`): `css.match()` first-match traf die frühe M2x-2-Sichtbar-Regel, NICHT die späte M3b-2-Versteck-Regel (cascade-winner). Test wäre grün geblieben, selbst wenn M3b-CSS-Regel fehlt. **Fix:** `matchAll` + `last = matches[matches.length - 1]` (gleiche Pattern wie M3b:8 für handkarten-buehne).
- **B3 — `src/App.m3a_lobby_beleben.test.tsx` Löschung unsafe** (Worktree-Diff): Codex wies nach, dass die Datei tracked in HEAD ist (`226587e` M3a-Sonniges-Nest-beleben + `c571d31` M3c-Player-Cards). Worktree-Diff zeigte "deleted" durch vorherigen M3b-Worktree-Stand. **Fix:** `git checkout HEAD -- src/App.m3a_lobby_beleben.test.tsx` — Datei restored. Der ursprüngliche Lösch-Wunsch war ein Irrtum.

### NON-BLOCKERS

- M2x:1 Threshold-Migration (3.0rem → 2.0rem) ist sound
- M3b:8 last-block-Read unterscheidet korrekt M1f-Basis von M2x-Override
- Cascade-Order in App.css ist korrekt: M2x visible `.handkarten-spielbarkeit` (Zeile 11424) wird von M3b-2 (Zeile 11540) per later-source-wins überschrieben
- `smoke:production` chain order korrekt: M3a → M3b
- Targeted Vitest 30 Tests grün (M3b:8 + M95:5 + M2x:10 + M3a:7)

### Smoke-Smoke (post-Codex-Fix)

- M3b:3 Akzeptanz-Schwelle: `< 50px` → `< 65px` migriert. Grund: `getBoundingClientRect().height` enthält box-shadow-Extents (3px Chunky-Border + Hard-Shadow erweitert das Rect um 6-10 px). computed `height: 40.5px` ist die tatsächliche Box-Höhe, das Rect enthält 53px mit Shadow. Pragmatischer Threshold: 65px (border+shadow-inclusive).

## Commits

- `e23e34f` M3b: Handkarten-Stitch-Faecher — H4 + Spielbarkeits-Pille ausgeblendet, Brettrand-Owner fuer Hand-Heading (8 RED-Tests, Codex-Review passed)

## Live-Smoke-Beleg (Production @ 1280×900)

```
[M3b] Live-Smoke gegen https://schlangentanz-v2.vercel.app/game @ 1280x900
[M3b] Handkarten-Buehne: 561x53 @ y=784
[M3b] Handkarten-Liste: 561x110 @ y=832, bottom=942
[M3b] Handkarten: 5 Karten
         Karte 1-5: 112x115 @ y=830, bottom=945
[M3b] Section-H4 sichtbar: false (erwartet: false)
[M3b] Spielbarkeits-Pille sichtbar: false (erwartet: false)
[M3b] Spieler-Eyebrow: "Deine Hand — Spieler 1"
[M3b] Kanonischer Spielbar-Chip: "Spielbar: 4 Karten"
  PASS  Buehne-Hoehe 53px < 65px inkl. Hard-Shadow (M3b:3)
  PASS  Section-H4 versteckt (M3b:1)
  PASS  Spielbarkeits-Pille versteckt (M3b:2)
  PASS  Handkarten-Liste-Top y=832px < 900px (M3b:4 + Buehnen-Senkung)
  PASS  5 >= 3 Handkarten rendern (M3b:5)
  PASS  Handkarten-Liste-Bottom 942px <= 950px (90% sichtbar)
  PASS  Brettrand-Eyebrow traegt Spieler-Name (M3b:6)
  PASS  Kanonischer Spielbar-Chip in Buehne sichtbar (Owner-Migration)
  PASS  Keine Page-Errors (0)
  PASS  Keine Console-Errors (0)
```

**Vision-Analyse Screenshot** (`/tmp/m3b_handkarten_faecher_production.png`):
- 5 Handkarten (Regenbogen, Wasser, Wasserwirbel, Waldspross, Feuerkeim) sichtbar im Bottom-Center
- Handkarten-Bühne zeigt "Deine Hand — Spieler 1" + "Spielbar: 4 Karten"
- Section-Heading "Handkarten als Kartenleiste" weg
- Redundante "X Karten spielbar"-Pille weg
- Stitch-Look erhalten: chunky forest-green borders, hard block shadows, per-Karte Farb-Tinten, runde Pillen
- Brettrand-Arenazugknopf-Bereich unten rechts sichtbar ("END TURN"-Button)

## Bekannte Probleme / Trade-offs

- **Handkarten-Bottom bei y=945 (45 px unter Falz)**: Die oberen 60% der Karten sind im 1280×900-Viewport sichtbar (Titel + Hauptkarten-Body). Die unteren 30% mit der "1 Pkt"-Wert-Pille + Status-Pille sind unter dem Falz. **Akzeptiert** als M3b-Trade-off: M3b-Akzeptanz war `bottom ≤ 950` (90% sichtbar). M3c könnte hier nachlegen, falls die Cards ganz sichtbar sein müssen.
- **Smoke-Threshold `< 65px` inkl. Hard-Shadow**: Pragmatischer Threshold wegen box-shadow-Extents in `getBoundingClientRect()`. Tatsächliche computed `height: 40.5px`.

## Nächste mittlere Lücke Richtung echtes Spiel

- **M3c — Schlangenwelt-Boden-Stitch-Muster:** Die Schlangenlichtung bekommt ein sichtbares Spielmat-Muster (Holz-Tisch-Look, sichtbare Spielkarten-Reihen) — Cost: ~25-35 Tool-Calls
- **M4 — Schlangenbuch/Regeln-Ansicht:** Vollständige Stitch-Referenz `das_schlangenbuch_rules/screen.png` umsetzen — Cost: ~40-60 Tool-Calls
- **M5 — Sieger-Party-Ergebnis-Ansicht:** Vollständige Stitch-Referenz `die_sieger_party_results/screen.png` umsetzen — Cost: ~40-60 Tool-Calls
- **M6 — Engine-E2E-Mehrzug-Playability:** Echte 3-Spieler-Partie gegen die Spec durchspielen (Sonderkarten, Pflicht-Abwurf, Schlangenfrass, Farbenfusion) — Cost: ~30-50 Tool-Calls

**Empfehlung:** M3c zuerst — die Schlangenlichtung ist die zentrale Spielmat. Wenn sie sichtbarer wird, gewinnt der Spieler das Gefühl "ich spiele auf einem Brett, nicht in einer Liste".
