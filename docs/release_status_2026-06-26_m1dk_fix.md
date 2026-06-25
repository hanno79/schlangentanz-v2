# M1dk-Fix — Phasen-Banner in Arenakopf integriert (Schlangenlichtung bleibt sichtbar)

> **Status:** Release-Fertig (cron-run 26.06.2026 00:50 lokal).
> **Typ:** Layout-Konsolidierungs-Fix auf M1dk (Brettschritt-Affordance, kein Engine-Touchpoint).
> **Vorgänger:** M1dk (ac76bbf) — Phasen-Banner eingefuehrt.
> **Nachfolger:** offen — naechster mittlerer Stitch-Board-Vertical (M1e Spieluhr belegt, M1f als Kandidat).

## Was sichtbar/strukturell besser wurde

Die M1dk-Erstauslieferung hat das Phasen-Banner als sichtbare Stitch-Pillen-Reihe
in den Arenastein eingefuehrt — primaerisch richtig, aber zu grosszuegig
dimensioniert: die Pillen waren 0.85 rem hoch, der Phasen-Nummer-Kreis
1.5 rem, der Box-Shadow 4 px und das Padding 0.4 rem 0.85 rem. In Kombination
mit dem Banner-Label-Span (`Spielzug`) und dem Banner-`min-height: 56px`
ist der Banner-Block auf ca. 70-80 px Hoehe gewachsen — der Arenastein-Cap
(clamp 28rem, 56vh, 34rem) hat das mit knapper Not aufgenommen, aber die
Schlangenlichtung wurde aus dem 900-px-Erstbild verdraengt.

Der M1dk-Fix packt das Banner **enger an den Arenakopf**:

- **Arenakopf-Titel in eigenem Wrapper:** `.waldtanz-arenastein__kopf-titel`
  umschliesst jetzt `<h4>` + `<p>`, damit das Banner im Arenakopf als
  zweiter Block sauber fliesst (Titel links, Pillen rechts).
- **Label-Span entfernt:** Der `Spielzug`-Label-Span wurde aus der Komponente
  entfernt — der Arenakopf-Titel `Leuchtender Waldstein` ist selbst die
  Ueberschrift, das Label war doppelt.
- **Pillen kompakter:** `padding: 0.18rem 0.55rem` (vorher 0.4rem 0.85rem),
  `font-size: clamp(0.62rem, 0.95vw, 0.74rem)` (vorher 0.7rem-0.85rem),
  `gap: 0.25rem` (vorher 0.45rem), `box-shadow: 0 3px 0` (vorher 4 px),
  `white-space: nowrap`, `flex: 0 0 auto`.
- **Phasen-Nummer-Kreis kleiner:** `1.15rem x 1.15rem` (vorher 1.5rem),
  `font-size: 0.72rem` (vorher 0.85rem).
- **Phasen-Status-Kreis kleiner:** `1rem x 1rem` (vorher 1.25rem).
- **Banner-Container kompakter:** `flex-wrap: nowrap` (vorher wrap),
  `gap: clamp(0.3rem, 0.7vw, 0.5rem)` (vorher 0.45rem-0.7rem),
  `padding: clamp(0.2rem, 0.5vw, 0.3rem) clamp(0.55rem, 1.1vw, 0.8rem)`
  (vorher 0.5rem 0.7rem), `border-radius: 999px` (vorher `var(--st-radius-lg)`),
  `background: rgba(255,255,255,0.78)` (vorher 0.7), `min-height: 0`
  (vorher 56 px), `justify-content: flex-end` (Pillen rechtsbuendig),
  `overflow: hidden`.
- **Banner-Layout angepasst:** Liste ist `nowrap` mit `overflow: hidden`,
  `min-width: 0`.
- **Arenastein-Cap angehoben:** `height: clamp(34rem, 64vh, 40rem)`
  (vorher 28rem/56vh/34rem), `max-height` analog.
- **Toter CSS-Code entfernt:** `.waldtanz-phasen-banner__label`-Regel und
  `.waldtanz-arenastein__kopf .waldtanz-phasen-banner__label { display: none }`
  wurden geloescht, weil das Label-Element nicht mehr gerendert wird.

