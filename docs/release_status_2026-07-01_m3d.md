# M3d — Brettrand-Zugleiste als eine konsolidierte Stitch-Aktionsleiste

**Slice-ID:** M3d
**Datum:** 2026-07-01
**Klasse:** M-Visual-Consolidation (Schwester zu M2w, M2x, M2y, M2z — Brettrand-Consolidation).
**Vorgänger:** M2w (Brettrand-Zugseitenleiste konsolidiert 5 Mini-Cards auf 4),
M2x (Brettrand-Hand-Hero), M2y (Gegnerlichtung-Leerlauf), M2z (Magiekreise kompaktifiziert),
M3a/M3b/M3c (Sonniges-Nest-Lobby-Linie).
**Reviewer:** Codex CLI (Standard, codex=OK).
**Disclosure:** Pitfall #12 — lokale Verifikation vollständig, externe Reviewer-Wahl via Watchdog.

## Problem (mit Beweisen)

Der `/game`-Screen im Production-Browser (Viewport 1280×900) hatte **vier
separate Aktions-Listen** direkt unter dem Schlangenlichtung-Spielbrett
in der Brettrand-Zeile:

1. `.zugpfad` — "Nächster Halt: Spieler 2 / Du am Zug / Karten ausspielen"
2. `.spielerfuehrung` — "Waldtanz-Wegweiser / Dein nächster Schritt"
3. `.gegnerzug` — "Gegnerzug / KI ist am Zug"
4. `.zugkompass` — "Du bist dran / Karten ausspielen / Wähle eine Handkarte"

Visuelle Diagnose: Die 4 Pillen wirkten wie **4 separate Debug-Listen-Streifen**
nebeneinander — keine davon dominant, alle mit ähnlicher Border + Shadow, alle
mit eigener Headline. Das Auge wusste nicht, welche Pille "die Aktion" ist.

Konsequenz: Der Spieler sah ein **Listen-Inventar** statt eines **Aktions-Docks**.

## Rein (dieser Slice)

1. **Container-Border + Hard-Shadow** auf `.waldtanz-zugseitenleiste` (3px forest-green
   + 6px shadow + 2rem radius + surface-container-low background + 0.32/0.42rem padding)
2. **Children-Borders neutralisiert** über `!important`-Pattern: 2px transparent border,
   `box-shadow: none`, `background: transparent` (Pitfall #30 Additive-Override-Discipline)
3. **Pre-existing Verträge preserved**: M1ao Vertrag `getByRole('complementary',
   { name: 'Zugleiste' })` und `routeZugleistenKinderBlock` (grid-column, grid-row,
   max-height, overflow) bleiben unverändert
4. **Aria-Label**: "Zugleiste" bleibt (M1ao-Vertrag) — semantisch identisch, der
   Brettrand-Aktions-Container ist lediglich visuell konsolidiert

## Raus

- Engine-Logik (keine Aktions-Logik ändert sich)
- Andere Listen (M1d0 Layout-Konsolidierung, M2r Schlangenlichtung-Forst-Arena)
- Lobby-Aktionen (M3a/M3b/M3c bleiben unangetastet)
- Schlangenbuch (M4)
- SiegerParty (M5a)

## Pitfall-Checks (gemacht)

- **Pitfall #30 (Additive-Override)**: M1ao-Block (grid-column/grid-row/max-height/overflow)
  re-inkludiert; neue Properties (border/shadow/background) mit `!important` damit
  die spätere M2w-Regel auf .zugpfad/.zugkompass/.ki-zug-buehne--brettnah/.waldtanz-spielhilfe
  (0,2,0) die Children-Borders nicht zurücksetzt
- **Pitfall #14 (Last-In-Chain)**: M9.5-W5 + M3a-W4 + alle M2w-Smoke-Asserts
  auf neuen M3d-Last-Step + "contain + indexOf >= 0" migriert
- **Pitfall #32 (cssBlock @media-Heuristik)**: Children-Override-Regel nutzt
  exakte `[class~="waldtanz-zugseitenleiste"] > *`-Form (kein descendant), M1ao-Regex
  passt ohne Helper-Änderung
- **Pitfall #11/#13 (Cap-Stripping)**: Container-Höhe via `clamp(4rem, 7vh, 5rem)`
  unverändert; Cap-Sum unverändert
- **Pitfall #22 (M1dt-Dispens)**: Smoke braucht keine Multi-Step-Engine-Pfad
  Vorbedingung — Container ist im Initial-State direkt sichtbar

## Code-Review

**Reviewer:** Codex CLI (gpt-5.5) via `codex exec --sandbox workspace-write`.
**3 BLOCKERS** vom ersten Review-Pass:
1. Cascade-Override M3d-vs-M2w — gelöst via `!important`-Pattern
2. Smoke aria-label = "Brettrand-Aktionsleiste" mismatch — gelöst: aria-label bleibt
   "Zugleiste" (M1ao-Vertrag), M3d-Region semantisch identisch
3. Smoke logging statt throw — gelöst: 4 Children-Pflicht-Asserts + transparent-Border-Assert

**3 NON-BLOCKERS** (alle adressiert):
- M3d:2 nur 1-Kind-Proof → erweitert mit /zugpfad|zugkompass|ki-zug-buehne|...
- M3d:5 Title vs Body — Title korrigiert auf "Container hat route-scoped Innenabstand"
- Slice-Plan veraltete Spec (`.waldtanz-zugleiste` → `.waldtanz-zugseitenleiste`)

**AFFIRMATIONS**: Container-Block korrekt, Child-Override transparent + !important,
Last-In-Chain migriert, App.tsx aria-label="Zugleiste" erhalten, M1ao-Contract preserved.

## Gates

| Gate | Ergebnis |
|---|---|
| RED-Tests | 7/7 M3d + 1/1 M1ao + 5/5 M9.5-W = 13/13 targeted grün |
| Typecheck | `npm run typecheck` ✅ |
| Lint | `npm run lint` ✅ |
| Build | `npm run build` ✅ |
| Full-Suite | `npm test -- --run` — 34 fails (== Baseline, 0 neue) |
| Baseline-Diff | `comm -23 /tmp/slice /tmp/baseline` = LEER |
| Live-Smoke | `scripts/m3d_brettrand_zugleiste_smoke.mjs --self-test` ✅ |
| Review | Codex CLI ✅ (3 BLOCKERS adressiert, 3 NON-BLOCKERS adressiert) |

## Commits

- `M3d: Brettrand-Zugleiste-Konsolidierung — Container-Border absorbiert Children-Borders (7 RED-Tests, Codex-Review passed)`

## Live-Smoke (post-deploy)

Wird nach Vercel-Production-Deploy ausgeführt gegen `https://schlangentanz-v2.vercel.app/game`:
- Container-Sichtbarkeit + 3px-Border + Hard-Shadow
- 4 Children-Klassen + transparent-Border-Verify
- aria-label="Zugleiste"-Verify
- Console-/Page-Errors leer

## Nächste mittlere Lücke

- **M3e** — Linke Spieler-Stats-Sidebar (FOR... / SP... / Punkte) konsolidieren
- **M3f** — Obere rechte Status-Header (3 Karten-Stapel + eco-Karten + Zugtempo + Gegnerfokus) als kompakter Brettrand-Header-Indikator
- **M3g** — Schlangenlichtung-Boden-Stitch-Muster (echtes Spielmat-Look)
- **M4** — Schlangenbuch-Visual-Refresh
- **M6** — Engine-E2E-Mehrzug-Playability
