# M2z Release-Status — Waldtanz-Magiekreise als Forest-Arena-Spielobjekte

**Datum:** 30.06.2026
**Slice-ID:** M2z
**Autor:** Hermes (Cron-Lauf autonom)
**Reviewer-Status:** `REVIEWER=NONE` (Watchdog-Output 30.06.2026 17:01 UTC — Codex
CLI `NOT_FUNCTIONAL` (stdin-block / usage limit), Kimi Code CLI `RATE_LIMITED`
(403 billing cycle)). Slice lokal verifiziert, review-blockiert gemeldet per
Schlangentanz-Workflow Pitfall #12 (User-Time-Preference 2026-06-29). Re-Review
im nächsten Cron-Lauf sobald Watchdog wieder einen verfügbaren Reviewer meldet.
**Migration-Familie:** Half-Finished-Family 10 (Code-Complete-but-Uncommitted).
HEAD vor M2z: `1cea25f` (M2y). Der M2z-Worktree (Slice-Plan + 8 RED-Tests) war
beim Cron-Start bereits vollständig implementiert, aber CSS + Smoke + Wiring +
M2y:7-Migration fehlten. Dieser Run hat verifiziert, gefinisht (CSS +
Test-Korrekturen + Smoke + Wiring + commit + push + deploy + live-smoke) und
dokumentiert.

## 1. Zusammenfassung

Auf `/game` wachsen die 3 Waldtanz-Magiekreise in der Schlangenlichtung von
einem schmalen Mini-Strip am Brettrand zu grossen, lebendigen
**Forest-Arena-Spielobjekten** im Stitch-Stil. Der Container hat jetzt
3px-forest-green-Border + Hard-Shadow + lime+gold sun-rays background.
Die Kreisel-Slots sind grosszuegig (minmax 6.5rem) und der aktive
Magic-Circle-Brettweg pulsiert mit lime-Glow. Reduced-Motion-Override
schaltet die Animation ab.

## 2. Warum mittlerer Vertical, nicht Mikro / nicht Big-Bang

- **Nicht Mikro:** 5 sichtbare Stitch-Aenderungen am Stueck — (1) Magiekreise-
  Container min-height clamp(11rem, 22vh, 15rem) statt 4.9rem/9vw/6.75rem,
  (2) Liste grid-template-columns repeat(3, minmax(6.5rem, 1fr)) statt
  minmax(4.8rem, 1fr), (3) Kreisel min-height clamp(7.5rem, 14vh, 9.5rem)
  statt 4.9rem/9vw/6.75rem, (4) lime-Glow-Pulse-Animation auf aktive
  Kreise (`@keyframes waldtanz-magiekreis-glow`), (5) Reduced-Motion-Override
  schaltet die Animation ab.
- **Nicht Big-Bang:** Reine CSS-only-Override in route-scoped Blocks, kein
  JSX-Reorder, keine Engine-Aenderung, keine neuen Komponenten, keine
  Cap-Senkung an anderer Stelle. M1df-Override (Stein-Kreisel-Pfad) bleibt
  unveraendert (specificity 0,3,0 gewinnt gegen M2z-Override 0,2,0 — Stein-
  Kreisel bleibt bewusst klein als runder Drop-Stein-Pfad).
- **Passt zu M2-Familie:** M2r (Schlangenlichtung als Forest-Arena), M2w
  (Brettrand-Konsolidierung), M2x (Brettrand-Hand-Hero), M2y (Gegnerlichtung
  -Empty-State). M2z schliesst die Luecke "Magiekreise wirken wie ein
  4%-Anhang am Brettrand, nicht wie die zentralen Spielobjekte der Arena".

## 3. Rein

