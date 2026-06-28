# M2u — Handkarten-Drag-Glow auf Schlangenlichtung

**Datum:** 2026-06-28
**Slice-ID:** M2u
**Slice-Klasse:** Affordance-Mid-Slice (Drag-Reactive Brettobjekt)
**Branch:** main @ d26b002 (M2u Release)
**Production:** https://schlangentanz-v2.vercel.app
**Autor:** Hermes autonomer Cron-Lauf

## Problem

Der Spieler hat Handkarten und soll sie auf dem Brett ablegen. Die
Schlangenlichtung-Spielfläche hatte **kein sichtbares Drop-Feedback**:
wenn der Spieler eine Handkarte aus der Handbühne zog, blieb das gesamte
Brett visuell unverändert. Vorhandene Hinweise (M1dl Anlegeplatz,
M1df Steinkreis-Pulse, M2a Sonderkarten-Auto-Highlight) waren punktuell
auf einzelne Brettobjekte verteilt — das **übergeordnete Brett-Signal**
"Hier ist dein Spielbereich" fehlte.

## Visuelle Wirkung

- **Vorher:** Handkarte wird gezogen → keine sichtbare Reaktion des
  Bretts → Spieler muss raten, wohin.
- **Nachher:** Handkarte wird gezogen → die ganze Schlangenlichtung
  bekommt einen pulsierenden forest-grünen dashed Outline + sanften
  Scale-Pulse (1 → 1.012 → 1, 1.2s loop). Der Spieler sieht sofort:
  "Hier wird gespielt".

## Slice-Identifikation

- **Rein:** State-Wiring `handkarteDragAktiv` in App.tsx via
  `onKarteDragStart`/`onKarteDragEnd` aus HandkartenPanel. Neuer
  `data-drag-aktiv`-Prop auf `WaldtanzSchlangenlichtung`. Neue
  CSS-Regel mit Keyframe + Reduced-Motion-Override in App.css.
  `position: relative` als containing-block Ergänzung für zukünftige
  absolute Drop-Indikator-Children.
- **Raus:** Engine-Änderungen, neue Drop-Target-Logik, Layout-Reorg,
  M2a-Auto-Highlight (existiert bereits), M1dq-Spielmoment-Bubble
  (existiert bereits), M1dl-Anlegeplatz-Dropzone (existiert bereits).

## Warum mittlerer Vertical-Slice (kein Mikro, kein Big-Bang)

- **Mikro wäre:** nur die CSS-Keyframe hinzufügen ohne State-Wiring.
  → Wirkungslos, weil der State nicht propagiert würde.
- **Big-Bang wäre:** komplette Drag-&-Drop-Infrastruktur mit
  Multi-Target-Highlighting und Legality-Indikator pro Karte.
  → Riskant, viele Stellen, schwer testbar.
- **M2u ist die richtige Mitte:** State-Wiring + visueller
  Brett-Rim + Reduced-Motion = genau **eine sichtbare neue
  Affordance** mit klar messbarem Drop-Signal.

## Implementation

### `src/App.tsx`

Neuer `useState<boolean>` `handkarteDragAktiv` (initial `false`).
Setter in `onKarteDragStart` und `onKarteDragEnd`:

```tsx
onKarteDragStart={(karteId) => {
  gezogeneHandkarteIdRef.current = karteId
  setAusgewaehlteHandkarteAuswahl({ spielerId: aktiverSpieler.id, karteId })
  setHandkarteDragAktiv(true)  // NEU
}}
onKarteDragEnd={() => {
  gezogeneHandkarteIdRef.current = null
  setAusgewaehlteHandkarteAuswahl(null)
  setHandkarteDragAktiv(false)  // NEU
}}
```

Prop-Durchreichung an `<WaldtanzSchlangenlichtung handkarteDragAktiv={...} />`.

### `src/components/WaldtanzSchlangenlichtung.tsx`

Neuer optionaler Prop `handkarteDragAktiv?: boolean` (default `false`).
Rendering:

```tsx
<div ... data-drag-aktiv={handkarteDragAktiv ? 'true' : 'false'}>
```

Wichtig: expliziter `'false'`-Default (nicht `undefined`), damit
RED-1 als Default-Assertion prüfbar bleibt. Kimi-N4-Hinweis wurde
im Slice-Plan dokumentiert.

### `src/App.css`

1. **`position: relative` Ergänzung** auf der Basis-Regel
   `.waldtanz-schlangenlichtung` (Zeile 10088). Cascade-Schutz:
   alle bestehenden Layout-Props bleiben unverändert.

2. **Neue Drag-aktiv-Regel** (specificity 0,2,0 = Class + Attribut):

