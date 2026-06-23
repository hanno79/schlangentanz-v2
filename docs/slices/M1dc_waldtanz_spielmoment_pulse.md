# M1dc — Waldtanz-Spielmoment-Pulse

> **Status:** Geplant. Startet nach M1db-Release (Commit `bfa3bf7` auf `origin/main`).
> **Typ:** Mittlerer Vertical (UI/UX, Spiel-Feel), kein Engine-Touchpoint.
> **Vorgänger:** M1db (Spielmoment-Vorbereitung: Handkarten-Lift + Magiekreis-Pulse + Wald-Atmosphäre).
> **Nachfolger:** offen.

## Befund (warum dieser Slice nötig ist)

User-Feedback 22.06.2026: "Weg vom Button-geklickt-/Debuglisten-Gefühl hin zu echtem
Spielerlebnis." M1db hat das Spiel **vorbereitet** — Handkarten heben sich, Magiekreise
pulsen, der Wald hat Atmosphäre. Der eigentliche **Moment des Spielens** fehlt aber
noch: Wenn die Spielerin eine Karte ausspielt, soll das Brett kurz sichtbar
reagieren — die gewählte Schlange oder der Startkreis soll einen forest-grünen
Licht-Puls bekommen, der nach ~1,2 s abklingt. Aktuell verschwindet die Aktion
nur in der Brettschritt-Stempel-Zeile.

Aktueller Stand:
- Aktion → Engine ändert Zustand
- Brettschritt-Stempel zeigt neuen Stempel
- `Waldtanz-Kartenpop` zeigt Sternchen-Pop im Arenastein
- `data-letzte-aktion`-Pulse auf dem Schlangenbereich fehlt komplett (M1db-Plan
  bewusst zurückgestellt, weil der Slice sonst zu zwei Effekten gleichzeitig
  geführt hätte — siehe `docs/slices/M1db_waldtanz_spielmoment.md` Zeile 51-56).

User-Mapping: "Es fühlt sich an wie: Karte klicken → Aktion geht durch →
Brettschritt aktualisiert sich. Das ist die 'Click-Simulator'-Wahrnehmung." —
genau diese Lücke schließt M1dc.

## Slice-Scope

### Rein

1. **Ziel-Tracking im App** (`src/App.tsx`):
   - Neuer State `letzteAktionZiel: { typ: 'startzone' | 'schlange'; id?: string } | null`.
   - In `wechsleZustand` und `handleKiZugVorspulen` wird `letzteAktionZiel`
     aus der ausgeführten Aktion abgeleitet:
     - `NeueSchlangeStarten` → `{ typ: 'startzone' }`
     - `KarteAnlegen` → `{ typ: 'schlange', id: aktion.schlangenId }`
     - `SchlangenblockadeSpielen` → `{ typ: 'schlange', id: aktion.zielSchlangenId }`
     - `FarbenschutzSpielen` → `{ typ: 'schlange', id: aktion.zielSchlangenId }`
     - `FarbenfusionSpielen` → `{ typ: 'schlange', id: aktion.zielSchlangenId }`
     - `SchlangenfrassSpielen` → `{ typ: 'schlange', id: aktion.ziele[0].schlangenId }`
     - `SchlangenhaeutungSpielen` → `{ typ: 'schlange', id: aktion.schlangenId }`
     - `FarbendiebSpielen` → `{ typ: 'schlange', id: aktion.zielSchlangenId }`
     - alle übrigen Aktionen (PflichtAbwurf, SonderkarteSpielen ohne Brettziel,
       VerdopplerSpielen etc.) → `null`.
   - Auto-Clear nach 1500 ms via `setTimeout` (in einem `useEffect`), damit der
     Puls sichtbar kommt und wieder verschwindet, ohne permanente State-Ballast.

2. **Prop-Drill**:
   - `letzteAktionZiel` wird von `App` an `Schlangenbereich` durchgereicht
     (keine neuen Hooks, ein einziges zusätzliches Prop).
   - `Schlangenbereich` leitet `letzteAktionZiel` an `SchlangenStartzone` weiter
     (ein zusätzliches Prop, Default `null`).
   - `SchlangenStartzone` und die eigene-Schlangen-`<li>`s setzen
     `data-letzte-aktion-ziel="true"` (Startzone) bzw. `data-letzte-aktion-ziel="schlange-<id>"`.