Resultat: das Phasen-Banner bleibt **sichtbar als Stitch-Spielphasen-Reihe**
(4 Phasen-Pillen mit Status-Icon + Nummer + Label, aktiv-Pille pulst) und
die **Schlangenlichtung bleibt im 900-px-Erstbild sichtbar**. Der
Production-Smoke (`m1dk_waldtanz_phasen_banner_smoke.mjs`) erwartet weiterhin
4 Pillen + sichtbares Banner.

## TDD-Reflex

Der bestehende M1dk-Test M1dk:1 hat die Banner-`min-height: \\d+`-Regel
assertiert — das war eine **stale contract**, die nach dem Fix in
`not.toMatch(/min-height: [nonzero]/)` aktualisiert wurde (Banner hat jetzt
`min-height: 0` und gewinnt seine Hoehe aus Padding + Pillen-Intrinsic-Height).
Die anderen 8 M1dk-Tests bleiben unveraendert gruen.

## Code-Review

Code-Review: Kimi Code CLI v0.18.0 (k2p7) statt Codex CLI, weil Codex
aktuell `NOT_FUNCTIONAL` (stdin-Mode-Block; Probe 26.06.2026 00:31).

Kimi hat **keine Blocker** gefunden. Sieben Risiken geprueft:

1. **Cascade-Pitfall**: keine spaetere Regel ueberschreibt die kompakten Pillen-Werte.
2. **Arenastein-Cap**: `clamp(34rem, 64vh, 40rem)` steht nur einmal.
3. **Display:none**: tot - wurde mit dem Label-Element entfernt.
4. **__kopf-titel Wrapper**: keine Test-Descendant-Erwartung auf direktem Kind.
5. **Cascade-Collapse**: kein spaeterer Override drueckt Cap zurueck.
6. **Umlaut-Drift**: `'Aufgabenprüfung'` korrekt mit Umlaut.
7. **Stitch-Token-Konsistenz**: Aktiv/abgeschlossen nutzen `var(--st-color-primary-container)`;
   Basis/Wartend nutzen `rgba(255,255,255,...)` (kein Blocker, nicht 100% Token-gebunden).

Nicht-blockierender Hinweis: `rgba(255,255,255,...)` in Pillen-Basis koennte
auf `var(--st-color-surface)` umgestellt werden — bewusst zurueckgestellt, weil
die halbtransparente Variante einen sichtbaren Tiefeneffekt auf dem Arenastein
erzeugt, der mit dem Voll-Token nicht reproduzierbar war.

## Gates

- [x] Targeted: `npx vitest run src/App.m1dk_waldtanz_phasen_banner.test.tsx` → 9/9 gruen.
- [x] Full: `npm test -- --run` → **344 Testfiles, 1149 Tests bestanden**.
- [x] `npm run check:test-lines` → Alle Testdateien unter 500 Zeilen.
- [x] `npm run typecheck` → bestanden.
- [x] `npm run lint` → bestanden.
- [x] `npm run build` → bestanden (dist/index-BmqlQ351.css 211 KB, index-CQSoZ0Tp.js 407 KB).
- [ ] Production-Smoke → nach Deploy zu pruefen.

## Commits

- M1dk-Fix Commit (dieser Slice) — folgt nach Smoke.

## Naechster mittlerer Vertical

Optionen:
- **M1f Waldtanz-Spielkarten-Stil** (in M1-Suite): Spielkarten-Stil auf Stitch-Look
  (chunky 3 px border, hard-shadow, plus-jakarta body, Rubik headline).
- **M1g Sonderkarten-Boardziel** (R180 Farbenfusion-Boardziel war uncommitted
  Ankündigung; falls Engine-Rule R180 noch offen, jetzt in Engine-Slice heben).
- **M4 Regeln/Spielbuch im Stitch-Stil** (HTML code.html existiert in der
  Stitch-Referenz).

Strategie: **M1f Spielkarten-Stil** — bringt sichtbare Verbesserung der
gesamten Handkarten-Reihe (alle Kartenraeume gleichzeitig) und ist gross
genug fuer ein mittleres Vertical mit TDD + Review. Klein genug, um in
diesem Cron-Run noch committet zu werden.
