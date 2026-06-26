# Release-Status 2026-06-26 — M1g Spielerplakette-Konsolidierung

## Status

Release abgeschlossen auf stabiler Production-Alias:
https://schlangentanz-v2.vercel.app

## Slice

M1g ist ein sichtbarer Stitch-Brettordnungs-Slice innerhalb des
Waldtanz-Game-Board-Strangs (M1). Der Kimi-Blocker aus M1f
(Doppel-Cluster von Avatar + Name + Punkten auf `/game`)
wird aufgeloest: die linke Grid-Spielerplakette (M1cx) ist
**Single Source of Truth** fuer Avatar + Spielername + Punkte;
die Handbuehnen-Spielerplakette ist eine reine Heading-Box
"Deine Hand — Spieler 1" ohne Avatar-Glyph und ohne
isolierte Punkte-Anzeige.

Das ist kein A11y-Mikroslice (kein aria/idref/live-region), sondern
ein sichtbarer UI-Konsolidierungs-Slice, der das Waldtanz-Brett
visuell aufrauernt, ohne Engine-Regeln, Aktionen oder Layout zu
veraendern. Engine-Touchpoint nein, Engine-Regeln nein, Layout nein.

## Umsetzung

- `src/components/HandkartenPanel.tsx`: Avatar-Glyph
  (`.handkarten-buehne__avatar` `<span aria-hidden>🧙</span>`)
  und Punkte-Anzeige (`<span>{punkte} Punkte</span>`) aus
  `.handkarten-buehne__spielerplakette` entfernt. Heading bleibt
  als `<strong className="handkarten-buehne__spielerplakette-titel">Deine Hand — {spielerName}</strong>`.
  Punkte-Prop bleibt mit eslint-disable Prefix fuer Aufrufer-Kompatibilitaet.
- `src/App.css`: `.handkarten-buehne__spielerplakette` ist jetzt
  `display: grid` (vorher `flex` mit `gap: 0.65rem` fuer Avatar).
  `.handkarten-buehne__spielerplakette-titel` als dedizierte
  Heading-Klasse mit `font-family: var(--st-font-headline)` und
  `line-height: 1.1`.
- `src/App.m1aq_waldtanz_handbuehne.test.tsx`: Migration der
  "0 Punkte"-Erwartung in die linke Grid-Spielerplakette
  (`aria-labelledby="Waldtanz-Spielerplakette"`), die jetzt der
  einzige Punktzahlen-Render-Ort ist. Zusatzassert:
  `.handkarten-buehne__avatar` darf in der Handbuehne NICHT mehr
  existieren.
- `src/App.m1g_waldtanz_spielerplakette_konsolidierung.test.tsx`:
  3 RED-Tests (DOM-Asserts auf Avatar/Punkte, CSS-Vertrag
  `display: grid`, Smoke-Wiring in `package.json`).
- `scripts/m1g_waldtanz_spielerplakette_konsolidierung_smoke.mjs`:
  Production-Live-Smoke fuer 2 Viewports (1280x900 + 1100x800)
  plus `--self-test` Modus. Prueft: linke Grid-Spielerplakette
  hat Avatar + Punkte-Pille; Handbuehnen-Plakette hat
  `buehneHatAvatar=false`, `buehneHatPunkte=false`,
  `buehneHeadingText="Deine Hand — Spieler 1"`; beide
  bottom ≤ 900 im 900-Viewport.
- `package.json`: `smoke:production`-Kette enthaelt das neue Skript
  hinter `m1f_waldtanz_handbuehne_smoke.mjs`.

## TDD-Nachweis

RED beobachtet:
```bash
npx vitest run src/App.m1g_waldtanz_spielerplakette_konsolidierung.test.tsx
```
Ergebnis: 3/3 Tests rot — Avatar/Punkte-DOM-Assert schlug fehl
(Doppel-Cluster noch vorhanden), CSS-Source hatte noch
`display: flex` und `gap: 0.65rem`, Smoke-Wiring fehlte in
`package.json`.

GREEN nach Implementierung:
```bash
npx vitest run src/App.m1g_waldtanz_spielerplakette_konsolidierung.test.tsx
        src/App.m1aq_waldtanz_handbuehne.test.tsx
```
Ergebnis: 4/4 Tests bestanden. Targeted-Suite kombiniert M1g + M1aq.

## Gates

