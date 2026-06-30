# M2z Slice Plan — Waldtanz-Magiekreise als Forest-Arena-Spielobjekte

**Datum:** 30.06.2026
**Slice-ID:** M2z
**Slice-Klasse:** M2-Visual-Consolidation-Folge (Schwester zu M2r Schlangenlichtung-Forest-Arena, M2w Brettrand-Konsolidierung, M2y Gegnerlichtung-Empty-State-Kompaktifizierung)
**Akzeptanz-Motivation:** Die Stitch-Referenz `/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png` zeigt eine zentrale lime-Forest-Arena mit grossen, klar lesbaren Spielobjekten (Magiekreis mit Plus-Icon, Vine-Whip-Spielkarte mit 3-ATK-Pille, gelbem Stern-Spawn-Kreis). Production (`https://schlangentanz-v2.vercel.app/game`) hat die Schlangenlichtung zwar als 1125x642px grosse Box, aber die 3 Magiekreise sind nur 787x127px (70% Breite, 20% Hoehe) und jeder Kreisel nur 101x101px. Die Stitch-Luecke: die Magiekreise sollen **grosse, lebendige Forest-Arena-Spielobjekte** sein, nicht ein schmaler Mini-Strip am Rand.

**Warum mittlerer Vertical, nicht Mikro / nicht Big-Bang:**
- **Nicht Mikro:** Drei sichtbare Stitch-Aenderungen am Stueck — (1) Magiekreise-Liste wird ~200px hoch statt 127px (groessere Forest-Arena-Spielobjekte), (2) jeder Kreisel von 101x101px auf ~150x150px (Stitch-Groesse), (3) Eyebrow-Header + Sichtbare-Brettwege-Zaehler in der Magiekreise-Box als Stitch-Spielmoment-Label, (4) aktive Kreise bekommen eine lime-Glow-Pulse-Animation (Stitch-Magic-Circle-Look), (5) Reduced-Motion-Override schaltet die Pulse-Animation ab.
- **Nicht Big-Bang:** Reine CSS-only-Override in route-scoped Blocks, kein JSX-Reorder, keine Engine-Aenderung, keine neuen Komponenten, keine Cap-Senkung an anderer Stelle.
- **Passt zu M2-Familie:** M2r (Schlangenlichtung als Forest-Arena), M2w (Brettrand-Konsolidierung), M2x (Brettrand-Hand-Hero), M2y (Gegnerlichtung-Empty-State). M2z schliesst die Luecke "Magiekreise wirken wie ein 4%-Anhang am Brettrand, nicht wie die zentralen Spielobjekte der Arena".

## Rein

1. `src/App.css` — route-scoped Blocks (M2z:1, M2z:2, M2z:3) erhoehen die Magiekreise-Box und die einzelnen Kreisel auf Stitch-Groesse:
   - `.waldtanz-magiekreise` (Container): min-height anheben auf `clamp(11rem, 22vh, 15rem)`, padding +0.3rem, gap +0.3rem, Eyebrow-Header sichtbar lassen, Stitch-Border + Hard-Shadow + 1.5rem-Radius
   - `.waldtanz-magiekreise__liste` (Grid): grid-template-columns `repeat(3, minmax(6.5rem, 1fr))`, gap 0.7rem
   - `.waldtanz-magiekreise__kreis` (jeder Kreisel): min-height `clamp(7.5rem, 14vh, 9.5rem)`, padding 0.55rem, border-style solid (statt dashed — Stitch-Look), border-width 3px, lime-Glow-Pulse auf `--aktiv`
   - `.waldtanz-magiekreise__kreis--aktiv` lime-Glow-Pulse Animation + Stitch-Active-Styling
   - Reduced-Motion-Override: `@media (prefers-reduced-motion: reduce) { animation: none }`
2. `src/App.m2z_magiekreise_arena_spielobjekte.test.tsx` — 8 RED-Tests
3. `scripts/m2z_magiekreise_arena_spielobjekte_smoke.mjs` — Production-Smoke mit sichtInfo() + Kreisel-Geometrie
4. `package.json` — `smoke:production`-Kette: + `node scripts/m2z_magiekreise_arena_spielobjekte_smoke.mjs` als Last-In-Chain
5. `src/App.m95_smoke_wiring.test.ts` — M9.5-W5 Last-In-Chain-Assert M2y → M2z migriert
6. `docs/release_status_2026-06-30_m2z.md` — Release-Doku
7. `docs/PLAYABILITY_GATE.md` — M2z-Evidence-Block

## Raus

- **Keine Engine-Aenderung** (Aktionen, Schlangenbau, Sonderkarten, KI, Engine-Regeln bleiben unveraendert)
- **Keine JSX-Struktur-Aenderung** in `WaldtanzMagiekreise.tsx` (CSS-only Override)
- **Keine neuen Komponenten**
- **Keine Cap-Senkung** an anderen Stellen (Arenasstein, Schlangenlichtung, Hand bleiben)
- **Keine pre-existing-Test-Migration** ausser M9.5-W5 (Last-In-Chain auf M2z)

