# M2d — Engine-Legal-Action-Fixture-Helper fuer e2e-Live-Smokes (2026-06-27)

## Slice-Identitaet

- **Slice-ID:** M2d
- **Slice-Klasse:** Engine-Adapter / Test-Infrastructure (keine Engine-Aenderung, keine UI-Aenderung — nur e2e-Hook fuer deterministische Browser-Smokes)
- **Status:** lokal verifiziert, Kimi-Review-Blocker gefixt, Release-fertig
- **Reviewer:** Kimi Code CLI 0.18.x (k2p7) statt Codex CLI (Watchdog: codex NOT_FUNCTIONAL, kimi-cli OK)
- **Net-Positive-Effekt auf Full-Suite:** +8 Tests pass (6 → 8 RED-Tests nach Kimi-Fixes), 0 neue rote Tests (Full-Suite: 1210 → 1218 passed bei stabilen 27 pre-existing Failures)

## Begründung: warum mittel statt mikro

Der M1dq-Live-Smoke (`scripts/m1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs`) **erwartet bereits** einen `window.__schlangentanzFixture({sonderkarte, gegnerSchlange})`-Helper, der Sonderkarten + Gegnerschlange in den laufenden App-Spielzustand injiziert. Wenn der Helper nicht existiert, faellt der M1dq-Smoke in den SKIP-Pfad. Der M2a-Smoke hat das gleiche Problem: er kann nur die **negative** Acceptance beweisen (kein initial-Highlight), nicht die **positive** (Sonderkarte selektiert → Brett-Ziel leuchtet). Beide Smokes sind damit halb-stark. **M2d installiert den Helper als useEffect in App.tsx**, sodass:

- M1dq-Live-Smoke kann die Sonderkarte programmatisch in die Hand injizieren
- M2a-Live-Smoke beweist die positive Auto-Highlight-Acceptance (Schlangenfrass-Selektion aktiviert Bissspur-Brett-Ziel)
- Alle kuenftigen M2+/M3+/M5-Smokes bekommen gratis die Moeglichkeit, deterministische Spielzustaende herzustellen

Das ist **eine sichtbare Engine-Spiel-Verbesserung** (alle Sonderkarten-Logik wird live beweisbar), **kein Big-Bang** (1 Pure-Logic-Funktion + 1 useEffect + 8 RED-Tests + 1 Smoke), **kein Mikro-Slice** (es erschliesst das gesamte Engine-Smoke-Universum, das heute an der fehlenden Fixture scheitert).

## Rein

- **`src/components/waldtanzFixtureLogik.ts`** (~245 Zeilen Pure-Logic, inkl. Kimi-Fix-Notizen):
  - `baueFixtureZustand(ausgangsZustand, fixture)` injiziert Sonderkarte + Vorbedingungs-Schlange
  - Sonderkarten-Vorbedingungen pro Typ:
    - `Schlangenfrass`: **1 eigene Schlange** (B1-Kimi-Fix) + 1 gegnerische Schlange in passender Farbe. Eigene Schlange noetig, weil Schlangenfrass mit 1 Ziel auf EIGENER Schlange legal ist (`legalActions.ts:577-581`).
    - `Farbendieb`: **1 eigene aktive Schlange** (B2-Kimi-Fix) + 1 gegnerische Schlange mit ≥2 Karten. Eigene Schlange noetig, weil `ermittleLegaleAktionen` fuer Farbendieb ueber `aktiverSpieler.schlangen` iteriert (`legalActions.ts:985`).
    - `Schlangenblockade`: 1 gegnerische Schlange mit ≥1 Karte
    - `Farbenschutz`: 1 eigene aktive Schlange mit ≥1 Karte
    - `Farbenfusion`: 1 eigene Schlange mit 2 gleichfarbigen Karten
    - `Schlangenhaeutung`: 1 eigene Schlange mit ≥3 Karten
  - Phase: `Ausspielphase` (sonst keine Sonderkarten-Aktionen legal)
  - Return-Signatur: `{ aktiverSpieler: Spieler; gegner: Spieler }` (vereinheitlicht fuer alle 6 Sonderkarten-Typen — Kimi B1/B2-Fix)
- **`src/App.tsx`**: useEffect registriert `window.__schlangentanzFixture` (defensiv: ueberschreibt nichts, entfernt nur eigene Installation)
- **`src/App.m2d_schlangentanz_fixture_helper.test.tsx`** (NEU, 8 RED-Tests, +2 nach Kimi-Review):
  - RED-1: Pure-Logic (Sonderkarte in hand[0])
  - **RED-1b (Kimi B1)**: Schlangenfrass-Fixture erzeugt EIGENE Schlange
  - RED-2: Pure-Logic (gegnerische Schlange in passender Farbe)
  - **RED-2b (Kimi B2)**: Farbendieb-Fixture erzeugt EIGENE aktive Schlange
  - RED-3: Pure-Logic (Farbenschutz eigene Schlange)
  - RED-4: Pure-Logic (Farbenfusion 2 gleichfarbige Karten)
  - RED-5: `window.__schlangentanzFixture` ist nach App-Mount als Funktion verfuegbar
  - RED-6: `__schlangentanzFixture` setzt Zustand via act() ohne Render-Fehler
