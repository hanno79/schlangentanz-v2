# M8b Slice-Plan — Schlangenfrass 2-Gegner-Zielauswahl State-Machine

**Datum:** 30.06.2026
**Slice:** M8b — Sub-Slice aus M8 (M8a Feedback-Pille committed in ccb7bf6/c7616d6)
**Klasse:** M8b = State-Machine-Later (Half-Finished-Family-9-Pattern, M8a→M8b-Sub-Slicing)
**Status:** 🟡 PLAN

## Zusammenfassung

Auf /game kann der Spieler mit der Schlangenfrass-Sonderkarte 2 gegnerische
Karten auswaehlen, um sie zu entfernen. Die UI-Logik ist implementiert in
`GegnerSchlangenListe.tsx`, ABER der State `erstesFrassZiel` ist im
falschen Scope: bei mehreren gegnerischen Spielern rendert
`WaldtanzGegnerlichtung` eine `GegnerSchlangenListe` PRO Gegner. Jede
Instanz hat ihren eigenen `useState<FrassAuswahl>`, sodass die Bissspur
in Spieler-1's Liste nicht in Spieler-2's Liste sichtbar ist → die
Zweite-Ziel-Sofortaktion wird NIE angeboten, das Spiel haengt fest.

**Fix:** State `erstesFrassZiel` und `setErstesFrassZiel` in die
`WaldtanzGegnerlichtung`-Komponente liften, als Props an die
`GegnerSchlangenListe`-Instanzen weiterreichen. Beim Klick auf die
Bissspur (Ziel 1) wird `setErstesFrassZiel` auf der Parent-Ebene
aufgerufen → alle Listen sehen den State, die Sofortaktion erscheint
in Spieler-2's Liste.

**Visueller Effekt:** Spieler kann eine 2-Gegner-Schlangenfrass
vollenden und sieht die Aktion in der M8a-Pille
("Zuletzt ausgefuehrt: Schlangenfrass mit Karte X: Karte rot-Y aus
Schlange A und Karte blau-Z aus Schlange B entfernen").

## Warum-mittlerer-Vertical (NICHT Mikro, NICHT Big-Bang)

- **Nicht Mikro:** 3 RED-Tests (M2f, R181, R183) real gruen, plus
  M8b-Test-Datei mit 3-4 zusaetzlichen State-Lifting-Tests, plus
  Production-Smoke, plus Komponenten-Refactor (1 Parent + N Children).
- **Nicht Big-Bang:** Engine unveraendert, Aktionen unveraendert, nur
  1 State in 1 Komponente hochgezogen, ~20 Zeilen Code.
- **Sichtbarer Spielwert:** Ohne diesen Fix kann der Spieler
  2-Gegner-Schlangenfrass nicht abschliessen — die Aktion steht im
  Aktions-Pool, ist aber UI-seitig blockiert. M8b macht eine ganze
  Sonderkarten-Kategorie endlich spielbar.

## Rein

1. **State-Lift in `WaldtanzGegnerlichtung.tsx`:**
   - `useState<FrassAuswahl | null>` (Ziel 1)
   - `useState<number | null>` (Spieler-Index wer Ziel 1 hat)
   - oder einfacher: `useState<{ spielerId, schlangenId, kartenId, handkartenId } | null>`
   - Props an `GegnerSchlangenListe` weiterreichen: `externesErstesFrassZiel`, `setExternesErstesFrassZiel`
2. **GegnerSchlangenListe-Props:**
   - Lokales `useState` durch Props ersetzen (`erstesFrassZiel`, `setErstesFrassZiel`)
   - Falls handkartenId != ausgewaehlteHandkarteId: externen State ignorieren
3. **CSS-Vertrag (Route-Scoped, falls noetig):**
   - `.schlangenfrass-zweiziel-kompass` Border + Box-Shadow (M2f 2. Test)
   - `.schlangekarte__karte--schlangenfrass-ausgewaehlt` Outline (M2f 2. Test)
4. **RED-Tests in `src/App.m8b_schlangenfrass_zweiziel_state.test.tsx`:**
   - M8b:1 M2f-Test 1 gruen (Schlangenfrass 2-Ziel waehlbar + ausfuehrbar)
   - M8b:2 R181-Test 2 gruen (Schlangenfrass 2-Ziel, einzelne Sofortaktion)
   - M8b:3 R183-Test 1 gruen (Farbendieb markiert + stiehlt)
   - M8b:4 State-Lift isoliert: zwei `GegnerSchlangenListe`-Instanzen
     koordinieren das Ziel-1-State (Klick auf Spieler-1-Liste → Spieler-2-Liste
     zeigt Sofortaktion).
5. **Production-Smoke `scripts/m8b_schlangenfrass_zweiziel_smoke.mjs`:**
   - Setup: 3 Spieler, 1 Schlangenfrass-Karte, 2 gegner Schlangen mit je 1 Karte
   - Ohne Klick: keine 2-Ziel-Bissspur sichtbar
   - Klick Schlangenfrass in Hand: 2 "Bissspur setzen" sichtbar
   - Klick auf Spieler-1-Bissspur: Spieler-1 zeigt "Ziel 1 ausgewaehlt",
     Spieler-2 zeigt "Schlangenfrass im Schlangenbereich..."
   - Klick auf Sofortaktion: Schlangenfrass wird ausgefuehrt, Pille zeigt
     "Zuletzt ausgefuehrt: ..."

## Raus

- **Keine Engine-Aenderung** (`spieleSchlangenfrass` bleibt unveraendert)
- **Keine Aktion-Lookup-Aenderung** (`findeSchlangenfrassZweiZielAktionen` bleibt)
- **Keine CSS-Cascade-Aenderung** am Schlangenlichtung-Cap
- **Keine Layout-Aenderung** am Brettrand
- **M8c (Farbendieb Platz-Auswahl)** ist eigenstaendiger Folge-Slice

## Geometrie / Cap-Arithmetik

Unveraendert — M2r / M9.5 Cap-Sum-Formel gilt weiterhin.

## Gates

- `npx vitest run src/App.m8b_*.test.tsx src/App.m2f_*.test.tsx src/App.r181_*.test.tsx src/App.r183_*.test.tsx` → 6 RED-Tests gruen
- `npm test -- --run` (full) → keine neuen Failures
- `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` → gruen
- `node scripts/m8b_*.smoke.mjs` (Production) → gruen
- Code-Review: `REVIEWER=NONE` (beide ratelimited), Re-Review im naechsten Cron-Lauf

## Bekannte Probleme / Trade-offs

- **State-Lift macht `WaldtanzGegnerlichtung` leicht groesser** (~10 Zeilen). Akzeptabel weil der State zur Spieler-uebergreifenden Koordination gehoert.
- **Production-Smoke braucht Fixture** weil das 2-Gegner-Schlangenfrass-Szenario nur in einem konstruierten Zustand auftritt. Smoke nutzt `window.__schlangentanzFixture` falls vorhanden, sonst negativen Assert (kein 2-Ziel-Button sichtbar ohne Fixture).

## Commits (erwartet)

- `M8b: Schlangenfrass 2-Gegner-Zielauswahl als State-Machine (State-Lift in WaldtanzGegnerlichtung)`

## Naechste Luecke (M8c-Folge-Slice)

**M8c: Farbendieb Platz-Auswahl** (R183-RED-Tests):
- 2-Klick-Bestaetigungsflow mit Platz-1/Platz-2-Buttons
- Erweitert M8a-Pattern (Feedback-Loop)
- Geschaetzter Tool-Aufwand: ~30-40 Tool-Calls
