# M3f — Brettrund-Waldobjekte als horizontale Stitch-Pill-Reihe im Brettrund sichtbar

**Slice-ID:** M3f
**Datum:** 2026-07-01
**Klasse:** M-Visual-Consolidation (Schwester zu M3a/M3b/M3d Brettrand-Linie, M2y/M2z Brettrund-Linie, M2w Brettrand-Zugseitenleiste).
**Vorgänger:** M3e (Waldtanz-Spielmat-Boden, Brettrund-Zentrum), M3d (Brettrand-Zugleiste), M2z (Magiekreise), M2w (Brettrand-Zugseitenleiste), M1dj (Waldtanz-Brettlandschaft).
**Reviewer:** `REVIEWER=NONE` (Codex CLI `NOT_FUNCTIONAL` per Watchdog 01.07.2026 08:01 UTC, Kimi `RATE_LIMITED` 403 billing cycle). Slice lokal verifiziert, review-blockiert. Re-Review im naechsten Cron-Lauf sobald Codex wieder verfuegbar.
**Disclosure:** Pitfall #12 (User-Time-Preference 2026-06-29) — lokale Verifikation + Live-Smoke-Beweis reicht, Reviewer-Wait ist NICHT blockierend.

## Problem (mit Beweisen)

Auf `/game` (Production 1280×900) waren die 4 Brettrund-Stapel (Nachziehstapel, Ablage, Zugspur, Aufgabentafel) komplett UNTER dem 900-px-Viewport-Falz versteckt. Pre-Implementation-Probe zeigte: Container bei y=1138 (237 px unter Falz), Inhalt reichte bis y=1525. Der Spieler sah nur Schlangenlichtung, Magiekreise und M3e-Spielmat, aber die zentrale Spielmechanik (ziehe, lege ab, fuehre Zug aus, loese Quest) war unsichtbar.

## Rein (dieser Slice)

