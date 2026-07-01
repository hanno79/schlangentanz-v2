# M3d — Brettrand-Zugleiste als eine konsolidierte Stitch-Aktionsleiste

**Slice-ID:** M3d
**Datum:** 2026-07-01
**Klasse:** M-Visual-Consolidation (Schwester zu M2w, M2x, M2y, M2z — Brettrand-Consolidation).
**Vorgänger:** M2w (Brettrand-Zugseitenleiste konsolidiert 5 Mini-Cards auf 4),
M2x (Brettrand-Hand-Hero), M2y (Gegnerlichtung-Leerlauf), M2z (Magiekreise kompaktifiziert),
M3a/M3b/M3c (Sonniges-Nest-Lobby-Linie).
**Autor:** Hermes (autonomer Cron-Lauf).

## Problem (mit Beweisen)

Der `/game`-Screen im Production-Browser (Viewport 1280×900) hat **vier
separate Aktions-Listen** direkt unter dem Schlangenlichtung-Spielbrett
in der Brettrand-Zeile (y=743–848 px):

1. **`.zugpfad`** (108×90 px) — "Nächster Halt: Spieler 2 / Du am Zug / Karten ausspielen"
2. **`.spielerfuehrung`** (124×105 px) — "Waldtanz-Wegweiser / Dein nächster Schritt"
3. **`.gegnerzug`** — "Gegnerzug / KI ist am Zug" (eigene Pille)
4. **`.zugkompass`** (146×90 px) — "Du bist dran / Karten ausspielen / Wähle eine Handkarte"

Visuelle Diagnose (Vision-Analyse Screenshot `/tmp/game_viewport.png`):
Die 4 Pillen wirken wie **4 separate Debug-Listen-Streifen** nebeneinander
("ZUGPFAD | SPIELERFÜHR... | GEGNERZUG | ZUGKOMPASS") — keine davon
dominant, alle mit ähnlicher Border + Shadow, alle mit eigener Headline.
Das Auge weiß nicht, welche Pille "die Aktion" ist.

Konsequenz: Der Spieler sieht ein **Listen-Inventar** statt eines
**Aktions-Docks**. Genau die Pitfall-Signatur aus M2w/M2x: "konkurrierende
Listen auf /game".

**Stitch-Referenz** `/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/code.html`
(Zeile ~190, Act-Dock-Section): Eine **einzige konsolidierte Aktionsleiste
am unteren Brettrand** mit klarer Hauptaktion (Play Card) + sekundären
Aktionen (Skip / Help) — kein Pillen-Strip.

## Rein (dieser Slice)

1. **Brettrand-Zugleiste als EINEN Container** `.waldtanz-zugleiste`
   wrappen — die 4 Aktions-Komponenten werden Children eines neuen
   Containers, behalten aber ihre Sub-Komponenten-Klassen.
2. **Visuelle Konsolidierung** über CSS-only:
   - Container-Display: `flex; align-items: stretch; gap: 0.6rem`
   - Container-Border: 3px forest-green + 8px hard-shadow (Stitch-Pille)
   - Container-Background: `--st-color-surface-container-low` (Lime-Soft)
   - Children-Layout: Pille 1 (Zugpfad) = 30%, Pille 2 (Spielerfuehrung) = 30%,
     Pille 3 (Gegnerzug) = 20%, Pille 4 (Zugkompass) = 20%
   - Children-Eigene-Border/Shadow entfernen (von der umgebenden Pille absorbieren)
3. **Route-Scoped** auf `.spielbereich--game-route .waldtanz-zugleiste`
   damit die Lobby-AktionenPanel nicht beeinflusst werden.
4. **Reduced-Motion-Override** für etwaige Container-Transition.
5. **Aria-Label** auf Container: "Brettrand-Aktionsleiste" (für Screenreader
   statt 4 separater Regions).

## Raus

- Engine-Logik (keine Aktions-Logik ändert sich)
- Andere Listen (M1d0 Layout-Konsolidierung, M2r Schlangenlichtung-Forst-Arena)
- Lobby-Aktionen (M3a/M3b/M3c bleiben unangetastet)
- Schlangenbuch (M4)
- SiegerParty (M5a)

## Cap-Sum-Formel für 1280×900

