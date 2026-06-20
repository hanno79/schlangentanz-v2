# Release-Status — 20.06.2026 — M1cn Waldtanz-Zauberpfad

## Status

Released auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Slice

M1cn ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical im Milestone `M1 Waldtanz Game Board`: Nach Auswahl einer Sonderkarte zeigt die board-nahe `Waldtanz-Zielspur` jetzt konkrete `Zauberpfade am Brett` für Farbenfusion, Schlangenfrass, Farbendieb, Farbenschutz und Blockade-Ziele. Die bestehenden physischen Brettobjekte wie Rankenring, Bissspur und Beutekorb bleiben die ausführenden Aktionsflächen.

## Warum weder Mikro-Slice noch Big-Bang

- Kein Mikro-Slice: Der Slice verbessert eine echte Spielerentscheidung — Sonderkarten führen nun sichtbar von der Handkarte zu einem konkreten Brett-/Zauberobjekt, statt nur über abstrakte Zielzahlen oder die Fallback-Aktionsliste verständlich zu sein.
- Kein Big-Bang: Engine-Regeln, Legal-Actions, Drag-and-drop, Lobby, Regelbuch, Ergebnisansicht und die bestehenden Brettobjekt-Komponenten bleiben unverändert. Die UI fasst bereits enumerierte Engine-Aktionen nur als sichtbare Zauberpfad-Summaries zusammen.

## Umsetzung

- `src/components/waldtanzZielspurLogik.ts`: ergänzt `ZielspurObjekt` und leitet konkrete Zauberpfad-Summaries aus vorhandenen legalen Sonderkarten-Aktionen ab; `Farbendieb` wird pro Beutekarte dedupliziert und zeigt die Anzahl möglicher Einfügeplätze.
- `src/components/WaldtanzZielspur.tsx`: rendert neben den bestehenden `Spielbare Brettwege` eine neue Liste `Konkrete Zauberpfade` mit Typ, Ziel, Ort und Hilfe.
- `src/components/Schlangenbereich.tsx`: übergibt die neuen Zauberpfad-Objekte an die Zielspur; Aktionsausführung bleibt bei Rankenring/Bissspur/Beutekorb und Engine-Pfad.
- `src/App.css`: route-scoped Google-Stitch-Stil für Zauberpfade sowie Smoke-Blocker-Fix, damit der Spieltisch beim ausgewählten Zielpfad vor späteren HUD-Panels hit-testbar bleibt.
- `src/App.m1cn_waldtanz_zauberpfad.test.tsx`: schützt Farbenfusion-Rankenring, Schlangenfrass-Bissspur, Farbendieb-Beutekorb-Dedup, CSS-/Stacking-Vertrag und Smoke-Wiring.
- `scripts/m1cn_zauberpfad_smoke.mjs` + `package.json`: neuer dauerhafter Browser-Smoke in `npm run smoke:production`.

## Workflow

- RED/GREEN: Der neue M1cn-Test wurde als sichtbarer Zielspur-/Zauberpfad-Vertrag angelegt und gegen fehlende `Konkrete Zauberpfade` grün gemacht.
- Claude Code / `/simplify`: `claude --model opusplan` blieb durch `401 Invalid authentication credentials` blockiert; deshalb enger manueller Fallback mit objektiver Diff-/Cascade-/Line-Budget-Prüfung, lokalen Browser-Smokes und Codex-Review.
- Codex Review: Initiales Review auf dem uncommitted Worktree inklusive untracked Test-/Smoke-Dateien: `BLOCKERS: None`.
- Smoke-Blocker-Fix: Der erste Production-Smoke fand eine echte Hit-Test-Überlagerung durch das `Wertung`-HUD. Der Fix hebt den `/game`-`spieltisch-gruppe`-Stack route-scoped vor HUD-Panels; Codex-Re-Review bestätigte `BLOCKERS: None`.

## Verifikation

- Targeted/Adjacent vor Review: `npm test -- --run src/App.m1cn_waldtanz_zauberpfad.test.tsx src/App.m1cm_waldtanz_zielwahl_faehrten.test.tsx src/App.m2m_schlangenfrass_bissspur.test.tsx` → 3 Testdateien / 10 Tests bestanden.
- Smoke-Blocker-Fix targeted: `npm test -- --run src/App.m1cn_waldtanz_zauberpfad.test.tsx src/App.m1bl_waldtanz_buehnenrahmen.test.tsx` → 2 Testdateien / 6 Tests bestanden.
- Full Gates final nach Smoke-Fix: `npm test -- --run` → 304 Testdateien / 919 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Lokaler Browser-Smoke nach Fix: `SMOKE_BASE_URL=http://127.0.0.1:4183 node scripts/m1cn_zauberpfad_smoke.mjs` → `M1cn Zauberpfad: Bissspurblau-06Eigene LichtungKarte lösen.`
- Production Deploy/Smoke: finaler Feature-HEAD wurde per Vercel Production auf die stabile Alias bereitgestellt. `npm run smoke:production` bestätigt `/` und `/game` HTTP 200, keine Console-/Page-Errors, bestehende Waldtanz-Verträge M1bw–M1cm und neu `M1cn Zauberpfad: Bissspurblau-06Eigene LichtungKarte lösen.`

## Sichtbar spielbarer

Sonderkarten lesen sich jetzt als zusammenhängender Zugpfad: Handkarte auswählen → Zauberpfad in der Zielspur sehen → physisches Brettobjekt ausführen. Das reduziert das Buttonlisten-Gefühl weiter, ohne die Engine-Autorität oder vorhandene Interaktionen zu ersetzen.

## Nächste mittlere Lücke

Als nächster sichtbarer Vertical bietet sich M1co/M2-Nachzug an: die Zauberpfad-Summaries enger mit den physischen Sonderkarten-Objekten verbinden, sodass die Zielspur nicht nur erklärt, sondern noch stärker auf das ausführbare Brettobjekt fokussiert — weiterhin ohne neues Regelmodell oder Drag-and-drop-Big-Bang.
