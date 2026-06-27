# M2g — Brettrand-Aufgaben-Pille als sichtbarer Stitch-Hero fuer die persoenliche Quest

**Slice-ID:** M2g
**Slice-Klasse:** Mittlerer sichtbarer Affordance-Mid-Slice (Stitch-Alignment, Quest-Promotion)
**Datum:** 2026-06-27
**Autor:** Hermes (mit Kimi-Code-CLI-Review)
**Status:** GEPLANT (post-M2e)

## Scope

Die persoenliche Quest des aktiven Spielers (`geheimeAufgabeText` aus `useSpielLabels`) lebt aktuell nur als unscheinbarer `<p className="waldtanz-zugtafel__quest">Persönliche Quest: ...</p>` innerhalb der `AktiverSpielerZugtafel`-Sidebar. Auf `/game` ist die Zugtafel in der `.waldtanz-zugseitenleiste` neben dem Spielbrett versteckt — die Quest ist visuell eine Zeile Text, kein Hero-Element.

Die Stitch-Referenz (`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`) zeigt die persoenliche Quest als **prominente, farbige Lime-Pille** direkt im Brettrand-Bereich — der Spieler sieht JEDEN ZUG, worauf er hinarbeitet. Das ist ein klassischer Stitch-Hero: lime-gruener Hintergrund, 3px forest-green-Border, hard-shadow, klare Typografie.

**M2g promoted die Quest von einer `<p>`-Zeile in der Sidebar zu einer prominenten Stitch-Brettrand-Pille** auf /game — sichtbar im Erstbild, immer ueber dem Brettschritt schwebend.

## Begruendung: warum mittel statt mikro

- **Visuelle Wirkung:** Die persoenliche Quest wird vom "versteckten Sidebar-Text" zum "Brettrand-Hero". Der Spieler sieht zu JEDEM Zeitpunkt, was seine Quest ist. Das ist genau die Art "echtes Spielerlebnis"-Gewinn, die der User explizit fordert.
- **Stitch-Alignment:** Die Stitch-Referenz zeigt die Quest prominent — wir weichen aktuell davon ab. M2g schliesst diese sichtbare Luecke.
- **Nicht-Mikro:** ~40-60 Zeilen CSS + 1 neue ~40-Zeilen-Komponente + ~20 Zeilen App.tsx-Aenderung = ~100-120 Zeilen Diff. 6-8 RED-Tests pruefen 4+ Aspekte (DOM + CSS + Route-Scope + Smoke-Wiring).
- **Nicht-Big-Bang:** 0 Engine-Aenderungen, 0 React-Tree-Loeschungen, 0 Layout-Arithmetik. Die `AktiverSpielerZugtafel`-Sidebar bleibt fuer andere Inhalte (Pflichtschritt, Punkte, Handkarten) erhalten — nur die Quest-Zeile wird aus der Sidebar herausgenommen und in die neue Brettrand-Pille verlagert (Single-Source-of-Truth-Konsolidierung).
- **Spielmechanischer Wert:** Quest-Sichtbarkeit ist kein Schmuck, sondern ein Spielmechanik-Feature. Spieler, die ihre Quest nicht sehen, koennen sie nicht erfuellen. M2g macht die Quest zum permanenten visuellen Anker.

## Rein (was M2g anfasst)

- **`src/components/WaldtanzBrettrandQuestpille.tsx`** (NEU, ~40 Zeilen): Stitch-Lime-Pille mit:
  - Icon "Eco" (Wald-Symbol) + Quest-Text + Status-Badge ("aktiv"/"erfuellt")
  - Optional kleine "X von Y" Fortschrittsanzeige (falls QuestCounter im Engine-State vorhanden, sonst weglassen)
  - ARIA-Live-Region fuer Screen-Reader-Updates (Phase-Wechsel = Quest-Update)
