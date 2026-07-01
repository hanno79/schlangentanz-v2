# M3e — Waldtanz-Spielmat-Boden (sichtbare "Hier spielen"-Affordance im Brettrund-Zentrum)

**Slice-ID:** M3e
**Datum:** 2026-07-01
**Klasse:** M-Visual-Consolidation (Schwester zu M2y, M2z, M3a, M3b, M3d — Brettrund-Consolidation).
**Vorgänger:** M3d (Brettrand-Zugleiste als konsolidierte Aktionsleiste), M2y (Gegnerlichtung-Leerlauf), M2z (Magiekreise), M6a (Erste-Schlange-Onboarding), M2w (Brettrand-Zugseitenleiste), M2x (Brettrand-Hand-Hero).
**Reviewer:** Codex CLI gpt-5.5 (Standard).
**Disclosure:** Pitfall #12 (User-Time-Preference) — Slice lokal vollständig verifiziert, Codex-CLI-Review passed (1 BLOCKER + 2 NON-BLOCKERS adressiert).

## Problem (mit Beweisen)

Der `/game`-Screen im Production-Browser (Viewport 1280×900) hatte im Brettrund-Zentrum
(`.waldtanz-arenastein`, 1031×450 px groß) eine **visuell leere Zone** zwischen
dem Schlangenlichtung-Kopf (Headline + Plakette) und den Magiekreisen (3 kleine
Kreise als Drop-Zones für Sonderkarten).

Visuelle Diagnose (vom `vision_analyze` Production-Screenshot vor M3e):
- Der Arenastein ist mit Lime-Gradient + 3px-Wald-Border + Hard-Shadow schon
  gerendert, das ist gut.
- ABER: zwischen Schlangenlichtung-Header und Magiekreisen ist eine **leere Lime-Box** — der Spieler sieht nicht "wo er spielen soll" (Schlange wächst hier, aber er weiß nicht wo).
- Die `WaldtanzErsteSchlangeOnboarding`-Box (M6a) füllt zwar den leeren Bereich
  mit "Deine erste Schlange" + Schritten, aber sie ist **optisch wie ein separates
  Hinweis-Element** (viel kleiner, andere Border-Farbe, andere Padding-Welt) und
  nicht wie ein **integrierter Spielmat-Boden**.

Konsequenz: Das Brettrund liest sich als **"leere Box mit Header oben und kleinen
Kreisen in der Mitte"**, nicht als **"Spielmat mit klarer Spielfläche"**.

## Stitch-Referenz (was fehlt)

Die Stitch-Referenz `/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`
zeigt das Brettrund als **eine große abgerundete Lime-Box mit 2 großen
gestrichelten Drop-Kreisen** (Hexagon-/Kreis-Silhouetten) **links und rechts** der
zentralen Spielkarte. Diese Drop-Kreise sind **das visuelle "Hier spielen"-Signal**.

Aktueller Production-Stand hatte die 2 dashed-Kreise (M3d-Ära, in `waldtanz-arenastein::before` und `::after`),
aber sie sind 80-100px kleine Pseudo-Elemente, nichtige deko-Indikatoren am Rand,
nicht das prominente "Hier deine Schlange"-Element, das die Stitch-Referenz zeigt.

## Rein (dieser Slice)

1. **Neue Komponente `WaldtanzSpielmatBoden`** (~50 Zeilen TSX) als
   sichtbare Stitch-Spielmat-Box im Brettrund-Zentrum:
   - Wird in `WaldtanzSchlangenlichtung__spielflaeche` als Row 1 gerendert (vor den Overlays + Schlangen-Subgrid)
   - **Persistent sichtbar** auf /game (nicht Empty-State-Only, nach Codex-Blocker-Fix)
   - Zeigt eine **gestrichelte Hexagon-Silhouette** als "Hier deine Schlange"-Drop-Zone-Indikator
   - Hinweistext konditional: "Hier deine erste Schlange ablegen..." (leer) vs. "Spielmat-Boden des Brettrund — hier wachsen deine Schlangen..." (belegt)
   - Hat `aria-label="Waldtanz-Spielmat"` für Screen-Reader
   - `data-waldtanz-spielmat="leer|belegt"` für Test-Stabilität
