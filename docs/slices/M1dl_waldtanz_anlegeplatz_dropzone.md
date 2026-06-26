# M1dl — Waldtanz-Anlegeplatz als pulsierendes Drop-Ziel mit Richtungspfeil

> **Status:** Plan (cron-run 26.06.2026 lokal).
> **Vorgänger:** M1g (Spielerplakette-Konsolidierung, 28886de) / M1f (Handbuehne).
> **Nachfolger:** offen — naechster Stitch-Brett-Vertical.
> **Slot:** M1dl (frei, nach M1dk Phasen-Banner).
> **Typ:** Sichtbarer Brettschritt-Affordance-Slice (Engine-Touchpoint nein, Engine-Regeln nein, Layout nein, CSS+JSX-Optik ja).

## Ausgangslage (was die Spielerfahrung heute noch Click-Simulator-haft macht)

Aktuell rendert der Schlangenbereich pro eigener Schlange und pro
anlegbarer Handkarte einen `<button class="schlangekarte__anlegeplatz">`,
der das Anlegeziel zwar als gestricheltes Pill mit Stitch-Border markiert,
aber **rein textuell** ist:

- `Linkes Ende` / `Rechtes Ende` als Label
- keine sichtbare **Richtungs-Affordance** (Pfeil-Ikon)
- kein **Pulsieren** der Anlegeplatz-Kachel selbst, wenn sie das Ziel
  fuer die aktuell ausgewaehlte Handkarte ist (das Pulsieren sitzt heute
  auf der Schlange, nicht auf dem Anlegeplatz)
- kein **Hover-Lift** der Anlegeplatz-Kachel beim Ueberfahren mit der Maus
- der "Anlegekarte"-Vorschaubereich ohne ikonische Richtung

Im Stitch-Game-Board sind die Drop-Zones als **pulsierende gestrichelte
Kreise mit `+` / `star` Material-Symbol** sichtbar; jeder Hover triggert
eine Lift + Glow Reaktion. Der Wechsel von statischem Text-Pill zu
**animiertem Spielobjekt-Drop-Target** ist genau die Affordance, die
eine Spielkarte als interaktives Brett-Element lesbar macht.

## Ziel-Slice (was sichtbar/spielbarer wird)

Pro Anlegeplatz auf `/game`:

1. **Richtungs-Pfeil** (`←` fuer `links`, `→` fuer `rechts`) als
   sichtbares Icon-Kind neben dem Text-Label — klar als
   "Hier-an-diesem-Ende-anlegen"-Affordance lesbar.
2. **Pulsierende Drop-Zone** wenn die Anlegeplatz-Kachel das Ziel fuer
   die aktuell ausgewaehlte Handkarte ist — eigene Klasse
   `schlangekarte__anlegeplatz--ziel-puls`, die die bestehende
   `zielkreis-pulsiert` Animation nutzt (oder eine neue, langsamere
   `anlegeplatz-puls` Animation falls die Look-Charakteristik leicht
   abgesetzt sein soll von der Schlange selbst).
3. **Hover-Lift** der Kachel bei `:hover` und `:focus-visible`:
   `transform: translateY(-3px) scale(1.04)`, plus staerkerer Hard-Shadow.
4. **Vorschau-Pille** (das `--ausgewaehlt`-Pendant) bekommt ebenfalls
   einen Richtungspfeil als Icon-Kind, so dass die Vorschau direkt
   "Karte nach links/rechts anlegen" sagt.

## Engine-Touchpoint

`nein` — nur JSX (Icon-Kind hinzufuegen) + CSS (neue Klassen +
Animation + Hover-Regel). Bestehende aria-labels, Bestehende
Engine-Aktion-Handler, bestehende Klassen-Hierarchie und
bestehende M1m-Asserts bleiben unveraendert.

## Rein (was hinzukommt)

