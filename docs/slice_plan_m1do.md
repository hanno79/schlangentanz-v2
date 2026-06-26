# M1do Slice-Plan — Sonnenstand-HUD auf /game visuell reduzieren

**Datum:** 26.06.2026
**Slice-ID:** M1do (Fortsetzung der M1-Waldtanz-Game-Board-Reihe, nach M1dn Kompass-Flach)
**Vorgaenger:** `c8d4c4e M1dn: Waldtanz-Kompass als flache Indikator-Pillen-Reihe auf /game`
**Reviewer:** Kimi Code CLI (Watchdog-Empfehlung: codex NOT_FUNCTIONAL, kimi-cli OK)

## Klasse und Groesse

- **Klasse:** CSS-only Section-Visual-Removal (M1dm-/M1dn-Familie: keine Engine-Logik, nur UI-Sichtbarkeit via route-scoped `display:none`)
- **Groesse:** klein bis mittel — beruehrt 1 Section + 1 CSS-Regel + 1 Smoke + 1 Test-Datei
- **Risiko:** sehr niedrig — Section bleibt im React-Tree, Grid-Area `status` bleibt stabil fuer M1dd-Grid-Template, keine Engine-Aenderung
- **Weder Mikro-Slice noch Big-Bang:** sichtbare HUD-Liste weg, Phasen-Banner uebernimmt Status, ist echte Stitch-Spielerlebnis-Verbesserung — gross genug um der dritten "Click-Simulator"-Liste den Garaus zu machen, klein genug fuer 1-CSS-Regel-TDD

## Rein (was die Slice liefert)

1. CSS-Regel: `.spielbereich--game-route [class~="waldtanz-sonnenstand"] { display: none }` (route-scoped, Specificity 0,2,0 > Basis 0,1,0, kein Leak auf /)
2. Sichtbarkeitsgarantie: `.waldtanz-sonnenstand` ist im React-Tree weiterhin vorhanden (kein `istGameRoute &&` Remove)
3. RED-Tests: `src/App.m1do_waldtanz_sonnenstand_reduktion.test.tsx`
   - CSS-Vertrag: Regel enthaelt `display: none` fuer den game-route scope
   - DOM-Assert: `.waldtanz-sonnenstand` ist im DOM weiterhin vorhanden (kein Remove)
   - Auf / (Lobby) ist die Sektion sichtbar (kein route-scope-Leak)
4. Production-Smoke: `scripts/m1do_waldtanz_sonnenstand_reduktion_smoke.mjs` fuer 1280x900 + 1100x800
5. Release-Doku: `docs/release_status_2026-06-26_m1do.md`

## Raus (was die Slice NICHT aendert)

- `.spielstatus` Section-Heading ("Spielstatus" h2) bleibt sichtbar auf /game (Lobby-Heading)
- `<Zugfortschritt>` bleibt sichtbar auf /game (Phasen-Schrittleiste ist single source of truth fuer Phasen-Indikator, kein Duplikat)
- `<DebugGruppe>` Entwicklungsdaten-Schublade bleibt sichtbar auf /game (Spielstatus-Debug)
- Auf / (Lobby) ist `.waldtanz-sonnenstand` voll sichtbar (Phase + Spieler + Counts + Spielphase)
- Engine-Logik: nein
- Layout-Reflow: minimal — die Sektion wird zu 0px Hoehe, der grid-area `status`-Cell passt sich an
- Source-Order: keine JSX-Aenderung
- Pre-existing tests:
  - `m1bg_waldtanz_sonnenstand.test.tsx`: bisherige Asserts nur fuer Sichtbarkeit auf / (Lobby), bleiben gruen
  - `m1bo_waldtanz_entwicklungsdaten_schublade.test.tsx`: unabhaengig, bleibt gruen

## Warum genau diese Section

Im Production-Screenshot ist die `.waldtanz-sonnenstand`-Box oben links die dritte
"Click-Simulator"-Status-Liste (M1dm hat den Aktionendock entfernt, M1dn hat den
Kompass-Heading + Nächster-Schritt-Paragraph entfernt). Sie zeigt:
- "Sonnenstand" Eyebrow
- Phasentext (z.B. "Karten ausspielen")
- "Spieler 1 am Zug"
- 3 Chips: "2 Spieler am Tisch", "Zugkarten: 0/2", "Laufende Partie"