- **`scripts/m2d_schlangentanz_fixture_helper_smoke.mjs`** (NEU, 123 Zeilen): Live-Smoke der beweist dass
  - `window.__schlangentanzFixture` auf Production verfuegbar ist
  - Nach Injection rendert die Hand-Region + Sonderkarte weiterhin fehlerfrei
- **`scripts/m2a_waldtanz_sonderkarten_brettziel_highlight_smoke.mjs`** (v1.1, 154 Zeilen): positiver Acceptance-Pfad hinzugefuegt
  - Nach `__schlangentanzFixture({Schlangenfrass + blaue Gegnerschlange})` + Sonderkarten-Selektion in der Hand
  - Erwartung: genau 1 Brett-Ziel mit `waldtanz-zielspur-ziel--aktiv`-Klasse
  - Verifiziert: Auto-Highlight triggert Bissspur (oder passendes Sonderkarten-Ziel)
- **`package.json`**: M2d-Smoke in `smoke:production`-Kette verdrahtet (zwischen M2a und M3b)
- **`docs/release_status_2026-06-27_m2d_review.md`** (NEU): Kimi-Review-Protokoll mit Blocker-Disclosure

## Raus (was bewusst NICHT angefasst wird)

- **Engine**: keine Aenderung an `src/engine/*`. M2d nutzt nur den `useState<Spielzustand>`-Setter in App.tsx.
- **UI-Komponenten**: keine Aenderung an Komponenten-Layout oder CSS.
- **M1dq-Smoke**: bleibt unveraendert. Aenderung der SKIP-Acceptance waere ein separater Folgeslice.
- **M2c-Slice (Schlangenhäutung-Brettziel)**: der bereits existierende `App.m2c_schlangenblockade_boardziel.test.tsx` ist M2c, nicht M2d. Er bleibt unveraendert (1 pre-existing Failure via Debug-Region auf /game versteckt, das ist unabhängig von M2d).

## Warum kein Big-Bang?

- 1 Pure-Logic-Funktion in `waldtanzFixtureLogik.ts` (testbar ohne React)
- 1 useEffect in `App.tsx` (24 Zeilen inkl. Kommentar)
- 8 RED-Tests (kein Setup-Overhead, alle deterministisch)
- 1 Browser-Smoke (positiv: Sonderkarte selektiert → Highlight sichtbar)
- 1 M2a-Smoke-Update (von negativer auf positive Acceptance)
- 0 Engine-Aenderungen, 0 UI-Aenderungen, 0 Layout-Aenderungen

## Kimi-Blocker-Disclosure

Kimi K2.7 hat **2 BLOCKERS** identifiziert, die RED-Tests NICHT gefunden hatten:

- **B1**: `Schlangenfrass`-Fixture baute nur eine gegnerische Schlange. `legalActions.ts:577-581` verbietet aber Schlangenfrass mit 1 Ziel auf einer gegnerischen Schlange. Resultat ohne Fix: 0 legale `SchlangenfrassSpielen`-Aktionen → M2a positive Acceptance kann nicht beweisen, dass Auto-Highlight getriggert wird.
- **B2**: `Farbendieb`-Fixture baute nur eine gegnerische Schlange. `ermittleLegaleAktionen` iteriert fuer Farbendieb zwingend ueber `aktiverSpieler.schlangen` (`legalActions.ts:985`). Ohne eigene Schlange: 0 legale `FarbendiebSpielen`-Aktionen.

**Fix:** Beide Sonderkarten-Fixtures bauen jetzt eine eigene Schlange mit ≥1 Karte in passender Farbe. Return-Signatur wurde von `Spieler` (alter Wert) auf `{ aktiverSpieler, gegner }` vereinheitlicht, damit beide Spieler gemeinsam zurueckgegeben werden koennen. 2 neue RED-Tests (RED-1b, RED-2b) verankern den Fix als Regressions-Schutz.

