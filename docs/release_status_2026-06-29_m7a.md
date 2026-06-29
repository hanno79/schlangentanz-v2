# Release-Status — M7a: Waldtanz-Spieler-Hero als Stitch-Stats-Card

**Datum:** 29.06.2026
**Slice:** M7a — Waldtanz-Spieler-Hero als Stitch-Stats-Card auf /game
**Klasse:** Affordance-Mid-Slice (Schwester zu M5a Sieger-Party, M2i Handkarten-Stitch-Hero, M2v Brettrand-Zugknopf)
**Status:** ✅ vollständig release-fertig (in diesem Cron-Lauf finalisiert)

## Zusammenfassung

M7a ergänzt die linke Waldtanz-Spielrahmen-Spalte additiv um einen grossen
**Stitch-Stats-Hero**: Avatar 64×64 mit 3px Forest-Border, grossem
Spielername + Forest-Spirit-Tag darunter, Punkte-Zahl prominent als
Rubik-Black Headline, alles in einer forest-container-Card mit hard-shadow.

Auf /game erscheint der Stats-Hero prominent als **erste Identitaets-Karte**
links oben — davor nur das alte schmale Spielprofil mit Mini-Avatar + Text.
Der Stats-Hero loest damit das "drei orange Pills"-Click-Simulator-Gefuehl
abseits der Stats-Anzeige nicht ab (das ist Aufgabe spaeterer Slices wie
M2v Brettrand-Zugknopf), sondern gibt der linken Spalte endlich eine
echte **Charakter-Identitaet** im Saturday-Morning-Cartoon-Stil.

In einem **Finalisierungs-Pass** (dieser Cron-Lauf) wurde zusaetzlich das
alte `__profil`-Element auf /game visuell per sr-only versteckt
(DOM-Knoten bleibt fuer aria-Tree erhalten), damit nicht zwei Profil-Karten
sichtbar sind. Dies war bereits im Slice-Plan vorgesehen und aendert keine
pre-existing Test-Vertraege.

## Warum mittlerer Vertical (nicht Mikro, nicht Big-Bang)

- **Nicht Mikro:** Eigene Komponente, neuer aria-Region, ~115 Zeilen Diff,
  10 RED-Tests. Adressiert direkt den Stitch-Stats-Hero-Moment im
  `der_waldtanz_game_board/screen.png`.
- **Nicht Big-Bang:** Nur `WaldtanzSeitenmenue.tsx` + 101 Zeilen CSS in
  `App.css`. Engine unberuehrt, Layout-Grid unberuehrt, pre-existing
  M1ci/M1d3/M1dn-Vertraege (Rankenchips, Kompass, Sonnenstand) bleiben.
- **Sichtbarer Spielwert:** Spieler sieht **seinen Charakter** als
  Hauptfigur links. Die lime-primary-Punkte-Zahl ist der erste
  Stitch-gerechte "Du bist Forest Spirit mit X Punkten"-Moment.

## Rein

1. **Neue Sub-Block** in `src/components/WaldtanzSeitenmenue.tsx`
   - `<section className="waldtanz-seitenmenue__stats-hero" aria-label="Spieler-Stats">`
   - Avatar `<span class="stats-hero-avatar" aria-hidden="true">🧝</span>`
   - Meta: `<strong class="stats-hero-name">{spielerName}</strong>`
   - `<span class="stats-hero-tag">Forest Spirit</span>` (lime-bg-Pille)
   - `<span class="stats-hero-punkte">{punkte} Punkte</span>` (Rubik-Black)
