# Release-Status 2026-06-15 — M1w Waldtanz-Spielrahmen-HUD

## Status

Release vollständig auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Slice

M1w ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Das bisher statische Seitenmenü wird zum live gespeisten Spielrahmen-HUD. Es zeigt Profil, Punkte, Phase, Handkarten, eigene Schlangen, Nachziehstapel, offene Quests und nächsten Pflichtschritt direkt neben dem Brett.

Nicht geändert: Engine-Regeln, Aktionsausführung, Brettinteraktionen, Lobby, Regeln, Sieger-Party, Aktionsdock und KI-Fluss.

## Umsetzung

- `src/components/WaldtanzSeitenmenue.tsx` nimmt echte Partiewerte entgegen und rendert `Spielprofil` plus `Waldtanz-Kompass`.
- `src/App.tsx` speist das Seitenmenü aus aktuellem Zustand, Wertung und Pflichtschritt.
- `src/App.css` ergänzt eine chunky Stitch-HUD-Kachel mit 3px Dark-Forest-Border, großem Radius und Hard Shadow.
- `src/App.m1w_waldtanz_spielrahmen_hud.test.tsx` beweist live gespeiste Werte, erhaltene statische Seitenrahmen-Semantik ohne Links/Buttons und CSS-Vertrag.

## Verifikation

- RED: `npm test -- --run src/App.m1w_waldtanz_spielrahmen_hud.test.tsx` fiel initial erwartungsgemäß fehl, weil `Waldtanz-Kompass` und CSS-Vertrag fehlten.
- Claude Code / `/simplify`: `claude --model opusplan` war weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und dokumentiert.
- Codex Review: Review-only auf dem uncommitted Diff inklusive untracked Testdatei; `BLOCKERS: None`.
- Targeted: `npm test -- --run src/App.m1w_waldtanz_spielrahmen_hud.test.tsx src/App.m1f_waldtanz_seitenmenue.test.tsx src/App.m1v_waldtanz_gegnerfaecher.test.tsx` → 3 Testdateien / 5 Tests bestanden.
- Full Gates: `npm test -- --run` → 230 Testdateien / 753 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Feature-Commit: `ec361dc — M1w: Waldtanz-Spielrahmen live speisen`, nach `origin/main` gepusht.
- Production Deploy: Vercel Production auf stabile Alias `https://schlangentanz-v2.vercel.app` → `READY`.
- Production Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` bestätigt `/` und `/game` HTTP 200 sowie Kernregionen ohne Console-/Page-Errors.
- M1w-Browser-Smoke: bestätigt `Waldtanz-Spielrahmen` und `Waldtanz-Kompass` auf `/game`, Live-Profil `Spieler 1 · 0 Punkte`, Statkarten `Phase: Ausspielphase`, `Handkarten: 5`, `Eigene Schlangen: 0`, `Nachziehstapel: 100`, `Offene Quests: 3`, `Nächster Schritt: Eine spielbare Aktion auswählen.`, computed `borderTopWidth: 3px`, Radius `36px`, Hard Shadow und keine Console-/Page-Errors.

## Nächste mittlere Lücke

Als nächster mittlerer Waldtanz-Slice bietet sich an, die zentrale Arena weiter von Text-/Debugflächen zu befreien: z.B. Material-/Ablage-/Quest-Objekte stärker als zusammenhängende Tischobjekte ordnen oder einen weiteren board-nahen Sonderkarten-/Zielauswahl-Flow sichtbar machen, statt in A11y-Mikroslices zurückzufallen.
