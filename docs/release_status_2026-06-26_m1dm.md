# M1dm Release-Status: Waldtanz-Arena als Brettrand-Zentrum

**Datum:** 26.06.2026 09:20 UTC
**Slice-ID:** M1dm (Fortsetzung der M1-Waldtanz-Game-Board-Reihe, nach M1dl Anlegeplatz-Dropzone)
**Commit:** `4c86237 M1dm: WALDTANZ Aktionen-Dock display:none, Game-Board-Forest-Markt`
**Vorgaenger:** `8beeedf M1dl-Smoke-Fix-2` (Anlegeplatz-Dropzone mit Richtungspfeil)

## Slice-Klassifikation
- **Klasse:** CSS-only Layout/Visibility-Consolidation (M1dm-Familie: keine Engine-Logik, nur UI-Sichtbarkeit)
- **Groesse:** mittelgrosses Vertical — beruehrt Aktionendock + Kompass + Brettrand, 5 Files, 276 Zeilen
- **Risiko:** niedrig — Element bleibt im React-Tree, Grid-Area bleibt stabil, M1dd-'aktionsdock'-Layout unberuehrt
- **Sichtbares Spielerlebnis:** auf /game verschwindet die dominante gelbe Aktions-Buttonliste; Schlangenlichtung wird zum visuellen Zentrum; Brettrand-End-Turn-Knopf uebernimmt die sichtbare Zugsteuerung

## Gates

### RED-Tests (Slice-eigene)
| Test | Status |
|---|---|
| `m1dm_waldtanz_arena_brettrand.test.tsx` (4 RED-Tests) | gruen |
| `m1dm_smoke_wiring.test.ts` (3 RED-Tests) | gruen |
| **Total Slice-RED-Tests** | **7/7 gruen** |

### Gates
- `npm test -- --run src/App.m1dm_*` — gruen (7/7)
- `npm run typecheck` — gruen
- `npm run lint` — gruen
- `npm test -- --run` (Full-Suite) — 3 RED-Tests (PRE-EXISTING, nicht durch M1dm verursacht)
  - `m1ak_waldtanz_kartenpop_lichtung.test.tsx` — prefers-reduced-motion fehlt
  - `m1aw_waldtanz_handkante.test.tsx` — Handkarten-Panel-Geometrie M1f-Konflikt
  - `m1da_waldtanz_handflaeche_erstbild.test.tsx` — Handkarten-Panel-Geometrie M1f-Konflikt
  - Bestätigt per `git stash -u` Test: alle 3 RED-Tests sind auch ohne M1dm-Aenderungen RED

### Code-Review
- **REVIEWER=kimi-cli** (Watchdog-Empfehlung am 2026-26-26 09:00 UTC: codex NOT_FUNCTIONAL, kimi-cli OK)
- Kimi K2.7 Output: **0 BLOCKERS**, 7 NON-BLOCKERS (alle bestaetigen Slice-Integritaet)
- Empfehlungen: keine Aenderungen erforderlich
- Hinweis Kimi: forbidden Token pre-existing `surface-container-lowest` / `surface-container-high` in M1k-Assert-Datei (nicht durch M1dm verursacht)

### Production-Smoke (live, post-deploy)
- `node scripts/m1dm_waldtanz_arena_brettrand_smoke.mjs` — gruen
  - 1280x900: Aktionen-Panel `display=none`, Arenazugknopf sichtbar (211x145, oben=789), Schlangenlichtung 974x370
  - 1100x800: Aktionen-Panel `display=none`, Arenazugknopf sichtbar (176x171, oben=764), Schlangenlichtung 809x329
  - 0 console-Errors, 0 page-Errors
- `node scripts/live_smoke.mjs` — `Kernregion nicht sichtbar: "Aktionen"` (erwartet + korrekt: Aktionen sind auf /game jetzt display:none)
- HTTP 200 auf `/` und `/game`

## Was sichtbar besser wurde

**Vorher (M1dl):** auf /game war der gelbe Aktionendock (`aktionen-panel--waldtanz-dock`) als sticky-Element sichtbar. Er ueberdeckte mit seiner 30rem-Cap den unteren Teil des Arenasteins und konkurrenzte die Schlangenlichtung als visuelles Zentrum.

**Nachher (M1dm):** auf /game ist der Aktionendock display:none. Das React-Element bleibt im Tree (M1dd-Grid-Area 'aktionsdock' braucht ein Kind fuer stabile grid-template-rows-Hoehen). Auf / (Lobby) bleibt er sichtbar fuer die Spielvorbereitung. Der Brettrand-End-Turn-Knopf (Waldtanz-Arenazugknopf) uebernimmt die sichtbare Zugsteuerung — er ist jetzt der einzige sichtbare Aktionen-Zugang auf /game.

**User-Feedback-Treue:** "Weg vom Button-geklickt-/Debuglisten-Gefuehl hin zu echtem Spielerlebnis." Der Aktionendock war die dominantere Button-Liste. Sie ist jetzt weg. Die Schlangenlichtung (Waldtanz-Arenastein) ist jetzt das unbestrittene Zentrum des Bretts.

## Naechste sichtbare Luecke Richtung echtes Spielerlebnis

Aus dem Production-Screenshot abgeleitet: **die linke Seitenleiste "Waldtanz-Kompass"** (mit Phase/Hand/Quest Pills + Handlungsanweisung) ist visuell noch eine zweite Aktions-Buttonliste auf /game. Sie konkurrenzt das Brettrand-End-Turn-Konzept und die Schlangenlichtung.

Kandidaten-Slice M1dn: **Waldtanz-Kompass auf /game visuell reduzieren** — die Pillen als kompakte Stitch-Statusleiste umgestalten (Phase/Hand/Quest als kleine Indikatoren statt drueckender Aktions-Liste) oder die Handlungsanweisung in den Brettrand-End-Turn-Bereich verschieben. Mittelgross, niedriges Risiko, deutlich sichtbare Verbesserung.