3. **CSS-Spielmoment-Puls** (`src/App.css`):
   - Neues Token im `:root`:
     ```css
     --spielmoment-pulse-dauer: 1.2s;
     --spielmoment-pulse-glow: 0 0 0 4px var(--st-color-primary-fixed), 0 0 24px 6px var(--st-color-primary);
     --spielmoment-pulse-scale: 1.04;
     ```
   - Neue Regel (für Startzone + eigene Schlangen + Gegner-Schlangen):
     ```css
     .schlangen-startzone[data-letzte-aktion-ziel="true"],
     li.schlangekarte[data-letzte-aktion-ziel^="schlange-"] {
       animation: waldtanz-spielmoment-pulse var(--spielmoment-pulse-dauer) ease-out 1;
     }
     @keyframes waldtanz-spielmoment-pulse {
       0%   { transform: scale(1); box-shadow: var(--st-shadow-hard-sm); }
       35%  { transform: scale(var(--spielmoment-pulse-scale));
              box-shadow: var(--spielmoment-pulse-glow), var(--st-shadow-hard-sm); }
       100% { transform: scale(1); box-shadow: var(--st-shadow-hard-sm); }
     }
     @media (prefers-reduced-motion: reduce) {
       .schlangen-startzone[data-letzte-aktion-ziel="true"],
       li.schlangekarte[data-letzte-aktion-ziel^="schlange-"] {
         animation: none;
         outline: 4px solid var(--st-color-primary-fixed);
         outline-offset: 2px;
       }
     }
     ```

4. **CSS-Smoke-Vertrag**:
   - Token im `:root` deklariert.
   - Pulse-Keyframe existiert.
   - Reduced-Motion-Override existiert.
   - Reducer prüft `prefers-reduced-motion: reduce` override.

### Bewusst nicht implementiert (User-Scope-Eingrenzung)
- **Kartenflug-Animation** (Handkarte fliegt zum Brettziel): zu groß für diesen
  Slice. Gehört in einen späteren M-Slice (Kartenflug / Drag-Visualisierung).
- **SonderkarteSpielen-Brettziel-Puls auf Spieler-Plakette**: würde die
  Spielerplakette mit ins Puls-Spiel einbeziehen, das verwässert die klare
  Schlange/Startzone-Botschaft. Bewusst ausgelassen.
- **`data-letzte-aktion` auf Brettschritt-Stempel**: Stempel pulst bereits über
  `brettschritt-stempel--aktuell`-Klasse; kein zusätzliches Puls-Attribut nötig.

### Raus (explizit)
- **Keine Engine-Änderung.** `engine/`, `legaleAktionen`, `anwendeAktion` bleiben
  unangetastet.
- **Keine neuen Spielregeln** in `docs/GAME_SPEC.md`.
- **Keine neuen Brettobjekte** (Karten, Ziele, Brettschritte).
- **Keine Layout-Refactor** — bestehendes Grid bleibt unverändert.
- **Keine A11y-IDs-Region-Härtung** (User-Hinweis: keine Schleifen ohne Spielfortschritt).
- **Keine Touch/Mobile-Optimierung** — Desktop-only.
- **Keine neuen Komponenten** — Erweiterung bestehender Dateien.

## Akzeptanzkriterien (Playability-Gate-relevant)

- [ ] `/game` 1280×900: Nach Klick auf `Neue Schlange starten` zeigt der
      Startkreis sichtbar `data-letzte-aktion-ziel="true"` und den Puls-Stil
      (CSS-Token + Keyframe).
- [ ] `/game` 1280×900: Nach Klick auf `Karte anlegen` auf einer eigenen
      Schlange zeigt das entsprechende `<li class="schlangekarte">` den
      Puls-Stil.
- [ ] `/game` 1280×900: Nach 1,5 s ist das Attribut wieder weg (Auto-Clear).
- [ ] `prefers-reduced-motion: reduce` deaktiviert die Animation und ersetzt sie
      durch einen statischen Outline-Ring.