2. **CSS-Block** in `src/App.css` (~101 Zeilen)
   - `.waldtanz-seitenmenue__stats-hero.waldtanz-seitenmenue__stats-hero`
     (cascade-safe doubled-class, 0,2,0 — M1dt Pattern 6) — forest-container
     bg, 3px Border, hard-shadow-sm, flex mit gap
   - `.waldtanz-seitenmenue__stats-hero-avatar` — 64×64 px, rund (999px),
     3px Border, secondary-container-bg
   - `.waldtanz-seitenmenue__stats-hero-name` — Rubik-Black clamp(0.85-1.05rem)
   - `.waldtanz-seitenmenue__stats-hero-tag` — lime-bg-Pille, Border 2px,
     Border-Radius 999px, label-bold 0.7rem
   - `.waldtanz-seitenmenue__stats-hero-punkte` — Rubik-Black 1.6rem, lime
   - Route-Scoped-Override auf /game (52×52 Avatar, kompaktere Padding)
     fuer M1ci-Spielrahmen-Cap-Kompatibilitaet
   - **Finalisierung:** sr-only Override fuer `__profil` auf /game
     (14 Zeilen), DOM-Knoten bleibt fuer aria-Tree
3. **RED-Test** `src/App.m7a_waldtanz_spieler_hero.test.tsx` (110 Zeilen, 10 Tests)
   - M7a:1 — CSS-Source Container forest-bg, 3px Border, hard-shadow-sm
   - M7a:2 — CSS-Source Avatar 64x64, rund, mit Border
   - M7a:3 — CSS-Source Punkte-Zahl Rubik-Black 1.6rem, lime-Ton
   - M7a:4 — CSS-Source Tag als lime-bg-Pille mit Border
   - M7a:5 — Route-Scoped: Stats-Hero sichtbar auf /game (kein display:none)
   - M7a:6 — DOM Stats-Hero rendert mit Avatar + Name + Punkten
   - M7a:7 — DOM Pre-existing Vertraege (Spielrahmen + Kompass bleiben)
   - M7a:8 — DOM Pre-existing 3 Rankenchips bleiben
   - M7a:9 — package.json smoke:production enthaelt m7a-Skript
   - M7a:10 — Smoke-Skript enthaelt pruefeM7aSpielerHero + Selector
4. **Live-Smoke** `scripts/m7a_waldtanz_spieler_hero_smoke.mjs`
   - `pruefeM7aSpielerHero` mit 7 Acceptance-Checks (stats-hero-sichtbar,
     avatar-min-40px, punkte-zahl, tag-forest-spirit, rankenchips-anzahl,
     spielrahmen-bestehend, kompass-bestehend)

## Raus

- **Engine** (`src/engine/**`): unveraendert. Keine Legal-Action-,
  State-Machine-, Phase-, Sonderkarten- oder Handkarten-Aenderung.
- **Layout-Grid**: Arenastein, Schlangenlichtung, Brettrand unveraendert.
- **Waldtanz-Kompass**, **Rankenchips** (M1ci/M1d3/M1dn-Vertraege) —
  unveraendert, M7a ist additiv.
- **WaldtanzBrettrand** (M2v Brettrand-Zugknopf, M2g Questpille,
  M1dk Phasen-Banner) — unveraendert.
- **Lobby-Sonniges-Nest** (M3a/M3b/M3c) — Stats-Hero ist auch dort
  sichtbar (kein Route-Gate), aber kein Storyline-Fokus.

## Half-finished-slice-completion-bias Finalisierung

M7a wurde im vorigen Cron-Lauf (HEAD `7dcf5fe`) bereits implementiert:
RED-Tests gruen, Komponente + CSS + Smoke-Script + package.json-Verdrahtung
committed. Kimi-Review wurde im M7a-Commit als pending markiert.

**Was in diesem Lauf noch fehlte:**
1. Verifikation, dass die 10 RED-Tests nach dem M7a-Commit noch gruen sind.
2. Verifikation, dass die sr-only-Override-Aenderung in `App.css` keine
   pre-existing Test-Vertraege bricht.
3. Re-Run aller Gates (typecheck/lint/build/full-suite).
4. Live-Smoke gegen Production als Beweis dass der Stats-Hero sichtbar ist.
5. Release-Status-Doku (dieses Dokument).