All diese Infos leben jetzt anderswo als single source of truth:
- Phasentext → Phasen-Banner (M1dk) in der Brettrand-Mitte
- Aktiver Spieler → Spielerplakette mit Avatar (M1g)
- Spieleranzahl, Zugkarten-Count, Spielphase-Status → Zugfortschritt (Phase-Schrittleiste) + Brettrand-Arenazug-Header (Phase-Label)

Die Sonnenstand-Box ist eine reine Doppelung. Sie kann weg.

## Sichtbares Spielerlebnis danach

Auf /game oben links verschwindet die gelbe Sonnenstand-Box komplett.
Die linke Spalte hat dann nur noch:
- Spielerplakette (M1g, single source of truth fuer Avatar + Name + Punkte)
- Kompass-Indikator-Pillen (M1dn, Phase/Hand/Quest)
- Material & Aufgaben (M1cv)
- Wertung (M1cy)

Die Schlangenlichtung (Waldtanz-Arenastein in der Mitte) und der Brettrand mit
Phasen-Banner + End-Turn-Knopf sind die visuellen Anker.

## TDD-Plan (RED -> GREEN -> SIMPLIFY -> REVIEW -> GATES -> SMOKE -> DEPLOY)

1. **RED** (Test schreiben, schlaegt fehl):
   - `src/App.m1do_waldtanz_sonnenstand_reduktion.test.tsx` mit 4 Tests:
     a) `expect(appCss).toMatch(/\.spielbereich--game-route\s+\[class~="waldtanz-sonnenstand"\]\s*\{[^}]*display:\s*none/)`
     b) `expect(appCss).toMatch(/\.waldtanz-sonnenstand[^{]*\{[^}]*display:\s*none/)` (auch ohne route-Scope geht's nicht, weil Lobby es noch zeigt — Basis-Regel nicht beruehren)
     c) `expect(getByRole('group', {name: 'Waldtanz-Sonnenstand'})).toBeInTheDocument()` auf /game
     d) `expect(getByRole('group', {name: 'Waldtanz-Sonnenstand'})).toBeVisible()` auf / (Lobby)
2. **GREEN** (CSS-Regel hinzufuegen, alle 4 Tests gruen)
3. **SIMPLIFY** (Claude Code `/simplify`-Pass)
4. **REVIEW** (Kimi `kimi -p` mit Reviewer-Brief)
5. **GATES**: `npm test -- --run`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`
6. **SMOKE**: `node scripts/m1do_*_smoke.mjs` auf 2 Viewports, danach `node scripts/live_smoke.mjs`
7. **DEPLOY**: `bash ~/.hermes/skills/schlangentanz-workflow/templates/deploy_prod.sh`
8. **RELEASE-DOKU**: `docs/release_status_2026-06-26_m1do.md`

## Pitfall-Vorbeugung

- **Multi-Class-Cascade-Audit (M1di):** `.waldtanz-sonnenstand` ist ein einzelner Selector, keine Akkumulation. Trotzdem: `grep -n "waldtanz-sonnenstand" src/App.css` zeigt nur die existierenden Regeln (4595-4640). Die neue route-scoped-Regel kommt NACH den Basis-Regeln, gleiche Specificity (0,1,0) — `display: none` ist die einzige Property, also kein Konflikt mit anderen Properties.
- **Source-Order-Check (M1dn):** die neue Regel MUSS nach den Basis-Regeln stehen, weil sie eine Override ist. `appCss.match()` mit dem richtigen Pattern reicht.
- **Forbidden-Token-Bleed (M1dk):** wir nutzen KEIN neues Token, nur `display: none`. Kein M1k-Konflikt.
- **Layout-Budget (M1dk):** Section wird zu 0px, Grid-Cell passt sich an — kein Schlangenbereich-Konflikt, weil das nicht der gleiche grid-area ist (status vs arena).
- **Smoke-Wiring (M1dh):** Slice-Smoke in `package.json` `smoke:production`-Chain einhaengen + RED-Test auf das Wiring.
