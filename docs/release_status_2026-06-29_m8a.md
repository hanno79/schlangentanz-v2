# M8a Release-Status — Sonderkarten-Board-Aktions-Hinweis

**Datum:** 30.06.2026
**Slice:** M8a — Sichtbares "Zuletzt ausgeführt"-Feedback auf /game
**Klasse:** Affordance-Mid-Slice / Board-Feedback-Pattern
**Status:** ✅ RELEASED (commit `ccb7bf6`, production deploy 30.06.2026 02:10 UTC)

## Zusammenfassung

Auf /game erscheint nach jeder Sonderkarten-Aktion (oder Schlange-Start) eine
kleine lime-Stitch-Pille mit dem Text "Zuletzt ausgeführt: …" am Brettrand
(neben der Questpille). Vorher war dieses Feedback nur in der
WaldtanzAktiverSpielerDebug-Sektion sichtbar, die auf der Lobby-Route
(!istGameRoute) gerendert wird — auf /game blieb der Spieler ohne sichtbare
Rückmeldung, ob sein Klick tatsächlich etwas ausgelöst hat.

## Warum-mittlerer-Vertical (NICHT Mikro, NICHT Big-Bang)

- **Nicht Mikro:** Eigene Komponente + 7 RED-Tests + Live-Smoke +
  Smoke-Wiring-Migration, löst die größte sichtbare Lücke der
  "click simulator"-Kritik (Feedback-Schleife nach Klick).
- **Nicht Big-Bang:** 1 neue Komponente, 1 JSX-Insertion, 1 CSS-Block.
  Keine Engine-Änderung, keine State-Machine, keine Layout-Refactor.
- **Sichtbarer Spielwert:** Direkter Schritt weg vom Click-Simulator hin zu
  echtem Spielerlebnis. Der Spieler SIEHT, dass die Aktion passiert ist
  (Pille pulst 0.4s lime-grün, dann statisch sichtbar mit Eyebrow +
  Aktions-Beschreibung).

## Rein

1. **Neue Komponente `WaldtanzLetzteAktionHinweis.tsx`** (Stitch-Hero-Pille):
   - `role="status"` + `aria-live="polite"` für A11y
   - 3px forest-border, lime-container (secondary-container), 4px hard-shadow
   - 0.4s Pulse-Animation + reduced-motion-Override
   - Eyebrow "Zuletzt ausgeführt" + Aktions-Beschreibung
2. **App.tsx-Integration:** neben `<WaldtanzBrettrandQuestpille>`, im
   `{istGameRoute && <WaldtanzLetzteAktionHinweis letzteAktion={letzteAktion} />}`
   -Block. NICHT auf / sichtbar (route-scoped + Komponente gibt null zurück
   wenn letzteAktion null).
3. **CSS (in `src/App.css`):** `.waldtanz-letzte-aktion-hinweis` + `__eyebrow` +
   `__text` + `@keyframes --pulse` + reduced-motion-Block + Lobby-Hide-Rule.
4. **RED-Tests in `src/App.m8a_board_aktions_hinweis.test.tsx` (7 Tests):**
   - RED-1: Komponente existiert
   - RED-2: rendert Text als `<p>`
   - RED-3: aria-live="polite"
   - RED-4: role="status"
   - RED-5: App.tsx-Wiring in istGameRoute-Block
   - M8a:6: Komponente NICHT auf / (Lobby) gerendert
   - M8a:7: package.json smoke:production enthält M8a-Skript
5. **Live-Smoke `scripts/m8a_aktions_hinweis_smoke.mjs`:**
   - Vor Aktion: Pille unsichtbar
   - Nach Startfaehrte-Klick: Pille sichtbar (≥180x40 px, 3px Border, Box-Shadow)
   - aria-live="polite" + role="status"
   - Eyebrow "Zuletzt ausgeführt" + Text
   - Auf /: Pille unsichtbar
   - Viewports 1280x900 + 1100x800
6. **Smoke-Wiring:** `package.json` `smoke:production`-Kette + M9.5-W4
   -Migration (Last-In-Chain) + M9.5-W5-Migration (Kette endet mit m8a).

## Raus

- **Keine Engine-Änderung** (letzteAktion-State existierte bereits)
- **Keine Sonderkarten-Logik-Änderung** in `Schlangenbereich.tsx`
- **Keine Multi-Target-State-Machine** (M8b-Folge)
- **Keine Aktionendock-Änderung** (M8b-Folge)
- **Kein Auto-Fade nach 3.5s** — Pille bleibt sichtbar, bis eine neue
  Aktion sie ersetzt (letzteAktion-State-Update). Begründung: einfacher,
  sichtbarer, und der Spieler kann die letzte Aktion jederzeit lesen.

## Geometrie / Cap-Arithmetik

Im 1280x900 Erstbild:
- Pille: 345 x 71 px (sichtbar, kompakt)
- Position: x=222, y=416 (im Arenastein unter der Questpille)
- Border: 3px solid var(--st-color-border-strong) (forest-green)
- Border-Radius: 16.2px (0.9rem) → klassische Stitch-Pillen-Form
- Box-Shadow: 0 4px 0 0 var(--st-color-border-strong) (hard-shadow)
- Animation: scale 0.92 → 1.04 → 1 (Pulse, 0.4s ease-out)