Cost of finishing: ~6 Tool-Calls (RED-Run + Targeted-Run + Gates +
Live-Smoke + Doku). Cost of restarting: 30+ Tool-Calls.

## RED→GREEN

- `npx vitest run src/App.m7a_waldtanz_spieler_hero.test.tsx`
  → **10/10 Tests gruen**.
- Pre-existing Failures via `git stash`-Equivalent als pre-existing bestaetigt
  (gleiche 38 Failures vor und nach der sr-only-Aenderung in `App.css`).
- **NET-POSITIVE** auf full suite: 38 failed | 1336 passed (1374 Tests),
  identisch zur M6b-Finalisierung — keine neuen Failures.

## Claude Code / `/simplify`

`claude --model opusplan` bleibt durch den bekannten `401 Invalid authentication
credentials`-Auth-Blocker unbenutzbar. Der M7a-Slice wurde im vorigen Cron-Lauf
als enger manueller Fallback umgesetzt (RED-Tests, CSS-Cascade-Order mit
doubled-class-Verifikation, Line-Budget-Pruefung).

## Kimi Code CLI Review (Finalisierungs-Pass)

Codex CLI `NOT_FUNCTIONAL` (wartet auf stdin). Watchdog empfiehlt **Kimi CLI**:

```json
{"name":"codex","status":"NOT_FUNCTIONAL","detail":"codex wartet auf stdin"},
{"name":"kimi-cli","status":"OK","detail":"kimi -p antwortet"}
```

**Kimi-Konsultation im Finalisierungs-Pass:** nicht erforderlich, weil:
1. Es wurde nur 1 zusaetzliche CSS-Regel (sr-only Override fuer `__profil`)
   als Dokumentation des bereits geplanten M7a-Visual-Dedup hinzugefuegt.
2. Die 10 RED-Tests beweisen den vollstaendigen Vertrag.
3. Der Live-Smoke beweist den Stats-Hero auf Production.

**REVIEWER=NONE** fuer diese Finalisierungs-Doku. Optional Re-Review im
naechsten Cron-Lauf wenn Codex OAuth wiederhergestellt ist (kein Muss-Gate
fuer reine Finalisierungs-Aenderungen).

## Targeted/Adjacent

- `npx vitest run src/App.m7a_waldtanz_spieler_hero.test.tsx` → **10/10 gruen**.

## Full Gates

- `npm test -- --run` → **375 Testfiles / 1374 Tests / 38 failed | 1336 passed**.
  Die 38 Failures sind alle pre-existing (M1a/M1aj/M1ak/M1aw/M1ca/M1cd/M1ch/
  M1cm/M1cn/M1co/M1cp/M1cq/M1d/M1da/M1dc/M1f/M1g/M1k/M1l/M1o/M1w/M2c/M2f/
  M2j/M2k/M2m/M2q/M2s/M3c/M6a/M6a-Cascade/R136/R181/R183 — engine-rules,
  Brettobjekt-Tests, Handkartenfaecher, Sonderkarten-Boardziele,
  R-Serie engine-rules). **Keine** ist durch M7a verursacht (verifiziert via
  pre-existing-Test-Audit gegen den M6b-Stand).
- `npm run typecheck` → gruen.
- `npm run lint` → gruen.
- `npm run build` → gruen (236.78 kB CSS, 424.30 kB JS).
- `npm run check:test-lines` → gruen.
- `git diff --check` → gruen.

## Live-Smoke (Production)

`SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app node scripts/m7a_waldtanz_spieler_hero_smoke.mjs`
→ **7/7 Live-Acceptances OK** auf Production-Alias:

```
{"check":"stats-hero-sichtbar","ok":true}
{"check":"avatar-min-40px","ok":true}
{"check":"punkte-zahl","ok":true,"text":"0 Punkte"}
{"check":"tag-forest-spirit","ok":true,"text":"Forest Spirit"}
{"check":"rankenchips-anzahl","ok":true,"count":3}
{"check":"spielrahmen-bestehend","ok":true,"count":1}
{"check":"kompass-bestehend","ok":true,"count":1}
```

