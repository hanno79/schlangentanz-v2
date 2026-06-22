# M1d0 — Waldtanz-Layout-Konsolidierung

> **Status:** Geplant. Wartet auf freien Slot nach M1cy (Waldtanz-Gegnerplakette).
> **Typ:** Mittlerer Vertical (UI/UX), kein Engine-Touchpoint.
> **Quelle:** User-Report 22.06.2026 + Screenshot `/root/.hermes/image_cache/img_42246fe63f71.jpg`.
> **Dart-Task:** MCP war zum Anlege-Zeitpunkt mit HTTP 500 unreachable → Plan liegt hier, wird bei nächster Dart-Erreichbarkeit als Task `M1d0` nachgereicht.

## Befund (warum dieser Slice nötig ist)

Screenshot-Befund auf `/game` bei 1280×900:

| Bereich | Sichtbares Problem | Vermutung |
|---|---|---|
| Linke Spalte (`Waldtanz-Kompass`) | 4× identischer Text "Eine spielbare Aktion auswählen" / "Nächster Sch…" übereinander gestapelt | Container hat keinen `grid-template-rows`-Lock; Panels rendern mit `position: absolute` ohne gemeinsamen Anker |
| Brett-Mitte (`Leuchtender Waldstein`) | Mehrere `Waldstein`-Panels überlappen sich | Akkumulierte absolute Positionen aus M1cv/M1cw/M1cx/M1cy |
| Handkarten-Leiste | Karten werden von Spielerplakette-Score-Pille und Aktionsdock überlagert | Grid-Row-Kollision; aktuelle Reparaturen (M1cx: `grid-row: 4`) sind Punkt-Fixes statt System-Fix |
| Spielerplakette | Riesiges `0`-Score ragt unkontrolliert über die Handkarten | Plakette ist absolute-Position ohne Clipping-Container |
| Allgemein | Seite wirkt **nicht responsive** — Verhalten auf anderen Viewports ungeprüft | Bisher keine `clamp()`/`minmax()`/`@media`-Strategie im Spieltisch-Container |

### Root-Cause-Hypothese (aus `src/App.css`)

- **8 257 Zeilen CSS**, dutzende `display: grid` / `display: flex` Deklarationen verstreut
- `position: absolute` an mehreren Stellen (u. a. Zeile 155)
- Jeder M1cx/M1cy-Slice bringt seine eigene Stitch-Komponente mit und muss sich den Platz selbst suchen
- Es fehlt ein gemeinsames `grid-template-areas` für den Spieltisch-Container, das alle Verticals aufnimmt

## Scope

### Rein
1. **Ein gemeinsames Spieltisch-Layout** mit benannten `grid-template-areas` (`kompass` | `gegner-plakette` | `leuchtender-waldstein` | `questband` | `brett` | `handkarten` | `aktionen` | `wertung`).
2. **Responsive Strategie** für den Spieltisch: `clamp()` für Mindest-/Maximalbreiten, sauberer Mobile- oder Schmalbild-Fallback (Tablet ≥ 768 px, Desktop ≥ 1100 px), keine Media-Query-Spaghetti.
3. **Überlappungs-Aufräumen**: alle `position: absolute` auf dem Spieltisch bekommen entweder einen gemeinsamen Anker (relative Parent) oder werden in den Grid-Flow geholt.
4. **Container-Header-Strip** ("Schlangentanz"-Titel + Phase-Indikator) bleibt sichtbar ohne andere Panels zu verdecken.
5. **Akzeptanztest** in `src/App.m1d0_*.test.tsx`:
   - Spieltisch hat genau ein `grid-template-areas` mit allen 8 Bereichen.
   - Keine zwei Panels haben überlappende Bounding-Rects auf 1280×900.
   - Auf 1024×768 und 1440×900 bleiben dieselben Bereiche sichtbar (kein Overflow, kein Verdecken).
   - Smoke-Skript `scripts/m1d0_*.smoke.mjs` im production-Pfad.