- [x] RED: 3/3 Tests bestanden nach GREEN-Pass.
- [x] Targeted: 4/4 (M1g + M1aq).
- [x] Full Tests: `npm test -- --run` → 344 Testfiles, 1160 Tests bestanden.
      2 pre-existing Stale-Asserts in M1aw/M1da (Cap-Wert
      `clamp(13rem, 24vh, 15rem)` vs. alte Erwartung) sind NICHT
      durch M1g verursacht — HEAD `f2e863f` M1f-Fix-2 zeigt sie
      bereits rot. Migration dieser Asserts ist eigener Folge-Slice.
- [x] Typecheck: `npm run typecheck` bestanden (Punkte-Prop mit
      `_punkte` Prefix unterdrueckt TS6133).
- [x] Lint: `npm run lint` bestanden (`eslint-disable-next-line`
      an der ungenutzten Punkte-Destructuring-Zeile).
- [x] Test-Lines: `npm run check:test-lines` bestanden.
- [x] Build: `npm run build` bestanden — `dist/assets/index-DSw0_gXm.css` (211.04 kB),
      `dist/assets/index-DmfsGsW8.js` (406.82 kB).
- [x] Smoke-Wiring: `package.json` `smoke:production`-Kette enthaelt
      `scripts/m1g_waldtanz_spielerplakette_konsolidierung_smoke.mjs`.
- [x] Smoke-Self-Test: `node scripts/m1g_waldtanz_spielerplakette_konsolidierung_smoke.mjs --self-test` bestanden.
- [x] Production-Smoke live: gruen auf `https://schlangentanz-v2.vercel.app/game`,
      beide Viewports (1280x900 + 1100x800).

## Code-Review

- **Reviewer:** Kimi Code CLI v0.18.x (K2.7), statt Codex CLI.
- **Begruendung:** Watchdog-Probe (2026-06-26 03:31) meldet
  `codex=NOT_FUNCTIONAL` (stdin-Block / usage limit),
  `kimi-cli=OK`. Prioritaet Codex → Kimi → NONE. Kimi gewaehlt.
- **Reviewer-Brief:** `/tmp/review_brief_m1g.md` (inkl. untracked
  Files + Worktree-Direkt-Inspektion).
- **Befund Kimi:** BLOCKERS None. 3 NON-BLOCKERS, alle affirmational
  oder unbedeutend:
  1. CSS `display: grid` koennte semantisch `display: block` sein,
     keine Funktions-/Layout-Auswirkung.
  2. Smoke-Skript defaultet auf Production-URL — vor Deploy rot,
     nach Deploy gruen (erwartet).
  3. Test-Datei ohne `afterEach(cleanup)` — wie im Projektstil
     ueblich; keine Isolations-Probleme beobachtet.
- **Empfehlung Kimi:** Approve. Keine Code-Aenderungen erforderlich.

## Deploy

- **Schritte:** Vercel Production Deploy ueber CLI mit `VERCEL_TOKEN`
  aus `~/.bashrc`. Build erfolgreich, Aliased auf
  `https://schlangentanz-v2.vercel.app`.
- **Was sichtbar besser wurde:**
  - `.handkarten-buehne__spielerplakette` rendert nur noch den
    Heading "Deine Hand — Spieler 1" — keine doppelte Avatar-Show
    und keine isolierte Punkte-Zahl mehr in der Handbuehne.
  - Linke Grid-Spielerplakette (M1cx) ist jetzt der einzige sichtbare
    Ort fuer Avatar + Name + Punkte des aktiven Spielers.
  - Brettrand wirkt ruhiger, Spielerauge wird nicht mehr zwischen
    zwei redundanten Plaketten hin- und hergezogen.

## Naechste Luecke Richtung echtes Spiel

- **M1h/m1i-Stil (Slot M1dm oder M1dn frei):** Aus dem Stitch-Design
  sind Schlangen-Anlegeplaetze mit Pfeil-Piktogramm (links/rechts)
  sichtbar. Aktuell rendert die Engine die Position-Wahl als
  Text "Linkes Ende / Rechtes Ende" — Stitch-Stil waere ein
  `<`/`>` Piktogramm oder ein gebogener Pfeil als visueller
  Hinweis auf der Anlegeplatz-Box. Das waere ein naechster
  sichtbarer Brett-Vertical mit Spielwert.
- **M3c/M3d (Lobby-Erweiterung):** Sonniges Nest bietet jetzt
  Spielstart mit 1-3 KI-Gegnern (M3b). Naechste Luecke waere
  sichtbare KI-Schwierigkeits-Auswahl (Anfaenger/Fortgeschritten)
  oder Rundenzaehler-Wahl.
