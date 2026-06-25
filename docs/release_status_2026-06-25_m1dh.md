# M1dh — Waldtanz-Spielhandlung am Brettrand (Stitch-Spielpillen)

> **Status:** Release-Fertig (cron-run 25.06.2026 12:18 lokal).
> **Typ:** Sichtbarer Brettschritt-Affordance-Slice (Engine-Touchpoint ja,
> Engine-Regeln nein).
> **Vorgänger:** M1dg (Waldtanz-Lichtungsstein, e0016c0).
> **Nachfolger:** offen — naechster sichtbarer Waldtanz-Board-Vertical.

## Was sichtbar/strukturell besser wurde

Auf `/game` werden die zwei wichtigsten Engine-Phasenaktionen
(**Zug beenden** und **Pflicht-Abwurf**) nicht mehr nur in der seitlichen
AktionenPanel-Buttonliste gefuehrt, sondern direkt am Brettrand in
der Handbuehne als **sichtbare Stitch-Spielpillen** gerendert:

- **End-Turn-Pille** (`handkarten-buehne__endturn`):
  - Hintergrund `var(--st-color-secondary-container)` (sonniges Gelb `rgb(254, 203, 0)`)
  - `var(--st-border-width-chunky)` (3 px) Dark-Forest-Border
  - `var(--st-shadow-hard)` (4 px hard-shadow)
  - `border-radius: 999px` (Pille)
  - `var(--st-font-headline)` + `text-transform: uppercase`
  - Icon `→` fuer den Spielerfluss

- **Pflicht-Abwurf-Pille** (`handkarten-buehne__pflichtabwurf`):
  - Hintergrund `var(--st-color-tertiary-container)` (Korallenrosa,
    erweiterte Stitch-Notfall-Farbe)
  - gleiche Chunky-Border + Hard-Shadow + 999-px-Radius-Spieloptik
  - Icon `!` als visueller Alarm
  - **ehrliche Multi-Step-Semantik**: `Abwerfen · noch N`, aria-label
    `Pflicht-Abwurf: noch N Karte(n) abwerfen (eine pro Klick)`

- **Hover-Hint ueber Handkarten** ist jetzt die invertierte Stitch-Pille
  (`rgb(6, 57, 7)` Hintergrund, `rgb(236, 255, 227)` Schrift, 999-px-Radius,
  2-px-Border) — sichtbar bei Hover oder Focus-Visible, sichtbar verifiziert
  in Production-Smoke.

- **Spielerplakette** in der Handbuehne bekommt auf `/game` zusaetzlich
  `transform: rotate(-2deg)` plus Chunky-Border + Hard-Shadow, passend zum
  Stitch-Player-Token-Pattern (vgl. M1cx Spielerplakette, e12e7ea).

- **Doppel-Ownership aufgeloest**: `useAktionenPanelProps` setzt
  `zeigePhasenaktion: !istGameRoute` — auf `/game` rendert der AktionenPanel
  keine Phasenaktion-Section mehr; die Brettrand-Pille ist der einzige
  sichtbare End-Turn-Button auf `/game`. Auf `/` (nicht-Game-Route) bleibt
  der alte AktionenPanel-Phasenaktion-Button erhaeltlich.

## Kimi-Review (K2.7, statt Codex CLI)

Code-Review: Kimi Code CLI v0.18.0 (k2p7) statt Codex CLI, weil
Codex OAuth usage limit aktiv (Probe: 2026-06-25T12:08:08+0200, Status
`RATE_LIMITED`).

Kimi hat zwei BLOCKER gefunden, die im selben Slice gefixt wurden
(kurz vor Commit):

1. **`endTurnVerfuegbar` ignorierte `reaktionsAktionen.length === 0`**.
   In einem theoretischen Edge-Case waere End-Turn-Pille sichtbar
   waehrend Reaktionen ausstehen. Fix in `src/App.tsx`:
   `endTurnVerfuegbar` beruecksichtigt jetzt zusaetzlich
   `reaktionsAktionen.length === 0`. RED-Hardening-Test
   `verwendet die M1dh-Spielhandlungs-Klassen im HandkartenPanel-Quelltext`
   enthaelt jetzt einen Source-Regex-Assert, der die Verknuepfung
   beweist.

2. **Pflicht-Abwurf-Pille suggerierte Bulk-Abwurf**, fuehrte aber
   nur eine Aktion pro Klick aus. Fix in `src/components/HandkartenPanel.tsx`:
   Label von `Pflicht-Abwurf (2)` auf ehrliche `Abwerfen · noch 2`
   Semantik umgestellt, aria-label erklaert explizit `(eine pro Klick)`.
   Neuer RED-Hardening-Test `Pflichter-Abwurf-Pille hat ehrliche
   Multi-Step-Semantik …` beweist die neue Verkabelung per Source-Regex.

