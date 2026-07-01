# M3e — Waldtanz-Spielmat-Boden (sichtbare "Hier spielen"-Affordance im Brettrund-Zentrum)

**Slice-ID:** M3e
**Datum:** 2026-07-01
**Klasse:** M-Visual-Consolidation (Schwester zu M2y, M2z, M3a, M3b, M3d — Brettrund-Consolidation).
**Vorgänger:** M3d (Brettrand-Zugleiste als konsolidierte Aktionsleiste), M2y (Gegnerlichtung-Leerlauf), M2z (Magiekreise), M6a (Erste-Schlange-Onboarding), M2w (Brettrand-Zugseitenleiste), M2x (Brettrand-Hand-Hero).
**Reviewer:** Codex CLI (Standard, codex=OK, Kimi RATE_LIMITED).
**Disclosure:** Pitfall #12 (User-Time-Preference) — Slice wird lokal vollständig verifiziert + Codex-Review.

## Problem (mit Beweisen)

Der `/game`-Screen im Production-Browser (Viewport 1280×900) hat im Brettrund-Zentrum
(`.waldtanz-arenastein`, 1031×450 px groß) eine **visuell leere Zone** zwischen
dem Schlangenlichtung-Kopf (Headline + Plakette) und den Magiekreisen (3 kleine
Kreise als Drop-Zones für Sonderkarten).

Visuelle Diagnose (vom `vision_analyze` Production-Screenshot):
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

Aktueller Production-Stand hat die 2 dashed-Kreise (M3d-Ära, in `waldtanz-arenastein::before` und `::after`),
aber sie sind 80-100px kleine Pseudo-Elemente, nichtige deko-Indikatoren am Rand,
nicht das prominente "Hier deine Schlange"-Element, das die Stitch-Referenz zeigt.

## Rein (dieser Slice)

1. **Neue Komponente `WaldtanzSpielmatBoden`** (~40 Zeilen TSX) als
   sichtbare Stitch-Spielmat-Box im Brettrund-Zentrum:
   - Wird in `WaldtanzSchlangenlichtung` zwischen Kopf und Magiekreise gerendert
   - Zeigt eine **große zentrale gestrichelte Hexagon-Silhouette** als "Hier deine
     Schlange"-Drop-Zone-Indikator
   - Hat eine **konditionale Sichtbarkeit**: sichtbar wenn `aktiverSpieler.schlangen.length === 0`,
     verschwindet sobald der Spieler seine erste Schlange hat
   - Hat `aria-label="Waldtanz-Spielmat"` für Screen-Reader
2. **CSS für `.waldtanz-spielmat-boden`**:
   - 3px forest-green border (`var(--st-color-border-strong)`)
   - Dashed border-style (signalisiert "Hier ablegen")
   - Border-radius für Hexagon-Optik (6-Werte: 50% 50% 50% 50% / 25% 25% 25% 25% via clip-path oder border-radius)
   - Lime-Gradient-Background (passt zum Arenastein-Boden)
   - Padding 1.5rem, min-height 6rem
   - Animation: dezenter Pulse (3s ease-in-out infinite) auf der inneren Silhouette
3. **Reduced-Motion-Override** für die Pulse-Animation
4. **Wiring in `WaldtanzSchlangenlichtung.tsx`**: Komponente zwischen
   `<div className="waldtanz-schlangenlichtung__spielflaeche">` und der Magiekreise rendern
5. **Pre-existing Verträge preserved**:
   - M2z: min-height + grid-template-columns auf `.waldtanz-magiekreise` UNVERÄNDERT
   - M6a: `.erste-schlange-onboarding`-Regeln UNVERÄNDERT
   - M3d: `.waldtanz-zugseitenleiste`-Border-Absorption UNVERÄNDERT
   - M1dj: `.waldtanz-arenastein__spielfeld` flex: 1 1 auto UNVERÄNDERT

## Raus

- **Engine-Logik** (keine Spielregel-Änderung, keine Aktion-Handler-Änderung)
- **Andere Sektionen** (M3a/M3b Handkarten, M2w Brettrand-Zugseitenleiste, M1ao
  Spieler-Stats bleiben unangetastet)
- **Lobby** (M3a-Player-Cards bleiben unangetastet)
- **Onboarding-Komponente** (M6a bleibt parallel da — die Spielmat-Box ist die
  sichtbare "Hier spielen"-Affordance, das Onboarding ist die textuelle
  Schritt-für-Schritt-Anleitung, beide können koexistieren)
- **Magiekreise-Position** (M1dj-Grid-Layout bleibt unverändert)
- **Schlangen-Onboarding-Verschwinden-Logik** (M6a hat eigene `aktiverSpieler.schlangen.length > 0`-Gating)