```
Spieltisch-Inhalt (Schlangenlichtung-Box):  ~450 px (bleibt)
+ Aktionsleiste-Container (jetzt 1 statt 4 separate Borders):  ~90 px statt 4*95 = 380
+ Container-Gap zum Spieltisch: 8 px
Total-Brettrand: 548 px ≤ 900 px ✓
```

Aktuell sind die 4 Pillen + ihre Margins bei 4*90+3*8=384 px. Konsolidiert
auf 1 Container mit 90 px (gleiche Höhe wegen Inhalt), gewinnen wir 294 px
Margin-Border-Shadow-Reduktion, die wir für die Schlangenlichtung freigeben.

## Gates

| Gate | Ergebnis |
|---|---|
| RED-Tests | M3d:1..7 (mind. 7 RED-Tests grün) |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Full-Suite | `npm test -- --run` — Baseline-Diff 0 neue Failures |
| Live-Smoke | `scripts/m3d_brettrand_zugleiste_smoke.mjs` (NEU) — Akzeptanz: Container sichtbar, 4 Children sichtbar, Children-Höhe ≈ Container-Höhe (inner-flex-stretch), keine Page-/Console-Errors |

## 7 RED-Tests (Pflicht-Trio)

1. **M3d:1 — DOM**: `screen.getByRole('region', { name: 'Brettrand-Aktionsleiste' })` rendert
2. **M3d:2 — DOM**: Region enthält die 4 Sub-Regionen (Zugpfad, Spielerfuehrung, Gegnerzug, Zugkompass)
3. **M3d:3 — CSS-Source**: `.waldtanz-zugleiste` mit `display: flex; gap: 0.6rem; border: 3px solid var(--st-color-border-strong); box-shadow: 0 6px 0 var(--st-color-border-strong); border-radius: 2rem`
4. **M3d:4 — CSS-Source**: route-scoped `.spielbereich--game-route .waldtanz-zugleiste { ... }` mit min-width für Pille 1 = 30%, etc.
5. **M3d:5 — CSS-Source**: route-scoped override entfernt die individuellen 3px-Borders der 4 Children-Pillen
6. **M3d:6 — A11y**: Container hat `aria-label="Brettrand-Aktionsleiste"`, Children behalten ihre individuellen aria-labels
7. **M3d:7 — Smoke-Wiring**: `smoke:production` chain enthält `node scripts/m3d_brettrand_zugleiste_smoke.mjs`

## Pitfall-Checks (Pre-Implementation)

- **Pitfall #30 (Additive-Override)**: Existierende route-scoped-Regeln auf
  `.zugpfad`, `.spielerfuehrung`, `.gegnerzug`, `.zugkompass` auditieren
  und im neuen `.waldtanz-zugleiste`-Block re-inkludieren. Audit mit
  `rg "spielbereich--game-route.*(zugpfad|spielerfuehrung|gegnerzug|zugkompass)" src/App.css`.
- **Pitfall #11/#13 (Cap-Stripping)**: Container-Höhe via `clamp(...)` UND
  `min-height: 0` UND `flex-shrink: 0` für die Children. Nicht über
  dem Cap strippen — die 4 Inhalte haben Mindesthöhe ~85 px.
- **Pitfall #22 (M1dt-Dispens)**: Falls Live-Smoke Multi-Step-Engine-Pfad
  braucht, auf single-step minimal reduzieren.
- **Pitfall #32 (cssBlock-Helper bei @media)**: Reduced-Motion-Block muss
  depth-tracked sein, damit cssBlock('.waldtanz-zugleiste') die richtige
  Body liefert.

## Nächste mittlere Lücke (für M3e+)

- **M3e** — Linke Spieler-Stats-Sidebar (`Spieler 1 FOR... / SP... / Punkte`)
  könnte zu einer Stitch-Stats-Pille oben rechts konsolidiert werden.
- **M3f** — Obere rechte Status-Header (3 Karten-Stapel + eco-Karten +
  Zugtempo + Gegnerfokus) als kompakter Brettrand-Header-Indikator.
- **M3g** — Schlangenlichtung-Boden-Stitch-Muster (echtes Spielmat-Look).
- **M4** — Schlangenbuch-Visual-Refresh (echtes Pop-up-Buch).
- **M5a** — Sieger-Party (schon deployed, könnte noch polish).
- **M6** — Engine-E2E-Mehrzug-Playability (echte 3-Spieler-Partie gegen Spec).