Kimi-NON-BLOCKERS akzeptiert: Pattern-Konformitaet (3 px, hard-shadow,
999 px, headline uppercase, secondary-/tertiary-container), Scope
(mittelgrosser Vertical, keine Mikro-Politur), RED-Test-Stil
(implementierungsnah, aber passend zum M1dx-Projektstandard), keine
Umlaut-Drift in User-facing Texten (deutsche Umlaute direkt: `nächsten`,
`Abwurf`, `Karte` statt `naechsten`/`Abwufe`/`Karte`).

## Slice-Scope

### Rein

- `src/App.css` (+111 LoC):
  - Neue Klasse `.handkarten-buehne__spielhandlung` (Basis-Pille, Border,
    Hover, Active, Focus-Visible, Reduced-Motion).
  - Varianten `.handkarten-buehne__spielhandlung--endturn` (yellow) und
    `.handkarten-buehne__spielhandlung--pflichtabwurf` (coral).
  - Route-spezifische Display-Regeln: auf `/game` sichtbar, auf `/` hidden.
  - Spielerplakette-Rotation auf `/game` (rotate(-2deg) + Border + Shadow).
  - Hover-Hint-Backend-Reparatur (war vorher `secondary-container` mit
    lime-inherited-fallback; jetzt `inverse-surface` + `surface` fuer
    den Stitch-Invert-Look). Kimi-Review-Regression aus M1cw/M1cx
    nachhaltig behoben.
  - Neues Token `--st-color-surface: #ecffe3` (Schriftfarbe der
    invertierten Hover-Hint-Pille).

- `src/App.tsx` (+12 LoC):
  - Neue Props `endTurnVerfuegbar`, `pflichtAbwurfAktionen`,
    `onEndTurn`, `onPflichtAbwurf` am HandkartenPanel-Aufruf.
  - `endTurnVerfuegbar` schliesst jetzt `reaktionsAktionen.length === 0`
    mit ein (Kimi-Blocker 1).
  - `pflichtAbwurfAktionen` als Type-guard-gefiltertes Array aus
    `legaleAktionen`.

- `src/components/HandkartenPanel.tsx` (+44 LoC):
  - 2 neue Buttons (End-Turn, Pflicht-Abwurf) im Handbuehnen-Statuschip-
    Bereich, jeweils nur sichtbar bei passender Phase/Pflicht.
  - Ehrliche Pflicht-Abwurf-Semantik (Kimi-Blocker 2).
  - Type-Import fuer `PflichtAbwurfAktion`.

- `src/testPhaseHook.ts` (+9 LoC):
  - Neuer Test-Hook `phase=zugabschluss` setzt den aktiven menschlichen
    Spieler in die Zugabschluss-Phase, damit der M1dh-Smoke die
    End-Turn-Pille deterministisch sieht.

- `package.json` (+1/-1):
  - `smoke:production`-Kette erweitert um
    `node scripts/m1dh_waldtanz_spielhandlung_smoke.mjs` zwischen
    `m1d1_arena_flex_column_smoke` und `m3b_sonniges_nest_spielstart_smoke`.

- **NEU** `scripts/m1dh_waldtanz_spielhandlung_smoke.mjs` (169 LoC):
  Playwright-Browser-Smoke verifiziert die Stitch-Optik in Production
  (3 px-Border, 999 px-Radius, forest-gruen-Hover-Hint, -2 deg-Plakette,
  Phase-End-Turn-Pille sichtbar, Hover-Hint opacity 1 auf realer Karte).
  7 explizite Asserts + console/page-error-Watch.

- **NEU** `src/App.m1dh_waldtanz_spielhandlung.test.tsx` (160 LoC, 9 Tests):
  RED-Tests fuer Spielpillen-Render (Pflicht-Abwurf Komponententest),
  CSS-Token-Verkabelung (chunky-border, hard-shadow, 999-px-radius,
  route-spezifische Sichtbarkeit, invertierter Hover-Hint, Spielerplakette-
  Rotation), ARIA-Label & sichtbarer Text (Kimi-Blocker 2), End-Turn-
  Verfuegbarkeit mit `reaktionsAktionen.length === 0` (Kimi-Blocker 1),
  Smoke-Wiring (slice-script vs `live_smoke.mjs`).

- **NEU** `src/App.m1dh_smoke_wiring.test.ts` (34 LoC, 3 Tests):
  Smoke-Skript-Existenz, `smoke:production`-Kette, Slice-String-Vertrag
  (vermeidet den "Live-Smoke statt Slice-Skript"-False-Positive aus
  M1ct-Notiz im Skill).

### Raus

