# M2x Slice-Plan — Waldtanz-Brett-Bottom-Hero: Hand + End-Turn als sichtbarer Stitch-Spielmoment

**Datum:** 30.06.2026
**Slice-Klasse:** M2-Affordance-Visual-Slice (Schwester zu M2e Schlangenlichtung, M2i Handkarten-Hero, M2s leere Schlangenlichtung; Fortsetzung der M-Reihe)
**Status:** 🟡 PLAN

## Visuelle Lücke

Auf /game ist die Hand-Bühne zwar da (M1f), aber der Spieler sieht nicht
sofort "Hier sind meine 5 Karten — wähle eine!". Die Bühne ist 88 px hoch,
klein, fast versteckt unter der "Spiele zuerst eine Handkarte"-Mahnung im
WaldtanzArenazugknopf. Die Stitch-Referenz
`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/screen.png`
zeigt eine **prominente Handkarten-Zone** mit 3 heroigen Cards und einer
großen **End-Turn-Pille** daneben — der Spieler sieht in 1 Sekunde: "Meine
Karten + mein Zugknopf".

## Konkret

**Bottom-Hero-Zone (Hand + Brettrand-Pille) als sichtbares Spielobjekt:**

1. **Handkarten-Bühne bekommt Stitch-Hero-Styles** (route-scoped):
   - `min-height: 100px` (von 88 px) — bisschen größer, präsenter
   - Prominenter **Eyebrow-Streifen** oben mit "Deine Hand — Spieler 1
     (5 Karten)" als Stitch-Pille
   - Karte-Anzahl wird zur **großen Stitch-Number** im Eyebrow
2. **Handkarten-Spielbarkeit-Anzeige** (`.handkarten-spielbarkeit`) als
   prominente Stitch-Pille mit **3px forest-green Border + Hard-Shadow**
   (Stitch-Pill-Style)
3. **End-Turn-Pille in der Handbühne** (`.handkarten-buehne__endturn`)
   bekommt **3px forest-green Border + Hard-Shadow** (von dünn → heroig)
4. **Pflicht-Abwurf-Pille** analog End-Turn: **3px forest-green Border +
   oranger-Rot Akzent-Border + Hard-Shadow**
5. **End-Turn-Icon** bekommt `font-weight: 900` (pfeil prominent)
6. **Arenazugknopf-Status** wechselt: wenn KEIN `aktion` aber Handkarten
   vorhanden, zeigt er nur den dezenten Hinweis-Text ohne "Spiele zuerst
   eine Handkarte"-Mahnung (die Hand selbst ist der Hinweis)

## Rein

- **CSS-Only-Visual-Erweiterung in `src/App.css`** (route-scoped
  `.spielbereich--game-route [class~="handkarten-buehne"]` und
  verwandte Klassen). KEINE Engine-Änderung, KEINE JSX-Änderung, KEINE
  Komponenten-Änderung.
- **Kleine Text-Anpassung in `WaldtanzArenazugknopf.tsx`:** der
  "Spiele zuerst eine Handkarte"-Fallback wird nur gezeigt, wenn die
  Hand komplett leer ist ODER die Phase kein erwartetes Handkarten-Spiel
  hat. Sonst zeigt die Pille den dezenten Hinweis "Wähle eine Karte und
  nutze die leuchtenden Brettziele." (bereits der Text, der bei aktiver
  Aktion erscheint — wir tauschen nur die Default-Reihenfolge).

## Raus

- **Keine Engine-Änderung** (Aktionen, Zustände, Spielphasen, Engine-Funktionen
  alle unverändert)
- **Keine JSX-Struktur-Änderung** in App.tsx (Bottom-Row bleibt)
- **Keine neuen Komponenten** (bestehende HandkartenPanel + WaldtanzArenazugknopf)
- **Keine Cap-Senkung** (M9.5-Cap bleibt)
- **Keine pre-existing-Test-Migration** außer den Smoke-Wiring-Tests für
  die neue Smoke-Datei

## Akzeptanzkriterien

1. **Hand-Bühne Hero-Prominenz:** `.handkarten-buehne` hat `min-height: 100px`
   UND `border: 3px solid var(--st-color-border-strong)` (route-scoped)
2. **Spielbarkeit-Pille Stitch-Style:** `.handkarten-spielbarkeit` hat
   `border: 3px solid` + `border-radius: 999px` (pill)
3. **End-Turn-Pille Hero:** `.handkarten-buehne__endturn` hat
   `border: 3px solid var(--st-color-border-strong)` + `box-shadow: 0 3px 0`
