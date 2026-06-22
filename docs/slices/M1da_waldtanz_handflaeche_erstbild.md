# M1da — Waldtanz-Handfläche und Spielerplakette im 900px-Erstbild

> **Status:** Geplant. Startet nach M1cy-Release (Commit `c1de641` auf `origin/main`).
> **Typ:** Mittlerer Vertical (UI/UX, Bottom-Row-Layout), kein Engine-Touchpoint.
> **Vorgänger:** M1cy (Gegnerplakette), M1bp (Handfläche als Brettobjekt — heute regression in Production).
> **Nachfolger:** M1d0 (Layout-Konsolidierung gesamt — bleibt separat, da grid-template-areas umfassender ist).

## Befund (warum dieser Slice nötig ist)

Auf `https://schlangentanz-v2.vercel.app/game` bei 1280×900 wird der dokumentierte
**M1bp-Smoke-Blocker** auf der aktuellen `HEAD` (M1cy nach M1cr-M1cy-Stack)
ausgelöst:

```
M1bp Handfläche: erste Handkarte nicht vollständig/klickbar im 900px-Erstbild
  ({"bottom":958.27,"height":123.99,"hit":true})
```

Browser-Geometrie (production):

| Element | x | y | w | h | bottom | Problem |
|---|---|---|---|---|---|---|
| `.handkarte__button--karte` | 295 | 834 | 112 | 124 | **958** | 58 px unter 900er Viewport |
| `.handkarten-panel` | 231 | 814 | 634 | 147 | 961 | dito |
| `.waldtanz-spielerplakette` | 188 | 834 | 234 | **132** | 966 | überlappt Hand + Spalte unter Hand |
| `.waldtanz-arenazug` | 828 | 869 | 396 | 90 | 959 | dito, knapp über dem Viewport |
| `.waldtanz-questband` | 221 | 260 | 974 | 133 | 394 | okay, drückt alles nach unten |
| `.waldtanz-gegnerplakette` | 992 | 44 | 237 | 149 | 192 | okay oben |

**Root-Cause-Hypothese:**
- `HandkartenPanel.tsx:215` rendert **vier Klassen** gleichzeitig auf der UL:
  `handkartenleiste handkartenleiste--waldtanz-faecher handkartenleiste--tiefenfaecher handkartenleiste--spielkartenfaecher`.
- Die CSS-Regel `.spielbereich--game-route [class~="handkartenleiste--spielkartenfaecher"] [class~="handkarte__button--karte"]` (Spezifität 0,3,0) gewinnt gegen die ältere Tiefenfächer-Regel und setzt `height: clamp(6.5rem, 12.2vh, 7.15rem)` → bei 900vh × 12.2 % = 109.8 px, gedeckelt auf 114.4 px.
- Zusammen mit `aspect-ratio: 2/3` und der `handkartenleiste--spielkartenfaecher`-Padding führt das zu ~124 px Kartenhöhe.
- Spielerplakette (M1cx) sitzt mit `position: absolute` über dem Hand-Bereich, drückt visuell die Hand nach unten.
- Arenazugknopf (M1q) sitzt `grid-row: 5; margin-top: clamp(-5.8rem, -9vh, -5rem)` → überlagert die Hand-Unterkante.

## Slice-Scope

### Rein
1. **Eine klare untere Spielreihe** auf `/game`: Spielerplakette (links, kompakt) → Handkarten-Fächer (Mitte, vollständig sichtbar) → End-Turn-Pille (rechts, M1q). Alle drei sollen gemeinsam in ≤900 px passen, ohne Scrollen.
2. **Karten-Höhe-Cap** so dass `bottom ≤ 900` für alle 5 Handkarten bei 1280×900 gilt (auch bei 1100×800).
3. **Spielerplakette kompakt** als horizontaler Status-Pill (statt 132 px hoher Card), oder in einem freien Grid-Slot oberhalb der Hand, ohne `position: absolute`.
4. **Klassen-Duplikat auflösen** in `HandkartenPanel.tsx`: die UL soll nur die kanonische Fächer-Variante tragen (entweder `--tiefenfaecher` ODER `--spielkartenfaecher`), nicht beide. Selector-Konsistenz wiederherstellen.
5. **Arenazugknopf** bekommt eine konsistente `margin-top`/`grid-row`, die Hand nicht überlagert.
6. **Akzeptanztest**: Bottom-Reihe passt in 900 px, keine zwei Objekte überlappen, alle Handkarten klickbar.

