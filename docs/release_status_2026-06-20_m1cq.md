# Release-Status — 20.06.2026 — M1cq Waldtanz-Gegner-Zauberfeld kompaktieren

## Status

Released auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Slice

M1cq ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical im Milestone `M1 Waldtanz Game Board`: Die bisher über die Gegner-Schlangenleiste verstreuten `Farbendieb-Beutekörbe`, `Schlangenblockade-Fesseln` und `Schlangenfrass-Bissspuren` werden in der Waldtanz-Lichtung zu einem kompakten `Gegner-Zauberfeld` zusammengefasst, das oberhalb der Handbank sitzt, in 1280×900 vollständig in den Viewport passt und denselben 3px-Waldgrün-Stitch-Stil wie die übrigen Brettobjekte trägt. Engine-Regeln, Legal-Aktionen, Ausführungspfade, Handkarten, Gegnerzüge und Aktionsfallback bleiben unverändert.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Der Slice ordnet drei sichtbare Sonderkarten-Zielorte (Beutekorb, Fessel, Bissspur) in **ein** gemeinsames Brett-Element um, statt jeden erneut einzeln anzufassen. Die Spielerin sieht nach einem Sonderkartenzug sofort, wo im Brett die gegnerischen Ziele sitzen, und kann aus der Waldtanz-Zielspur direkt hineinspringen (M1cp-Sprung bleibt erhalten).
- Kein Big-Bang: Es wird weder ein neues Interaktionsmodell noch eine zusätzliche Engine-Aktion eingeführt. Die bestehenden Beutekorb-/Fessel-/Bissspur-Buttons führen weiterhin die Engine-Aktion aus; nur ihr gemeinsamer Container und die zugehörige route-scoped Stitch-Cascade werden kompakt verdichtet.

## Umsetzung

- `src/components/Schlangenbereich.tsx`: rendert ein zusätzliches `schlangen-gruppe--gegnerzauberfeld` oberhalb der bestehenden `schlangen-gruppe--gegner`, das Beutekörbe, Fesseln und Bissspuren in einem gemeinsamen 3-Spalten-Grid mit fester Höhe bündelt.
- `src/components/GegnerSchlangenListe.tsx`: liefert eine separate `gegnerzauberfeldEintraege`-Liste (blockierte Schlangen + Karten mit Beute/Frass), ohne die reguläre `gegnerSchlangen`-Reihenfolge zu verändern.
- `src/App.css`: route-scoped Cascade für `.schlangen-gruppe--gegnerzauberfeld` mit 3px Waldgrün-Rand, Hard-Shadow, pillförmigem Container und Stitch-Padding; bleibt unter dem 900px-Viewport mit Beutekorb ≤ 240px Breite.
- `src/App.m1cq_gegnerzauberfeld.test.tsx`: schützt das neue Feld für Farbendieb, Blockade und Schlangenfrass in lokalen 2-/3-Spieler-Fixtures, route-sichere CSS-Klasse und dauerhafte Smoke-Wiring.
- `scripts/m1cq_gegnerzauberfeld_smoke.mjs` + `package.json`: neuer dauerhaft verdrahteter Browser-Smoke in `npm run smoke:production`, der einen echten Startfährte → Zugende → KI-Gegnerzug → Farbendieb → Beutekorb-Sprung-Flow ausführt und die Feld-Geometrie, Stitch-Border, Padding und Hit-Testbarkeit verifiziert.

## Workflow

- RED/GREEN: Der neue M1cq-Test fiel initial wegen fehlender `schlangen-gruppe--gegnerzauberfeld`-Verdrahtung fehl und wurde anschließend minimal grün gemacht. Anschließend wurden die `npm test -- --run`-Läufe auf 307/929 hochgezählt, ohne angrenzende Tests zu brechen.
- Claude Code / `/simplify`: `claude --model opusplan` und die separate `/simplify`-Vorprüfung blieben durch `401 Invalid authentication credentials` blockiert; der Slice wurde deshalb als enger manueller Fallback mit objektivem RED-Test, manueller Diff-/Cascade-/Line-Budget-Prüfung und Browser-Smoke umgesetzt.
- Codex/Kimi Review: Codex OAuth war noch im `usage limit` (gültig bis 25.06.2026 19:07 UTC). Kimi Code CLI wurde als Review-Fallback genutzt: review-only auf dem uncommitted Worktree inklusive untracked Test-/Smoke-Dateien. Finales Re-Review: `BLOCKERS: None`; Kimi bestätigte die enge CSS-Cascade nach M1bz/M1cb, die unveränderten Beutekorb-/Fessel-/Bissspur-Aktionspfade und die Geometrie-Grenze (Feld ≤ 190px, Korb ≤ 240px) gegen die 1280×900-Brettkamera.

## Verifikation

- RED-Proof: `npm test -- --run src/App.m1cq_gegnerzauberfeld.test.tsx` schlug initial wegen fehlender `.schlangen-gruppe--gegnerzauberfeld`-Klasse fehl.
- Targeted/Adjacent: `npm test -- --run src/App.m1cq_gegnerzauberfeld.test.tsx src/App.m1cp_waldtanz_gegner_zauberpfad_sprung.test.tsx src/App.m1co_waldtanz_zauberpfad_sprung.test.tsx src/App.m2k_farbendieb_beutekorb.test.tsx src/App.m2c_schlangenblockade_boardziel.test.tsx` → 5 Testdateien / 14 Tests bestanden.
- Full Gates: `npm test -- --run` → 307 Testdateien / 929 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Lokaler Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:4183 npm run smoke:production` grün; neu `M1cq Gegnerzauberfeld: <h>px hoch, Korb <w>px, hit-testbar=true.`
- Production Deploy/Smoke: Feature-Commit `6a16733 — M1cq Gegner-Zauberfeld kompaktieren` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias `https://schlangentanz-v2.vercel.app` bereitgestellt (`READY`). Production-Smoke `SMOKE_BASE_URL=https://schlangentanz-v2.vercel.app npm run smoke:production` bestätigt `/` und `/game` HTTP 200, `R107 Production-Smoke bestanden`, bestehende Waldtanz-Verträge M1bw–M1cp und neu `M1cq Gegnerzauberfeld: <h>px hoch, Korb <w>px, hit-testbar=true.`; keine Console-/Page-Errors.

## Sichtbar spielbarer

Sonderkarten-Ziele für gegnerische Schlangen sitzen jetzt in einem gemeinsamen, klar abgegrenzten Brettobjekt: Beutekorb, Fessel und Bissspur teilen sich das Stitch-Pill-Design, sind alle im ersten 900px-Spielbild sichtbar und lassen sich aus der Waldtanz-Zielspur (M1cp) weiterhin direkt anspringen. Die Gegnerliste verliert ihren Sonderkarten-Rauschen, wirkt wie eine ruhige Schlangentafel und macht das Brett lesbarer als Brett statt als Button-Suchspiel.

## Nächste mittlere Lücke

Als nächster sichtbarer Vertical bietet sich an, das jetzt kompakte Gegner-Zauberfeld stärker mit dem eigenen Schlangenbereich zu verzahnen: Nach M1cq sind Beutekorb/Fessel/Bissspur räumlich zusammengefasst, aber Brettobjekte und Handkartenwahl kommunizieren weiterhin nur über die Zielspur. Der nächste Spielwert-Schritt sollte eine sichtbare `Spielzug-Spur` (Zugkompass/Zugtafel) so eng an das Gegner-Zauberfeld koppeln, dass ein Sonderkarten-Spiel als zusammenhängender Brettschritt statt als isolierte Button-Kette erlebbar wird.