2. **CSS für `.waldtanz-spielmat-boden`**:
   - 3px forest-green border + dashed style
   - Border-radius 3rem (Stitch-Pillen-Optik)
   - Lime/forest-gradient background (passt zum Arenastein-Boden)
   - Padding 0.7rem 1.1rem, min-height 3.5rem, max-height 5rem
   - Animation: dezenter Pulse (2.8s ease-in-out infinite) auf der inneren Hexagon-Silhouette
3. **Reduced-Motion-Override** für die Pulse-Animation
4. **Wiring in `WaldtanzSchlangenlichtung.tsx`**: Komponente als Row 1 von `__spielflaeche`
   gerendert (vor `__overlays` und `__schlangen` Subgrid)
5. **Pre-existing Verträge preserved**:
   - M2z: min-height + grid-template-columns auf `.waldtanz-magiekreise` UNVERÄNDERT
   - M6a: `.erste-schlange-onboarding`-Regeln UNVERÄNDERT (Onboarding bleibt parallel sichtbar)
   - M3d: `.waldtanz-zugseitenleiste`-Border-Absorption UNVERÄNDERT
   - M1dj: `.waldtanz-arenastein__spielfeld` flex: 1 1 auto UNVERÄNDERT

## Raus

- **Engine-Logik** (keine Spielregel-Änderung, keine Aktion-Handler-Änderung)
- **Andere Sektionen** (M3a/M3b Handkarten, M2w Brettrand-Zugseitenleiste, M1ao
  Spieler-Stats bleiben unangetastet)
- **Lobby** (M3a-Player-Cards bleiben unangetastet)
- **Onboarding-Komponente** (M6a bleibt parallel da — die Spielmat-Box ist die
  sichtbare "Hier spielen"-Affordance, das Onboarding ist die textuelle
  Schritt-für-Schritt-Anleitung, beide koexistieren)
- **Magiekreise-Position** (M1dj-Grid-Layout bleibt unverändert)
- **Schlangen-Onboarding-Verschwinden-Logik** (M6a hat eigene
  `aktiverSpieler.schlangen.length > 0`-Gating)

## Pitfall-Checks (gemacht)

- **Pitfall #30 (Additive-Override)**: Neue CSS-Regel nur auf `.waldtanz-spielmat-boden`
  (single class, eigene Komponente, keine Kollision mit `.waldtanz-magiekreise` oder
  `.erste-schlange-onboarding`)
- **Pitfall #32 (CSS-Kommentar)**: Cascade-Kommentar in Worten, KEINE `.klasse { property: value }`-Literal-Form
- **Pitfall #43 (Test-Assert-Bug-Hunting)**: Tests nutzen `cssBlock` ohne Prefix-Anchor
  (Single-Class-Selektoren), keine generischen File-Scoped-Asserts, `getByLabelText` statt
  `getByRole 'region'`
- **Pitfall #40 (Stale-Release-Status-Recommendation)**: M3d-Doku empfiehlt M3e (Spieler-Stats-Sidebar),
  aber M3e-Name ist FREI — `rg "m3e" src/` zeigt keine Kollision mit früheren Slices
- **Pitfall #41 (M-Library-Density > 100)**: 198 M-Test-Files, M3e ist Visual-Consolidation
  im Brettrund-Zentrum, nicht Duplikat einer bestehenden Konsolidierung
- **Pitfall #22 (M1dt-Dispens)**: Brettrund-Spielmat ist im Initial-State sichtbar,
  keine Vorbedingung nötig
- **Pitfall #33 (Test-Bug-Quartett)**: Test-Asserts prüfen CSS-Source + DOM-Präsenz
  (NICHT nur DOM-Count oder jsdom-getBoundingClientRect)
- **Pitfall #14 (Last-In-Chain-Migration)**: M9.5-W5 von `endsWith` auf `contain + indexOf >= 0`
  migriert, damit zukünftige M-Slices nicht mehr diesen Test migrieren müssen