- Nichts Engine-Kritisches; nur Pruef- und Render-Layer.
- Keine Engine-Regel, kein legalAction-Enum, kein Zustandsfeld beruehrt.

## Gates (alle gruen)

| Gate | Status | Detail |
|---|---|---|
| `npm run typecheck` | ok | tsc -b, 0 Fehler |
| `npm test -- --run` | ok | 340 Files / 1117 Tests |
| `npm run lint` | ok | eslint, 0 Fehler |
| `npm run build` | ok | 96 modules, 408 ms, 205 kB CSS, 403 kB JS |
| `npm run check:test-lines` | ok | alle Testdateien < 500 LoC |
| `git diff --check` | ok | keine Whitespace-Konflikte |
| `node scripts/m1dh_waldtanz_spielhandlung_smoke.mjs` | ok | 7/7 Asserts, End-Turn bg=`rgb(254, 203, 0)`, border=3 px, radius=999 px, Hover-Hint `rgb(6, 57, 7)`/`rgb(236, 255, 227)`, Plakette -2 deg, Hover opacity 1 |
| `node scripts/live_smoke.mjs` | ok | / und /game 200, keine console/page-Fehler |
| `node scripts/m1dg_waldtanz_lichtungsstein_smoke.mjs` | ok | weiterhin gruen (Lichtungsstein + M1dh-Pillen koexistieren) |
| `node scripts/m1e_waldtanz_spieluhr_smoke.mjs` | ok | 3 Phasen-Wechsel-Test gruen |
| `node scripts/m1d1_arena_flex_column_smoke.mjs` | ok | Arena-Layout stabil |
| `node scripts/m3b_sonniges_nest_spielstart_smoke.mjs` | ok | Lobby-Slice unveraendert |
| Vercel Production Deploy | ok | Ready in 20s, alias `https://schlangentanz-v2.vercel.app` |

## Playability-Gate-Evidenz

M1dh verbessert die Engine-Handlungs-Sichtbarkeit: statt einer seitlichen
Phasenaktion-Buttonliste fuehlen sich die zwei wichtigsten Phasenuebergaenge
jetzt an wie **echte Spielobjekte** am Brettrand:

- `Zug beenden` ist die prominent gelbe Stitch-Pille neben den Status-Chips,
  nicht ein generischer React-Button in einer Actions-Liste.
- `Abwerfen · noch N` ist die prominente Korallen-Pille mit Alarm-Icon,
  sobald eine Pflicht-Abwurf-Schuld anliegt.
- Hover ueber Handkarten zeigt jetzt die **forest-gruene inverted Pille**
  statt einer schwachen lime-Innenbox.

Konkret sichtbar im 1280x900-Erstbild auf /game:

```
[ Handkarten Bühne ──────────────── ]
[ Status: Spielbar: 7 | End-Turn → ]   <- sonnige Stitch-Pille
[ Hover-Hint:  forest-grüne Pille ]   <- invertierter Stitch-Look
[ Spielerplakette: -2° gedreht     ]   <- taktile Plakette
[ … Kartenfächer …                  ]
```

## Commit

- `0b38fbc M1dh: Waldtanz-Spielhandlung am Brettrand als Stitch-Spielpillen (Kimi-Review-Fix)`

## Naechste mittlere Luecke

Strategische Richtung: das `/game`-Spielbrett ist jetzt mit
Lichtungsstein (M1dg) + Spieluhr (M1e) + Magiekreisen (M1df) +
Spielhandlungs-Pillen (M1dh) gut bestueckt. Was noch fehlt fuer
echtes Spielerlebnis:

- **M1di / M1dj: Board-nahe Sonderkarten-Zielauswahl.** Schlangenfrass,
  Farbenfusion, Farbendieb und Farbenschutz brauchen eine sichtbare
  Hover-/Drag-Affordance auf den Brettzielen — der Spieler muss
  fuehlen, welches Ziel er anvisiert. Aktuell sind das unsichtbare
  Engine-Aktionen ohne visuelle Kopplung zum Brett.
- **M2: Mehrzug-Endgame.** Echtes Endgame mit Sonderkarten-Kombos gegen
  die Engine, mit Playability-Beweis auf /game.
- **M4-Vertiefung: Regeln-Buch mit aktiven Beispielstellungen** —
  Stitch-Stil, nicht nur statische Tabelle.

Empfehlung fuer den naechsten Cron-Lauf: **M1di (Sonderkarten-Ziel-
Hover-Affordance auf Brettzielen)**. Klein genug fuer TDD + Review
(2 Buttons, 1-2 Klassen, 1 Smoke), gross genug fuer sichtbares
Spielerlebnis (Hover ueber Schlangen-Kopf zeigt Sonderkarten-Zielcursor).
