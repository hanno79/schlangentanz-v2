# Release-Status — M1ay Waldtanz-Waldkulisse

## Status

Released auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Scope

Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die fokussierte `/game`-Route bekommt eine sonnige Waldlichtung als Kulisse hinter dem bereits spielbaren Brett: Sky-Blue-Verlauf, helle Sonnen-/Blattflächen, Baumkronen-Deko oben und Waldboden-Struktur unten. Die Kulisse ist rein dekorativ und `pointer-events: none`, während Handkarten und Brettziele klickbar bleiben.

Nicht geändert: Engine-Regeln, Aktionsenumeration, Drag-and-drop-Pfade, Brettziel-Buttons, Lobby, Schlangenbuch, Sieger-Party und Debug-/Statusbereiche.

## Workflow-Evidence

- RED: `src/App.m1ay_waldtanz_waldkulisse.test.tsx` fiel initial fehl, weil die `/game`-Waldkulisse, klicksichere Pseudo-Elemente und der M1ay-Smoke-Vertrag fehlten.
- Claude Code / `/simplify`: `claude --model opusplan` und separate `/simplify`-Vorprüfung waren durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Diff-Simplify-Prüfung wurde genutzt und anschließend durch Codex reviewt.
- Codex Review/Re-Review: Initial keine Blocker; zwei Non-Blocker zur Teststärke und Radius-Brittleness wurden behoben. Finales Re-Review: `BLOCKERS: None`, `NON-BLOCKERS: None`.
- Targeted/Adjacent: `npm test -- --run src/App.m1ay_waldtanz_waldkulisse.test.tsx src/App.m1ax_waldtanz_freie_lichtung.test.tsx src/App.m1aw_waldtanz_handkante.test.tsx src/App.m1as_waldtanz_erstzug_lichtung.test.tsx` → 4 Testdateien / 5 Tests bestanden; `node scripts/live_smoke.mjs --self-test` bestanden.
- Full Gates: `npm test -- --run` → 258 Testdateien / 815 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Commit/Push/Deploy/Smoke: Feature-Commit `fd633eb — M1ay: Waldtanz-Waldkulisse zeigen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias bereitgestellt (`READY`). Production-Smoke bestätigt `/` und `/game` HTTP 200, Kernregionen, M1as/M1aw/M1ax-Geometrie, `M1ay Waldkulisse: sonniger Waldhintergrund sichtbar, Dekoration klicksicher` und keine Console-/Page-Errors.

## Sichtbarer Spielwert

Der `/game`-Screen wirkt weniger wie eine technische App-Fläche und stärker wie ein modernes Browser-Spielbrett in einer sonnigen Waldlichtung. Die bestehende Waldstein-Arena, Handkante und Zielkreise sitzen jetzt sichtbar in einer zusammenhängenden Google-Stitch-Kulisse, ohne neue Klickflächen oder Interaktionsrisiken einzuführen.

## Nächste mittlere Lücke

Als nächster spielwertiger Vertical bietet sich an, die erste Handkarte-zu-Startkreis-Interaktion noch körperlicher zu machen: klarere Drop-/Hover-Flächen direkt auf der Lichtung oder ein kleines Startkreis-Snap-Feedback, ohne die Engine-Pfade oder Fallback-Aktionen zu ersetzen.
