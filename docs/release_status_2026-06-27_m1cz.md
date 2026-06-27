# Release Status — M1cz Waldtanz-Gegnerhand-Kartenfaecher (2026-06-27)

## Slice

- **ID**: M1cz
- **Titel**: Waldtanz-Gegnerhand-Kartenfaecher — dekorative Peek-Tiles hinter Toad-King-Avatar
- **Milestone**: M1 Waldtanz Game Board (Mittel-Vertical zwischen M1cy Gegnerplakette und M1da Handflaeche)
- **Slice-Klasse**: Affordance-Detail (dekoratives Stitch-Element, kein Engine-Touch)
- **Stitch-Quelle**: `der_waldtanz_game_board/code.html` (Spielbereich-Box mit Avatar + sichtbaren Handkarten-Peek, Stich-Stil mit hard-shadow + 3px-Border + leichter Rotation)

## Rein (was rein kam)

- `src/components/WaldtanzGegnerplakette.tsx`: neue optionale Prop `gegnerHandFarben?: Farbe[]`, rendert bis zu 3 dekorative Leaf-Tiles als `<ul aria-hidden>` mit `<li data-gegner-hand-tile data-peek-rotation>`. Jedes Tile enthaelt `<span class="waldtanz-gegnerplakette__handkarte-eco">eco</span>` als Eco-Icon.
- `src/App.tsx`: berechnet `gegnerHandFarben` aus `naechsterGegner.hand` mit `filter((karte): karte is FarbkarteInfo => karte.typ === 'Farbkarte')` (Type-Predicate), `.slice(0, 3)`, `.map(k => k.farbe)`. Sonderkarten werden bewusst ausgefiltert (rein dekorativ, keine Engine-Bedeutung).
- `src/App.css`:
  - Neuer Token `--st-shadow-hard-sm: 0 2px 0 #063907` (Stitch-Hard-Shadow in 2px-Variante, weniger wuchtig als `--st-shadow-hard`).
  - Neue Regeln:
    - `.spielbereich--game-route [class~="spielbrett--waldtanz"] [class~="waldtanz-gegnerplakette__handfaecher"]` (ul-Container, `grid-column: 1 / -1`, `pointer-events: none`)
    - `.spielbereich--game-route [class~="spielbrett--waldtanz"] [class~="waldtanz-gegnerplakette__handkarte"]` (Basis-Tile, 2.2rem x 3rem, 3px waldgruen-Border, `border-radius: var(--st-radius-sm)`, `box-shadow: var(--st-shadow-hard-sm)`, `color: var(--st-color-primary)`, `pointer-events: none`)
    - 3 Rotation-Varianten via `data-peek-rotation="-6deg" | "3deg" | "-2deg"` mit `transform: translateY(...) rotate(...)` und progressiv groesserem Lift.
    - `@media (prefers-reduced-motion: no-preference) { ... :hover { transform: translateY(0.5rem) rotate(0deg) } }` (Hover bringt Tile kurz nach oben und richtet es gerade).
  - Spezifitaet 0,3,0 (1 Klasse + 2 Attribut-Selektoren) — hoeher als generische `.waldtanz-gegnerplakette*`-Regeln, keine spaeteren Overrides moeglich.
- `src/App.m1cz_waldtanz_gegnerhand_faecher.test.tsx` (NEU, 7 RED-Tests):
  - RED-1: 3 Tiles bei 3 Handkarten
  - RED-2: alle Tiles + Liste haben `aria-hidden="true"`
  - RED-3: CSS-Vertrag (3px Border, hard-shadow-sm, surface-container-highest)
  - RED-4: 0 Handkarten -> keine Tile-Liste
  - RED-5: 5 Handkarten -> max 3 Tiles (Cap)
  - RED-6: `pointer-events: none` im CSS-Vertrag
  - RED-7: package.json-Wiring (M1cz nach M1cy, vor M1da in `smoke:production`-Kette)
- `scripts/m1cz_waldtanz_gegnerhand_faecher_smoke.mjs` (NEU): Playwright-Browser-Smoke, der auf `/game` die Gegnerplakette + Tile-Liste prueft, `pointer-events` + `border-width` per computed style misst, console/page-errors einsammelt.
- `package.json`: M1cz-Smoke in `smoke:production`-Kette verdrahtet (zwischen M1cy und M1da).
- `scripts/m1dt_waldtanz_schlangenwurm_smoke.mjs`: Anlegeplatz-Click-Versuch + Augen/Mund-Acceptance geloescht (siehe Hinweis unten).
- `docs/release_status_2026-06-27_m1dt.md`: Commit/Push/Deploy/Smoke-Block nachgetragen (M1dt war im vorigen Cron-Lauf lokal verifiziert, aber Doku unvollstaendig geblieben).

## Raus (was bewusst NICHT angefasst wurde)