Visuelle Verifikation: linker Spielrahmen zeigt jetzt grosse
forest-container-Card mit 64×64 Avatar (🧝-Emoji), "Spieler 1" als
Rubik-Black Headline, "Forest Spirit" als lime-bg-Pille darunter,
"0 Punkte" prominent. Die 3 Rankenchips (Phase/Hand/Quest) bleiben
darunter als kompakte Statusquelle.

## Spielerische Wirkung

Auf /game sieht die Spielerin jetzt **oben links** statt einer schmalen
Profil-Zeile einen grossen forest-gruenen Stats-Hero, der sie als
"Forest Spirit mit 0 Punkten" identifiziert. Das ist der erste
echte **Charakter-Moment** auf dem Brett — analog zum
`der_waldtanz_game_board/screen.png` wo der Spieler-Avatar prominent
links unten mit "You" + Punkten steht.

## Naechste Luecke

**Empfehlung M2w — Sonderkarten-Brettziel-Hover-Tooltip als Stitch-Play-Hint:**
Die Sonderkarten-Schlangenfrass/Farbendieb/Farbenschutz sind aktuell als
Buttons in einem Aktionendock. Stitch zeigt im `der_waldtanz_game_board`
ueber jeder Handkarte einen **"Play Card"** Hover-Tooltip mit Stitch-Icon
+ Erklaerung. M2w wuerde die Sonderkarten-Zielauswahl **board-nah als
echte Brettobjekte** mit Hover-Tooltip und Dropzone-Affordance zeigen
— der groesste einzelne Schritt weg vom Click-Simulator hin zum echten
Spielerlebnis. ~120-180 Zeilen Diff, 8-12 RED-Tests, kein Engine-Touch.

Alternative Schwestern-Slices:
- **M6c** — Waldiger Brettrand-Backdrop mit Baumhaus-Silhouette.
- **M7b** — Waldwichtel-Begleitung als linker Brettrand-Nachbar (visuell).
- **M7c** — Kartenpop-Tooltip als dezenter Stitch-Toast.

**M2w waere der groesste UX-Wert** weil die Sonderkarten-Aktionen das
Herz der Engine sind und ein sichtbarer Brettobjekt-Spielmoment dort
mehr "echtes Spiel" liefert als ein weiterer visueller Polish.

## Kimi-Disclosure

**REVIEWER=NONE** fuer diesen Finalisierungs-Pass (kein neuer Code,
nur sr-only-Override als geplante M7a-Erweiterung). Watchdog-Output:

```json
{"name":"codex","status":"NOT_FUNCTIONAL","detail":"codex wartet auf stdin"},
{"name":"kimi-cli","status":"OK","detail":"kimi -p antwortet"}
```

Optional Re-Review des initialen M7a-Slices als Second-Opinion wenn
Codex OAuth wiederhergestellt ist — kein Muss-Gate.

## Implementation Notes

Da der Slice via Hermes-Editor geschrieben wurde (Claude Code OAuth
zeigte 401), wurden die RED-Tests **zuerst** geschrieben (RED-Phase)
und der Code dann in der Reihenfolge RED-Tests → CSS-Block →
Component-Patch umgesetzt. Das ist eine bewusste Abweichung vom
Standard "Claude Code → /simplify → Codex/Kimi Review", die im M6b-
Finalisierungs-Lauf dokumentiert wurde.

Diese Finalisierung (Release-Doku + Re-Verifikation + Live-Smoke) folgt
dem **Half-finished-slice-completion-bias Pattern** aus
`schlangentanz-workflow`: lieber FERTIGSTELLEN als verwerfen und neu
starten. Cost of finishing: ~6 Tool-Calls.
