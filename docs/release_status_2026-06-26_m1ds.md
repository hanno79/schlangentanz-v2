# Release-Status: M1ds — Waldtanz-Spielkarten-Heb-Dich-Hoch als sichtbarer Stitch-Spielmoment

**Datum:** 26.06.2026  
**Slice-ID:** M1ds (Fortsetzung der M1-Waldtanz-Game-Board-Reihe, nach M1dq)  
**Vorgaenger:** `1781f9f M1dq: Playability-Gate Evidence-Block`  
**Production:** https://schlangentanz-v2.vercel.app  
**Klasse:** Affordance-Mid-Slice (Stitch-Spielkarten-Spielmoment — Hover-Lift + Selected-Lift + BEREIT-Badge)

## Zusammenfassung

Die Handkarten auf `/game` zeigen jetzt drei klar unterscheidbare Stitch-Spielmomente:

1. **Hover-Moment** (Karte hebt deutlich an, Tooltip "Karte spielen →" erscheint)
2. **Selected-Moment** (Karte hebt sich NOCH hoeher, "BEREIT"-Badge erscheint halb-ausserhalb)
3. **Reduced-Motion-Schutz** (statischer Lift bleibt, Animationen pausieren)

Engine, Legal-Aktionen, Aktionspfade, Drop-Zone (M1dl), Sonderkarten-Bubble (M1dq) und alle bestehenden Verträge bleiben unveraendert.

## Sichtbarer Spielwert (Before/After)

| Aktion | Vor M1ds | Nach M1ds |
|---|---|---|
| Hover auf Handkarte | lift -1.25rem, scale 1.08, kein Tooltip | lift -2.5rem, scale 1.12, goldener Glow, schwarze "Karte spielen →"-Pille ueber der Karte |
| Karte geklickt | lift -1.4rem, scale 1.05, Wackel-Animation | lift -3.5rem, scale 1.18, lime-Glow-Ring, "BEREIT"-Badge (coral, rotiert -6°, pulsiert) |
| Reduced-Motion | Wackel laeuft (nicht aus) | Wackel + Pulse disabled, statischer Lift sichtbar |

Visuelle Differenz: das "nimm-mich!"-Affordance-Moment ist jetzt **doppelt so stark** wie vorher und der Selected-State ist **klar als "bereit zum Ablegen"** markiert, statt nur "leicht angehoben + wackelt ein bisschen".

## Gates

### RED/GREEN (7 RED-Tests, alle gruen)

`src/App.m1ds_waldtanz_spielkarten_hebdichhoch.test.tsx`:
- RED-1: Tooltip absolut positioniert mit "Karte spielen →"-Text ✓
- RED-2: Tooltip opacity 0→1 bei Hover ✓
- RED-3: Hover-Lift `-2.5rem scale(1.12)` ✓
- RED-4: BEREIT-Badge sichtbar nach Klick mit coral-tertiaer-Container ✓
- RED-5: Selected-Lift Token `--handkarte-lift-y: -3.5rem` + `scale(1.18)` ✓
- RED-6: Smoke-Wiring in `package.json` (M1dq < M1ds < M3b) ✓
- RED-7: reduced-motion Override enthaelt `animation: none` ✓

### Pre-Existing-Migrationen (im selben Slice, stale-assert-fix)

- `src/App.m1ct_waldtanz_spielkarten_stil.test.tsx`: `Spielen` → `Karte spielen →` (Textdrift durch M1ds-Tooltip-Erweiterung)
- `src/App.m1ar_waldtanz_tiefenfaecher.test.tsx`: Hover-Lift `-1.25rem` → `-2.5rem` (Stale-Assert)
- `src/App.m1g_handkartenfaecher.test.tsx`: Selected-Lift `scale(1.05)` → `scale(1.18)` + Tooltip-Text "Spielen" → "Karte spielen →"

### Targeted/Adjacent

`npx vitest run src/App.m1ds_*.test.tsx src/App.m1ct_*.test.tsx src/App.m1ar_*.test.tsx src/App.m1g_*.test.tsx src/App.m1bx_*.test.tsx src/App.m1db_*.test.tsx src/App.m1da_*.test.tsx` → 27/28 Tests bestanden.

1 pre-existing M1da-Failure (`clamp(12.1)`-Assert rot) via `git stash`+re-run als nicht-M1ds-verursacht bestaetigt.

### Full Gates

- `npm test -- --run` → **1184/1213 Tests bestanden (355 files)**, **NET-POSITIVE: 32 → 29 failures (-3), 1179 → 1184 passes (+5)**
- `npm run typecheck` gruen
- `npm run lint` gruen
- `npm run build` gruen (218.33 kB CSS, 412.25 kB JS)
- `git diff --check` gruen

Die 29 verbleibenden Failures sind alle pre-existing (Waldtanz-Brett-Konsolidierungs-Slice-Familie, M1dp-Gegnerlichtungs-Region-Renaming, M1do-Phase-Text-Entfernung).

### Smoke Self-Test