- **`src/App.tsx`**: Auf `/game`-Route wird die neue `<WaldtanzBrettrandQuestpille>` direkt im Brettrand (innerhalb `.spielbrett--waldtanz` oberhalb des Schlangenbereichs oder am unteren Rand) gerendert
- **`src/components/AktiverSpielerZugtafel.tsx`**: Die `<p className="waldtanz-zugtafel__quest">`-Zeile ENTFERNEN (Single-Source-of-Truth — die Quest lebt jetzt nur noch in der Pille, nicht mehr in der Sidebar)
- **`src/App.css`** (~40-60 Zeilen):
  - `.waldtanz-brettrand-questpille { ... }` — Stitch-Pillen-Stil: 3px forest-green Border, hard-shadow `0px 4px 0px 0px rgba(6, 57, 7, 1)`, lime background `var(--st-color-primary-container)`, border-radius `9999px` (full pill)
  - `.waldtanz-brettrand-questpille__icon { ... }` — Material-Symbol "Eco"
  - `.waldtanz-brettrand-questpille__text { ... }` — Plus Jakarta Sans 600 1rem
  - `.waldtanz-brettrand-questpille__status { ... }` — kleiner Status-Badge rechts
  - `.waldtanz-brettrand-questpille--erfuellt { ... }` — Erfolgs-Variante (secondary-container gold)
  - `.spielbereich--game-route .waldtanz-zugtafel__quest { display: none }` — alte Quest-Zeile in der Sidebar auf /game visuell weg
  - Auf `/` (Lobby) bleibt die alte Quest-Zeile in der Sidebar sichtbar (kein Route-Leak)
- **`src/App.m2g_brettrand_questpille.test.tsx`** (NEU, 6-8 RED-Tests):
  - RED-1: Neue Pille rendert auf /game mit Icon + Quest-Text + ARIA-Live-Region
  - RED-2: Pille hat Stitch-Styling (CSS-Source-Assert: `border: 3px solid`, `box-shadow: 0px 4px 0px`, `border-radius: 9999px` oder aehnlich)
  - RED-3: Auf `/` (Lobby) ist die Pille NICHT sichtbar (Route-Scope)
  - RED-4: Alte `<p className="waldtanz-zugtafel__quest">` ist auf /game visuell weg (CSS-Source-Assert: `.spielbereich--game-route .waldtanz-zugtafel__quest { display: none }`)
  - RED-5: Auf `/` (Lobby) ist die alte Quest-Zeile weiterhin sichtbar (kein Route-Leak)
  - RED-6: Pille-Quest-Text matched exakt den `geheimeAufgabeText`-Wert aus `useSpielLabels` (SSOT-Konsolidierung: Pille IST die Quelle, Sidebar zeigt sie nur auf /)
  - RED-7: Bestehender Smoke fuer `AktiverSpielerZugtafel` funktioniert weiter (Sidebar ohne Quest-Zeile rendert sauber)
  - RED-8: Smoke-Wiring in `package.json` (`smoke:production`-Kette zwischen M2f-Slot und M3b)
- **`scripts/m2g_brettrand_questpille_smoke.mjs`** (NEU, ~150 Zeilen): Live-Smoke auf Production
  - Startet Spiel, klickt Startfaehrte
  - Misst `getBoundingClientRect()` + `getComputedStyle()` von `.waldtanz-brettrand-questpille` und `.waldtanz-zugtafel__quest`
  - Akzeptanz: Pille sichtbar (>= 200x40 px), Quest-Text vorhanden, Icon vorhanden, alte Sidebar-Quest-Zeile auf /game hat `display: none`
  - Verifiziert auf 1280x900 + 1100x800
- **`package.json`**: M2g-Smoke in `smoke:production`-Kette verdrahtet (zwischen M2e und M3b)
- **`docs/slice_plan_m2g_brettrand_questpille.md`** (diese Datei)
- **`docs/release_status_2026-06-27_m2g.md`** (am Ende)

## Raus (was bewusst NICHT angefasst wird)

- **Engine:** keine Aenderung an `src/engine/*`
- **Andere Brettrand-Elemente:** M1dk-Phasen-Banner, M1cv-Waldtanz-Questband, Brettrand-End-Turn-Knopf bleiben unveraendert. M2g fuegt eine NEUE Pille hinzu, ersetzt keine bestehende.
- **M2f (Waldtisch-Statusleiste / M2a-Layout-Fix):** der ist ein separater Mikro-Slice, der das Layout-Reparatur-Problem adressiert. M2g ist Stitch-Alignment, unabhaengig.
- **M2d-Fixture-Helper:** bleibt unveraendert. M2g braucht keine Engine-Vorbedingungen, nur `geheimeAufgabeText` aus dem bestehenden `useSpielLabels`-Hook.
- **AktiverSpielerZugtafel-Sidebar** (Points, Handkarten-Count, Schlangen-Count, Pflichtschritt, Zugfuehrung, Letzte Aktion): bleibt voll funktional. Nur die `<p class="waldtanz-zugtafel__quest">`-Zeile wird auf /game visuell versteckt (Display None, Element bleibt im DOM fuer Test-Stabilitaet).
- **Lobby-Route (`/`):** bleibt unveraendert. Die Quest-Zeile in der Sidebar ist dort weiterhin sichtbar (kein Route-Leak).

