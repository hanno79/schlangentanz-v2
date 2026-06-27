# M2i — Handkarten-Stitch-Hero-Transformation

**Slice-ID:** M2i
**Slice-Klasse:** Mittlerer sichtbarer Visual-Consolidation-Slice (Stitch-Alignment, Handkarten-Promotion)
**Datum:** 2026-06-27
**Autor:** Hermes (mit Kimi-Code-CLI-Review)
**Status:** GEPLANT (post-M2h, in der M2-Visual-Reihe)

## Scope

Die aktuelle /game-Seite hat die Handkarten als kleine Tiefen-Faecher-Karten
am unteren Rand, die teilweise von der rechten `Aktionen-Panel` (vertikale
Button-Liste END TURN / Spielerfuehrung / Letzter Spielzug) und dem
WaldtanzZielkompass-Hint-Text "Waehle oder ziehe eine Handkarte..."
ueberlappt werden. Aus dem Production-Screenshot (1280x900) ist klar:

- Die Handkarten sind als `<li>`-Reihe mit 0.85rem Padding, aspect-ratio 2/3,
  ~6.5rem breit. Sie ragen unten aus dem Viewport raus, sodass nur
  "WALDTANZKA" sichtbar ist.
- Die Aktionen-Panel rechts unten sitzt als vertikale Button-Liste
  (klassischer Click-Simulator-Look).
- Der Zielkompass-Hint-Text (`.waldtanz-zielkompass__text`) liegt
  mittig im Brettrand-Bereich und konkurriert mit der Spielflaeche.

Stitch-Referenz
(`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/code.html`
Zeile 244-308) zeigt die Handkarten als **grosse Stitch-Spielkarten** am
unteren Rand des Bretts:

- `w-24 sm:w-32 h-36 sm:h-48` (96-128px breit, 144-192px hoch — gross!)
- 3px dunkelgruener Border, hard-shadow-sm
- Icon-Tile oben (Farb-Container), Name darunter, Effekt-Badge (z.B. "+4 DEF")
- Hover-Lift -4 + scale 110
- Selected-Lift -8 + scale 105
- Floating "Play Card"-Tooltip

**M2i transformiert die Handkarten in genau diesen Stitch-Hero-Stil** —
grosse, klare Karten am unteren Rand des Bretts, prominent sichtbar
ohne Ueberlappung mit Aktionen-Panel oder Zielkompass-Hint-Text.

Ausserdem: der uebergrosse "Waehle oder ziehe eine Handkarte..."-Hint-Text
im Brettrand-Bereich wird kompakt: ein kurzer Status-Chip (1 Zeile)
statt 3 Zeilen Hinweis-Text.

## Begruendung: warum mittel statt mikro

- **Visuelle Wirkung:** Der gesamte untere /game-Bereich transformiert sich
  von "kleine clipped Pills + vertikale Button-Liste" zu "grosse
  Spielkarten-Hero-Reihe am Brettrand, klare Stitch-Optik". Genau die
  Stitch-Atmosphaere, die aktuell fehlt.
- **Stitch-Alignment:** Die Stitch-Referenz zeigt explizit grosse
  Spielkarten (96-192px gross) am unteren Rand mit Hover-Lift und
  Selected-Lift + Effekt-Badge. M2i bringt genau diesen Look.
- **Nicht-Mikro:** ~50-80 Zeilen CSS in `App.css`, ~20 Zeilen Anpassung
  in `HandkartenPanel.tsx` JSX-Struktur (Bereitschafts-Container),
  6-8 RED-Tests (CSS-Source + DOM-Struktur + Smoke-Wiring),
  1 neuer Live-Smoke (~150 Zeilen). ~200-250 Zeilen Diff.
- **Nicht-Big-Bang:** 0 Engine-Aenderungen, 0 React-Tree-Loeschungen,
  0 Layout-Arithmetik-Anpassungen am grossen Grid. Reines CSS +
  kleine JSX-Anpassung am Handkarten-Bereitschafts-Container.
- **Vergleichbar mit M2e (Multi-Panel-Hide), M2g (Quest-Promotion) und
  M2h (Forest-Texture):** alle vier sind reine Visual-Consolidation-Slices
  mit ~150-250 Zeilen Diff, klar testbar, kein Engine-Risiko.

