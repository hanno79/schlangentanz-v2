# M2s — Schlangenlichtung-Empty-State als ruhige Forest-Lichtung — Release-Status

**Slice-ID:** M2s
**Datum:** 2026-06-27
**Commit:** 4dac9f2 (deploy 4dac9f2)
**Klasse:** M2-Visual-Consolidation (Erweiterung der M2r-Reihe)
**Status:** ✅ SHIPPED (Production-URL live)

## Akzeptanzkriterien-Erfuellung

| # | Kriterium | Status | Evidenz |
|---|-----------|--------|---------|
| 1 | 3 route-scoped display:none-Regeln deklariert (Specificity 0,2,0 + !important) | ✅ | src/App.css Zeilen 10528-10540 |
| 2 | aktiverTanzSchritt /game: display:none (computed) | ✅ | Live-Smoke: `display=none` |
| 3 | zielkompass /game leer: display:none | ✅ | Live-Smoke: `display=none` |
| 4 | zielkompass /game nach Kartenwahl: display:flex (Override) | ✅ | Live-Smoke: `display=flex` 491x172 px |
| 5 | Lobby: zielkompass sichtbar (display != none) | ✅ | Live-Smoke: `display=flex` |
| 6 | 10 RED-Tests gruen | ✅ | `npx vitest run src/App.m2s_*.test.tsx` → 10/10 |
| 7 | Adjacent pre-existing Tests (m1cd, m1cu, m1h, m1di, m2r) gruen | ✅ | 23/23 pass |
| 8 | npm run typecheck gruen | ✅ | exit 0 |
| 9 | npm run build gruen | ✅ | dist 545ms, 225.44 kB CSS |
| 10 | Live-Smoke Production bestanden | ✅ | 1280x900: aktiverTanzSchritt:none, zielkompass:none → flex nach Karten-Wahl |
| 11 | Console/Page-Errors 0 | ✅ | Live-Smoke endet ohne Throw |
| 12 | Code-Review | ✅ | Kimi 0 BLOCKER, 6/6 NON-BLOCKERS akzeptiert |

## Slice-Uebersicht

**Problem:** Im leeren Anfangszustand auf /game (keine Handkarte gewaehlt, keine eigene
Schlange gestartet) stapeln sich in der grossen Schlangenlichtung 3 Notification-Bubbles,
die das "Click-Simulator-Gefuehl" verstaerken:

- `.waldtanz-aktiver-tanz-schritt` (894px breite Info-Bubble "Spieler 1 ist am Zug")
- `.schlangen-zielkompass` (Text "Waehle oder ziehe eine Handkarte...")
- `.schlangen-startgarten` (Text "Noch keine eigene Schlange")

Diese 3 Bubbles sagen dem Spieler nichts, was er nicht schon aus der Spielerfuehrung
(Sidebar links) weiss. Sie verstopfen die leere Schlangenlichtung mit Dashboard-Look.

**Loesung:** 3 route-scoped Hides auf /game, Override-Regel fuer Karten-Wahl-Zielkompass.

```css
.spielbereich--game-route [class~="waldtanz-aktiver-tanz-schritt"] { display: none !important }
.spielbereich--game-route [class~="schlangen-zielkompass"]          { display: none !important }
.spielbereich--game-route [class~="schlangen-startgarten"]          { display: none !important }
/* Override sobald Karte gewaehlt — Zielkompass kommt mit "X Brettziele bereit" zurueck */
.spielbereich--game-route [class~="schlangenbereich"][class~="schlangenbereich--karte-ausgewaehlt"]
  [class~="schlangen-zielkompass"]                                   { display: flex !important }
```

Specificity 0,2,0 + `!important` gewinnt gegen pre-existing 0,1,0-Basis-Regeln.
Doubled-class-Override (0,3,0) gewinnt gegen 0,2,0-Hide (M1dt-Pattern).

## Spielerische Wirkung

**Vorher (M2r):** Schlangenlichtung war 974x640 px gross, aber im leeren Zustand
sassen 5 Notification-Bubbles uebereinander — Dashboard-Look, Click-Simulator-Gefuehl.