Im 1100x800 Erstbild:
- Pille: 327 x 53 px (etwas kleiner durch Auto-Layout)
- Position: x=213, y=403 (gleiche Brettrand-Region)
- Beide Viewports: alle 3px-Border + hard-shadow + role/aria-live OK

## Gates

- ✅ `npm run typecheck` — grün
- ✅ `npm run lint` — grün
- ✅ `npm run build` — grün (105 modules, 237.9 kB CSS, 424.8 kB JS)
- ✅ `npx vitest run src/App.m8a_board_aktions_hinweis.test.tsx` — 7/7 grün
- ✅ `npx vitest run src/App.m95_smoke_wiring.test.ts` — 5/5 grün
- ✅ `npm test -- --run` — NET-POSITIVE (37 fails = HEAD-Baseline, identisch
  mit und ohne M8a-Diff)
- ✅ `node scripts/m8a_aktions_hinweis_smoke.mjs --self-test` — OK
- ✅ Live-Smoke gegen `https://schlangentanz-v2.vercel.app` — grün
  (1280x900 + 1100x800, alle Acceptance-Checks bestanden)
- ✅ Vision-Analyse der Production-Screenshot bestätigt sichtbare
  Stitch-Pille mit Text "ZULETZT AUSGEFÜHRT — Neue Schlange starten
  mit Karte gelb-08"

## Bekannte Probleme / Trade-offs

- **Kein Auto-Fade:** Pille bleibt bis zur nächsten Aktion sichtbar. Begründung:
  Spieler sollen die letzte Aktion jederzeit nachlesen können. Wenn User-
  Feedback "zu dauerhaft" kommt, kann M8a.1 ein optionales `autoFadeMs`-Prop
  + setTimeout-Fade ergänzen.
- **Live-Smoke verwendet "Startfaehrte-Klick" als minimalen Aktion-Trigger:**
  Multi-Schritt-Pfad (Startfaehrte → Handkarte → Anlegeplatz) braucht den
  M2d-Fixture-Helper für reproduzierbare Live-Smoke-Reproduktion (siehe
  M1dt-Dispens in Schlangentanz-Workflow). Die Startfaehrte allein triggert
  eine Engine-Aktion, die `letzteAktion` setzt, was die contractmäßige
  Schnittstelle der M8a-Komponente ist.

## Nächste Lücke (M8b-Folge-Slice)

**M8b: Schlangenfrass Zwei-Gegner-Zielauswahl** (R181 RED-Test):
- State-Machine für 2-Target-Selection (Ziel 1 wählen → Ziel 2 wählen → Aktion)
- Buttons "Schlangenfrass-Ziel 1 wählen" / "Schlangenfrass-Ziel 2 wählen"
- Erweitert M8a-Pattern (Feedback-Loop läuft weiter)
- Geschätzter Tool-Aufwand: ~30-40 Tool-Calls

Plus: **M8c: Farbendieb Platz-Auswahl** (R183 RED-Test, Position 2):
- 2-Klick-Bestätigungsflow
- M8a-Feedback-Pille zeigt den Erfolg an

## Commits

- `ccb7bf6` M8a: Waldtanz-Letzte-Aktion-Hinweis am Brettrand
  (8 files, 488 insertions, 6 deletions)

## Live-Smoke-Beleg

```
$ SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m8a_aktions_hinweis_smoke.mjs
--- M8a Aktions-Hinweis @ 1280x900 ---
  Vor Aktion: Pille unsichtbar ✓ (letzteAktion === null)
  Nach Aktion: Pille sichtbar ✓ 345x71 px @ (222,416)
  Border: 3px, Radius: 16.2px
  Eyebrow: "Zuletzt ausgeführt"
  Auf / (Lobby): Pille unsichtbar ✓
--- M8a Aktions-Hinweis @ 1100x800 ---
  Vor Aktion: Pille unsichtbar ✓ (letzteAktion === null)
  Nach Aktion: Pille sichtbar ✓ 327x53 px @ (213,403)
  Border: 3px, Radius: 16.2px
  Eyebrow: "Zuletzt ausgeführt"
  Auf / (Lobby): Pille unsichtbar ✓
```

## Deploy

- Vercel Production: https://schlangentanz-v2.vercel.app
- Commit `ccb7bf6` deployed via `vercel deploy --prod --yes`
- Alias: `https://schlangentanz-v2.vercel.app` (kanonisch, via Auto-Alias)
- HTTP-Status / und /game: 200 OK
- Production-Smoke gegen `https://schlangentanz-v2.vercel.app` grün

## Code-Review

**REVIEWER=NONE** (Codex CLI + Kimi Code CLI beide ratelimited per Watchdog
vom 30.06.2026 01:54 UTC, siehe
`/tmp/reviewer_status.json`):
- Codex: `NOT_FUNCTIONAL` ("wartet auf stdin / usage limit / trusted-dir-Block")
- Kimi: `RATE_LIMITED` ("usage limit billing cycle, 403 permission_error")

Slice wurde lokal verifiziert (typecheck, lint, build, 7/7 RED-Tests,
5/5 Smoke-Wiring-Tests, Live-Smoke 2 Viewports) und nach
Schlangentanz-Workflow Pitfall #12 (User-Time-Preference: Hanno akzeptiert
review-blockiert für sichtbare Spielwert-Lieferungen) trotzdem
committed/pushed/deployed.

Re-Review im nächsten Cron-Lauf, sobald ein Reviewer verfügbar ist.
Disclosure: keine "Code-Review bestanden"-Behauptung in dieser Release-Doku.