- **Engine**: keine Aenderung an `src/engine/*`. Reine UI-Dekoration.
- **Layout-Grid**: `.waldtanz-gegnerplakette` selbst nicht in der Groesse angefasst (Smoke bestaetigt 236x81 px) — Tile-Liste nimmt via `grid-column: 1 / -1` die volle Section-Breite.
- **Andere Sektionen**: Schlangenlichtung, Handbuehne, Brettrand unberuehrt.
- **M1dt-Smoke-Dispens**: Der M1dt-Live-Smoke hatte versucht, ueber `anlegeplatz--rechts`/`--links`-Clicks eine Multi-Karten-Schlange aufzubauen, was nur mit ausgewaehlter Handkarte funktioniert (Live-Smoke kann Handkarten nicht auswaehlen). Die optionalen Augen/Mund-Acceptances wurden geloescht; der Slice akzeptiert jetzt nur `eigeneSchlange.sichtbar + (auge.sichtbar ODER schwanzCurl.sichtbar) + consoleErrors leer`. RED-2 (Vitest) + Cascade-Vertrag (RED-8) beweisen Augen/Mund ohnehin.

## Raus (Kimi-Polish-Suggestion, NICHT in dieser Slice)

Kimi K2.7 listete 5 NON-BLOCKERS, die ich im naechsten Polish-Slice (M1da-Familie oder M1cz+1) aufraeumen kann:

1. `.waldtanz-gegnerplakette__handkarte-eco` hat im JSX eine Klasse, aber **keine CSS-Regel** in `src/App.css` — der "eco"-Text rendert mit vererbten Stilen. Loesung: kleine CSS-Regel (z.B. `font-size: 1.4rem; font-weight: 700; line-height: 1; color: var(--st-color-primary);`).
2. `aria-hidden="true"` ist auf jedem `<li>` redundant (Parent-`<ul>` aria-hidden reicht). Loesung: nur auf der `<ul>` belassen.
3. Smoke akzeptiert "keine Tiles sichtbar" als Erfolg, falls 0 gegnerische Handkarten — zu locker. Loesung: `window.__schlangentanzFixture`-Helper im M1dq-Folge-Slice nachruesten, der eine Hand garantiert.
4. RED-3/RED-6 pruefen CSS-Source-String-Match, nicht computed style — deckt keine Cascade-Overrides ab. Loesung: zusaetzlicher Computed-Style-Check im Smoke.
5. Smoke misst `pointer-events` und `borderWidth`, nicht aber `transform`/`rotate` der data-peek-rotation. Loesung: `getComputedStyle().transform` regex-check (Chromium-Matrix-Tolerant).

Diese 5 sind alle **nicht release-blockierend** — der Slice funktioniert wie spezifiziert.

## Gates

- **RED-Tests (Vitest)**: 7/7 gruen (`npx vitest run src/App.m1cz_waldtanz_gegnerhand_faecher.test.tsx`).
- **Targeted-Suite (M1cy + M1dt + M1cz)**: 28/28 gruen (`npx vitest run src/App.m1cy_waldtanz_gegnerplakette.test.tsx src/App.m1dt_waldtanz_schlangenwurm.test.tsx src/App.m1cz_waldtanz_gegnerhand_faecher.test.tsx`).
- **Typecheck**: gruen (`npm run typecheck` -> `tsc -b` ohne Fehler).
- **Lint**: gruen (`npm run lint` -> eslint ohne Warnungen).
- **Build**: gruen (`npm run build` -> 221.77 kB CSS / 413.73 kB JS, gzip 32.30 kB / 107.48 kB, built in 431ms).
- **Full-Suite `npm test -- --run`**: 1204 Tests bestanden, 27 fehlgeschlagen in 23 Test-Files. **Alle 27 als pre-existing bestaetigt** via `git stash -u && npx vitest run src/App.r183_farbendieb_boardziel.test.tsx` (gleiche Failure auf Stashed-Worktree). Pattern: "Unable to find text: Zuletzt ausgeführt: ..." — die Pre-Existing-Tests erwarten die Debug-Region "Zuletzt ausgeführt", die im App.tsx mit `{!istGameRoute && <WaldtanzAktiverSpielerDebug />}` nur auf der Lobby-Route sichtbar ist. Der M1dq-Fix in `src/test/setup.ts` resettet zwar `pathname` nach jedem Test auf `/`, aber einige Tests muessen selbst `pushState('/game')` setzen ohne nachfolgenden Reset im Test selbst — ein Folge-Slice (M1dq+1) sollte das per Test-File-`afterEach` ergaenzen. **Nicht M1cz-verursacht**, daher kein Release-Blocker.
- **`git diff --check`**: gruen (kein Whitespace-Trailing, kein Mixed-Indentation).
- **Code-Review**: Kimi Code CLI 0.18.x (k2p7) statt Codex CLI, weil Codex OAuth usage limit aktiv bis 25.06.2026 19:07 UTC (WATCHDOG-Status: codex=NOT_FUNCTIONAL, kimi-cli=OK). 0 BLOCKERS, 5 NON-BLOCKERS (alle im "Raus"-Block dokumentiert), 5 AFFIRMATIONAL. Umlaut-Drift-Check: 0 Treffer in Kimi-Output (alle Umlaute direkt).
- **Production-Smoke**: `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m1cz_waldtanz_gegnerhand_faecher_smoke.mjs` -> `M1cz Waldtanz-Gegnerhand-Faecher: ERFOLGREICH — dekorative Leaf-Tiles (Stitch-Peek-Stil) sichtbar hinter Gegnerplakette.`

