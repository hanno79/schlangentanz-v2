# Slice-Plan M1ds — Waldtanz-Spielkarten-Heb-Dich-Hoch als sichtbarer Stitch-Spielmoment

**Datum:** 26.06.2026
**Slice-ID:** M1ds (Fortsetzung der M1-Waldtanz-Game-Board-Reihe, nach M1dq)
**Vorgaenger:** `1781f9f M1dq: Playability-Gate Evidence-Block`
**Klasse:** Game-Object-Affordance (Stitch-Spielkarten-Spielmoment — Hover-Lift + Selected-Lift + Tooltip)
**Production:** https://schlangentanz-v2.vercel.app

## Beobachtung (Click-Simulator-Diagnose)

Auf `/game` (Viewport 1280x900) ist die Handkartenleiste als `handkartenleiste--tiefenfaecher`
bereits ein sichtbarer Stitch-Spielkartenfächer mit Rotation und Tiefen-Lift (M1bx).
M1db hat den Lift der ausgewaehlten Karte auf `-1.4rem scale(1.05)` plus
`handkarte-wackelt`-Keyframe gesetzt. Das ist ein guter erster Schritt, aber:

- **Stitch-Referenz** (`der_waldtanz_game_board/code.html` Zeile 184-191, 240-262):
  - Hover: `hover:-translate-y-4 hover:scale-110` (sehr deutlich hochheben + groesser werden)
  - Selected: `-translate-y-8 scale-105 ring-2 ring-primary z-30` (fast doppelt so hoch)
  - Hover-Action-Hint: schwarze Pille mit weisser Schrift "Play Card" ueber der Karte
- **Aktueller Stand:** Hover-Lift nur `-1.25rem scale(1.08)` (M1bx-CSS-Zeile 5326),
  kein Hover-Tooltip, kein `Play Card`-Hinweis, Selected-Card-Lift nur
  `-1.4rem scale(1.05)` (M1db), Wackel-Animation vorhanden aber kein statischer
  "BEREIT"-Badge der den Spielmoment markiert.

Konsequenz: Beim Hovern ueber die Handkarten weiss der Spieler nicht klar,
dass Klick = spielen. Die Karten heben sich zwar leicht, aber nicht
ausreichend, um den "nimm-mich"-Affordance-Moment zu erzeugen.

## Ziel

Die Handkarten werden zu sichtbaren Stitch-Spielkarten mit drei klar
unterscheidbaren Affordance-Momenten:

1. **Hover-Moment** (Spieler hovert ueber Karte):
   - Karte hebt sich deutlich: `translateY(-2.5rem) scale(1.12)` (Stitch-Pattern)
   - Stitch-goldener Glow-Ring (`box-shadow: 0 0 0 5px rgba(254, 203, 0, 0.42)`)
   - **Sichtbarer "Karte spielen →"-Tooltip** als Stitch-Pille ueber der Karte
     (bg-inverse-surface = schwarze Pille, weisse Schrift, font-headline,
      Stitch-Pattern: `absolute -top-10 left-1/2 -translate-x-1/2`)
   - Transition 160ms ease

2. **Selected-Moment** (Karte wurde geklickt, wartet auf Brettziel):
   - Karte hebt sich NOCH hoeher: `translateY(-3.5rem) scale(1.18)` (Stitch-Pattern)
   - Wackel-Animation bleibt (M1db handkarte-wackelt)
   - Sichtbares "BEREIT"-Badge an der Karten-Unterkante (coral-rot Stitch-Pille)
   - Statt nur Glow: `box-shadow: 0 0 0 4px rgba(164, 222, 2, 0.62), 0 12px 0 var(--st-color-border-strong)`

3. **Focus-Moment** (Tastatur-Focus, Accessibility):
   - Gleicher Lift wie Hover (Keyboard-Nutzer bekommen dieselbe Affordance)
   - Outline-Ring 3px solid tertiary statt Glow

4. **Drag-Moment** (Karte wird gezogen, M1dh-Pattern):
   - Cursor `grabbing` (bereits implementiert)
   - Erhoehter Lift `translateY(-1rem) scale(1.05)` + rotation -2deg damit die Karte
     "schwebt" waehrend sie folgt

