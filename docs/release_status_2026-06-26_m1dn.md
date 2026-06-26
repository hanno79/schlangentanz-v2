# M1dn Release-Status: Waldtanz-Kompass als flache Indikator-Pillen-Reihe

**Datum:** 26.06.2026 09:35 UTC
**Slice-ID:** M1dn (Fortsetzung der M1-Waldtanz-Game-Board-Reihe, nach M1dm Aktionen-Dock-Wegnahme)
**Commit:** `c8d4c4e M1dn: Waldtanz-Kompass als flache Indikator-Pillen-Reihe auf /game`
**Vorgaenger:** `3ae71cf M1dm-Release-Doku` und `4c86237 M1dm-WALDTANZ-Aktionen-Dock-display:none`

## Slice-Klassifikation
- **Klasse:** CSS-only Visual Reduction (M1dn-Familie: keine Engine-Logik, nur UI-Sichtbarkeit)
- **Groesse:** kleines Vertical — beruehrt 1 Section + 1 Paragraph, 5 Files, 300 Zeilen (inkl. Smoke + Tests)
- **Risiko:** sehr niedrig — nur display:none, kein Layout-Reflow, keine neuen Klassen, kein Multi-Class-Cascade-Risiko
- **Sichtbares Spielerlebnis:** auf /game verschwinden der "Waldtanz-Kompass"-Section-Heading + der "Nächster Schritt"-Paragraph. Die 3 Indikator-Chips (Phase/Hand/Quest) bleiben sichtbar als flache Pillen-Reihe. Die phase-spezifische Handlungsanweisung lebt jetzt ausschliesslich am Brettrand-End-Turn-Knopf (Waldtanz-Arenazug) — Single Source of Truth.

## Gates

### RED-Tests (Slice-eigene)
| Test | Status |
|---|---|
| `m1dn_waldtanz_kompass_flach.test.tsx` (5 RED-Tests) | gruen |
| `m1dn_smoke_wiring.test.ts` (3 RED-Tests) | gruen |
| **Total Slice-RED-Tests** | **8/8 gruen** |

### Gates
- `npm test -- --run src/App.m1dn_*` — gruen (8/8)
- `npm run typecheck` — gruen
- `npm run lint` — gruen
- `npm test -- --run` (Full-Suite) — 3 RED-Tests (PRE-EXISTING, nicht durch M1dn verursacht)
  - `m1ak_waldtanz_kartenpop_lichtung.test.tsx` — prefers-reduced-motion (M1f-Konflikt)
  - `m1aw_waldtanz_handkante.test.tsx` — Handkarten-Panel-Geometrie (M1f-Konflikt)
  - `m1da_waldtanz_handflaeche_erstbild.test.tsx` — Handkarten-Panel-Geometrie (M1f-Konflikt)
  - Bestätigt per `git stash -u` Test: alle 3 RED-Tests sind pre-existing (auch ohne M1dm/M1dn)

### Code-Review
- **REVIEWER=kimi-cli** (Watchdog-Empfehlung am 2026-06-26 09:00 UTC: codex NOT_FUNCTIONAL, kimi-cli OK)
- Kimi K2.7 Output: **0 BLOCKERS**, 9 NON-BLOCKERS (alle affirmativ/bestaetigend, keine Aenderungen erforderlich)
- Empfehlungen: keine Aenderungen erforderlich
- Hinweis Kimi: Slice-Klassen-Audit (kein Layout-Reflow, kein Cascade-Risiko) und Forbidden-Tokens-Audit (M1dn nutzt kein verbotenes Token) bestanden

### Production-Smoke (live, post-deploy)
- `node scripts/m1dn_waldtanz_kompass_flach_smoke.mjs` — gruen
  - 1280x900: Heading display=none, Nächster-Schritt display=none, 3 Rankenchips, Brettrand-Arenazug sichtbar mit End-Turn-Kicker
  - 1100x800: gleiche Assertions, alle gruen
  - 0 console-Errors, 0 page-Errors
- HTTP 200 auf `/` und `/game`

## Was sichtbar besser wurde

**Vorher (M1dm-Status):** auf /game zeigte der "Waldtanz-Kompass" als Section mit Heading + 3 doppelbeschrifteten Status-Chips (Phase/Hand/Quest mit jeweils Label + Wert) + "Nächster Schritt: Eine spielbare Aktion auswählen"-Paragraph. Das wirkte wie eine zweite Aktions-Buttonliste neben dem Brettrand-End-Turn-Knopf.

**Nachher (M1dn):** auf /game ist der Kompass-Heading und der "Nächster Schritt"-Paragraph visuell ausgeblendet (display:none). Die 3 Indikator-Chips bleiben sichtbar als flache Stitch-Statusleiste. Die phase-spezifische Handlungsanweisung lebt jetzt am Brettrand-End-Turn-Knopf (Waldtanz-Arenazug) als single source of truth — End-Turn-Kicker + phase-spezifischer Text tragen die naechste Aktion.

**User-Feedback-Treue:** "Weg vom Button-geklickt-/Debuglisten-Gefuehl hin zu echtem Spielerlebnis." Mit M1dm + M1dn sind jetzt ZWEI ehemalige "Click-Simulator"-Aktions-Listen aus /game entfernt: (1) der Aktionen-Dock, (2) der redundante Kompass-Heading + Paragraph. Die Schlangenlichtung ist visuell noch mehr das Zentrum.

**Lobby-Integritaet:** Auf / (Lobby) bleibt der Kompass inkl. Heading + Statgitter + "Nächster Schritt"-Paragraph unveraendert sichtbar, weil die display:none-Regel route-scoped (.spielbereich--game-route Praefix) ist.

## Naechste sichtbare Luecke Richtung echtes Spielerlebnis

Aus dem Production-Screenshot abgeleitet: der **Sonnenstand-Bereich oben links** ("Spielstatus" mit "Karten ausspielen" + "Spieler 1 am Zug" + 2 Spieler + Zugkarten-Chips + Entwicklungsdaten-Badge) wirkt noch wie eine **doppelte HUD-Statusleiste**: zeigt dieselben Werte (Phase + aktiver Spieler) wie die Phasen-Banner (1 2 3 4 Reihe) in der Mitte. Die Phasen-Banner sind die zeitgemaessere Stitch-Variante; der Sonnenstand darunter ist doppelt gemoppelt.

Kandidaten-Slice M1do: **Sonnenstand auf /game visuell reduzieren** — die "Karten ausspielen"-Phase + "Spieler 1 am Zug"-Spielerinfo wandert in den Brettrand-Arenazug-Header (Phase-Label ist schon da), die Counts (2 Spieler, Zugkarten 0/2) koennen als winzige Stitch-Chips in der Spielerplakette oder im Phasen-Banner landen. Mittelgross, niedriges Risiko, deutlich sichtbare Verbesserung — entfernt die dritte "Click-Simulator-HUD-Liste".
