# M3a — Sonniges Nest beleben (Stitch-Lobby-Animation)

> **Status:** Release complete (cron-run 24.06.2026).
> **Typ:** Mittlerer Vertical (UI/UX, Lobby-Spielerlebnis), kein Engine-Touchpoint.
> **Vorgänger:** M3 (Sonniges Nest Lobby) + M4c (Sieger-Party).
> **Nachfolger:** offen.

## Was sichtbar spielbarer wurde

Die Lobby (Startbildschirm `/`) war bislang statisch: ein großes Hero, ein
festes Codeschild und wartende Slots ohne Leben. Mit M3a wird das **sonnige
Nest zu einem lebendigen Stitch-Eingang**:

- **Schwingendes Codeschild:** Das Holz-Codeschild wippt sanft (`lobby-sway`,
  ±1,5°) wie ein am Baum hängendes Schild — vermittelt Wald-Atmosphäre.
- **Pulsierende wartende Slots:** Freie KI-Plätze atmen (`lobby-pulse`,
  Opazität 1 ↔ 0,45) und signalisieren „hier kann jemand dazu kommen".
- **Host-Badge:** Der eigene Slot trägt einen goldenen ★-Badge (dekcorativ,
  `aria-hidden`) — der Host ist auf einen Blick erkennbar.
- **Play-Icon auf Start-Buttons:** Jeder Start-Button zeigt ein ▶ vor dem
  Label — klarer handlungs-auffordernder Charakter statt reiner Textbutton.
- **Kompakter Horizontal-Hero:** Das Hero wird vom vollbreiten Block zu einer
  flexiblen Horizontal-Reihe (Titel + Eyebrow + Feature-Pills nebeneinander),
  damit die Lobby im Erstbild sichtbarer und kompakter wird.
- **Reduced-Motion:** Codeschild- und Slot-Animationen stoppen sauber bei
  `prefers-reduced-motion: reduce`.

## Slice-Scope

### Rein
- `SonnigesNestLobby.tsx`: Host-Badge-Span (★, `aria-hidden`, `title="Host"`),
  Play-Icon-Span (`lobby-startbutton__icon`, `aria-hidden`) vor jedem Label.
- `App.css`: `.hero` als `display:flex; flex-direction:row`, `.hero .app-title`
  auf `width:auto` (Titel bricht nicht mehr allein), Hero-Listen-/Pillen-Styles,
  `.lobby-code-schild` sway-Animation, `.lobby-slot--wartet` pulse-Animation,
  `.lobby-slot__badge`, `.lobby-startbutton__icon`, `@keyframes lobby-sway` /
  `lobby-pulse`, `@media (prefers-reduced-motion: reduce)` für beide Animationen.

### Raus (explizit)
- Keine Engine-Änderung.
- Keine Spielzustands- oder Aktionsänderung.
- Keine Lobby-Strukturbrechung (Region „Das sonnige Nest", Slot-Liste,
  Start-Buttons bleiben erhalten; nur additive Animation/Badges/Icons).
- Kein Mobile/Tablet-Refactor.

## RED → GREEN

### RED-Tests
- `src/App.m3a_lobby_beleben.test.tsx` (7 Tests):
  - Schwingendes Codeschild (CSS `animation` auf `.lobby-code-schild`)
  - Pulsierende wartende Slots (CSS `animation` auf
    `.lobby-slot--wartet .lobby-slot__hoehle`)
  - Host-Badge im Host-Slot (`.lobby-slot__badge`)
  - Start-Buttons mit Play-Icon (`.lobby-startbutton__icon`)
  - Kompakter Hero (`flex-direction: row` auf `.hero`)
  - Hero-Verträge bewahrt (h1 + Feature-Texte im Hero)
  - `prefers-reduced-motion` stoppt Lobby-Animationen
- `src/App.m3_sonniges_nest_lobby.test.tsx`: TextContent-Assertion um das
  Play-Icon bereinigt (`▶` vor den Start-Labels).

### Claude Code / `/simplify`
- `claude --model opusplan` blieb durch den bekannten
  `401 Invalid authentication credentials`-Blocker unbenutzbar.
- Der Slice wurde als enger manueller Fallback umgesetzt: objektiver RED-Test,
  Diff-/CSS-Cascade-/Line-Budget-Selbstcheck, lokale Browser-Verifikation der
  Hero-Kompaktheit.

### Code-Review: Kimi Code CLI (statt Codex)
- Codex OAuth hatte `usage limit` (gültig bis 25.06.2026 19:07 UTC); Kimi Code
  CLI `0.18.x` als Review-Fallback, review-only, mit identischem Kontext wie
  Codex erhalten hätte (Diff inkl. untracked Test, Test-Output, Authority =
  Stitch DESIGN.md + R117).