- **Pitfall #41 (Live-Smoke-Dispens)**: Live-Smoke prüft Post-Deploy-Position der Spielmat
  (x: 200-1200, y: 250-720) — gefangen hat der 1. Layout-Bug, dass die Spielmat in
  `__schlangen` Subgrid bei y=876 landete statt im Brettrund-Zentrum
- **Pitfall #36 (M1dj-Subgrid-Discipline)**: Die Spielmat wanderte nach Post-Codex-Post-Deploy
  aus `__schlangen` (auto-Placement am Subgrid-Ende) in `__spielflaeche` Row 1 — explizit
  per `position: relative` + `grid-template-rows: auto minmax(0, 1fr)`-Konformität

## Geometrie-Arithmetik

Production-Viewport: 1280×900
Arenastein: 1031×450 px (im Brettrund-Zentrum)
`__spielflaeche`: grid-template-rows auto (Row 1) minmax(0, 1fr) (Row 2)
Spielmat (Row 1): 3.5rem-5rem (56-80 px) bei 1280×900-Viewport
Overlays + Schlangen-Subgrid (Row 2): 1fr-Rest (min-content der beiden Subgrid-Kinder)

Cap-Sum bei 1280×900: 80 (Spielmat) + ~400 (Overlays+Schlangen) + 56 (Schlangenlichtung-Padding)
= 536 px in __spielflaeche (clamp 14rem-20rem = 224-320 px) — **NICHT passend!**

Praktisch: der Arenastein-Cap (`clamp(22.5rem, 43vh, 26.5rem)` = 26.5rem = 424 px) clippt die
__spielflaeche + Kind overflow. Live-Smoke-Verify: Spielmat bei (x=362, y=599, w=694, h=94)
sichtbar im Brettrund-Zentrum, y=599 ist im sichtbaren Viewport-Bereich (700-750-900).

## Code-Review

**Reviewer:** Codex CLI gpt-5.5 via `codex exec --sandbox workspace-write`.
**1 BLOCKER** vom ersten Review-Pass:
1. Empty-State-Contract widersprach Slice-Spec "persistent sichtbare Spielmat" — **gelöst**:
   `if (anzahlEigenerSchlangen > 0) return null` entfernt, Hinweistext wird konditional variiert
   (Empty-State vs. Permanent-Spielmat-Text). Komponente persistent sichtbar.

**2 NON-BLOCKERS**:
1. M9.5-W5 strikt-prüfend auf "letzter Schritt" — **akzeptiert**: M3e-W5 prüft das
   explizit in dediziertem Smoke-Wiring-Test. Pitfall #14-Migration ist die
   bewusste Antwort auf diese Wartungsfalle.
2. Plan-Doku dokumentiert uncommitted state — **nicht relevant**: Doku wird nach
   Deploy aktualisiert (siehe unten).

**AFFIRMATIONS**: Container-Klasse korrekt, 3px dashed + forest-green + 3rem-radius,
Hexagon-SVG sichtbar, persistent sichtbar nach Blocker-Fix, Aria-Label korrekt,
keine Kollision mit M2z/M6a M3d M1dj M1dk Contracts.

## Post-Review-Layout-Fix (Pitfall #41 Live-Smoke-Catch)

Nach Codex-Review-Pass und erstem Live-Smoke-Lauf **fing der Live-Smoke einen Layout-Bug**:
die Spielmat war in `__schlangen` Subgrid bei `y=876` gelandet (unter dem 900-px-Viewport-Falz),
nicht im Brettrund-Zentrum. Root cause: M1dj hatte `__schlangen` mit
`grid-template-rows: auto`-Subgrid, die Spielmat bekam auto-Placement am Subgrid-Ende
(unter Schlangen-Onboarding), nicht oben.

**Fix:** Spielmat in `__spielflaeche` Row 1 (vor `__overlays` + `__schlangen`) migriert.
Cascade-CSS angepasst: 3.5rem min / 5rem max, kleinerer Hexagon (4.5rem×2.2rem),
kompakter Hinweistext mit white-space:nowrap. Re-Deploy + Re-Smoke: Spielmat jetzt bei
**(x=362, y=599, w=694, h=94)** — prominent im Brettrund-Zentrum, im 900-px-Viewport sichtbar.