```css
.waldtanz-schlangenlichtung[data-drag-aktiv="true"] {
  animation: waldtanz-lichtung-drag-glow 1.2s ease-in-out infinite;
  outline: 3px dashed #4b6700;
  outline-offset: 4px;
  border-radius: 1.2rem;
}

@keyframes waldtanz-lichtung-drag-glow {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(75, 103, 0, 0.0);
  }
  50% {
    transform: scale(1.012);
    box-shadow: 0 0 0 6px rgba(75, 103, 0, 0.18);
  }
}
```

3. **Reduced-Motion-Override**:

```css
@media (prefers-reduced-motion: reduce) {
  .waldtanz-schlangenlichtung[data-drag-aktiv="true"] {
    animation: none;
  }
}
```

Outline bleibt sichtbar als statisches Drop-Signal.

## Tests (RED → GREEN)

**7 RED-Tests in `src/App.m2u_hand_drop_glow.test.tsx`:**

| Test | Was es beweist |
|---|---|
| M2u:1 | `data-drag-aktiv="false"` als Default-Idle-Zustand |
| M2u:2 | `data-drag-aktiv="true"` nach `fireEvent.dragStart` einer Handkarte |
| M2u:3 | `data-drag-aktiv="false"` nach `fireEvent.dragEnd` (Drag zurückgesetzt) |
| M2u:4 | CSS-Source enthält `.waldtanz-schlangenlichtung[data-drag-aktiv="true"]` mit `animation: waldtanz-lichtung-drag-glow` |
| M2u:5 | `@keyframes waldtanz-lichtung-drag-glow` mit `scale()` + `box-shadow`/`var(--st-color-primary)`/`#4b6700`/`#063907` |
| M2u:6 | `@media (prefers-reduced-motion: reduce)` Block setzt `animation: none` auf dem Drag-Selector |
| M2u:7 | `package.json` enthält `m2u_hand_drop_glow_smoke` in smoke:production-Kette |

**Ergebnis:** `Tests 7 passed (7)`. Plus CSS-Source-Helper
(`alleRegelBloecksFuer`) für robuste Selector-Lookups inkl.
`@media`-Block-Scoping (`reducedMotionBody`).

## Code-Review

**Reviewer:** Kimi Code CLI v0.18.x (Kimi K2.7) via `kimi -p`
**Watchdog-Output:** `{"codex":"NOT_FUNCTIONAL","kimi-cli":"OK"}` —
Codex-CLI stdin-Mode blockiert (OAuth-Quota), Kimi als Fallback.
**Review-Fokus:** 8 Punkte (Cascade-Override, position-relative-Trap,
Drag-State-Konsistenz, Default-Assertion, Keyframe-Vollständigkeit,
Reduced-Motion, Smoke-Regex, Veracity-Gate).

**Kimi-Resultat:**
- **0 BLOCKERS**
- **8 NON-BLOCKERS:** alle affirmativ oder kleine Polish-Hinweise.

**Kimi N4** (Plan-Konsistenz): Slice-Plan schrieb `undefined`-Default,
Implementation nutzt expliziten `'false'`-Default für RED-Testbarkeit.
Im Slice-Plan dokumentiert (Commit-Worktree-Fix).

**Kimi N7** (Smoke-Regex): Outline-color-Regex `/75|103|0|4b6700/...`
war zu permissiv (`0` matched fast jede Farbe). Fix:
`/^rgba?\(\s*75\s*,\s*103\s*,\s*0|#4b6700/i` mit strict Anchors.
**Gefixt** in `scripts/m2u_hand_drop_glow_smoke.mjs:81`.

**Kimi N1, N2, N5, N6, N8:** bestätigt sauber (Cascade-Override keine,
position-relative-Trap nicht ausgelöst weil `.schlangekarte__karte`
schon relative ist, Keyframe interpoliert sauber, Reduced-Motion
beabsichtigt, Veracity-Gate OK weil Glow nur bei tatsächlichem Drag
aus HandkartenPanel feuert).

## Gates (alle grün)

| Gate | Status |
|---|---|
| Targeted RED-Tests | 7/7 ✓ |
| `npm run check:test-lines` | OK ✓ |
| `npm run typecheck` | OK ✓ |
| `npm run lint` | OK ✓ |
| `npm run build` | OK ✓ (vite, 102 modules) |
| `npm test -- --run` (full suite) | 28 failed / **1277 passed** (+7 M2u-Netto-Positive) |
| Pre-existing failures via `git stash -u` isoliert | identisch zu HEAD-Basislinie (28 failed / 1270 passed) ✓ |
| `git diff --check` | OK ✓ |

**Empirischer Net-Effekt:** +7 RED-Tests grün, 0 neue roten Tests.
Pre-existing failures (M1a/M1aj/M1ak/M1aw/M1ca/M1cm/M1cn/M1co/M1cp/
M1cq/M1d/M1da/M1dc/M1g/M1k/M1l/M2c/M2f/M2k/M2m/M2q/R136/R181/R183)
sind alle unabhängig von M2u (separat via `git stash -u` + re-run
verifiziert: 28 failed / 1270 passed im Stash-Zustand).