## Akzeptanzkriterien

- [ ] Neue `WaldtanzBrettrandQuestpille` rendert auf /game mit Stitch-Lime-Pillen-Stil
- [ ] Quest-Text in der Pille matched den `geheimeAufgabeText`-Wert (SSOT)
- [ ] Alte Quest-Zeile in der Sidebar ist auf /game visuell weg (`display: none`)
- [ ] Auf `/` (Lobby) bleibt die alte Quest-Zeile sichtbar (kein Route-Leak)
- [ ] Andere Sidebar-Inhalte (Points, Handkarten, Schlangen) bleiben unveraendert
- [ ] 6-8 RED-Tests gruen
- [ ] Full-Suite: Net-Positive (kein neuer Test wird rot)
- [ ] Production-Smoke auf 1280x900 + 1100x800 gruen
- [ ] Kimi-Code-CLI-Review akzeptiert (kein BLOCKER)

## Warum kein Big-Bang

- ~40-60 Zeilen CSS in **einer** Datei (`App.css`)
- 1 neue Komponente (~40 Zeilen) + 1 Anpassung in `AktiverSpielerZugtafel` (1 Zeile entfernen)
- 1 App.tsx-Aenderung (~5 Zeilen) zum Einbinden der Pille im Brettrand
- 6-8 RED-Tests, alle deterministisch (CSS-Source-Asserts + Route-Scoping + SSOT-Text-Match)
- 1 Browser-Smoke, ~150 Zeilen
- 0 Engine-Aenderungen, 0 React-Tree-Loeschungen, 0 Layout-Arithmetik
- 1 Route-Bedingung (`.spielbereich--game-route`)
- 1 Single-Source-of-Truth-Konsolidierung (Quest lebt nur in der Pille, nicht dupliziert)

## Spielerische Wirkung

**Vor M2g (production, Stand 001ef13):**
- /game = Brettschritt + Handkarten + End-Turn + diverse Status-Pillen
- Die persoenliche Quest lebt in der `.waldtanz-zugseitenleiste` (rechts neben dem Spielbrett, ~120px breit)
- Sie ist eine kleine `<p>`-Zeile mit grauem Text, leicht zu uebersehen
- Der Spieler muss die Quest aktiv in der Sidebar suchen, um zu wissen, worauf er hinarbeitet

**Nach M2g:**
- /game = Brettschritt + Handkarten + End-Turn + **prominente Quest-Pille am Brettrand**
- Die Quest ist eine lime-gruene Stitch-Pille, immer sichtbar, immer im Sichtfeld
- Icon "Eco" signalisiert "Wald-Quest", Status-Badge zeigt Fortschritt
- Der Spieler sieht JEDEN ZUG seine Quest — kein Suchen, kein Vergessen
- Vergleichbar mit dem Phasen-Banner (M1dk), Quest-Band (M1cv) und End-Turn-Pille: alle prominent, alle immer sichtbar — die Quest-Pille gehoert in diese Reihe

**Vergleich mit Stitch-Referenz:** Stitch zeigt die Quest als zentrales Element im Brettrand. M2g bringt /game einen grossen Schritt naeher an diese Stitch-Klarheit, ohne Engine-Aenderungen.

## Naechste Luecke nach M2g

**M2h — Stitch-Forest-Background-Texture auf /game.** Die aktuelle /game-Background ist ein flacher Lime-Gruen. Stitch zeigt einen "wavy organic background pattern" mit `radial-gradient(#c4fdb6 2px, transparent 2px)`-Dot-Pattern auf `#ecffe3`-Surface. M2h bringt diese Stitch-Background-Texture auf den Brettschritt-Bereich, damit der "Waldboden" tatsaechlich wie ein Wald aussieht statt wie ein flacher UI-Container.

**M2f — M2a-Positive-Acceptance-Layout-Fix (Mikro-Slice).** Falls die M2a-Positive-Acceptance im Live-Smoke noch nicht zuverlaessig gruen ist, kann M2f den Layout-Threshold anpassen. Wird in einem separaten Folgeslice geprueft.

**M2i — Waldtanz-Brettwald-End-Turn als klickbarer Stitch-Button.** Der End-Turn-Knopf ist aktuell ein funktionaler Button mit Stitch-Pillen-Stil. M2i koennte ihn zu einem animierten "Zug beenden"-Button mit Erfolgs-Feedback (Hochzahl-Animation, Confetti) aufwerten — kleiner Mikro-Slice, hoher Spass-Faktor.
