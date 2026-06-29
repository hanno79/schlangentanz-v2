# M8 Slice-Plan — Board-Nah Sonderkarten-Zielauswahl (R180/R181/R182/R183 Konsolidierung)

**Datum:** 29.06.2026
**Slice:** M8 — Brett-Nahe Sonderkarten-Aktionsziele als Stitch-Brett-Spielobjekte
**Klasse:** Mittel-Vertical-Slice (Spielwert-Kern, 4 Sonderkarten-Aktionen in einem konsolidierten Brett-UI-Pass)
**Autor:** Hermes Agent (Cron-Lauf, Plan-Phase)
**Status:** Geplant für nächsten Cron-Lauf — RED-Tests bereits im Repo, Implementierung steht aus

## Hintergrund

Die Engine bietet 4 Sonderkarten-Aktionen mit konkreten Brett-Zielen:
- **R180 — Farbenfusion** (2 Karten gleicher Farbe auf einer Schlange → verschmelzen)
- **R181 — Schlangenfrass** (1 oder 2 gegnerische Karten fressen)
- **R182 — Farbenschutz** (eigene Schlange vor Frass schützen)
- **R183 — Farbendieb** (1 gegnerische Karte aus Schlangenbereich stehlen)

Auf dem Brett sind sie aktuell als generische Aktionendock-Buttons versteckt. Der
Spieler klickt "Aktion ausführen" und das System führt aus — kein sichtbarer
Spielmoment.

M2a (Sonderkarten-Brettziel-Highlight, 27.06.2026) hat die **Vorbereitung**
geliefert: Auswahl einer Sonderkarte aktiviert automatisch das passende
Brett-Ziel-Highlight via `ermittleAutoHighlightZielspurKey`. Die
**Ausführung** fehlt: das Highlight zeigt, *wo* gespielt werden kann, aber
es gibt keinen Klick-Pfad, der die Aktion direkt vom Brett auslöst.

## Warum M8 (NICHT vier separate Mikroslices)

Vier separate R-Slices (R180, R181, R182, R183) wären:
- 4× die gleiche Mechanik (Sonderkarte wählen → Brett-Ziel sehen → Aktion
  direkt vom Brett auslösen) — Duplikation ohne UX-Mehrwert
- 4× der gleiche CSS-Klassen-Cluster (`--sonderaktion-ziel`,
  `--farbenfusion-ziel`, `--schlangenfrass-ziel`, `--farbenschutz-ziel`,
  `--farbendieb-ziel`) — bereits partiell in `Schlangenbereich.tsx:435` und
  `App.css:9312-9580` vorhanden
- 4× Release-Status-Doku + Smoke-Wiring — pure Verwaltungskosten

**Ein M8-Slice** konsolidiert:
- Ein gemeinsamer JSX-Pfad in `Schlangenbereich.tsx` für alle 4 Aktionen
- Eine konsolidierte CSS-Sektion in `App.css` (Stitch-Stil, 3px forest-green
  border, hard-shadow-sm, Hover-Lift analog M1db)
- Eine einzige `pruefeSonderaktionAmBrett`-Funktion
- Ein Live-Smoke pro Sonderkarte (4 Stück, parallel)
- Eine Release-Status-Doku

Das ist **mittel-sichtbar**, nicht big-bang: 4 Features mit geteiltem
JSX/CSS-Pfad, jede für sich klein, zusammen sichtbar.

## Akzeptanzkriterien

M8 ist GREEN, wenn:
1. **R180-R183 RED-Tests grün** (4 Test-Dateien, 5+ Tests pro Datei)
2. **Live-Smoke pro Sonderkarte:**
   - `/game` lädt, Sonderkarte auswählen → Brett-Ziel leuchtet
   - Klick auf leuchtendes Brett-Ziel → Aktion wird ausgeführt
   - Engine-State hat die Aktion konsumiert (Farbenfusion reduziert 2 Karten
     auf 1, Schlangenfrass entfernt gegnerische Karten, etc.)
3. **Stitch-Spielgefühl:** Hover über leuchtendes Ziel zeigt Tooltip mit
   Aktionsname (analog M1ds Handkarten-Tooltip), Klick-Klick statt
   Drag-Drop
