# Release Status — 15.06.2026 — M1y Handkarten-Spielbarkeit

## Status

Release complete auf der stabilen Production-Alias: https://schlangentanz-v2.vercel.app

## Scope

Mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die board-nahe Handkartenleiste zeigt jetzt direkt auf jeder Handkarte, ob sie sofort am Brett spielbar ist, wie viele Brettziele sie hat, oder ob sie nur warten bzw. bei Pflicht-Abwurf abgelegt werden muss.

Nicht geändert: Engine-Regeln, Aktionsausführung, Drag-and-drop, Sonderkarten-Zielkomponenten, Lobby, Schlangenbuch, Sieger-Party und die Fallback-Aktionsliste.

## Umsetzung

- `src/components/HandkartenPanel.tsx` erhält `legaleAktionen` und markiert Karten mit `handkarte--spielbar`, `handkarte--wartet` oder `handkarte--pflichtabwurf`.
- Die sichtbare und zugängliche Kartenbenennung enthält `Spielbar jetzt`, `Brettziel/Brettziele`, `Wartet auf nächsten Schritt` oder `Muss abgeworfen werden / Abwurfpflicht`.
- `PflichtAbwurf` zählt nicht als boardnah spielbare Karte und bekommt kein `Brettziel`-Label.
- `src/App.css` ergänzt Stitch-artige 3px-/Hard-Shadow-Spielbarkeitsplaketten für Karten.
- `src/App.m1y_handkarten_spielbarkeit.test.tsx` deckt Playable-Badges, unique-card count, Pflicht-Abwurf-Trennung, A11y-Namen und CSS-Vertrag ab.

## Verifikation

- RED: `npm test -- --run src/App.m1y_handkarten_spielbarkeit.test.tsx` fiel initial wegen fehlender `handkarte--spielbar`-/CSS-Verträge; Review-Fix-RED fiel zusätzlich wegen fehlender Status-A11y-Namen und `PflichtAbwurf`-Fehlklassifizierung.
- Targeted: `npm test -- --run src/App.m1y_handkarten_spielbarkeit.test.tsx src/App.m1g_handkartenfaecher.test.tsx src/App.m1p_waldtanz_kartenvorschau.test.tsx src/App.r78_handkarten_auswahl.test.tsx src/App.m1n_drag_vorschau.test.tsx src/App.f36_drag_drop_schlange.test.tsx` → 6 Testdateien / 22 Tests bestanden.
- Codex Review/Re-Review: Initiale Blocker zu `PflichtAbwurf` als falschem `Brettziel` und fehlendem Status im `aria-label` wurden test-first behoben; finale Re-Review `BLOCKERS: None`.
- Full Gates: `npm test -- --run` → 232 Testdateien / 758 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.
- Deploy: Commit `38117cc — M1y: Handkarten-Spielbarkeit sichtbar machen` wurde nach `origin/main` gepusht und per Vercel Production auf die stabile Alias bereitgestellt (`READY`).
- Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` grün mit `/` und `/game` HTTP 200. M1y-Browser-Smoke bestätigt deterministisch `5 Karten sofort spielbar`, `blau-01 ... Spielbar jetzt 1 Brettziel`, `handkarte--spielbar`, 3px Border, Hard Shadow, nach Startkreis-Aktion `blau-03 ... Wartet auf nächsten Schritt`, `handkarte--wartet`, Opacity `0.72`, kein `Brettziel` im wartenden `aria-label`, keine Console-/Page-Errors.

## Nächste mittlere Lücke

Nach den Handkarten-Spielbarkeitsplaketten ist der nächste sinnvolle mittelgroße Spielwert-Slice ein weiterer Waldtanz-Board-Flow: entweder Sonderkarten-Zielhinweise noch stärker als board-nahe Entscheidungsführung bündeln oder Mehrzug-/Endgame-Playability mit realem Abschlussfluss gegen `docs/PLAYABILITY_GATE.md` vertiefen.
