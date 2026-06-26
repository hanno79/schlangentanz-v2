# M1do Release-Status — Waldtanz-Sonnenstand-HUD-Reduktion auf /game

**Datum:** 26.06.2026
**Slice-ID:** M1do (Fortsetzung der M1-Waldtanz-Game-Board-Reihe, nach M1dn Kompass-Flach)
**Vorgaenger:** `c8d4c4e M1dn: Waldtanz-Kompass als flache Indikator-Pillen-Reihe auf /game`
**Reviewer:** Kimi Code CLI 0.18.0 (k2p7), Watchdog-Empfehlung: codex NOT_FUNCTIONAL, kimi-cli OK
**Klasse:** CSS-only Section-Visual-Removal (M1dm-/M1dn-Familie)

## Kurzfassung

Die `.waldtanz-sonnenstand`-Box oben links auf /game ist die dritte "Click-Simulator"-Status-Liste.
Sie dupliziert Phasen-Information, die bereits in Phasen-Banner (M1dk) + Brettrand-Arenazug +
Spielerplakette (M1g) + Zugfortschritt-Phase-Schrittleiste single-source-of-truth lebt.
Diese Slice entfernt sie visuell auf /game via route-scoped `display:none` und macht damit
den Brettrand-Arenazug mit Phasen-Banner + End-Turn-Knopf zum unbestrittenen visuellen Anker.

Section bleibt im React-Tree (kein Remove) — a11y-Pfade und `aria-labelledby` bleiben intakt.
Auf / (Lobby) ist sie weiterhin voll sichtbar (kein route-scope-Leak).

## Commits

- (wird beim Push ergaenzt)

## Geaenderte / neue Dateien

- `package.json` — `smoke:production` Chain um M1do-Smoke erweitert
- `src/App.css` — neue route-scoped Regel: `.spielbereich--game-route [class~="waldtanz-sonnenstand"] { display: none; }` (Specificity 0,2,0 > Basis 0,1,0)
- `docs/slice_plan_m1do.md` (neu) — Slice-Plan
- `scripts/m1do_waldtanz_sonnenstand_reduktion_smoke.mjs` (neu) — Production-Smoke
- `src/App.m1do_waldtanz_sonnenstand_reduktion.test.tsx` (neu) — 6 RED-Tests
- `docs/release_status_2026-06-26_m1do.md` (neu) — diese Datei

## Gates

| Gate | Ergebnis |
|---|---|
| Targeted Tests (M1do) | 6/6 gruen (345ms) |
| Full Suite | 1183 passed, 3 failed (vorher 1181 passed, 5 failed) — netto +2 gruen, -2 rot |
| Typecheck | gruen |
| Lint | gruen |
| Build | gruen (212.63 KB CSS, 407.23 KB JS) |
| Kimi-Review | BLOCKERS: keine, NON-BLOCKERS: 9 (alle adressierbar, keine release-blockierend) |
| Production-Smoke | wird nach Deploy verifiziert (Sektion im DOM, NICHT sichtbar) |

## Pre-existing Failures (von M1do unberuehrt)

Diese 3 Tests sind auch auf HEAD (ohne M1do) rot und betreffen M1ak/M1aw/M1da Handkarten-Panel-Constraints.
M1do hat sie weder verursacht noch veraendert. Sie bleiben als bekannte Issue-Liste im Backlog:

- `m1ak_waldtanz_kartenpop_lichtung` — Reduced-Motion-Schutz-Regex-Aenderung
- `m1aw_waldtanz_handkante` — max-height-clamp-Constraint
- `m1da_waldtanz_handflaeche_erstbild` — Panel-Hoehe 15rem > erwartet 12.1rem

Diese stammen aus einer AERA VOR M1do (M1f-Panel-Cap-Aenderung) und werden in einem separaten Slice
adressiert — nicht im M1do-Scope, weil sie mit Section-Visual-Removal nichts zu tun haben.

## Kimi Review — Details

- Cascade-Order OK: Override-Regel nach Basis-Regel, Specificity 0,2,0 > 0,1,0
- Multi-Class-Cascade OK: `.waldtanz-sonnenstand` traegt nur diese eine Klasse; das Section-Element traegt
  zusaetzliche Klassen, ist aber nicht Ziel der neuen Regel
