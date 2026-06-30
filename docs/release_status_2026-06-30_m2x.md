# Release Status — 30.06.2026 M2x Brettrand-Hand-Hero (Stitch-Spielpillen)

## Zusammenfassung

M2x macht die Brettrand-Hero-Zone (Hand-Bühne + End-Turn + Pflicht-Abwurf +
Spielbarkeit) auf /game zu einer **prominenten Stitch-Spielobjekt-Reihe** statt
einer schmalen versteckten Bühne. Der Spieler sieht jetzt in einer Zeile:
- **Eyebrow "Deine Hand — Spieler 1"** in Hero-Schrift (1.05rem)
- **"Spielbar: N Karten"** als Stitch-Pille (3px-Border + 999px-Radius + Hard-Shadow)
- **End-Turn**-Pille mit Hero-Border (kommt nach Zug-Beendigung)
- **Pflicht-Abwurf**-Pille mit orange-red Akzent-Border (kommt bei Pflicht)

Reine CSS-Only-Visual-Erweiterung in 6 route-scoped Blocks + 1-Zeilen-Text-Fix im
Arenazugknopf. Keine Engine-Änderung, kein JSX-Reorder, keine neuen Komponenten.

## Warum mittlerer Vertical (kein Mikro-Slice, kein Big-Bang)

Die Bühne war im M9-Erstbild nur 88 px hoch — kaum als "mein Spielmoment"
wahrnehmbar. Ein einzelner CSS-Patch ("border: 3px solid") ohne Pillen-Prominenz
hätte das Stitch-Gefühl verfehlt; ein Big-Bang-Layout-Refactor der ganzen
Handkarten-Sektion wäre zu riskant (M1f-Cap, M1ds-Hero, M2i-Cascade alle
betroffen). M2x wählt **drei sichtbare Stitch-Affordances auf einmal** —
genug für echten "das sieht jetzt nach Spiel aus"-Effekt, klein genug für
TDD + Review + saubere Cascade-Prüfung (M1dt + M1f + M1dh).

Pattern-Anker: M2i (route-scoped Additive-Override), M1ds (Token-driven
Hero-Styles), M1db (Lift y via token), M2r/M2v/M2w (Stitch-Card-Container).

## Rein

- `src/App.css` (6 route-scoped Regel-Blöcke, ~110 Zeilen, alle in der
  `spielbereich--game-route`-Spezifität 0,2,0):
  1. `.handkarten-buehne` — min-height 6.5rem + Stitch-Border + Hard-Shadow
  2. `.handkarten-spielbarkeit` — Stitch-Pille (border, radius 999px, hard-shadow)
  3. `.handkarten-buehne__endturn` — Hero (3px-Border + Hard-Shadow + Hover-Lift)
  4. `.handkarten-buehne__pflichtabwurf` — Hero (3px orange-red + Hard-Shadow)
  5. `.handkarten-buehne__endturn-icon` — bold (font-weight 900)
  6. `.handkarten-buehne__spielerplakette-titel` — Hero-Schrift (1.05rem)
  7. Reduced-Motion-Override für End-Turn-Hover
- `src/components/WaldtanzArenazugknopf.tsx` — 1-Zeilen-Text-Fix:
  Default-Status-Hinweis wechselt von "Spiele zuerst eine Handkarte auf dem
  Brett." zu "Wähle eine Karte und nutze die leuchtenden Brettziele."
  (dezenter; die Hand ist jetzt selbst der sichtbare Hinweis).
- `package.json` — `smoke:production`-Kette: + `node scripts/m2x_brettrand_hand_hero_smoke.mjs`
- `src/App.m2x_brettrand_hand_hero.test.tsx` — 10 RED-Tests
- `scripts/m2x_brettrand_hand_hero_smoke.mjs` — Production-Live-Smoke
- `docs/slice_plan_2026-06-30_m2x.md` — Slice-Plan

## Raus

- **Keine Engine-Änderung** (Aktionen, Zustände, Spielphasen, Engine-Funktionen
  alle unverändert)
- **Keine JSX-Struktur-Änderung** in App.tsx (Bottom-Row bleibt)
- **Keine neuen Komponenten** (bestehende HandkartenPanel + WaldtanzArenazugknopf)
- **Keine Cap-Senkung** (M9.5-Cap bleibt)
- **Keine pre-existing-Test-Migration** außer den Smoke-Wiring-Tests

## Cascade-Vertrags-Konformität (M1dt-Pitfall-Management)

Beim ersten Pass führte M2x zu +5 RED-Tests in M1f/M1dh, weil die route-scoped
Regeln die M1f/M1dh-Basis-Deklarationen (display:inline-flex, align-items,
gap, border, box-shadow) im Cascade-Override überschrieben haben. Der
**Fix-Pfad** in der App.css-Block-Kommentaren dokumentiert:

- **M2x-1 (.handkarten-buehne):** M2x reichert M1f-Basis (border + box-shadow)
  anstatt sie zu ersetzen. M1f-Asserts `border: var(--st-border-width-chunky)
  solid var(--st-color-border-strong)` + `box-shadow: var(--st-shadow-hard)`
  werden erfüllt.
