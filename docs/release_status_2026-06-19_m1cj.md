# Release-Status — 19.06.2026 — M1cj Waldtanz-Startfährten

## Status

Released auf der stabilen Production-Alias: <https://schlangentanz-v2.vercel.app>

## Slice

M1cj ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical im Milestone `M1 Waldtanz Game Board`: Die im ersten Zug sichtbaren Startfährten im Startkreis sind nicht mehr nur dekorative Textplättchen, sondern eigenständige, fokussierbare Brettobjekt-Buttons. Jede Startfährte startet genau die passende Handkarte als neue Schlange.

## Warum kein Mikro-Slice und kein Big-Bang

- Kein A11y-/IDREF-Mikro-Slice: Die Änderung betrifft die reale Spielerhandlung im ersten Zug.
- Kein Big-Bang: Engine-Regeln, Drag-and-drop, Handkarten-Auswahl, Aktionsfallback und andere Brettobjekte bleiben unverändert.
- Sichtbarer Spielwert: Der Startkreis fühlt sich stärker wie ein Brettspiel-Objekt an; die Entscheidung `welche Karte beginnt meine Schlange?` liegt direkt auf der Waldlichtung.

## Technische Änderung

- `SchlangenStartzone` rendert den Startkreis als native Hauptfläche und die Startfährten als separate native Buttons in der `Startfährten im Startkreis`-Liste.
- `Schlangenbereich` übergibt pro Startfährte die konkrete Engine-Aktion, sodass die gewählte Fährte nicht mehr implizit auf die erste Startaktion zurückfällt.
- CSS macht die Startfährten zu kleinen chunky Pill-/Plättchen-Objekten mit 3px-Waldgrün-Rand, Hard Shadow, Fokuszustand und kompakter `/game`-Geometrie.
- `scripts/m1cj_startfaehrten_smoke.mjs` ist in `npm run smoke:production` verdrahtet und prüft Browser-Hit-Testing sowie Tastatur-Aktivierung per Enter.

## Verifikation

- RED/GREEN: `src/App.m1cj_waldtanz_startfaehrten.test.tsx` schützt fünf sichtbare Startfährten, separate Button-Semantik ohne verschachtelte Buttons, direkte Ausführung von `blau-09`, Kartenpop-Feedback und Smoke-Wiring.
- Stale-Nachbarschaftstests wurden angepasst: `M1be`, `M1bt`, `M1ch`, `M1d`.
- Targeted/Adjacent: `npm test -- --run src/App.m1cj_waldtanz_startfaehrten.test.tsx src/App.m1be_waldtanz_startfaehrten.test.tsx src/App.m1bt_waldtanz_startlichtung.test.tsx src/App.m1ch_waldtanz_erstzugpfad.test.tsx src/App.m1n_drag_vorschau.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx src/App.f36_drag_drop_timeout_reset.test.tsx src/App.r158_startzone_idref.test.tsx src/App.r109_schlangenbereich_dom_sichere_idrefs.test.tsx` → 9 Testdateien / 30 Tests bestanden.
- Full Gates: `npm test -- --run` → 300 Testdateien / 907 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Lokaler Browser-Smoke gegen Vite Preview: `/` und `/game` HTTP 200; `R107 Production-Smoke bestanden`; `M1cj Startfaehrten: 5 Startwege hit-testbar, blau-09 startet direkt die gewaehlte Schlange.`
- Codex Review: initiale Blocker zu Button-Verschachtelung/Stale-CSS-Test wurden behoben; finales Re-Review: `BLOCKERS: None`, `NON-BLOCKERS: None`.
- Production Deploy/Smoke: Feature-Commit `1b5b2fb — M1cj: Startfaehrten direkt spielbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias deployed (`READY`). Production-Smoke bestätigt `/` und `/game` HTTP 200, bestehende Waldtanz-Verträge M1bw–M1ci und neu `M1cj Startfaehrten: 5 Startwege hit-testbar, blau-09 startet direkt die gewaehlte Schlange.` ohne Console-/Page-Errors.

## Nächste mittlere Lücke

Weiter im M1-Boardgefühl: Die Startfährten sind jetzt direkt spielbar; als nächster sinnvoller sichtbarer Vertical bietet sich ein weiterer erster-Zug-/Brettentscheidungs-Slice an, der Zielauswahl und physische Brettreaktion noch stärker verbindet, ohne neue Engine-Regeln zu bauen.
