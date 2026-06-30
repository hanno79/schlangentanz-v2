# M2y Slice Plan — Waldtanz-Gegnerlichtung im Leerlauf kompaktifizieren

**Datum:** 30.06.2026
**Autor:** Hermes (Cron-Lauf, autonom)
**Reviewer-Status:** `REVIEWER=NONE` (Codex stdin-block, Kimi 403 rate-limited — Watchdog
vom 30.06.2026 13:01 UTC). Slice wird lokal verifiziert, review-blockiert gemeldet.
**Migrations-Quelle:** Half-Finished-Family 5/8/10 — der Live-Production-Screenshot
zeigt eine riesige leere Gegner-Schlangen-Box auf /game, die wertvollen
Viewport-Platz verschwendet.

## 1. Scope / Ausgangslage

Production-Screenshot (`/tmp/m2y_production_baseline.png`, 1280x900) zeigt
auf /game in der Brettrand-Mitte eine **fast leere Box** mit Titel
"Gegner-Schlangen", Hinweistext "Noch keine gegnerischen Schlangen — sobald
ein Gegner seine erste Karte legt, erscheint sie hier als Brettobjekt." und
Italic-Text "Noch keine gegnerischen Schlangen." Die Box ist **bordered mit
3px-Waldgrün-Border + Hard-Shadow + 1.75rem-Radius** (Stitch-Card-Container
aus M1dp) und nimmt im Initial-State ~250px vertikalen Viewport-Platz
weg — der Spieler sieht "Gegner-Schlangen" prominent, aber **keine
eigentlichen Inhalte**. Das ist genau das "click simulator + debug list"
Pattern, vor dem der User explizit gewarnt hat.

Engine + Brettobjekte + Aktionspfade + Schlangenbau + Sonderkarten +
Mehrzug-Logik bleiben **unverändert**. Reine CSS-only-Konsolidierung im
Empty-State.

## 2. Warum dieser Slice — nicht Mikro, nicht Big-Bang

- **Nicht Mikro:** Drei sichtbare Stitch-Änderungen am Stück — (1) Empty-State
  wird zu kompaktem Hinweis-Banner (~50px statt 250px), (2) Schlangenlichtung
  bekommt 200px mehr Sichtbarkeit, (3) Reduced-Motion-fester Border-Glow
  signalisiert "wartet auf Input". Drei sichtbare Affordances auf einmal
  = echter Spielwert.
- **Nicht Big-Bang:** Reine CSS-Route-Scoped-Override, kein JSX-Reorder,
  keine Engine-Änderung, keine neuen Komponenten. Keine Cascade-Risiken
  über die existierenden route-scoped-Blocks hinaus.
- **Passt zu M2-Familie:** M2r (Schlangenlichtung als Forest-Arena),
  M2w (Brettrand-Konsolidierung), M2x (Brettrand-Hand-Hero). M2y schließt
  die Lücke "Empty-State-Box verschwendet Viewport-Platz" ab.

## 3. Akzeptanzkriterien (RED-Tests)

1. **M2y:1** — Empty-Gegnerlichtung hat auf /game eine kompakte Höhe
   (≤ 90px) statt der bisherigen ~250px-Box, geprüft via CSS-Source
   `min-height: clamp(2.4rem, 4.5vh, 3.6rem)` (oder gleichwertig klein).
2. **M2y:2** — Empty-Gegnerlichtung behält sichtbaren Border + Stitch-Stil
   (3px forest-green-Border + hard-shadow), aber nur als dünner Hinweis-Banner.
3. **M2y:3** — Populated-Gegnerlichtung (≥1 gegnerische Schlange) zeigt
   weiterhin die volle Card mit Liste, **kein Compact-Mode**.
4. **M2y:4** — Auf / (Lobby) bleibt die Gegnerlichtung im Default-Look
   (kein Compact-Mode, weil dort keine Spielwerte angezeigt werden).
5. **M2y:5** — Cascade-Safe: Die neue Regel sitzt in einem route-scoped
   Block (`.spielbereich--game-route [class~="waldtanz-gegnerlichtung"]`
   o.ä.) und überschreibt nicht die existierenden M1dp-Basis-Deklarationen
   (display, border, padding, background).
