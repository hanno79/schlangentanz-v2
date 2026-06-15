# Release Status — 15.06.2026 — M1u Waldtanz-Startkreis

## Slice
M1u ist ein mittlerer sichtbarer Google-Stitch/Waldtanz-Vertical innerhalb `M1 Waldtanz Game Board`: Die bisher generische Startzone zum Beginnen einer neuen Schlange wird als board-naher Magic-Circle-`Startkreis` mit leuchtendem Startplatz, Kartenplakette und chunky Startkreis-Button ins Waldtanz-Brett integriert.

## Warum kein Mikro-Slice und kein Big-Bang
- Kein Mikro-Slice: Die Änderung verbessert eine zentrale erste Brettaktion sichtbar und spielbar, statt nur ARIA-/Copy-Attribute zu polieren.
- Kein Big-Bang: Engine-Regeln, Drag-and-drop-Auflösung, Sonderkarten-Ziele, Aktionsdock, Lobby, Regeln und Ergebnisansicht bleiben unverändert.
- Der Slice sitzt genau zwischen M1t-Questtafel und weiteren Board-Interaktionen: ein konkretes Brettobjekt wird greifbarer.

## Umsetzung
- `src/components/Schlangenbereich.tsx`: Startzone erhält dauerhaft `schlangen-startzone--magiekreis`, sichtbare Badge `Startkreis`, `Leuchtender Startplatz`, Zustandschip `Bereit: <karte>` und klare Drop/Klick-Copy.
- Startaktionen heißen zugänglich `Startkreis mit Karte <id>` und rendern als `In den Startkreis`-Button mit sichtbarer Karten-ID.
- `src/App.css`: Magic-Circle-Radialfläche, 3px Dark-Forest-Border, Pill-Kreis, Hard Shadow, Badge-/Kartenchips und spezifische Zielbereit-Kaskade für den Startkreis.
- Bestehende F36/R53/M5a/R178-Regressionen wurden auf die neue öffentliche Startkreis-Sprache aktualisiert.

## Verification lokal
- RED: `npm test -- --run src/App.m1u_waldtanz_startkreis.test.tsx` fiel initial erwartungsgemäß fehl; nach Codex-Fund fiel der CSS-Kaskadenvertrag noch einmal rot und wurde korrigiert.
- Claude Code / `/simplify`: `claude --model opusplan` war weiterhin durch Auth-Fehler blockiert; enger manueller Fallback wurde genutzt und offengelegt.
- Codex Review/Re-Review: final `BLOCKERS: Keine`; stale Assertions auf `Schlangenbereich-Start mit Karte`, `Startaktionen für ...` und den alten Hint wurden ausgeschlossen.
- Targeted: `npm test -- --run src/App.m1u_waldtanz_startkreis.test.tsx src/App.r178_board_zielmarkierungen.test.tsx src/App.m1n_drag_vorschau.test.tsx src/App.f36_drag_drop_schlange.test.tsx src/App.f36_drag_drop_schlange_status.test.tsx src/App.f36_drag_drop_timeout_reset.test.tsx src/App.m1m_waldtanz_anlegeplaetze.test.tsx src/App.m5a_board_targets_dock_clearance.test.tsx src/App.r53.test.tsx` → 9 Dateien / 38 Tests bestanden.
- Full Gates: `npm test -- --run` → 228 Dateien / 749 Tests bestanden; `npm run check:test-lines`, `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` grün.

## Release
- Feature-Commit: `251cf88 — M1u: Waldtanz-Startkreis sichtbar machen`.
- Production-Smoke-Blocker: Der erste Alias-Smoke fand live, dass der Startkreis-Button durch die generische `.schlangekarte__anlegebutton`-Kaskade computed nur `2px` Border hatte. Fix-Commit: `1385ac4 — M1u: Startkreis-Button-Kaskade absichern`.
- Finaler Production-Deploy: Vercel Production auf stabilem Alias `https://schlangentanz-v2.vercel.app` (`READY`).
- Finaler Smoke: `npm run smoke:production -- --url https://schlangentanz-v2.vercel.app` grün mit `/` und `/game` HTTP 200; M1u-Browser-Smoke bestätigt `schlangen-startzone--magiekreis`, `schlangen-startzone--leer`, `schlangen-startzone--zielbereit`, sichtbare Copy `Startkreis`, `Leuchtender Startplatz`, `Bereit: ...`, `Karte loslassen oder klicken...`, Buttonklasse `schlangen-startkreis-button`, computed `buttonBorderTopWidth: 3px`, Hard Shadow, erfolgreiche Aktion `Neue Schlange starten` und keine Console-/Page-Errors.

## Nächste mittlere Lücke
Weiter in M1/M2: das Startkreis-Gefühl ist jetzt klarer; als nächstes sollte eine weitere Board-Interaktion oder die Schlangen-/Startkreis-Drop-Erfahrung vertieft werden, nicht wieder eine reine A11y-/IDREF-Mikroserie.
