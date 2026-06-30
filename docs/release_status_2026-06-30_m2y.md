# M2y Release-Status — Schlangen-Gegnerlichtung im Leerlauf kompaktifizieren

**Datum:** 30.06.2026
**Slice-ID:** M2y
**Autor:** Hermes (Cron-Lauf autonom)
**Reviewer-Status:** `REVIEWER=NONE` (Watchdog-Output 30.06.2026 13:01 UTC — Codex
stdin-block, Kimi 403 rate-limited). Slice lokal verifiziert, review-blockiert
gemeldet per Schlangentanz-Workflow Pitfall #12. Re-Review im nächsten Cron-Lauf
sobald Watchdog wieder einen verfügbaren Reviewer meldet.
**Migration-Familie:** Half-Finished-Family 10 (Code-Complete-but-Uncommitted).
HEAD vor M2y: `c60a4d8` (M2x). Der M2y-Worktree (CSS + RED-Tests + Smoke +
Wiring + Slice-Plan) war beim Cron-Start bereits vollständig implementiert, aber
nicht committed. Dieser Run hat verifiziert, gefinisht (commit + push + deploy +
live-smoke) und dokumentiert.

## 1. Zusammenfassung

Auf `/game` fällt die riesige leere "Gegner-Schlangen"-Card (~250px hoch,
M1dp-Basis mit `padding: 1rem 1.1rem 1.1rem` + leertext + hinweis-Inhalt) zu
einem kompakten **Hinweis-Banner** (~50-80px) zusammen, sobald keine
generischen Schlangen existieren. Sobald die erste gegnerische Schlange
erscheint, expandiert die Card wieder zur vollen Liste. Reine CSS-only
Visual-Consolidation im route-scoped Block — Engine, JSX, Schlangenbau,
Sonderkarten-Logik bleiben unverändert.

## 2. Warum mittlerer Vertical, nicht Mikro / nicht Big-Bang

- **Nicht Mikro:** Drei sichtbare Stitch-Änderungen am Stück — (1) Empty-State
  wird zu kompaktem Hinweis-Banner (~50px statt 250px), (2) Schlangenlichtung
  gewinnt ~200px Sichtbarkeit zurück, (3) Reduced-Motion-fester Border-Glow
  signalisiert "wartet auf Input".
- **Nicht Big-Bang:** Reine CSS-Route-Scoped-Override, kein JSX-Reorder, keine
  Engine-Änderung, keine neuen Komponenten. Keine Cascade-Risiken über die
  existierenden route-scoped-Blocks hinaus.
- **Passt zu M2-Familie:** M2r (Schlangenlichtung als Forest-Arena),
  M2w (Brettrand-Konsolidierung), M2x (Brettrand-Hand-Hero). M2y schließt die
  Lücke "Empty-State-Box verschwendet Viewport-Platz" ab.

## 3. Rein

- `src/App.css` — 1 route-scoped Block + 4 Sub-Element-Styles + Reduced-Motion-Override
- `package.json` — `smoke:production`-Kette: + `node scripts/m2y_gegnerlichtung_leerlauf_smoke.mjs` als Last-In-Chain
- `src/App.m2y_gegnerlichtung_leerlauf.test.tsx` — 8 RED-Tests
- `scripts/m2y_gegnerlichtung_leerlauf_smoke.mjs` — Production-Smoke mit `sichtInfo()`-Helper
- `src/App.m95_smoke_wiring.test.ts` — M9.5-W5 Last-In-Chain-Assert M2x → M2y migriert
- `docs/slice_plan_2026-06-30_m2y_gegnerlichtung_leerlauf.md` — Slice-Plan
- `docs/PLAYABILITY_GATE.md` — Evidence-Block (M2y)

## 4. Raus

- **Keine Engine-Änderung** (Aktionen, Schlangenbau, Sonderkarten, KI alle unverändert)
- **Keine JSX-Struktur-Änderung** in `WaldtanzGegnerlichtung.tsx` (nur CSS-only, der Empty-State-Text existiert bereits)
- **Keine neuen Komponenten**
- **Keine Cap-Senkung** (M9.5-Cap bleibt)
- **Keine pre-existing-Test-Migration** außer M9.5-W5 (Last-In-Chain auf M2y)

## 5. Akzeptanz-Geometrie

- **Vor M2y:** Empty-Gegnerlichtung-Box ~250px hoch (M1dp-Basis `padding: 1rem 1.1rem 1.1rem` + Inhalt ~200px).
- **Nach M2y:** Compact-Hinweis-Banner **46.8px** hoch (Live-Smoke @ Production 1280x900), 974px breit, Stitch-Stil erhalten (3px forest-green-Border + hard-shadow + 1.25rem border-radius).
- Schlangenlichtung gewinnt ~200px zusätzlichen Viewport-Platz.

## 6. Cascade-Vertrags-Konformität (M1dt-Pitfall-Management)