4. **Reduced-Motion-Override** für Pulsation
5. **Negative Tests:** Sonderkarte abwählen → Highlight verschwindet;
   Sonderkarte ohne legales Ziel → kein Highlight
6. **Route-Scope:** Nur auf `/game`, nicht auf `/` (Lobby)

## Rein

### 1. JSX in `src/components/Schlangenbereich.tsx`

Für jede eigene Schlange / Karte: wenn `sonderaktionZiel` für die aktuelle
Sonderkarte aktiv ist, rendere einen `<button>` direkt auf der Karte
(analog M2a-Logik), der `sonderaktionAktionAusfuehren(schlange/karte)` aufruft.

Pattern-Outline:
```tsx
{sonderaktionZiel?.typ === 'eigene_schlange' && (
  <button
    className="schlangekarte__sonderaktions-button schlangekarte__sonderaktions-button--farbenfusion-ziel"
    onClick={() => onSonderaktionZiel(schlange.id)}
  >
    <strong>Farbenfusion auf dieser Schlange</strong>
  </button>
)}
```

Für 4 Aktionen: 4 analoge Buttons, geteilter CSS-Klassen-Cluster, gemeinsame
`pruefeSonderaktionZiel`-Helper-Funktion.

### 2. CSS in `src/App.css`

Konsolidierter Block (3-Forest-green-border, hard-shadow, hover-lift):
```css
.schlangekarte__sonderaktions-button { /* base */ }
.schlangekarte__sonderaktions-button--farbenfusion-ziel { /* lime */ }
.schlangekarte__sonderaktions-button--schlangenfrass-ziel { /* coral */ }
.schlangekarte__sonderaktions-button--farbenschutz-ziel { /* gold */ }
.schlangekarte__sonderaktions-button--farbendieb-ziel { /* mint */ }
@media (prefers-reduced-motion: reduce) { /* override */ }
```

Ersetze/erweitere die existierenden `.schlangekarte__karte--*-ziel`-Klassen
(die nur Hintergrund-Marker sind, keine Buttons) durch die neuen
Button-Klassen.

### 3. Engine-Wiring in `src/App.tsx`

Neue Funktion `sonderaktionAmBrettAusfuehren(sonderkarteId, zielId)`:
- Liest aktuelle Sonderkarte aus `handkarten` via `sonderkarteId`
- Liest Engine-Aktion aus `legaleAktionen` (existierende Logik)
- Führt die Aktion aus via `turnState.fuehreSonderaktionAus`
- Setzt Highlight zurück (analoge M2a-Logik)

### 4. Tests (RED → GREEN)

**Bestehende RED-Tests, die GREEN werden müssen:**
- `src/App.r180_farbenfusion_boardziel.test.tsx` (5 Tests, RED)
- `src/App.r181_schlangenfrass_boardziel.test.tsx` (5 Tests, RED)
- `src/App.r182_farbenschutz_boardziel.test.tsx` (5 Tests, RED)
- `src/App.r183_farbendieb_boardziel.test.tsx` (5 Tests, RED)

**Neue RED-Tests (Slice-spezifisch):**
- CSS-Klassen-Cluster existiert in `App.css` (5 Klassen-Variants)
- Reduced-Motion-Override existiert
- Route-Scope: nur auf `/game`, nicht auf `/`
- Negativ-Pfad: Sonderkarte abwählen → Button verschwindet
- Hook-Contract: `pruefeSonderaktionZiel` ist pure function

### 5. Live-Smoke (4 Skripte)

- `scripts/m8_farbenfusion_smoke.mjs` — Auswahl + Klick am Brett
- `scripts/m8_schlangenfrass_smoke.mjs`
- `scripts/m8_farbenschutz_smoke.mjs`
- `scripts/m8_farbendieb_smoke.mjs`

Plus `package.json` `smoke:production`-Kette erweitern + RED-Tests für
Smoke-Wiring (analog M5a-Pattern).

## Raus

- Vier separate Release-Status-Doku-Dateien (eine M8-Doku reicht)
- Vier separate Slice-Plan-Dateien
- Vier separate Code-Review-Wellen (eine M8-Review)

## Pflicht-RED-Tests (8 RED-Tests vor GREEN)