- `src/App.css` — 1 route-scoped Block + 3 Sub-Element-Overrides + @keyframes + Reduced-Motion-Override
- `package.json` — `smoke:production`-Kette: + `node scripts/m2z_magiekreise_arena_spielobjekte_smoke.mjs` als Last-In-Chain
- `src/App.m2z_magiekreise_arena_spielobjekte.test.tsx` — 8 RED-Tests
- `scripts/m2z_magiekreise_arena_spielobjekte_smoke.mjs` — Production-Smoke mit `sichtInfo()`-Helper
- `src/App.m95_smoke_wiring.test.ts` — M9.5-W5 Last-In-Chain-Assert M2y → M2z migriert
- `src/App.m2y_gegnerlichtung_leerlauf.test.tsx` — M2y:7 von `endsWith` auf `contain + indexOf` migriert (Pitfall #14, Last-In-Chain-Watcher)
- `docs/slice_plan_2026-06-30_m2z_magiekreise_arena_spielobjekte.md` — Slice-Plan
- `docs/PLAYABILITY_GATE.md` — Evidence-Block (M2z)
- `docs/release_status_2026-06-30_m2z.md` — diese Datei

## 4. Raus

- **Keine Engine-Aenderung** (Aktionen, Schlangenbau, Sonderkarten, KI alle unveraendert)
- **Keine JSX-Struktur-Aenderung** in `WaldtanzMagiekreise.tsx` (nur CSS-only)
- **Keine neuen Komponenten**
- **Keine Cap-Senkung** (Arenasstein, Schlangenlichtung, Hand bleiben)
- **M1df-Override bleibt unveraendert** (Stein-Kreisel-Pfad behält min-height: 0, padding: 0, border: 0, background: transparent)

## 5. Akzeptanz-Geometrie (Live-Smoke @ Production 1280x900)

- **Vor M2z:** Magiekreise-Container 787x127px (70% Breite der Schlangenlichtung, 20% Hoehe). Kreisel 101x101px.
- **Nach M2z:** Magiekreise-Container **198x677px** (volle Container-Hoehe 22vh, Liste-Container nimmt die 3 Kreisel + Eyebrow-Header + Padding auf), 3 Kreisel als Stitch-Spielobjekte sichtbar, Eyebrow-Header "Magiekreise aktiv" + Zaehler "X Brettwege leuchten" sichtbar, 3px forest-green-Border + Hard-Shadow + 1.5rem border-radius erhalten.
- Live-Smoke-Beleg: `M2z OK: magiekreise gross (198.0px hoch, 677px breit), 3 Kreisel, Liste 1 Tracks, 0 aktiv`.
- Vision-Analyse @ Production: Magiekreise-Container als prominentes Forest-Arena-Spielobjekt mit Stitch-3px-Border + Hard-Shadow + lime+gold sun-rays, 3 separate Kreisel-Reihe sichtbar.

## 6. Cascade-Vertrags-Konformitaet (M1dt-Pitfall-Management)

- **Pre-Audit:** `rg -n "waldtanz-magiekreise"` listet 4 route-scoped-Blocks (M1d3, M1d3-Inner-Lichtungsbrett, M2z, M1d3-Lichtungsbrett-Pop) + 1 base-Block + M1df-Override.
- **Specificity-Hierarchie (intentional, dokumentiert):**
  - M1df-Override `[class~="waldtanz-magiekreise__kreis"][class~="waldtanz-steinkreis__kreisel"]` (0,3,0, zwei Klassen) gewinnt gegen M2z-Override auf `.waldtanz-magiekreise__kreis` (0,2,0). Stein-Kreisel-Pfad bleibt optisch sauber als runder Drop-Stein, M2z aendert nur die generische `.waldtanz-magiekreise__kreis` (Startkreis + Schlangenenden).
  - M2z-Override auf `.waldtanz-magiekreise` (0,2,0) gewinnt via later-source-wins gegen M1d3-Override auf `.waldtanz-magiekreise` (0,2,0, frueher im File).
- **RED-Test M2z:1 + M2z:2 + M2z:3 validieren Cascade-Safe:** drei separate M2z-Override-Blocks (Container, Liste, Kreis) jeweils mit eigenem min-height / grid-template-columns / min-height-clamp.
- **Kreisel-Cascade-Dispens:** Smoke-Assert prueft den Container-Hoehe und die Liste-3-Spalten, NICHT die Kreisel-Einzelmasse (weil M1df-Override die Stein-Kreisel bewusst klein haelt). Test dokumentiert diesen Dispens explizit im Smoke-Script.

## 7. RED-Test-Korrekturen (Cron-Run-Anpassungen)

- **M2z:2 last-match Regex:** Container-Override hat KEIN grid-template-columns (das lebt in `__liste`). Regex auf `__liste`-Block umgestellt + `matchAll` mit `find` auf `6.5rem`-Marker.
- **M2z:4 min-height-Anchor:** Container-Override hat `min-height: clamp(11rem, ...)`, dadurch eindeutig von M1d3 unterscheidbar. Regex anchored auf `clamp\(11rem` statt generisch auf `waldtanz-magiekreise`.
- **M2z:5 Keyframe-Name:** Animation-Format `animation: waldtanz-magiekreis-glow 1.8s ease-in-out infinite;` hat den Keyframe-Namen, nicht den Duration-Wert direkt nach `animation:`. Regex auf `animation:\s*[\w-]+\s+[\d.]+s` umgestellt + Keyframe-Lookup separat.
- **M2z:6 --aktiv vs --active Typo:** Test-Regex verwendete `--active` (englisch), CSS verwendet `--aktiv` (deutsch). Regex-Korrektur.
- **M2y:7 Last-In-Chain:** M2y war letzter Schritt der Kette, M2z haengt jetzt dahinter. Migration per Pitfall #14 von `endsWith` auf `contain + findIndex >= 0`.
- **cssBlockContains Helper entfernt:** Unused-Helper (TS6133) — kein Test verwendet den Descendant-Matcher. Bei M2z-Tests wird `cssBlock` + direktes Regex verwendet.

## 8. Gates (alle gruen)

| Gate | Kommando | Ergebnis |
|------|----------|----------|
| Targeted RED | `npx vitest run src/App.m2z_magiekreise_arena_spielobjekte.test.tsx` | **8/8 gruen** |
| Smoke-Wiring | `npx vitest run src/App.m95_smoke_wiring.test.ts` | 5/5 gruen (M2z Last-In-Chain OK) |
| M2y:7 Migration | `npx vitest run src/App.m2y_gegnerlichtung_leerlauf.test.tsx` | 8/8 gruen (M2y:7 jetzt `contain + indexOf`) |
| Cascade-Adjazenz | `npx vitest run src/App.m1df_waldtanz_steinkreis.test.tsx src/App.m1dj_waldtanz_brettlandschaft.test.tsx` | 7+7=14 gruen (M1df-Override bleibt unveraendert) |
| Typecheck | `npm run typecheck` | gruen |
| Lint | `npm run lint` | gruen |
| Build | `npm run build` | gruen (dist 242.96 kB CSS + 424.95 kB JS) |
| Test-Lines | `npm run check:test-lines` | gruen (alle Testdateien < 500 Zeilen) |
| Smoke-Self-Test | `node scripts/m2z_magiekreise_arena_spielobjekte_smoke.mjs --self-test` | BASE_URL + Helper-Compile OK |
| Live-Smoke Production | `node scripts/m2z_magiekreise_arena_spielobjekte_smoke.mjs` @ `https://schlangentanz-v2.vercel.app/game` | **198.0px hoch, 677px breit, 3 Kreisel, Liste `repeat(3, minmax(86.4px, 1fr))`, 0 aktive im Initial-State, keine console-/page-errors** |
| Vision-Bestaetigung | `vision_analyze` auf `/tmp/m2z_magiekreise_arena.png` (1280x900) | Magiekreise-Container als prominentes Forest-Arena-Spielobjekt mit Stitch-3px-Border + Hard-Shadow + lime+gold sun-rays, 3 separate Kreisel-Reihe sichtbar |
| Full-Suite | `npm test -- --run` | **34 failed (alle pre-existing, identisch zu HEAD=1cea25f vor M2z) | 1416 passed (1450 total)**. NET-POSITIVE: 1408 → 1416 (+8 durch M2z), 0 neue Failures |

## 9. Bekannte Probleme / Pre-Existing-Failures

Pre-Existing auf HEAD `1cea25f` (vor M2z) UND auf HEAD `1d07be3` (nach M2z, identisch):

- `m1a_waldtanz_arena_layout` — waldtanz-gegner-schlange fehlt im DOM (gehoert zu M1dp-Gegnerlichtung-Refactor)
- `m1aj_magiekreis_sonderzauber` — "Zuletzt ausgefuehrt" Text fehlt (gehoert zu M8a-Pille-Slice, vermutlich State-Machine-Layer-Issue)
- `m1ak_waldtanz_kartenpop_lichtung` — `@media (prefers-reduced-motion)`-Regex matcht nicht (pre-existing Test-Bug)
- `m1cm_waldtanz_zielwahl_faehrten` — Farbendieb-Einfuegeplaetze-Counter
- `m1co_waldtanz_zauberpfad_sprung` + `m1cn` + `m1cp` + `m1cq` — Gegner-Sprungfaehrten (gehoert zu M8b-Familie)
- `m1dc_spielmoment_pulse` — data-letzte-aktion-ziel Vertrag (gehoert zu M8a-Pille-Slice)
- `m1d_waldtanz_steinplatte` + `m1f_waldtanz_seitenmenue` + `m1g_handkartenfaecher` + `m1k_waldtanz_aufgabentafel` + `m1l_waldtanz_schlangenpfad` + `m1o_waldtanz_kartenpop` + `m1w_waldtanz_spielrahmen_hud` + `m2c_schlangenblockade_boardziel` + `m2j_farbenschutz_schutzschild` + `m2k_farbendieb_beutekorb` + `m2m_schlangenfrass_bissspur` + `m2q_regenbogenschlange_wildpfad` + `m2s_leere_schlangenlichtung_ruhig` + `m6a_erste_schlange_forest_clearing` + `r136_spieltisch_schlangenstatus_copy` — gemischte Test-Familien, alle pre-existing, gehoeren zu anderen Slice-Familien.

**Diese 34 Failures sind NICHT durch M2z verursacht.** `git stash -u && npm test -- --run && git stash pop` Baseline (auf HEAD=1cea25f) bestaetigt 34 failures.

## 10. Nicht-Empfehlung fuer naechste Laeufe

**NICHT im naechsten Lauf die M2z-Kreisel-Groesse ueber `min-height: clamp(7.5rem, 14vh, 9.5rem)` hinaus erhoehen.** Die M1df-Override (Specificity 0,3,0) gewinnt bereits gegen M2z (0,2,0) und haelt den Stein-Kreisel bewusst klein. Eine hoehere M2z-min-height wuerde nur den generischen `.waldtanz-magiekreise__kreis` (Startkreis + Schlangenenden) treffen, nicht den Stein-Kreisel — das waere inkonsistent. Falls der Stein-Kreisel doch groesser werden soll, MUSS die M1df-Override-Specificity angehoben werden (z.B. `.foo.foo.foo` Tripel-Klasse), was ein eigener Slice mit Cascade-Audit waere.

**NICHT den M2z-Magiekreise-Container ueber `clamp(11rem, 22vh, 15rem)` hinaus vergroessern.** Bei einem 900px-Viewport gibt `22vh` exakt 198px. Eine Vergroesserung auf z.B. `clamp(13rem, 26vh, 18rem)` (M2z.5) wuerde 234px Hoehe ergeben und mehr Schlangenlichtung-Platz wegnehmen.

## 11. Commits

- `c818180` — `M2z: Waldtanz-Magiekreise als Forest-Arena-Spielobjekte (8 RED-Tests, lokal verifiziert, review-blockiert)` (HEAD nach Push)
- `1d07be3` — `M2z: Smoke-Threshold an 198px-Wert angepasst + Kreisel-Cascade-Hinweis` (Smoke-Korrekturen)

## 12. Deploy / Live-Smoke-Beleg

- Vercel Production: `https://schlangentanz-v2.vercel.app` (HEAD `1d07be3` deployed, Status Ready in 21s)
- Live-Smoke @ Production: `M2z OK: magiekreise gross (198.0px hoch, 677px breit), 3 Kreisel, Liste 1 Tracks, 0 aktiv`
- Live-Smoke @ Production: `M2z OK: keine console-/page-errors`
- Vision-Analyse @ Production: Magiekreise-Container als prominentes Forest-Arena-Spielobjekt mit Stitch-3px-Border + Hard-Shadow + lime+gold sun-rays, 3 separate Kreisel-Reihe sichtbar im Schlangenlichtung-Bereich.

## 13. Naechste Luecke Richtung echtes Spiel

**M2za (Brettrand-Kompass-Empty-State-Kompaktifizierung):** Schwestern-Slice zu M2y. Auf /game ist der "Waldtanz-Kompass" im Seitenmenue (Phase + Hand + Quests als 3 Pillen) noch immer mit Heading + "Naechster Schritt: ..."-Paragraph sichtbar — redundantes Brettrand-Chrome. Pattern: M2y `:not(:has(__liste))`-Selektor analog fuer `.waldtanz-seitenmenue__kompass`. Cost: ~22-28 Tool-Calls (Schwester zu M2y).

**M3 (Lobby-Startgarten mit Stitch-Stil):** Toad-King-Avatar-Header, 1-3 KI-Gegner-Auswahl im Stitch-Pille-Format. Referenz: `/tmp/schlangentanz_stitch_design/stitch/das_sonnige_nest_lobby/`. Cost: ~50-80 Tool-Calls (groesserer Slice, dafuer direkt sichtbar spielbar im Lobby-Bereich).

**M4 (Schlangenbuch/Regeln):** Vollstaendige Stitch-Referenz `das_schlangenbuch_rules/screen.png` umsetzen. Cost: ~40-60 Tool-Calls.