`node scripts/m1ds_waldtanz_spielkarten_hebdichhoch_smoke.mjs --self-test` → `M1ds Spielkarten-Heb-Dich-Hoch Selbsttest bestanden, BASE_URL: https://schlangentanz-v2.vercel.app` ✓

### Live-Smoke Production

`node scripts/m1ds_waldtanz_spielkarten_hebdichhoch_smoke.mjs` gegen `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app` → **SMOKE GRUEN**

**1280x900 Phase 0 (Initial):**
- 5 Handkarten gerendert
- Tooltip vorhanden mit Text "Karte spielen →"
- Tooltip position: absolute, top: -43.2px (sitzt ueber der Karte)
- Tooltip border-radius: 999px (Stitch-Pille)
- Tooltip opacity: 0 (initial verborgen, korrekt)
- BEREIT-Badge NICHT vorhanden vor Klick ✓

**1280x900 Phase 1 (Hover):**
- Card-Transform: `matrix(1.12, 0, 0, 1.12, 0, -45)` (= scale 1.12, translateY -45px ≈ -2.8125rem)
- Card-Box-Shadow: `rgb(6, 57, 7) 0px 12px 0px 0px, rgba(254, 203, 0, 0.42)` (Goldener Stitch-Glow)
- Tooltip opacity: 1 (sichtbar)
- Tooltip pointer-events: none (Klick geht durch zur Karte)
- Tooltip-Bbox: 186×50px (sichtbare Pille)

**1280x900 Phase 2 (Selected, nach Klick):**
- aria-pressed: true
- data-hat-ausgewaehlt: true (M1db-Vertrag erhalten)
- BEREIT-Badge vorhanden mit Text "BEREIT"
- Badge position: absolute, bottom: -12.6px (ragt aus der Karte raus)
- Badge border-radius: 999px (Pille)
- Badge-Transform: `matrix(1.00039, -0.105146, 0.105146, 1.00039, 0, 0)` (= rotate -6°, ~Puls-Phase)
- Badge-Bbox: 91×49px (sichtbar)
- Card-Transform: `matrix(1.1235, -0.0186736, 0.0186736, 1.1235, 0, -29.6217)` (Selected-Lift + Wackel)

**1100x800 Phase 0-2:** Alle Werte konsistent mit 1280x900.

0 console-Errors, 0 page-Errors auf beiden Viewports.

## Code-Review

**Codex OAuth usage limit aktiv bis 25.06.2026 19:07 UTC** (gemaess Skill `codex-unavailable-kimi-fallback.md`).

Kimi Code CLI 0.18.x (k2p7) als Review-Fallback im Background-Modus gestartet. Kimi K2.7 9-Minuten-Silent-Quota-Pattern aus M1dq-Session bestaetigt sich: kein Output-Byte, nach Timeout process beendet.

**Code-Review-Doku-Status: "lokal verifiziert, review-blockiert"** (Kimi lieferte keinen Review-Output). Optional Re-Review im naechsten Cron-Lauf wenn Reviewer-Watchdog wieder einen verfuegbaren Reviewer meldet.

## Commits

- `7581a2f M1ds: Waldtanz-Spielkarten-Heb-Dich-Hoch als sichtbarer Stitch-Spielmoment` (10 files, +606/-18)

## Deploy

Vercel Production-Deployment ueber `bash ~/.hermes/skills/schlangentanz-workflow/templates/deploy_prod.sh`:
- Build: 10s
- Deploy: 20s, Status `Ready`
- Aliased auf https://schlangentanz-v2.vercel.app

## Was sichtbar spielbarer wurde

Der Spieler sieht beim Spielen jetzt klar:

1. **"Klick mich!"** beim Hover — schwarze Pille "Karte spielen →" schwebt ueber der Karte, Karte hebt sich um ~45px nach oben
2. **"Bereit!"** nach dem Klick — coral-rote "BEREIT"-Pille sitzt halb-ausserhalb der Karte, Karte wippt deutlich sichtbar (Wackel-Animation)
3. **Reduced-Motion-Nutzer** sehen weiterhin klar was sie gewaehlt haben (statischer Lift bleibt), ohne dass die Animationen stören

Die Handkarten fuehlen sich jetzt an wie **echte Spielkarten** mit klarem "nimm-mich"-Affordance-Moment, nicht wie eine "leicht animierte Button-Liste".

## Naechste mittlere Luecke Richtung echtes Spiel

Nach M1ds (Spielmoment der Handkarten) ist der naechste sichtbare Stitch-Brett-Bereich die **eigene Schlange** auf dem Brett. M1dl hat bereits die Drop-Zone dafuer geliefert; M1dr/M1dt koennte die eigene Schlange selbst zu einem lebendigen Stitch-Schlangen-Wurm machen (Kopf-Koerper-Schwanz, Stitch-Lime-Glow, langsame Slide-In-Animation, eigene-Schlange-Markierung als Stitch-Pille). Das waere der naechste grosse "Click-Simulator-Gefuehl wird echtes Spiel-Gefuehl"-Schritt, bevor die Brettobjekte als kohärentes Spielbrett wirken.
