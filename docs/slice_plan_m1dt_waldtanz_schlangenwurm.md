# M1dt — Waldtanz-Schlangenwurm (sichtbare lebendige Schlange)

**Slice-ID:** M1dt (Fortsetzung der M1-Waldtanz-Game-Board-Reihe, nach M1ds)
**Production:** https://schlangentanz-v2.vercel.app
**Klasse:** Affordance-Mid-Slice (sichtbarer lebendiger Schlangenkörper — Stitch-Worm mit Kopf-Augen, Body-Verbindung, Schwanz-Curl + Wriggle)

## Motivation

Nach M1ds (Spielmoment der Handkarten mit Hover-Lift, Selected-Lift, BEREIT-Badge) ist die nächste grosse "Click-Simulator → echtes Spiel"-Lücke: die eigenen Schlangen auf dem Brett. Aktuell sind das flache Kartenreihen mit Mini-Rotationen (`translateY(-0.25rem) rotate(-2deg)` für Kopf, `translateY(0.25rem) rotate(2deg)` für Schwanz), aber sie wirken NICHT wie eine lebendige Schlange — sie wirken wie eine "leicht gestaffelte Button-Liste".

Der Stitch-Waldtanz-Game-Board zeigt eine **lebendige Schlange** als zentrales Spielelement: einzelne Karten sind Glieder eines Wesens, das sich wellenförmig durch das Brett schlängelt. M1dt soll genau diesen Effekt liefern, ohne Engine, Spiellogik, Anlegeplätze (M1dl), Sonderkarten-Bubble (M1dq) oder Spielmoment (M1ds) anzufassen.

## Sichtbarer Spielwert (Before/After)

| Element | Vor M1dt | Nach M1dt |
|---|---|---|
| Schlange als Ganzes | 5 Karten in einer Reihe mit Mini-Rotationen | 5 Karten als Körper-Glieder mit sichtbarer Schlange-Linie, Kopf-Augen + Schwanz-Curl, wellenförmiger Bewegung wenn aktiv |
| Kopf | `translateY(-0.25rem) rotate(-2deg)` | Augen (zwei weisse Punkte mit dunklen Pupillen) + lächelnder Mund + leicht angehobene Stirn |
| Körper | Mini-Offset `translateY(0.12rem)` per `:nth-child(2n)` | sichtbare Schlange-Haut-Brücke zwischen den Karten (organische Wellenlinie) + leichter Pulse |
| Schwanz | `translateY(0.25rem) rotate(2deg)` | eingerollt (curl nach oben) + kleinere Karte + Pfeilspitze |
| Aktiv-Indikator | nichts | sanftes Wriggle (wellenförmiges Schaukeln) wenn `aktiverSpieler` und `aktivePhase` = "Ausspielphase" |

Visuelle Differenz: die eigenen Schlangen sehen jetzt aus wie **ein einziges Lebewesen** auf dem Brett, nicht wie eine sortierte Karten-Liste. Head-to-tail Bewegung macht den "ich wachse"-Spielmoment direkt sichtbar.

## Scope (Rein/Raus)

### Rein

1. **Schlangenkörper-Brücke** in `src/App.css` als SVG-/CSS-Pfad zwischen den Karten einer Schlange. Sichtbar als wellenförmige Linie (Forest-Green dashed, lime unterlegt). Element-Klasse `.schlangekarte__kartenreihe--pfad` bekommt eine zusätzliche `::after`-Welle.
2. **Kopf-Gesicht** auf der ersten Karte einer Schlange: zwei Augen + Mund, gezeichnet als Pseudo-Elemente (oder kleine `<span>`-Knoten). Sichtbar NUR für eigene Schlangen (nicht für gegnerische — gegnerische sind reduziert).
3. **Schwanz-Curl** auf der letzten Karte: Karte wird visuell schmaler + bekommt eine eingerollte Spitze (CSS `border-radius` Trick auf der Karte selbst).
4. **Wriggle-Animation** als zartes `wiggle`-Keyframe (`@keyframes wriggle`) auf der gesamten Kartenreihe wenn `aktiverSpieler` und Phase = "Ausspielphase". `prefers-reduced-motion: reduce` deaktiviert die Animation.
5. **Schlangengrössen-Variation**: Solo-Karte (1 Karte) bekommt einen grösseren Mindest-Durchmesser damit sie als "Embryo" sichtbar wird.

### Raus

- Engine, Legal-Aktionen, Aktionspfade
- Sonderkarten-Bubble (M1dq) bleibt
- Anlegeplätze (M1dl) bleiben unverändert
- Schlangen-Markierung/Beschriftung oben (Name, Punkte-Badge) bleibt
- Drop-Zone Hover-Effekt (M1dl-Pulse) bleibt
- Letzte-Aktion-Ziel-Highlight (M1dc) bleibt
- Gegnerische Schlangen: minimal-stylisch (kein Kopf-Gesicht, kein Wriggle)
- Komponenten-Extraktionen

## Implementierungs-Plan

### Phase 1: RED-Tests (5 Tests)

`src/App.m1dt_waldtanz_schlangenwurm.test.tsx`:

- **RED-1:** Eigene Schlange zeigt `.schlangekarte__kartenreihe--pfad` mit sichtbarem `::after`/Bridge-CSS-Vertrag (border-style dashed, dark-forest-green, wellenförmig).
- **RED-2:** Kopf-Karte (`.schlangekarte__karte--kopf`) einer eigenen Schlange enthält zwei Augen-Elemente (`.schlangekarte__auge--links`, `.schlangekarte__auge--rechts`) + Mund-Element (`.schlangekarte__mund`).
- **RED-3:** Schwanz-Karte (`.schlangekarte__karte--schwanz`) trägt zusätzliche Klasse `.schlangekarte__karte--schwanz-curl` mit Border-Radius-Override (curl-Effekt).
- **RED-4:** Solo-Karte (Schlange mit 1 Karte) trägt zusätzliche Klasse `.schlangekarte--solo` mit grösserem Min-Width-Override.
- **RED-5:** CSS-Datei enthält `@keyframes wriggle` und `.schlangekarte--wriggle { animation: wriggle ... }` + `prefers-reduced-motion: reduce` Override.

