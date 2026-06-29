# M6b — Waldtisch-Holzwimpel als Forest-Welcome-Banner

**Datum:** 29.06.2026
**Autor:** Hermes (autonomer Cron-Lauf, Job-ID `0cca22d2b825`)
**Slice-Klasse:** Stitch-Hero-Affordance-Mid-Slice (Schwester zu M2v Brettrand-Zugknopf, M2g Brettrand-Questpille, M5a Sieger-Party, M2i Handkarten-Stitch-Hero).
**Status:** 🟡 geplant — RED-Tests in Vorbereitung

## Zusammenfassung

M6b fuegt ueber der Schlangenlichtung eine grosse **Waldtisch-Holzplakette** als
sichtbarer Stitch-Forest-Hero ein, die dem Spieler auf /game sofort zeigt:

- **"Frankas Wald heute"** — der Name des aktiven Spielers als grosse Rubik-Black
  Headline auf einer lime-Hero-Holzplakette mit 3px Forest-Border + 4px Hard-Shadow
- **Phase-Indikator-Pille** (sekundaer Gold `secondary-container`) mit aktueller
  Zugphase (Ausspielphase, Aufgabenpruefung, Nachziehphase, Zugabschluss, Spielende)
- **Zugzaehler-Chip** (Stitch-Forest-Container) mit `gespielteKarten` + Handkarten + Schlangen
- **Lebens-Herz-Pulse** — kleiner lime-Dot mit `pulse`-Animation, symbolisiert
  "dein Wald ist lebendig"
- Reduzierte-Motion-Variante: kein Heart-Pulse, statischer Dot

Sitzt prominent **innerhalb des `<header class="waldtanz-schlangenlichtung__kopf">`**
der Schlangenlichtung — links das bestehende `<h3>Schlangenlichtung</h3>` + Subtitle,
rechts die neue Holzplakette als `<aside class="waldtanz-waldtisch-plakette">`.
Dadurch kein Layout-Shift, keine pre-existing-Test-Contracts zerstoert.

## Scope-Groesse

Mittlerer Vertical-Slice: ~3 Files, ~140-180 Zeilen Diff,
**8-10 RED-Tests**, 1 Live-Smoke mit Screenshot-Vergleich vor/nach.

**Warum kein Mikro-Slice (Affordance-Politur)?** Die Holzplakette ist der erste
visuelle Eindruck auf /game. Die Spielerin sieht aktuell nur einen mini-Header
mit `<h3>Schlangenlichtung</h3>` und einem kleinen Text. Eine Willkommens-Holzplakette,
die "FRANKAS WALD HEUTE" zeigt und HEARTBEAT pulsiert, ist der groesste
einzelne Spass-Sprung ohne Engine-Touch und ohne Layout-Auswirkungen.

**Warum kein Big-Bang?** Nur der `<header class="waldtanz-schlangenlichtung__kopf">`
wird um einen rechten Aside-Bereich erweitert (Flexbox `justify-content: space-between`,
linker Text bleibt unveraendert). Komponente wird self-contained in 1 neue Datei
+ 1 CSS-Block. Kein Engine-Touch, kein pre-existing-Test-Contract im DOM-Pfad
(M1di/M2r bleiben unangetastet), keine Spielfeld-Geometrie-Aenderung.

## Rein

1. **Neue Komponente** `src/components/WaldtanzWaldtischHolzplakette.tsx` (~50 Zeilen)
   - `<aside class="waldtanz-waldtisch-plakette">` als rechter Slot in kopf
   - `<strong class="waldtanz-waldtisch-plakette__name">` mit aktiver Spielername
   - `<span class="waldtanz-waldtisch-plakette__phase-pille">` mit aktueller Phase
   - `<span class="waldtanz-waldtisch-plakette__zaehler">` mit gespielteKarten/Handkarten
   - `<span class="waldtanz-waldtisch-plakette__herz" aria-hidden="true">...</span>` mit pulse-Animation
   - `aria-label="Aktiver Wald von {name}, Phase {phase}, {n} Karten gespielt"`