- **Pre-Audit:** `rg -n "waldtanz-gegnerlichtung" src/App.css` listet 15+ existierende Selektoren (Basis + Sub-Elemente + ggf. route-scoped-Blocks).
- **Additive Anreicherung:** Die neue route-scoped-Regel re-included die M1dp-Basis-Deklarationen (`display:flex`, `flex-direction:column`, `width:100%`, `padding`, `border`, `background`, `box-sizing`) — keine ersetzt, nur zusätzlich `min-height`, `border-radius`, `box-shadow`, `overflow:hidden` für den Compact-Mode.
- **RED-Test M2y:5 validiert Cascade-Safe:** `expect(block).toMatch(/display:\s*flex/)` + `flex-direction:\s*column` + `background\s*:` + `border\s*:`. Test schlägt fehl, falls ein "Simplify"-Pass die Basis-Deklarationen versehentlich entfernt.
- **Populated-State-Schutz:** `:not(:has([class~="waldtanz-gegnerlichtung__liste"]))`-Selektor sorgt dafür, dass die Compact-Override NUR im Empty-State greift. Sobald die erste Schlange erscheint, fallen die Default-Styles zurück.

## 7. Gates (alle grün)

| Gate | Kommando | Ergebnis |
|------|----------|----------|
| Targeted RED | `npx vitest run src/App.m2y_gegnerlichtung_leerlauf.test.tsx` | 8/8 grün |
| Smoke-Wiring | `npx vitest run src/App.m95_smoke_wiring.test.ts` | 5/5 grün (M2y Last-In-Chain OK) |
| Cascade-Adjazenz | `npx vitest run src/App.m1dp_waldtanz_gegnerlichtung.test.tsx` | 11/11 grün (M1dp-Basis nicht gebrochen) |
| Typecheck | `npm run typecheck` | grün |
| Lint | `npm run lint` | grün |
| Build | `npm run build` | grün (dist 425 KB JS + 242 KB CSS) |
| Smoke-Self-Test | `node scripts/m2y_gegnerlichtung_leerlauf_smoke.mjs --self-test` | BASE_URL + Helper-Compile OK |
| Live-Smoke Production | `node scripts/m2y_gegnerlichtung_leerlauf_smoke.mjs` @ `https://schlangentanz-v2.vercel.app/game` | **46.8px kompakt, 974px breit, Titel "Gegner-Schlangen", keine console-/page-errors** |
| Vision-Bestätigung | `vision_analyze` auf `/tmp/m2y_production.png` (1280x900) | Compact-Banner sichtbar, "Gegner-Schlangen" als Titel mit Hinweistext in einer Zeile |

## 8. Bekannte Probleme / Pre-Existing-Failures

`git stash -u + vitest run` auf M2y-Critical-Set zeigt **1 pre-existing Failure**:
- `src/App.m2s_leere_schlangenlichtung_ruhig.test.tsx > M2s:5` — `.schlangen-startgarten` fehlt im DOM. **NICHT durch M2y verursacht** (auch auf HEAD `c60a4d8` rot), gehört zu M2s-Empty-State-Slice. Wird im nächsten M2-Folge-Slice adressiert.

## 9. Nicht-Empfehlung für nächste Läufe

**NICHT im nächsten Lauf die M2y-Cap-Senkung** (`min-height: clamp(2.6rem, 4.2vh, 3.4rem)`) **unter 2.4rem drücken** — der M1dp-Basis-Stil (`display:flex + flex-direction:column`) braucht mindestens 2.4rem Resthöhe, sonst bricht die Hinweiszeile in 2 Zeilen um und verliert den Compact-Banner-Charakter.

Falls das Arenasstein-Cap weiter gesenkt werden soll, muss das als eigenständiger Slice (M2y.1 oder neuer Affordance-Slice) mit eigener Cap-Sum-Audit + Pre-Existing-Migrationen geplant werden (siehe Schlangentanz-Workflow Pitfall #18).

## 10. Commits

- `bb16184` — `M2y: Schlangen-Gegnerlichtung im Leerlauf kompaktifiziert (8 RED-Tests, lokal verifiziert, review-blockiert)` (HEAD nach Push)

## 11. Deploy / Live-Smoke-Beleg

- Vercel Production: `https://schlangentanz-v2.vercel.app` (HEAD `bb16184` deployed, Status Ready, 25s)
- Live-Smoke @ Production: `M2y OK: gegnerlichtung kompakt (46.8px hoch, 974px breit), Titel="Gegner-Schlangen"`
- Vision-Analyse @ Production: Compact-Banner sichtbar, Hinweistext in einer Zeile, Stitch-Stil mit 3px-Border + hard-shadow erhalten

## 12. Nächste Lücke Richtung echtes Spiel

**M2z-Empfehlung (nächster mittlerer Vertical):** Schlangenlichtung-Linke-Spalte `Brettrand-Kompass` (Phasen-Anzeige + Quests) im Leerlauf kompaktifizieren — gleiches Pattern wie M2y (`min-height` clamp auf route-scoped `:not(:has(__liste))`-Block), gewinnt weitere ~100-150px Sichtbarkeit für die Schlangenlichtung zurück. Trigger-Threshold: Card > 150px mit nur "noch leer"-Hinweis.

**Alternativ M2z+ Brettrand-Material-Karten konsolidieren:** Wenn die linke Spalte nach M2y noch > 5 Mini-Cards zeigt, ist M2w-Pattern (Multi-Card-Reihe → konsolidierte 4er-Reihe) der nächste Schritt. Cost: ~13-18 Tool-Calls.

**Strategische Richtung M3 (Lobby/Spielstart):** Nach M2y/M2z ist die `/game`-Brettrand-Mitte visuell aufgeräumt. M3 (Sonniges Nest mit 1-3 KI-Gegnern im Stitch-Stil) kann die Spielerfahrung "Spielstart mit echten Gegnern" liefern — Cost: ~50-80 Tool-Calls (größerer Slice, aber direkt sichtbar spielbar).
