# Release-Status — M1ax Waldtanz-Freie Lichtung

## Status

Released auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Scope

Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die `/game`-Schlangenlichtung bleibt trotz board-naher Handkante besser lesbar und direkter spielbar. Der Startkreis/eigene Schlangenbereich steht jetzt im Schlangenbereich vor Zielspur/Zielkompass, die Handkante ist auf `/game` kompakter, und der Production-Smoke prüft den freien Lichtungsbereich sowie Startkreis-Hit-Testing.

Nicht geändert: Engine-Regeln, Aktionsenumeration, Drag-and-drop-Pfade, Zielspur-/Zielkompass-Funktion, Lobby, Regeln und Sieger-Party.

## Workflow-Evidence

- RED: `src/App.m1ax_waldtanz_freie_lichtung.test.tsx` fiel initial fehl, weil Handkante/Startkreis-Layout und M1ax-Smoke-Vertrag fehlten.
- Claude Code / `/simplify`: `claude --model opusplan` und separate `/simplify`-Vorprüfung waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Diff-Simplify-Prüfung wurde genutzt und anschließend durch Codex reviewt.
- Codex Review: Review-only auf dem uncommitted Worktree inklusive untracked M1ax-Test; `BLOCKERS: None`.
- Targeted/Adjacent: `npm test -- --run src/App.m1ax_waldtanz_freie_lichtung.test.tsx src/App.m1aw_waldtanz_handkante.test.tsx src/App.m1h_waldtanz_zielkompass.test.tsx src/App.m1z_waldtanz_zielspur.test.tsx` → 4 Testdateien / 8 Tests bestanden.
- Local Browser-Smoke: `SMOKE_BASE_URL=http://127.0.0.1:5173 node scripts/live_smoke.mjs` → `/` und `/game` HTTP 200; M1as/M1aw/M1ax-Geometrie bestanden; keine Console-/Page-Errors.
- Full Gates: `npm test -- --run` → 257 Testdateien / 814 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Commit/Push/Deploy/Smoke: Feature-Commit `bf82bcd — M1ax: Waldtanz-Lichtung freier spielen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias bereitgestellt (`READY`). Production-Smoke bestätigt `/` und `/game` HTTP 200, Kernregionen, `M1ax Freie Lichtung: 84px Schlangenlichtung frei, Karte bei 741px/150px` und keine Console-/Page-Errors.

## Sichtbarer Spielwert

Der erste Spielbrettblick wirkt weniger wie ein von der Hand zugedeckter Kontrollschirm: Startkreis/eigene Schlangen erscheinen im Schlangenbereich vor den Hilfs-/Zielkompassflächen, die Handkarten sind niedriger und kompakter, bleiben aber echte klickbare Spielkarten am Waldsteinrand.

## Nächste mittlere Lücke

Als nächster spielwertiger Vertical bietet sich an, die sichtbaren Schlangen-/Startplätze weiter zu echten board-lokalen Drop-/Zielobjekten auszubauen, sodass die erste Aktion noch stärker über Brettflächen statt über Fallback-Buttons geführt wird.