**Nachher (M2s):** Schlangenlichtung im leeren Zustand atmet:
- 3 Notification-Bubbles weg (aktiverTanzSchritt, zielkompass-leer, startgarten)
- Magiekreise bleiben sichtbar (zentrale Forest-Arena-Brett-Objekte)
- Brettschritt-Stempel / Questband bleiben sichtbar
- Sobald Spielerin eine Handkarte waehlt, kommt der Zielkompass zurueck
  (mit konkreter Info "X Brettziele bereit" — das ist spielrelevant)

**Visuelle Aenderung:** Schlangenlichtung wirkt jetzt wie eine **ruhige Forest-Lichtung
die auf den ersten Spieler-Klick wartet**, nicht wie ein Dashboard mit Notification-Stacks.

Stitch-Alignment: passt zu `der_waldtanz_game_board/code.html` Empty-State
(ruhige Wiese + 3 Magiekreise + Hand unten, ohne Notification-Listen).

## Code-Review-Disclosure (Kimi Code CLI statt Codex CLI)

**Reviewer:** Kimi Code CLI 0.18.x (k2p7)
**Begruendung:** Codex CLI `NOT_FUNCTIONAL` (Watchdog-Output: `codex wartet auf stdin —
usage limit oder trusted-dir-Block`). Codex-OAuth-Quota bis ca. 25.06.2026 19:07 UTC
aufgebraucht. Kimi ist Standard-Fallback laut schlangentanz-workflow-Skill.

**Kimi-Findings:**
- 0 BLOCKER
- 6/6 NON-BLOCKERS akzeptiert (Cascade-Konflikte, jsdom-Assert-Strategie,
  pre-existing-Test-Konsistenz, Selector-Form, Override-Source-Order, Smoke-Logik)

**Kimi-K2.7-Phrasing-Drift:** keine sichtbare Umlaut-Drift im Output, saubere
"KEIN BLOCKER"-Sections.

## Workflow-Schritte (was tatsaechlich passiert ist)

1. **Status-Check:** vorgefunden uncommitted M2s-Arbeit aus letztem Cron-Lauf
   (Plan + RED-Tests + Smoke + CSS bereits geschrieben, aber 8/10 RED-Tests RED).
2. **RED-Reparatur:** Die vorhandenen Tests hatten 2 Bugs:
   - `cssBlockContainsExact` hat Regex-Charclass-`[`,`]` nicht korrekt escaped
   - `getComputedStyle` auf importiertes CSS ist in jsdom unzuverlaessig
   - Fix: eigene `alleRegelBloecksFuer()` mit Substring-Index (kein Regex),
     computed-style-Tests durch DOM-Existenz + Cascade-Order-Tests ersetzt.
3. **Targeted-Run:** 10/10 RED-Tests gruen
4. **Adjacent-Tests:** 23/23 pre-existing-Tests gruen
5. **Build:** erfolgreich
6. **Kimi-Review:** 0 Blocker
7. **Commit + Push + Deploy:** 4dac9f2 → Production-URL
8. **Live-Smoke:** Production-Verifikation bestanden
9. **Release-Status-Doku:** dieses File (final commit)

## Naechste Luecke (M3x — Lobby/Spielstart oder M2t — Board-Interaktion)

Der M2s-Slice schliesst die M2r-Forest-Arena-Reihe ab. Die Schlangenlichtung
ist jetzt eine ruhige Forest-Lichtung. Naechste mittlere Stitch-Vertical-Slices
koennten sein:

- **M2t (Lobby/Spielstart):** Dasonige-Nest-Lobby als Stitch-Stil mit
  1-3 KI-Gegnern konfigurierbar machen.
- **M2u (Sonderkarten-Brettziel-Animation):** Wenn Sonderkarte in Hand gewaehlt
  wird, pulsieren die passenden Magiekreise in der Schlangenlichtung.
- **M2v (Sieg-Ansicht):** Die Sieger-Party-Ergebnis-Ansicht aus Stitch
  (party.png) als Result-Screen.

Empfehlung: **M2t (Lobby/Spielstart)** — die Spielerin braucht einen klaren
Einstieg in die ruhige Forest-Arena, und das aktuelle /game-Layout ist
bereits ein guter Anknuepfungspunkt.