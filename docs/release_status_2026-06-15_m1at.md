# Release Status — M1at Waldtanz-Arenazugknopf

Datum: 15.06.2026  
Produktionsalias: https://schlangentanz-v2.vercel.app  
Feature-Commit: `ed7391b — M1at: Waldtanz-Arenazugknopf platzieren`

## Scope

Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Der wichtigste Phasen-/End-Turn-Fortschritt liegt auf `/game` jetzt als prominente `Waldtanz-Zugaktion` direkt an der Hand-/Brettkante. `Zugkompass`, `AktionenPanel` und Questkarte-Fortschritt bleiben sichtbar, besitzen auf `/game` aber nicht mehr denselben primären Phasenknopf. KI-Züge laufen weiter über die board-nahe `Gegnerzug`-Bühne.

Nicht enthalten: keine Engine-Regeländerung, keine neue Sonderkartenlogik, kein Drag-and-drop-Umbau, keine Lobby-/Regelbuch-/Sieger-Party-Änderung.

## Verifikation

- RED/GREEN: `src/App.m1at_waldtanz_arenazugknopf.test.tsx` deckt board-nahe Arena-Zugaktion nach echter Kartenaktion, KI-Bühnen-Progression, den Aufgabenprüfungs-Single-Owner-Fall und den Stitch-CSS-Vertrag ab. Der Codex-Blocker zu doppeltem Questkarten-Fortschritt auf `/game` wurde test-first behoben; `src/App.m1t_questkarte_einsammeln.test.tsx` bewahrt den direkten Questbutton außerhalb der fokussierten Game-Route.
- Claude Code / `/simplify`: `claude --model opusplan` war durch `401 Invalid authentication credentials` blockiert; enger manueller Fallback plus manuelle Simplify-Prüfung wurde genutzt.
- Codex Review/Re-Review: initialer Blocker zu doppelten primären Fortschrittsknöpfen wurde behoben. Re-Review: `BLOCKERS: None`; Prior blocker resolved.
- Targeted/Adjacent: `npm test -- --run src/App.m1at_waldtanz_arenazugknopf.test.tsx src/App.m1t_questkarte_einsammeln.test.tsx src/App.m1ap_aktionsfallback_untergeordnet.test.tsx src/App.m5g_ki_zugbuehne_brettnah.test.tsx` → 4 Testdateien / 9 Tests bestanden.
- Full Gates: `npm test -- --run` → 253 Testdateien / 809 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün. Build-Artefakte: `dist/assets/index-DQE0CtEu.css`, `dist/assets/index-CSOR-HrM.js`.
- Feature-Deploy: Vercel Production auf stabilem Alias `https://schlangentanz-v2.vercel.app` (`READY`).
- Production Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` → `/` und `/game` HTTP 200, Kernregionen sichtbar, M1as Layout weiterhin grün.
- M1at-Browser-Smoke auf Alias: `/` und `/game` HTTP 200; echte empfohlene Aktion `Neue Schlange starten mit Karte braun-04`; `Waldtanz-Zugaktion` nach Aktion sichtbar mit `Weiter zur Aufgabenprüfung`, computed `borderTopWidth: 3px`, `borderRadius: 999px`, Sunny-Gold `rgb(254, 203, 0)`, Hard Shadow `0px 6px`, anschließend `Weiter zum Zugabschluss`; keine Console-/Page-Errors.

## Nächste mittlere Lücke

Als nächster sichtbarer Stitch-Vertical bietet sich an, die `Waldtanz-Zugaktion`/Handkante im ersten Viewport noch enger mit der Handbühne zu verzahnen oder die nächste M2-Boardziel-Lücke bei Sonderkarten-Zielauswahl zu wählen — aber nicht als weitere A11y-/IDREF-Mikroslice.