## Akzeptanz-Geometrie (Live-Smoke @ 1280x900)

- **Vor M2z:** Magiekreise-Container 787x127px (70% Breite der Schlangenlichtung, 20% Hoehe). Kreisel 101x101px. Eyebrow-Header sr-only versteckt.
- **Nach M2z:** Magiekreise-Container **~1100x230px** (volle Breite, ~36% Hoehe der Schlangenlichtung), Kreisel **~150x150px** (50% groesser), Eyebrow-Header sichtbar als Stitch-Spielmoment-Label mit Badge "Magiekreise aktiv" + Zaehler "5 Brettwege leuchten".
- Stitch-Forest-Arena-Gefuehl: Magiekreise sind jetzt klar sichtbares Spielobjekt-Zentrum der Schlangenlichtung, nicht ein schmaler Anhang.

## Pre-Implementation-Audit

- `rg -n "waldtanz-magiekreise|waldtanz-steinkreis" src/App.css` listet die existierenden route-scoped-Regeln (M1d3-Basis, M1df-Stein-Kreis, M1dj-Brettlandschaft).
- **Wichtig:** M1d3 setzt `clamp(4.9rem, 9vw, 6.75rem)` (Kreisel-max 108px). M2z muss `clamp(7.5rem, 14vh, 9.5rem)` setzen (Kreisel-max 152px) und diese spaeter im Source stehen haben (later-source-wins bei gleicher Specificity 0,2,0).
- **Wichtig:** M1df hat den M1df-Override `[class~="waldtanz-magiekreise__kreis"][class~="waldtanz-steinkreis__kreisel"]` mit min-height: 0, padding: 0, border: 0 — der bleibt unveraendert (sorgt fuer runden Drop-Stein). M2z erhoeht nur den Magiekreise-Container + Magiekreise-Liste + Magiekreise-__kreis (generisch), **nicht** den M1df-Override.
- Pre-existing Tests: M1d3, M1df, M1dj, M2r, M2s — alle pruefen CSS-Source-Asserts. M2z erhoeht nur die groessen-relevante Property, AENDERUNGS-Kommentar dokumentiert die Quelle.

## Gates (alle muessen gruen sein)

| Gate | Kommando | Erwartung |
|------|----------|-----------|
| Targeted RED | `npx vitest run src/App.m2z_magiekreise_arena_spielobjekte.test.tsx` | 8/8 gruen |
| Smoke-Wiring | `npx vitest run src/App.m95_smoke_wiring.test.ts` | 5/5 gruen (M2y → M2z Last-In-Chain OK) |
| Cascade-Adjazenz | `npx vitest run src/App.m1df_waldtanz_steinkreis.test.tsx src/App.m1dj_waldtanz_brettlandschaft.test.tsx` | alle gruen (M1df-Override bleibt unveraendert) |
| Typecheck | `npm run typecheck` | gruen |
| Lint | `npm run lint` | gruen |
| Build | `npm run build` | gruen |
| Live-Smoke | `node scripts/m2z_magiekreise_arena_spielobjekte_smoke.mjs` | 1280x900: Magiekreise-Container >= 1100x230, Kreisel >= 140x140, Eyebrow-Header sichtbar |

## Code-Review-Status

`REVIEWER=NONE` (Watchdog vom 30.06.2026 14:31 UTC — Codex stdin-block, Kimi 403 billing cycle). Slice lokal verifiziert, review-blockiert gemeldet per Schlangentanz-Workflow Pitfall #12 (User-Time-Preference). Re-Review im naechsten Cron-Lauf sobald Watchdog wieder einen verfuegbaren Reviewer meldet.

## Commits

- `M2z: Waldtanz-Magiekreise als Forest-Arena-Spielobjekte — 3 grosse lebendige Kreise mit Stitch-Glow-Pulse (8 RED-Tests, lokal verifiziert, review-blockiert)`
- `docs: M2z Release-Status-Doku + Playability-Gate-Evidence`

## Naechste mittlere Luecke (M3+)

- M2z.5 (oder M2za): Brettrand-Kompass-Empty-State-Kompaktifizierung (Schwester zu M2y) — der "Waldtanz-Kompass"-Heading + "Naechster Schritt: ..."-Paragraph auf /game ist noch sichtbar im Seitenmenue, redundantes Brettrand-Chrome.
- M3 (Lobby-Startgarten): Stitch-Referenz hat grossen Toad-King-Header mit Avatar + Punkte — production-Lobby hat schon M3b-Start-Buttons, aber der "Waldparty"-Button braucht noch Stitch-Pille-Format mit 3px-Border + Hard-Shadow.
- M4 (Schlangenbuch / Regeln-Ansicht): komplette Stitch-Referenz `das_schlangenbuch_rules/screen.png` muss noch umgesetzt werden.