2. **CSS-Block** in `src/App.css` (~80 Zeilen)
   - `.waldtanz-waldtisch-plakette` Container — lime Container mit 3px Border + 4px Hard-Shadow
   - `.waldtanz-waldtisch-plakette__name` — Rubik Black clamp(1.4-2rem)
   - `.waldtanz-waldtisch-plakette__phase-pille` — Gold secondary-container mit Border + Shadow-Sm
   - `.waldtanz-waldtisch-plakette__zaehler` — Stitch-pille forest-container
   - `.waldtanz-waldtisch-plakette__herz` — 12x12 px lime Dot mit `@keyframes herz-pulse`
   - `@media (prefers-reduced-motion: reduce)` Override (`animation: none`)
   - Bei der kopf-Flexbox-Anpassung: nur der Padding/Justify-Content, keine Hoehe-Aenderung
3. **WaldtanzSchlangenlichtung.tsx** (kleiner Patch im `<header>`):
   Bestehende Inhalte links lassen, rechts `<WaldtanzWaldtischHolzplakette>` einhaengen
4. **Test-File** `src/App.m6b_waldtisch_holzwimpel.test.tsx`
   - 8-10 RED-Tests: CSS-Source-Bloeke (5-6 RED), DOM-Asserts (2-3 RED), Reduced-Motion, Cascade-Regression
5. **Live-Smoke** `scripts/m6b_waldtisch_holzwimpel_smoke.mjs`
   - Screenshot `/tmp/m6b_waldtisch_plakette.png`
   - Holzplakette sichtbar in oberer Spielflaeche des Bretts
   - Phase-Pille zeigt aktuelle Phase
   - Heart-Pulse animation != 'none'
6. **Package.json** smoke:production wiring (Skript am Ende der Kette)
7. **Release-Status-Doku** `docs/release_status_2026-06-29_m6b.md`

## Raus

- Engine-Logik
- Layout-Reorganisation der Schlangenlichtung oder Arenastein
- HandkartenPanel-Touch
- AktionenPanel-Touch
- Brettrand-Chrome (Phasen-Banner bleibt M2r-hidden, Questpille bleibt klein)
- Pre-existing /game-Side-Ranke (Wertung, Material, etc.)
- Pre-existing Stub-Slices: M1di, M2i, M2r, M2s, M2u, M2v bleiben unangetastet

## Akzeptanz-Test-Idee

Spieler oeffnet `/game`: das erste sichtbare Element **ueber** der Schlangenlichtung
ist jetzt nicht mehr nur ein mini-Header "Schlangenlichtung", sondern eine grosse
**Holzplakette mit "Frankas Wald heute" + Phase-Pille + Lebens-Puls-Punkt**.
Der Spieler fuehlt: hier spielt er _heute_, nicht _irgendwann_.

## RED-Tests (geplant)

| Test | Vertrag |
|---|---|
| RED-1 | CSS-Source: `.waldtanz-waldtisch-plakette` Block existiert mit lime/3px-border/hard-shadow |
| RED-2 | CSS-Source: `.waldtanz-waldtisch-plakette__name` mit `font-family: var(--st-font-headline, Rubik)` und font-weight 800+ |
| RED-3 | CSS-Source: `.waldtanz-waldtisch-plakette__phase-pille` mit `secondary-container`-Hintergrund + Pill-Radius |
| RED-4 | CSS-Source: `.waldtanz-waldtisch-plakette__herz` mit `@keyframes herz-pulse` und `animation: herz-pulse` |
| RED-5 | CSS-Source: Reduced-motion Override schaltet `animation: none` |
| RED-6 | DOM: `<aside class="waldtanz-waldtisch-plakette">` rendert im Schlangenlichtung-Kopf |
| RED-7 | DOM: Spielername + Phase + Karten-Zaehler sind sichtbar |
| RED-8 | DOM: aria-label auf Holzplakette nennt Spielername + Phase |
| RED-9 | Cascade-Regression: keine spaetere 0,1,0-Regel im /game ueberschreibt Holzplakette |
| RED-10 | Smoke-Wiring: package.json `smoke:production` enthaelt m6b-Skript |