- Ergebnis: **BLOCKERS: None**.
- Behandelte NON-BLOCKERS (in-Slice gefixt):
  - `.hero .app-title` erbt `width: min(100%,1180px)` → zwingt h1 auf volle
    Zeile. Fix: `.hero .app-title { width: auto; }` — macht die
    „horizontal kompakt"-Aussage real.
  - Host-Badge `aria-label="Host"` doppelt „Host Slippy Host" → `aria-hidden`
    (Dekoration, Host-Status aus „Slippy Host"-Text ersichtlich).
  - Play-Icon `role="img"` überflüssig bei `aria-hidden` → entfernt;
    Test-Query auf Klassen-Selektor umgestellt.
- Disclosure: „Code-Review: Kimi Code CLI 0.18.x statt Codex CLI, weil Codex
  OAuth usage limit bis 25.06.2026 19:07 UTC."

## Gates (alle grün)

- [x] **Full Suite:** `npm test -- --run` → 329 Test Files, **1060 Tests passed**
- [x] **Test-Lines:** `npm run check:test-lines` → alle unter 500
- [x] **Typecheck:** `npm run typecheck` passed
- [x] **Lint:** `npm run lint` passed
- [x] **Build:** `npm run build` → 195.79 kB CSS, 398.55 kB JS
- [x] **Diff-Hygiene:** `git diff --check` clean
- [x] **Line-Budget:** `App.tsx` = 494 Zeilen, `SonnigesNestLobby.tsx` = 66 Zeilen

## Deploy / Smoke

- [x] **Commit:** `226587e — M3a: Sonniges Nest beleben`
- [x] **Push:** `origin/main` aktualisiert (`294150d..226587e`)
- [x] **Vercel Production Deploy:** `READY` in 19s, aliased to
  `https://schlangentanz-v2.vercel.app`
- [x] **M3a Lobby-Vertrag (produktionsverifiziert):**
  Repo-lokaler Playwright-Probe bestätigt auf der Live-Alias:
  - `heroFlex: "row"` (kompakter Horizontal-Hero)
  - `titleWidth: "219px"` (Titel nicht mehr vollbreit — `width:auto`-Fix wirkt)
  - `badgePresent: true`, `badgeAriaHidden: "true"` (Host-Badge dekorativ)
  - `iconPresent: true` (Play-Icon auf Start-Buttons)
  - `schildAnim: "lobby-sway"` (schwingendes Codeschild)
  - Console-/Page-Errors: keine
- [ ] **Kanonische `npm run smoke:production`-Kette:** **pre-existing rot**
  (nicht durch M3a verursacht). Siehe „Bekannte Pre-Existing-Schulden".

## Bekannte Pre-Existing-Schulden (nicht durch M3a verursacht)

- **`pruefeM1bgSonnenstand` schlägt fehl (`schubladen: 2 < 5`):** Die kanonische
  `/game`-Smoke-Kette bricht seit den M1d1/M1d2-Arena-Refactor-Commits
  (bereits auf `origin/main` vor dieser Session) ab, weil nur noch 2
  `.debug-gruppe-entwicklungsdaten--spielschublade`-Schubladen gerendert werden
  statt der erwarteten ≥5. M3a hat ausschließlich die Lobby `/` berührt
  (`App.css` Hero/Lobby-Animationen, `SonnigesNestLobby.tsx` Badge/Icon, Tests);
  die `kompakteSchublade`-Renderlogik in `App.tsx`/Panels ist von M3a unangetastet.
  Die M3a-Lobby-Verträge sind davon unbeeinträchtigt und produktionsgrün.
  Sollte in einem Folge-Slice (Schwellenwert anpassen oder fehlende
  Debug-Schubladen wiederherstellen) behoben werden.

## Commits

- `226587e` M3a: Sonniges Nest beleben — schwingendes Codeschild, pulsierende
  Slots, Host-Badge, Play-Icons, kompakter Hero

## Nächster mittlerer Slice

1. **M1 — Waldtanz Game Board weiter:** Nächster sichtbarer Stitch-Vertical
   auf `/game` (z. B. Schlangen-Lichtung als lebendiger Spielmittelpunkt,
   kompakte Seitenleisten, oder Status/HUD als board-nahe Anzeige statt
   debug-lastige Textpanels).
2. **M5 — E2E-Playability:** Vollständige Partie von Lobby bis Sieger-Party
   gegen die Spec verifizieren.
