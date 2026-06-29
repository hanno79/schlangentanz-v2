# M8a: Sonderkarten-Board-Aktions-Hinweis (M8-Teil-Slice)

**Datum:** 29.06.2026
**Slice:** M8a — Board-Aktions-Feedback auf /game (Teil-Slice von M8)
**Klasse:** Affordance-Mid-Slice / Board-Feedback-Pattern
**Status:** RED-Phase (RED-Tests bereits im Repo als M8-RED)

## Hintergrund

Der M8-Slice-Plan (docs/slice_plan_m8_boardnah_sonderkarten_zielauswahl.md) ist
groß (60-80 Tool-Calls, 4 Sonderkarten, Multi-Target-State-Machine). In
diesem Cron-Lauf ist die M8-Hauptarbeit jedoch zu groß. Statt dessen:

**M8a** = der sichtbarste Spielwert-Schritt aus M8: das **"Zuletzt
ausgeführt"-Feedback** auf /game. Aktuell ist der Text im
WaldtanzAktiverSpielerDebug eingesperrt, der nur auf der Lobby-Route
(!istGameRoute) gerendert wird. Auf /game sieht der Spieler nach dem Klick
auf eine Sonderkarte KEIN Feedback, dass die Aktion ausgeführt wurde.

**Effekt:** Sobald M8a grün ist, finden die R183-, R180- und R182-Tests
das Feedback und die "klick → Aktion läuft"-Schleife fühlt sich für den
Spieler sichtbar an. Der M8a-Slice ist klein, sichtbar, und macht den Weg
frei für die volle M8-Multi-Target-Erweiterung im Folge-Cron-Lauf.

## Warum M8a (NICHT Mikro, NICHT Big-Bang)

- **Nicht Mikro:** Eigener Komponent + RED-Tests + Live-Smoke-Wiring,
  adressiert die größte M8-Lücke (Feedback-Schleife).
- **Nicht Big-Bang:** 1 neue Komponente (WaldtanzLetzteAktionHinweis),
  keine Engine-Änderung, keine Multi-Target-State-Machine, keine
  Aktionendock-Logik. Reine Feedback-UI.
- **Sichtbarer Spielwert:** Der Spieler sieht nach jedem Sonderkarten-Klick
  "Zuletzt ausgeführt: Farbendieb mit Karte ... auf Schlange ... an
  Position 2 spielen" als kleine Stitch-Hero-Pille am Brettrand. Das ist
  genau das, was die "click simulator"-Kritik adressiert: Feedback.

## Rein

1. **Neue Komponente `WaldtanzLetzteAktionHinweis.tsx`** (analog
   M2v Brettrand-Zugknopf, M5a Sieger-Party):
   - Kleine lime-Stitch-Pille (3px forest-border, hard-shadow-sm)
   - Zeigt `letzteAktion: string | null`
   - `aria-live="polite"` für Screen-Reader-Feedback
   - Auto-Fade nach 3.5s via setTimeout-Pattern (analog M1dq Pulse-Reset)

2. **App.tsx-Integration:**
   - Neue Komponente wird auf /game gerendert (NICHT auf /)
   - Sitzt am Brettrand, nicht in der Aktionendock (die ist versteckt)
   - Position: im Arenastein, neben dem Brettrand-End-Turn-Knopf (M2v)

3. **RED-Tests (5 RED-Tests in `src/App.m8a_board_aktions_hinweis.test.tsx`):**
   - RED-1: `WaldtanzLetzteAktionHinweis`-Komponente existiert
   - RED-2: rendert `letzteAktion` Text-Inhalt als `<p>`
   - RED-3: hat `aria-live="polite"` Attribut
   - RED-4: hat `role="status"` für A11y
   - RED-5: ist in App.tsx auf /game eingebunden, auf / NICHT

4. **Live-Smoke `scripts/m8a_aktions_hinweis_smoke.mjs`:**
   - Production-Probe: klickt Sonderkarte → prüft Brettrand zeigt Hinweis
   - 2-3 Acceptance-Checks: Hinweis sichtbar, aria-live, auto-Fade

5. **Smoke-Wiring:** `package.json` `smoke:production`-Kette +
   RED-Test für wiring (M5a-Pattern)

## Raus

- **Keine Engine-Änderung.** keine Legal-Action-, Scoring-Logik berührt
- **Kein Aktionendock-Refactor** (das wird M8b im Folge-Cron)
- **Keine Multi-Target-State-Machine** (das wird M8b im Folge-Cron)
- **Keine Sonderkarten-Logik-Änderung** in `Schlangenbereich.tsx`

## Pflicht-RED-Tests (5 RED-Tests vor GREEN)

1. `WaldtanzLetzteAktionHinweis` Komponente existiert in `src/components/`
2. Komponente rendert `letzteAktion: string` als Paragraph-Text
3. Komponente hat `aria-live="polite"`
4. Komponente hat `role="status"`
5. App.tsx rendert Komponente auf `/game` (nicht auf `/`)

## Pflicht-Code-Review

- **Kimi Code CLI** als Standard-Reviewer (Codex OAuth usage-limited)
- Falls Kimi ratelimited: REVIEWER=NONE, dokumentiere in Release-Status

## Tool-Budget-Schätzung

| Phase | Tool-Calls |
|---|---|
| RED-Tests (5 RED) | 4-6 |
| Komponenten-Datei schreiben | 1-2 |
| App.tsx-Integration | 1-2 |
| CSS-Patch (1-2 Regeln) | 1-2 |
| Targeted-Test-Run | 1 |
| Gates (typecheck, lint, build) | 3 |
| Live-Smoke schreiben | 2-3 |
| Smoke-Wiring | 1-2 |
| Commit + Push + Deploy | 3-4 |
| Live-Smoke gegen Production | 1 |
| **Gesamt** | **~20-25 Tool-Calls** |

## Naechste Luecke (M8b-Folge-Slice)

**M8b: Schlangenfrass Zwei-Gegner-Zielauswahl** (die andere M8-Hälfte):
- State-Machine für 2-Target-Auswahl
- Buttons: "Schlangenfrass-Ziel 1 wählen" + "auf Karten X und Y ausführen"
- Fix für R181 Zwei-Ziele RED-Test
- ~30-40 Tool-Calls

Plus: **M8c: Farbendieb Platz-Auswahl** (R183 Platz 2 - schon
durch M8a-Fix abgedeckt, der "Zuletzt ausgeführt"-Text macht den
Platz-Klick sichtbar).
