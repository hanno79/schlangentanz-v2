# Release-Status — M1bf Waldtanz-Nachziehstapel

## Scope

M1bf ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der Nachziehstapel erscheint jetzt in den board-nahen `Waldobjekte`-Flächen als physisches Deck mit Kartenrücken, Zähler, 3px-Dark-Forest-Rand, pill/chunky Form und Hard Shadow. Er steht bewusst vor Ablage, Zugspur und Aufgabentafel, damit das Material nicht mehr nur im Debug-/HUD-Text gesucht werden muss.

Keine Engine-Regeln, Aktionsenumeration oder Spielzuglogik wurden geändert.

## Warum mittlerer Vertical

Der Slice ist mehr als eine Mikro-A11y-/Copy-Änderung, weil ein dauerhaft sichtbares Spielmaterial-Objekt ins Brett wandert und die Waldobjekte-Hierarchie verändert. Er ist kein Big-Bang, weil er nur den Nachziehstapel als Präsentationsobjekt ergänzt; Ablage, Zugspur, Questtafel, Hand, Schlangen, Sonderkarten-Ziele und Engine-Pfade bleiben unverändert.

## Umsetzung

- Neue Komponente `src/components/WaldtanzNachziehstapel.tsx` rendert den live gespeisten Nachziehstapel als `Waldtanz-Nachziehstapel`.
- `src/App.tsx` platziert das Deck in `Waldobjekte` vor `Waldtanz-Ablage`, `Waldtanz-Zugspur` und `Waldtanz-Aufgabentafel`.
- `src/App.css` ergänzt den Stitch-Stil für Deck-Karte, Kartenrücken, 🍃-Dekor, Zählerchip, Radius und Hard Shadow.
- `scripts/live_smoke.mjs` prüft den Produktions-/Browser-Vertrag: Deckobjekt vorhanden, Reihenfolge `Nachziehstapel → Ablage → Zugspur → Aufgabentafel`, 3px-Ränder, Hard Shadow und Kartenrücken-Verhältnis.

## Verifikation

- RED: `npm test -- --run src/App.m1bf_waldtanz_nachziehstapel.test.tsx` schlug initial fehl, weil `Waldtanz-Nachziehstapel` und CSS-Vertrag fehlten.
- Targeted/Adjacent: `npm test -- --run src/App.m1bf_waldtanz_nachziehstapel.test.tsx src/App.m1i_waldtanz_ablage.test.tsx src/App.m1j_waldtanz_zugspur.test.tsx src/App.m1bd_waldtanz_lichtungsbrett.test.tsx` → 4 Testdateien / 8 Tests bestanden.
- Lokaler Browser-Smoke gegen Vite: `/` und `/game` HTTP 200; M1as/M1aw/M1ax/M1ay/M1bc/M1bd/M1bf/M1ba/M1bb-Verträge grün; `M1bf Nachziehstapel: Deckobjekt vor Ablage mit 3px-Rand und Hard Shadow sichtbar`.
- Full Gates: `npm test -- --run` → 271 Testdateien / 845 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, `node scripts/live_smoke.mjs --self-test` grün. Build-Artefakte: `dist/assets/index-BHvQh8PT.css`, `dist/assets/index-xNotMfso.js`.
- Claude Code / `/simplify`: beide Aufrufe mit `--model opusplan` waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus Diff-/Line-Budget-Simplify wurde genutzt.
- Codex Review/Re-Review: Initial keine Blocker; Non-Blocker zu vollständiger Waldobjekte-Reihenfolge, computed Smoke und semantischem Deck-Objekt wurden behoben. Re-Review: `BLOCKERS: None`, `NON-BLOCKERS: None`.

## Release

Der finale Stand wird per Commit/Push auf `main` und Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` ausgeliefert. Der Alias-Smoke `node scripts/live_smoke.mjs` bestätigt den M1bf-Vertrag; diese Datei hält bewusst den stabilen Alias statt ephemerer Deploy-URLs fest.

## Nächste mittlere Lücke

Als nächster sichtbarer M1-Vertical bietet sich ein weiterer Spielmaterial-/Flow-Schritt an: den Nachziehstapel in der Endspurt-Nähe stärker mit `Partiefortschritt`/Sieger-Party zu verbinden oder eine board-nahe Aktion für das nächste konkrete Sonderkarten-/Zugziel auszubauen — weiterhin ohne Rückfall in reine A11y-Mikroslices.