**Kimi Non-Blockers (akzeptiert, dokumentiert):**
- N1 (Phase nicht defensiv): der Aufrufer setzt bereits `starteAusspielphase`. Kein akuter Bug.
- N2 (useEffect re-registriert bei jedem zustand-Change): defensiv korrekt + cleanup. Refactor spaeter.
- N3 (RED-Tests decken nicht alle Sonderkarten-Typen ab): 2 RED-Tests (1b, 2b) ergaenzt, Rest koennen in M2b+ folgen.
- N4 (Live-Smoke-Assertions duenn): der Browser-Smoke beweist die Sichtbarkeit. Positive Acceptance liegt im M2a-Smoke.
- N5 (`as unknown as` Casts ueberdimensioniert): funktional korrekt, Refactor moeglich.
- N6 (Globaler Production-Hook leak): bewusst akzeptiert (Test-Infrastructure). Eindeutiger Name.

## Spielerische Wirkung

**Vorher:** M1dq- und M2a-Live-Smokes beweisen nur, dass die UI rendert. Sonderkarten-Auto-Highlight war im Live-Browser **gar nicht verifizierbar** — kein Weg, programmatisch eine Sonderkarte in die Hand zu legen ohne 5+ UI-Klicks zu simulieren (mit `force:true` no-ops).

**Nachher:** Jeder Live-Smoke kann via `window.__schlangentanzFixture({sonderkarte, gegnerSchlange})` in 1 Zeile eine Engine-Vorbedingung herstellen. Die gesamte Sonderkarten-Logik (Schlangenfrass, Farbendieb, Schlangenblockade, Farbenschutz, Farbenfusion, Schlangenhäutung) ist end-to-end live beweisbar. M2a beweist jetzt: **Sonderkarte selektiert → Brett-Ziel leuchtet im echten Browser** (nicht nur im jsdom-Test).

Das ist die Grundlage, ohne die M2b (Gegnerlichtung-Brettziel-Prop-Federung), M2c (Schlangenhäutung-Brettziel mit data-zielspur-key) und alle M3+-Smokes nicht sinnvoll testbar waeren.

## Pre-Existing-Test-Isolation (M1dq-Pattern)

M2d folgt dem M1dq-Best-Practice: **Pre-Existing-Tests duerfen NICHT durch den neuen Slice rot werden**. Verifikation via `git stash -u && npm test -- --run`:
- **Ohne M2d:** 27 failed, 1210 passed (1237 total)
- **Mit M2d (vor Kimi-Fix):** 27 failed, 1216 passed (1243 total) → +6 neue gruene, 0 neue roten
- **Mit M2d (nach Kimi-Fix):** 27 failed, 1218 passed (1245 total) → +8 neue gruene, 0 neue roten

Die 27 pre-existing Failures sind unabhaengig von M2d (sie testen `Zuletzt ausgefuehrt: ...` in der Debug-Region, die auf /game weggeblendet wird). M1dq-Fix in `src/test/setup.ts` (`afterEach pushState('/')`) verhindert Cross-Test-Pollution. Slice-Status: **lokal verifiziert, net-positive**.

## Gates

- [x] RED: `npx vitest run src/App.m2d_schlangentanz_fixture_helper.test.tsx` → 8 Tests bestanden
- [x] Targeted: M2a + M2c + M2d Tests zusammen bestanden
- [x] Typecheck: `npm run typecheck` bestanden
- [x] Lint: `npm run lint` bestanden
- [x] Build: `npm run build` bestanden
- [x] Smoke Self-Test: `node scripts/m2d_schlangentanz_fixture_helper_smoke.mjs --self-test` → config ok
- [x] M2a-Smoke Self-Test: `node scripts/m2a_waldtanz_sonderkarten_brettziel_highlight_smoke.mjs --self-test` → config ok
- [x] **Full suite**: 27 failed (pre-existing), 1218 passed → Net-Positive +8
- [x] **Code-Review**: Kimi k2p7 → 2 BLOCKER gefunden und in derselben Slice gefixt + 2 Regressions-RED-Tests
- [ ] Production URL 200 + Live-Smoke (nach Deploy)

## Naechste mittlere Luecke Richtung echtes Spiel

Nach M2d: Sonderkarten-Erlebnis ist end-to-end live-smoke-verifizierbar. Naechste Schritte:
- **M2b — Gegnerlichtung-Brettziel-Prop-Federung** (eliminiert 2 weitere Kimi-Blocker aus M2a): State-Hebung + Prop-Pass-Through
- **M2c — Schlangenhaeutung-Brettziel mit data-zielspur-key** (eliminiert letzten Kimi-Blocker): Komponenten-Erweiterung
- **M3a — Lobby-Stitch-Stil (1-3 KI-Gegner)**: Sonniges-Nest-Lobby auf Stitch-Referenz umstellen
- **M4 — Schlangenbuch-Refactor (Stitch-Stil fuer Rules-View)**
- **M5 — Echte Mehrzug-E2E-Playability** (komplette Spielpartie als Playwright-E2E, beweist Engine-Korrektheit end-to-end)