## Rein (was M2i anfasst)

- **`src/App.css`** (~50-80 Zeilen):
  - `.handkarte__button--karte` bekommt Stitch-Hero-Groesse:
    - `min-width: clamp(5rem, 9vw, 8.5rem)`
    - `aspect-ratio: 5 / 7` (Stitch-Form: etwas breiter als 2/3)
    - `padding: 0.55rem` (Stitch-kompakt)
    - `border: 3px solid var(--st-color-border-strong)`
    - `border-radius: 1rem`
    - `background: linear-gradient(180deg, var(--st-color-surface, #fff) 0%, var(--st-color-surface-container-low, #ecffe3) 100%)` (Stitch-Surface-Stack)
    - `box-shadow: 0 4px 0 var(--st-color-border-strong)` (Stitch hard-shadow-sm)
  - `.handkarte__art` bekommt grossen Icon-Tile oben:
    - `width: 100%`
    - `aspect-ratio: 1 / 1` (quadratischer Icon-Tile)
    - `border: 2px solid var(--st-color-border-strong)`
    - `border-radius: 0.65rem`
    - `display: flex`
    - `align-items: center`
    - `justify-content: center`
    - `font-size: 1.8rem` (grosses Emoji-Icon)
  - `.handkarte__symbol` bekommt:
    - `font-size: 1.8rem` (gross)
  - `.handkarte__titel` bekommt Stitch-Name-Stil:
    - `font-family: var(--st-font-label, 'Rubik', sans-serif)`
    - `font-weight: 800`
    - `font-size: clamp(0.7rem, 1vw, 0.85rem)`
    - `text-align: center`
    - `color: var(--st-color-on-surface, #002201)`
  - `.handkarte__wertechip` bekommt Stitch-Effekt-Badge:
    - `display: inline-block`
    - `padding: 0.15rem 0.55rem`
    - `border: 2px solid var(--st-color-border-strong)`
    - `border-radius: 999px`
    - `background: var(--st-color-secondary-container, #fecb00)` (Sonne-Gold)
    - `color: var(--st-color-on-secondary-container, #6e5700)`
    - `font-weight: 800`
    - `font-size: 0.7rem`
  - `.handkartenleiste--tiefenfaecher` bekommt:
    - `display: flex`
    - `justify-content: center`
    - `align-items: flex-end`
    - `gap: 0.4rem`
    - `padding: 0.4rem 0.5rem 0.7rem 0.5rem`
    - `overflow: visible` (Karten duerfen rausragen)
  - `.handkartenleiste` bekommt:
    - `min-height: clamp(11rem, 18vh, 13rem)` (Stitch-Hero-Hoehe)
  - `.waldtanz-zielkompass__text` wird kompakt:
    - `font-size: 0.78rem`
    - `line-height: 1.3`
    - `padding: 0.2rem 0.55rem`
    - `max-width: 18rem`
    - `margin: 0 auto`
  - RED-Tests pruefen, dass keine spaetere Regel die Hero-Groessen
    ueberschreibt (cascade-safety).
- **`src/components/HandkartenPanel.tsx`** (~20 Zeilen Anpassung):
  - `.handkartenleiste--tiefenfaecher` erhaelt zusaetzlich die Klasse
    `handkartenleiste--hero` (Stitch-Marker fuer RED-Tests)
  - `.handkarte__eyebrow` ("Waldtanzkarte") wird via CSS auf
    `display: none` gesetzt (Stitch zeigt kein Eyebrow auf der Karte)
  - `.handkarte__idplakette` (z.B. "blau-09") wird via CSS auf
    `display: none` gesetzt (Stitch zeigt keine ID-Plakette; nur Name)
  - `.handkarte__typ`, `.handkarte__farbe`, `.handkarte__punkte`,
    `.handkarte__spielstatus`, `.handkarte__spielziele`,
    `.handkarte__questzug` werden via CSS auf
    `position: absolute; clip-path: inset(50%); width: 1px; height: 1px;`
    gesetzt (Stitch-Style: hidden, aber fuer Screen-Reader da)
  - Sichtbar bleiben: `.handkarte__art` (Icon), `.handkarte__titel` (Name),
    `.handkarte__wertechip` (Effekt-Badge), `.handkarte__spielhinweis`
    (Hover-Tooltip), `.handkarte__bereit-badge` (BEREIT-Badge bei Auswahl)
  - Diese CSS-Hide-Strategie aendert 0 Engine-Logik; die Daten bleiben
    im DOM fuer A11y, sind aber visuell weg.
