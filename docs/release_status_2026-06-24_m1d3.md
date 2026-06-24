# M1d3 — `/game`-Status-HUD reconciliieren + kanonische Smoke-Kette reparieren

> **Status:** Release-Fertig (cron-run 24.06.2026).
> **Typ:** Reconcile-Slice (kanonische Smoke-Kette + /game Status-Dopplung), kein Engine-Touchpoint.
> **Vorgänger:** M3a (Sonniges Nest beleben), der die pre-existing M1bg-Smoke-Schuld flaggte.
> **Nachfolger:** offen — nächster sichtbarer Waldtanz-Board-Vertical auf /game.

## Was sichtbar/strukturell besser wurde

Die kanonische `npm run smoke:production`-Kette war seit den M1d1/M1d2-Arena-Refactors
**rot**, weil drei Checks (M1bg/M1bi/M1bj) auf `/game`-Panel-Strukturen prüften, die
zugunsten des Brettfokus bewusst ausgeblendet worden waren (M1cs-Vertrag, geschützt durch
den `m1bo`-Test: auf `/game` bleiben genau 2 Spielschubladen). M1d3 repariert diese
Schuld ehrlich und entfernt gleichzeitig die letzte Status-Dopplung auf `/game`:

- **Keine Status-Dopplung mehr auf `/game`:** Die verbose `__statgitter`-Liste
  (Phase/Handkarten/Eigene Schlangen/Nachziehstapel/Offene Quests) wurde bisher auf
  `/game` nur per CSS-Clip visuell versteckt — sie blieb aber im DOM und im
  Accessibility-Tree und doppelt die Werte der kompakten Ranken-Chips. Mit M1d3 wird
  sie auf `/game` komplett nicht gerendert. Die kompakten Ranken-Chips sind die einzige
  Statusquelle. Auf `/` bleibt die Liste als Entwicklungsdatenquelle erhalten.
- **Kanonische Smoke-Kette wieder grün:** M1bg-Schwelle von `< 5` auf `< 2`
  reconciliiert (die 2 verbleibenden Schubladen laut M1bo-Vertrag). M1bi (Materialrucksack)
  und M1bj (Spielerbänke) testen jetzt gegen `/`, wo die Panel-HUDs bewusst verbleiben,
  und laufen am Ende der `/game`-Kette.

## Slice-Scope

### Rein
- `src/components/WaldtanzSeitenmenue.tsx`: `__statgitter` nur bei `!kompakteRanke`
  rendern (also auf `/`, nicht auf `/game`).
- `src/App.css`: drei nun tote `/game`-CSS-Regeln für `__statgitter`/`__statkarte`
  entfernt (Clip-Hide + Gap + Padding/Font-Size).
- `scripts/live_smoke.mjs`: M1bg-Schwelle `< 5` → `< 2`; M1bi/M1bj ans Kettenende
  verschoben und mit `erstelleUrl('/')`-Navigation versehen.
- `src/App.m1d3_status_hud_reconciliert.test.tsx` (neu): 4 Tests.

### Raus (explizit)
- Keine Engine-Änderung.
- Keine Layout-/Viewport-Schirurgie (separater Folge-Slice).
- Keine neuen sichtbaren Brettobjekte.

## RED → GREEN

### RED-Tests
- `src/App.m1d3_status_hud_reconciliert.test.tsx` (4 Tests):
  - `__statgitter` auf `/game` verborgen, Ranken-Chips bleiben.
  - `__statgitter` auf `/` erhalten.
  - M1bg-Smoke-Schwelle `< 2` (nicht `< 5`).
  - M1bi/M1bj gegen `/` am Kettenende.
- RED gegen clean HEAD bestätigt (3/4 Tests schlugen vor Implementierung fehl).

### Claude Code / `/simplify`
- `claude --model opusplan` blieb durch den bekannten `401 Invalid authentication
  credentials`-Blocker unbenutzbar; enger manueller Fallback mit objektivem RED-Test,
  Diff-/CSS-Cascade-/Line-Budget-Selbstcheck.

### Code-Review: Kimi Code CLI (statt Codex)
- Codex OAuth hatte `usage limit` (gültig bis 25.06.2026 19:07 UTC); Kimi Code CLI
  `0.18.x` als Review-Fallback, review-only, mit identischem Kontext wie Codex erhalten
  hätte (Diff inkl. untracked Test, Authority = M1bo-Vertrag + Nutzer-Richtung).
- Ergebnis: **BLOCKERS: None**.
- Behandelte NON-BLOCKERS (in-Slice gefixt):
  - Tote CSS-Regeln für `__statgitter`/`__statkarte` auf `/game` entfernt (3 Regeln).
  - Bestätigt: DOM-Entfernung ist eine Accessibility-Verbesserung (Screenreader lesen
    die gedoppelten Werte nicht mehr vor), keine Regression.
- Disclosure: „Code-Review: Kimi Code CLI 0.18.x statt Codex CLI, weil Codex OAuth
  usage limit bis 25.06.2026 19:07 UTC."

## Gates (alle grün)

- [x] **Full Suite:** `npm test -- --run` → 330 Test Files, **1064 Tests passed**
- [x] **Test-Lines:** `npm run check:test-lines` → alle unter 500
- [x] **Typecheck:** `npm run typecheck` passed
- [x] **Lint:** `npm run lint` passed
- [x] **Build:** `npm run build` passed
- [x] **Diff-Hygiene:** `git diff --check` clean
- [x] **Smoke-Self-Test:** `node scripts/live_smoke.mjs --self-test` → „R107 Selbsttest bestanden"

## Deploy / Smoke

(nach Commit/Push/Deploy auszufüllen)

## Commits

(nach Commit auszufüllen)

## Nächster mittlerer Slice

- **M1 — Waldtanz Game Board weiter:** Die kanonische Smoke-Kette ist nun wieder grün.
  Der nächste sichtbare Stitch-Vertical auf `/game` kann die zentrale Spielfläche /
  Schlangenlichtung als lebendiger Spielmittelpunkt oder die `/game`-Viewport-Passung
  (aktuell 1374px scrollH bei 900px Viewport) angehen.
- **M5 — E2E-Playability:** Vollständige Partie von Lobby bis Sieger-Party gegen die Spec.
