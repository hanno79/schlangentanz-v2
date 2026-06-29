# Release-Status — M6a Deine erste Schlange als Stitch-Waldlichtung-Onboarding

**Datum:** 29.06.2026 (Finalisierung M6a-Doku, Cron-Lauf `0cca22d2b825`)
**Slice-Klasse:** Stitch-Onboarding-Vertical-Slice (Schwester zu M5a Sieger-Party, M3c Sonniges-Nest-Player-Cards)
**Status:** 🟢 sauber shippable — RED-Tests grün, Gates grün, Smoke verdrahtet, Doku komplett

## Scope

M6a transformiert den bisher textlastigen Empty-State
`<div class="schlangen-startgarten">` mit "Noch keine eigene Schlange /
Wähle eine Handkarte..." zu einem echten **Stitch-Waldlichtung-Onboarding-Moment**:

- Grosse gezeichnete Schlangen-Silhouette (dashed outline SVG) — visuell
  klar: hier entsteht bald eine Schlange
- Pulsierende Drop-Zone in der Mitte der Silhouette (Stitch-Glow)
- "Deine erste Schlange"-Headline + "Ziehe eine Handkarte in den
  leuchtenden Kreis"-Hinweis mit `aria-live="polite"` und `role="status"`
- Schritt-Pillen "1) Handkarte wählen  →  2) Auf den Kreis ziehen"
- Onboarding-Verschwindet-Nach-Erster-Karte: sobald die Spielerin ihre
  erste Schlange gestartet hat (`aktiverSpieler.schlangen.length > 0`),
  wird der Onboarding-Block durch die normalen Schlangen-Listen ersetzt
- Reduzierte-Motion-Variante: kein Pulse, statische Silhouette
- A11y: aria-live="polite" für die Hinweis-Texte, region-Landmark
  für die Forest-Clearing (`aria-label="Deine erste Schlange — Onboarding"`)

**Warum mittlerer Vertical-Slice, weder Mikro noch Big-Bang:** Der
Erst-Spieler-Moment ist die emotional wichtigste Sekunde — die Spielerin
sieht zum ersten Mal ihre leere Waldlichtung. Ein gestaltetes Onboarding
ist der grösste einzelne Spass-Sprung im Spiel (Unterschied zwischen
"Hä, was klick ich jetzt an?" und "Ah, ich lege meine erste Schlange!").
Nur der Empty-State-Pfad wird umgebaut; sobald
`aktiverSpieler.schlangen.length > 0` greift der bestehende
Schlangen-Renderer. Keine Engine-Logik, keine bestehenden Pfade
angefasst.

## Rein (was im Slice drin ist)

1. **Neue Komponente** `src/components/WaldtanzErsteSchlangeOnboarding.tsx`
   (51 Zeilen) — SVG-Schlange-Silhouette mit dashed outline, pulsierende
   Drop-Ring als `<div>` mit CSS-Animation, Headline + Hinweis mit
   `role="status"` und `aria-live="polite"`, geordnete Schritt-Pillen
   in einem `<ol>` mit eigenem `aria-label`
2. **CSS-Block** in `src/App.css` (~95 Zeilen):
   - `.erste-schlange-onboarding` Container-Grid mit Stitch-Padding
   - `.erste-schlange-onboarding__silhouette` mit dashed-outline SVG-Host
   - `.erste-schlange-onboarding__drop-ring` mit `pulse` Animation
   - `.erste-schlange-onboarding__schritte` als Stitch-Pillen
   - `.erste-schlange-onboarding__schritt` mit 3px Border und hard-shadow-sm
   - `@media (prefers-reduced-motion: reduce)` Override (`animation: none`)
3. **`src/components/Schlangenbereich.tsx`** Empty-State ersetzt:
   `<div className="schlangen-startgarten">...` →
   `<WaldtanzErsteSchlangeOnboarding />` wenn `hatEigeneSchlangen === false`
   auf `/game`
4. **Test-File** `src/App.m6a_erste_schlange_forest_clearing.test.tsx`
   mit 11 RED-Tests (CSS-Source + DOM + A11y + Cascade-Regression + Reduced-Motion + Smoke-Wiring)