- **`src/App.m2i_handkarten_hero.test.tsx`** (NEU, ~140 Zeilen, 7 RED-Tests):
  - RED-1: `.handkarte__button--karte` deklariert `min-width: clamp(5rem, 9vw, 8.5rem)` (Stitch-Hero-Groesse)
  - RED-2: `.handkarte__button--karte` deklariert `aspect-ratio: 5 / 7` (Stitch-Form)
  - RED-3: `.handkarte__button--karte` deklariert `border: 3px solid var(--st-color-border-strong)` (Stitch-3px-Border)
  - RED-4: `.handkarte__button--karte` deklariert `box-shadow: 0 4px 0 var(--st-color-border-strong)` (Stitch hard-shadow-sm)
  - RED-5: `.handkarte__art` ist Icon-Tile im Format 1/1 aspect-ratio mit grossem font-size 1.8rem
  - RED-6: `.handkarte__wertechip` ist Stitch-Effekt-Badge mit Pill-Form (`border-radius: 999px`), 2px Border, secondary-container Background
  - RED-7: `.handkarte__eyebrow` und `.handkarte__idplakette` haben `display: none` (Stitch hat kein Eyebrow + keine ID auf der Karte)
  - RED-8: package.json smoke:production-Kette enthaelt M2i-Skript
  - RED-9: M2i-Smoke-Skript enthaelt pruefeM2iHandkartenHero + Slice-Klassen + Schwellen
- **`scripts/m2i_handkarten_hero_smoke.mjs`** (NEU, ~150 Zeilen):
  - Startet Spiel, klickt Startfaehrte
  - Misst `getBoundingClientRect()` der ersten Handkarte
  - Liest `getComputedStyle(el).minWidth` und assertet `clamp(5rem, 9vw, 8.5rem)`
  - Liest `getComputedStyle(el).borderWidth` und assertet `3px`
  - Liest `getComputedStyle(el).aspectRatio` und assertet `5 / 7`
  - Liest `getComputedStyle(el).boxShadow` und assertet `rgba(6, 57, 7, ...)` (hard-shadow)
  - Verifiziert auf 1280x900 + 1100x800
- **`package.json`**: M2i-Smoke in `smoke:production`-Kette verdrahtet
- **`docs/slice_plan_m2i_handkarten_hero.md`** (diese Datei)
- **`docs/release_status_2026-06-27_m2i.md`** (am Ende)

## Raus (was bewusst NICHT angefasst wird)

- **Engine:** keine Aenderung an `src/engine/*`
- **Spielerplakette:** bleibt unveraendert (M1cx-Status, eigenes Slice)
- **Phasen-Banner:** bleibt unveraendert (M1dk-Status, eigenes Slice)
- **Questpille:** bleibt unveraendert (M2g-Status, eigenes Slice)
- **WaldtanzArenastein-Titel und -Beschreibung:** bleibt unveraendert
  (Arenastein ist Container, nicht Handkarte)
- **AktionenPanel rechts:** bleibt unveraendert. M2i ist reine
  Handkarten-Transformation, AktionenPanel-Aufraeumung waere ein
  separater Folgeslice (M2k).
- **WaldtanzZielkompass-Funktion:** bleibt unveraendert. M2i macht
  NUR den Hint-Text kompakter (1 Zeile statt 3), nicht die Komponente.

## Akzeptanzkriterien

- [ ] `.handkarte__button--karte` rendert als Stitch-Hero-Karte
      (min-width 5-8.5rem, aspect 5/7, 3px Border, hard-shadow)
- [ ] `.handkarte__art` rendert als grosser Icon-Tile (1/1, font-size 1.8rem)
- [ ] `.handkarte__wertechip` rendert als Stitch-Effekt-Badge
      (Pill, 2px Border, secondary-container Background)
