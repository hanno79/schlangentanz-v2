# M6a — Deine erste Schlange als Stitch-Waldlichtung-Onboarding

**Datum:** 28.06.2026
**Autor:** Hermes (autonomer Cron-Lauf, Job-ID `0cca22d2b825`)
**Slice-Klasse:** Stitch-Onboarding-Vertical-Slice (Schwester zu M5a Sieger-Party, M3c Sonniges-Nest-Player-Cards).
**Status:** 🟡 geplant — RED-Tests in Vorbereitung

## Zusammenfassung

M6a transformiert den bisher textlastigen Empty-State
`<div class="schlangen-startgarten">` mit "Noch keine eigene Schlange /
Wähle eine Handkarte..." zu einem echten **Stitch-Waldlichtung-Onboarding-Moment**:

- Grosse gezeichnete Schlange als Silhouette (dashed outline) — visuell
  klar: hier entsteht bald eine Schlange
- Pulsierende Drop-Zone in der Mitte der Silhouette (Stitch-Glow)
- "Deine erste Schlange"-Headline + Untertitel "Ziehe eine Handkarte
  in den leuchtenden Kreis"
- Schritt-Hint: "1) Handkarte wählen  →  2) Auf den leuchtenden Kreis
  ziehen" mit Stitch-Pillen-Style
- Onboarding-Verschwindet-Nach-Erster-Karte: sobald die Spielerin ihre
  erste Schlange gestartet hat (`aktiverSpieler.schlangen.length > 0`),
  wird der Onboarding-Block durch die normalen Schlangen-Listen ersetzt
- Reduzierte-Motion-Variante: kein Pulse, statische Silhouette
- A11y: aria-live="polite" für die Hinweis-Texte, region-Landmark
  für die Forest-Clearing

## Scope-Groesse

Mittlerer Vertical-Slice: ~3-4 Files, ~150-200 Zeilen Diff,
**10-12 RED-Tests**, 1 Live-Smoke mit Screenshot-Vergleich.

**Warum kein Mikro-Slice (Affordance-Politur)?** Der Erst-Spieler-Moment
ist die emotional wichtigste Sekunde — der Spieler sieht zum ersten Mal
seine leere Waldlichtung. Ein gut gestaltetes Onboarding ist der grösste
einzelne Spass-Sprung im Spiel. Es macht den Unterschied zwischen
"Hä, was klick ich jetzt an?" und "Ah, ich lege meine erste Schlange!"

**Warum kein Big-Bang?** Nur der Empty-State-Pfad wird umgebaut —
sobald `aktiverSpieler.schlangen.length > 0` greift der bestehende
Schlangen-Renderer. Reine Conditional-Render + neuer
Onboarding-Sub-Component + 1 CSS-Block. Kein Engine-Touch.

## Rein

1. **Neue Komponente** `<WaldtanzErsteSchlangeOnboarding>` (~50 Zeilen)
   - SVG-Schlange-Silhouette (dashed outline, 2:1 aspect ratio)
   - Pulsierende Drop-Zone (Stitch-Glow-Animation analog M2u Hand-Drop)
   - "Deine erste Schlange"-Headline
   - Schritt-für-Schritt-Pillen "Handkarte wählen → Auf Kreis ziehen"
2. **CSS-Block** in `App.css` (~80 Zeilen)
   - `.erste-schlange-onboarding` Container-Grid
   - `.erste-schlange-onboarding__silhouette` mit dashed-outline SVG
   - `.erste-schlange-onboarding__drop-ring` mit pulse-Animation
   - `.erste-schlange-onboarding__schritte` als Stitch-Pillen
   - `@media (prefers-reduced-motion: reduce)` Override
3. **Schlangenbereich.tsx** Empty-State ersetzen:
   ```tsx
   ) : istGameRoute ? (
     <WaldtanzErsteSchlangeOnboarding />
   ) : ( ... )
   ```
