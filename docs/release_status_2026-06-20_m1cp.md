# Release-Status — 20.06.2026 — M1cp Waldtanz-Gegner-Zauberpfad-Sprungfährten

## Status

Releasebereit lokal verifiziert; finale Production-Alias bleibt <https://schlangentanz-v2.vercel.app>. Nach Commit/Push wird derselbe HEAD per Vercel Production auf diese stabile Alias deployt und erneut gesmoked.

## Slice

M1cp ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical im Milestone `M1 Waldtanz Game Board`: Die bereits sichtbaren `Konkrete Zauberpfade` springen jetzt auch zu gegnerischen Brettobjekten — `Farbendieb-Beutekorb` und `Schlangenblockade-Fessel` — statt nur bei eigenen Schlangenfrass-Zielen. Engine-Regeln, Legal-Actions, Ausführungspfade, Handkarten, Gegnerzüge und Aktionsfallback bleiben unverändert.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Der Slice macht eine echte Sonderkarten-Entscheidung spielbarer. Nach einem Gegnerzug kann die Spielerin einen Farbendieb-Zauberpfad aus der Zielspur heraus auf den physischen Beutekorb fokussieren, statt das Ziel in der Gegnerliste suchen zu müssen.
- Kein Big-Bang: Es wird kein neues Interaktionsmodell eingeführt. Bestehende Beutekorb-/Fessel-Buttons führen weiterhin die Engine-Aktion aus; die Zielspur erhält nur Sprung-/Highlight-/Fokus-Verdrahtung für bereits enumerierte Aktionen.

## Umsetzung

- `src/components/waldtanzZielspurLogik.ts`: markiert `Farbendieb`-Beutekörbe und `Schlangenblockade`-Fesseln als `sprungMoeglich`.
- `src/components/GegnerSchlangenListe.tsx`: reicht den aktiven Zielspur-Key zu gegnerischen Brettobjekten und erzeugt dieselben Schlüssel wie die Zielspur (`dieb:<spieler>:<schlange>:<karte>`, `blockade:<spieler>:<schlange>`).
- `src/components/FarbendiebBeutekorb.tsx` und `src/components/SchlangenblockadeFessel.tsx`: tragen `data-zielspur-key` und die aktive Highlight-Klasse, ohne Buttonnamen oder Aktionshandler zu ändern.
- `src/components/Schlangenbereich.tsx`: koppelt die Zielspur-Auswahl an die Gegnerliste.
- `src/App.css`: ergänzt route-scoped Stitch-Highlight-Cascade für Beutekorb/Fessel.
- `src/App.m1cp_waldtanz_gegner_zauberpfad_sprung.test.tsx`: schützt Beutekorb- und Fessel-Sprung, Fokus auf die jeweilige Aktion und Smoke-Wiring.
- `scripts/m1cp_gegner_zauberpfad_sprung_smoke.mjs` + `package.json`: verdrahtet einen dauerhaften Produktions-Smoke in `npm run smoke:production`, der einen echten Startfährte → Zugende → KI-Gegnerzug → Farbendieb → Beutekorb-Sprung-Flow ausführt.

## Workflow

- RED/GREEN: Der neue M1cp-Test fiel initial wegen fehlender Gegner-Sprungverdrahtung fehl und wurde anschließend minimal grün gemacht.
- Claude Code / `/simplify`: `claude --model opusplan` und die separate `/simplify`-Vorprüfung blieben durch `401 Invalid authentication credentials` blockiert; der Slice wurde als enger manueller Fallback mit objektivem RED-Test, manueller Diff-/Cascade-/Smoke-Prüfung und Codex-Review umgesetzt.
- Codex Review/Re-Review: Initialer Blocker war ein unehrlich nicht erreichbarer Smoke-Seed (`0.999999`). Der Smoke wurde auf Seed `0.2` plus echten Zugfluss umgestellt. Finales Re-Review: `BLOCKERS: None`.

## Verifikation

- Targeted/Adjacent: `npm test -- --run src/App.m1cp_waldtanz_gegner_zauberpfad_sprung.test.tsx src/App.m1co_waldtanz_zauberpfad_sprung.test.tsx src/App.m2k_farbendieb_beutekorb.test.tsx src/App.m2c_schlangenblockade_boardziel.test.tsx` → 4 Testdateien / 10 Tests bestanden.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:5173 node scripts/m1cp_gegner_zauberpfad_sprung_smoke.mjs` → `M1cp Gegner-Zauberpfad-Sprung: dieb:spieler-2:schlange-spieler-2-1:gelb-15, Fokus=true.`
- Full Gates: `npm test -- --run` → 306 Testdateien / 925 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Production Deploy/Smoke: nach Commit/Push wird der finale `origin/main`-HEAD per Vercel Production deployed und `npm run smoke:production` auf der stabilen Alias ausgeführt.

## Sichtbar spielbarer

Die Zielspur ist jetzt nicht mehr nur eine Beschreibung von Gegnerzielen: Der Beutekorb/Fessel-Pfad kann den echten Gegner-Brettgegenstand aktivieren, dessen Action-Button fokussieren und beide Oberflächen sichtbar zusammengehörig markieren. Damit fühlt sich Farbendieb/Blockade stärker wie ein Brettzug an und weniger wie eine Suche in einer Buttonliste.

## Nächste mittlere Lücke

Der nächste spielwertige Vertical sollte die Gegner-Zauberobjekte räumlich kompakter/hit-testbarer in die Waldtanz-Lichtung einpassen: Nach dem Sprung sind Beutekorb/Fessel zwar fokussiert und aktiv markiert, aber die gegnerische Zielzone kann in längeren Zuständen noch unter der Kamerakante liegen. Eine Folge-Slice sollte daher Gegner-Zauberpfade und Gegnerfeld-Geometrie zusammenbringen, ohne Drag-and-drop oder Engine-Regeln zu ändern.