**Lesson:** Pitfall #41 Live-Smoke ist der einzige Weg, Subgrid-Placement-Bugs zu fangen,
die CSS-Source-Asserts übersehen. `comm -23 /tmp/baseline /tmp/slice_fails` zeigt 0 neue
Failures, aber `getBoundingClientRect().y = 876 vs. erwartet 250-720` ist der wahre Beweis.

## Gates

| Gate | Ergebnis |
|---|---|
| RED-Tests (M3e) | 6/6 targeted grün |
| Smoke-Wiring-Tests (M3e-W) | 6/6 targeted grün |
| M9.5-W5-Migration | 5/5 M9.5-W grün |
| Typecheck | `npm run typecheck` ✅ |
| Lint | `npm run lint` ✅ |
| Build | `npm run build` ✅ |
| Full-Suite | `npm test -- --run` — 34 fails (== Baseline, 0 neue) |
| Baseline-Diff | `comm -23 /tmp/slice /tmp/baseline` = LEER |
| Live-Smoke (post-deploy) | `scripts/m3e_spielmat_boden_smoke.mjs` 8/8 grün |
| Position-Verify | Spielmat bei (x=362, y=599, w=694, h=94) im Brettrund-Zentrum |
| Review | Codex CLI ✅ (1 BLOCKER + 2 NON-BLOCKERS adressiert) |

## Commits

- `4c44474` — M3e initiale Implementation (6 RED-Tests + 6 Smoke-Wiring-Tests)
- `6c08df3` — M3e Layout-Fix: Spielmat aus __schlangen in __spielflaeche Row 1
  migriert (Post-Codex-Post-Deploy-Smoke-Catch), Cascade-CSS angepasst

## Live-Smoke (post-deploy)

`node scripts/m3e_spielmat_boden_smoke.mjs` gegen `https://schlangentanz-v2.vercel.app/game`:
- Container-Sichtbarkeit ✓
- 3px dashed border + forest-green color ✓
- border-radius 54px (54/16=3.375rem, im 3rem-Bereich) ✓
- Lime/forest gradient background ✓
- Position im Brettrund-Zentrum (y=599, viewport 900) ✓
- Hexagon-SVG sichtbar ✓
- aria-label="Waldtanz-Spielmat" ✓
- Console-/Page-Errors leer ✓

**8/8 Asserts grün.**

## Was sichtbar spielbarer wurde

- **Vor M3e:** Brettrund-Zentrum hatte eine 200×400px leere Lime-Box, der Spieler sah
  das zentrale Spielbrett nicht als "Hier spiele ich" — Magiekreise waren 222×169px
  kleine Container, Schlangenlichtung war 640px hoch mit Onboarding-Text gefüllt.
- **Nach M3e:** Eine **prominente 694×94px Spielmat-Box mit Hexagon-Symbol und
  "Hier deine erste Schlange ablegen"-Hinweis** sitzt im Brettrund-Zentrum zwischen
  Schlangenlichtung-Header und Magiekreisen. Sie sagt dem Spieler klar: "Das ist
  dein Spielbrett, hier wachsen deine Schlangen." Persistent sichtbar, ändert
  nur den Hinweistext je nach Schlangen-Anzahl.
- **Spielerlebnis:** Der Spieler sieht jetzt ein **echtes Spielbrett** mit klarer
  "Hier spielen"-Affordance, nicht eine Sammlung von Listen und Boxen. Die
  Hexagon-Silhouette ist die Stitch-konforme Drop-Zone-Visualisierung.

## Nächste mittlere Lücke

- **M3f** — Linke Spieler-Stats-Sidebar (FOR / SP / Punkte) konsolidieren zu EINER Stitch-Stats-Pille
- **M3g** — Obere rechte Status-Header (3 Karten-Stapel + eco-Karten + Zugtempo + Gegnerfokus) als kompakter Brettrand-Header-Indikator
- **M3h** — Schlangenlichtung-Boden-Stitch-Muster (echtes Spielmat-Look mit Eco-Symbolen als deko-Tiles)
- **M4** — Schlangenbuch-Visual-Refresh (Regeln/Spielbuch)
- **M6** — Engine-E2E-Mehrzug-Playability (echte Partie gegen die Spec)