4. **Test-File** `src/App.m6a_erste_schlange_forest_clearing.test.tsx`
   - 10-12 RED-Tests inkl. Cascade-Override-Audit
5. **Live-Smoke** `scripts/m6a_erste_schlange_forest_clearing_smoke.mjs`
   - Screenshot-Vergleich vor/nach
   - Bounding-Box des Onboarding-Containers
   - Silhouette sichtbar + Drop-Ring pulsing
6. **Package.json** smoke:production wiring
7. **Release-Status-Doku** `docs/release_status_2026-06-28_m6a.md`

## Raus

- Engine-Logik
- Schlangen-Liste-Renderer (bestehender Pfad bleibt)
- HandkartenPanel-Touch
- AktionenPanel-Touch

## RED-Tests (geplant)

| Test | Vertrag |
|---|---|
| RED-1 | CSS-Source: `.erste-schlange-onboarding` Block existiert |
| RED-2 | CSS-Source: `.erste-schlange-onboarding__silhouette` mit dashed-outline |
| RED-3 | CSS-Source: `.erste-schlange-onboarding__drop-ring` mit pulse-Animation |
| RED-4 | DOM: ohne eigene Schlangen rendert `<WaldtanzErsteSchlangeOnboarding>` |
| RED-5 | DOM: mit eigenen Schlangen rendert KEIN Onboarding |
| RED-6 | DOM: Headline "Deine erste Schlange" sichtbar |
| RED-7 | DOM: Schritt-Pillen "Handkarte wählen" + "Kreis ziehen" sichtbar |
| RED-8 | DOM: aria-live Region mit "Ziehe eine Handkarte"-Hinweis |
| RED-9 | Reduced-Motion Override schaltet Pulse-Animation aus |
| RED-10 | Smoke-Wiring: package.json `smoke:production` enthaelt m6a-Skript |
| RED-11 | Live-Smoke: Onboarding-Container ≥ 30% Viewport-Breite, ≥ 25% Höhe |
| RED-12 | Cascade-Regression: keine spätere 0,1,0-Regel überschreibt Pulse |

## Risiken & Pitfalls (aus Skill)

1. **Cascade-Override-Audit** VOR Patch — `grep -n ".schlangen-startgarten" src/App.css`
   + `grep -n ".erste-schlange-onboarding" src/App.css`. Wenn pre-existing
   0,1,0 oder 0,2,0-Regel später steht, mit doubled-class 0,2,0 überschreiben.
2. **Reduced-Motion Pflicht** — Pulse-Animation MUSS in
   `@media (prefers-reduced-motion: reduce) { animation: none }` aus sein.
3. **Schlangen-Existing-Path nicht anfassen** — der Pfad
   `hatEigeneSchlangen ? <ul class="schlangenleiste">...</ul> : <empty>`
   MUSS unverändert bleiben. Nur der Empty-State-Sub-Component wechselt.
4. **Aria-Live-Korrektheit** — Hinweis-Politen-Region darf nicht zu
   häufig feuern (sonst Screenreader-Spam). Einmaliges Rendering beim
   Mount reicht.
5. **Budget: ~30 Tool-Calls** (1 slice-plan + 1 RED-Datei + 4-6 RED→GREEN
   + 1 typecheck + 1 lint + 1 build + 1 Smoke + 1 package.json + 1
   Kimi-Review + 1 Commit + 1 Push + 1 Deploy + 1 Live-Smoke + 1
   Release-Status).

## Naechste Luecken (nach M6a)

- **M6b — Handkarten-Board-Pille als Stitch-Faecher** unter dem Brett
  (visuelle Lift-Verbindung zur ersten Schlange)
- **M6c — Waldiger Brettrand-Backdrop** (kompletter Stitch-Forest-Look)
- **M6d — Gegner-Schlange-Glow** wenn sie an der Reihe ist
- **M6e — Brettschritt-Stempel als sichtbare Aktionen-Historie**
- **M6f — Partieuhr als Waldlichtung-Animations-Element**