1. `appCss.match(/\.schlangekarte__sonderaktions-button\s*\{/)` existiert
2. 4 Klassen-Variants: `--farbenfusion-ziel`, `--schlangenfrass-ziel`,
   `--farbenschutz-ziel`, `--farbendieb-ziel` (4 separate Asserts)
3. `@media (prefers-reduced-motion: reduce) { .schlangekarte__sonderaktions-button* { animation: none } }`
4. Route-Scope: `.spielbereich--game-route .schlangekarte__sonderaktions-button`
   (oder `.schlangekarte__sonderaktions-button { display: none }` auf Lobby)
5. Hook-Contract: `pruefeSonderaktionZiel(schlange, sonderkarte)` ist
   pure function (same input → same output)
6. JSX-DOM-Test: nach `fireEvent.click(sonderaktionsButton)` erscheint
   die Engine-State-Änderung (Farbenfusion-Karten reduziert, etc.)
7. Smoke-Wiring: `package.json` `smoke:production` enthält alle 4
   `m8_*_smoke.mjs`-Skripte
8. Slice-Plan-Existenz: `docs/slice_plan_m8_*.md` ist committed

## Pflicht-Code-Review

Nach GREEN, vor Release:
- **Kimi Code CLI** als Standard-Reviewer (Codex OAuth usage-limited bis
  25.06.2026 19:07 UTC)
- Review-Brief enthält:
  - Aktueller diff inkl. untracked Dateien (`git diff HEAD; git ls-files --others --exclude-standard`)
  - R180-R183 RED-Test-Output (vor und nach GREEN)
  - Pflicht-RED-Test-Output
  - Anweisung: "do not commit, do not push, do not deploy - only respond"
- Disclosure in Release-Status: `REVIEWER=kimi-cli` (oder `REVIEWER=NONE`
  wenn beide ratelimited)

## Tool-Budget-Schätzung

| Phase | Tool-Calls |
|---|---|
| RED-Tests (8 neue + 4 bestehende) | 5-8 |
| JSX-Patch (Schlangenbereich.tsx) | 8-12 |
| CSS-Patch (App.css) | 10-15 |
| Engine-Wiring (App.tsx) | 5-8 |
| Targeted-Test-Run | 3-5 |
| Full-Suite-Run | 1 |
| Gates (typecheck, lint, build, check:test-lines) | 4 |
| 4 Live-Smokes schreiben + self-test | 12-16 |
| Smoke-Wiring in package.json + RED-Tests | 4-6 |
| Slice-Plan (dieses Dokument) | 1 |
| Release-Status-Doku | 1 |
| Commit + Push | 2-3 |
| Vercel Deploy | 1-2 |
| 4 Live-Smokes gegen Production | 4 |
| **Gesamt** | **~60-80 Tool-Calls** |

Vergleich zum durchschnittlichen M-Slice (~25-40 Tool-Calls) ist M8
**doppelt so groß**. Begründung: 4 Aktionen statt 1, geteilter Pattern
aber 4 separate RED→GREEN-Phasen pro Aktion.

**Budget-Plan:** Falls nach 50 Tool-Calls noch nicht GREEN → abbrechen,
Stand als `lokal-fertig-review-blockiert` committen, im nächsten Cron-Lauf
fortsetzen.

## Naechste Luecke nach M8

**M9 — Sonderkarten-Brett-Aktions-HUD-Konsolidierung:** Die 4 Aktions-Buttons
sind dann auf 4 verschiedenen Brettobjekten verteilt (Schlange, Karte,
gegnerische Karte, gegnerische Schlange). M9 würde eine konsolidierte
"Was kann ich jetzt spielen?"-Pille auf dem Brettrand einführen, die alle
4 möglichen Brettobjekte auflistet (analog M2v Brettrand-Zugknopf).
Mittel-Slice, ~30 Tool-Calls, kein Engine-Touch.

Alternative Engine-Richtung: **R182 — `berechneEndrundenSpieler()` Deduplizierung**
(aus Hermes-Code-Review P0 #4, ~50 Zeilen Diff, 4-6 Tests, ~20 Tool-Calls).
Sollte nach M8 eingeplant werden, um den Engine-Korrektheits-Trend fortzusetzen.