- `src/components/Schlangenbereich.tsx`: je ein `<span class="schlangekarte__anlegeplatz-pfeil" aria-hidden="true">` mit `←` bzw. `→` neben dem `richtung`-Span und in der Vorschau-Pille.
- `src/App.css`: 
  - `.schlangekarte__anlegeplatz-pfeil { font-family: var(--st-font-headline); font-size: 1.4rem; line-height: 1; }`
  - `.schlangekarte__anlegeplatz--ziel-puls { animation: anlegeplatz-puls 1.4s ease-in-out infinite; }`
  - `@keyframes anlegeplatz-puls { 0%, 100% { transform: rotate(var(--anlegeplatz-rotate, 0deg)) scale(1); box-shadow: 0 4px 0 var(--st-color-border-strong); } 50% { transform: rotate(var(--anlegeplatz-rotate, 0deg)) scale(1.04); box-shadow: 0 6px 0 var(--st-color-border-strong), 0 0 0 6px rgba(254, 203, 0, 0.32); } }`
  - `.schlangekarte__anlegeplatz--links { --anlegeplatz-rotate: -2deg; }`
  - `.schlangekarte__anlegeplatz--rechts { --anlegeplatz-rotate: 2deg; }`
  - `.schlangekarte__anlegeplatz:hover, .schlangekarte__anlegeplatz:focus-visible { transform: rotate(var(--anlegeplatz-rotate, 0deg)) translateY(-3px) scale(1.04); box-shadow: 0 8px 0 var(--st-color-border-strong), 0 0 0 5px rgba(164, 222, 2, 0.34); }`
  - Reduced-Motion-Override in der bestehenden `@media (prefers-reduced-motion: reduce)` Sektion.

## Raus (was wegfaellt)

- Nichts. Bestehende Klassen, aria-labels, Engine-Pfade und M1m-Asserts bleiben unveraendert.

## Akzeptanz / RED-Tests

`src/App.m1dl_waldtanz_anlegeplatz_dropzone.test.tsx` mit 3 RED-Tests:

1. **DOM-Vertrag (sichtbares Richtungspfeil-Icon):** beide Anlegeplaetze
   enthalten ein `<span class="schlangekarte__anlegeplatz-pfeil"
   aria-hidden="true">` mit Text `←` bzw. `→`; das Element ist sichtbar
   (`getByText('←')` innerhalb des `links`-Anlegeplatzes, `→` im
   `rechts`-Anlegeplatz).
2. **CSS-Vertrag (Pulse + Hover-Lift):**
   - `.schlangekarte__anlegeplatz--ziel-puls` deklariert `animation:`.
   - `@keyframes anlegeplatz-puls` existiert mit `scale(`.
   - `.schlangekarte__anlegeplatz:hover` deklariert `transform: ... translateY(-3px) scale(1.04)`.
   - `.schlangekarte__anlegeplatz:focus-visible` ebenfalls.
   - `.schlangekarte__anlegeplatz--links { --anlegeplatz-rotate: -2deg; }` (oder inline CSS-var declaration analog fuer rechts).
3. **Smoke-Wiring:** `package.json` `smoke:production`-Kette enthaelt
   `scripts/m1dl_waldtanz_anlegeplatz_dropzone_smoke.mjs` (RED-Hardening-Test analog M1f/M1dk).

## Smoke (Production)

`scripts/m1dl_waldtanz_anlegeplatz_dropzone_smoke.mjs`:

- Browser oeffnet `/game`, klickt erste Farbkarte in der Hand.
- Prueft via `getBoundingClientRect` + `getComputedStyle`:
  - Linker + rechter Anlegeplatz haben einen sichtbaren
    `.schlangekarte__anlegeplatz-pfeil` mit Text `←` / `→`.
  - Beide `.schlangekarte__anlegeplatz` haben `border-radius`, `box-shadow`,
    `border-style: dashed` (Stitch-Optik).
  - Auf Hover simuliert (`page.hover('.schlangekarte__anlegeplatz--rechts')`)
    wird `transform` nicht-trivial (enthaelt `translateY` und `scale`).
- Prueft: keine console/page-Errors.

## Out-of-Scope (was M1dl NICHT macht)

- Engine-Regeln
- Layout-Aenderungen am Brettschritt (Schlangenbereich bleibt wo er ist)
- Andere Sonderkarten-Ziel-Affordances (Farbenfusion/Schlangenfrass etc.
  bleiben in M2g-Range; M1dl ist nur fuer Basis-Farbkarten-Anlegeplatz)
- A11y-Mikroslices (focus-visible bleibt vorhanden, neue label-Texte nicht)