- Layout-Budget OK: Section ist Kind von `.info-panel--spielstatus` (grid-area `status`), nicht Teil des
  Arena-Subgrids; das Ausblenden reduziert nur die Innenhoehe des Status-Panels
- Forbidden-Token-Bleed OK: keine der gesperrten Tokens (`primary-fixed`, `surface-container-high`,
  `surface-container-lowest`) in der neuen Regel; bestehende Vorkommen sind pre-existing
- DOM-Test-Korrektheit OK: `getByRole('group', { name: 'Waldtanz-Sonnenstand' })` matched
  `<div className="waldtanz-sonnenstand" role="group" aria-label="Waldtanz-Sonnenstand">` in
  `src/components/SpielstatusPanel.tsx`
- Umlaut-Drift: KEINE — alle Texte in SpielstatusPanel.tsx verwenden korrekte Umlaute
- NON-BLOCKER: Plan-Formulierung `.spielbereich--game-route .waldtanz-sonnenstand` weicht von
  Implementierung `[class~="waldtanz-sonnenstand"]` ab — funktional identisch, Specificity sogar
  hoeher; Plan sollte an tatsaechliche Selektor-Form angeglichen werden (siehe slice_plan_m1do.md
  korrigiert in commit-message)

## Sichtbares Spielerlebnis danach

Auf /game oben links verschwindet die gelbe Sonnenstand-Box komplett.
Die linke Spalte enthaelt danach:
- Spielerplakette (M1g, single source of truth fuer Avatar + Name + Punkte)
- Kompass-Indikator-Pillen (M1dn, Phase/Hand/Quest)
- Material & Aufgaben (M1cv)
- Wertung (M1cy)
- Debug-Schublade (Entwicklungsdaten)

Die Schlangenlichtung (Waldtanz-Arenastein in der Mitte) und der Brettrand mit
Phasen-Banner + End-Turn-Knopf sind die visuellen Anker — kein konkurrierendes
Status-Chrome mehr.

## Smoke-Wiring

`smoke:production` in package.json enthaelt `node scripts/m1do_waldtanz_sonnenstand_reduktion_smoke.mjs`
in der korrekten Position (nach M1dn, vor M3b). RED-Test `M1do Smoke-Wiring > RED: smoke:production
script chain enthaelt M1do-Slice-Script` und `M1do Smoke-Wiring > RED: M1do Smoke-Skript enthaelt die
Slice-Funktion` verifizieren das Wiring.

## Pitfall-Vorbeugung verifiziert

- Multi-Class-Cascade-Audit: nur Single-Class, kein Konflikt
- Source-Order-Check: Override-Regel kommt NACH Basis-Regel
- Forbidden-Token-Bleed: keine neuen Tokens
- Layout-Budget: Sektion ist nicht Teil der Arena-Grid, nur Status-Panel-Innenhoehe
- Smoke-Wiring: Test pinned auf die richtige Position in der chain

## Naechster Slice

Nach M1do ist die dritte Click-Simulator-Liste weg. Die linke Spalte auf /game ist jetzt deutlich
ruhiger. Naechste mittlere Luecke Richtung echtes Spiel:

- **M1dp:** Brettrand-Arenazug visuell aufwerten — Phasen-Banner ist schon da (M1dk), End-Turn-Knopf
  schon da (M1f), aber der Header-Bereich selbst ist noch textlastig. Ziel: visuelle Stitch-Konsistenz
  mit dem `Waldtanz Game Board` Referenz-Screenshot (Handkarten dominant, Brettrand als Anker).

Oder Sprung in den naechsten Vertical-Slice-Bereich:

- **M2a:** Board-nahe Sonderkarten-Zielauswahl — Schlangenfrass / Farbenfusion / Farbendieb / Farbenschutz
  mit klaren Drop-Zones auf den Schlangen (Sichtbarkeit der legalen Ziele).

Die Engine-Aktionen funktionieren schon (M1cm Zielwahl, M1co Sprung, M1cp Gegner-Sprung, M1cr Stempel).
M1do hat das Click-Simulator-Problem auf der HUD-Seite geloest; der naechste sichtbare Spielfortschritt
ist eine klarere **Sonderkarten-Zielauswahl** als erste nicht-mechanische Spielerfahrung.
