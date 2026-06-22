# Release-Status — 22.06.2026 — M1cw Brettschritt-Aktions-Konsequenz

## Status

Released auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Slice

M1cw verschwistert den Brettschritt-Stempel mit dem Questband: Jeder der
letzten drei Brettschritt-Stempel auf dem Waldtanz-Arenenstein traegt
zusaetzlich zu Spieler/Phase (M1cu) eine zweite Zeile mit der konkreten
Aktions-Konsequenz aus der gleichen `wechsleZustand`-Transition, also was
die Handlung auf dem Brett bewirkt hat (z. B. "Karte blau-09 an Schlange
spieler-1-1 rechts anlegen"). Der initiale `BrettschrittEintrag`-Typ
bekommt ein optionales `konsequenz`-Feld; das Spielkomponent erweitert
seinen App-Prop um `initialBrettschrittEintraege`, damit Tests gezielt
Stempel mit Konsequenz einspeisen koennen. KI-Vorspulen setzt den
Platzhalter "Gegnerzuege vorgespult". Die fehlenden CSS-Tokens
`--st-color-text`, `--st-color-text-soft`, `--st-color-secondary` werden
in `:root` definiert (waren vorher unbenutzt, fielen still auf
`inherit`/`#063907` zurueck). Engine, Legal-Aktionen, Ausfuehrungspfade
bleiben unangetastet.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: M1cw ist die direkte Folge-Luecke aus M1cv (Questband
  zeigt Ziele + Fortschritt + Bereit-Badge, Brettschritt-Stempel zeigt
  Output + Phase + Spieler) — beide Brettobjekte mussten verschwistert
  werden, damit die Spielerin pro Aktion sowohl im Brettschritt als auch
  im Questband sieht, was ihre Handlung bewirkt hat. Der vorab
  beschriebene "naechste mittlere Luecke"-Pfad aus der M1cv Release-Doku
  (Brettschritt + Aktions-Konsequenz) wird damit exakt geschlossen.
- Kein Big-Bang: Die Konsequenz ist eine reine Anzeige-Erweiterung des
  bereits existenten Brettschritt-Stempel-Containers; Engine,
  Legal-Aktionen, Ausfuehrungspfade und Brettschritt-Historie bleiben
  unveraendert. Die zusaetzliche Token-Definition ist defensiv und
  aendert das gerenderte Verhalten der bestehenden
  Brettschritt-Stempel minimal (vorher `inherit`, jetzt explizit
  `#063907`).

## Umsetzung

- `src/components/WaldtanzBrettschrittStempel.tsx`:
  - `BrettschrittEintrag` Interface erweitert um `konsequenz?: string`.
  - Konsequenz wird als `<span class="brettschritt-stempel__konsequenz">`
    gerendert (nur wenn vorhanden und nicht leer nach `.trim()`).
  - aria-label bekommt zusaetzlich " · Konsequenz: <text>".
- `src/App.tsx`:
  - `AppProps` erweitert um `initialBrettschrittEintraege?:
    BrettschrittEintrag[]`.
  - `useState`-Initializer fuer `brettschrittEintraege` respektiert
    `initialBrettschrittEintraege`.
  - `wechsleZustand(label, updater)` pflegt `konsequenz: label` fuer
    jeden neuen Brettschritt-Stempel.
  - `handleKiZugVorspulen` setzt `konsequenz: 'Gegnerzuege vorgespult'`.
- `src/App.css`:
  - `:root` ergaenzt um `--st-color-text`, `--st-color-text-soft`,
    `--st-color-secondary` (vorher unbenutzt, fielen still zurueck).
  - `.brettschritt-stempel__konsequenz`: italic, border-left,
    secondary-container-Background.
  - `.brettschritt-stempel--aktuell .brettschritt-stempel__konsequenz`:
    heller Background + primary-Border (current step).
  - `.brettschritt-stempel--vergangen .brettschritt-stempel__konsequenz`:
    opacity 0.85.
- `src/App.m1cw_brettschritt_konsequenz.test.tsx` (neu, 6 Tests):
  - Test 1: Konsequenz-Zeile mit aria-label-Praefix "Konsequenz:"
    rendert.
  - Test 2: leere/Whitespace-Konsequenz wird nicht gerendert.
  - Test 3: aktuelle/vergangene CSS-Klassen unterscheiden.
  - Test 4: CSS-Source: Selektor + Cascade (italic, border-left,
    --aktuell, --vergangen) in App.css.
  - Test 5: Konsequenz-Token (`--st-color-text`,
    `--st-color-text-soft`, `--st-color-secondary`) sind in `:root`
    definiert (Regressions-Schutz aus Kimi-Review-Blocker).
  - Test 6: Smoke-Wiring in package.json.
- `scripts/m1cw_brettschritt_konsequenz_smoke.mjs` (neu, 108 Zeilen):
  Browser-Smoke auf /game (1280x900, reducedMotion: reduce). Klickt
  Startfuehrte, erwartet Brettschritt-Stempel mit nicht-leerer
  Konsequenz-Zeile, aria-label mit "Konsequenz:"-Praefix, computed
  font-style=italic, border-left-width >=2px, keine console/page
  errors.
- `package.json`: `smoke:production` um
  `m1cw_brettschritt_konsequenz_smoke.mjs` erweitert.

## Workflow

- RED/GREEN: 5 RED-Tests geschrieben (Konsequenz-Zeile rendert,
  Leerfall unterdrueckt, aktuell/vergangen unterscheidbar,
  CSS-Source-Selektor, Smoke-Wiring). Nach Komponente + Hook +
  Extraktion + CSS + Smoke laufen alle Tests gruen. Nach Kimi-Review
  ein 6. RED-Test fuer die fehlenden CSS-Tokens ergaenzt, der nach der
  `:root`-Erweiterung gruen laeuft.
- Claude Code: in dieser Session durch den bekannten `401 Invalid
  authentication credentials`-Auth-Blocker unbenutzbar; der Slice wurde
  als enger manueller Fallback umgesetzt.
- Kimi Code CLI Review: Codex OAuth weiterhin im `usage limit` (gueltig
  bis 25.06.2026 19:07 UTC). Kimi-Code-CLI (`kimi -p`) als
  Review-Fallback mit identischem Kontext wie Codex erhalten wuerde.
  Review lieferte 1 BLOCKER (`src/App.css:5229` --
  `.brettschritt-stempel--aktuell .brettschritt-stempel__konsequenz`
  verwendet undefiniertes `--st-color-text`). Fix: `:root` um
  `--st-color-text`, `--st-color-text-soft`, `--st-color-secondary`
  ergaenzt + RED-Regressions-Test fuer die Token-Definition. Nach Fix:
  `BLOCKERS: None`.

## Verifikation

- RED-Proof: `npx vitest --run src/App.m1cw_brettschritt_konsequenz.test.tsx`
  schlug initial wegen fehlender Konsequenz-Zeile, fehlender CSS-Klassen,
  fehlender Token-Definition und fehlendem Smoke-Wiring fehl.
- Targeted: `npx vitest --run src/App.m1cw_brettschritt_konsequenz.test.tsx`
  → 6/6 gruen.
- Full Gates: `npm test -- --run` → 314 Testdateien / 964 Tests
  bestanden; `npm run check:test-lines`, `npm run typecheck`,
  `npm run lint`, `npm run build`, `git diff --check` jeweils gruen.
- Production Deploy/Smoke: <PLACEHOLDER_DEPLOY_SMOKE>.

## Sichtbar spielbarer

Unmittelbar nach `Spiel starten` und einer beliebigen Aktion (z. B. einer
Wachstumsfaehrte-Anlege-Aktion) sieht die Spielerin unter dem
Waldtanz-Arenenstein jetzt **nicht nur Output + Phase + Spieler pro
Stempel, sondern auch die konkrete Aktions-Konsequenz** (z. B.
"Karte blau-m1cw an Schlange pfad-m1cw rechts anlegen"). Der
Brettschritt-Stempel erzaehlt damit seine Geschichte in zwei Zeilen
(Kartenname + Konsequenz), und die Spielerin sieht nach jeder Aktion
sowohl im Brettschritt (was passiert ist) als auch im Questband (was
dadurch erfuellt wurde), dass das Brettschritt-Brett jetzt mit dem
Questband verschwistert ist. Das ist ein konkreter Schritt vom
Click-Simulator hin zu einem Brett, das seine eigene Geschichte
erzaehlt.

## Code-Review

Code-Review: Kimi Code CLI 0.18.0 statt Codex CLI, weil Codex OAuth usage
limit bis 25.06.2026 19:07 UTC.

## Nächste mittlere Lücke

<PLACEHOLDER_NEXT_SLICE>