- [ ] `npm test -- --run src/App.m1dc_spielmoment_pulse.test.tsx` grün.
- [ ] `npm test -- --run` (full) grün.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines` grün.
- [ ] `npm run smoke:production` grün (canonical chain, neuer M1dc-Smoke
      verdrahtet).
- [ ] Vercel Production-Deploy `READY`, Live-Smoke auf `/game` ohne console/page errors.

## Workflow

1. **RED-Test** `src/App.m1dc_spielmoment_pulse.test.tsx`:
   - DOM-Landmark-Assert für `data-letzte-aktion-ziel="true"` auf Startzone nach
     `NeueSchlangeStarten`-Aktion.
   - DOM-Landmark-Assert für `data-letzte-aktion-ziel="schlange-<id>"` auf der
     passenden Schlange nach `KarteAnlegen`.
   - CSS-Source-Asserts für die drei neuen Token im `:root`.
   - CSS-Source-Assert für `@keyframes waldtanz-spielmoment-pulse`.
   - CSS-Source-Assert für `prefers-reduced-motion: reduce`-Override.
   - `package.json`-Smoke-Wiring: `m1dc_spielmoment_pulse_smoke.mjs` ist in
     `smoke:production` enthalten.
   - Smoke-Script-Existenz-Test.

2. **Implementation**:
   - `src/App.tsx`: neue State `letzteAktionZiel`, neue Hilfsfunktion
     `extrahiereAktionZiel(aktion)`, neuer `useEffect` mit `setTimeout(..., 1500)`
     für Auto-Clear. Update von `wechsleZustand` und `handleKiZugVorspulen`.
   - `src/components/Schlangenbereich.tsx`: Prop `letzteAktionZiel` entgegennehmen,
     an `SchlangenStartzone` weiterreichen, plus eigenes `data-letzte-aktion-ziel`
     auf `<li class="schlangekarte">` (eigene + Gegner-Schlangen).
   - `src/components/SchlangenStartzone.tsx`: Prop `letzteAktionZiel` entgegennehmen,
     `data-letzte-aktion-ziel="true"` auf das Startzone-Element setzen, wenn
     `typ === 'startzone'`.
   - `src/App.css`: 3 neue Token, 1 neue Animations-Regel, 1 Keyframe-Block,
     1 Reduced-Motion-Override-Block.
   - `package.json`: `m1dc_spielmoment_pulse_smoke.mjs` in `smoke:production`
     einreihen.
   - `scripts/m1dc_spielmoment_pulse_smoke.mjs`: neuer Browser-Smoke.

3. **Manuelle Implementierung** statt Claude Code (Claude OAuth 401, siehe
   `claude-code-unavailable-fallback.md`); `/simplify`-Vorprüfung als manuelle
   Diff-/Cascade-/Smoke-Prüfung.

4. **Kimi Code CLI Review** (Codex OAuth limit bis 25.06.2026 19:07 UTC; siehe
   `codex-unavailable-kimi-fallback.md`).

5. **Full Gates** + **Vercel Deploy** + **Live-Smoke**.

## Test-Plan (RED → GREEN)

### RED
- `App.m1dc_spielmoment_pulse.test.tsx` mit ~8 Tests:
  1. Initial rendert ohne `letzteAktionZiel` keine `data-letzte-aktion-ziel`-Attribute.
  2. Nach Klick auf eine spielbare Handkarte + Startkreis-Klick ist
     `data-letzte-aktion-ziel="true"` auf der Startzone.
  3. Nach Klick auf `KarteAnlegen` ist auf der passenden Schlange
     `data-letzte-aktion-ziel="schlange-<id>"`.
  4. PflichtAbwurf setzt **kein** `data-letzte-aktion-ziel` (kein Spielmoment).
  5. CSS-Source: 3 neue Token im `:root`.
  6. CSS-Source: `@keyframes waldtanz-spielmoment-pulse` existiert.
  7. CSS-Source: `@media (prefers-reduced-motion: reduce)`-Override existiert.
  8. `package.json` enthält den M1dc-Smoke in `smoke:production`.
  9. `App.m1dc_spielmoment_pulse_smoke_wiring.test.ts`: smoke-Skript existiert
     und referenziert die richtige Region.

### GREEN
- Alle RED-Tests grün.
- Keine bestehenden Tests werden rot (insbesondere keine M1bw–M1db-Regressionen).
- Browser-Smoke auf Production-Alias: Karten-Spielmoment-Puls sichtbar (computed
  animation/animation-name/timing nicht zwingend, aber `data-letzte-aktion-ziel`
  muss nach Klick + kurzer Wartezeit noch im DOM sein), keine console/page errors.

## Disclosure

Da Claude Code durch `401 Invalid authentication credentials` (expired OAuth
token ohne refresh) blockiert ist, wird die Implementation manuell durchgeführt
und durch Kimi Code CLI reviewt (Codex OAuth `usage_limit` bis 25.06.2026
19:07 UTC). Pattern aus `claude-code-unavailable-fallback.md` und
`codex-unavailable-kimi-fallback.md`. Der RED-Test ist eng und die Änderung
mechanisch klein (3 Komponenten + 1 CSS-Block + 1 Smoke).