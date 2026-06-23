# M1db — Waldtanz-Spielmoment (Play Moment Feedback)

> **Status:** Geplant. Startet nach M1da-Release (Commit `3e7fcd8` auf `origin/main`).
> **Typ:** Mittlerer Vertical (UI/UX, Spiel-Feel), kein Engine-Touchpoint.
> **Vorgänger:** M1cy (Gegnerplakette), M1d0 (Layout-Konsolidierung), M1da (Hand-Bottom-Row).
> **Nachfolger:** offen.

## Befund (warum dieser Slice nötig ist)

User-Feedback 22.06.2026: "Weg vom Button-geklickt-/Debuglisten-Gefühl hin zu echtem
Spielerlebnis." Der aktuelle `/game`-Screen hat auf Produktion:

| Phase | Aktuelles Verhalten | Vermisst |
|---|---|---|
| Handkarte auswählen | `aria-pressed=true`, Border-Highlight | Karten hebt sichtbar aus dem Fächer, leuchtet im Stitch-Stil |
| Brettziel hovern | Border-Highlight | Magiekreis pulsiert sichtbar, lädt zum Ablegen ein |
| Aktion ausführen | `letzteAktion`-Text + Brettschritt-Stempel | Karte "landet" sichtbar auf dem Brett, kurzer Lande-Effekt |
| KI übernimmt | `kiZugProtokoll` wächst | KI-Tableau zeigt sichtbar "denkt nach"-Indikator |

Die Engine macht alles richtig, aber der **Moment des Spielens** fehlt im UI. Es
fühlt sich an wie: Karte klicken → Aktion geht durch → Brettschritt aktualisiert sich.
Das ist die "Click-Simulator"-Wahrnehmung.

## Slice-Scope

### Rein

1. **Handkarten-Lift beim Auswählen**: Die ausgewählte Handkarte hebt sich sichtbar
   aus dem Fächer (transform: translateY + scale), bekommt einen glow-Ring und einen
   Stitch-Schatten. Nicht-ausgewählte Karten dimmen leicht (opacity 0.85).
   - Implementiert in `src/components/HandkartenPanel.tsx` (bestehende
     `tiefenfaecherStyle`-Funktion erweitern) + `src/App.css`.
   - Token-basiert: `--handkarte-lift-y`, `--handkarte-selected-glow`.
2. **Brettziel-Puls beim Hovern**: Magic-Circle-Ziele (Startkreis, Schlangenpfade,
   Sonderzauber) bekommen einen sichtbaren Pulse, wenn eine Handkarte ausgewählt
   ist UND der Kreis eine gültige Aktion für die ausgewählte Karte bietet.
   - Implementiert via `:has()`-Selektor in `src/App.css`:
     `.magiekreis:has([aria-label*="..."])` oder über `data-hat-aktion="true"`.
   - Echte Hover braucht JS-State — daher Pulse nur auf Karten mit legalen
     Aktionen, gesteuert durch `data-ist-ziel-aktiv="true"`.
3. **Forest-Atmosphäre rund um die Lichtung**: Pseudo-Elemente `::before` und
   `::after` auf der zentralen Spielbahn, die sonnige Lichtung subtil mit
   Laub-/Sonnen-Punkten dekorieren — wie ein leichter Waldboden-Look.
   - Rein dekorativ (`pointer-events: none`, `content: ""`).
   - **Hinweis:** Pseudo-Elemente können kein eigenes `aria-hidden`-Attribut
     tragen. Da `content: ""` gesetzt ist, sind sie für Screenreader ohnehin
     nicht relevant; die Klick-Sicherheit wird über `pointer-events: none`
     garantiert.
   - Inspirations-Quelle: Google-Stitch-Referenz `der_waldtanz_game_board`.

### Bewusst nicht implementiert (User-Scope-Eingrenzung)
- **Aktions-Effekt auf der Lichtung** (`data-letzte-aktion`-Pulse auf dem
  Schlangenbereich): wäre der nächste sinnvolle M1dc-Slice, wurde aber
  aus dem aktuellen M1db-Scope bewusst herausgenommen, damit dieser Slice
  nicht zwei visuelle Effekte gleichzeitig einführt. Das `data-letzte-aktion`-
  Attribut wird in M1db nicht gesetzt und vom CSS nicht referenziert.

### Raus (explizit)

- **Keine Engine-Änderung.** `engine/`, `legaleAktionen`, `anwendeAktion` bleiben
  unangetastet.
- **Keine neuen Spielregeln** in `docs/GAME_SPEC.md`.
- **Keine neuen Spielobjekte** (Karten, Ziele, Brettschritte).
- **Keine Layout-Refactor** — das Grid aus M1d0 bleibt.
- **Keine A11y-IDs-Region-Härtung** (User-Hinweis: keine Schleifen ohne Spielfortschritt).
- **Keine Aktionen-Enumeration-Änderung** — bestehende Aktionen werden nur
  visuell hervorgehoben.