5. **Live-Smoke** `scripts/m6a_erste_schlange_forest_clearing_smoke.mjs`
   (71 Zeilen) — Screenshot `/tmp/m6a_onboarding.png`,
   Bounding-Box-Asserts (Container ≥ 30% Viewport-Breite, ≥ 25% Höhe),
   Cascade-Audit via `getComputedStyle`
6. **Package.json** smoke:production wiring (Skript am Ende der Kette,
   Flag folgt in `package.json` `smoke:production`-Pipeline)
7. **Release-Status-Doku** (dieses File)

## Raus (was nicht angefasst wurde)

- Engine-Logik (`src/engine/*` unverändert)
- Schlangen-Liste-Renderer (bestehender Pfad bleibt unangetastet)
- HandkartenPanel, AktionenPanel, Brettrand, Spielbrett-Chrome
- KI-Logik, Legal-Actions, Wertung
- Pre-existing Spielfläche, andere Stitch-Slices (M2h Forest-Texture,
  M2i Handkarten-Hero, M2r Schlangenlichtung-Forest-Arena, M2v Brettrand-
  Zugknopf bleiben stabil)

## Gates

| Gate | Status | Beleg |
|---|---|---|
| RED-Tests | 🟢 11/11 grün | `npx vitest run src/App.m6a_erste_schlange_forest_clearing.test.tsx` → 11 passed (37ms) |
| Typecheck | 🟢 grün | `npm run typecheck` → `tsc -b` exit 0 |
| Lint | 🟢 grün | `npm run lint` → `eslint .` exit 0 |
| Build | 🟢 grün | `npm run build` → vite build exit 0 (272ms, 103 modules) |
| Smoke-Wiring | 🟢 grün | `package.json` `smoke:production`-Kette enthält `node scripts/m6a_erste_schlange_forest_clearing_smoke.mjs` als letzten Eintrag |
| Smoke-Self-Test | 🟢 grün (offline) | Skript lädt, BASE_URL korrekt, Helper kompilieren |
| Production-URL | 🟢 HTTP 200 | `https://schlangentanz-v2.vercel.app/game` → HTTP 200 (HEAD `c7c8c8b`) |

## RED-Tests Übersicht (11)

| Test | Vertrag |
|---|---|
| RED-1 | CSS-Source: `.erste-schlange-onboarding` Block existiert |
| RED-2 | CSS-Source: `.erste-schlange-onboarding__silhouette` mit dashed-outline |
| RED-3 | CSS-Source: `.erste-schlange-onboarding__drop-ring` mit pulse-Animation |
| RED-4 | DOM: ohne eigene Schlangen rendert `<WaldtanzErsteSchlangeOnboarding>` |
| RED-5 | DOM: mit eigenen Schlangen rendert KEIN Onboarding |
| RED-6 | DOM: Headline "Deine erste Schlange" sichtbar |
| RED-7 | DOM: Schritt-Pillen "Handkarte wählen" + "Kreis ziehen" sichtbar |
| RED-8 | DOM: aria-live Region mit "Ziehe eine Handkarte"-Hinweis |
| RED-9 | Reduced-motion Override schaltet Pulse-Animation aus |
| RED-10 | Smoke-Wiring: package.json `smoke:production` enthält m6a-Skript |
| RED-11 | Cascade-Regression: keine spätere 0,1,0-Regel überschreibt Pulse |

## Spielerische Wirkung

- **Erst-Spieler-Moment** ist jetzt ein gestalteter Onboarding-Kreis mit
  pulsierender Drop-Zone statt eines reinen Text-Hints. Der Spieler sieht
  sofort, **wo** er seine erste Karte hinziehen muss
- **Schritt-Pillen** "1) Handkarte wählen → 2) Auf den Kreis ziehen"
  zerlegen die Aufgabe in zwei klare Teilschritte
- **aria-live="polite"** auf der Hinweis-Region gibt Screenreadern
  den gleichen Hinweis ohne visuelle Aufdringlichkeit
- **Verschwindet-Nach-Erster-Karte** verhindert, dass der Onboarding-
  Block nach dem Spielbeginn den Brettrand zumüllt
- **Reduced-Motion-Variante** schaltet die Pulse-Animation aus, ohne
  die Silhouette zu verlieren — der Spieler kann trotzdem sehen, **wo**
  er hinziehen muss

## Commits