### Phase 2: GREEN-Implementierung

`src/components/SchlangenPfadKarte.tsx`:
- Neue optionale Props: `zeigeKopfGesicht?: boolean` (default false), `zeigeSchwanzCurl?: boolean` (default false).
- Wenn `istKopf && zeigeKopfGesicht && !solo`: zwei Augen + Mund rendern.
- Wenn `istSchwanz && zeigeSchwanzCurl`: zusätzliche Klasse `schlangekarte__karte--schwanz-curl` setzen.
- Wenn `istKopf && istSchwanz` (Solo): Klasse `schlangekarte__karte--solo-kopf-schwanz` (Bestehender `Kopf & Schwanz`-Pfad).

`src/components/Schlangenbereich.tsx`:
- In der Karte-Loop: prop `zeigeKopfGesicht={schlange.karten.length > 1 && aktiverSpieler.id === schlange.besitzerId}` (oder via Spieler-Identität).
- Solo-Karte: zusätzliche Klasse auf der `<li>` `schlangekarte--solo`.
- Kartenreihe: Klasse `schlangekarte--wriggle` wenn `aktiverSpieler.id === schlange.besitzerId` und `zustand.zugphase === 'Ausspielphase'`.

`src/App.css`:
- `.schlangekarte__kartenreihe--pfad::after { content: ''; position: absolute; ...; border-top: 2px dashed rgba(6, 57, 7, 0.4); border-radius: 50%; transform: translateY(...) }` für die Body-Brücke.
- `.schlangekarte__auge--links, .schlangekarte__auge--rechts { width: 0.35rem; height: 0.35rem; background: white; border-radius: 50%; position: absolute; }` + Pupille-Overlay.
- `.schlangekarte__mund { border-bottom: 2px solid; border-radius: 0 0 50% 50% / 0 0 100% 100%; ... }` (kleines Lächeln).
- `.schlangekarte__karte--schwanz-curl { border-radius: 50% 1.1rem 1.1rem 50% / 50% 1.1rem 1.1rem 50%; }` (curl nach links).
- `.schlangekarte--solo .schlangekarte__karte { min-width: 7.5rem; }`.
- `@keyframes wriggle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-0.15rem); } }` + `.schlangekarte--wriggle .schlangekarte__kartenreihe--pfad { animation: wriggle 2.5s ease-in-out infinite; }` + reduced-motion override.

### Phase 3: Simplify (manuell wegen 401-Block)

Da Claude Code 401-blockiert ist: manueller Selbstcheck mit Diff-Inspektion, CSS-Cascade-Audit (`.schlangekarte__karte.schlangekarte__karte--kopf` aus M1l muss VOR der neuen `.schlangekarte__karte--schwanz-curl`-Klasse kommen, damit Cascade stimmt), Line-Budget-Check.

### Phase 4: Code-Review

Kimi Code CLI (Watchdog-Empfehlung) im Background-Modus. Bei Silent-Quota: dokumentiert als "lokal verifiziert, review-blockiert".

### Phase 5: Gates + Smoke

- Targeted-Run: M1dt + M1l + M1ds + M1dl + M1dq + M1b + M1bx + M1db.
- Full-Gates: `npm test -- --run`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`.
- Browser-Smoke: `scripts/m1dt_waldtanz_schlangenwurm_smoke.mjs` prüft auf Production die sichtbaren Augen, Schwanz-Curl, Bridge-Linie und Wriggle-Animation.

## Risiken

- **CSS-Cascade-Konflikt mit M1l-Klassen:** `.schlangekarte__karte--kopf { transform: ... }` (M1l) kommt vor `.schlangekarte__karte--schwanz-curl { border-radius: ... }` (M1dt). Da border-radius und transform verschiedene Properties sind, gibt es keinen Konflikt. Trotzdem: RED-Tests prüfen nur border-radius-Vertrag, nicht die alte transform-Regel.
- **Solo-Karten-Klasse-Konflikt:** bestehender `Kopf & Schwanz`-Pfad zeigt Badge-Text "Kopf & Schwanz". Solo-Klasse fügt min-width dazu, ohne Badge zu ändern.
- **Wriggle-Animation Performance:** nur 1 aktive Schlange gleichzeitig, sehr kleines `translateY(-0.15rem)`, langsames 2.5s ease-in-out. Sollte nicht in Performance fallen.
- **Gegnerische Schlangen sehen anders aus:** das ist Absicht (Stitch-Stil: nur eigene Schlange ist "mein Freund" mit Gesicht).

## Akzeptanz

- Schlangen auf `/game` sehen aus wie **eine lebendige Schlange** mit erkennbarem Kopf + Körper + Schwanz.
- Wriggle-Animation nur bei eigener Schlange in Ausspielphase.
- Reduced-Motion stoppt Wriggle, Augen/Schwanz bleiben sichtbar.
- Engine, Legal-Aktionen, andere Brettobjekte, Sonderkarten-Bubble, Anlegeplätze, alle bestehenden Verträge bleiben unverändert.
- Bestehende M1l-Tests (Kopf/Körper/Schwanz-Klassen) bleiben grün ohne Stale-Assert-Updates.