4. **Pflicht-Abwurf Hero:** `.handkarten-buehne__pflichtabwurf` hat
   `border: 3px solid #c43c1d` (orange-red) + `box-shadow: 0 3px 0`
5. **End-Turn-Icon Bold:** `.handkarten-buehne__endturn-icon` hat
   `font-weight: 900`
6. **Eyebrow Hero-Schrift:** `.handkarten-buehne__spielerplakette-titel`
   hat `font-size: 0.95rem` (deutlich größer als aktuell)
7. **Arenazugknopf-Default:** `WaldtanzArenazugknopf` zeigt im Default-State
   (kein Aktion, Hand nicht leer) den dezenten Hinweis "Wähle eine Karte
   und nutze die leuchtenden Brettziele." statt "Spiele zuerst eine
   Handkarte auf dem Brett."

## RED-Tests (in `src/App.m2x_brettrand_hand_hero.test.tsx`)

- M2x-1: route-scoped `.handkarten-buehne` min-height >= 100px
- M2x-2: route-scoped `.handkarten-spielbarkeit` ist eine Pill (border-radius 999px) mit 3px Border
- M2x-3: route-scoped `.handkarten-buehne__endturn` ist Hero (3px Border + Hard-Shadow)
- M2x-4: route-scoped `.handkarten-buehne__pflichtabwurf` ist Hero (3px Border + Hard-Shadow)
- M2x-5: route-scoped `.handkarten-buehne__endturn-icon` font-weight 900
- M2x-6: route-scoped `.handkarten-buehne__spielerplakette-titel` font-size >= 0.95rem
- M2x-7: `WaldtanzArenazugknopf` zeigt im Default-State den dezenten Hinweis
  "Wähle eine Karte" (nicht "Spiele zuerst")

## Production-Smoke `scripts/m2x_brettrand_hand_hero_smoke.mjs`

- Playwright-Smoke: Hand-Bühne ist sichtbar, End-Turn-Pille ist sichtbar
- `getBoundingClientRect` der Hand-Bühne: Höhe >= 95 px im 1280x900
- `getBoundingClientRect` der End-Turn-Pille (sichtbar nach Zug-Beendigung)
  oder Pflicht-Abwurf-Pille: border >= 3 px (computed)

## Bekannte Pitfalls (vermeiden)

1. **M2i-Pitfall:** Visual-Änderung in der route-scoped-Regel, NICHT in
   der Base-Regel. Sonst brechen M1ct/M1ds/M1ar/M1ax/M1bc pre-existing
   Tests, die die Base-Regel lesen.
2. **M1ct-Cascade-Override-Pitfall:** Kein Generic-Tag-Selector
   (`.handkarten-buehne strong { ... }`) hinzufügen — specificity 0,1,1
   verliert gg. höhere 0,1,2 Descendant-Regel.
3. **CSS-Kommentar-Text-Pitfall (M1dt Pattern 8):** Keine `\.klasse { property: value }`
   im Kommentar — bricht cssBlock-Helper.
4. **M1ds-Text-Drift-Pitfall:** "Wähle eine Karte"-Text-Anpassung
   erfordert ggf. Migration von M1d*-Tests, falls diese den Original-Text
   exakt matchen. Pre-Audit: `rg "Spiele zuerst eine Handkarte" src/`.

## Workflow

1. RED-Tests schreiben (7 RED-Tests in eigener Datei)
2. Targeted Suite: `npx vitest run src/App.m2x_brettrand_hand_hero.test.tsx` — alle rot
3. CSS-Erweiterung in `src/App.css` (route-scoped, ~50 Zeilen)
4. Kleine Text-Anpassung in `WaldtanzArenazugknopf.tsx` (1 Zeile)
5. Targeted Suite: alle grün
6. Smoke-Script schreiben + smoke-wiring in `package.json`
7. Smoke-Wiring-RED-Tests in `src/App.m2x_smoke_wiring.test.ts`
8. `npm test -- --run` — prüfen, dass keine pre-existing Tests gebrochen
9. `npm run typecheck`, `npm run lint`, `npm run build`
10. Commit, Push, Vercel Deploy, Production-Smoke
11. `docs/release_status_2026-06-30_m2x.md` + PLAYABILITY_GATE Evidence

## Reviewer

`REVIEWER=NONE` (Codex stdin-block, Kimi 403 rate-limited — Watchdog-Output
vom 30.06.2026 10:31 UTC dokumentiert beide blockiert). Slice lokal
verifiziert, review-blockiert. Re-Review im nächsten Cron-Lauf wenn der
Watchdog wieder einen Reviewer meldet.