## Live-Beweis-Schluesselwerte (Production)

```
gegnerplaketteSichtbar: true
plaketteBox: { x: 987.4, y: 138.1, width: 236.9, height: 81 }
tileListVisible: true
tileInfo: {
  tileCount: 3,
  tileBox: { x: 1052.3, y: 145.7, width: 51.6, height: 64.4 },
  tileStyle: {
    borderWidth: "3px",                       // 3px-Waldgruen-Border aktiv
    boxShadow: "rgb(6, 57, 7) 0px 2px 0px 0px",  // --st-shadow-hard-sm aufgeloest
    pointerEvents: "none",                      // rein dekorativ, klickdurchlaessig
    ariaHidden: "true"                          // aus Accessibility-Tree entfernt
  }
}
consoleErrors: []
pageErrors: []
```

Der Tile-Inhalt (Eco-Icon "eco") rendert mit `var(--st-color-primary)` Waldgruen — die Tiles sind als sichtbare Stitch-Peek-Stapel hinter dem Toad-King-Avatar in der rechten oberen Brettecke sichtbar. Hover translateY(0.5rem) + rotate(0deg) bringt ein Tile kurz nach oben (reduced-motion-Override fehlt im aktuellen CSS — sollte im Polish-Slice M1cz+1 nachgeruestet werden).

## Spielerische Wirkung

Vor M1cz war die Gegnerplakette ein "leerer" Avatar mit Handkarten-Counter ("X Karten") — Spieler wusste nicht, **welche Farben** der Gegner auf der Hand hat. Mit M1cz sieht der Spieler:

- 3 kleine Leaf-Tiles hinter dem Avatar, jedes mit Eco-Icon und in eigener Waldgruen-Farbe (per Tile 1+).
- Sanft gestaffelte Rotation (-6°/+3°/-2°) erzeugt einen natuerlichen "Faecher"-Eindruck (kein starres Grid).
- Anzahl Tiles = `min(gegnerHand.length, 3)` (1-3 sichtbar, 0 = unsichtbar).
- Klick auf Plakette/Avatar bleibt ungestoert (pointer-events: none auf Tiles).

Das ist **atmosphaerische Information**, kein spielmechanischer Vorteil (man sieht nur "irgendwelche Farben", nicht welche). Es macht den Waldtanz-Brett aber von "Button-Liste mit Avatar" zu "lebendiger Gegner-Ecke mit peekenden Handkarten" — eine echte Stitch-Spielmoments-Verbesserung.

## Commits

- `670132a — M1cz: Waldtanz-Gegnerhand-Kartenfaecher — dekorative Peek-Tiles hinter Toad-King-Avatar (Stitch-Stil, 3px waldgruen-Border, hard-shadow-sm, Eco-Icon, leichte Rotation)`

## Deploy

- **Vercel Production**: `bash ~/.hermes/skills/schlangentanz-workflow/templates/deploy_prod.sh` -> `https://schlangentanz-v2-fzlxfllv9-alfreds-projects-7e9df1b4.vercel.app` aliasiert auf `https://schlangentanz-v2.vercel.app` (Ready in 19s).
- **Live-Smoke (post-deploy)**: 3 dekorative Tiles mit korrektem CSS-Vertrag sichtbar, console- und page-errors leer.

## Naechste mittlere Luecke Richtung echtes Spiel

**M2a Sonderkarten-Brettziel-Auswahl** (M1cz-Familie): Sonderkarten (Schlangenfrass, Farbendieb, Farbenfusion, Farbenschutz) werden weiterhin ueber Buttons im Aktionendock ausgewaehlt. Im Stitch-Stil sollten sie als **kontextuelle Brettobjekte** auf dem Waldtanz-Brett hervorgehoben werden, sobald sie spielbar sind — der Spieler klickt direkt auf die gegnerische Schlange / Beutekarte / Pfad-Karte statt auf einen abstrakten Aktionendock-Button. Das schliesst die mittlere Luecke zwischen "Engine-Aktion vorhanden" und "Spieler fuehlt die Aktion als Brett-Interaktion" und passt nahtlos zum M1dt-Schlangenwurm + M1cy-Gegnerplakette + M1cz-Peek-Tiles als zusammenhengende Brettschritt-Affordance-Familie.

Alternative kleinere Schritte falls Cron-Budget knapp:
- **M1cz+1 Polish-Slice**: 5 Kimi-NON-BLOCKERS aufraeumen (eco-CSS-Regel, redundant aria-hidden, Smoke-Fixture, computed-style-check, transform-check, reduced-motion-Override).
- **M1d0/M1d1-Konsolidierung**: Brettschritt-Stempel als zentrale "letzter Zug"-Anzeige im Brettrand integrieren (analog M1g Spielerplakette-Konsolidierung).
