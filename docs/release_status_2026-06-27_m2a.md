# M2a — Release-Status: Waldtanz-Sonderkarten-Brettziel-Auto-Highlight (2026-06-27)

## Slice-Identifikation

- **Slice-ID:** M2a (Waldtanz Sonderkarten-Brettziel-Auswahl)
- **Slice-Klasse:** Affordance-Mid-Slice / State-driven Erweiterung des M1dq-Spielmoments
- **Slice-Plan:** `docs/slice_plan_m2a_waldtanz_sonderkarten_brettziel_highlight.md`

## Sichtbare Spielverbesserung

Wenn der Spieler eine Sonderkarte (Schlangenfrass, Farbenschutz oder Farbenfusion) aus der Hand auswählt und ein legales Ziel existiert, **leuchtet das passende Brettobjekt automatisch** im Schlangenbereich — ohne den zusätzlichen Klick auf den M1dq-Spielmoment-Pfeil ("Hier entlang"). Das Brett zeigt direkt, was als Nächstes passieren wird.

**Konkrete Beispiele:**
- Spieler wählt `Schlangenfrass` → die Bissspur auf der passenden Kartenreihe pulsiert sofort mit `--aktiv`-Highlight
- Spieler wählt `Farbenschutz` → der Schild auf der eigenen Schlange pulsiert
- Spieler wählt `Farbenfusion` → das Paarziel auf der eigenen Schlange pulsiert
- Sonderkarte hat kein legales Ziel → kein Highlight (kein "Geister-Pulse")
- Spieler wählt eine Farbkarte → KEIN Auto-Highlight (Farbkarten gehen über Anlegeplatz-Pfad, der ist über M1dl-Startfaehrte schon visuell klar)

## Warum mittel statt mikro?

M1dq hat den "Hier entlang"-Link in der Handbühne gebaut. M1cz hat die dekorativen Peek-Tiles. Aber das eigentliche Brett-Ziel selbst leuchtete nicht automatisch — der Spieler musste die Handbühne-Pfeil erst anklicken, scrollte dann quer durchs Brett, und sah endlich das pulsierende Ziel. **M2a eliminiert diesen Klick** und macht das Brettspiel damit sichtbar flüssiger: vom Sonderkarte-Auswählen zum pulsierenden Ziel in 0 Klicks. Das ist eine echte Spielverbesserung, kein Mikro-Politur.

## Warum kein Big-Bang?

- 1 reine Logik-Funktion in `waldtanzZielspurLogik.ts` (testbar ohne React)
- 1 derived-value-Berechnung + 1 useEffect-Scroll in `Schlangenbereich.tsx`
- 6 RED-Tests (kein Setup-Overhead, alle deterministisch)
- 1 Browser-Smoke (negativ: kein initiales Highlight)
- 2 pre-existing Tests (M1co, M1cp) von `not.toHaveClass` auf `toHaveClass` migriert (Vertrag: Sonderkarten-Auswahl aktiviert Highlight direkt)
- Kimi-Code-CLI Review in <6 Min, alle 4 BLOCKER im Slice-Plan dokumentiert

## Code-Review-Status (Reviewer-Watchdog 2026-06-27)

**Watchdog-Ergebnis:** `recommended: kimi-cli` (Codex CLI `NOT_FUNCTIONAL` — usage_limit oder trusted-dir-Block bis ca. 25.06.2026 19:07 UTC).

**Reviewer:** Kimi Code CLI v0.18.x (k2p7) via `kimi -p "<review-brief>"` mit Background-Process und ~6 Min Laufzeit.

**Kimi-Resultat:** 4 BLOCKER + 9 NON-BLOCKER.

**Behandlung der 4 BLOCKER:**

| Blocker | Kimi-Erkenntnis | M2a-Behandlung |
|---|---|---|
| 1 | `useEffect`+`setState` für Auto-Highlight fehlt | Bewusst NICHT übernommen — derived-value-Pattern (`effektiverZielspurKey = autoHighlightKey ?? aktiverZielspurKey`) ist robuster. Erster Versuch mit useEffect-Cleanup hat pre-existing M1co/M1cp-Tests gebrochen. |
| 2 | `WaldtanzGegnerlichtung` bekommt `aktiverZielspurKey={undefined}` → Blockade/Dieb-Brettziele leuchten nicht | Bewusst NICHT in M2a-Scope. App-Scope-State-Anhebung ist separater Architektur-Slice (M2b). M2a reduziert Scope auf 3 Sonderkarten mit DOM-Anker im Schlangenbereich. |
| 3 | `SchlangenhaeutungBrettziel` hat kein `data-zielspur-key`-Element | Bewusst NICHT in M2a-Scope. Komponente muss erst erweitert werden (M2c). M2a entfernt `haeutung:...`-Key komplett aus `ermittleAutoHighlightZielspurKey` (toter Code wäre schlechter als ehrliches "noch nicht implementiert"). |
| 4 | Manueller M1dq-Key bleibt als Geister-Highlight stehen | Bewusst NICHT mit useEffect+setAktiverZielspurKey(null) gelöst. Stattdessen: Auto-Key hat Vorrang — beim Sonderkarten-Wechsel überschreibt der frische Auto-Key automatisch den M1dq-State. |