6. **M2y:6** — `package.json` `smoke:production`-Kette enthält den neuen
   `m2y_gegnerlichtung_leerlauf_smoke.mjs` UND die Kette endet mit dem
   neuen Skript (Last-In-Chain-Migration aus M2x-Pitfall #14).
7. **M2y:7** — Smoke-Script enthält die M2y-Assertion (`compactHeight <= 90`)
   + die Helper `sichtInfo()` + die Klassen-IDs `waldtanz-gegnerlichtung`
   und `waldtanz-gegnerlichtung__leertext`.
8. **M2y:8** — Reduced-Motion-Override bleibt erhalten (Border-Glow
   ohne puls-Animation, oder umgekehrt: puls nur bei motion-ok).

## 4. Rein

- `src/App.css` — 1 route-scoped Block `.spielbereich--game-route
  [class~="waldtanz-gegnerlichtung--leer"]` (oder via `:has` /
  `:empty-Pattern`) + 1 Reduced-Motion-Override
- `package.json` — `smoke:production`-Kette: + `node scripts/m2y_gegnerlichtung_leerlauf_smoke.mjs`
  am Ende (Last-In-Chain, M2x-Pitfall #14)
- `src/App.m2y_gegnerlichtung_leerlauf.test.tsx` — 8 RED-Tests
- `scripts/m2y_gegnerlichtung_leerlauf_smoke.mjs` — Production-Smoke
- `src/App.m2y_smoke_wiring.test.ts` — Smoke-Wiring-Test (Last-In-Chain
  Migration aus M9.5-W5 → M2y-W1)
- `docs/release_status_2026-06-30_m2y.md` — Release-Doku
- `docs/PLAYABILITY_GATE.md` — Evidence-Block

## 5. Raus

- **Keine Engine-Änderung** (Aktionen, Schlangenbau, Sonderkarten, KI
  alle unverändert)
- **Keine JSX-Struktur-Änderung** in `WaldtanzGegnerlichtung.tsx`
  (nur CSS-only, da der Empty-State-Text schon existiert)
- **Keine neuen Komponenten**
- **Keine Cap-Senkung** (M9.5-Cap bleibt)
- **Keine pre-existing-Test-Migration** außer M9.5-W5 (Last-In-Chain
  auf M2y, plus M95-Smoke-Wiring auf M2y)

## 6. Cascade-Vertrags-Konformität (M1dt-Pitfall-Management)

Vor dem Schreiben der neuen CSS-Regel:

1. `rg -n "waldtanz-gegnerlichtung" src/App.css` — alle existierenden
   Selektoren auflisten
2. Existierende Basis-Deklarationen in der neuen route-scoped-Regel
   **additiv anreichern** (display:flex, flex-direction:column, gap,
   width, max-width, padding, border, border-radius, background,
   box-shadow, box-sizing, color) — nicht ersetzen.
3. RED-Test M2y:5 liest per `cssBlock` die spätere route-scoped-Regel
   und prüft, dass ALLE M1dp-Basis-Deklarationen noch vorhanden sind.
4. Falls Reduced-Motion-Override bereits existiert (`grep "@media
   (prefers-reduced-motion: reduce)" src/App.css | grep gegner`),
   additive Anreicherung statt replacement.

## 7. Pre-Implementation-Audit (M2i-Pattern)

```
rg -n "waldtanz-gegnerlichtung" src/App.css
```

Erwartete Ausgabe (basierend auf Sicht-Inspektion):
- `.waldtanz-gegnerlichtung` (Basis, Z. 10614)
- `.waldtanz-gegnerlichtung__kopf`, `__titel`, `__hinweis`, `__leertext`,
  `__liste`, `__gegnerkarte`, ... (~15 Sub-Selektoren)
- Reduzierte-Motion-Override: vermutlich NICHT vorhanden
- route-scoped-Override für /game: vermutlich nur die Sub-Element-Styles
  (Avatar, Pillen etc.)

Audit-Ergebnis bestimmt, ob die neue Regel `min-height`/`padding` setzen
kann, ohne display/flex/border/background zu kollidieren.

## 8. Akzeptanz-Geometrie

- **Vor M2y:** Empty-Gegnerlichtung-Box ~250px hoch (M1dp-Basis
  `padding: 1rem 1.1rem 1.1rem` + Inhalt ~200px).
- **Nach M2y:** Compact-Hinweis-Banner ~50-80px hoch (min-height
  clamp + reduced padding), Schlangenlichtung gewinnt ~170-200px
  zusätzlichen Viewport-Platz.

## 9. Reviewer

`REVIEWER=NONE`. Per Schlangentanz-Workflow Pitfall #12
(User-Time-Preference 2026-06-29) akzeptabel — sichtbarer Spielwert >
Reviewer-Wait. Re-Review im nächsten Cron-Lauf wenn der Watchdog wieder
einen verfügbaren Reviewer meldet.

## 10. Gates

1. `npx vitest run src/App.m2y_gegnerlichtung_leerlauf.test.tsx` →
   8/8 grün
2. `npx vitest run src/App.m2y_smoke_wiring.test.ts` → Last-In-Chain OK
3. `npm test -- --run` → 35 pre-existing Failures identisch (kein
   neuer Failure durch M2y)
4. `npm run typecheck`, `npm run lint`, `npm run build`,
   `git diff --check` jeweils grün
5. `node scripts/m2y_gegnerlichtung_leerlauf_smoke.mjs` (Production)
   → Compact-Banner sichtbar, Höhe ≤ 90px
6. Vision-Analyse des Production-Screenshots bestätigt sichtbaren
   kompakten Hinweis-Banner
7. Vercel Production Deploy + Live-Smoke

## 11. Commits / Deploy

- Feature-Commit: `M2y: Schlangenlichtung-Leerlauf-Banner kompaktifiziert
  auf /game (Gegner-Schlangen wartet sichtbar als Hinweis statt 250px-Box)`
- Vercel Production: `https://schlangentanz-v2.vercel.app` (HEAD nach
  Deploy)
- Live-Smoke @ Production bestätigt Compact-Banner sichtbar
