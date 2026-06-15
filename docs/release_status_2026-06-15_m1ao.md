# Release Status — M1ao Waldtanz-Fokusbrett

Datum: 15.06.2026  
Produktionsalias: https://schlangentanz-v2.vercel.app  
Feature-Commit: `b782910 — M1ao: Waldtanz-Fokusbrett kompakter machen`

## Scope

Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die `/game`-Bühne wird wieder zum kompakten Spielbrett statt zu einer langen Scrollseite. `Zugpfad`, `Gegnerzug`, `Zugkompass`, `Partiefortschritt` und `Waldtanz-Bonuszauber` liegen gemeinsam in einer board-nahen `Zugleiste`; Spielerrahmen, Arenastein, Zugleiste und Waldobjekte sind route-spezifisch scroll-gebunden. Die Handkarten bleiben direkt nach Arena/Zugleiste und erscheinen im 1280×900-Live-Smoke am unteren Viewport-Rand.

## Bewusst nicht geändert

- Keine Engine-/Regeländerungen.
- Keine neue Aktionslogik und kein Ersatz der Fallback-Aktionsliste.
- Keine Lobby-/Regelbuch-/Sieger-Party-Änderung.
- Kein A11y-Mikroslice: Semantik wurde nur dort angepasst, wo die neue sichtbare Zugleiste ein reales Brettobjekt ist.

## Verifikation

- RED/GREEN: `npm test -- --run src/App.m1ao_waldtanz_fokusbrett.test.tsx`.
- Adjacent: `npm test -- --run src/App.m1ao_waldtanz_fokusbrett.test.tsx src/App.m1ae_waldtanz_erstbild.test.tsx src/App.m5c_waldpfad_zugleiste.test.tsx src/App.m5d_zugkompass.test.tsx src/App.m5e_partiefortschritt.test.tsx src/App.m5g_ki_zugbuehne_brettnah.test.tsx src/App.m2i_verdoppler_bonuszauber.test.tsx` → 7 Testdateien / 11 Tests bestanden.
- Full Gates: `npm test -- --run` → 248 Testdateien / 797 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Claude Code / `/simplify`: `claude --model opusplan` und `/simplify` waren weiterhin durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback mit Codex-Review wurde genutzt.
- Codex Review: initiale Blocker zu Zugleiste-Source-Order und geerbten Grid-Regeln wurden behoben; Re-Review: `BLOCKERS: None`.
- Production Smoke auf stabilem Alias: `/` und `/game` HTTP 200, keine Console-/Page-Errors. `/game` bei 1280×900: Spielerrahmen `overflowY: auto`, Arenastein `height: 489`, `overflowY: auto`, Zugleiste `height: 432`, `overflowY: auto`, Handkarten `y: 891` und damit am unteren Viewport-Rand sichtbar; `Zugpfad → Gegnerzug → Zugkompass → Partiefortschritt` folgen in Source- und visueller Reihenfolge; erster Handkarten-Klick selektiert eine Karte ohne Browserfehler.

## Nächste mittlere Lücke

Die Bühne ist kompakter, aber die Arena nutzt wegen der vielen vorhandenen Brettobjekte jetzt mehrere sinnvolle Scrollflächen. Der nächste spielwertige Slice sollte nicht wieder Layout-Capping sein, sondern eine konkrete Interaktion/Entscheidung im kompakten Brett verbessern — z.B. board-nahe Sonderkarten-/Questziel-Ausführung oder eine echte Mehrzug-Playability-Strecke durch das nun fokussierte `/game`-Layout.
