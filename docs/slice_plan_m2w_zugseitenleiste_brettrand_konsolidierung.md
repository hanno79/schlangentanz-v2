# M2w — Brettrand-Zugseitenleiste konsolidieren (Stitch-Waldtanz-Brett)

**Datum:** 30.06.2026
**Slice-ID:** M2w
**Slice-Klasse:** M2-Visual-Consolidation + Stitch-Affordance-Hero (Fortsetzung der M2e/M2g/M2r/M2s-Reihe; Schwester-Slice zu M2i Handkarten-Hero, M2v Brettrand-Zugknopf, M2u Hand-Drop-Glow)
**Autor:** Hermes autonomer Cron-Lauf
**Reviewer:** `REVIEWER=NONE` (Codex OAuth usage limit, Kimi Code CLI billing-cycle limit, beide per Watchdog am 30.06.2026 07:31 UTC blockiert. Per Schlangentanz-Workflow Pitfall #12 (User-Time-Preference 2026-06-29) akzeptabel: Hanno bevorzugt sichtbare Spielwert-Deliveries ueber Reviewer-Sauberkeit. Re-Review sobald ein Reviewer verfuegbar ist.)

## Problem (mit Beweisen)

Auf /game rendert die `.waldtanz-zugseitenleiste` (1031×72 px unter der Schlangenlichtung) **7 Children als gleichberechtigte Mini-Cards** in einer einzigen Reihe. Das fuehlt sich an wie ein Debug-Dashboard, nicht wie ein Spielbrett:

Live-Probe Post-M8b am 2026-06-30 (`scripts/_probe_zugleiste.mjs`, Production-Alias `https://schlangentanz-v2.vercel.app/game`):

```
Zugseitenleiste: 1031x72 @ 193,743
├── DIV .waldtanz-unterholzleiste     w=108  h=90  ("Eine spielbare Aktion auswaehlen" — dupliziert in Spielerfuehrung)
├── SECTION .zugpfad--waldsteine      w=146  h=90  (Zugreihenfolge)
├── ASIDE .waldtanz-spielhilfe        w=146  h=90  (Aktiver-Spieler-Zugtafel + Spielerfuehrung — die wertvolle Karte)
├── SECTION .waldtanz-partie-uhr      w=146  h=90  (100 Karten bis Sieger-Party — identisch zur Partiefortschritt-Card)
├── SECTION .ki-zug-buehne--brettnah  w=146  h=90  (Gegnerzug-Status)
├── SECTION .zugkompass               w=146  h=90  (Du bist dran / Zugknopf)
└── SECTION .partiefortschritt        w=146  h=90  (100 Karten — identisch zur Spieluhr)
```

**Konsequenz:** 7 schmale 108-146 px Cards in einer Reihe, jede 90 px hoch, viele davon leer oder redundant. Sieht aus wie eine Tabellen-Kopfleiste aus einem alten CMS, nicht wie der untere Brettrand eines Waldtanz-Spiels. Stitch-Referenz `/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/code.html` zeigt den Brettrand als **2-3 hero-chunkige Karten mit hard-shadow-sm + 3px-dark-forest-border**:
- links: Phase-Quest-Pille (wir haben das via M2g/M2r als Brettrand-Questpille)
- mitte: Hand-Facher mit End-Turn-Pille rechts daneben
- rechts: Player-Stats-Card oder Aktionsknopf

**Was Stitch zeigt, was wir nicht haben:** die 7-Card-Reihe gibt es in der Referenz nicht — die ist eine hausgemachte Debug-Ansammlung.

## Stitch-Referenz

`/tmp/schlangentanz_stitch_design/stitch/der_waldtanz_game_board/code.html` Z. 540-620: Der Aktions-Block ist eine **einzelne hero-chunkige Karte** mit `bg-secondary-container border-[3px] border-inverse-surface ... hard-shadow btn-press hover:bg-secondary-fixed transition-colors flex items-center gap-2`. Nicht 7 schmale Pillen, sondern 1-2 grosse Stitch-Buttons.

## Loesungsansatz (mittlerer Vertical Slice)

**Vier route-scoped Hides + Eine Card-Styling-Aufwertung** — die Brettrand-Zugleiste geht von 7 sichtbaren Mini-Cards auf **3-4 sichtbare sinnvolle Cards**, alle im selben Stitch-Visual-Stil (3px forest-border, hard-shadow-sm, padding 0.5rem 0.8rem).

1. `.waldtanz-unterholzleiste` → **display: none** auf /game
   - Info "Eine spielbare Aktion auswaehlen" lebt bereits in der `.waldtanz-spielhilfe` (AktiverSpielerZugtafel + Spielerfuehrung). Auf / (Lobby) bleibt sie sichtbar, dort ist sie die Phase-Erklaerung.
2. `.waldtanz-partie-uhr` → **display: none** auf /game (sichtbar auf / Lobby)
   - "100 Karten bis Sieger-Party" lebt identisch in `.partiefortschritt`. Auf /game ueberfluessig.
3. `.partiefortschritt` → **display: none** auf /game (sichtbar auf / Lobby)
   - Partiefortschritt ist Lobby-Statistik, nicht Brettrand-Aktion.
4. `.ki-zug-buehne` bleibt sichtbar ABER wird nur gerendert wenn `kiZugProtokoll.length > 0 || aktiverSpieler.steuerung === 'KI'` (sonst "Keine Gegneraktion ausstehend" — leer).
5. **Card-Styling-Konsolidierung**: die verbleibenden 3 Cards (`.zugpfad`, `.waldtanz-spielhilfe`, `.zugkompass`) bekommen konsistente Stitch-Styling-Vorgaben via route-scoped CSS-Block: `border: 3px solid var(--st-color-border-strong)`, `border-radius: 1.15rem`, `box-shadow: 0 3px 0 var(--st-color-border-strong)`, `background: var(--st-color-surface-container-low)`, `padding: 0.4rem 0.7rem`. Konsistent mit M2r-Schlangenlichtung und M2v-End-Turn-Pille.

**Schraenken / Bedingungen:**
- (1-3) Bleiben auf / (Lobby) sichtbar, weil dort das Sonnige Nest die Brettrand-Info braucht
- (4) KiZugBuehne-Sichtbarkeit haengt von State ab, nicht von Route — die Hide-Bedingung ist Component-State, nicht CSS-Route-Scope
- (5) Card-Styling ist additiv — bestehende Child-Styles (z.B. `.zugpfad__kopf h4` Farbe) bleiben unveraendert
- KEINE Engine-Aenderung, KEINE JSX-Reorder, KEINE Layout-Shifts — nur CSS-Route-Scoped-Hides + Card-Container-Styling

## Pre-Implementation-Audit

| Test-Datei | Was wird geprueft | Was passiert mit M2w? |
|------------|-------------------|------------------------|
| `App.m1cf_waldtanz_unterholzleiste.test.tsx` | Unterholzleiste sichtbar | Basis-Regel unveraendert, route-scoped Hide ist additiv → **gruen** |
| `App.m5c_waldpfad_zugleiste.test.tsx` | Zugpfad hat Heading + Spieler-Liste | Card-Styling aendert nur den Container, nicht den Inhalt → **gruen** |
| `App.m5d_zugkompass.test.tsx` | Zugkompass-Status + Hauptaktion | Card-Styling aendert nur den Container → **gruen** |
| `App.m1cg_waldtanz_zugpfad_waldsteine.test.tsx` | Zugpfad-Waldsteine-Style | Waldsteine-Style bleibt → **gruen** |
| `App.m1dd_aktionsdock_im_spielbrett.test.tsx` | Aktionsdock-Grid-Layout | Grid-Layout unveraendert, nur Card-Container-Styling → **gruen** |
| `App.m1bo_waldtanz_zugtafel.test.tsx` / `App.m1bq_waldtanz_spielkamera.test.tsx` | Aktiver-Spieler-Zugtafel-Heading | Inhalt unveraendert → **gruen** |
| `App.m9_hand_erstbild.test.ts` | Hand-Position / Erstbild | Hand-Position unveraendert → **gruen** |
| `App.m1as_waldtanz_lichtung_layout.test.tsx` | Schlangenlichtung-Y-Position | Card-Styling konsolidiert die Zugseitenleiste-Cards, aendert NICHT die Schlangenlichtung → **gruen** |

**Erwarteter Net-Effect:** 5 RED-Tests gruen, 0 neue roten Tests, Brettrand-Zugleiste geht von 7 auf 3 sichtbare Cards.

## Akzeptanzkriterien

1. `App.css` deklariert 3 route-scoped `display: none`-Regeln mit Specificity 0,2,0
2. Auf /game:
   - `.waldtanz-unterholzleiste` hat `display: none` (computed style)
   - `.waldtanz-partie-uhr` hat `display: none` (computed style)
   - `.partiefortschritt` hat `display: none` (computed style)
   - Verbleibende Cards (`.zugpfad`, `.waldtanz-spielhilfe`, `.zugkompass`, ggf. `.ki-zug-buehne`) tragen die neuen konsistenten Stitch-Card-Styles (3px border, hard-shadow, surface-container-low bg)
3. KiZugBuehne-Sichtbarkeit: `kiZugProtokoll.length > 0 || aktiverSpieler.steuerung === 'KI'` (Component-State, nicht CSS)
4. Auf / (Lobby): alle 7 Cards bleiben sichtbar (route-scoped Hide greift nicht)
5. Pre-Existing-Tests (m1cf, m5c, m5d, m1cg, m1dd, m1bo, m1bq, m9, m1as) bleiben gruen
6. Live-Smoke auf Production: 1280x900 — Zugseitenleiste hat 3-4 sichtbare Cards (Zugpfad + Spielhilfe + Zugkompass + ggf. KiZug), keine der 3 hidden Cards rendert sichtbar
7. Card-Container-Styles sichtbar: 3px-Border, hard-shadow, abgerundete Ecken
8. Console/Page-Errors: 0

## Workflow (TDD)

1. Pre-Implementation-Audit (siehe oben) — Done in dieser Slice-Plan-Phase
2. RED-Tests schreiben: `src/App.m2w_zugseitenleiste_konsolidierung.test.tsx` mit 5 REDs (1 pro Akzeptanz + Smoke-Wiring)
3. CSS-Only-Implementation: 3 route-scoped display:none + Card-Container-Styles
4. KiZugBuehne-Conditional-Render in `src/components/KiZugBuehne.tsx` (return null wenn keine Gegneraktion)
5. Targeted-Run auf m2w + alle migrierten Tests
6. Pre-Existing-Isolation via `git stash -u && npm test -- --run && git stash pop`
7. Build + Lint + Typecheck
8. Live-Smoke post-deploy
9. release-status-MD + commit + push + deploy

## Risikoabschaetzung

- **Niedrig:** Wie M2r/M2s — reine CSS-only Additive-Hides + Component-Conditional-Render, keine Engine-Aenderung
- **Kein Layout-Budget-Shift:** die 3 hidden Cards nehmen zusammen ~330 px weg, die verbleibenden 4 Cards dehnen sich auf den freigewordenen Platz (1fr pro Card, kein Overflow)
- **Pre-Existing-Test-Migration:** keine, alle bestehenden Tests bleiben gruen (nur visuell weniger sichtbare Cards, Inhalt unveraendert)
- **Erwarteter Net-Effect:** +5 RED-Tests gruen, 0 neue roten Tests, Brettrand wird ruhiger und konsistenter