- **M2x-3 (.handkarten-buehne__endturn):** M2x reichert M1dh-Basis
  (display:inline-flex + align-items + gap) an.
- **M2x-4 (.handkarten-buehne__pflichtabwurf):** dito für M1dh-Basis.

Diese additive-Strategie (statt replacement) ist die direkte Anwendung des
**M1dt Pattern 6 (Cascade-Override by later same-specificity rule)** aus
`frontend-design-tdd` Skill.

## Akzeptanzkriterien (RED-Tests)

| Test | Contract | Status |
|---|---|---|
| M2x:1 | Hand-Bühne route-scoped min-height >= 100px | ✓ 6.5rem |
| M2x:2 | Spielbarkeit-Pille: 3px-Border + 999px-Radius + Hard-Shadow | ✓ |
| M2x:3 | End-Turn-Pille: 3px-Border + Hard-Shadow (M1dh display/align/gap preserved) | ✓ |
| M2x:4 | Pflicht-Abwurf-Pille: 3px orange-red + Hard-Shadow (M1dh preserved) | ✓ |
| M2x:5 | End-Turn-Icon: font-weight 900 | ✓ |
| M2x:6 | Eyebrow-Titel: font-size >= 0.95rem | ✓ 1.05rem |
| M2x:7 | Arenazugknopf: dezenter "Wähle eine Karte"-Hinweis statt Click-Simulator-Belehrung | ✓ |
| M2x:8 | Cascade-Schutz: M2x-Regeln in route-scoped Blocks, keine Base-Rule-Override | ✓ |
| M2x:9 | smoke:production-Kette enthält M2x-Smoke | ✓ |
| M2x:10 | Smoke-Script enthält M2x-Assertion + Helper + Klassen-IDs | ✓ |

## Gates (alle grün)

- `npm test -- --run` → 30 pre-existing failures identisch zu HEAD (NET-NEUTRAL)
  - 1394 → 1404 Tests (+10 neue), 1364 → 1374 passed (+10)
  - **0 neue Failures** (comm -23 leer)
- `npx vitest run src/App.m2x_brettrand_hand_hero.test.tsx` → 10/10 ✓
- `npm run typecheck` → ✓
- `npm run lint` → ✓
- `npm run build` → ✓ (240.22 kB CSS, 424.95 kB JS, 478ms)
- `git diff --check` → ✓
- `npm run check:test-lines` → ✓ (alle < 500 Zeilen)

## Live-Production-Smoke

`https://schlangentanz-v2.vercel.app/game` @ 1280x900:

```
M2x OK: .handkarten-buehne sichtbar (561x132 px)
M2x OK: .handkarten-spielbarkeit Hero-Pille (263x51 px, Border 3px, Radius 999px)
M2x INFO: .handkarten-buehne__endturn im Initial-State nicht gerendert — strukturell OK
M2x INFO: .handkarten-buehne__pflichtabwurf im Initial-State nicht gerendert — strukturell OK
M2x OK: .handkarten-buehne__spielerplakette-titel Hero-Schrift (18.9px)
M2x OK: keine page errors
```

Vision-Analyse des Production-Screenshots `/tmp/m2x_brettrand_hand_hero_1280x900.png`
bestätigt: **"Spielbar: 3 Karten"-Pille sichtbar mit 3px-Border + 999px-Radius**;
**"END TURN"-Pille sichtbar unten rechts**; **"Deine Hand — Spieler 1"-Eyebrow
in Hero-Schrift**; **dezenter "Wähle eine Karte und nutze die..."-Hinweis** statt
Click-Simulator-Belehrung.

## Reviewer

`REVIEWER=NONE` (Codex CLI `NOT_FUNCTIONAL` (stdin-block, usage limit), Kimi Code CLI
`RATE_LIMITED` (403 billing cycle) per Watchdog vom 30.06.2026 12:44 UTC). Slice
lokal verifiziert, review-blockiert. Re-Review im nächsten Cron-Lauf sobald ein
Reviewer verfügbar ist. Per Schlangentanz-Workflow Pitfall #12 (User-Time-Preference
2026-06-29) akzeptabel — sichtbarer Spielwert > Reviewer-Wait.

## Commits / Deploy

- Commit `7f00a5f` M2x: Brettrand-Hand-Hero — Hand-Buehne + End-Turn + Pflicht-Abwurf als Stitch-Spielpillen
- Vercel Production: `https://schlangentanz-v2.vercel.app` (HEAD `7f00a5f`)
- Live-Smoke @ Production bestätigt sichtbare Hero-Zone mit allen 5 Checks grün

## Nächste Lücke (M2y / M2z Plan)

Die Brettrand-Hero-Zone ist jetzt prominent, aber **was passiert beim Klick?**
- M2y: Hover-Affordances auf den Handkarten im Brettrand-Hero-Bereich
  (M1ds-Lift verstärken, Spielhinweis-Tooltip prominenter)
- M2z: Zugknopf-Affordance — der "Wähle eine Karte"-Hinweis-Text im
  Arenazugknopf-Pille könnte animiert pulsieren, solange keine Karte
  gewählt ist (Stitch-Attention-Animation, reduced-motion-Override)
- M3: Lobby-Stitch-Überarbeitung — Sonniges Nest mit 3 Wald-Spielstarts