```
c7c8c8b M6a: Deine erste Schlange als Stitch-Waldlichtung-Onboarding (11 RED-Tests)
3101c6c M6a: Slice-Plan — Deine erste Schlange als Stitch-Waldlichtung-Onboarding
89d6705 M3c: Kimi-Blocker-Resolution — Avatar aria-hidden auf inneren Bild-Wrapper verlagert
```

HEAD `c7c8c8b` ist auf origin/main deployed, Production-URL HTTP 200
(Slice wurde beim letzten Cron-Lauf direkt via Hermes-Editor nach
RED-Tests-Reihenfolge geschrieben, weil Claude Code OAuth 401 zeigte;
Kimi-Review lief via Watchdog-Fallback).

## Naechste Luecke

**Empfehlung M3a — Sonniges-Nest-Lobby-Spielstart:** die `/`-Lobby zu
einem echten Stitch-Spielstart-Screen ausbauen mit Avatar-Auswahl +
KI-Difficulty-Slider + 1-3 KI-Slots. ~80-120 Zeilen, 8-10 RED-Tests,
kein Engine-Touch. Schließt die "Erst-Spieler-Moment"-Luecke nach M6a,
denn M6a deckt nur das Onboarding **nach** dem Spielstart, aber der
Lobby-Schritt davor fehlt noch im Stitch-Stil.

Alternative Schwestern-Slices (Auswahl nach Cron-Budget):
- **M2w** — Sonderkarten-Brettziel-Hover-Tooltip mit Stitch-Icon + Erklärung
- **M2x** — Brettrand-Waldwichtel-Avatar als Stitch-Hero (eigener Spieler)
- **M6b** — Handkarten-Board-Pille als Stitch-Fächer unter dem Brett
  (visuelle Lift-Verbindung zur ersten Schlange)
- **M6c** — Waldiger Brettrand-Backdrop (kompletter Stitch-Forest-Look)

**M3a ist der größte UX-Wert** für den echten Spieler-Loop
(Lobby → Onboarding → Spielbrett → Sieger-Party).

## Kimi-Disclosure

**REVIEWER=kimi-cli** (Codex `NOT_FUNCTIONAL` per Watchdog — codex
wartet auf stdin, Kimi ist der funktionierende Fallback). Watchdog-Output:

```
{"name":"codex","status":"NOT_FUNCTIONAL","detail":"codex wartet auf stdin"},
{"name":"kimi-cli","status":"OK","detail":"kimi -p antwortet"}
```

**Doku-Finalisierungs-Kimi-Pass stand aus:** der eigentliche RED→GREEN-
Kimi-Review lief bereits im vorigen Cron-Lauf, der diese Slice nach
RED-Tests-Reihenfolge direkt via Hermes-Editor (Claude Code OAuth 401)
schrieb. In diesem Lauf ging es nur um die **Release-Doku** +
**finale Verifikation**, nicht um Code-Änderungen — Kimi-Code-Review
ist hier entbehrlich.

**REVIEWER=NONE** für die reine Doku-Erstellung (kein neuer Code, kein
neuer Test, keine neue CSS-Regel), Watchdog wurde trotzdem konsultiert,
um die Empfehlung zu dokumentieren.

**Kimi-Konsultation optional:** wenn Codex OAuth vor nächstem Cron
wieder OK ist, kann ein Re-Review des M6a-Slices als Second-Opinion
laufen — kein Muss-Gate, da Slice bereits alle Gates + RED-Tests grün.

## Implementation Notes

Da der Slice via Hermes-Editor geschrieben wurde (Claude Code OAuth
zeigte 401), wurden die RED-Tests **zuerst** geschrieben (RED-Phase)
und der Code dann in der Reihenfolge RED-Tests → CSS-Block →
Schlangenbereich-Patch → Onboarding-Component implementiert. Das ist
eine bewusste Abweichung vom Standard "Claude Code → /simplify →
Codex/Kimi Review", die im vorigen Cron-Lauf dokumentiert wurde.

Diese Finalisierung (Release-Doku + Re-Verifikation) folgt dem
**Half-finished-slice-completion-bias Pattern** aus
`schlangentanz-workflow`: lieber FERTIGSTELLEN als verwerfen und neu
starten. Cost of finishing: 1 RED-Run + 1 Typecheck + 1 Lint + 1 Build
+ 1 Release-Doku = ~6 Tool-Calls. Cost of restarting: 30+ Tool-Calls.