### Raus (explizit)
- **Keine Engine-Änderung.** Legal-Aktionen, Phasen, Wertung, Sonderkarten, Regenbogen-Schlange bleiben unangetastet.
- **Keine Regel-Änderung** an `docs/GAME_SPEC.md`.
- **Keine neuen Spielobjekte** (Plaketten, Buttons, Karten). M1d0 ordnet nur, was M1cr…M1cy bereits gebaut haben.
- **Keine A11y-Mikroschleife** (User-Hinweis: keine Loops ohne Spielfortschritt). Fokus bleibt Google-Stitch-Layout.
- **Kein Big-Bang** an Komponenten. Reihenfolge behalten — nur deren Layout-Container fixen.

## Workflow (analog zu M1cr/M1cx)

1. **RED-Test** `src/App.m1d0_waldtanz_layout_konsolidierung.test.tsx`: Bounding-Rect-Assertions auf 1280×900, 1024×768, 1440×900, plus CSS-Source-Contract für `grid-template-areas`.
2. **Implementation** in `src/App.tsx` + `src/App.css`: Spieltisch-Wrapper bekommt benannte Areas; absolute Positionierungen werden aufgelöst; `clamp()`-Breiten für Spieltisch-Container.
3. **Claude Code `/simplify`** als Pre-Check (CLAUDE.md-Workflow).
4. **Codex-Review** mit Fokus auf Grid-Area-Konsistenz, Cascade-Regressionen, Border/Shadow-Erhalt aller bisherigen Stitch-Komponenten.
5. **Smoke + Production**: `scripts/m1d0_waldtanz_layout_konsolidierung_smoke.mjs` in `package.json` `smoke:production`-Kette einhängen (Position: direkt nach `m1cy_…`).
6. **Vercel Deploy + Live-Smoke** (`/` und `/game` 200, keine console/page errors, Brettschritt durchspielbar).
7. **Release-Doc**: `docs/release_status_2026-06-22_m1d0.md` mit vorher/nachher Screenshot-Link.

## Abhängigkeiten / Reihenfolge

```
M1cy (Gegnerplakette)  ─►  M1d0 (Layout-Konsolidierung)  ─►  M1cz+ (weitere Stitch-Verticals)
       [in Arbeit]                  [dieser Plan]                  [warten auf M1d0]
```

**Blocker:** M1cy muss grün + released sein, bevor M1d0 startet — sonst kämpfen wir gegen einen noch nicht fertigen Vertical.

## Akzeptanzkriterien (Playability-Gate-relevant)

- [ ] `/game` zeigt auf 1280×900 alle 8 Grid-Bereiche ohne Überlappung.
- [ ] `npm test -- --run` grün, neuer M1d0-Test deckt Layout ab.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` grün.
- [ ] `npm run smoke:production` grün, inkl. neuem `m1d0_…` Smoke.
- [ ] Vercel Production-Deploy `READY`, Live-Smoke auf `/game` ohne console/page errors.
- [ ] Mind. ein Brettschritt (Handkarte spielen → Brettschritt-Stempel → End Turn → KI) weiterhin durchspielbar.

## Offene Punkte für User-Abnahme vor Slice-Start

1. **Soll M1d0 die mobile Strategie mitliefern** (echtes Phone-Layout, < 768 px), oder reicht Tablet-Hochformat-Fallback für jetzt?
2. **Darf M1d0 die existierende `position: absolute`-Plakette aus M1cx umbauen** (in Grid-Flow holen), oder muss die Plakette absolut bleiben und nur der Container dagegen gehärtet werden?
3. **Vorher/Nachher-Screenshot** als Release-Evidence ok? Falls ja: welcher Browser/Viewport soll festgehalten werden?

## Wartet auf

- M1cy grün + released.
- Antwort auf die 3 Abnahme-Punkte oben.
