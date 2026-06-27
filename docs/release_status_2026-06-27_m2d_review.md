# M2d Review — Kimi k2p7 (27.06.2026)

**Review-Umfang:** `src/components/waldtanzFixtureLogik.ts`, `src/App.tsx`, `src/App.m2d_schlangentanz_fixture_helper.test.tsx`, `scripts/m2d_schlangentanz_fixture_helper_smoke.mjs`, `scripts/m2a_waldtanz_sonderkarten_brettziel_highlight_smoke.mjs`, `package.json`.

## BLOCKERS (müssen vor Merge behoben werden)

1. **Schlangenfrass-Fixture erzeugt keine legalen Aktionen**
   - `baueFixtureZustand` baut für `Schlangenfrass` eine gegnerische Schlange mit **genau einer** Karte (`src/components/waldtanzFixtureLogik.ts:119-127`).
   - `pruefeAktion` für `SchlangenfrassSpielen` erlaubt aber entweder **1 Ziel auf eigener Schlange** oder **2 Ziele auf gegnerischen Schlangen** (`src/engine/legalActions.ts:546-594`).
   - Folge: `ermittleLegaleAktionen` erzeugt keine `SchlangenfrassSpielen`-Aktion, der M2a-positiver-Pfad (`positiveAktiveZiele === 1`) wird im Live-Browser fehlschlagen.
   - **Fix:** Eigene Schlange mit ≥1 Karte bauen (wie im M2a-Unit-Test `src/App.m2a_waldtanz_sonderkarten_brettziel_highlight.test.tsx:34-58`) oder gegnerische Schlange mit ≥2 Karten.

2. **Farbendieb-Fixture fehlt die eigene Ziel-Schlange**
   - Für `Farbendieb` wird nur eine gegnerische Schlange mit 2 Karten erzeugt (`src/components/waldtanzFixtureLogik.ts:129-138`).
   - `ermittleLegaleAktionen` iteriert für `FarbendiebSpielen` aber zwingend über `aktiverSpieler.schlangen` (`src/engine/legalActions.ts:977-1005`).
   - Folge: Farbendieb ist nach Fixture-Injection nicht spielbar — das widerspricht der Slice-Behauptung, alle Sonderkarten-Typen seien live beweisbar.
   - **Fix:** Dem aktiven Spieler für `Farbendieb` zusätzlich eine eigene Schlange mit ≥1 Karte geben.

## NON-BLOCKERS (akzeptabel, aber verbesserungswürdig)

1. **Phase nicht defensiv auf `Ausspielphase` gesetzt**
   `baueFixtureZustand` geht davon aus, dass der Aufrufer bereits `starteAusspielphase` verwendet. Eine Fixture-Funktion, die die Phase zwingend auf `Ausspielphase` setzt, wäre robuster, da Sonderkarten-Aktionen außerhalb dieser Phase illegal sind.

2. **useEffect re-registriert den Hook bei jedem `zustand`-Change**
   Der Effekt hängt von `[zustand]` ab (`src/App.tsx:199`). Cleanup + Re-Install sind korrekt, aber bei jedem State-Update wird der globale Hook neu gesetzt. Eine Ref-basierte Lösung wäre performanter und weniger "noisy".

3. **RED-Tests decken nicht alle Sonderkarten-Typen ab**
   Getestet werden nur `Schlangenfrass`, `Farbenschutz`, `Farbenfusion`. `Farbendieb`, `Schlangenblockade` und `Schlangenhäutung` haben keinen eigenen RED-Test. Auch Edge-Cases (z.B. Sonderkarte bereits in Hand, mehrere Sonderkarten, ungültige Fixture-Eingabe) fehlen.

4. **Live-Smoke-Assertions sind sehr dünn**
   Der M2d-Smoke prüft nur, dass Hand/Sonderkarte sichtbar ist, nicht dass der Hook tatsächlich einen spielbaren Zustand erzeugt. Der M2a-Smoke verwendet den Selektor `[class*="sonder"]`/`[class*="Sonderkarte"]`, der zu breit sein kann und andere Elemente treffen könnte.

5. **Globaler Production-Hook `window.__schlangentanzFixture`**
   Der Hook leakt Test-Infrastructure in das Produktions-Bundle. Für ein Single-Player-Spiel ist das kein Sicherheitsrisiko, aber es sollte bewusst dokumentiert und akzeptiert sein. Keine Kollision mit Playwright/Devtools erwartet (Name ist eindeutig).

## Fixes nach Review (gleiche Slice)

**Beide BLOCKER wurden in derselben Slice gefixt, vor Commit:**

- **B1 fix:** `Schlangenfrass`-Fixture baut jetzt eine **eigene** Schlange mit 1 Karte in passender Farbe (`waldtanzFixtureLogik.ts:118-140`). RED-1b Regressions-Test hinzugefügt.
- **B2 fix:** `Farbendieb`-Fixture baut jetzt eine **eigene** aktive Schlange mit 1 Karte (`waldtanzFixtureLogik.ts:141-162`). RED-2b Regressions-Test hinzugefügt.
- **Refactor:** Return-Signatur von `Spieler` auf `{ aktiverSpieler, gegner }` vereinheitlicht — alle 6 Sonderkarten-Fälle geben jetzt konsistent dasselbe Tupel zurück, damit die M2a-Logik (eigene Schlange vorhanden + Auto-Highlight) sauber funktioniert.

**Test-Effekt nach Fix:** RED-Tests 6 → 8. Full-Suite 1210 → 1218 passed (Net-Positive +8).

**N3 (RED-Tests-Coverage) partiell behoben:** Farbendieb (RED-2b) hat jetzt einen Test. Schlangenblockade + Schlangenhäutung bleiben ohne eigenen Fixture-RED-Test (Coverage-Lücke akzeptiert, Coverage-Erweiterung wäre M2c+/M2b-Folgeslice).
