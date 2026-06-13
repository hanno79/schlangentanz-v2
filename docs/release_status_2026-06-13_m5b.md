# Release Status — M5b Gegnerzüge vorspulen

Datum: 13.06.2026  
Production: https://schlangentanz-v2.vercel.app  
Feature-Commit: `a4f7cee — M5b: Gegnerzüge vorspulen`  
Smoke-Blocker-Fix: `013e641 — M5b: Aktionsdock-Klicks vor Board-Überlagerung schützen`

## Scope

Mittlerer Playability-Vertical nach Google-Stitch-M1/M5: KI-Gegner werden nicht mehr über einzelne Buttonlisten wie ein Click-Simulator bedient. Stattdessen fasst die UI mehrere KI-Züge sichtbar als `Gegnerzug` zusammen und bietet im KI-Turn den board-nahen Control `Gegnerzüge bis zu deinem Zug abspielen` an. Engine-Autorität, Reaktionsregeln, Lobby, Waldtanz-Brett, HUD und menschliche Board-Interaktionen bleiben erhalten.

## Warum mittlerer Slice

- Kein Mikro-Slice: Der Slice verändert den tatsächlichen Spielfluss über mehrere Züge und reduziert das Buttonlisten-Gefühl bei KI-Gegnern deutlich.
- Kein Big-Bang: Die Änderung bleibt auf KI-Zug-Vorspulen, Protokoll-Bühne und einen minimalen Smoke-Blocker-Fix im Aktionsdock-Stacking begrenzt; keine neue KI-Strategie, keine Regeländerung, keine Layout-Großmigration.

## Umsetzung

- `src/kiZug.ts`: spielt KI-Phasen über vorhandene Engine-Aktionen bis zum nächsten menschlichen Zug, Spielende oder einer menschlichen Reaktion; 80-Schritt-Sicherung verhindert Endlosschleifen.
- `src/components/KiZugBuehne.tsx`: macht den Gegnerzug als sichtbare Waldtanz-Bühne mit Protokoll spielerfassbar.
- `src/components/AktionenPanel.tsx`: zeigt bei KI ohne menschliche Reaktion nur den Vorspulbutton und einen Hinweis statt einzelner KI-Aktionsbuttons.
- `src/App.tsx`: blendet board-lokale KI-Einzelaktionen aus und hält die menschliche Board-Interaktion unverändert.
- `src/components/SpielstatusPanel.tsx`: Status-HUD aus `App.tsx` extrahiert, damit die Datei unter der 500-Zeilen-Grenze bleibt.
- `src/App.css` / `src/App.m5a_board_targets_dock_clearance.test.tsx`: nach Production-Smoke-Blocker bleibt der Dock-Container klickdurchlässig, Dock-Controls liegen aber mit `z-index: 4` über dem Brett (`z-index: 3`), damit sowohl Boardziele als auch Aktionsdock-Buttons erreichbar bleiben.

## Verifikation

- Claude Code / `/simplify`: `claude --model opusplan` und `/simplify` waren weiterhin wegen `401 Invalid authentication credentials` blockiert; enger manueller Fallback wurde genutzt und offengelegt.
- RED: `src/App.m5b_ki_zug_vorspulen.test.tsx` fiel initial wegen fehlendem Vorspulbutton/Gegnerzug-Protokoll; der Smoke-Blocker-Fix wurde test-first über `src/App.m5a_board_targets_dock_clearance.test.tsx` gehärtet (`z-index: 4` am Dock).
- Codex Review/Re-Review: initiale Blocker zu menschlichen Reaktionen, stale R53 und board-lokalen KI-Einzelbuttons wurden behoben; finaler Smoke-Blocker-Diff `BLOCKERS: None`.
- Targeted nach Smoke-Blocker-Fix: `npm test -- --run src/App.m5a_board_targets_dock_clearance.test.tsx src/App.m5b_ki_zug_vorspulen.test.tsx src/App.r182_farbenschutz_boardziel.test.tsx src/App.m1b_aktionsdock_layout.test.tsx` → 4 Testdateien / 5 Tests bestanden.
- Full Gates: `npm test -- --run` → 199 Testdateien / 698 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` jeweils grün.
- Local Preview Smoke nach Fix: `SMOKE_BASE_URL=http://127.0.0.1:4173 node tmp_m5b_final_smoke.mjs` → 3-KI-Pfad grün, keine Console-/Page-Errors.
- Production Deploy/Smoke: Feature-Commit `a4f7cee` wurde deployed; Smoke fand den echten Browser-Blocker `spielbrett--waldtanz` intercepts action-dock click. Fix-Commit `013e641` wurde gepusht, per Vercel Production deployed und auf der Alias gesmoked.
- Finaler Production-Smoke: `/` und `/game` HTTP 200; `npm run smoke:production` grün; Playwright bestätigt `Große Runde starten (3 KI)` → erster Menschenzug → `Gegnerzüge bis zu deinem Zug abspielen` → Rückkehr zu `Spieler 1`, Gegnerzug-Protokoll für Spieler 2/3/4, keine alten KI-Einzelbuttons, keine Console-/Page-Errors.

## Was spielbarer wurde

Die Partie fühlt sich weniger wie ein Debug-/Buttonlisten-Simulator an: Nach dem eigenen Zug werden KI-Gegner in einem sichtbaren Gegnerzug-Abschnitt zusammenhängend abgespielt, inklusive Protokoll und Rückkehr zum menschlichen Spieler. Gleichzeitig bleibt das Waldtanz-Brett primäre Interaktionsfläche und das Aktionsdock bleibt bedienbar, statt sich gegenseitig mit dem Board zu blockieren.

## Nächste mittlere Lücke

M5c/M6: Den jetzt verifizierten Mehrzug-Pfad weiter Richtung echte Endgame-Playability führen — entweder ein bounded Endspurt-/Spielende-Pfad mit Sieger-Party-Live-Smoke oder ein spielbarer Rundendurchlauf mit klaren Board-nahen Entscheidungen statt weiterem Container-/A11y-Mikropolish.