## Risiken & Pitfalls (aus Skill)

1. **M2g/Layout-Migration-Pre-existing**: M2r hebt Arenastein-Cap auf /game an.
   Beim Hinzufuegen einer Holzplakette im Schlangenlichtung-Kopf darf die
   Schlangenlichtung-Hoehe **nicht** ansteigen, sonst bricht M2r-Smoke.
   Loesung: Holzplakette nimmt nur den Header-Slot ein (gleiche Zeile wie
   das bestehende `<h3>Schlangenlichtung</h3>`), KEIN neuer Grid-Row,
   KEIN Flex-Item unter dem Header.
2. **Cascade-Override-Prevention**: Holzplakette-Klasse darf keine spaetere
   Regel ueberschreiben (siehe M1dt Pattern 6 + doubled-class 0,2,0).
   Bei `border-radius` `border` o.ae. immer `X.X` doubled-class einsetzen.
3. **HEAD-Tokens-Verify**: Vor GREEN-Phase `grep -n "primary-fixed\|surface-container-high"` in package.json — falls M6b unbeabsichtigt verbotene Tokens nutzt, durch `--st-color-primary-container` etc. ersetzen.
4. **Pre-existing DOM-Contracts unangetastet**: Bestehende `<h3>Schlangenlichtung</h3>`
   und `<p>`-Subtitle **muss** bleiben (M1di-Vertrag). Holzplakette ist **zusaetzliches** Aside-Element rechts, kein Replace.
5. **RED-Naming-Migration**: Falls bestehende Texte erweitert werden (z.B.
   Subtitle um "Wald ist heute bereit"), muss jede pre-existing Test-Regex
   (M1di, M2i, M2r) mit-migriert werden, sonst Full-Suite-RED.

## Verifikations-Reihenfolge

1. CSS-Audit-Pre: `rg -n "waldtanz-schlangenlichtung__kopf|--st-color-primary-fixed" src/App.css`
2. RED-Tests in `src/App.m6b_*.test.tsx` schreiben + laufen lassen
3. Komponente `src/components/WaldtanzWaldtischHolzplakette.tsx` anlegen
4. CSS-Block `src/App.css` Block hinzufuegen
5. `<header>` in `src/components/WaldtanzSchlangenlichtung.tsx` patchen
6. Targeted-Run: `npx vitest run src/App.m6b_*.test.tsx`
7. Adjacent-Run: `npx vitest run src/App.m1di_*.test.tsx src/App.m2r_*.test.tsx src/App.m2i_*.test.tsx` (pre-existing-Contract check)
8. `npm run typecheck && npm run lint && npm run build`
9. Live-Smoke gegen `/game` mit Screenshot `/tmp/m6b_waldtisch.png`
10. Kimi background review (Background Process, Notify on complete)
11. `bash ~/.hermes/skills/schlangentanz-workflow/templates/deploy_prod.sh`
12. Post-deploy Live-Smoke re-run
13. Release-Status-Doku `docs/release_status_2026-06-29_m6b.md` schreiben

## Budget-Schaetzung

~22-28 Tool-Calls (RED-Tests 2, Green-Patches 4-6, Adjacent-Tests 2, Gates 4, Kimi 3, Deploy 3, Smoke 2, Doku 3).

## Naechste-Luecke (M2-Reihe Richtung echtes Spiel)

Nach M6b hat /game ein sichtbares Willkommens-Moment. Die naechste grosse
Luecke ist eine **echte sichtbare Spiel-Aktion-Kontext-Pille am Spieltisch** (analog
Stitch "Play Card"-Hover-Hint): sobald die Spielerin eine Handkarte zieh-t,
erscheint oben am Brettziel ein **Aktionsname-Pfeil** mit der genauen Zielzone
(Pink/Stripe). Vorschlag-Slice-Name: **M6c — Handkarten-Brettziel-Wegweiser als Stitch-Glow-Pfeil**.