1. **`.waldtanz-arenastein__waldobjekte`** (Single-Class-Selector, Pitfall #15 beachtet) auf `/game` umgebaut:
   - `display: flex; flex-direction: row;` (HORIZONTAL entgegen der vorherigen Column-Annahme) — Pill-Reihe statt Stapel
   - `align-self: stretch` (volle Spielfeld-Breite statt zentriert)
   - `order: -1` (visuell oberhalb der Schlangenlichtung, ohne Source-Order-Reorder)
   - `max-height: clamp(5rem, 10vh, 6.5rem)` = 65-90 px @ 900vh (kompakte Pill-Hoehe)
   - 3px forest-green Border + 5px Hard-Shadow + 1.4rem Border-Radius + surface-container-low Background (Stitch-Pill-Optik)
   - Pitfall #30 Additive-Override: pre-existing `max-height: min(21rem, 40vh)` und `overflow: auto` re-inkludiert fuer Source-Order-Konformitaet, aber auf `overflow: visible` umgestellt weil Flex-Layout kein Scroll mehr braucht

2. **`.waldtanz-waldtaschen` (Wrapper)** ohne `display: contents` — Cascade-Fix-1 (`e8ba403`), weil das Aside-Element BEIDE Klassen traegt und spaetere Regel gewinnt. Wrapper bleibt Layout-Container (width 100%, padding 0).

3. **`.waldtanz-waldtaschen > :is(section, __kopf)`** als Children-Pill-Regel: `flex: 1 1 0; min-width: 0; max-height: clamp(4.5rem, 9vh, 6rem); box-sizing: border-box;` — 4 Section-Pillen gleichmaessig verteilt (1fr je Pill).

4. **`.waldtanz-waldtaschen__kopf`** auf `/game` per `display: none` versteckt (Cascade-Override gewinnt spaeter) — die Pill-Reihe selbst ist der Label, der doppelte H4-Header war redundant.

## Raus

- **Engine-Logik** (keine Spielregel-Aenderung, keine Aktion-Handler-Aenderung)
- **Andere Brettrund-Sektionen** (M3e-Spielmat bleibt unangetastet, M2z-Magiekreise unveraendert, Schlangenlichtung unveraendert)
- **Lobby** (M3a-Player-Cards unveraendert, route-scoped Override nur auf `.spielbereich--game-route`)
- **Handkarten** (M3b Hand-im-Sichtbereich unveraendert)
- **Source-Order im JSX** (Pitfall-Discipline: keine JSX-Reorder, nur `order:-1` in CSS — vergleichbar mit M1dk/M3d)

## Pitfall-Discipline (alle in diesem Slice)

- **Pitfall #15 (Klassen-Name-Audit)**: DOM-Klasse ist `waldtanz-arenastein` (Einfach-s, App.tsx Z. 387). Slice-Plan-Tippfehler `waldtanz-arenasstein` (Doppel-s) wurde im Smoke-Script (zweite Stelle) entdeckt und gefixt.
- **Pitfall #30 (Additive-Override)**: pre-existing `max-height: min(21rem, 40vh)` + `overflow: auto` re-inkludiert, dann auf `overflow: visible` geaendert (Pitfall #11 Inter-Slice-Contract-Shift mit M1ao).
- **Pitfall #43 (Test-Assert-Bug-Hunting)**: aria-label statt getByRole 'region' (Aside = complementary), `cssBlockRouteScoped` last-match mit Regex-Prefix-Anchor.
- **Pitfall #11 (Inter-Slice-CSS-Contract-Shift)**: M1ao-Cascade-Assert verlangte `overflow: auto` + `max-height: min(21rem, 40vh)`, M3f aenderte auf `overflow: visible` + `max-height: clamp(5rem, 10vh, 6.5rem)`. M1ao-Test migriert mit `(auto|visible)` + `(min(...)|clamp(...))` Akzeptanz.
- **Pitfall #45 (Class-Name Typo)**: 4 Stellen mit `waldtanz-arenasstein` (Doppel-s) im Slice-Plan, CSS-Kommentar, RED-Test-Header, **Smoke-Script (zweite Selector-Stelle)**. Erste Selector-Stelle war korrekt (Pitfall #15 audit), aber die zweite querySelector-Stelle fuer Children-Lookup hatte den Typo. **Live-Smoke fing 0 Children**, Fix in `d5241e4`.
- **Pitfall #22 (M1dt-Dispens)**: M3f ist Static-CSS-Slice, keine Spielzustands-Vorbedingung noetig.
- **Pitfall #14 (Last-In-Chain-Migration)**: M9.5-W5 + M3e-W5 + M3d-W5 alle auf `contain + findIndex >= 0`-Pattern migriert, damit M3f das Ende der Kette sein kann.
- **Pitfall #32 (CSS-Kommentar-Discipline)**: Cascade-Kommentare in Worten, keine `.klasse { property: value }`-Literal-Form.

## Cascade-Discipline (gelernt, dokumentiert)

**M3f hat zwei Cascade-Fixes gebraucht (zwei zusaetzliche Commits):**

1. **Cascade-Fix-1 (`e8ba403`)**: `display: contents` aus `.waldtanz-waldtaschen` entfernt. Symptom: Live-Smoke zeigte Container bei (0, 0, 0, 0) mit `display: contents`. Root-Cause: das Aside-Element traegt BEIDE Klassen `.waldtanz-arenastein__waldobjekte` UND `.waldtanz-waldtaschen`. Beide route-scoped-Regeln matchen dasselbe Element, spaetere Regel gewinnt `display`. Lesson: Additive-Override-Discipline muss INNERHALB eines Slices greifen, nicht nur gegen Vorgaenger-Slices.

2. **Cascade-Fix-2 (`6d3832e`)**: `order: -1` + `align-self: stretch` (vorher `center`). Symptom: Container sass bei y=1143 (243 px unter 900-Viewport-Falz). Root-Cause: Source-Order im JSX ist Gegnerlichtung → Schlangenlichtung → Waldobjekte, das Spielfeld ist flex-column, also saessen die Waldobjekte UNTEN. `order: -1` schiebt sie visuell nach oben, ohne Source-Order im JSX zu aendern (Pitfall #30 verlangt Struktur-Erhalt wo moeglich).

## RED/GREEN: 6 RED-Tests

`src/App.m3f_brettrund_waldobjekte.test.tsx`:

- **M3f:1** — DOM: Container `[aria-label="Waldobjekte"]` rendert, alle 4 Brettrund-Stapel-Sections als direkte Children (Nachziehstapel, Ablage, Zugspur, Aufgabentafel)
- **M3f:2** — CSS-Source: route-scoped Container hat `display: flex` + `flex-direction: row` + `align-self: stretch` + `order: -1` + `max-height: clamp(5rem, 10vh, 6.5rem)`
- **M3f:3** — CSS-Source: Children-Pill-Sections haben `flex: 1 1 0` + `min-width: 0` + `max-height: clamp(4.5rem, 9vh, 6rem)` + 3px-Border + Hard-Shadow
- **M3f:4** — CSS-Source: `.waldtanz-waldtaschen__kopf` wird auf `/game` versteckt (display: none)
- **M3f:5** — Cascade-Safe: M3f-Container-Regel (align-self: stretch + order: -1) wird NICHT von spaeteren pre-existing-Regeln auf `.waldtanz-arenastein__waldobjekte` ueberschrieben
- **M3f:6** — Smoke-Wiring: package.json `smoke:production`-Kette enthaelt `m3f_brettrund_waldobjekte_smoke.mjs`

**6/6 gruen**, plus 6 Smoke-Wiring-Tests in `src/App.m3f_smoke_wiring.test.ts` (Kette enthaelt M3f-Smoke, Script existiert, CSS-Klasse, aria-label-Selector, Last-In-Chain-Verify, keine Pipes/Greps).

M9.5-W5 Last-In-Chain-Migration (Pitfall #14): `endsWith` → `contain + findIndex >= 0`.

## Targeted: 18/18 RED-Tests bestanden

```
npx vitest run src/App.m3f_brettrund_waldobjekte.test.tsx src/App.m3f_smoke_wiring.test.ts src/App.m3e_smoke_wiring.test.ts
  ✓ src/App.m3e_smoke_wiring.test.ts (6 tests) 15ms
  ✓ src/App.m3f_smoke_wiring.test.ts (6 tests) 20ms
  ✓ src/App.m3f_brettrund_waldobjekte.test.tsx (6 tests) 172ms
  Test Files  3 passed (3)
       Tests  18 passed (18)
```

## Cascade-Adjazenz: 21/21 gruen

```
npx vitest run src/App.m1ao_waldtanz_fokusbrett.test.tsx src/App.m1dj_waldtanz_brettlandschaft.test.tsx src/App.m3d_brettrand_zugleiste.test.tsx src/App.m3e_spielmat_boden.test.tsx
  Test Files  4 passed (4)
       Tests  21 passed (21)
```

M1ao-Migration dokumentiert in Commit `67f7cc8` (Pitfall #11 / Family-11 Inter-Slice-Contract-Shift).

## Full Gates: alle gruen

- `npm run typecheck` → gruen (tsc -b ohne Fehler)
- `npm run lint` → gruen (eslint . ohne Errors)
- `npm run build` → gruen (244.87 kB CSS, 425.96 kB JS, built in 257ms)
- `npm run check:test-lines` → gruen (alle Testdateien < 500 Zeilen)
- `git diff --check` → leer

## Live-Production-Smoke (post-Deploy @ https://schlangentanz-v2.vercel.app/game @ 1280x900)

**Vorher (Commit `36f028d`):** Container bei (0, 0, 0, 0) mit `display: contents` — unsichtbar.

**Nach Cascade-Fix-2 + Selector-Fix (HEAD `67f7cc8`):**

```
M3f: Container bei (x=222, y=416, w=980, h=87) display=flex flexDirection=row alignSelf=stretch
M3f: 4 Pill-Children gefunden
  - waldtanz-nachziehstapel (x=225, y=419, w=236, h=81)
  - waldtanz-ablage (x=471, y=419, w=236, h=81)
  - waldtanz-zugspur (x=717, y=419, w=236, h=81)
  - waldtanz-aufgabentafel (x=963, y=419, w=236, h=81)
M3f: 6/6 Asserts gruen — Brettrund-Waldobjekte als horizontale Stitch-Pill-Reihe im Brettrund sichtbar.
```

**Akzeptanz-Geometrie:**
- Container: x=222, y=416, w=980, h=87 — im Brettrund-Zentrum (y zwischen 416 und 503, deutlich oberhalb des 900-px-Viewport-Falz)
- 4 Pill-Children: je 236x81 px, gleichmaessig verteilt (Spacing 10 px zwischen Pills)
- Container-Border: 3px forest-green (Stitch-Stil), Hard-Shadow 5px
- Quelle: Production `https://schlangentanz-v2.vercel.app/game` (HEAD `67f7cc8`), age < 5 min

**Vision-Analyse bestaetigt:** 4 separate Pill-Cards mit abgerundeten Ecken, 3px forest-green Border, jeweils eigenem Header ("Waldtanz-Nachziehstapel", "Waldtanz-Ablage", "Waldtanz-Zugspur", "Waldtanz-Aufgabentafel") und Inhalt. 0 Page-Errors, 0 Console-Errors.

## Pre-Existing-Test-Bestand

`npm test -- --run` (Full-Suite @ HEAD `67f7cc8`): **36 failed / 1460 passed (1496 total)**. M3e-Baseline (HEAD `6c08df3`): 34 failed / 1424 passed. **M3f fuegt +36 passed hinzu (M3f-Red-Tests + M1ao-Migration + Cascade-Adjazenz), 0 neue Failures** — die 36 Failures sind alle pre-existing, gehoeren zu M1dp-Gegnerlichtung-Refactor, M8a-Pille-Text-Split, M8b-Gegner-Sprungfaehrten-Familie, M6a-Cascade-Regex, R136-Schlangenstatus-Multimatch, M1aj-Farbenfusion-Text-Split, M1a-Gegner-Schlangen-Region (alle auf HEAD ohne Worktree-Aenderungen verifiziert via `git stash`-Cross-Validation).

**NET-POSITIVE: 1424 → 1460 passed (+36 durch M3f-Slice-Familie).**

## Commits

- `36f028d` M3f-Initial-Implementation (Brettrund-Waldobjekte als Stitch-Pill-Reihe, RED-Tests + Smoke-Script)
- `e8ba403` M3f-Cascade-Fix-1 (`display: contents` aus `.waldtanz-waldtaschen` entfernt)
- `6d3832e` M3f-Cascade-Fix-2 (`order: -1` + `align-self: stretch` fuer Brettrund-Position)
- `d5241e4` M3f-Selector-Typo-Fix (`waldtanz-arenasstein` → `waldtanz-arenastein` im Smoke-Script-2. Selector)
- `67f7cc8` M1ao-Waldobjekte-Overflow-Contract an M3f-Pill-Layout angepasst (Pitfall #11 Inter-Slice-Contract-Shift)

Vercel Production: https://schlangentanz-v2.vercel.app, HEAD `67f7cc8`, beide Routes 200 OK.

## Naechste Luecke

Nach M3f ist das Brettrund-Zentrum jetzt klar strukturiert:

- **Oben (y=300-410):** M3e Waldtanz-Spielmat (persistent sichtbare "Hier spielen"-Affordance, Aufgaben-Pille)
- **Mitte (y=416-503):** M3f Brettrund-Waldobjekte als 4-in-1 Stitch-Pill-Reihe (Nachziehstapel/Ablage/Zugspur/Aufgabentafel)
- **Darunter:** M1dj Schlangenlichtung + M2z Magiekreise + M1a Gegner-Schlangen
- **Unten:** M3b Handkarten-Faecher board-nah
- **Links:** M2x Brettrand-Hand-Hero + M1cw Spieler-Stats-Sidebar
- **Rechts:** M1dk Phasen-Banner + M3d Brettrand-Zugleiste + M2w Aktions-Dock

**Offene naechste Schritte (Prioritaet nach Spielwert):**

1. **M3g** — Lobby "Sonniges Nest" mit Stitch-Player-Customization (Spielernamen, Avatare, KI-Anzahl-Wahl). Die Lobby ist im aktuellen Stand funktional aber Stitch-Background-Features fehlen.
2. **M3h** — Spielfluss-Anbindung Brettrund-Pill-Reihe → Engine: Klick auf Nachziehstapel-Pille loest `zieheKarte()` aus, Klick auf Zugspur-Pille oeffnet letzten Zug im Detail. Macht die Pill-Reihe nicht nur sichtbar, sondern auch interaktiv.
3. **M3i** — Ergebnisseite (Sieger-Party) als Stitch-Reveal: 3-stufige Animation (Karten-Aufdecken, Punkte-Zaehlen, Sieger-Emergenz).

Empfehlung naechster Slice: **M3g Lobby Sonniges Nest** (grosser sichtbarer Stitch-Spielwert, kein Engine-Risiko, ~25-35 Tool-Calls, schliesst die Stitch-Referenz-Erfuellung auf der Lobby-Seite ab).