Engine, Legal-Aktionen, Aktionspfade, Drop-Zones (M1dl), Brettobjekte,
Sonderkarten-Spielmoment-Bubble (M1dq) und alle bestehenden Verträge
bleiben unveraendert.

## Warum mittlerer Slice, weder Mikroslice noch Big-Bang

- **Nicht Mikroslice:** Drei neue sichtbare Affordance-Momente (Hover/Selected/Focus) +
  Tooltip-Komponente (klein) + ~120 Zeilen neue CSS-Regeln + RED-Tests mit
  Klassen-Selector-Asserts + Production-Smoke mit echtem `page.hover()` +
  `getComputedStyle` + `elementFromPoint` + Smoke-Wiring. Insgesamt ~6-8
  Tool-Calls pro Phase + 1 RED-Test-File + 1 Smoke-Skript.
- **Nicht Big-Bang:** Keine Engine-Regel-Aenderung, kein neues Layout-Element,
  keine Aenderung der Brettobjekte, keine Karten-Logik-Aenderung. Die bestehende
  `HandkartenPanel.tsx` bekommt einen einzigen neuen Tooltip-Span pro Karte.
- **Nicht Repeat:** Bewusst andere Klasse als M1dq (Sonderkarten-Bubble),
  M1dl (Drop-Zone), M1d0-M1di (Layout-Konsolidierung). Hier: drei sichtbare
  Spielmomente auf den Handkarten, die bisher nur ein "leichtes Hochheben" hatten.
- **Spielwert sichtbar:** Der Spieler sieht jetzt klar: "Hover = nimm-mich!"
  und "Selected = bereit zum Ablegen". Die Hand fuehlt sich an wie ein
  echtes Kartenspiel, nicht wie eine Button-Liste.

## Rein

- `src/components/HandkartenPanel.tsx` — neuer `<span class="handkarte__spielhinweis">Karte spielen →</span>`-Tooltip
  (existiert bereits als Element, bekommt jetzt sichtbares Hover-Verhalten)
  und ein neuer `<span class="handkarte__bereit-badge">BEREIT</span>` fuer Selected-Karten
- `src/App.css` — neue Regeln `.handkarte__spielhinweis--sichtbar`,
  `.handkarte__bereit-badge`, `.handkarte__button--karte:hover`,
  `.handkarte__button--karte:focus-visible`, Anpassung
  `--handkarte-lift-y` und `--handkarte-selected-lift-y` Tokens
- `src/App.m1ds_waldtanz_spielkarten_hebdichhoch.test.tsx` (NEU, 5-7 RED-Tests)
- `scripts/m1ds_waldtanz_spielkarten_hebdichhoch_smoke.mjs` (NEU, Production-Smoke)
- `package.json` — `smoke:production`-Kette um M1ds-Smoke erweitert
- `docs/PLAYABILITY_GATE.md` — Evidence-Block fuer M1ds
- `docs/release_status_2026-06-26_m1ds.md` (NEU)

## Raus

- Nichts. Bestehende Animationen (handkarte-wackelt, handkarte-tiefenfaecher-wackelt) bleiben.
- Bestehende Hover-Lift-Regel (M1bx, -1.25rem scale(1.08)) wird durch
  neuen Wert (-2.5rem scale(1.12)) ersetzt — Verhalten aendert sich, Code-Stellen bleiben.

## Baseline layout numbers (vor M1ds)

Wird via temp probe gemessen vor CSS-Edit:
- Handkarte unselektiert: ~120x180px (clamp 6.35rem-8.25rem breit)
- Handkarte hover: lift auf -1.25rem, scale 1.08 (M1bx)
- Handkarte selected: lift auf -1.4rem, scale 1.05 (M1db) + wackel

## Akzeptanz

- RED-Tests gruen (5-7)
- Targeted-Tests gruen
- Full-Suite gruen (kein neuer Test-Bruch)
- Typecheck, Lint, Build gruen
- Smoke Pre-Deploy (BEFORE): hover zielt auf Karte, Computed-Style zeigt neuen lift
- Smoke Post-Deploy (AFTER): gleiche Verifikation auf production
- Vercel Production-Deploy + Live-Smoke gruen
- Code-Review (Kimi als Fallback) laeuft im Hintergrund