- [ ] `.handkarte__eyebrow` + `.handkarte__idplakette` visuell weg
      (display: none, Screen-Reader-Daten bleiben im DOM)
- [ ] 7-9 RED-Tests gruen
- [ ] Full-Suite: Net-Positive (kein neuer Test wird rot)
- [ ] Production-Smoke auf 1280x900 + 1100x800 gruen
- [ ] Kimi-Code-CLI-Review akzeptiert (kein BLOCKER)
- [ ] Handkarten sichtbar gross am unteren Rand (mind. 96-128px breit,
      144-192px hoch) — vorher waren sie 65px breit clipped.

## Warum kein Big-Bang

- ~50-80 Zeilen CSS in **einer** Datei (`App.css`)
- ~20 Zeilen JSX-Anpassung am HandkartenPanel (Klassen-Erweiterung)
- 0 Engine-Aenderungen, 0 React-Tree-Loeschungen, 0 Layout-Arithmetik
- 7-9 RED-Tests, alle deterministisch (CSS-Source-Asserts + DOM-Asserts)
- 1 Browser-Smoke, ~150 Zeilen
- 1 visueller Layer auf existierender Handkarten-Struktur

## Spielerische Wirkung

**Vor M2i (production, Stand 433db20):**
- /game Handkarten sind als kleine Tiefen-Faecher-Karten (~65px breit,
  clipped am unteren Rand) gerendert, nur "WALDTANZKA" sichtbar
- Aktionen-Panel rechts unten als vertikale Button-Liste (Click-Simulator-Look)
- "Waehle oder ziehe eine Handkarte..."-Hint-Text als riesige
  3-Zeilen-Bubble in der Brettrand-Mitte

**Nach M2i:**
- /game Handkarten sind grosse Stitch-Hero-Karten (96-128px breit,
  144-192px hoch) am unteren Rand des Bretts
- Klar erkennbar: Icon-Tile oben (z.B. "Feuer"-Emoji), Name darunter
  (z.B. "Feuerkeim"), Effekt-Badge darunter (z.B. "5 Pkt")
- 3px Waldgruen-Border + hard-shadow-sm wie Stitch
- Hover-Lift und Selected-Lift funktionieren weiter (M1ds-Status)
- BEREIT-Badge (M1ds) erscheint auf ausgewaehlter Karte
- Hint-Text im Brettrand kompakt (1 Zeile statt 3)
- Wirkt wie ein "echtes Spiel" mit klaren Karten statt Click-Simulator

**Vergleich mit Stitch-Referenz:**
- Stitch: 96-128px breit, 144-192px hoch, Icon + Name + Effekt-Badge
- M2i: 80-136px breit (clamp 5rem-8.5rem), 5/7 aspect-ratio
  (= 112-190px hoch), Icon + Name + Effekt-Badge
- Visuell aehnlich: grosse Stitch-Hero-Spielkarten am Brettrand

## Naechste Luecke nach M2i

- **M2k — Aktionen-Panel-Stitch-Transformation (vertikale Button-Liste
  auflösen).** Das `AktionenPanel` rechts unten ist aktuell eine
  vertikale Liste mit `END TURN`, `Spielerfuehrung`, `Letzter Spielzug`.
  M2k wuerde das in ein Stitch-Stil-Pillen-Cluster transformieren
  oder als Phase-Bar in den Brettrand integrieren.

- **M2l — Waldtaschen-Titel-Text-Reduktion.** Der "Waldtaschen: Ziehstapel
  · Ablage · Zugspur · Quests"-Titel mit Sub-Heading ist redundant.
  M2l wuerde ihn auf einen kurzen Status-Chip reduzieren.

- **M1a — Spielflaeche-zentriert (grosses Stone-Arena).** Die zentrale
  Spielflaeche ist aktuell ein 4/3-Container mit weissem Background
  und den Schlangen + Anlegeplaetzen. M1a wuerde sie als grossen
  Stitch-Stein (rounded-[4rem], primary-container Background) mit
  klarer "Spielstein"-Identitaet rendern.

M2i ist der naechste reine Visual-Consolidation-Slice in der M2-Reihe
und passt zum Pattern "Stitch-Alignment bringt sichtbares Spielerlebnis".
