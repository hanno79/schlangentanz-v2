# M2d — Engine-Legal-Action-Fixture-Helper fuer e2e-Live-Smokes (2026-06-27)

**Slice-Klasse:** Engine-Adapter / Test-Infrastructure-Slice (keine Engine-Aenderung, keine UI-Aenderung — nur ein e2e-Hook fuer deterministische Browser-Smokes)

**Milestone:** M2d (Pflicht-Baustein fuer alle M2+ Live-Smokes, schliesst die Fixture-Luecke die Kimi in M2a-Blocker #1 explizit benannt hat)

## Begründung: warum mittel statt mikro

Der M1dq-Live-Smoke (scripts/m1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs, Zeilen 47-63) **erwartet bereits** einen `window.__schlangentanzFixture({sonderkarte, gegnerSchlange})`-Helper, der Sonderkarten + Gegnerschlange in den laufenden App-Spielzustand injiziert. Wenn der Helper nicht existiert, faellt der M1dq-Smoke in den SKIP-Pfad ("keine Sonderkarte in Hand ohne __schlangentanzFixture-Helper"). Der M2a-Smoke hat das gleiche Problem: er kann nur die **negative** Acceptance beweisen (kein initial-Highlight), nicht die positive (Sonderkarte selektiert -> Brett-Ziel leuchtet). Beide Smokes sind damit halb-stark. **M2d installiert den Helper als useEffect in App.tsx**, sodass:

- M1dq-Live-Smoke kann die Sonderkarte programmatisch in die Hand injizieren
- M2a-Live-Smoke kann die positive Auto-Highlight-Acceptance beweisen
- Alle kuenftigen M2+/M3+-Smokes bekommen gratis die Moeglichkeit, deterministische Spielzustaende herzustellen

Das ist **eine sichtbare Engine-Spiel-Verbesserung** (alle Sonderkarten-Logik wird live beweisbar), **kein Big-Bang** (1 useEffect + 1 Pure-Logic-Helper), **kein Mikro-Slice** (es erschliesst das gesamte Engine-Smoke-Universum, das heute an der fehlenden Fixture scheitert).

## Rein

- `src/components/waldtanzFixtureLogik.ts` (NEU): Pure-Logic-Funktion `baueFixtureZustand(ausgangsZustand, fixture)`, die:
  - Sonderkarte `{name, id}` an Position 0 in `zustand.spieler[0].hand` setzt (oder ersetzt, falls schon eine Sonderkarte mit gleichem Namen da ist)
  - Gegnerschlange `{id, farbe, punkte}` in `zustand.spieler[1].schlangen` anlegt mit einer Karte in passender Farbe (notwendig fuer Schlangenfrass/Farbendieb Engine-Gates)
  - `zustand` als neuen Zustand zurueckgibt (immutable)
  - Bei `sonderkarte.name === 'Schlangenfrass'`: 1 gegnerische Schlange mit Karte in `sonderkarte.farbe` (Default: erstes Element aus Hand)
  - Bei `sonderkarte.name === 'Farbenschutz'`: 1 eigene Schlange mit >=1 Karte, damit `findeFarbenschutzAktion` matcht
  - Bei `sonderkarte.name === 'Farbenfusion'`: 1 eigene Schlange mit 2 Karten gleicher Farbe, damit `ermittleFarbenfusionPaarInfo` ein Paar findet
  - Bei `sonderkarte.name === 'Farbendieb'`: 1 gegnerische Schlange mit >=2 Karten (Beutekorb findet 2 Farben)
  - Bei `sonderkarte.name === 'Schlangenblockade'`: 1 gegnerische Schlange mit >=1 Karte
  - Bei `sonderkarte.name === 'Schlangenhaeutung'`: 1 eigene Schlange mit >=3 Karten (Haeutungs-Vorbedingung)
  - Default-Phase: `Ausspielphase` (Engine-Gate fuer Sonderkarten-Aktionen)
- `src/App.tsx` (Aenderung): useEffect der `window.__schlangentanzFixture` registriert, **nur wenn nicht bereits definiert** (defensiv, falls Production-Bundle ein eigenes Fixture hat):
  ```ts
  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window as unknown as { __schlangentanzFixture?: (fixture: unknown) => void }
    if (typeof w.__schlangentanzFixture === 'function') return
    w.__schlangentanzFixture = (fixture) => {
      const zustandNeu = baueFixtureZustand(zustand, fixture as FixtureEingabe)
      setZustand(zustandNeu)
    }
    return () => {
      // Cleanup: nur loeschen wenn wir der Installer sind
      if ((window as any).__schlangentanzFixture === w.__schlangentanzFixture) {
        delete (window as any).__schlangentanzFixture
      }
    }
  }, [zustand])
  ```
- `src/App.m2d_schlangentanz_fixture_helper.test.tsx` (NEU, 6 RED-Tests):
  - RED-1: `baueFixtureZustand` injiziert Schlangenfrass-Sonderkarte in `hand[0]`
  - RED-2: Schlangenfrass-Fixture erzeugt gegnerische Schlange mit Karte in passender Farbe
  - RED-3: Farbenschutz-Fixture erzeugt eigene Schlange mit >=1 Karte
  - RED-4: Farbenfusion-Fixture erzeugt eigene Schlange mit 2 gleichfarbigen Karten
  - RED-5: `window.__schlangentanzFixture` ist nach App-Mount als Funktion verfuegbar
  - RED-6: `window.__schlangentanzFixture({sonderkarte: {name: 'Schlangenfrass', id: 'sf-1'}, gegnerSchlange: {id: 'gs-1', farbe: 'Blau', punkte: 3}})` setzt den Zustand korrekt
- `scripts/m2d_schlangentanz_fixture_helper_smoke.mjs` (NEU): Live-Smoke der **positiv** beweist, dass:
  - Auf `/game` nach Fixture-Injection (`__schlangentanzFixture({sonderkarte: {name: 'Schlangenfrass', id: 'sf-live-1'}, gegnerSchlange: {id: 'gs-live-1', farbe: 'Blau', punkte: 3}})`) eine Sonderkarten-Karte in der Hand sichtbar wird
  - Nach Klick auf die Sonderkarte: **ein** Brett-Ziel-Element die `--aktiv`-Klasse traegt (positive M2a-Acceptance)
  - consoleErrors / pageErrors leer
- `scripts/m2a_waldtanz_sonderkarten_brettziel_highlight_smoke.mjs` (Aenderung): M2a-Smoke wird auf positive Acceptance umgestellt, nutzt den neuen Fixture-Helper
- `package.json`: M2d-Smoke in `smoke:production`-Kette verdrahtet (zwischen M2a und M3b)

## Raus (was bewusst NICHT angefasst wird)

- **Engine**: keine Aenderung an `src/engine/*`. M2d nutzt nur den `useState<Spielzustand>`-Setter in App.tsx.
- **UI-Komponenten**: keine Aenderung an Komponenten-Layout oder CSS. M2d ist reine Test-Infrastructure.
- **Andere Smokes**: M1dq-Smoke bleibt unveraendert (er nutzt den Helper bereits, ist aber heute im SKIP-Pfad). Aenderung der SKIP-Acceptance-Logik waere eine separate Folgescheibe.
- **Production-Performance**: useEffect-Footprint minimal (1 Funktions-Registrierung pro Mount, Cleanup bei Unmount).

## Warum kein Big-Bang?

- 1 Pure-Logic-Funktion in `waldtanzFixtureLogik.ts` (testbar ohne React)
- 1 useEffect in `App.tsx` (4-5 Zeilen)
- 6 RED-Tests (kein Setup-Overhead, alle deterministisch)
- 1 Browser-Smoke (positiv: Sonderkarte selektiert -> Highlight sichtbar)
- 1 M2a-Smoke-Update (von negativer auf positive Acceptance)
- 0 Engine-Aenderungen, 0 UI-Aenderungen, 0 Layout-Aenderungen

## Nächste mittlere Lücke Richtung echtes Spiel

Nach M2d: Sonderkarten-Erlebnis ist end-to-end live-smoke-verifizierbar. Naechste Schritte:
- **M2b — Gegnerlichtung-Brettziel-Prop-Federung** (eliminiert 2 weitere Kimi-Blocker): State-Hebung + Prop-Pass-Through
- **M2c — Schlangenhaeutung-Brettziel mit data-zielspur-key** (eliminiert letzten Kimi-Blocker): Komponenten-Erweiterung
- **M4 — Schlangenbuch-Refactor** (Stitch-Stil fuer Rules-View, bisher nur als Overlay)
- **M5 — Echte Mehrzug-E2E-Playability** (komplette Spielpartie als Playwright-E2E, beweist Engine-Korrektheit end-to-end)