## Production-Smoke

**Live-Verifikation auf https://schlangentanz-v2.vercel.app/game:**

```
--- M2u Hand-Drag-Glow @ 1280x900 ---
  Schlangenlichtung: 974.45x639.75 px @ (221.5,212.4)
  Idle animationName: none ✓
  Drag animationName: waldtanz-lichtung-drag-glow ✓
  Drag outline: dashed 3px rgb(75, 103, 0) offset=4px ✓
  Nach Idle-Reset animationName: none ✓
--- M2u Hand-Drag-Glow @ 1100x800 ---
  Schlangenlichtung: 809.33x636.69 px @ (213.3,177.3)
  Idle animationName: none ✓
  Drag animationName: waldtanz-lichtung-drag-glow ✓
  Drag outline: dashed 3px rgb(75, 103, 0) offset=4px ✓
--- M2u Reduced-Motion @ 1280x900 ---
  Reduced-Motion Drag animationName: none (Override greift) ✓
M2u Hand-Drop-Glow: ERFOLGREICH
```

**Beobachtete Werte:**
- Schlangenlichtung ist 974×640 px bei 1280×900 (groß und zentral)
- Outline `dashed 3px rgb(75, 103, 0)` (= `#4b6700` Stitch-forest-green)
- Scale-Pulse 1.012x (subtil aber sichtbar)
- 0 console-Errors, 0 page-Errors

## Spielerische Wirkung

Vorher: Spieler zieht Handkarte → nichts passiert auf dem Brett →
Spieler zögert oder klickt planlos auf Brettobjekte.

Nachher: Spieler zieht Handkarte → das ganze Brett signalisiert
"Hier droppen" mit forest-grünem pulsierendem Rim. Der
Aktionsdruck reduziert sich messbar, weil das **Ziel klar ist**,
bevor der Spieler überhaupt loslässt. Selbst wenn der Drop nicht
legal ist, hat der Spieler das visuelle Feedback "ich bin im
richtigen Bereich" — die Drop-Logik (M1dl) kann danach separat
entscheiden ob der Anlegeplatz highlighted wird.

Veracity: Der Glow ist **kein Legality-Indikator**. Er sagt nur
"hier ist dein Spielbereich". Legale Drop-Targets werden separat
durch M1dl/M2a hervorgehoben. Diese Trennung ist im Sinne der
Stitch-UI: erst Brett-Affordance, dann Karten-Legality. Kimi-N8
bestätigt diese Trennung als beabsichtigt.

## Commits

```
d26b002 M2u: Handkarten-Drag-Glow auf Schlangenlichtung (7 RED-Tests, Kimi-Review OK)
5369c13 M2s: Smoke-Script-Bugfix (display:undefined) + Release-Status-Doku mit Kimi-Disclosure (Vorgaenger)
```

## Naechste Luecke (M2v / M3a / M2w)

**Naechster mittlerer Vertical-Slice in der M2/M3-Familie** —
keine Mikro-Slices, keine ID-Collision mit existierenden M1/M2.
Mögliche Optionen für Folge-Slice:

1. **M2v — Brettrand-Zugknopf als Stitch-Hero-Bubble:**
   Der "End Turn"-Knopf ist aktuell ein unscheinbarer Text-Button.
   Im Stitch-Stil wäre er eine grosse coral-orange Pill mit Icon,
   pulsierender Hover-Glow, "Dein Zug"-Eyebrow. Macht den
   Phasen-Wechsel zum visuellen Hauptereignis. ~50 Zeilen CSS + 1
   Komponente, 6-8 RED-Tests.

2. **M3a — Spielstart-Stitch mit 1–3 KI-Gegnern:**
   Die `Sonniges Nest`-Lobby referenziert eine Spielstart-UI mit
   Spieler-Auswahl (1 Spieler + 1-3 KI). Aktuell zeigt die Lobby
   nur "Starten". Echter Spielstart-Screen mit Avatar-Auswahl +
   KI-Difficulty-Slider im Stitch-Stil. Größerer Slice (~6-8 Files),
   aber grosser UX-Wert für Erst-Spielerlebnis.

3. **M2w — Sonderkarten-Brettziel-Detail-Layer:**
   M2a zeigt das Brettziel bei Sonderkarten-Auswahl, aber zeigt
   nur den Namen. Im Stitch-Stil wäre das ein erweitertes
   Hover-Tooltip mit Icon, Erklärung und "Ziel bestätigen"-CTA.
   ~40 Zeilen CSS + 1 Komponente, 5-7 RED-Tests.

**Empfehlung M2v** (Brettrand-Zugknopf-Stitch-Hero) als nächster
Slice: gleicher Affordance-Mid-Slice-Stil wie M2u, deutlich
sichtbares Ergebnis, kleines Risiko (kein Engine-Touch), gut
kombinierbar mit M3a in der nächsten Sitzung.