### Raus (explizit)
- **Keine Engine-Änderung.** Karten-Logik, Sonderkarten, Schlangen, Wertung bleiben unangetastet.
- **Keine Regel-Änderung** an `docs/GAME_SPEC.md`.
- **Kein vollständiger Layout-Refactor** — M1d0 macht später das `grid-template-areas` für die ganze Seite. Hier nur Bottom-Reihe.
- **Keine M1cr-M1cy Spielobjekte anfassen** — Brettschritt-Stempel, Questband, Gegnerplakette, AktiverTanzSchritt bleiben unverändert.
- **Keine A11y-Mikroschleife** (User-Hinweis: keine Loops ohne Spielfortschritt).
- **Kein Mobile/Tablet-Refactor** — nur Desktop ≥ 1100 px.

## Akzeptanzkriterien (Playability-Gate-relevant)

- [ ] `/game` 1280×900: `.handkarten-panel.bottom ≤ 900` UND alle 5 `.handkarte__button--karte` haben `bottom ≤ 900`.
- [ ] `/game` 1100×800: gleiches Verhalten, kein Scrollen nötig.
- [ ] `.waldtanz-spielerplakette` und `.handkarten-panel` überlappen NICHT (Bounding-Rect-Disjunkt).
- [ ] `.waldtanz-arenazug` und `.handkarten-panel` überlappen NICHT.
- [ ] `M1bp Handfläche`-Smoke in `scripts/live_smoke.mjs` ist grün.
- [ ] `npm test -- --run src/App.m1da_waldtanz_handflaeche_erstbild.test.tsx` grün.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines` grün.
- [ ] Vercel Production-Deploy `READY`, Live-Smoke auf `/game` ohne console/page errors.
- [ ] Brettschritt (Handkarte spielen → Brettschritt-Stempel → End Turn → KI) weiterhin durchspielbar.

## Workflow (analog zu M1cr/M1cy)

1. **RED-Test** `src/App.m1da_waldtanz_handflaeche_erstbild.test.tsx`:
   - Bounding-Rect-Asserts über `page.evaluate(getBoundingClientRect)` für 1280×900 + 1100×800.
   - CSS-Source-Asserts für die finale Karten-Höhe + Spielerplakette-Kompaktheit.
   - DOM-Asserts: Handkarten-Region + Spielerplakette-Region + Arenazug-Region als benannte Landmarks.
   - Disjunktheits-Assert zwischen Spielerplakette- und Handkarten-Rect.
2. **Implementation** in `src/components/HandkartenPanel.tsx` + `src/components/WaldtanzSpielerplakette.tsx` + `src/components/WaldtanzArenazugknopf.tsx` + `src/App.css`:
   - Eine der Fächer-Varianten in `HandkartenPanel.tsx` entfernen.
   - Spielerplakette zu kompaktem Status-Pill oder Grid-Slot umbauen.
   - Arenazugknopf-Offset so anpassen, dass Hand nicht überlagert wird.
3. **Claude Code `--model opusplan`** Implementationspass.
4. **`/simplify`** als Pre-Check (CLAUDE.md-Workflow).
5. **Kimi Code CLI Review** (`kimi -p "..."`) statt Codex (OAuth usage limit bis 25.06.2026 19:07 UTC).
6. **Smoke + Production**: `scripts/m1da_waldtanz_handflaeche_erstbild_smoke.mjs` neu, in `package.json:smoke:production`-Kette einhängen (Position: nach M1cy).
7. **Vercel Deploy + Live-Smoke** auf `https://schlangentanz-v2.vercel.app/game`.
8. **Release-Doc**: `docs/release_status_2026-06-22_m1da.md`.

## Abhängigkeiten / Reihenfolge

```
M1cy (Gegnerplakette)  ─►  M1da (Handfläche Erstbild)  ─►  M1d0 (Layout-Konsolidierung)
       [released]              [dieser Plan]                   [wartet auf M1da]
```

## Cascade-Risiko (für Review-Hinweis an Kimi)

- HandkartenPanel-Klassen-Duplikat: alle vier Varianten auf einmal — drei Snapshot-Slices gleichzeitig aktiv. Cascade-Risiko **mittel**.
- Spielerplakette-Komprimierung: bestehende Tests prüfen M1cx-Höhe (~132 px). Müssen angepasst werden oder grün bleiben via `:has(.handkarten-buehne)`-Ausnahme.
- Arenazugknopf-Offset: bestehende M1cl-Smoke prüft Position. Source-Order-Schutz nötig.

## Out-of-Scope-Klärung

Diese **3 offenen Punkte aus M1d0** werden hier NICHT beantwortet (M1d0 macht später den Grid-Container):

1. Mobile (< 768 px) — bleibt offen bis M1d0.
2. Spielerplakette-Position-Refactor — M1da entscheidet **pragmatisch**: kompakter Pill, nicht zwingend Grid-Flow.
3. Vorher/Nachher-Screenshot — wird im Smoke-Skript gemacht, kein separater Screenshot-Schritt.
