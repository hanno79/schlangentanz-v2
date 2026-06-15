# Release-Status — 15.06.2026 M1ac Waldtanz-Arenastein

## Status

Release complete auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Slice

M1ac ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical im `M1 Waldtanz Game Board`: Die zentralen Brettobjekte `Waldtanz-Ablage`, `Waldtanz-Zugspur`, `Waldtanz-Kartenpop`, `Waldtanz-Aufgabentafel` und `Schlangenbereich` liegen jetzt gemeinsam auf einem greifbaren `Waldtanz-Arenastein` mit Waldstein-Copy, Magiekreis-Hinweis, 4px Dark-Forest-Border, radialem Waldlichtungs-Hintergrund und Hard Shadow.

Nicht geändert: Engine-Regeln, Aktionsausführung, Bonuszauber, Handkartenfächer, Fallback-Aktionsdock, Lobby, Schlangenbuch und Sieger-Party.

## Verifikation

- RED: `npm test -- --run src/App.m1ac_waldtanz_arenastein.test.tsx` fiel vor GREEN wegen fehlender Region/CSS/Copy erwartungsgemäß fehl.
- Targeted: `npm test -- --run src/App.m1ac_waldtanz_arenastein.test.tsx src/App.m1a_waldtanz_arena_layout.test.tsx src/App.m1x_aktionsdock_fallback_unter_brett.test.tsx src/App.m1z_waldtanz_zielspur.test.tsx src/App.m1aa_zielkarte_vorschau.test.tsx src/App.m2h_reaktionsschild.test.tsx` → 6 Testdateien / 12 Tests bestanden.
- Full Gates: `npm test -- --run` → 236 Testdateien / 768 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Codex Review/Re-Review: `BLOCKERS: None`; Test-Cleanup erledigt.
- Production Deploy: Vercel `READY`, stable alias https://schlangentanz-v2.vercel.app.
- Generic Production-Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` → `/` und `/game` HTTP 200, Kernregionen sichtbar.
- M1ac Browser-Smoke: `/` und `/game` HTTP 200; `Waldtanz-Arenastein` sichtbar; Ablage/Zugspur/Aufgabentafel/Schlangenbereich im Arenastein; Handkarten nach dem Arenastein; computed `borderTopWidth: 4px`, Radius `72px`, radial-gradient-Hintergrund, Hard Shadow; keine Console-/Page-Errors.

## Commits

- `a3d4882 — M1ac: Waldtanz-Arenastein bündeln`

## Nächste mittlere Lücke

Weiterhin Google-Stitch-Spielwert statt Mikro-A11y: Nach dem Arenastein sollte der nächste Slice die Breite/Höhe der zentralen Arena spielbarer machen, z.B. ein kompakteres zweispaltiges Arenastein-Layout auf Desktop oder ein weiterer board-naher Sonderkarten-/Zielentscheid, der echte Entscheidungen am Brett statt in der Fallback-Liste sichtbar macht.