## Pitfall-Checks (gemacht)

- **Pitfall #30 (Additive-Override)**: Neue CSS-Regel nur auf `.waldtanz-spielmat-boden`
  (single class, eigene Komponente, keine Kollision mit `.waldtanz-magiekreise` oder
  `.erste-schlange-onboarding`)
- **Pitfall #32 (CSS-Kommentar)**: Cascade-Kommentar in Worten, KEINE `.klasse { property: value }`-Literal-Form
- **Pitfall #43 (Test-Assert-Bug-Hunting)**: Tests nutzen `cssBlock` mit `class~=`-Anchor
  (Pitfall #36-Konvention), keine generischen File-Scoped-Asserts, keine `aside`-vs-`region`-Verwechslung
- **Pitfall #40 (Stale-Release-Status-Recommendation)**: M3d-Doku empfiehlt M3e
  (Spieler-Stats-Sidebar), aber M3e-Name ist FREI — `rg "m3e" src/` zeigt keine
  Kollision mit früheren Slices
- **Pitfall #41 (M-Library-Density > 100)**: 198 M-Test-Files, M3e ist Visual-Consolidation
  im Brettrund-Zentrum, nicht Duplikat einer bestehenden Konsolidierung
- **Pitfall #22 (M1dt-Dispens)**: Brettrund-Spielmat ist im Initial-State sichtbar,
  keine Vorbedingung nötig
- **Pitfall #33 (Test-Bug-Quartett)**: Test-Asserts prüfen CSS-Source + DOM-Präsenz
  (NICHT nur DOM-Count oder jsdom-getBoundingClientRect)

## Geometrie-Arithmetik

Production-Viewport: 1280×900
Arenastein: 1031×450 px (im Brettrund-Zentrum)
Bisherige Schlangenlichtung-Cap: `clamp(22.5rem, 43vh, 26.5rem)` = 26.5rem = 424px max
Neue Spielmat-Box: min-height 6rem (96px) innerhalb des Brettrund-Arenasteins

Cap-Sum: 96 (Spielmat) + 169 (Magiekreise) + Rest (Schlangen-Onboarding, max 159px)
passt locker in 450px Arenastein. **Kein Cap-Konflikt.**

## Code-Review-Plan

**Reviewer:** Codex CLI gpt-5.5 (Standard)
**Brief:** Vollständiger Diff (inkl. untracked files) + Test-Output + Anweisung "do not
commit, do not push, do not deploy - only write the file/respond". Erwarte BLOCKERS
zu Cascade-Konflikten mit M2z/M6a, NON-BLOCKERS zu Test-Assert-Form.

## Gates

| Gate | Ergebnis |
|---|---|
| RED-Tests (M3e) | 6/6 targeted grün |
| Typecheck | `npm run typecheck` ✅ |
| Lint | `npm run lint` ✅ |
| Build | `npm run build` ✅ |
| Full-Suite | `npm test -- --run` — 34 fails (== Baseline, 0 neue) |
| Baseline-Diff | `comm -23 /tmp/slice /tmp/baseline` = LEER |
| Live-Smoke | `node scripts/m3e_spielmat_boden_smoke.mjs` ✅ |
| Review | Codex CLI ✅ (BLOCKERS adressiert) |

## Commits

- `M3e: Waldtanz-Spielmat-Boden — sichtbare "Hier spielen"-Affordance im Brettrund-Zentrum (6 RED-Tests, Codex-Review passed)`
- `docs: M3e Release-Status-Doku + Playability-Gate-Evidence`

## Live-Smoke (post-deploy)

`node scripts/m3e_spielmat_boden_smoke.mjs` gegen `https://schlangentanz-v2.vercel.app/game`:
- Container-Sichtbarkeit + 3px-Border + Dashed-Style
- aria-label="Waldtanz-Spielmat"-Verify
- Im Brettrund-Zentrum (x: ~225-1195, y: ~280-720, also IM Arenastein)
- Console-/Page-Errors leer
- Sichtbar im Initial-State (kein Schlange-State-Setup nötig — Brettrund ist immer da)

## Nächste mittlere Lücke

- **M3f** — Brettrand-Status-Header oben (3 Karten-Stapel-Indikatoren + eco-Karten) als kompakte Stitch-Header-Pille
- **M3g** — Spieler-Stats-Sidebar links (FOR / SP / Hand / Quest) konsolidieren zu EINER Stitch-Stats-Pille
- **M4** — Schlangenbuch-Visual-Refresh
- **M6** — Engine-E2E-Mehrzug-Playability (echte Partie gegen die Spec)