- **Keine Touch/Mobile-Optimierung** — Desktop-only.

## Akzeptanzkriterien (Playability-Gate-relevant)

- [ ] `/game` 1280×900: Auswahl einer Handkarte löst sichtbaren Lift + Glow aus
      (RED-Test über `data-ist-ausgewaehlt="true"` + CSS-Source-Asserts für die
      Token und die `:has()`-Selektoren).
- [ ] `/game` 1280×900: Mindestens ein Magiekreis hat `data-ist-ziel-aktiv="true"`,
      sobald eine spielbare Handkarte ausgewählt ist.
- [ ] `/game` 1280×900: Pseudo-Elemente auf der Spielbahn sind `pointer-events: none`
     (Klick-Schutz für Handkarten + Brettziele; Pseudo-Elemente haben per
     CSS-Spec kein aria-Attribut, content="" ist Screenreader-neutral).
- [ ] `/game` 1100×800: keine Überlappung oder Layout-Bruch.
- [ ] `npm test -- --run src/App.m1db_waldtanz_spielmoment.test.tsx` grün.
- [ ] `npm test -- --run` (full) grün.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build`, `npm run check:test-lines` grün.
- [ ] `npm run smoke:production` grün (canonical chain).
- [ ] Vercel Production-Deploy `READY`, Live-Smoke auf `/game` ohne console/page errors.
- [ ] Brettschritt (Handkarte spielen → Brettschritt-Stempel → End Turn → KI) weiterhin durchspielbar.

## Workflow

1. **RED-Test** `src/App.m1db_waldtanz_spielmoment.test.tsx`:
   - DOM-Landmark-Asserts für `data-ist-ausgewaehlt` und `data-ist-ziel-aktiv`.
   - CSS-Source-Asserts für die neuen Token (`--handkarte-lift-y`,
     `--handkarte-selected-glow`) und die `:has()`-basierten Pulse-Regeln.
   - Assert: Pseudo-Elemente auf `.waldtanz-lichtungsbrett` haben `pointer-events: none`.
   - Assert: smoke:production enthält den neuen M1db-Smoke.
2. **Implementation**:
   - `src/components/HandkartenPanel.tsx`: `tiefenfaecherStyle` gibt
     `--handkarte-ist-ausgewaehlt: 1` zurück, wenn die Karte ausgewählt ist.
     UL-Element bekommt `data-hat-ausgewaehlt="true"` wenn irgendeine Karte
     selektiert ist.
   - `src/components/WaldtanzMagiekreise.tsx`: Kreise mit gültigen Aktionen
     bekommen `data-ist-ziel-aktiv="true"`, Kreise ohne `data-ist-ziel-aktiv="false"`.
   - `src/App.css`: Neue Token im `:root`, neue Regeln für Lift/Glow/Pulse,
     Pseudo-Element-Regeln für die Spielbahn.
3. **Manuelle Implementierung** statt Claude Code (siehe Disclosure unten).
4. **`/simplify` als manuelle Diff-Prüfung** (Claude Code 401, Fallback aktiv).
5. **Kimi Code CLI Review** (Codex OAuth limit bis 25.06.2026 19:07 UTC).
6. **Full Gates** + **Vercel Deploy** + **Live-Smoke**.

## Test-Plan (RED → GREEN)

### RED
- `App.m1db_waldtanz_spielmoment.test.tsx` mit 5-7 Tests:
  1. Token-Definitionen im `:root` von `src/App.css`.
  2. UL bekommt `data-hat-ausgewaehlt` beim Auswählen einer Handkarte.
  3. Magiekreise bekommen `data-ist-ziel-aktiv` korrekt (true/false).
  4. CSS-Source: `:has()`-Selektor mit `--handkarte-selected-glow`.
  5. CSS-Source: Pseudo-Elemente `pointer-events: none`.
  6. `package.json` smoke:production enthält neuen M1db-Smoke.
  7. `App.m1db_waldtanz_spielmoment_smoke_wiring.test.ts`: smoke-Skript existiert
     und referenziert die richtige Region.

### GREEN
- Alle RED-Tests grün.
- Keine bestehenden Tests werden rot.
- Browser-Smoke auf Production-Alias: Karten-Lift + Magiekreis-Pulse sichtbar,
  keine console/page errors.

## Disclosure

Da Claude Code durch `401 Invalid authentication credentials` (expired OAuth
token ohne refresh) blockiert ist, wird die Implementation manuell durchgeführt
und durch Kimi Code CLI reviewt (Codex OAuth `usage_limit` bis 25.06.2026
19:07 UTC). Pattern aus `claude-code-unavailable-fallback.md` und
`codex-unavailable-kimi-fallback.md`. Der RED-Test ist eng und die Änderung
mechanisch klein (3-4 Dateien, ~200-400 Zeilen CSS + Helper-Funktionen).