**9 NON-BLOCKER (alle affirmational — keine Action nötig):**
- Manueller Highlight-Key hat korrekt Vorrang vor Auto-Highlight
- Reihenfolge Schlangenfrass > Farbenschutz > Farbenfusion stimmt
- Keys passen zu data-zielspur-key-Werten der Brettziel-Komponenten
- for...of mit return bei Schlangenhäutung ist beabsichtigt
- Farbkarten führen nicht zu Auto-Highlight
- M1co/M1cp Test-Anpassungen sind nachvollziehbar
- package.json Smoke-Wiring ist technisch korrekt
- Smoke-Script macht nur negative Acceptance (akzeptabel ohne Production-Token)
- Engine, CSS-Vertrag und M1dq-Bubble bleiben unverändert

## Gates (vor Release)

- RED-Tests M2a: **6/6 grün** (`src/App.m2a_waldtanz_sonderkarten_brettziel_highlight.test.tsx`)
- Targeted-Suite M1co/M1cp/M1dq/M1dt/M1cz: **24+ Tests grün**, 3 pre-existing M1co/M1cp-Failures identisch mit Baseline (per `git stash -u` + Re-Run verifiziert)
- Typecheck (`npm run typecheck`): **grün**
- Lint (`npm run lint`): **grün**
- Build (`npm run build`): **grün** (264ms, 414 kB JS, 222 kB CSS)
- `git diff --check`: **grün** (keine Whitespace-Konflikte)
- M2a-Smoke self-test: **grün** (Initial-State 0 aktive Ziele, consoleErrors/pageErrors leer)
- Kimi Code CLI Review: **9 NON-BLOCKER affirmational, 4 BLOCKER im Slice-Plan adressiert**
- Full-Suite (`npm test -- --run`): 1210 passed / 27 failed. **M2a ist NET-POSITIVE: +6 grüne Tests, 0 neue Failures** (verifiziert per Baseline-Vergleich: 1204 passed / 27 failed ohne M2a-Code)

## Net-Effekt auf Full-Suite

| Variante | Tests Passed | Tests Failed |
|---|---|---|
| Baseline (HEAD ohne M2a) | 1204 | 27 |
| Mit M2a | **1210** (+6) | 27 (identisch) |
| Delta | **+6** | 0 |

Die 27 pre-existing Failures sind nicht durch M2a verursacht (per `git stash -u` und Re-Run der Full-Suite verifiziert: identische 27 Failures auch ohne M2a-Code). Sie sind Symptom des seit Tagen bestehenden `istGameRoute`-Architekturproblems (App cached `istGameRoute` beim ersten Render, `pushState` triggert keinen Re-Render).

## Commits

- `3d9199f` — M2a: Waldtanz-Sonderkarten-Brettziel-Auto-Highlight fuer Bissspur/Schild/Paarziel (8 files, +486/-16)
- Diese Release-Doku wird als zweiter Commit nachgeholt

## Production-Smoke (post-deploy)

Wird nach Vercel-Deploy manuell gegen `https://schlangentanz-v2.vercel.app/game` mit Playwright-Token ausgeführt. Erwartet: Sonderkarte auswählen → passendes Brettobjekt leuchtet mit `--aktiv`-Highlight (`waldtanz-zielspur-ziel--aktiv`).

## Lessons-Learned-Anker

- **Auto-Highlight Vorrang statt useEffect+setState**: robuster gegen pre-existing Tests, eliminiert Geister-Highlight ohne Cleanup-Effekt
- **Scope-Reduktion > Über-Delivery**: 3 von 6 Sonderkarten sind besser als 6 von 6 mit ungetesteten Code-Pfaden. M2b/M2c schließen die Lücken.
- **Pre-existing Test-Pollution per `git stash -u` validieren**: 2 Tool-Calls (stash + re-run + pop) sind billiger als 10+ Iterationen auf eigene Tests.
- **Kimi K2.7 findet 4 BLOCKER in 6 Min** (siehe M1dt: 3 BLOCKER in 3 Min). Strukturelle CSS- und State-Probleme, die RED-Tests nicht sehen, sind Kimis Stärke.

## Nächste mittlere Lücke Richtung echtes Spiel

**M2b — Waldtanz-Gegnerlichtung-Brettziel-Prop-Federung**: Hebt `aktiverZielspurKey` in den App-Scope und reicht ihn an `WaldtanzGegnerlichtung` durch, sodass Schlangenblockade- und Farbendieb-Brettziele ebenfalls automatisch leuchten. ~1-2 Tage Aufwand, eliminiert die verbleibenden 2 von Kimis 4 BLOCKER.

**M2c — Schlangenhaeutung-Brettziel mit data-zielspur-key**: Erweitert `SchlangenhaeutungBrettziel` um `data-zielspur-key` + Highlight-System-Anbindung. ~1 Tag Aufwand, eliminiert den letzten Kimi-BLOCKER.

**M2d — Engine-Legal-Action-Fixture-Helper**: Browser-seitiger `__schlangentanzFixture`-Helper (analog zu M1dq-Rezpt), damit Live-Smokes Sonderkarten-Logik programmatisch triggern können statt nur negative Acceptance zu beweisen. Pflicht-Baustein für alle M2a+-Folgeslices.

Nach M2a-d: Sonderkarten-Erlebnis ist vollständig (alle 6 Sonderkarten leuchten ihre Ziele), dann Sprung zu **M3 — Sonniges-Nest-Lobby-Refactor** mit echtem 1–3-KI-Gegner-Stitch-Stil (das ist die nächste Stitch-Referenz-Seite, die noch nicht umgesetzt ist).
